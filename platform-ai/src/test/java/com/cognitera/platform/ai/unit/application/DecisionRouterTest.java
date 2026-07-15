package com.cognitera.platform.ai.unit.application;

import com.cognitera.platform.ai.application.DecisionRouter;
import com.cognitera.platform.ai.application.DomainClassifier;
import com.cognitera.platform.ai.knowledge.KnowledgeRegistry;
import com.cognitera.platform.ai.knowledge.ThresholdTable;
import com.cognitera.platform.ai.model.DecisionResult;
import com.cognitera.platform.ai.model.DecisionStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Acceptance tests for the procurement decision pipeline.
 * IT-related procurement queries must route to RULE_ENGINE using the
 * structured threshold table, never falling back to HYBRID_RETRIEVAL.
 */
class DecisionRouterTest {

    private DecisionRouter router;

    @BeforeEach
    void setUp() {
        KnowledgeRegistry registry = new KnowledgeRegistry();
        ThresholdTable av55 = new ThresholdTable(
                "AV zu Paragraph 55 LHO Berlin", "AV §55 LHO",
                LocalDate.of(2024, 1, 1));

        av55.addEntry(0, 500.0, "Kein formelles Verfahren",
                "Lieferung/Dienstleistung",
                List.of("Keine Genehmigung erforderlich"),
                "Unter 500 €");
        av55.addEntry(500.0, 1000.0, "Direktauftrag mit Genehmigung",
                "Lieferung/Dienstleistung",
                List.of("Schriftliche Genehmigung der Führungskraft"),
                "500 € bis 1.000 €");
        av55.addEntry(1000.0, 10_000.0, "Direktauftrag",
                "Lieferung/Dienstleistung",
                List.of("Vergabevermerk erforderlich", "Drei Vergleichsangebote (ab 500 €)"),
                "1.000 € bis 10.000 €");
        av55.addEntry(10_000.0, 100_000.0, "Beschränkte Ausschreibung",
                "Lieferung/Dienstleistung",
                List.of("Ex-post-Veröffentlichung (ab 25.000 €)"),
                "10.000 € bis 100.000 €");
        av55.addEntry(100_000.0, null, "Öffentliche Ausschreibung / EU-weit",
                "Lieferung/Dienstleistung",
                List.of("EU-Schwellenwerte prüfen"),
                "Ab 100.000 €");
        av55.addEntry(0, 20_000.0, "Direktauftrag",
                "Bauleistung",
                List.of(),
                "Bauleistung bis 20.000 €");
        av55.addEntry(20_000.0, 200_000.0, "Beschränkte Ausschreibung",
                "Bauleistung",
                List.of(),
                "Bauleistung 20.000 € bis 200.000 €");

        registry.register(av55);
        router = new DecisionRouter(registry, new DomainClassifier());
    }

    // ── IT procurement → RULE_ENGINE ──

    @Test
    void shouldRouteITAuftrag18kToRuleEngine() {
        var result = router.route(
                "Kann ich einen IT-Auftrag über 18.000 Euro freihändig vergeben?");

        assertEquals(DecisionStrategy.RULE_ENGINE, result.strategy(),
                "IT-Auftrag with amount must route to RULE_ENGINE, not retrieval");
        assertNotNull(result.decision(), "Decision must not be null");
        assertInstanceOf(DecisionResult.ProcurementDecision.class, result.decision(),
                "Decision must be a ProcurementDecision");

        var pd = (DecisionResult.ProcurementDecision) result.decision();
        assertEquals(18_000.0, pd.amount());
        assertEquals("Beschränkte Ausschreibung", pd.procedure());
    }

    @Test
    void shouldRouteITDienstleistungToRuleEngine() {
        var result = router.route(
                "IT-Dienstleistung über 5.000 Euro — Direktauftrag möglich?");

        assertEquals(DecisionStrategy.RULE_ENGINE, result.strategy());
        assertInstanceOf(DecisionResult.ProcurementDecision.class, result.decision());

        var pd = (DecisionResult.ProcurementDecision) result.decision();
        assertEquals(5_000.0, pd.amount());
        assertEquals("Direktauftrag", pd.procedure());
    }

    @Test
    void shouldRouteSoftwareProcurementToRuleEngine() {
        var result = router.route(
                "Softwarelizenz für 800 Euro beschaffen — welche Vergabeart?");

        assertEquals(DecisionStrategy.RULE_ENGINE, result.strategy());
        assertInstanceOf(DecisionResult.ProcurementDecision.class, result.decision());

        var pd = (DecisionResult.ProcurementDecision) result.decision();
        assertEquals(800.0, pd.amount());
        assertEquals("Direktauftrag mit Genehmigung", pd.procedure());
    }

    @Test
    void shouldRouteCloudProcurementToRuleEngine() {
        var result = router.route(
                "Cloud-Abo für 250 Euro — brauche ich eine Ausschreibung?");

        assertEquals(DecisionStrategy.RULE_ENGINE, result.strategy());
        assertInstanceOf(DecisionResult.ProcurementDecision.class, result.decision());

        var pd = (DecisionResult.ProcurementDecision) result.decision();
        assertEquals(250.0, pd.amount());
        assertEquals("Kein formelles Verfahren", pd.procedure());
    }

    @Test
    void shouldRouteBauProcurementToRuleEngine() {
        var result = router.route(
                "Bauauftrag über 15.000 Euro — Direktauftrag möglich?");

        assertEquals(DecisionStrategy.RULE_ENGINE, result.strategy());
        assertInstanceOf(DecisionResult.ProcurementDecision.class, result.decision());

        var pd = (DecisionResult.ProcurementDecision) result.decision();
        assertEquals(15_000.0, pd.amount());
        assertEquals("Bauleistung", pd.category());
        assertEquals("Direktauftrag", pd.procedure());
    }

    // ── Standard procurement continues to work ──

    @Test
    void shouldRouteStandardBeschaffungToRuleEngine() {
        var result = router.route(
                "Ist eine Beschaffung über 800 Euro ohne vorherige Genehmigung zulässig?");

        assertEquals(DecisionStrategy.RULE_ENGINE, result.strategy());
        assertInstanceOf(DecisionResult.ProcurementDecision.class, result.decision());

        var pd = (DecisionResult.ProcurementDecision) result.decision();
        assertEquals(800.0, pd.amount());
    }

    @Test
    void shouldRouteVergabeToRuleEngine() {
        var result = router.route(
                "Welche Wertgrenzen gelten für einen Direktauftrag über 3.000 Euro?");

        assertEquals(DecisionStrategy.RULE_ENGINE, result.strategy());
        assertInstanceOf(DecisionResult.ProcurementDecision.class, result.decision());
    }

    // ── Non-procurement continues to fall back ──

    @Test
    void shouldRouteNonProcurementToHybridRetrieval() {
        var result = router.route(
                "Welche Abstandsflächen gelten in Berlin?");

        assertEquals(DecisionStrategy.HYBRID_RETRIEVAL, result.strategy());
        assertNull(result.decision());
    }

}
