package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.model.NumericExtraction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic rule engine for municipal decision-making.
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

    // ── Procurement Thresholds (Berlin, per AV §55 LHO) ──
    private static final Map<String, Double> PROCUREMENT_THRESHOLDS = Map.ofEntries(
            Map.entry("Direktauftrag_Lieferung", 10_000.0),
            Map.entry("Direktauftrag_Bauleistung", 20_000.0),
            Map.entry("Direktauftrag_sonstige_Bauleistung", 50_000.0),
            Map.entry("Beschraenkte_Ausschreibung_Lieferung", 100_000.0),
            Map.entry("Beschraenkte_Ausschreibung_Bauleistung", 200_000.0),
            Map.entry("Beschraenkte_Ausschreibung_sonstige_Bau", 500_000.0),
            Map.entry("Genehmigungspflicht_Beschaffung", 500.0),
            Map.entry("Genehmigungspflicht_schriftlich", 1_000.0),
            Map.entry("Vergabevermerk_Pflicht", 1_000.0),
            Map.entry("Drei_Angebote_Pflicht", 500.0),
            Map.entry("Ex_post_Veroeffentlichung", 25_000.0)
    );

    // ── Travel Expense Rates (BRKG 2024) ──
    private static final Map<String, Double> TRAVEL_ALLOWANCES = Map.of(
            "ab_8_stunden", 6.0,
            "ab_11_stunden", 12.0,
            "voll_24_stunden", 24.0,
            "an_abreisetag_uebernachtung", 12.0,
            "kilometerpauschale", 0.35,
            "uebernachtung_mit_beleg", 80.0,
            "uebernachtung_pauschal", 20.0
    );

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

        // Determine which thresholds apply
        String procedure;
        List<String> requirements = new ArrayList<>();
        List<String> applicableThresholds = new ArrayList<>();

        if (amount <= PROCUREMENT_THRESHOLDS.get("Genehmigungspflicht_Beschaffung")) {
            procedure = "Kein formelles Verfahren erforderlich";
            requirements.add("Keine Genehmigung erforderlich (unter 500 €)");
        } else if (amount <= PROCUREMENT_THRESHOLDS.get("Genehmigungspflicht_schriftlich")) {
            procedure = "Direktauftrag mit Genehmigung";
            requirements.add("Schriftliche Genehmigung der Führungskraft erforderlich");
            requirements.add("Betrag zwischen 500 € und 1.000 €");
        } else if (amount <= PROCUREMENT_THRESHOLDS.get("Direktauftrag_Lieferung")) {
            procedure = "Direktauftrag";
            requirements.add("Vergabevermerk erforderlich (über 1.000 €)");
            if (amount > PROCUREMENT_THRESHOLDS.get("Drei_Angebote_Pflicht")) {
                requirements.add("Drei Vergleichsangebote einholen (über 500 €)");
            }
        } else if (amount <= PROCUREMENT_THRESHOLDS.get("Beschraenkte_Ausschreibung_Lieferung")) {
            procedure = "Beschränkte Ausschreibung (Lieferungen/Dienstleistungen)";
            requirements.add("Ex-post-Veröffentlichung erforderlich (ab 25.000 €)");
        } else {
            procedure = "Öffentliche Ausschreibung oder EU-weites Verfahren";
            requirements.add("EU-Schwellenwerte prüfen");
        }

        details.put("verfahren", procedure);
        details.put("anforderungen", requirements);
        details.put("schwellenwerte", applicableThresholds);

        return new RuleResult("procurement-threshold", true,
                procedure + ". " + String.join(" ", requirements), details);
    }

    /**
     * Calculates travel expense allowance based on absence duration.
     */
    public RuleResult evaluateTravelExpense(double hours, boolean overnightStay) {
        double allowance;
        String rule;
        if (hours >= 24) {
            allowance = TRAVEL_ALLOWANCES.get("voll_24_stunden");
            rule = "voller 24-Stunden-Tag";
        } else if (hours >= 11) {
            allowance = TRAVEL_ALLOWANCES.get("ab_11_stunden");
            rule = "Abwesenheit über 11 Stunden";
        } else if (hours >= 8) {
            allowance = TRAVEL_ALLOWANCES.get("ab_8_stunden");
            rule = "Abwesenheit über 8 Stunden";
        } else {
            allowance = 0;
            rule = "Kein Tagegeld (unter 8 Stunden)";
        }

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("stunden", hours);
        details.put("tagegeld", allowance + " €");
        details.put("regel", rule);

        if (overnightStay) {
            details.put("übernachtung", TRAVEL_ALLOWANCES.get("uebernachtung_mit_beleg") + " € (mit Beleg)");
        }

        return new RuleResult("travel-expense", true,
                "Tagegeld: " + allowance + " € (" + rule + ")", details);
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
