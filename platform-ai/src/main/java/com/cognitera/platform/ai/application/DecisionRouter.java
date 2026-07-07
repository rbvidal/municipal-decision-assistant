package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.knowledge.*;
import com.cognitera.platform.ai.model.DecisionResult;
import com.cognitera.platform.ai.model.DecisionStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Routes every question to exactly one execution strategy.
 *
 * <p>Rule-first: if the question can be answered by the RuleEngine,
 * retrieval is SKIPPED entirely. Only pure legal reasoning questions
 * proceed to the full hybrid retrieval pipeline.
 */
@Component
public class DecisionRouter {

    private static final Logger log = LoggerFactory.getLogger(DecisionRouter.class);

    private final KnowledgeRegistry registry;
    private final DomainClassifier domainClassifier;

    public DecisionRouter(KnowledgeRegistry registry, DomainClassifier domainClassifier) {
        this.registry = registry;
        this.domainClassifier = domainClassifier;
    }

    /** Result of routing — either a rule-engine decision or a strategy for retrieval. */
    public record RoutingResult(
            DecisionStrategy strategy,
            DecisionResult decision,
            String explanation
    ) {
        public boolean isRuleEngine() { return strategy == DecisionStrategy.RULE_ENGINE; }
        public boolean needsRetrieval() {
            return strategy == DecisionStrategy.HYBRID_RETRIEVAL
                    || strategy == DecisionStrategy.GRAPH_REASONING;
        }
    }

    /**
     * Routes a question to the appropriate strategy.
     * If the question is rule-answerable, returns a DecisionResult.
     * Otherwise, returns the strategy for retrieval.
     */
    public RoutingResult route(String question) {
        String lower = question.toLowerCase().trim();
        var domain = domainClassifier.classify(question);

        // ── Salary lookup ──
        if (isSalaryQuery(lower)) {
            var result = trySalaryLookup(lower);
            if (result != null) {
                log.info("DecisionRouter → RULE_ENGINE (salary)");
                return new RoutingResult(DecisionStrategy.RULE_ENGINE, result,
                        "Salary lookup via structured TV-L table");
            }
        }

        // ── Travel allowance ──
        if (isTravelQuery(lower)) {
            var result = tryTravelLookup(lower, domain);
            if (result != null) {
                log.info("DecisionRouter → RULE_ENGINE (travel)");
                return new RoutingResult(DecisionStrategy.RULE_ENGINE, result,
                        "Travel allowance lookup via structured BRKG table");
            }
        }

        // ── Procurement threshold ──
        if (isProcurementQuery(lower)) {
            var result = tryProcurementLookup(lower);
            if (result != null) {
                log.info("DecisionRouter → RULE_ENGINE (procurement)");
                return new RoutingResult(DecisionStrategy.RULE_ENGINE, result,
                        "Procurement threshold lookup via structured AV §55 LHO table");
            }
        }

        // ── Fallback: retrieval ──
        log.info("DecisionRouter → HYBRID_RETRIEVAL (domain={})", domain.primary());
        return new RoutingResult(DecisionStrategy.HYBRID_RETRIEVAL, null,
                "No deterministic rule matches — full retrieval required");
    }

    // ── Classification ──

    private boolean isSalaryQuery(String q) {
        return hasAny(q, "gehalt", "entgelt", "vergütung", "lohn", "tv-l", "tvö",
                "eg ", "entgeltgruppe", "stufe", "tarifvertrag")
                && containsPattern(q, "eg\\s*\\d+[a-z]?");
    }

    private boolean isTravelQuery(String q) {
        return hasAny(q, "dienstreise", "reisekosten", "tagegeld", "verpflegung",
                "verpflegungspauschale", "übernachtungspauschale",
                "kilometerpauschale", "brkg", "lrkg")
                && containsPattern(q, "\\d+[\\s-]*(stündig|stunden|stündige|stündiger)");
    }

    private boolean isProcurementQuery(String q) {
        return hasAny(q, "beschaffung", "vergabe", "direktauftrag", "ausschreibung",
                "freihändig", "auftrag", "einkauf")
                && containsPattern(q, "\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?\\s*(€|euro|eur)");
    }

    // ── Lookups ──

    private DecisionResult trySalaryLookup(String q) {
        var grades = extractGrades(q);
        if (grades.isEmpty()) return null;
        var table = registry.findSalaryTable("TV-L");
        if (table.isEmpty()) return null;

        for (String[] g : grades) {
            String grade = g[0];
            int step = g.length > 1 ? Integer.parseInt(g[1]) : 3;
            var entry = table.get().lookup(grade, step);
            if (entry.isPresent()) {
                var e = entry.get();
                return new DecisionResult.SalaryDecision(
                        e.grade() + " Stufe " + e.step() + " = " +
                                String.format(java.util.Locale.US, "%.2f", e.monthlyAmount()) + " €",
                        "TV-L Entgelttabelle 2025, gültig ab 01.02.2025",
                        table.get().sourceDocument(),
                        0.99, e.grade(), e.step(), e.monthlyAmount(),
                        table.get().payScale(),
                        table.get().effectiveFrom().toString(),
                        "Tarifgemeinschaft deutscher Länder (TdL)");
            }
        }
        return null;
    }

    private DecisionResult tryTravelLookup(String q,
            DomainClassifier.DomainResult domain) {
        var hours = extractHours(q);
        if (hours.isEmpty()) return null;
        double h = hours.get();
        boolean overnight = q.contains("übernachtung") || q.contains("übernacht");

        var table = registry.findTravelTable("BRKG");
        if (table.isEmpty()) return null;

        var entry = table.get().lookup(h, overnight, "domestic");
        if (entry.isPresent()) {
            var e = entry.get();
            return new DecisionResult.TravelDecision(
                    "Tagegeld: " + String.format(java.util.Locale.US, "%.0f", e.allowanceEur())
                            + " € (" + e.description() + ")",
                    "BRKG Verpflegungspauschale Inland, gültig ab 01.01.2024",
                    table.get().sourceDocument(),
                    0.99, h, e.allowanceEur(), e.category(),
                    e.description(),
                    table.get().effectiveFrom().toString(),
                    "Bundesministerium des Innern");
        }
        return null;
    }

    private DecisionResult tryProcurementLookup(String q) {
        var amounts = extractAmounts(q);
        if (amounts.isEmpty()) return null;
        double amount = amounts.get(0);

        String type = "Lieferung/Dienstleistung";
        if (hasAny(q, "bau", "bauleistung", "gebäude")) type = "Bauleistung";
        if (hasAny(q, "it", "software", "hardware")) type = "IT-Dienstleistung";

        var table = registry.findThresholdTable("AV §55 LHO");
        if (table.isEmpty()) return null;

        var entry = table.get().lookup(amount, type);
        if (entry.isPresent()) {
            var e = entry.get();
            return new DecisionResult.ProcurementDecision(
                    e.procedure() + ". " + String.join("; ", e.requirements()),
                    e.notes(),
                    table.get().sourceDocument(),
                    0.98, amount, e.procedure(), e.requirements(),
                    e.category(),
                    table.get().effectiveFrom().toString(),
                    "Senatsverwaltung für Finanzen");
        }
        return null;
    }

    // ── Extraction helpers ──

    private List<String[]> extractGrades(String text) {
        List<String[]> results = new ArrayList<>();
        var m = java.util.regex.Pattern.compile(
                "EG\\s*(\\d+[a-z]?)\\s*(?:Stufe\\s*(\\d+))?",
                java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
        while (m.find()) {
            String grade = "EG " + m.group(1);
            String step = m.group(2) != null ? m.group(2) : "3";
            results.add(new String[]{grade, step});
        }
        return results;
    }

    private Optional<Double> extractHours(String text) {
        var m = java.util.regex.Pattern.compile(
                "(\\d+)[\\s-]*(stündig|stunden|stündige|stündiger|h)",
                java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
        return m.find() ? Optional.of(Double.parseDouble(m.group(1))) : Optional.empty();
    }

    private List<Double> extractAmounts(String text) {
        List<Double> amounts = new ArrayList<>();
        var m = java.util.regex.Pattern.compile(
                "(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)\\s*(€|Euro|EUR)",
                java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
        while (m.find()) {
            try {
                amounts.add(Double.parseDouble(m.group(1).replace(".", "").replace(",", ".")));
            } catch (NumberFormatException ignored) {}
        }
        return amounts;
    }

    private boolean hasAny(String text, String... terms) {
        for (String t : terms) if (text.contains(t)) return true;
        return false;
    }

    private boolean containsPattern(String text, String regex) {
        return java.util.regex.Pattern.compile(regex,
                java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text).find();
    }
}
