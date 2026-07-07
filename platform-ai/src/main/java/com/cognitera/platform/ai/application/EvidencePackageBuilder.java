package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.config.AiPipelineProperties;
import com.cognitera.platform.ai.model.*;
import com.cognitera.platform.ai.model.EvidencePackage.Contradiction;
import com.cognitera.platform.ai.model.EvidencePackage.CoverageStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Builds a compact {@link EvidencePackage} from retrieval results.
 *
 * <p>Key simplifications over the original:
 * <ul>
 *   <li>Groups chunks by unique document — one EvidenceItem per document</li>
 *   <li>Merges nearby paragraphs within the same document</li>
 *   <li>Deduplicates repeated excerpts</li>
 *   <li>Limits to {@code maxEvidenceSources} documents (default 4)</li>
 *   <li>Each document contributes at most {@code maxParagraphsPerSource} paragraphs</li>
 * </ul>
 */
@Component
public class EvidencePackageBuilder {

    private static final Logger log = LoggerFactory.getLogger(EvidencePackageBuilder.class);

    private final NumericExtractor numericExtractor;
    private final AiPipelineProperties props;

    private static final Map<String, String> AUTHORITY_MAP = Map.ofEntries(
            Map.entry("Bauordnung Berlin", "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen"),
            Map.entry("Baugesetzbuch", "Senatsverwaltung für Stadtentwicklung"),
            Map.entry("Baunutzungsverordnung", "Senatsverwaltung für Stadtentwicklung"),
            Map.entry("Bauvorlagenverordnung", "Senatsverwaltung für Stadtentwicklung"),
            Map.entry("Schneller-Bauen-Gesetz", "Senatsverwaltung Berlin"),
            Map.entry("Abstandsflächen", "Senatsverwaltung für Stadtentwicklung"),
            Map.entry("GWB", "Bundeskartellamt / BMWK"),
            Map.entry("VgV", "BMWK"),
            Map.entry("UVgO", "BMWK"),
            Map.entry("BerlAVG", "Senatsverwaltung für Finanzen"),
            Map.entry("Beschaffungsordnung Berlin", "Senatsverwaltung für Finanzen"),
            Map.entry("TV-L", "TdL"),
            Map.entry("BRKG", "BMI"),
            Map.entry("LRKG", "Senatsverwaltung für Inneres"),
            Map.entry("AZVO Bln", "Senatsverwaltung für Inneres"),
            Map.entry("UrlVO Bln", "Senatsverwaltung für Inneres"),
            Map.entry("Arbeitszeitverordnung", "Senatsverwaltung für Inneres"),
            Map.entry("IT-Sicherheitsleitlinie", "ITDZ Berlin")
    );

    public EvidencePackageBuilder(NumericExtractor numericExtractor, AiPipelineProperties props) {
        this.numericExtractor = numericExtractor;
        this.props = props;
    }

    /**
     * Builds a deduplicated, document-grouped evidence package.
     * Each unique document becomes ONE EvidenceItem with merged paragraphs.
     */
    public EvidencePackage build(String query, List<SourceCitation> sources) {
        if (sources.isEmpty()) {
            return new EvidencePackage(List.of(), true, List.of(),
                    CoverageStatus.INSUFFICIENT, 0, 0, 0);
        }

        // Group sources by document title, keeping highest-confidence chunks
        Map<String, List<SourceCitation>> byDoc = new LinkedHashMap<>();
        for (SourceCitation s : sources) {
            String key = s.title() != null ? s.title() : "unknown-" + s.documentId();
            byDoc.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        // Build one EvidenceItem per unique document (limited to maxEvidenceSources)
        List<EvidenceItem> items = new ArrayList<>();
        int maxSources = props.getMaxEvidenceSources();
        int maxParagraphs = props.getMaxParagraphsPerSource();
        int maxExcerpt = props.getMaxExcerptLength();
        int idx = 0;

        for (var entry : byDoc.entrySet()) {
            if (idx >= maxSources) break;
            idx++;

            String docTitle = entry.getKey();
            List<SourceCitation> chunks = entry.getValue();
            // Sort by confidence desc
            chunks.sort(Comparator.comparingDouble(SourceCitation::confidenceScore).reversed());

            // Take top N paragraphs, merge nearby ones
            List<String> mergedParagraphs = mergeParagraphs(chunks, maxParagraphs);
            String joinedExcerpt = String.join(" | ", mergedParagraphs);
            if (joinedExcerpt.length() > maxExcerpt) {
                joinedExcerpt = joinedExcerpt.substring(0, maxExcerpt - 3) + "...";
            }

            SourceCitation best = chunks.getFirst();
            String authority = resolveAuthority(docTitle);
            String support = deriveSupport(best, query, docTitle);
            NumericExtraction numerics = numericExtractor.extractAll(
                    chunks.stream().map(c -> c.excerpt() != null ? c.excerpt() : "").toList());

            items.add(new EvidenceItem(
                    idx,
                    best.documentId(),
                    best.chunkId(),
                    docTitle,
                    authority,
                    String.valueOf(mergedParagraphs.size()) + " Abschnitte",
                    joinedExcerpt,
                    support,
                    best.confidenceScore(),
                    numerics.isEmpty() ? null : numerics));
        }

        int dedupedCount = byDoc.size();
        boolean insufficient = items.size() <= 1;
        CoverageStatus coverage = items.size() >= 2
                ? CoverageStatus.SUFFICIENT
                : (items.size() == 1 ? CoverageStatus.PARTIAL : CoverageStatus.INSUFFICIENT);

        log.info("EvidencePackage: {} documents (from {} sources, {} unique) | {} items | coverage={}",
                items.size(), sources.size(), dedupedCount, items.size(), coverage);

        return new EvidencePackage(items, insufficient, List.of(), coverage,
                sources.size(), items.size(), dedupedCount);
    }

    /** Merges nearby paragraphs from the same document to reduce repetition. */
    private List<String> mergeParagraphs(List<SourceCitation> chunks, int maxParagraphs) {
        List<String> merged = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (SourceCitation c : chunks) {
            String text = c.excerpt() != null ? c.excerpt().strip() : "";
            if (text.isEmpty() || text.length() < 20) continue;
            // Deduplicate
            String normalized = text.toLowerCase().substring(0, Math.min(40, text.length()));
            if (!seen.add(normalized)) continue;
            merged.add(text);
            if (merged.size() >= maxParagraphs) break;
        }
        return merged;
    }

    private String resolveAuthority(String title) {
        return AUTHORITY_MAP.entrySet().stream()
                .filter(e -> title.toLowerCase().contains(e.getKey().toLowerCase()))
                .map(Map.Entry::getValue)
                .findFirst().orElse("Land Berlin");
    }

    private String deriveSupport(SourceCitation s, String query, String title) {
        String titleLow = title.toLowerCase();
        String excerpt = s.excerpt() != null ? s.excerpt().toLowerCase() : "";
        String q = query.toLowerCase();

        if (hasAny(q, "gehalt", "entgelt", "vergütung", "tv-l", "eg "))
            if (hasAny(titleLow + excerpt, "entgelt", "tv-l", "eg ", "gehalt")) return "Vergütung";
        if (hasAny(q, "beschaffung", "vergabe", "direktauftrag", "ausschreibung"))
            if (hasAny(titleLow + excerpt, "beschaffung", "vergabe", "direktauftrag", "gwb", "vgv", "uvgo"))
                return "Vergaberecht";
        if (hasAny(q, "bau", "baugenehmigung", "abstandsfläche"))
            if (hasAny(titleLow + excerpt, "bau", "bauo", "baugb")) return "Bauordnungsrecht";
        if (hasAny(q, "reisekosten", "dienstreise", "tagegeld"))
            if (hasAny(titleLow + excerpt, "reisekosten", "brkg", "lrkg")) return "Reisekosten";
        if (hasAny(q, "urlaub", "urlvo"))
            if (hasAny(titleLow + excerpt, "urlaub", "urlvo")) return "Urlaubsrecht";
        if (hasAny(q, "arbeitszeit", "azvo"))
            if (hasAny(titleLow + excerpt, "arbeitszeit", "azvo")) return "Arbeitszeit";

        return "Allgemeine Rechtsgrundlage";
    }

    private boolean hasAny(String text, String... terms) {
        for (String t : terms) if (text.contains(t)) return true;
        return false;
    }
}
