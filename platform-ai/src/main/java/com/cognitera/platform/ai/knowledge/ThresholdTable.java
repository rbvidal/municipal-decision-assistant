package com.cognitera.platform.ai.knowledge;

import java.time.LocalDate;
import java.util.*;

/**
 * Structured procurement threshold table for deterministic lookup.
 *
 * <p>Supports queries like:
 * "Can an IT contract of €18,000 be awarded directly?"
 */
public class ThresholdTable {

    private final String sourceDocument;
    private final String regulation; // "AV §55 LHO", "GWB", "VgV", etc.
    private final LocalDate effectiveFrom;
    private final List<ThresholdEntry> entries = new ArrayList<>();

    public ThresholdTable(String sourceDocument, String regulation,
                            LocalDate effectiveFrom) {
        this.sourceDocument = sourceDocument;
        this.regulation = regulation;
        this.effectiveFrom = effectiveFrom;
    }

    public void addEntry(double minAmount, Double maxAmount, String procedure,
                          String category, List<String> requirements, String notes) {
        entries.add(new ThresholdEntry(
                minAmount, maxAmount, procedure, category, requirements, notes));
    }

    /**
     * Normalizes a procurement category string to the canonical categories
     * used by the threshold tables. IT-related categories (IT-Dienstleistung,
     * Software, Cloud, etc.) map to "Lieferung/Dienstleistung". Bau-related
     * categories map to "Bauleistung".
     */
    public static String normalizeCategory(String category) {
        if (category == null) return null;
        String lower = category.toLowerCase();
        if (lower.startsWith("it") || lower.contains("software") || lower.contains("cloud")
                || lower.contains("digital")) {
            return "Lieferung/Dienstleistung";
        }
        if (lower.startsWith("bau") && !lower.equals("bauleistung")) {
            return "Bauleistung";
        }
        return category;
    }

    /**
     * Determines the applicable procurement procedure for a given amount.
     */
    public Optional<ThresholdEntry> lookup(double amount, String categoryFilter) {
        return entries.stream()
                .filter(e -> amount >= e.minAmount())
                .filter(e -> e.maxAmount() == null || amount < e.maxAmount())
                .filter(e -> categoryFilter == null
                        || e.category().toLowerCase().contains(categoryFilter.toLowerCase())
                        || categoryFilter.toLowerCase().contains(e.category().toLowerCase()))
                .findFirst();
    }

    /** All thresholds sorted by minimum amount. */
    public List<ThresholdEntry> allThresholds() {
        return entries.stream()
                .sorted(Comparator.comparingDouble(ThresholdEntry::minAmount))
                .toList();
    }

    public record ThresholdEntry(
            double minAmount,
            Double maxAmount,     // null = no upper bound (above this threshold)
            String procedure,     // "Direktauftrag", "Beschränkte Ausschreibung", etc.
            String category,      // "Lieferung", "Bauleistung", "IT", etc.
            List<String> requirements, // e.g. ["Schriftliche Genehmigung", "3 Angebote"]
            String notes
    ) {}

    public String sourceDocument() { return sourceDocument; }
    public String regulation() { return regulation; }
    public LocalDate effectiveFrom() { return effectiveFrom; }
    public List<ThresholdEntry> entries() { return List.copyOf(entries); }
    public int size() { return entries.size(); }
}
