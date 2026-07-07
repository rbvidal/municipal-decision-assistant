package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.*;
import com.cognitera.platform.ai.config.AiPipelineProperties;
import com.cognitera.platform.ai.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Simplified AI orchestration: one question, one plan, one retrieval,
 * one LLM call.
 *
 * <p>Pipeline:
 * <ol>
 *   <li>Intent classification</li>
 *   <li>Retrieval plan (domain + strategy)</li>
 *   <li>Single hybrid retrieval (diversity-aware)</li>
 *   <li>Evidence package (grouped, deduplicated)</li>
 *   <li>RuleEngine — deterministic decisions where applicable</li>
 *   <li>Compact prompt</li>
 *   <li>Single LLM inference (explains only)</li>
 *   <li>Coverage validation (metric only)</li>
 * </ol>
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
    private final AiPipelineProperties props;
    private final RuleEngine ruleEngine;
    private final RetrievalPlanner retrievalPlanner;

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
            AiPipelineProperties props,
            RuleEngine ruleEngine,
            RetrievalPlanner retrievalPlanner) {
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
        this.props = props;
        this.ruleEngine = ruleEngine;
        this.retrievalPlanner = retrievalPlanner;
    }

    @Override
    @Transactional
    public AiResponse answer(AiRequest request) {
        AiRequest normalized = normalize(request);
        String reqId = normalized.context().requestId() != null
                ? normalized.context().requestId() : UUID.randomUUID().toString();
        profiler.start(reqId);

        // ── Intent ──
        QueryIntent intent = intentClassifier.classify(normalized.question());
        profiler.record("intent");
        if (intent == QueryIntent.INDEX_INSPECTION || intent == QueryIntent.CORPUS_DISCOVERY) {
            profiler.finish();
            return indexInspectionService.inspect(normalized);
        }

        // ── Domain ──
        RetrievalPlan.Domain domain = retrievalPlanner.classifyDomain(normalized.question());
        profiler.record("domain");

        // ── Single retrieval ──
        RetrievalContext retrievalContext = retrievalAugmentationService.retrieve(normalized);
        profiler.record("retrieval");
        log.info("Retrieved: {} sources, {} unique docs",
                retrievalContext.sources().size(),
                retrievalContext.sources().stream()
                        .map(SourceCitation::title).filter(Objects::nonNull).distinct().count());

        // ── RuleEngine: deterministic decision ──
        var ruleResult = evaluateRules(normalized.question(), retrievalContext);
        profiler.record("rule-engine");

        // ── Evidence + prompt ──
        PromptContext promptContext = contextAssembler.assemble(normalized, retrievalContext);
        String prompt = promptBuilder.build(promptContext);
        profiler.record("prompt");
        log.info("Prompt: {} chars | {} evidence docs | domain: {}",
                prompt.length(),
                promptContext.evidencePackage() != null
                        ? promptContext.evidencePackage().items().size() : 0,
                domain);

        // ── LLM ──
        ModelCapabilities capabilities = modelProvider.capabilities(normalized.model());
        Instant inferenceStart = Instant.now();
        String rawAnswer = chatCompletionProvider.complete(prompt, capabilities);
        profiler.record("llm");
        long inferenceMs = java.time.Duration.between(inferenceStart, Instant.now()).toMillis();
        log.info("LLM: {} ms", inferenceMs);

        // ── Coverage (metric only) ──
        if (promptContext.evidencePackage() != null) {
            var coverage = evidenceCoverageValidator.validate(
                    rawAnswer, promptContext.evidencePackage(), normalized.question());
            profiler.record("coverage");
            log.info("Coverage: passed={} | missingDocs={} | missingNums={}",
                    coverage.passed(), coverage.missingDocumentTitles(),
                    coverage.missingNumericValues());
        }

        // ── Ground ──
        ReasonedAnswer reasonedAnswer = groundingService.ground(rawAnswer, retrievalContext);
        profiler.record("ground");
        profiler.finish();

        // ── Retrieval diagnostics (Part G) ──
        logRetrievalDiagnostics(retrievalContext, domain);

        // ── Metadata ──
        InferenceMetadata metadata = new InferenceMetadata(
                capabilities.provider(), capabilities.model(),
                Instant.now(), Instant.now(),
                normalized.context().correlationId(), reqId,
                promptBuilder.templateVersion(),
                retrievalContext.retrievalStrategy(),
                retrievalContext.sources().stream().map(s -> s.chunkId().toString()).toList(),
                reasonedAnswer.confidence().overallConfidence());

        auditPublisher.emit(normalized.context().actorId(), normalized.context().tenantId(),
                "MODEL_INFERENCE", reqId,
                Map.of("provider", capabilities.provider(),
                        "model", capabilities.model(),
                        "domain", domain.name(),
                        "promptChars", Integer.toString(prompt.length()),
                        "inferenceMs", Long.toString(inferenceMs),
                        "uniqueDocs", Long.toString(retrievalContext.sources().stream()
                                .map(SourceCitation::title).filter(Objects::nonNull).distinct().count()),
                        "grounded", Boolean.toString(reasonedAnswer.grounded())));

        return new AiResponse(reasonedAnswer, metadata);
    }

    /**
     * Evaluates deterministic rules. If a rule fires, prepend its result
     * to the LLM answer so the UI can extract the deterministic decision.
     */
    private RuleEngine.RuleResult evaluateRules(String question, RetrievalContext ctx) {
        String lower = question.toLowerCase();

        // Procurement: extract amount and evaluate thresholds
        if (retrievalPlanner.classifyDomain(question) == RetrievalPlan.Domain.PROCUREMENT) {
            var amounts = extractAmounts(question);
            if (!amounts.isEmpty()) {
                double amount = amounts.getFirst();
                // Also check evidence for threshold context
                String evidenceContext = ctx.sources().stream()
                        .map(s -> s.excerpt() != null ? s.excerpt() : "")
                        .reduce("", (a, b) -> a + " " + b);
                return ruleEngine.evaluateProcurement(amount, evidenceContext + " " + question);
            }
        }

        // Travel: extract hours and evaluate allowance
        if (retrievalPlanner.classifyDomain(question) == RetrievalPlan.Domain.TRAVEL) {
            var hours = extractHours(question);
            if (hours.isPresent()) {
                return ruleEngine.evaluateTravelExpense(hours.get(), lower.contains("übernachtung"));
            }
        }

        return null; // no deterministic rule applies
    }

    private List<Double> extractAmounts(String text) {
        List<Double> amounts = new ArrayList<>();
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(
                "(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)\\s*(?:€|Euro|EUR)",
                java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
        while (m.find()) {
            try {
                amounts.add(Double.parseDouble(m.group(1).replace(".", "").replace(",", ".")));
            } catch (NumberFormatException ignored) {}
        }
        return amounts;
    }

    private Optional<Double> extractHours(String text) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(
                "(\\d+)[-\\s]*(?:stündig|stunden|Stunden|h|Std)",
                java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
        if (m.find()) return Optional.of(Double.parseDouble(m.group(1)));
        return Optional.empty();
    }

    /** Logs diversity diagnostics (Part G). */
    private void logRetrievalDiagnostics(RetrievalContext ctx, RetrievalPlan.Domain domain) {
        var titles = ctx.sources().stream()
                .map(s -> s.title() != null ? s.title() : "unknown")
                .toList();
        long unique = titles.stream().distinct().count();
        long total = titles.size();
        double dupRatio = total > 0 ? (double) (total - unique) / total * 100 : 0;
        var authorities = ctx.sources().stream()
                .map(s -> s.title())
                .filter(Objects::nonNull)
                .map(this::mapAuthority)
                .distinct().count();

        log.info("RETRIEVAL DIAGNOSTICS: {} unique regulations | {} total chunks | {:.0f}% duplicate | {} authorities | domain: {}",
                unique, total, dupRatio, authorities, domain);
    }

    private String mapAuthority(String title) {
        if (title == null) return "unknown";
        String t = title.toLowerCase();
        if (t.contains("bau") || t.contains("baugb") || t.contains("baunvo")) return "SenStadt";
        if (t.contains("vergab") || t.contains("beschaffung") || t.contains("gwb") || t.contains("vgv"))
            return "SenFin";
        if (t.contains("tv-l") || t.contains("urlaub") || t.contains("reisekosten"))
            return "SenInn";
        return "Land Berlin";
    }

    private AiRequest normalize(AiRequest request) {
        if (request == null) throw new IllegalArgumentException("AI request is required");
        if (request.question() == null || request.question().isBlank())
            throw new IllegalArgumentException("Question is required");
        AiConversationContext context = request.context() == null
                ? new AiConversationContext(List.of(), null, null, null, null)
                : request.context();
        return new AiRequest(request.question().trim(), request.model(),
                request.searchFilter(), context,
                request.maxRetrievalResults() <= 0 ? 5
                        : Math.min(request.maxRetrievalResults(), 20),
                request.retrievalScope(), request.workspaceId());
    }
}
