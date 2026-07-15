package com.cognitera.platform.ai.unit.knowledge;

import com.cognitera.platform.ai.knowledge.ThresholdTable;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for procurement category normalization and threshold lookup.
 * IT-related categories must normalize to Lieferung/Dienstleistung
 * so they match the structured threshold table.
 */
class ThresholdTableTest {

    // ── Category normalization ──

    @Test
    void shouldNormalizeITDienstleistungToLieferungDienstleistung() {
        assertEquals("Lieferung/Dienstleistung",
                ThresholdTable.normalizeCategory("IT-Dienstleistung"));
    }

    @Test
    void shouldNormalizeITAuftragToLieferungDienstleistung() {
        assertEquals("Lieferung/Dienstleistung",
                ThresholdTable.normalizeCategory("IT-Auftrag"));
    }

    @Test
    void shouldNormalizeSoftwareToLieferungDienstleistung() {
        assertEquals("Lieferung/Dienstleistung",
                ThresholdTable.normalizeCategory("Software"));
    }

    @Test
    void shouldNormalizeSoftwareentwicklungToLieferungDienstleistung() {
        assertEquals("Lieferung/Dienstleistung",
                ThresholdTable.normalizeCategory("Softwareentwicklung"));
    }

    @Test
    void shouldNormalizeCloudToLieferungDienstleistung() {
        assertEquals("Lieferung/Dienstleistung",
                ThresholdTable.normalizeCategory("Cloud"));
    }

    @Test
    void shouldNormalizeITBeratungToLieferungDienstleistung() {
        assertEquals("Lieferung/Dienstleistung",
                ThresholdTable.normalizeCategory("IT-Beratung"));
    }

    @Test
    void shouldNormalizeBauToBauleistung() {
        assertEquals("Bauleistung",
                ThresholdTable.normalizeCategory("Bau"));
    }

    @Test
    void shouldKeepBauleistungUnchanged() {
        assertEquals("Bauleistung",
                ThresholdTable.normalizeCategory("Bauleistung"));
    }

    @Test
    void shouldKeepLieferungDienstleistungUnchanged() {
        assertEquals("Lieferung/Dienstleistung",
                ThresholdTable.normalizeCategory("Lieferung/Dienstleistung"));
    }

    @Test
    void shouldReturnNullForNullInput() {
        assertNull(ThresholdTable.normalizeCategory(null));
    }

    // ── Lookup with IT categories ──

    @Test
    void shouldMatchITQueryAgainstLieferungDienstleistungThresholds() {
        var table = createAv55Table();

        // 18.000 € IT-Dienstleistung → Beschränkte Ausschreibung (10k-100k)
        var entry = table.lookup(18_000.0, ThresholdTable.normalizeCategory("IT-Dienstleistung"));
        assertTrue(entry.isPresent());
        assertEquals("Beschränkte Ausschreibung", entry.get().procedure());
    }

    @Test
    void shouldMatchSoftwareQueryAgainstLieferungDienstleistungThresholds() {
        var table = createAv55Table();

        // 800 € Software → Direktauftrag mit Genehmigung (500-1000)
        var entry = table.lookup(800.0, ThresholdTable.normalizeCategory("Software"));
        assertTrue(entry.isPresent());
        assertEquals("Direktauftrag mit Genehmigung", entry.get().procedure());
    }

    @Test
    void shouldMatchITBeratungAtHighAmount() {
        var table = createAv55Table();

        // 150.000 € IT-Beratung → Öffentliche Ausschreibung (100k+)
        var entry = table.lookup(150_000.0, ThresholdTable.normalizeCategory("IT-Beratung"));
        assertTrue(entry.isPresent());
        assertEquals("Öffentliche Ausschreibung / EU-weit", entry.get().procedure());
    }

    @Test
    void shouldMatchCloudAtLowAmount() {
        var table = createAv55Table();

        // 300 € Cloud → Kein formelles Verfahren (0-500)
        var entry = table.lookup(300.0, ThresholdTable.normalizeCategory("Cloud"));
        assertTrue(entry.isPresent());
        assertEquals("Kein formelles Verfahren", entry.get().procedure());
    }

    @Test
    void shouldMatchBauQueryAgainstBauleistungThresholds() {
        var table = createAv55Table();

        // 15.000 € Bau → Direktauftrag (0-20k for Bauleistung)
        var entry = table.lookup(15_000.0, ThresholdTable.normalizeCategory("Bau"));
        assertTrue(entry.isPresent());
        assertEquals("Direktauftrag", entry.get().procedure());
        assertEquals("Bauleistung", entry.get().category());
    }

    // ── Without normalization (regression guard) ──

    @Test
    void shouldMatchStandardLieferungDienstleistung() {
        var table = createAv55Table();

        var entry = table.lookup(5_000.0, "Lieferung/Dienstleistung");
        assertTrue(entry.isPresent());
        assertEquals("Direktauftrag", entry.get().procedure());
    }

    @Test
    void shouldMatchStandardBauleistung() {
        var table = createAv55Table();

        var entry = table.lookup(50_000.0, "Bauleistung");
        assertTrue(entry.isPresent());
        assertEquals("Beschränkte Ausschreibung", entry.get().procedure());
    }

    // ── Helper ──

    private ThresholdTable createAv55Table() {
        ThresholdTable table = new ThresholdTable(
                "AV zu Paragraph 55 LHO Berlin", "AV §55 LHO",
                LocalDate.of(2024, 1, 1));

        table.addEntry(0, 500.0, "Kein formelles Verfahren",
                "Lieferung/Dienstleistung",
                List.of("Keine Genehmigung erforderlich"),
                "Unter 500 €");
        table.addEntry(500.0, 1000.0, "Direktauftrag mit Genehmigung",
                "Lieferung/Dienstleistung",
                List.of("Schriftliche Genehmigung der Führungskraft"),
                "500 € bis 1.000 €");
        table.addEntry(1000.0, 10_000.0, "Direktauftrag",
                "Lieferung/Dienstleistung",
                List.of("Vergabevermerk erforderlich", "Drei Vergleichsangebote (ab 500 €)"),
                "1.000 € bis 10.000 €");
        table.addEntry(10_000.0, 100_000.0, "Beschränkte Ausschreibung",
                "Lieferung/Dienstleistung",
                List.of("Ex-post-Veröffentlichung (ab 25.000 €)"),
                "10.000 € bis 100.000 €");
        table.addEntry(100_000.0, null, "Öffentliche Ausschreibung / EU-weit",
                "Lieferung/Dienstleistung",
                List.of("EU-Schwellenwerte prüfen"),
                "Ab 100.000 €");
        table.addEntry(0, 20_000.0, "Direktauftrag",
                "Bauleistung",
                List.of(),
                "Bauleistung bis 20.000 €");
        table.addEntry(20_000.0, 200_000.0, "Beschränkte Ausschreibung",
                "Bauleistung",
                List.of(),
                "Bauleistung 20.000 € bis 200.000 €");

        return table;
    }
}
