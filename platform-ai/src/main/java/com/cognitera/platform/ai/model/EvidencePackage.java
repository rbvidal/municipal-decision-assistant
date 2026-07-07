package com.cognitera.platform.ai.model;

import java.util.List;

/**
 * A structured evidence package containing all evidence items, contradiction
 * detection results, and coverage validation status. This replaces raw chunk
 * lists in the prompt — the LLM receives numbered evidence items to reason over.
 */
public record EvidencePackage(
        List<EvidenceItem> items,
        boolean hasInsufficientEvidence,
        List<Contradiction> contradictions,
        CoverageStatus coverageStatus,
        int totalDocumentsSearched,
        int relevantDocumentsFound,
        int documentsUsed
) {
    public EvidencePackage {
        items = items == null ? List.of() : List.copyOf(items);
        contradictions = contradictions == null ? List.of() : List.copyOf(contradictions);
    }

    public boolean hasContradictions() {
        return !contradictions.isEmpty();
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }

    /** Describes whether evidence coverage is sufficient. */
    public enum CoverageStatus {
        SUFFICIENT,
        PARTIAL,
        INSUFFICIENT
    }

    /** A detected contradiction between two or more documents. */
    public record Contradiction(
            String description,
            List<String> documentA,
            List<String> documentB,
            String recommendation
    ) {
        public Contradiction {
            documentA = documentA == null ? List.of() : List.copyOf(documentA);
            documentB = documentB == null ? List.of() : List.copyOf(documentB);
        }
    }
}
