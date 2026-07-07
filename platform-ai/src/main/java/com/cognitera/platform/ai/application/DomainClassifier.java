package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.model.RetrievalPlan.Domain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Weighted domain classifier. Every query receives exactly one primary
 * domain. Optionally one secondary domain. Never GENERAL unless
 * confidence is very low.
 *
 * <p>Replaces the old keyword-heuristic approach with weighted term scoring.
 */
@Component
public class DomainClassifier {

    private static final Logger log = LoggerFactory.getLogger(DomainClassifier.class);

    // ── Weighted domain terms ──
    // Format: term → weight (higher = stronger signal)
    private static final Map<String, Double> PROCUREMENT_TERMS = new LinkedHashMap<>();
    private static final Map<String, Double> BUILDING_TERMS = new LinkedHashMap<>();
    private static final Map<String, Double> HR_TERMS = new LinkedHashMap<>();
    private static final Map<String, Double> TRAVEL_TERMS = new LinkedHashMap<>();

    static {
        // Procurement — highest-weight terms
        putAll(PROCUREMENT_TERMS,
                10.0, "beschaffung", "vergabeverfahren", "direktauftrag",
                "direktaufträge", "ausschreibung", "beschränkte ausschreibung",
                "verhandlungsvergabe", "vergaberecht", "vergabevermerk",
                "angebotsvergleich");
        putAll(PROCUREMENT_TERMS,
                8.0, "vergabe", "vergab", "beschaffen", "rahmenvertrag",
                "lieferung", "einkauf", "lieferant", "auftragswert",
                "schwellenwert", "wertgrenzen", "gwb", "vgv", "uvgo", "vob", "berlavg",
                "lho");
        putAll(PROCUREMENT_TERMS,
                5.0, "auftrag", "freihändig", "angebot", "vertrag",
                "ausschreiben", "vergabestelle", "beschaffungs",
                "it-auftrag", "rahmenvereinbarung", "bieter");

        // Building
        putAll(BUILDING_TERMS,
                10.0, "baugenehmigung", "baugenehmigungsverfahren",
                "bauantrag", "bauvoranfrage", "bauvorlageberechtigung");
        putAll(BUILDING_TERMS,
                8.0, "abstandsfläche", "abstandsflächen", "bebauungsplan",
                "bauordnungsrecht", "baulast", "einfamilienhaus",
                "carport", "garage", "wohngebäude", "baunvo",
                "bauvorlv", "bauo", "baugb");
        putAll(BUILDING_TERMS,
                5.0, "bau", "erschließung", "nutzungsänderung",
                "vorbescheid", "teilungsgenehmigung", "grenzbebauung",
                "geschossflächenzahl", "grundflächenzahl");

        // HR
        putAll(HR_TERMS,
                10.0, "tv-l", "entgeltgruppe", "tarifvertrag",
                "urlvo", "urlaubsverordnung", "elternzeit");
        putAll(HR_TERMS,
                8.0, "urlaub", "erholungsurlaub", "sonderurlaub",
                "arbeitszeit", "azvo", "kernarbeitszeit", "gleitzeit",
                "homeoffice", "mobiles arbeiten", "teilzeit",
                "kündigung", "befristung", "personalrat",
                "dienstvereinbarung", "stellenausschreibung");
        putAll(HR_TERMS,
                5.0, "gehalt", "entgelt", "vergütung", "lohn",
                "beurteilung", "beförderung", "eg ", "stufe");

        // Travel
        putAll(TRAVEL_TERMS,
                10.0, "dienstreise", "reisekosten", "tagegeld",
                "verpflegungspauschale", "übernachtungspauschale",
                "brkg", "lrkg", "trennungsgeld", "umzugskosten");
        putAll(TRAVEL_TERMS,
                8.0, "kilometerpauschale", "reisetag", "abwesenheit",
                "dienstreiseantrag", "reisekostenabrechnung");
        putAll(TRAVEL_TERMS,
                5.0, "hotel", "übernachtung", "kilometer",
                "reise", "fahrtkosten", "bahn", "flug");
    }

    /** Result of domain classification. */
    public record DomainResult(
            Domain primary,
            double primaryConfidence,
            Domain secondary,
            double secondaryConfidence,
            Map<Domain, Double> allScores
    ) {
        public boolean isStrong() { return primaryConfidence >= 0.7; }
        public boolean isConfident() { return primaryConfidence >= 0.4; }
    }

    /**
     * Classifies a query into exactly one primary domain.
     * Never returns GENERAL unless confidence is below threshold.
     */
    public DomainResult classify(String query) {
        String lower = query.toLowerCase().trim();

        double procurementScore = score(lower, PROCUREMENT_TERMS);
        double buildingScore = score(lower, BUILDING_TERMS);
        double hrScore = score(lower, HR_TERMS);
        double travelScore = score(lower, TRAVEL_TERMS);

        // Normalize scores to 0–1 range
        Map<Domain, Double> raw = new LinkedHashMap<>();
        raw.put(Domain.PROCUREMENT, procurementScore);
        raw.put(Domain.BUILDING, buildingScore);
        raw.put(Domain.HR, hrScore);
        raw.put(Domain.TRAVEL, travelScore);

        double max = raw.values().stream().max(Double::compareTo).orElse(0.0);
        Map<Domain, Double> normalized = new LinkedHashMap<>();
        for (var entry : raw.entrySet()) {
            normalized.put(entry.getKey(), max > 0 ? entry.getValue() / max : 0.0);
        }

        // Find primary and secondary
        List<Map.Entry<Domain, Double>> sorted = normalized.entrySet().stream()
                .sorted(Map.Entry.<Domain, Double>comparingByValue().reversed())
                .toList();

        Domain primary = Domain.GENERAL;
        double primaryConf = 0.0;
        Domain secondary = null;
        double secondaryConf = 0.0;

        if (!sorted.isEmpty()) {
            var first = sorted.get(0);
            if (first.getValue() >= 0.15) { // minimum confidence threshold
                primary = first.getKey();
                primaryConf = first.getValue();
            }
            if (sorted.size() > 1 && sorted.get(1).getValue() >= 0.20) {
                secondary = sorted.get(1).getKey();
                secondaryConf = sorted.get(1).getValue();
            }
        }

        DomainResult result = new DomainResult(primary, primaryConf, secondary, secondaryConf, normalized);
        log.info("Domain: {} ({:.2f}) | secondary: {} ({:.2f}) | scores: {}",
                result.primary, result.primaryConfidence,
                result.secondary, result.secondaryConfidence,
                result.allScores);
        return result;
    }

    /** Quick domain detection for reranker compatibility. */
    public Domain classifySimple(String query) {
        return classify(query).primary();
    }

    private double score(String query, Map<String, Double> terms) {
        double total = 0.0;
        for (var entry : terms.entrySet()) {
            if (query.contains(entry.getKey())) {
                total += entry.getValue();
            }
        }
        return total;
    }

    @SafeVarargs
    private static void putAll(Map<String, Double> map, double weight, String... terms) {
        for (String t : terms) map.put(t, weight);
    }
}
