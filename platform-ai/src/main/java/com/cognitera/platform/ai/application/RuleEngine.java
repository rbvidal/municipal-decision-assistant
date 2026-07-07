package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.knowledge.*;
import com.cognitera.platform.ai.model.NumericExtraction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Deterministic rule engine powered by structured knowledge tables.
 *
 * <p>All data comes from the {@link KnowledgeRegistry}, loaded at startup
 * by {@link KnowledgeDataLoader}. No hardcoded maps.</p>
 *
 * <p>The LLM should EXPLAIN results, not DETERMINE them. This engine handles:
 * <ul>
 *   <li>Procurement threshold checks</li>
 *   <li>Travel expense calculations</li>
 *   <li>Salary grade lookups</li>
 *   <li>Date-based effective comparisons</li>
 * </ul>
 */
@Component
public class RuleEngine {

    private static final Logger log = LoggerFactory.getLogger(RuleEngine.class);

    private final KnowledgeRegistry registry;

    public RuleEngine(KnowledgeRegistry registry) {
        this.registry = registry;
    }

    /** Result of a deterministic rule evaluation. */
    public record RuleResult(
            String rule,
            boolean deterministic,
            String result,
            Map<String, Object> details
    ) {}

    /**
     * Evaluates a procurement question deterministically.
     *
     * @param amount  the procurement amount in EUR
     * @param context text describing what is being procured (to determine type)
     * @return the rule result with applicable thresholds and procedure
     */
    public RuleResult evaluateProcurement(double amount, String context) {
        String type = detectProcurementType(context);
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("betrag", String.format(java.util.Locale.US, "%.2f €", amount));

        var tableOpt = registry.findThresholdTable("AV §55 LHO");
        String procedure;
        List<String> requirements = new ArrayList<>();

        if (tableOpt.isPresent()) {
            var table = tableOpt.get();
            var entryOpt = table.lookup(amount, type);
            if (entryOpt.isPresent()) {
                var entry = entryOpt.get();
                procedure = entry.procedure();
                requirements.addAll(entry.requirements());
                details.put("quelle", table.sourceDocument());
                details.put("kategorie", entry.category());
            } else {
                procedure = "Öffentliche Ausschreibung oder EU-weites Verfahren";
                requirements.add("EU-Schwellenwerte prüfen");
            }
        } else {
            procedure = "Keine Schwellenwerttabelle verfügbar";
            requirements.add("Manuelle Prüfung erforderlich");
        }

        details.put("verfahren", procedure);
        details.put("anforderungen", requirements);
        return new RuleResult("procurement-threshold", true,
                procedure + ". " + String.join(" ", requirements), details);
    }

    public RuleResult evaluateTravelExpense(double hours, boolean overnightStay) {
        var tableOpt = registry.findTravelTable("BRKG");
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("stunden", hours);

        if (tableOpt.isPresent()) {
            var table = tableOpt.get();
            var entryOpt = table.lookup(hours, overnightStay, "domestic");
            if (entryOpt.isPresent()) {
                var entry = entryOpt.get();
                details.put("tagegeld", entry.allowanceEur() + " €");
                details.put("regel", entry.description());
                details.put("quelle", table.sourceDocument());
                if (overnightStay) {
                    table.accommodationAllowance(true)
                            .ifPresent(a -> details.put("übernachtung", a + " € mit Beleg"));
                }
                return new RuleResult("travel-expense", true,
                        "Tagegeld: " + entry.allowanceEur() + " € (" + entry.description() + ")",
                        details);
            }
        }
        return new RuleResult("travel-expense", false,
                "Keine Reisekostentabelle verfügbar. Manuelle Prüfung erforderlich.", details);
    }

    /**
     * Maps a salary grade question to the TV-L pay tables data for the LLM to explain.
     * Note: The LLM never calculates — we extract the grade amd provide the extracted numbers.
     */
    public RuleResult evaluateSalaryQuery(String query, List<NumericExtraction> extractions) {
        // Collect all salary grades from evidence
        List<Map<String, Object>> foundGrades = new ArrayList<>();
        for (NumericExtraction ext : extractions) {
            for (NumericExtraction.SalaryGrade sg : ext.salaryGrades()) {
                Map<String, Object> g = new LinkedHashMap<>();
                g.put("grade", sg.grade());
                g.put("step", sg.step());
                g.put("amount", sg.amount());
                g.put("effectiveDate", sg.effectiveDate());
                foundGrades.add(g);
            }
        }

        // Detect what the user is asking about (increase, lookup, comparison)
        boolean isIncreaseQuery = query.toLowerCase().matches(".*(erhöhung|steigerung|mehr|differenz|änderung).*");
        String context = isIncreaseQuery ? "Gehaltserhöhung" : "Gehaltsauskunft";

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("gefundeneStufen", foundGrades);
        details.put("typ", context);

        return new RuleResult("salary-query", false,
                foundGrades.size() + " Gehaltsstufen gefunden. LLM erklärt.", details);
    }

    private String detectProcurementType(String context) {
        String lower = context.toLowerCase();
        if (hasAny(lower, "bau", "bauleistung", "gebäude", "sanierung")) return "Bauleistung";
        if (hasAny(lower, "it", "software", "hardware", "computer")) return "IT-Dienstleistung";
        return "Lieferung/Dienstleistung";
    }

    private boolean hasAny(String text, String... terms) {
        for (String t : terms) if (text.contains(t)) return true;
        return false;
    }
}
