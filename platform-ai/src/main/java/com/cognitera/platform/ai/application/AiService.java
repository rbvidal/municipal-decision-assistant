package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.*;
import com.cognitera.platform.ai.config.AiPipelineProperties;
import com.cognitera.platform.ai.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Simplified AI orchestration service with full pipeline profiling.
 *
 * <p>The pipeline flow:
 * <ol>
 *   <li>Intent classification → route or continue</li>
 *   <li>Hybrid retrieval</li>
 *   <li>Evidence package assembly (grouped, deduplicated, limited)</li>
 *   <li>Compact prompt construction</li>
 *   <li>Single LLM inference (no auto-retry)</li>
 *   <li>Post-hoc coverage validation (metric only, not blocking)</li>
 *   <li>Grounding and audit</li>
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
            AiPipelineProperties props) {
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
    }

    @Override
    @Transactional
    public AiResponse answer(AiRequest request) {
        AiRequest normalized = normalize(request);
        profiler.start(normalized.context().requestId() != null
                ? normalized.context().requestId() : "unknown");

        // ── Intent ──
        QueryIntent intent = intentClassifier.classify(normalized.question());
        profiler.record("intent-classification");

        if (intent == QueryIntent.INDEX_INSPECTION || intent == QueryIntent.CORPUS_DISCOVERY) {
            profiler.finish();
            return indexInspectionService.inspect(normalized);
        }

        // ── Retrieval ──
        RetrievalContext retrievalContext = retrievalAugmentationService.retrieve(normalized);
        profiler.record("hybrid-retrieval");
        log.info("Retrieved: {} sources", retrievalContext.sources().size());

        // ── Evidence package ──
        PromptContext promptContext = contextAssembler.assemble(normalized, retrievalContext);
        profiler.record("evidence-building");

        // ── Prompt ──
        String prompt = promptBuilder.build(promptContext);
        profiler.record("prompt-construction");
        log.info("Prompt size: {} chars, {} evidence docs",
                prompt.length(),
                promptContext.evidencePackage() != null
                        ? promptContext.evidencePackage().items().size() : 0);

        // ── LLM ──
        ModelCapabilities capabilities = modelProvider.capabilities(normalized.model());
        Instant inferenceStart = Instant.now();
        String rawAnswer = chatCompletionProvider.complete(prompt, capabilities);
        profiler.record("llm-inference");
        long inferenceMs = java.time.Duration.between(inferenceStart, Instant.now()).toMillis();
        log.info("LLM inference: {} ms", inferenceMs);

        // ── Coverage validation (metric only, non-blocking per Part F) ──
        if (promptContext.evidencePackage() != null) {
            var coverageCheck = evidenceCoverageValidator.validate(
                    rawAnswer, promptContext.evidencePackage(), normalized.question());
            profiler.record("coverage-validation");
            log.info("Coverage: passed={}, missingDocs={}, missingNums={}",
                    coverageCheck.passed(),
                    coverageCheck.missingDocumentTitles(),
                    coverageCheck.missingNumericValues());
            // NEVER retry — coverage is a quality metric, not a gate
        }

        // ── Grounding ──
        ReasonedAnswer reasonedAnswer = groundingService.ground(rawAnswer, retrievalContext);
        profiler.record("grounding");
        profiler.finish();

        Instant completedAt = Instant.now();
        InferenceMetadata metadata = new InferenceMetadata(
                capabilities.provider(), capabilities.model(),
                Instant.now(), completedAt,
                normalized.context().correlationId(),
                normalized.context().requestId(),
                promptBuilder.templateVersion(),
                retrievalContext.retrievalStrategy(),
                retrievalContext.sources().stream().map(s -> s.chunkId().toString()).toList(),
                reasonedAnswer.confidence().overallConfidence());

        auditPublisher.emit(normalized.context().actorId(), normalized.context().tenantId(),
                "MODEL_INFERENCE", normalized.context().requestId(),
                Map.of("provider", capabilities.provider(),
                        "model", capabilities.model(),
                        "promptChars", Integer.toString(prompt.length()),
                        "inferenceMs", Long.toString(inferenceMs),
                        "grounded", Boolean.toString(reasonedAnswer.grounded())));

        return new AiResponse(reasonedAnswer, metadata);
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
