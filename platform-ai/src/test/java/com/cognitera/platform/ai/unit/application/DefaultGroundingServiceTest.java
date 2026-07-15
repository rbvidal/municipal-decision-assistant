package com.cognitera.platform.ai.unit.application;

import com.cognitera.platform.ai.application.DefaultGroundingService;
import com.cognitera.platform.ai.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for grounding service. Verifies that:
 * <ul>
 *   <li>RuleEngine decisions use structured grounding (no "Insufficient evidence")</li>
 *   <li>Retrieval decisions continue to use retrieval grounding</li>
 *   <li>Confidence from structured decisions is preserved</li>
 * </ul>
 */
@DisplayName("Grounding service")
class DefaultGroundingServiceTest {

    private DefaultGroundingService groundingService;

    @BeforeEach
    void setUp() {
        groundingService = new DefaultGroundingService();
    }

    // ── Structured grounding (RuleEngine) ──

    @Test
    @DisplayName("Procurement decision produces structured grounding")
    void shouldGroundProcurementDecision() {
        DecisionResult decision = new DecisionResult.ProcurementDecision(
                "Beschränkte Ausschreibung. Ex-post-Veröffentlichung (ab 25.000 €)",
                "10.000 € bis 100.000 €",
                "AV zu Paragraph 55 LHO Berlin",
                0.98, 18_000.0, "Beschränkte Ausschreibung",
                List.of("Ex-post-Veröffentlichung (ab 25.000 €)"),
                "Lieferung/Dienstleistung",
                "2024-01-01",
                "Senatsverwaltung für Finanzen");

        RetrievalContext ctx = new RetrievalContext(
                "Kann ich einen IT-Auftrag über 18.000 Euro freihändig vergeben?",
                "RULE_ENGINE", List.of(), decision);

        ReasonedAnswer answer = groundingService.ground(
                "Ein IT-Auftrag über 18.000 € erfordert eine Beschränkte Ausschreibung.", ctx);

        assertTrue(answer.grounded(), "RuleEngine decisions must be grounded");
        assertFalse(answer.answer().contains("Insufficient"),
                "Must not contain 'Insufficient retrieved evidence'");
        assertTrue(answer.answer().contains("Beschränkte Ausschreibung"),
                "Must contain the LLM explanation");
        assertNotNull(answer.confidence(), "Must have a confidence profile");
        assertEquals(0.98, answer.confidence().overallConfidence(), 0.001,
                "Confidence must come from the structured decision");
        assertEquals(0.98, answer.confidence().sourceConfidence(), 0.001);
        assertTrue(answer.confidence().explanation().contains("AV zu Paragraph 55 LHO"),
                "Explanation must reference the structured knowledge source");
    }

    @Test
    @DisplayName("Travel decision produces structured grounding")
    void shouldGroundTravelDecision() {
        DecisionResult decision = new DecisionResult.TravelDecision(
                "Tagegeld: 14 € (12-stündige Dienstreise Inland)",
                "BRKG Verpflegungspauschale Inland, gültig ab 01.01.2024",
                "Bundesreisekostengesetz (BRKG)",
                0.99, 12.0, 14.0, "Inland",
                "12-stündige Dienstreise",
                "2024-01-01",
                "Bundesministerium des Innern");

        RetrievalContext ctx = new RetrievalContext(
                "Wie hoch ist die Verpflegungspauschale bei einer 12-stündigen Dienstreise?",
                "RULE_ENGINE", List.of(), decision);

        ReasonedAnswer answer = groundingService.ground(
                "Bei einer 12-stündigen Dienstreise beträgt das Tagegeld 14 €.", ctx);

        assertTrue(answer.grounded());
        assertFalse(answer.answer().contains("Insufficient"));
        assertEquals(0.99, answer.confidence().overallConfidence(), 0.001);
        assertTrue(answer.confidence().explanation().contains("BRKG"));
    }

    @Test
    @DisplayName("Salary decision produces structured grounding")
    void shouldGroundSalaryDecision() {
        DecisionResult decision = new DecisionResult.SalaryDecision(
                "EG 9 Stufe 3 = 3250.50 €",
                "TV-L Entgelttabelle 2025, gültig ab 01.02.2025",
                "TV-L Entgelttabellen 2025",
                0.99, "EG 9", 3, 3250.50, "TV-L",
                "2025-02-01",
                "Tarifgemeinschaft deutscher Länder (TdL)");

        RetrievalContext ctx = new RetrievalContext(
                "Wie hoch ist EG 9 Stufe 3?",
                "RULE_ENGINE", List.of(), decision);

        ReasonedAnswer answer = groundingService.ground(
                "EG 9 Stufe 3 beträgt 3.250,50 €.", ctx);

        assertTrue(answer.grounded());
        assertFalse(answer.answer().contains("Insufficient"));
        assertEquals(0.99, answer.confidence().overallConfidence(), 0.001);
        assertTrue(answer.confidence().explanation().contains("TV-L"));
    }

    @Test
    @DisplayName("Structured grounding returns empty source citations")
    void shouldNotFakeSourceCitations() {
        DecisionResult decision = new DecisionResult.ProcurementDecision(
                "Direktauftrag", "Bis 1.000 €", "AV §55 LHO",
                0.98, 800.0, "Direktauftrag",
                List.of("Vergabevermerk erforderlich"),
                "Lieferung/Dienstleistung", "2024-01-01",
                "Senatsverwaltung für Finanzen");

        RetrievalContext ctx = new RetrievalContext(
                "Beschaffung über 800 Euro", "RULE_ENGINE", List.of(), decision);

        ReasonedAnswer answer = groundingService.ground(
                "Ein Direktauftrag ist zulässig.", ctx);

        assertTrue(answer.sourceCitations().isEmpty(),
                "Structured grounding must not fake source citations");
        assertTrue(answer.authorityReferences().isEmpty(),
                "Structured grounding must not fake authority references");
        assertTrue(answer.grounded());
    }

    // ── Retrieval grounding (regression guards) ──

    @Test
    @DisplayName("Retrieval grounding still works with sources")
    void shouldGroundRetrievalWithSources() {
        UUID docId = UUID.randomUUID();
        List<SourceCitation> sources = List.of(
                new SourceCitation(docId, UUID.randomUUID(), 1,
                        "Baugesetzbuch (BauGB)", null, null, null,
                        "Die Gemeinden haben Bauleitpläne aufzustellen...",
                        0.75, SourceCitation.SourceTier.PRIMARY,
                        SourceCitation.SourceType.FACTUAL)
        );

        RetrievalContext ctx = new RetrievalContext(
                "Welches Baugenehmigungsverfahren gilt für ein Einfamilienhaus?",
                "HYBRID", sources);

        ReasonedAnswer answer = groundingService.ground(
                "Für ein Einfamilienhaus gilt das vereinfachte Baugenehmigungsverfahren.", ctx);

        assertTrue(answer.grounded());
        assertFalse(answer.answer().contains("Insufficient"));
        assertEquals(1, answer.sourceCitations().size());
        assertTrue(answer.confidence().overallConfidence() > 0.0);
    }

    @Test
    @DisplayName("Retrieval with empty sources still returns insufficient")
    void shouldReturnInsufficientWhenNoSourcesAndNoDecision() {
        RetrievalContext ctx = new RetrievalContext(
                "Irgendeine Frage ohne Ergebnis",
                "HYBRID", List.of());

        ReasonedAnswer answer = groundingService.ground("Eine Antwort...", ctx);

        assertFalse(answer.grounded());
        assertTrue(answer.answer().contains("Insufficient"));
        assertEquals(0.0, answer.confidence().overallConfidence());
    }

    @Test
    @DisplayName("RULE_ENGINE without decision falls through to retrieval path")
    void shouldFallThroughWithoutDecision() {
        // If strategy is RULE_ENGINE but no decision is attached (edge case),
        // it should fall through to the existing retrieval guard
        RetrievalContext ctx = new RetrievalContext(
                "Frage", "RULE_ENGINE", List.of()); // no decision

        ReasonedAnswer answer = groundingService.ground("Antwort", ctx);

        assertFalse(answer.grounded());
        assertTrue(answer.answer().contains("Insufficient"));
    }
}
