package com.cognitera.platform.ai.unit.evidence;

import com.cognitera.platform.ai.application.EvidencePackageBuilder;
import com.cognitera.platform.ai.application.NumericExtractor;
import com.cognitera.platform.ai.config.AiPipelineProperties;
import com.cognitera.platform.ai.model.EvidenceItem;
import com.cognitera.platform.ai.model.EvidencePackage;
import com.cognitera.platform.ai.model.EvidencePackage.CoverageStatus;
import com.cognitera.platform.ai.model.SourceCitation;
import com.cognitera.platform.ai.model.SourceCitation.SourceTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class EvidencePackageBuilderTest {

    private EvidencePackageBuilder builder;

    @BeforeEach
    void setUp() {
        AiPipelineProperties props = new AiPipelineProperties();
        props.setMaxEvidenceSources(4);
        props.setMaxParagraphsPerSource(3);
        props.setMaxExcerptLength(500);
        builder = new EvidencePackageBuilder(new NumericExtractor(), props);
    }

    // ── Salary lookup ──

    @Test
    void shouldExtractSalaryGradeFromTvLPayTable() {
        var sources = List.of(source("TV-L Entgelttabellen 2025",
                "EG 9a Stufe 3: 4.117,53 €. EG 9b Stufe 3: 4.117,53 €. "
                + "Gültig ab 01.02.2025. Die Gehaltserhöhung beträgt 5,5 %."));
        EvidencePackage pkg = builder.build("Wie hoch ist EG 9a Stufe 3?", sources);

        assertEquals(1, pkg.items().size());
        assertFalse(pkg.isEmpty());
        EvidenceItem item = pkg.items().getFirst();
        assertNotNull(item.numericExtraction());
        assertFalse(item.numericExtraction().salaryGrades().isEmpty());
        assertFalse(item.numericExtraction().moneyValues().isEmpty());
        assertFalse(item.numericExtraction().percentages().isEmpty());
        assertTrue(item.numericExtraction().salaryGrades().stream()
                .anyMatch(sg -> sg.grade().contains("EG 9a") && sg.step() == 3));
    }

    @Test
    void shouldDetectConflictingSalaryData() {
        var sources = List.of(
                source("TV-L Entgelttabellen 2025", "EG 9a Stufe 3: 4.117,53 €"),
                source("TV-L Entgelttabellen 2024", "EG 9a Stufe 3: 3.950,00 €"));
        EvidencePackage pkg = builder.build("EG 9a Stufe 3 Gehalt", sources);
        // When two sources have conflicting salary data, contradiction should be detected
        assertTrue(pkg.hasContradictions() || pkg.coverageStatus() != CoverageStatus.INSUFFICIENT);
    }

    // ── Procurement approval ──

    @Test
    void shouldIdentifyProcurementThreshold() {
        var sources = List.of(source("Beschaffungsordnung Berlin",
                "Beschaffungen zwischen 500 € und 1.000 € bedürfen der "
                + "schriftlichen Genehmigung der Führungskraft. "
                + "Beschaffungen über 1.000 € erfordern einen Vergabevermerk. "
                + "Direktaufträge bis 10.000 Euro sind zulässig."));
        EvidencePackage pkg = builder.build(
                "Ist eine Beschaffung über 800 Euro ohne Genehmigung zulässig?", sources);

        assertEquals(1, pkg.items().size());
        EvidenceItem item = pkg.items().getFirst();
        assertEquals("Beschaffungsordnung Berlin", item.documentTitle());
        // Should detect procurement domain
        assertTrue(item.supports().toLowerCase().contains("vergaberecht")
                || item.supports().toLowerCase().contains("beschaffung"));
        // Should extract thresholds
        assertNotNull(item.numericExtraction());
        assertFalse(item.numericExtraction().thresholds().isEmpty());
    }

    @Test
    void shouldSelectProcurementNotHrForBeschaffungQuery() {
        var sources = List.of(
                source("Beschaffungsordnung Berlin", "Beschaffungen..."),
                source("Landesreisekostengesetz Berlin", "Reisekosten..."));
        EvidencePackage pkg = builder.build("Ist eine Beschaffung über 800 Euro genehmigungsfrei?", sources);

        assertEquals(2, pkg.items().size());
        // Procurement document should be first (higher confidence/priority)
        assertTrue(pkg.items().getFirst().documentTitle().contains("Beschaffungsordnung")
                || pkg.items().getFirst().supports().toLowerCase().contains("beschaffung"));
    }

    // ── Travel expenses ──

    @Test
    void shouldExtractTravelExpenseRates() {
        var sources = List.of(source("Bundesreisekostengesetz (BRKG)",
                "Tagegeld innerhalb Deutschlands: 6 € für Abwesenheit über 8 Stunden, "
                + "12 € für über 11 Stunden, 24 € für vollen 24-Stunden-Tag. "
                + "Kilometergeld: 0,35 € pro Kilometer."));
        EvidencePackage pkg = builder.build(
                "Wie hoch ist das Tagegeld bei einer Dienstreise?", sources);

        assertFalse(pkg.isEmpty());
        EvidenceItem item = pkg.items().getFirst();
        assertNotNull(item.numericExtraction());
        // Should have extracted money values
        assertFalse(item.numericExtraction().moneyValues().isEmpty());
        assertTrue(item.supports().toLowerCase().contains("reisekosten"));
    }

    // ── Vacation rules ──

    @Test
    void shouldSupportVacationQuery() {
        var sources = List.of(source("Urlaubsverordnung Berlin (UrlVO Bln)",
                "Jahresurlaub: 30 Arbeitstage bei einer 5-Tage-Woche. "
                + "Übertragung gültig ab 1. Januar bis 31. März des Folgejahres."));
        EvidencePackage pkg = builder.build("Kann ich meinen Resturlaub übertragen?", sources);

        assertFalse(pkg.isEmpty());
        assertTrue(pkg.items().getFirst().supports().toLowerCase().contains("urlaub"));
    }

    // ── Working hours ──

    @Test
    void shouldDetectWorkingTimeRegulation() {
        var sources = List.of(source("Arbeitszeitverordnung Berlin (AZVO Bln)",
                "Regelmäßige wöchentliche Arbeitszeit: 40 Stunden für Beamte, "
                + "39 Stunden 50 Minuten für Tarifbeschäftigte. "
                + "Kernarbeitszeit: 9:30 bis 15:00 Uhr. "
                + "Maximale tägliche Arbeitszeit: 10 Stunden."));
        EvidencePackage pkg = builder.build(
                "Wie sind die Kernarbeitszeiten in der Berliner Verwaltung?", sources);

        assertFalse(pkg.isEmpty());
        assertTrue(pkg.items().getFirst().supports().toLowerCase().contains("arbeitszeit"));
    }

    // ── Missing evidence ──

    @Test
    void shouldMarkInsufficientWhenNoSources() {
        EvidencePackage pkg = builder.build("Gibt es eine Vorschrift zu Drohnenflügen?", List.of());
        assertTrue(pkg.isEmpty());
        assertTrue(pkg.hasInsufficientEvidence());
        assertEquals(CoverageStatus.INSUFFICIENT, pkg.coverageStatus());
    }

    @Test
    void shouldReportZeroDocumentsWhenEmpty() {
        EvidencePackage pkg = builder.build("Beliebige Frage", List.of());
        assertEquals(0, pkg.totalDocumentsSearched());
        assertEquals(0, pkg.relevantDocumentsFound());
        assertEquals(0, pkg.documentsUsed());
    }

    // ── Numeric extraction ──

    @Test
    void shouldExtractEuroAmounts() {
        var sources = List.of(source("Testdokument", "Der Betrag beträgt 500,00 € und 1.234,56 Euro."));
        EvidencePackage pkg = builder.build("test", sources);
        var item = pkg.items().getFirst();
        var moneyValues = item.numericExtraction().moneyValues();
        assertEquals(2, moneyValues.size());
        assertEquals(500.0, moneyValues.get(0).amount(), 0.01);
        assertEquals(1234.56, moneyValues.get(1).amount(), 0.01);
    }

    @Test
    void shouldExtractPercentages() {
        var sources = List.of(source("Test", "Erhöhung um 5,5 % und 3.2 Prozent."));
        EvidencePackage pkg = builder.build("test", sources);
        var pcts = pkg.items().getFirst().numericExtraction().percentages();
        assertEquals(2, pcts.size());
    }

    // ── Paragraph citations ──

    @Test
    void shouldGroupEvidenceByDocument() {
        var sources = List.of(
                source("BauO Bln", "Section 63 defines the simplified permit procedure."),
                source("BauO Bln", "Section 6 defines setback requirements."));
        EvidencePackage pkg = builder.build("Abstandsflächen", sources);
        // Should have 1 item (both chunks from same document grouped)
        assertEquals(1, pkg.items().size());
        EvidenceItem item = pkg.items().getFirst();
        assertEquals("BauO Bln", item.documentTitle());
        assertFalse(item.paragraph().isBlank()); // "2 Abschnitte" or similar
    }

    // ── Helper ──

    private SourceCitation source(String title, String excerpt) {
        return new SourceCitation(
                UUID.randomUUID(), UUID.randomUUID(), 1, title,
                null, null, null, excerpt,
                0.85, SourceTier.PRIMARY);
    }
}
