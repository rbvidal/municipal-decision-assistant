package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.model.*;
import com.cognitera.platform.ai.model.EvidencePackage.Contradiction;
import com.cognitera.platform.ai.model.EvidencePackage.CoverageStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Builds structured {@link EvidencePackage} from retrieval results.
 *
 * <p>Each source citation becomes a numbered {@link EvidenceItem} with:
 * <ul>
 *   <li>Document title and authority</li>
 *   <li>Paragraph/section identification</li>
 *   <li>Relevant excerpt</li>
 *   <li>What it supports (derived from the query context)</li>
 *   <li>Confidence score</li>
 *   <li>Extracted numeric data (if any)</li>
 * </ul>
 *
 * <p>Also performs contradiction detection: when two highly-ranked documents
 * contain conflicting information, a {@link Contradiction} is recorded.
 */
@Component
public class EvidencePackageBuilder {

    private static final Logger log = LoggerFactory.getLogger(EvidencePackageBuilder.class);

    private final NumericExtractor numericExtractor;

    // ── Authority mapping ──
    private static final Map<String, String> AUTHORITY_MAP = Map.ofEntries(
            Map.entry("Bauordnung Berlin", "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen"),
            Map.entry("Baugesetzbuch", "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen"),
            Map.entry("Baunutzungsverordnung", "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen"),
            Map.entry("Bauvorlagenverordnung", "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen"),
            Map.entry("Schneller-Bauen-Gesetz", "Senatsverwaltung Berlin"),
            Map.entry("Abstandsflächen", "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen"),
            Map.entry("GWB", "Bundeskartellamt / BMWK"),
            Map.entry("VgV", "Bundesministerium für Wirtschaft und Klimaschutz"),
            Map.entry("UVgO", "Bundesministerium für Wirtschaft und Klimaschutz"),
            Map.entry("BerlAVG", "Senatsverwaltung für Finanzen"),
            Map.entry("Beschaffungsordnung Berlin", "Senatsverwaltung für Finanzen"),
            Map.entry("TV-L", "Tarifgemeinschaft deutscher Länder (TdL)"),
            Map.entry("BRKG", "Bundesministerium des Innern"),
            Map.entry("LRKG", "Senatsverwaltung für Inneres und Sport"),
            Map.entry("AZVO Bln", "Senatsverwaltung für Inneres und Sport"),
            Map.entry("UrlVO Bln", "Senatsverwaltung für Inneres und Sport"),
            Map.entry("Arbeitszeitverordnung", "Senatsverwaltung für Inneres und Sport"),
            Map.entry("IT-Sicherheitsleitlinie", "ITDZ Berlin")
    );

    public EvidencePackageBuilder(NumericExtractor numericExtractor) {
        this.numericExtractor = numericExtractor;
    }

    /**
     * Builds a complete evidence package from retrieval results.
     */
    public EvidencePackage build(String query, List<SourceCitation> sources) {
        if (sources.isEmpty()) {
            return new EvidencePackage(List.of(), true, List.of(),
                    CoverageStatus.INSUFFICIENT, 0, 0, 0);
        }

        List<EvidenceItem> items = new ArrayList<>();
        Set<String> seenTitles = new LinkedHashSet<>();

        for (int i = 0; i < sources.size(); i++) {
            SourceCitation s = sources.get(i);
            seenTitles.add(s.title());
            EvidenceItem item = buildEvidenceItem(i + 1, s, query);
            items.add(item);
        }

        // Detect contradictions
        List<Contradiction> contradictions = detectContradictions(items);

        // Assess coverage
        CoverageStatus coverage = assessCoverage(items, sources.size());

        log.info("EvidencePackage: {} items from {} unique documents, coverage={}, contradictions={}",
                items.size(), seenTitles.size(), coverage, contradictions.size());

        return new EvidencePackage(
                items, false, contradictions, coverage,
                sources.size(), items.size(), seenTitles.size());
    }

    private EvidenceItem buildEvidenceItem(int index, SourceCitation s, String query) {
        String authority = resolveAuthority(s.title() != null ? s.title() : "");
        String paragraph = extractParagraph(s);
        NumericExtraction numerics = numericExtractor.extract(
                (s.excerpt() != null ? s.excerpt() : "") + " " +
                (s.title() != null ? s.title() : ""));
        String supports = deriveSupport(s, query);

        return new EvidenceItem(
                index,
                s.documentId(),
                s.chunkId(),
                s.title() != null ? s.title() : "Unbekanntes Dokument",
                authority,
                paragraph,
                s.excerpt() != null ? s.excerpt() : "",
                supports,
                s.confidenceScore(),
                numerics.isEmpty() ? null : numerics
        );
    }

    /** Extracts a paragraph/section reference from the excerpt or title. */
    private String extractParagraph(SourceCitation s) {
        String text = (s.excerpt() != null ? s.excerpt() : "") + " " +
                      (s.title() != null ? s.title() : "");

        // Try to find section/paragraph references
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(
                "(?:Section|§|Paragraph|Abschnitt|Abs\\.|EG\\s*\\d+[a-z]?\\s*(?:Stufe\\s*\\d+)?|Art\\.)\\s*([\\d]+[a-z]?(?:\\s*(?:Abs|Stufe)\\s*\\d+)?)",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(0).trim();
        }
        return "";
    }

    /** Derives what this evidence supports based on the query context. */
    private String deriveSupport(SourceCitation s, String query) {
        String title = s.title() != null ? s.title().toLowerCase() : "";
        String excerpt = s.excerpt() != null ? s.excerpt().toLowerCase() : "";
        String q = query.toLowerCase();

        if (containsAny(q, "gehalt", "entgelt", "vergutung", "lohn", "tv-l", "tvö", "eg ")) {
            if (containsAny(title + excerpt, "entgelt", "tv-l", "eg ", "stufe", "gehalt"))
                return "Gehaltsinformation / Vergütung";
        }
        if (containsAny(q, "urlaub", "erholungsurlaub", "sonderurlaub", "urlvo")) {
            if (containsAny(title + excerpt, "urlaub", "urlvo", "erholung"))
                return "Urlaubsregelung";
        }
        if (containsAny(q, "beschaffung", "vergabe", "direktauftrag", "ausschreibung")) {
            if (containsAny(title + excerpt, "beschaffung", "vergabe", "direktauftrag", "gwb", "vgv", "uvgo"))
                return "Vergaberecht / Beschaffungsregelung";
        }
        if (containsAny(q, "bau", "baugenehmigung", "carport", "garage", "abstandsflache")) {
            if (containsAny(title + excerpt, "bau", "bauo", "baugb", "abstands"))
                return "Bauordnungsrecht";
        }
        if (containsAny(q, "reisekosten", "dienstreise", "tagegeld", "brkg", "lrkg")) {
            if (containsAny(title + excerpt, "reisekosten", "brkg", "lrkg", "dienstreise"))
                return "Reisekostenrecht";
        }
        if (containsAny(q, "arbeitszeit", "azvo", "kernarbeitszeit", "gleitzeit")) {
            if (containsAny(title + excerpt, "arbeitszeit", "azvo"))
                return "Arbeitszeitregelung";
        }

        return "Allgemeine Rechtsgrundlage";
    }

    /** Resolves the authority for a document title. */
    private String resolveAuthority(String title) {
        return AUTHORITY_MAP.entrySet().stream()
                .filter(e -> title.toLowerCase().contains(e.getKey().toLowerCase()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse("Land Berlin");
    }

    /**
     * Detects contradictions between evidence items by comparing numeric
     * values and key claims across items.
     */
    private List<Contradiction> detectContradictions(List<EvidenceItem> items) {
        List<Contradiction> conflicts = new ArrayList<>();

        // Compare numeric values across items
        for (int i = 0; i < items.size(); i++) {
            for (int j = i + 1; j < items.size(); j++) {
                EvidenceItem a = items.get(i);
                EvidenceItem b = items.get(j);
                if (a.numericExtraction() == null || b.numericExtraction() == null) continue;

                // Check for conflicting threshold values
                for (NumericExtraction.ThresholdValue ta : a.numericExtraction().thresholds()) {
                    for (NumericExtraction.ThresholdValue tb : b.numericExtraction().thresholds()) {
                        if (sameThresholdCategory(ta, tb) && Math.abs(ta.amount() - tb.amount()) > 1.0) {
                            conflicts.add(new Contradiction(
                                    "Unterschiedliche Wertgrenzen: " +
                                            formatMoney(ta.amount()) + " vs. " + formatMoney(tb.amount()),
                                    List.of(a.documentTitle() + ": " + ta.context()),
                                    List.of(b.documentTitle() + ": " + tb.context()),
                                    "Manuelle Prüfung erforderlich."));
                        }
                    }
                }

                // Check for conflicting salary data
                for (NumericExtraction.SalaryGrade sa : a.numericExtraction().salaryGrades()) {
                    for (NumericExtraction.SalaryGrade sb : b.numericExtraction().salaryGrades()) {
                        if (sa.grade().equals(sb.grade()) && sa.step() == sb.step()
                                && Math.abs(sa.amount() - sb.amount()) > 10.0) {
                            conflicts.add(new Contradiction(
                                    "Unterschiedliche Gehaltsangaben für " + sa.grade() +
                                            " Stufe " + sa.step() + ": " +
                                            formatMoney(sa.amount()) + " vs. " + formatMoney(sb.amount()),
                                    List.of(a.documentTitle() + ": " + sa.context()),
                                    List.of(b.documentTitle() + ": " + sb.context()),
                                    "Manuelle Prüfung erforderlich. Ggf. aktuellere Tabelle verwenden."));
                        }
                    }
                }
            }
        }
        return conflicts;
    }

    private boolean sameThresholdCategory(NumericExtraction.ThresholdValue a,
                                           NumericExtraction.ThresholdValue b) {
        return similarContext(a.context(), b.context());
    }

    private boolean similarContext(String a, String b) {
        if (a == null || b == null) return false;
        // Check word overlap
        Set<String> wordsA = new HashSet<>(Arrays.asList(a.toLowerCase().split("\\W+")));
        Set<String> wordsB = new HashSet<>(Arrays.asList(b.toLowerCase().split("\\W+")));
        wordsA.retainAll(wordsB);
        return wordsA.size() >= 2;
    }

    private CoverageStatus assessCoverage(List<EvidenceItem> items, int totalRetrieved) {
        if (items.isEmpty()) return CoverageStatus.INSUFFICIENT;
        // Count high-confidence items
        long highConf = items.stream()
                .filter(e -> e.confidence() >= 0.6).count();
        if (highConf >= 2) return CoverageStatus.SUFFICIENT;
        if (highConf == 1 || items.size() >= 3) return CoverageStatus.PARTIAL;
        return CoverageStatus.INSUFFICIENT;
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) return true;
        }
        return false;
    }

    private String formatMoney(double amount) {
        return String.format(Locale.GERMANY, "%.2f €", amount).replace(".", "X")
                .replace(",", ".").replace("X", ".");
    }

    private static final Locale GERMANY = java.util.Locale.GERMANY;
}
