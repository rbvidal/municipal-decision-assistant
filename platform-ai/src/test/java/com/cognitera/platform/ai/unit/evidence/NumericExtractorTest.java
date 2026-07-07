package com.cognitera.platform.ai.unit.evidence;

import com.cognitera.platform.ai.application.NumericExtractor;
import com.cognitera.platform.ai.model.NumericExtraction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NumericExtractorTest {

    private NumericExtractor extractor;

    @BeforeEach
    void setUp() {
        extractor = new NumericExtractor();
    }

    @Test
    void shouldExtractMoneyInEuroFormat() {
        NumericExtraction result = extractor.extract("Der Betrag beträgt 4.117,53 €.");
        assertFalse(result.moneyValues().isEmpty());
        assertEquals(4117.53, result.moneyValues().getFirst().amount(), 0.01);
        assertEquals("EUR", result.moneyValues().getFirst().currency());
    }

    @Test
    void shouldExtractMoneyInEuroPlain() {
        NumericExtraction result = extractor.extract("Beschaffungen bis 10.000 Euro sind zulässig.");
        assertFalse(result.moneyValues().isEmpty());
        assertEquals(10000.0, result.moneyValues().getFirst().amount(), 0.01);
    }

    @Test
    void shouldExtractPercentageWithComma() {
        NumericExtraction result = extractor.extract("Die Erhöhung beträgt 5,5 % ab Februar.");
        assertFalse(result.percentages().isEmpty());
        assertEquals(5.5, result.percentages().getFirst().value(), 0.01);
    }

    @Test
    void shouldExtractSalaryGradeWithStufe() {
        NumericExtraction result = extractor.extract("EG 9a Stufe 3: 4.117,53 €. EG 10 Stufe 2: 4.231,36 €.");
        assertFalse(result.salaryGrades().isEmpty());
        assertTrue(result.salaryGrades().size() >= 2);
        assertTrue(result.salaryGrades().stream().anyMatch(sg -> sg.grade().contains("EG 9a") && sg.step() == 3));
        assertTrue(result.salaryGrades().stream().anyMatch(sg -> sg.grade().contains("EG 10") && sg.step() == 2));
    }

    @Test
    void shouldExtractThresholds() {
        NumericExtraction result = extractor.extract(
                "Direktauftrag bis 10.000 Euro. Beschränkte Ausschreibung bis 100.000 Euro.");
        assertFalse(result.thresholds().isEmpty());
        assertTrue(result.thresholds().size() >= 2);
    }

    @Test
    void shouldExtractDates() {
        NumericExtraction result = extractor.extract(
                "Gültig ab 01.02.2025. Die neue Fassung tritt am 1. Januar 2026 in Kraft.");
        assertFalse(result.dates().isEmpty());
    }

    @Test
    void shouldReturnEmptyForBlankText() {
        NumericExtraction result = extractor.extract("");
        assertTrue(result.isEmpty());
    }

    @Test
    void shouldReturnEmptyForNullText() {
        NumericExtraction result = extractor.extract(null);
        assertTrue(result.isEmpty());
    }

    @Test
    void shouldExtractMultipleMoneyValues() {
        NumericExtraction result = extractor.extract(
                "Tagegeld: 6 €, 12 €, 24 €. Kilometergeld: 0,35 €.");
        assertTrue(result.moneyValues().size() >= 3);
    }
}
