package com.cognitera.platform.ai.model;

import java.util.List;

/**
 * A single retrieval plan — one question, one plan, one execution.
 *
 * <p>Replaces the old recursive orchestration that launched targeted
 * retrieval cycles for "missing" source roles. Instead, classification
 * happens once, and retrieval executes exactly once.
 */
public record RetrievalPlan(
        Domain primaryDomain,
        Domain secondaryDomain,
        List<String> eligibleCollections,  // document categories to search
        List<String> eligibleAuthorities,  // authority names to prioritize
        String retrievalStrategy,          // HYBRID, KEYWORD, SEMANTIC, etc.
        int maxResults,
        int maxChunksPerDocument           // diversity constraint
) {
    public enum Domain {
        PROCUREMENT,
        BUILDING,
        HR,
        TRAVEL,
        GENERAL
    }

    public static RetrievalPlan forDomain(Domain domain, int maxResults, int maxChunksPerDoc) {
        return new RetrievalPlan(domain, null,
                eligibleCollections(domain),
                eligibleAuthorities(domain),
                "HYBRID", maxResults, maxChunksPerDoc);
    }

    public boolean isGeneralDomain() {
        return primaryDomain == Domain.GENERAL;
    }

    /** Returns the document categories eligible for this domain's search. */
    private static List<String> eligibleCollections(Domain domain) {
        return switch (domain) {
            case PROCUREMENT -> List.of(
                    "procurement-regulations", "internal-procedures", "manuals");
            case BUILDING -> List.of(
                    "building-regulations", "procedures", "forms",
                    "citizen-information", "manuals");
            case HR -> List.of(
                    "hr-regulations", "internal-procedures", "manuals");
            case TRAVEL -> List.of(
                    "hr-regulations", "internal-procedures");
            case GENERAL -> List.of(); // all categories
        };
    }

    /** Returns the authorities to prioritize for this domain. */
    private static List<String> eligibleAuthorities(Domain domain) {
        return switch (domain) {
            case PROCUREMENT -> List.of(
                    "Senatsverwaltung für Finanzen", "BMWK", "Bundeskartellamt");
            case BUILDING -> List.of(
                    "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen",
                    "Senatsverwaltung Berlin");
            case HR -> List.of(
                    "Senatsverwaltung für Inneres und Sport",
                    "Tarifgemeinschaft deutscher Länder", "BMI", "ITDZ Berlin");
            case TRAVEL -> List.of(
                    "Bundesministerium des Innern",
                    "Senatsverwaltung für Inneres und Sport");
            case GENERAL -> List.of();
        };
    }
}
