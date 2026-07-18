package com.cognitera.platform.api.web;

import com.cognitera.platform.ai.application.AiService;
import com.cognitera.platform.ai.model.AiRequest;
import com.cognitera.platform.ai.model.AiResponse;
import com.cognitera.platform.ai.model.ConfidenceProfile;
import com.cognitera.platform.ai.model.InferenceMetadata;
import com.cognitera.platform.ai.model.ReasonedAnswer;

import java.time.Instant;

/**
 * Stub AiService for tests that don't need the full LLM pipeline.
 * Returns a fixed answer regardless of the question.
 */
class StubAiService extends AiService {

    StubAiService() {
        super(null, null, null, null, null, null,
              null, null, null, null, null, null);
    }

    @Override
    public AiResponse answer(AiRequest request) {
        return new AiResponse(
                new ReasonedAnswer(
                        "Die Entscheidung wurde deterministisch vom Regelsystem getroffen.",
                        java.util.List.of(),
                        0.98,
                        true),
                new InferenceMetadata("stub", "stub", Instant.now(), Instant.now(),
                        null, null, "v9-routed", "RULE_ENGINE", java.util.List.of(), 0.98));
    }
}
