package com.cognitera.platform.api.web;

import com.cognitera.platform.ai.application.AiService;
import com.cognitera.platform.ai.application.DecisionRouter;
import com.cognitera.platform.ai.model.AiConversationContext;
import com.cognitera.platform.ai.model.AiRequest;
import com.cognitera.platform.ai.model.AiResponse;
import com.cognitera.platform.ai.model.DecisionResult;
import com.cognitera.platform.ai.model.DecisionStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Decision API endpoint.
 *
 * <p>Provides structured decision support for case questions.
 * The DecisionRouter classifies the question and either executes
 * the RuleEngine (deterministic) or full HYBRID_RETRIEVAL.
 */
@RestController
@RequestMapping("/api/decision")
public class DecisionController {

    private static final Logger log = LoggerFactory.getLogger(DecisionController.class);

    private final AiService aiService;
    private final DecisionRouter decisionRouter;

    public DecisionController(AiService aiService, DecisionRouter decisionRouter) {
        this.aiService = aiService;
        this.decisionRouter = decisionRouter;
    }

    /** Request body for decision analysis. */
    public record DecisionRequest(String question, String model) {}

    /** Response wrapper for a decision result. */
    public record DecisionResponse(
            String caseId,
            String question,
            DecisionStrategy strategy,
            DecisionResult decision,
            String answer,
            String answerText,
            double confidence,
            Map<String, Object> debug
    ) {}

    @GetMapping("/{caseId}")
    public ResponseEntity<Map<String, Object>> getDecisionStatus(@PathVariable String caseId) {
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("caseId", caseId);
        body.put("status", "READY");
        body.put("summary", "Stellen Sie eine Frage, um eine KI-gestützte Analyse zu starten.");
        body.put("evidence", java.util.Collections.emptyList());
        body.put("reasoning", java.util.Collections.emptyList());
        body.put("citations", java.util.Collections.emptyList());
        body.put("confidence", Map.of(
                "overall", 0.0,
                "coverage", 0.0,
                "ruleCompleteness", 0.0,
                "missingEvidence", java.util.Collections.emptyList(),
                "conflictingEvidence", java.util.Collections.emptyList()));
        body.put("recommendation", Map.of(
                "action", "REQUEST_INFO",
                "summary", "",
                "requiredActions", java.util.Collections.emptyList(),
                "warnings", java.util.Collections.emptyList(),
                "exceptions", java.util.Collections.emptyList(),
                "missingDocuments", java.util.Collections.emptyList(),
                "manualReviewRequired", false));
        body.put("draft", Map.of(
                "id", "",
                "title", "",
                "version", "",
                "content", "",
                "citations", java.util.Collections.emptyList(),
                "createdAt", ""));
        body.put("validations", java.util.Collections.emptyList());
        body.put("workflow", Map.of(
                "phase", "initial",
                "step", 0,
                "totalSteps", 5,
                "canProceed", true,
                "canRegress", false));
        body.put("generatedAt", java.time.Instant.now().toString());
        body.put("duration", "");
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{caseId}/analyze")
    public ResponseEntity<Map<String, Object>> analyze(
            @PathVariable String caseId,
            @RequestBody DecisionRequest request) {

        long startMs = System.currentTimeMillis();
        String question = request.question();
        if (question == null || question.isBlank()) {
            question = "Was sind die geltenden Wertgrenzen für Direktaufträge nach AV §55 LHO?";
        }

        log.info("Request received: caseId={} questionLength={}", caseId, question.length());

        var routing = decisionRouter.route(question);
        log.info("Routing: strategy={} explanation={}", routing.strategy(), routing.explanation());

        String status = "ANSWER_READY";
        String answerText;
        double overallConf = 0.0;
        double coverageConf = 0.0;
        double ruleCompleteness = 0.0;
        java.util.List<Map<String, Object>> evidence = new java.util.ArrayList<>();
        java.util.List<Map<String, Object>> reasoning = new java.util.ArrayList<>();
        java.util.List<Map<String, Object>> citations = new java.util.ArrayList<>();
        java.util.List<String> missingEvidence = new java.util.ArrayList<>();
        String recommendationAction = "REQUEST_INFO";

        try {
            AiResponse aiResponse = aiService.answer(new AiRequest(
                    question,
                    request.model() != null && !request.model().isBlank() ? request.model() : null,
                    null,
                    new AiConversationContext(null, null, null,
                            UUID.randomUUID().toString(), UUID.randomUUID().toString()),
                    5));

            DecisionResult decision = routing.decision();
            var reasonedAnswer = aiResponse.answer();

            if (reasonedAnswer != null) {
                answerText = reasonedAnswer.answer();

                // ── Independent confidence dimensions ──
                if (reasonedAnswer.confidence() != null) {
                    var cp = reasonedAnswer.confidence();
                    overallConf = cp.overallConfidence();
                    coverageConf = cp.completenessConfidence();
                    ruleCompleteness = cp.sourceConfidence();
                } else if (decision != null) {
                    overallConf = decision.confidence();
                    coverageConf = decision.confidence();
                    ruleCompleteness = decision.confidence();
                }

                // ── Evidence from source citations ──
                for (var sc : reasonedAnswer.sourceCitations()) {
                    evidence.add(Map.of(
                            "id", sc.chunkId() != null ? sc.chunkId().toString() : UUID.randomUUID().toString(),
                            "title", sc.title() != null ? sc.title() : "",
                            "source", sc.title() != null ? sc.title() : "",
                            "excerpt", sc.excerpt() != null ? sc.excerpt() : "",
                            "relevanceScore", sc.confidenceScore(),
                            "confidence", sc.confidenceScore()));
                }

                // ── Citations from authority references ──
                for (var ar : reasonedAnswer.authorityReferences()) {
                    String lawRef = ar.entryTitle() != null ? ar.entryTitle()
                            : ar.referenceId() != null ? ar.referenceId() : "";
                    citations.add(Map.of(
                            "id", UUID.randomUUID().toString(),
                            "law", lawRef,
                            "paragraph", ar.entryNumber() != null ? ar.entryNumber() : "",
                            "verificationStatus",
                            ar.tier() == com.cognitera.platform.ai.model.AuthorityReference.ReferenceTier.PRIMARY
                                    ? "verified" : "unverified"));
                }

                // ── Status determination ──
                if (answerText == null || answerText.isBlank()
                        || answerText.contains("Insufficient retrieved evidence")) {
                    status = "NO_EVIDENCE";
                    answerText = "Keine relevanten Nachweise gefunden. "
                            + "Bitte formulieren Sie Ihre Frage um oder konsultieren Sie einen Fachexperten.";
                }

                // ── Recommendation ──
                if (overallConf >= 0.7) {
                    recommendationAction = "APPROVE";
                } else if (evidence.isEmpty()) {
                    recommendationAction = "REQUEST_INFO";
                }
            } else {
                answerText = "Keine Antwort generiert.";
                status = "NO_EVIDENCE";
            }

        } catch (Exception e) {
            log.error("Reasoning failed: caseId={} cause={}", caseId, e.getMessage(), e);
            answerText = "Reasoning failed: " + e.getMessage();
            status = "FAILED";
            overallConf = 0.0;
            coverageConf = 0.0;
            ruleCompleteness = 0.0;
        }

        long durationMs = System.currentTimeMillis() - startMs;
        log.info("Response: caseId={} strategy={} status={} overall={} coverage={} ruleCompleteness={} evidence={} citations={} duration={}ms",
                caseId, routing.strategy(), status,
                String.format("%.2f", overallConf), String.format("%.2f", coverageConf),
                String.format("%.2f", ruleCompleteness),
                evidence.size(), citations.size(), durationMs);

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("caseId", caseId);
        response.put("status", status);
        response.put("summary", answerText.length() > 500 ? answerText.substring(0, 500) + "..." : answerText);
        response.put("evidence", evidence);
        response.put("reasoning", reasoning);
        response.put("citations", citations);
        response.put("confidence", Map.of(
                "overall", overallConf,
                "coverage", coverageConf,
                "ruleCompleteness", ruleCompleteness,
                "missingEvidence", missingEvidence,
                "conflictingEvidence", java.util.Collections.emptyList()));
        response.put("recommendation", Map.of(
                "action", recommendationAction,
                "summary", answerText.length() > 200 ? answerText.substring(0, 200) : answerText,
                "requiredActions", java.util.Collections.emptyList(),
                "warnings", java.util.Collections.emptyList(),
                "exceptions", java.util.Collections.emptyList(),
                "missingDocuments", java.util.Collections.emptyList(),
                "manualReviewRequired", status.equals("FAILED")));
        response.put("draft", Map.of(
                "id", UUID.randomUUID().toString(),
                "title", "Entscheidungsentwurf — " + caseId,
                "version", "v1.0-draft",
                "content", answerText,
                "citations", java.util.Collections.emptyList(),
                "createdAt", java.time.Instant.now().toString()));
        response.put("validations", java.util.Collections.emptyList());
        response.put("workflow", Map.of(
                "phase", "analysis",
                "step", 1,
                "totalSteps", 5,
                "canProceed", true,
                "canRegress", false));
        response.put("generatedAt", java.time.Instant.now().toString());
        response.put("duration", durationMs + "ms");
        response.put("strategy", routing.strategy().name());
        response.put("explanation", routing.explanation());
        response.put("answer", answerText);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{caseId}/draft")
    public ResponseEntity<Map<String, Object>> generateDraft(
            @PathVariable String caseId,
            @RequestBody DecisionRequest request) {

        return ResponseEntity.ok(Map.of(
                "id", UUID.randomUUID().toString(),
                "title", "Entscheidungsentwurf — " + caseId,
                "version", "v1.0-draft",
                "content", buildDraftContent(request.question()),
                "createdAt", java.time.Instant.now().toString()));
    }

    @GetMapping(value = "/{caseId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDecision(@PathVariable String caseId,
                                      @RequestParam(defaultValue = "Welche Wertgrenzen gelten für Direktaufträge?") String question) {
        SseEmitter emitter = new SseEmitter(120_000L);

        CompletableFuture.runAsync(() -> {
            try {
                var routing = decisionRouter.route(question);
                emitter.send(SseEmitter.event()
                        .name("routing")
                        .data(Map.of("strategy", routing.strategy().name(),
                                "explanation", routing.explanation())));

                Thread.sleep(200);

                AiResponse aiResponse = aiService.answer(new AiRequest(
                        question, null, null,
                        new AiConversationContext(null, null, null,
                                UUID.randomUUID().toString(), UUID.randomUUID().toString()),
                        5));

                String answer = aiResponse.answer() != null ? aiResponse.answer().answer() : "";
                emitter.send(SseEmitter.event()
                        .name("decision")
                        .data(Map.of("strategy", routing.strategy().name(),
                                "answer", answer)));

                Thread.sleep(100);

                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data(Map.of("status", "complete",
                                "duration", "completed")));
                emitter.complete();
            } catch (IOException | InterruptedException e) {
                log.error("SSE stream error for case {}", caseId, e);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private String buildDraftContent(String question) {
        if (question == null) return "";
        return """
            BESCHEID

            Az.: %s
            Datum: %s

            SACHVERHALT
            %s

            ENTSCHEIDUNG
            Die Entscheidung ergibt sich aus den anzuwendenden Rechtsvorschriften.
            Eine detaillierte Begründung finden Sie in der Analyse.

            RECHTSBEHELFSBELEHRUNG
            Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe
            Widerspruch erhoben werden.
            """.formatted(
                UUID.randomUUID().toString().substring(0, 8),
                java.time.LocalDate.now().toString(),
                question);
    }
}
