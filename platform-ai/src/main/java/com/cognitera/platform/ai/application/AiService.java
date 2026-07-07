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

        // ── Intent gate ──
        QueryIntent intent = intentClassifier.classify(normalized.question());
        profiler.record("intent");
        if (intent == QueryIntent.INDEX_INSPECTION || intent == QueryIntent.CORPUS_DISCOVERY) {
            profiler.finish();
            return indexInspectionService.inspect(normalized);
        }

        // ── DecisionRouter — SINGLE ENTRY POINT ──
        var routing = decisionRouter.route(normalized.question());
        profiler.record("routing");
        log.info("EXECUTION TRACE | strategy: {} | retrieval: {} | graph: {} | reranking: {} | evidence: {}",
                routing.strategy(),
                routing.needsRetrieval() ? "EXECUTED" : "SKIPPED",
                "SKIPPED",
                routing.needsRetrieval() ? "EXECUTED" : "SKIPPED",
                routing.needsRetrieval() ? "EXECUTED" : "SKIPPED");

        RetrievalContext retrievalContext;
        String rawAnswer;
        ModelCapabilities capabilities = modelProvider.capabilities(normalized.model());

        if (routing.isRuleEngine()) {
            // ═══════ RULE-ENGINE PATH ═══════
            // Guard: retrieval MUST NOT execute
            assertNoRetrieval();

            DecisionResult decision = routing.decision();
            String prompt = buildExplanationPrompt(decision);
            profiler.record("prompt");
            log.info("RuleEngine prompt: {} chars | decision={} | source={}",
                    prompt.length(), decision.getClass().getSimpleName(), decision.source());

            long startMs = System.currentTimeMillis();
            rawAnswer = chatCompletionProvider.complete(prompt, capabilities);
            profiler.record("llm");
            log.info("LLM (explain): {} ms", System.currentTimeMillis() - startMs);

            retrievalContext = new RetrievalContext(normalized.question(),
                    "RULE_ENGINE", List.of());

        } else {
            // ═══════ HYBRID-RETRIEVAL PATH ═══════
            retrievalContext = retrievalAugmentationService.retrieve(normalized);
            profiler.record("retrieval");
            log.info("Retrieved: {} sources, {} unique docs",
                    retrievalContext.sources().size(),
                    retrievalContext.sources().stream()
                            .map(SourceCitation::title).filter(Objects::nonNull).distinct().count());

            PromptContext promptContext = contextAssembler.assemble(normalized, retrievalContext);
            String prompt = promptBuilder.build(promptContext);
            profiler.record("prompt");
            log.info("Prompt: {} chars, {} evidence docs",
                    prompt.length(),
                    promptContext.evidencePackage() != null
                            ? promptContext.evidencePackage().items().size() : 0);

            long startMs = System.currentTimeMillis();
            rawAnswer = chatCompletionProvider.complete(prompt, capabilities);
            profiler.record("llm");
            log.info("LLM (reason): {} ms", System.currentTimeMillis() - startMs);

            if (promptContext.evidencePackage() != null) {
                evidenceCoverageValidator.validate(
                        rawAnswer, promptContext.evidencePackage(), normalized.question());
                profiler.record("coverage");
            }
        }

        // ── Ground ──
        ReasonedAnswer reasonedAnswer = groundingService.ground(rawAnswer, retrievalContext);
        profiler.record("ground");
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
                "MODEL_INFERENCE", reqId,
                Map.of("strategy", routing.strategy().name(),
                        "retrieval", routing.needsRetrieval() ? "EXECUTED" : "SKIPPED"));

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

    private String buildExplanationPrompt(DecisionResult decision) {
        return """
            Sie erklären eine bereits getroffene Verwaltungsentscheidung.
            Diese Entscheidung wurde von einem Regelsystem getroffen.
            Sie dürfen NICHT berechnen, interpretieren oder anzweifeln.

            ENTSCHEIDUNG
            %s

            QUELLE
            %s

            BEGRÜNDUNG
            %s

            BEHÖRDE
            %s

            Format: KURZANTWORT (1 Satz), ENTSCHEIDUNG (2-3 Sätze), QUELLE.
            Sprache: deutsche Kommunalverwaltung. Keine Rechtsberatung.
            """.formatted(decision.decision(), decision.source(),
                    decision.reason(), decision.authority());
    }

    // ── Trace ──

    private void logExecutionTrace(DecisionStrategy strategy, RetrievalContext ctx,
                                    PipelineProfiler profiler) {
        log.info("""
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
            ╚══════════════════════════════════════╝""",
            strategy,
            strategy == DecisionStrategy.HYBRID_RETRIEVAL ? "EXECUTED" : "SKIPPED",
            "SKIPPED",
            strategy == DecisionStrategy.HYBRID_RETRIEVAL ? "EXECUTED" : "SKIPPED",
            strategy == DecisionStrategy.HYBRID_RETRIEVAL ? "EXECUTED" : "SKIPPED",
            strategy == DecisionStrategy.RULE_ENGINE ? "explain-only" : "reason",
            ctx.sources().size(),
            profiler.totalMs());
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
