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

        if (totalDocumentsSearched < 0) {
            throw new IllegalArgumentException("totalDocumentsSearched must be >= 0");
        }
        if (relevantDocumentsFound < 0) {
            throw new IllegalArgumentException("relevantDocumentsFound must be >= 0");
        }
        if (documentsUsed < 0) {
            throw new IllegalArgumentException("documentsUsed must be >= 0");
        }
        if (relevantDocumentsFound > totalDocumentsSearched) {
            throw new IllegalArgumentException(
                    "relevantDocumentsFound (" + relevantDocumentsFound
                    + ") must not exceed totalDocumentsSearched ("
                    + totalDocumentsSearched + ")");
        }
        if (documentsUsed > relevantDocumentsFound) {
            throw new IllegalArgumentException(
                    "documentsUsed (" + documentsUsed
                    + ") must not exceed relevantDocumentsFound ("
                    + relevantDocumentsFound + ")");
        }
        if (hasInsufficientEvidence && coverageStatus == CoverageStatus.SUFFICIENT) {
            throw new IllegalArgumentException(
                    "hasInsufficientEvidence cannot be true when coverageStatus is SUFFICIENT");
        }
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
