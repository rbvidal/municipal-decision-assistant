package com.cognitera.platform.ai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;
import java.util.UUID;

/**
 * A single structured evidence item extracted from a retrieved document.
 * Carries the document metadata, the relevant excerpt, and what it supports.
 */
public record EvidenceItem(
        int index,
        UUID documentId,
        UUID chunkId,
        String documentTitle,
        String authority,
        String paragraph,       // e.g. "EG 9a Stufe 3" or "§ 6 Abs. 1"
        String excerpt,
        String supports,        // what claim/answer this evidence supports
        double confidence,
        NumericExtraction numericExtraction // structured numbers if any were found
) {
    public EvidenceItem {
        if (index < 1) throw new IllegalArgumentException("Evidence index must be >= 1");
    }

    /** Returns true if this evidence item contains structured numeric data. */
    @JsonIgnore
    public boolean hasNumericData() {
        return numericExtraction != null && !numericExtraction.isEmpty();
    }
}
