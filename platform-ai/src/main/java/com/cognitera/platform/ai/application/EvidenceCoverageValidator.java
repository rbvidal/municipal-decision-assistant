package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.model.EvidenceItem;
import com.cognitera.platform.ai.model.EvidencePackage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Validates that the LLM's generated answer actually references the retrieved
 * evidence and doesn't ignore highly relevant documents or numeric values.
 *
 * <p>If the answer fails coverage checks, the caller should abort generation
 * and retry with corrected evidence ordering.
 */
@Component
public class EvidenceCoverageValidator {

    private static final Logger log = LoggerFactory.getLogger(EvidenceCoverageValidator.class);

    /**
     * Result of evidence coverage validation.
     */
    public record CoverageResult(
            boolean passed,
            boolean topEvidenceReferenced,
            boolean allRelevantConsidered,
            boolean numericValuesPresent,
            List<String> missingDocumentTitles,
            List<String> missingNumericValues,
            String recommendation
    ) {
        public boolean needsRetry() {
            return !passed && (!topEvidenceReferenced || !allRelevantConsidered);
        }
    }

    /**
     * Validates that the LLM answer covers all critical evidence.
     *
     * @param answer   the LLM's generated answer text
     * @param evidence the evidence package used to generate the answer
     * @param query    the original user question
     * @return coverage validation result
     */
    public CoverageResult validate(String answer, EvidencePackage evidence, String query) {
        if (evidence.isEmpty()) {
            return new CoverageResult(true, true, true, true,
                    List.of(), List.of(), "No evidence to validate against.");
        }

        String answerLower = answer != null ? answer.toLowerCase() : "";
        List<String> missingDocs = new ArrayList<>();
        List<String> missingNumerics = new ArrayList<>();
        boolean topEvidenceReferenced = true;
        boolean allRelevantConsidered = true;
        boolean numericValuesPresent = true;

        // ── Check 1: Was the highest-ranked evidence referenced? ──
        if (!evidence.items().isEmpty()) {
            EvidenceItem top = evidence.items().getFirst();
            boolean topFound = isDocumentReferenced(answerLower, top);
            if (!topFound) {
                // Check by keywords from title
                String titleLower = top.documentTitle() != null
                        ? top.documentTitle().toLowerCase() : "";
                boolean keywordMatch = containsAnyWord(answerLower, titleLower);
                if (!keywordMatch) {
                    topEvidenceReferenced = false;
                    missingDocs.add(top.documentTitle());
                    log.warn("Top-ranked evidence NOT referenced: {}", top.documentTitle());
                }
            }
        }

        // ── Check 2: Was every highly relevant document considered? ──
        for (EvidenceItem item : evidence.items()) {
            if (item.confidence() < 0.6) continue; // Only check high-confidence items
            boolean found = isDocumentReferenced(answerLower, item);
            if (!found) {
                allRelevantConsidered = false;
                missingDocs.add(item.documentTitle());
                log.warn("High-confidence evidence NOT referenced: {} (confidence={})",
                        item.documentTitle(), String.format("%.2f", item.confidence()));
            }
        }

        // ── Check 3: Are important numeric values present? ──
        for (EvidenceItem item : evidence.items()) {
            if (item.numericExtraction() == null || item.numericExtraction().isEmpty()) continue;
            // Check money values
            for (var mv : item.numericExtraction().moneyValues()) {
                String amountStr = String.format(java.util.Locale.US, "%.2f", mv.amount())
                        .replaceAll("\\.?0+$", "");
                if (!answerLower.contains(amountStr) && !answerLower.contains(
                        String.format(java.util.Locale.GERMANY, "%.2f", mv.amount())
                                .replaceAll(",?0+$", ""))) {
                    missingNumerics.add(mv.amount() + " " + mv.currency() + " (" + mv.label() + ")");
                    numericValuesPresent = false;
                }
            }
            // Check salary grades
            for (var sg : item.numericExtraction().salaryGrades()) {
                if (sg.amount() > 0 && !answerLower.contains(
                        String.valueOf((int) sg.amount()))) {
                    missingNumerics.add(sg.grade() + " Stufe " + sg.step() + ": " +
                            String.format("%.2f €", sg.amount()));
                    numericValuesPresent = false;
                }
            }
        }

        boolean passed = topEvidenceReferenced && allRelevantConsidered && numericValuesPresent;

        String recommendation;
        if (passed) {
            recommendation = "All evidence covered.";
        } else {
            StringBuilder rec = new StringBuilder();
            if (!topEvidenceReferenced) rec.append("Top evidence not referenced. ");
            if (!allRelevantConsidered) rec.append(missingDocs.size() + " high-confidence document(s) not considered. ");
            if (!numericValuesPresent) rec.append(missingNumerics.size() + " numeric value(s) not in answer. ");
            rec.append("Regenerate with corrected evidence ordering.");
            recommendation = rec.toString();
        }

        log.info("Evidence coverage: passed={}, topRef={}, allRel={}, numsPresent={}, missingDocs={}, missingNums={}",
                passed, topEvidenceReferenced, allRelevantConsidered, numericValuesPresent,
                missingDocs.size(), missingNumerics.size());

        return new CoverageResult(passed, topEvidenceReferenced, allRelevantConsidered,
                numericValuesPresent, missingDocs, missingNumerics, recommendation);
    }

    /**
     * Checks whether a document title or its key terms appear in the answer.
     */
    private boolean isDocumentReferenced(String answerLower, EvidenceItem item) {
        if (item.documentTitle() == null) return false;
        String titleLower = item.documentTitle().toLowerCase();
        // Direct mention
        if (answerLower.contains(titleLower)) return true;
        // Key unique words from title (words > 3 chars)
        String[] words = titleLower.split("\\W+");
        int uniqueWordsFound = 0;
        for (String word : words) {
            if (word.length() > 3 && answerLower.contains(word)) {
                uniqueWordsFound++;
            }
        }
        return uniqueWordsFound >= 2;
    }

    private boolean containsAnyWord(String text, String source) {
        for (String word : source.split("\\W+")) {
            if (word.length() > 3 && text.contains(word)) return true;
        }
        return false;
    }
}
