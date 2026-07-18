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
        return ResponseEntity.ok(Map.of(
                "caseId", caseId,
                "status", "ready",
                "message", "Stellen Sie eine Frage an die Entscheidungs-Engine via POST /api/decision/" + caseId + "/analyze"));
    }

    @PostMapping("/{caseId}/analyze")
    public ResponseEntity<DecisionResponse> analyze(
            @PathVariable String caseId,
            @RequestBody DecisionRequest request) {

        String question = request.question();
        if (question == null || question.isBlank()) {
            question = "Was sind die geltenden Wertgrenzen für Direktaufträge nach AV §55 LHO?";
        }

        var routing = decisionRouter.route(question);
        AiResponse aiResponse = aiService.answer(new AiRequest(
                question,
                request.model() != null ? request.model() : "default",
                null,
                new AiConversationContext(null, null, null,
                        UUID.randomUUID().toString(), UUID.randomUUID().toString()),
                5));

        DecisionResult decision = routing.decision();
        String answerText = aiResponse.answer() != null ? aiResponse.answer().answer() : "";

        DecisionResponse response = new DecisionResponse(
                caseId,
                question,
                routing.strategy(),
                decision,
                answerText.length() > 500 ? answerText.substring(0, 500) + "..." : answerText,
                answerText,
                decision != null ? decision.confidence()
                        : (aiResponse.answer() != null
                                && aiResponse.answer().confidence() != null
                                ? aiResponse.answer().confidence().overallConfidence() : 0.0),
                Map.of(
                        "strategy", routing.strategy().name(),
                        "explanation", routing.explanation()));

        log.info("Decision: caseId={} strategy={} confidence={}",
                caseId, routing.strategy(), response.confidence());
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
                        question, "default", null,
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
