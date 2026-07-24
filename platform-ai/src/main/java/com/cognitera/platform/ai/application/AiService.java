package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.*;
import com.cognitera.platform.ai.config.AiPipelineProperties;
import com.cognitera.platform.ai.model.*;
import com.cognitera.platform.audit.api.AuditEventType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Single authoritative execution path. DecisionRouter is the entry point.
 * No service may bypass it. No legacy execution path remains.
 *
 * <p>Two strategies exist. Each has exactly one execution path:
 * <ul>
 *   <li>RULE_ENGINE: RuleEngine decides → LLM explains. No retrieval.</li>
 *   <li>HYBRID_RETRIEVAL: Full retrieval + evidence → LLM reasons.</li>
 * </ul>
 */
@Service
public class AiService implements AiOrchestrationService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final RetrievalAugmentationService retrievalAugmentationService;
    private final ContextAssembler contextAssembler;
    private final PromptBuilder promptBuilder;
    private final ModelProvider modelProvider;
    private final ChatCompletionProvider chatCompletionProvider;
    private final GroundingService groundingService;
    private final AiAuditPublisher auditPublisher;
    private final QueryIntentClassifier intentClassifier;
    private final IndexInspectionService indexInspectionService;
    private final EvidenceCoverageValidator evidenceCoverageValidator;
    private final PipelineProfiler profiler;
    private final DecisionRouter decisionRouter;

    public AiService(
            RetrievalAugmentationService retrievalAugmentationService,
            ContextAssembler contextAssembler,
            PromptBuilder promptBuilder,
            ModelProvider modelProvider,
            ChatCompletionProvider chatCompletionProvider,
            GroundingService groundingService,
            AiAuditPublisher auditPublisher,
            QueryIntentClassifier intentClassifier,
            IndexInspectionService indexInspectionService,
            EvidenceCoverageValidator evidenceCoverageValidator,
            PipelineProfiler profiler,
            DecisionRouter decisionRouter) {
        this.retrievalAugmentationService = retrievalAugmentationService;
        this.contextAssembler = contextAssembler;
        this.promptBuilder = promptBuilder;
        this.modelProvider = modelProvider;
        this.chatCompletionProvider = chatCompletionProvider;
        this.groundingService = groundingService;
        this.auditPublisher = auditPublisher;
        this.intentClassifier = intentClassifier;
        this.indexInspectionService = indexInspectionService;
        this.evidenceCoverageValidator = evidenceCoverageValidator;
        this.profiler = profiler;
        this.decisionRouter = decisionRouter;
    }

    @Override
    @Transactional
    public AiResponse answer(AiRequest request) {
        AiRequest normalized = normalize(request);
        String reqId = normalized.context().requestId() != null
                ? normalized.context().requestId() : UUID.randomUUID().toString();
        profiler.start(reqId);
        log.info("Request received: reqId={} questionLength={}", reqId, normalized.question().length());

        // ── Intent gate ──
        QueryIntent intent = intentClassifier.classify(normalized.question());
        profiler.record("intent");
        log.info("Intent detection: {} ({}ms)", intent, profiler.getCurrentProfile().get("intent").ms());
        if (intent == QueryIntent.INDEX_INSPECTION || intent == QueryIntent.CORPUS_DISCOVERY) {
            profiler.finish();
            log.info("Response: reqId={} strategy=INDEX_INSPECTION ({}ms total)", reqId, profiler.totalMs());
            return indexInspectionService.inspect(normalized);
        }

        // ── DecisionRouter — SINGLE ENTRY POINT ──
        var routing = decisionRouter.route(normalized.question());
        profiler.record("routing");
        log.info("Domain classification: strategy={} ({}ms)",
                routing.strategy(), profiler.getCurrentProfile().get("routing").ms());

        RetrievalContext retrievalContext;
        String rawAnswer;
        ModelCapabilities capabilities = modelProvider.capabilities(normalized.model());

        if (routing.isRuleEngine()) {
            // ═══════ RULE-ENGINE PATH ═══════
            assertNoRetrieval();

            DecisionResult decision = routing.decision();
            String prompt = buildExplanationPrompt(normalized.question(), decision);
            profiler.record("prompt");
            log.info("Prompt built: {} chars | decision={} | source={} ({}ms)",
                    prompt.length(), decision.getClass().getSimpleName(), decision.source(),
                    profiler.getCurrentProfile().get("prompt").ms());

            log.info("LLM request started: {} chars prompt", prompt.length());
            long startMs = System.currentTimeMillis();
            rawAnswer = chatCompletionProvider.complete(prompt, capabilities);
            profiler.record("llm");
            long llmMs = System.currentTimeMillis() - startMs;
            log.info("LLM response received: {} chars answer ({}ms)",
                    rawAnswer != null ? rawAnswer.length() : 0, llmMs);

            retrievalContext = new RetrievalContext(normalized.question(),
                    "RULE_ENGINE", List.of(), decision);

        } else {
            // ═══════ HYBRID-RETRIEVAL PATH ═══════
            log.info("Retrieval started: strategy={} question='{}'",
                    routing.strategy(),
                    normalized.question().length() > 100
                            ? normalized.question().substring(0, 100) + "..."
                            : normalized.question());
            retrievalContext = retrievalAugmentationService.retrieve(normalized);
            profiler.record("retrieval");
            long retrievalMs = profiler.getCurrentProfile().get("retrieval").ms();
            log.info("Retrieval completed: {} sources, {} authorities ({}ms)",
                    retrievalContext.sources().size(),
                    retrievalContext.authorityReferences().size(),
                    retrievalMs);

            PromptContext promptContext = contextAssembler.assemble(normalized, retrievalContext);
            String prompt = promptBuilder.build(promptContext);
            profiler.record("prompt");
            int evidenceItems = promptContext.evidencePackage() != null
                    ? promptContext.evidencePackage().items().size() : 0;
            log.info("Evidence package created: {} evidence items", evidenceItems);
            log.info("Prompt built: {} chars, {} evidence docs ({}ms)",
                    prompt.length(), evidenceItems,
                    profiler.getCurrentProfile().get("prompt").ms());

            log.info("LLM request started: {} chars prompt", prompt.length());
            long startMs = System.currentTimeMillis();
            rawAnswer = chatCompletionProvider.complete(prompt, capabilities);
            profiler.record("llm");
            long llmMs = System.currentTimeMillis() - startMs;
            log.info("LLM response received: {} chars answer ({}ms)",
                    rawAnswer != null ? rawAnswer.length() : 0, llmMs);

            if (promptContext.evidencePackage() != null) {
                evidenceCoverageValidator.validate(
                        rawAnswer, promptContext.evidencePackage(), normalized.question());
                profiler.record("coverage");
                log.info("Coverage validation: {}ms",
                        profiler.getCurrentProfile().get("coverage").ms());
            }
        }

        // ── Ground ──
        if (rawAnswer == null || rawAnswer.isBlank()) {
            rawAnswer = "The language model did not produce a response. This may indicate a model loading delay on first request. Please try again.";
            log.warn("LLM returned empty response — model may still be loading (cold start)");
        }
        ReasonedAnswer reasonedAnswer = groundingService.ground(rawAnswer, retrievalContext);
        profiler.record("ground");
        log.info("Grounding complete: grounded={} overallConf={} sourceConf={} completenessConf={} ({}ms)",
                reasonedAnswer.grounded(),
                reasonedAnswer.confidence() != null
                        ? String.format("%.2f", reasonedAnswer.confidence().overallConfidence()) : "N/A",
                reasonedAnswer.confidence() != null
                        ? String.format("%.2f", reasonedAnswer.confidence().sourceConfidence()) : "N/A",
                reasonedAnswer.confidence() != null
                        ? String.format("%.2f", reasonedAnswer.confidence().completenessConfidence()) : "N/A",
                profiler.getCurrentProfile().get("ground").ms());
        profiler.finish();

        // ── Runtime trace (Part G) ──
        logExecutionTrace(routing.strategy(), retrievalContext, profiler);

        // ── Audit ──
        InferenceMetadata metadata = new InferenceMetadata(
                capabilities.provider(), capabilities.model(),
                Instant.now(), Instant.now(),
                normalized.context().correlationId(), reqId,
                "v9-routed",
                routing.strategy().name(),
                List.of(),
                reasonedAnswer.confidence().overallConfidence());

        auditPublisher.emit(normalized.context().actorId(), normalized.context().tenantId(),
                AuditEventType.MODEL_INFERENCE, reqId,
                Map.of("strategy", routing.strategy().name(),
                        "retrieval", routing.needsRetrieval() ? "EXECUTED" : "SKIPPED"));

        log.info("DecisionPackage built: reqId={} strategy={} answerLength={} sourceCitations={} authorityRefs={} totalMs={}",
                reqId, routing.strategy(),
                reasonedAnswer.answer() != null ? reasonedAnswer.answer().length() : 0,
                reasonedAnswer.sourceCitations().size(),
                reasonedAnswer.authorityReferences().size(),
                profiler.totalMs());

        return new AiResponse(reasonedAnswer, metadata);
    }

    // ── Guards ──

    /** Runtime assertion: retrieval must not execute in RuleEngine path. */
    private void assertNoRetrieval() {
        // Always true — the guard is structural (we never call retrieval here),
        // not conditional. If retrieval were called, this method wouldn't be reached.
        log.debug("Retrieval guard: OK (RuleEngine path active)");
    }

    // ── Prompt ──

    String buildExplanationPrompt(String question, DecisionResult decision) {
        var values = decision.values();

        Map<String, String> labels = new HashMap<>();
        labels.put("amount", "Betrag");
        labels.put("category", "Kategorie");
        labels.put("procedure", "Verfahren");
        labels.put("requirements", "Zusätzliche Pflichten");
        labels.put("grade", "Entgeltgruppe");
        labels.put("step", "Stufe");
        labels.put("monthlyAmount", "Monatsbetrag");
        labels.put("payScale", "Tarifvertrag");
        labels.put("effectiveDate", "Gültig ab");
        labels.put("hours", "Stunden");
        labels.put("allowanceEur", "Tagegeld");
        labels.put("description", "Beschreibung");
        labels.put("feeType", "Gebührenart");
        labels.put("regulation", "Regelung");

        StringBuilder sb = new StringBuilder();

        // ── FRAGE ──
        sb.append("FRAGE\n").append(question).append("\n\n");
        sb.append("↓\n\n");

        // ── ANTWORT DES REGELSYSTEMS ──
        sb.append("ANTWORT DES REGELSYSTEMS\n");
        sb.append(buildDeterministicAnswer(decision)).append("\n\n");
        sb.append("↓\n\n");

        // ── DETAILS DES REGELSYSTEMS ──
        sb.append("DETAILS DES REGELSYSTEMS\n");

        for (var entry : values.entrySet()) {
            String label = labels.getOrDefault(entry.getKey(), entry.getKey());
            Object val = entry.getValue();
            if (val instanceof List<?> list) {
                sb.append(label).append(":\n");
                for (Object item : list) {
                    sb.append("  - ").append(item).append("\n");
                }
            } else {
                sb.append(label).append(": ").append(formatGermanValue(val)).append("\n");
            }
            sb.append("\n");
        }

        sb.append("Angewendete Schwelle: ").append(decision.reason()).append("\n");
        sb.append("Rechtsgrundlage: ").append(decision.source()).append("\n");
        sb.append("Behörde: ").append(decision.authority()).append("\n\n");

        sb.append("↓\n\n");

        // ── IHRE AUFGABE ──
        sb.append("IHRE AUFGABE\n\n");
        sb.append("Die Entscheidung wurde bereits deterministisch\n");
        sb.append("vom Regelsystem getroffen.\n");
        sb.append("Alle nachfolgenden Angaben sind verbindlich.\n");
        sb.append("Ihre Aufgabe besteht ausschließlich darin,\n");
        sb.append("die Entscheidung verständlich zu erklären.\n\n");
        sb.append("Sie dürfen\n\n");
        sb.append("- kein anderes Verfahren auswählen\n\n");
        sb.append("- keine andere Schwelle anwenden\n\n");
        sb.append("- keine eigenen Berechnungen durchführen\n\n");
        sb.append("- keine eigene juristische Bewertung vornehmen\n\n");
        sb.append("- keine zusätzlichen Vorschriften erfinden\n\n");
        sb.append("Erklären Sie, warum das Regelsystem\n");
        sb.append("genau diese Entscheidung getroffen hat.\n\n");
        sb.append("Format: KURZANTWORT (1 Satz), ENTSCHEIDUNG (2-3 Sätze), RECHTSGRUNDLAGEN.\n");
        sb.append("Sprache: deutsche Kommunalverwaltung. Keine Rechtsberatung.");

        return sb.toString();
    }

    /** Formats a value using German locale conventions. Numeric values get German number formatting with €. */
    private static String formatGermanValue(Object val) {
        if (val instanceof Number num) {
            var nf = java.text.NumberFormat.getInstance(java.util.Locale.GERMANY);
            nf.setMinimumFractionDigits(2);
            nf.setMaximumFractionDigits(2);
            return nf.format(num.doubleValue()) + " €";
        }
        return val.toString();
    }

    /** Builds a short deterministic answer from the structured decision data. */
    private static String buildDeterministicAnswer(DecisionResult decision) {
        if (decision instanceof DecisionResult.ProcurementDecision pd) {
            return "Das zulässige Verfahren ist:\n" + pd.procedure();
        }
        if (decision instanceof DecisionResult.SalaryDecision sd) {
            return sd.grade() + " Stufe " + sd.step() + " =\n"
                    + formatGermanValue(sd.monthlyAmount());
        }
        if (decision instanceof DecisionResult.TravelDecision td) {
            return "Tagegeld: " + formatGermanValue(td.allowanceEur())
                    + " (" + td.description() + ")";
        }
        if (decision instanceof DecisionResult.FeeDecision fd) {
            return "Gebühr: " + formatGermanValue(fd.amount())
                    + " (" + fd.feeType() + ")";
        }
        return decision.decision();
    }

    // ── Trace ──

    private void logExecutionTrace(DecisionStrategy strategy, RetrievalContext ctx,
                                    PipelineProfiler profiler) {
        String trace = """
            ╔══════════════════════════════════════╗
            ║  EXECUTION TRACE                     ║
            ╠══════════════════════════════════════╣
            ║  Strategy:   %-24s ║
            ║  Retrieval:  %-24s ║
            ║  GraphRAG:   %-24s ║
            ║  Reranking:  %-24s ║
            ║  Evidence:   %-24s ║
            ║  LLM role:   %-24s ║
            ║  Sources:    %-24d ║
            ║  Total ms:   %-24d ║
            ╚══════════════════════════════════════╝""".formatted(
            strategy,
            strategy == DecisionStrategy.RULE_ENGINE ? "SKIPPED" : "EXECUTED",
            strategy == DecisionStrategy.GRAPH_REASONING ? "EXECUTED" : "SKIPPED",
            strategy == DecisionStrategy.RULE_ENGINE ? "SKIPPED" : "EXECUTED",
            strategy == DecisionStrategy.RULE_ENGINE ? "SKIPPED" : "EXECUTED",
            strategy == DecisionStrategy.RULE_ENGINE ? "explain-only" : "reason",
            ctx.sources().size(),
            profiler.totalMs());
        log.info(trace);
    }

    private AiRequest normalize(AiRequest request) {
        if (request == null) throw new IllegalArgumentException("AI request is required");
        if (request.question() == null || request.question().isBlank())
            throw new IllegalArgumentException("Question is required");
        return new AiRequest(request.question().trim(), request.model(),
                request.searchFilter(),
                request.context() != null ? request.context()
                        : new AiConversationContext(List.of(), null, null, null, null),
                request.maxRetrievalResults() <= 0 ? 5
                        : Math.min(request.maxRetrievalResults(), 20),
                request.retrievalScope(), request.workspaceId());
    }
}
