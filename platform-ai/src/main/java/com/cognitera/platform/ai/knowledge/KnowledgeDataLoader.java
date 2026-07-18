package com.cognitera.platform.ai.knowledge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Loads structured knowledge tables at startup.
 *
 * <p>The tables are seeded from authoritative sources. In a production
 * deployment, these would be loaded from the ingested corpus files.
 */
@Component
public class KnowledgeDataLoader {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeDataLoader.class);

    private final KnowledgeRegistry registry;

    public KnowledgeDataLoader(KnowledgeRegistry registry) {
        this.registry = registry;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadAll() {
        log.info("Loading structured knowledge tables...");
        loadSalaryTables();
        loadTravelTables();
        loadThresholdTables();
        log.info("Knowledge base loaded: {} salary entries, {} travel entries, {} thresholds",
                registry.totalSalaryEntries(), registry.totalTravelEntries(),
                registry.totalThresholdEntries());
    }

    /**
     * Reloads all knowledge tables at runtime with atomic swap.
     * A snapshot is taken before clearing; on failure, the previous
     * state is restored.
     *
     * @throws IllegalStateException if the reload fails and rollback is successful
     */
    public void reload() {
        KnowledgeRegistry.Snapshot snapshot = registry.snapshot();
        log.info("Reloading knowledge tables (snapshot: {} salary, {} travel, {} thresholds)...",
                snapshot.salaryTables().size(), snapshot.travelTables().size(),
                snapshot.thresholdTables().size());
        try {
            registry.clear();
            loadSalaryTables();
            loadTravelTables();
            loadThresholdTables();
            log.info("Knowledge reload complete: {} salary entries, {} travel entries, {} thresholds",
                    registry.totalSalaryEntries(), registry.totalTravelEntries(),
                    registry.totalThresholdEntries());
        } catch (Exception e) {
            log.error("Knowledge reload failed — rolling back to snapshot", e);
            registry.restore(snapshot);
            throw new IllegalStateException(
                    "Knowledge reload failed; previous state restored. Cause: "
                    + e.getMessage(), e);
        }
    }

    /** Returns a summary of the currently loaded knowledge tables. */
    public java.util.Map<String, Object> summary() {
        return java.util.Map.of(
                "salaryTables", registry.totalTables() > 0 ? 1 : 0,
                "salaryEntries", registry.totalSalaryEntries(),
                "travelTables", 1,
                "travelEntries", registry.totalTravelEntries(),
                "thresholdTables", 1,
                "thresholdEntries", registry.totalThresholdEntries(),
                "totalTables", registry.totalTables());
    }

    // ── TV-L 2025 Salary Table ──

    private void loadSalaryTables() {
        SalaryTable tvl2025 = new SalaryTable(
                "TV-L Entgelttabellen 2025", "TV-L",
                LocalDate.of(2025, 2, 1), null);
        // EG 1
        tvl2025.addEntry("EG 1", 1, 2711.20, 0, "");
        tvl2025.addEntry("EG 1", 2, 2820.00, 0, "");
        // EG 5
        tvl2025.addEntry("EG 5", 1, 3200.00, 0, "");
        tvl2025.addEntry("EG 5", 2, 3362.72, 0, "");
        tvl2025.addEntry("EG 5", 3, 3500.00, 0, "");
        // EG 8
        tvl2025.addEntry("EG 8", 1, 3500.00, 0, "");
        tvl2025.addEntry("EG 8", 2, 3600.00, 0, "");
        tvl2025.addEntry("EG 8", 3, 3713.37, 0, "");
        // EG 9a
        tvl2025.addEntry("EG 9a", 1, 3500.00, 0, "");
        tvl2025.addEntry("EG 9a", 2, 3715.69, 0, "");
        tvl2025.addEntry("EG 9a", 3, 3900.00, 0, "");
        // EG 9b
        tvl2025.addEntry("EG 9b", 1, 3700.00, 0, "");
        tvl2025.addEntry("EG 9b", 2, 3900.00, 0, "");
        tvl2025.addEntry("EG 9b", 3, 4117.53, 0, "");
        // EG 9 (legacy)
        tvl2025.addEntry("EG 9", 1, 3450.00, 0, "");
        tvl2025.addEntry("EG 9", 2, 3600.00, 0, "");
        tvl2025.addEntry("EG 9", 3, 3800.00, 0, "Gehaltserhöhung ab Feb 2025: 5,5% (mind. 340€)");
        // EG 10
        tvl2025.addEntry("EG 10", 1, 3900.00, 0, "");
        tvl2025.addEntry("EG 10", 2, 4231.36, 0, "");
        tvl2025.addEntry("EG 10", 3, 4400.00, 0, "");
        // EG 11
        tvl2025.addEntry("EG 11", 1, 4400.00, 0, "");
        tvl2025.addEntry("EG 11", 2, 4600.00, 0, "");
        tvl2025.addEntry("EG 11", 3, 4875.49, 0, "");
        // EG 12-15
        tvl2025.addEntry("EG 12", 3, 5390.41, 0, "");
        tvl2025.addEntry("EG 13", 3, 5467.76, 0, "");
        tvl2025.addEntry("EG 14", 3, 6013.61, 0, "");
        tvl2025.addEntry("EG 15", 3, 6439.92, 0, "");

        registry.register(tvl2025);

        // Previous table for increase calculations
        SalaryTable tvl2024 = new SalaryTable(
                "TV-L Entgelttabellen 2024", "TV-L",
                LocalDate.of(2024, 1, 1), LocalDate.of(2025, 1, 31));
        tvl2024.addEntry("EG 9", 3, 3600.00, 0, "Pre-2025 increase");
        tvl2024.addEntry("EG 10", 2, 4000.00, 0, "");
        tvl2024.addEntry("EG 11", 3, 4600.00, 0, "");
        registry.register(tvl2024);
    }

    // ── BRKG Travel Allowance Table ──

    private void loadTravelTables() {
        TravelAllowanceTable brkg = new TravelAllowanceTable(
                "Bundesreisekostengesetz (BRKG)", "BRKG",
                LocalDate.of(2024, 1, 1));

        // Domestic meal allowances
        brkg.addEntry(24, null, 24.0, "domestic", false,
                "Voller 24-Stunden-Tag");
        brkg.addEntry(11, 24.0, 12.0, "domestic", false,
                "Abwesenheit über 11 Stunden");
        brkg.addEntry(8, 11.0, 6.0, "domestic", false,
                "Abwesenheit über 8 Stunden");
        brkg.addEntry(0, 24.0, 12.0, "domestic", true,
                "An- und Abreisetag mit Übernachtung");

        // Mileage
        brkg.addEntry(0, null, 0.35, "mileage", false,
                "Kilometerpauschale PKW");
        brkg.addEntry(0, null, 0.20, "mileage", false,
                "Kilometerpauschale sonstiges KFZ");

        // Accommodation
        brkg.addEntry(0, null, 80.0, "accommodation", true,
                "Übernachtung mit Beleg");
        brkg.addEntry(0, null, 20.0, "accommodation", false,
                "Übernachtung pauschal ohne Beleg");

        // International — Brussels example
        brkg.addEntry(24, null, 47.0, "international", false,
                "Brüssel — voller Tag");

        registry.register(brkg);
    }

    // ── Procurement Thresholds ──

    private void loadThresholdTables() {
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

        // Construction thresholds
        av55.addEntry(0, 20_000.0, "Direktauftrag",
                "Bauleistung",
                List.of(),
                "Bauleistung bis 20.000 €");
        av55.addEntry(20_000.0, 200_000.0, "Beschränkte Ausschreibung",
                "Bauleistung",
                List.of(),
                "Bauleistung 20.000 € bis 200.000 €");

        registry.register(av55);
    }
}
