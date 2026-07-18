package com.cognitera.platform.ai.unit.application;

import com.cognitera.platform.ai.application.NumericExtractor;
import com.cognitera.platform.ai.application.RuleEngine;
import com.cognitera.platform.ai.knowledge.*;
import com.cognitera.platform.ai.model.NumericExtraction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive tests for RuleEngine covering all lookup paths:
 * procurement thresholds (all categories), travel expenses,
 * salary queries, and edge cases (missing tables, zero amounts).
 */
class RuleEngineTest {

    private RuleEngine engine;
    private KnowledgeRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new KnowledgeRegistry();

        // Threshold table
        ThresholdTable av55 = new ThresholdTable("AV zu Paragraph 55 LHO Berlin",
                "AV §55 LHO", LocalDate.of(2024, 1, 1));
        av55.addEntry(0, 500.0, "Kein formelles Verfahren", "Lieferung/Dienstleistung",
                List.of("Keine Genehmigung erforderlich"), "Unter 500 €");
        av55.addEntry(500.0, 1000.0, "Direktauftrag mit Genehmigung", "Lieferung/Dienstleistung",
                List.of("Schriftliche Genehmigung der Führungskraft"), "500 € bis 1.000 €");
        av55.addEntry(1000.0, 10_000.0, "Direktauftrag", "Lieferung/Dienstleistung",
                List.of("Vergabevermerk erforderlich", "Drei Vergleichsangebote (ab 500 €)"),
                "1.000 € bis 10.000 €");
        av55.addEntry(10_000.0, 100_000.0, "Beschränkte Ausschreibung", "Lieferung/Dienstleistung",
                List.of("Ex-post-Veröffentlichung (ab 25.000 €)"), "10.000 € bis 100.000 €");
        av55.addEntry(100_000.0, null, "Öffentliche Ausschreibung / EU-weit", "Lieferung/Dienstleistung",
                List.of("EU-Schwellenwerte prüfen"), "Ab 100.000 €");
        av55.addEntry(0, 20_000.0, "Direktauftrag", "Bauleistung",
                List.of(), "Bauleistung bis 20.000 €");
        av55.addEntry(20_000.0, 200_000.0, "Beschränkte Ausschreibung", "Bauleistung",
                List.of(), "Bauleistung 20.000 € bis 200.000 €");
        registry.register(av55);

        // Travel table
        TravelAllowanceTable brkg = new TravelAllowanceTable("BRKG", "BRKG", LocalDate.of(2024, 1, 1));
        brkg.addEntry(8, 24.0, 6.0, "domestic", false, "Abwesenheit über 8 Stunden");
        brkg.addEntry(11, 24.0, 12.0, "domestic", false, "Abwesenheit über 11 Stunden");
        brkg.addEntry(24, null, 24.0, "domestic", false, "Voller 24-Stunden-Tag");
        brkg.addEntry(0, null, 0.35, "mileage", false, "Kilometerpauschale PKW");
        brkg.addEntry(0, null, 80.0, "accommodation", true, "Übernachtung mit Beleg");
        brkg.addEntry(0, null, 20.0, "accommodation", false, "Übernachtung pauschal");
        registry.register(brkg);

        // Salary table
        SalaryTable tvl = new SalaryTable("TV-L Entgelttabellen 2025", "TV-L",
                LocalDate.of(2025, 2, 1), null);
        tvl.addEntry("EG 9a", 1, 3500.00, 0, "");
        tvl.addEntry("EG 9a", 2, 3715.69, 0, "");
        tvl.addEntry("EG 9a", 3, 4117.53, 0, "");
        tvl.addEntry("EG 10", 2, 4231.36, 0, "");
        tvl.addEntry("EG 10", 3, 4400.00, 0, "");
        registry.register(tvl);

        engine = new RuleEngine(registry);
    }

    // ── Procurement ──

    @Test
    void shouldEvaluateProcurementForITService() {
        var result = engine.evaluateProcurement(5_000.0, "IT-Dienstleistung für Cloud-Migration");
        assertTrue(result.deterministic());
        assertEquals("procurement-threshold", result.rule());
        assertTrue(result.result().contains("Direktauftrag"));
    }

    @Test
    void shouldEvaluateProcurementForSmallAmount() {
        var result = engine.evaluateProcurement(250.0, "Büromaterial");
        assertTrue(result.deterministic());
        assertTrue(result.result().contains("Kein formelles Verfahren"));
    }

    @Test
    void shouldEvaluateProcurementForHighAmount() {
        var result = engine.evaluateProcurement(150_000.0, "Software-Lizenzen");
        assertTrue(result.result().contains("Öffentliche Ausschreibung"));
    }

    @Test
    void shouldEvaluateProcurementForConstruction() {
        var result = engine.evaluateProcurement(15_000.0, "Bau eines Carports");
        assertTrue(result.deterministic());
        assertTrue(result.result().contains("Direktauftrag"));
    }

    @Test
    void shouldEvaluateProcurementForLargeConstruction() {
        var result = engine.evaluateProcurement(50_000.0, "Sanierung Schulgebäude");
        assertTrue(result.result().contains("Beschränkte Ausschreibung"));
    }

    @Test
    void shouldEvaluateProcurementForExactBoundary() {
        var result = engine.evaluateProcurement(500.0, "Druckerpatronen");
        assertTrue(result.result().contains("Direktauftrag mit Genehmigung"));
    }

    @Test
    void shouldEvaluateProcurementWithZeroAmount() {
        var result = engine.evaluateProcurement(0.0, "Beratungsleistung");
        assertTrue(result.deterministic());
        assertNotNull(result.result());
    }

    @Test
    void shouldDetectITType() {
        var result = engine.evaluateProcurement(5_000.0, "IT-Sicherheitsaudit durchführen");
        var details = result.details();
        assertTrue(details.containsKey("kategorie"));
        assertEquals("Lieferung/Dienstleistung", details.get("kategorie"));
    }

    @Test
    void shouldDetectConstructionType() {
        var result = engine.evaluateProcurement(5_000.0, "Gebäude renovieren");
        var details = result.details();
        assertEquals("Bauleistung", details.get("kategorie"));
    }

    // ── Travel ──

    @Test
    void shouldEvaluateTravelForShortTrip() {
        var result = engine.evaluateTravelExpense(9.0, false);
        assertTrue(result.deterministic());
        assertTrue(result.result().contains("6"));
    }

    @Test
    void shouldEvaluateTravelForMediumTrip() {
        var result = engine.evaluateTravelExpense(12.0, false);
        assertTrue(result.deterministic());
        assertTrue(result.result().contains("12"));
    }

    @Test
    void shouldEvaluateTravelForFullDay() {
        var result = engine.evaluateTravelExpense(24.0, false);
        assertTrue(result.deterministic());
        assertTrue(result.result().contains("24"));
    }

    @Test
    void shouldEvaluateTravelWithOvernight() {
        var result = engine.evaluateTravelExpense(10.0, true);
        assertTrue(result.deterministic());
        var details = result.details();
        assertTrue(details.containsKey("übernachtung"));
        assertEquals("80.0 € mit Beleg", details.get("übernachtung"));
    }

    @Test
    void shouldEvaluateTravelForVeryShort() {
        // 4 hours — no matching entry (lowest threshold is 8h); non-deterministic fallback
        var result = engine.evaluateTravelExpense(4.0, false);
        assertFalse(result.deterministic());
        assertTrue(result.result().contains("Manuelle Prüfung"));
    }

    @Test
    void shouldHandleTravelWithNoTable() {
        registry.clear();
        var result = engine.evaluateTravelExpense(10.0, false);
        assertFalse(result.deterministic());
        assertTrue(result.result().contains("Keine Reisekostentabelle"));
    }

    // ── Salary ──

    @Test
    void shouldEvaluateSalaryQuery() {
        var extractor = new NumericExtractor();
        var extraction = extractor.extract("EG 9a Stufe 3: 4.117,53 €");
        var result = engine.evaluateSalaryQuery("Wie hoch ist EG 9a Stufe 3?", List.of(extraction));

        assertEquals("salary-query", result.rule());
        var details = result.details();
        @SuppressWarnings("unchecked")
        var grades = (List<?>) details.get("gefundeneStufen");
        assertTrue(grades.size() >= 1);
    }

    @Test
    void shouldDetectIncreaseQuery() {
        var result = engine.evaluateSalaryQuery("Wie hoch ist die Gehaltserhöhung 2025?", List.of());
        assertEquals("Gehaltserhöhung", result.details().get("typ"));
    }

    @Test
    void shouldHandleEmptySalaryExtraction() {
        var result = engine.evaluateSalaryQuery("EG 15 Stufe 5 Gehalt", List.of());
        var details = result.details();
        @SuppressWarnings("unchecked")
        var grades = (List<?>) details.get("gefundeneStufen");
        assertTrue(grades.isEmpty());
    }

    // ── Edge cases ──

    @Test
    void shouldHandleProcurementWithNoThresholdTable() {
        registry.clear();
        var result = engine.evaluateProcurement(5_000.0, "Büromaterial");
        assertTrue(result.result().contains("Keine Schwellenwerttabelle"));
    }

    @Test
    void shouldHandleNegativeAmount() {
        var result = engine.evaluateProcurement(-100.0, "Rückzahlung");
        assertNotNull(result.details());
    }

    @Test
    void shouldHandleVeryLargeAmount() {
        var result = engine.evaluateProcurement(10_000_000.0, "Großprojekt Infrastruktur");
        assertTrue(result.deterministic());
        assertTrue(result.result().contains("Öffentliche Ausschreibung"));
    }

    @Test
    void shouldHandleNullContextForProcurement() {
        var result = engine.evaluateProcurement(1_000.0, "");
        assertTrue(result.deterministic());
        assertNotNull(result.result());
    }
}
