package com.cognitera.platform.api.ingestion;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic metadata extraction from German legal and administrative documents.
 * No LLM. No external services. Pure regex and heuristics.
 *
 * <p>Extracts: title, short name, legal domain, authority, jurisdiction,
 * publication date, effective date, document type, language, § references,
 * article references, clause references, and structural hierarchy markers.
 */
@Component
public class LegalMetadataExtractor {

    private static final Logger log = LoggerFactory.getLogger(LegalMetadataExtractor.class);

    // ── § references ──
    private static final Pattern SECTION_REF = Pattern.compile("§\\s*(\\d+[a-z]?)");
    private static final Pattern CLAUSE_REF = Pattern.compile("\\((\\d+[a-z]?)\\)");
    private static final Pattern ARTICLE_REF = Pattern.compile("Art\\.\\s*(\\d+[a-z]?)");

    // ── Structural markers ──
    private static final Pattern TEIL = Pattern.compile("(?im)^Teil\\s+(\\d+)\\s*[:\\-–]?\\s*(.+)");
    private static final Pattern KAPITEL = Pattern.compile("(?im)^Kapitel\\s+(\\d+)\\s*[:\\-–]?\\s*(.+)");
    private static final Pattern ABSCHNITT = Pattern.compile("(?im)^Abschnitt\\s+(\\d+[a-z]?)\\s*[:\\-–]?\\s*(.+)");
    private static final Pattern UNTERABSCHNITT = Pattern.compile("(?im)^Unterabschnitt\\s+(\\d+[a-z]?)\\s*[:\\-–]?\\s*(.+)");
    private static final Pattern ANLAGE = Pattern.compile("(?im)^Anlage\\s+(\\d+[a-z]?)\\s*[:\\-–]?\\s*(.+)");

    // ── Dates ──
    private static final Pattern DATE_GERMAN = Pattern.compile(
            "(\\d{1,2})\\.\\s*(\\w+)\\s*(\\d{4})");
    private static final Pattern DATE_ISO = Pattern.compile(
            "(\\d{4})-(\\d{2})-(\\d{2})");
    private static final Pattern EFFECTIVE_PATTERN = Pattern.compile(
            "(?i)(in Kraft|wirksam|gültig|anzuwenden)\\s*(?:ab|seit|am|vom)?\\s*(.{5,40}?)(?:\\.|$)");

    // ── Authority detection ──
    private static final Pattern SENATSVERWALTUNG = Pattern.compile(
            "(?i)Senatsverwaltung\\s+(?:für|f\\.)\\s+([A-Za-zäöüß,\\s]+?)(?:,|\\.|$)");
    private static final Pattern BUNDESMINISTERIUM = Pattern.compile(
            "(?i)Bundesministerium\\s+(?:für|des|der)\\s+([A-Za-zäöüß,\\s]+?)(?:,|\\.|$)");
    private static final Pattern BEZIRKSAMT = Pattern.compile(
            "(?i)Bezirksamt\\s+([A-Za-zäöüß\\-]+)\\s+(?:von|in)\\s+Berlin");

    // ── Document type detection ──
    private static final Pattern GESETZ = Pattern.compile("(?i)\\bGesetz\\b");
    private static final Pattern VERORDNUNG = Pattern.compile("(?i)\\bVerordnung\\b");
    private static final Pattern VERWALTUNGSVORSCHRIFT = Pattern.compile(
            "(?i)(Verwaltungsvorschrift|Ausführungsvorschrift|AV\\s+(?:zu|gem))");
    private static final Pattern RUNDSCHREIBEN = Pattern.compile("(?i)\\bRundschreiben\\b");
    private static final Pattern TARIFVERTRAG = Pattern.compile("(?i)\\bTarifvertrag\\b");
    private static final Pattern RICHTLINIE = Pattern.compile("(?i)\\bRichtlinie\\b");
    private static final Pattern LEITFADEN = Pattern.compile("(?i)\\bLeitfaden\\b");
    private static final Pattern URTEIL = Pattern.compile("(?i)\\bUrteil\\b");
    private static final Pattern BESCHLUSS = Pattern.compile("(?i)\\bBeschluss\\b");

    // ── Short title extraction ──
    private static final Pattern SHORT_TITLE = Pattern.compile(
            "(?i)\\(\\s*([A-Z][A-Za-zäöüß\\-\\s]+?)\\s*(?:–|-|—)\\s*([A-Z][A-Za-zäöüß\\-\\s]+?)\\s*\\)|"
                    + "\\b([A-Z][A-Za-zäöüß]+(?:\\s+[A-Z][A-Za-zäöüß]+){0,4})\\s*–\\s*(?:[A-Z])");

    // ── Language detection ──
    private static final Pattern GERMAN_CHARS = Pattern.compile("[äöüßÄÖÜ]");

    // ── Domain detection ──
    private static final Map<String, String> DOMAIN_PATTERNS = new LinkedHashMap<>();
    static {
        DOMAIN_PATTERNS.put("vergabe|beschaffung|ausschreibung|vergaberecht|gwb|vgv|uvgo|vob|berlavg|lho|direktauftrag", "Vergaberecht");
        DOMAIN_PATTERNS.put("bau|bauordnung|baugenehmigung|abstandsfläche|bebauungsplan|baunvo|baugb|bauvorlv|brandschutz|erschließung", "Baurecht");
        DOMAIN_PATTERNS.put("tv-l|tvö|entgelt|urlaub|arbeitszeit|dienstreise|brkg|lrkg|personal|tarifvertrag|homeoffice|teilzeit", "Personalrecht");
        DOMAIN_PATTERNS.put("haushalt|budget|kameral|lho|haushaltsplan|zuwendung|bewirtschaftung", "Haushaltsrecht");
        DOMAIN_PATTERNS.put("verwaltungsverfahren|vwvfg|vwgo|verwaltungsakt|widerspruch|ermessen|anhörung", "Verwaltungsrecht");
        DOMAIN_PATTERNS.put("umwelt|immission|emission|klima|nachhaltig|naturschutz|abfall|wasser|bodenschutz", "Umweltrecht");
        DOMAIN_PATTERNS.put("datenschutz|dsgvo|bdsg|personenbezogen|auftragsverarbeitung|folgenabschätzung", "Datenschutz");
        DOMAIN_PATTERNS.put("it-sicherheit|informationssicherheit|bsi|grundschutz|notfall|sicherheitsleitlinie", "IT-Sicherheit");
        DOMAIN_PATTERNS.put("kommune|gemeinde|bezirk|bezirksverordnet|gemeinderat|bürgermeister|satzung", "Kommunalrecht");
    }

    /**
     * Extracts all available metadata from document text and provided fields.
     *
     * @param fullText the extracted document text (first 5000 chars are sufficient)
     * @param provided  metadata from the sidecar JSON or upload form (may be empty)
     * @return extracted metadata map
     */
    public Map<String, Object> extract(String fullText, Map<String, String> provided) {
        Map<String, Object> meta = new LinkedHashMap<>();
        String sample = fullText != null ? fullText.substring(0, Math.min(fullText.length(), 5000)) : "";

        // ── Identity ──
        meta.put("title", provided.getOrDefault("title", extractTitle(sample)));
        meta.put("short_name", provided.getOrDefault("short_name", extractShortTitle(sample)));
        meta.put("legal_domain", provided.getOrDefault("legal_domain", detectDomain(sample)));
        meta.put("jurisdiction", provided.getOrDefault("jurisdiction", detectJurisdiction(sample)));
        meta.put("authority", provided.getOrDefault("authority", detectAuthority(sample)));
        meta.put("doc_type", provided.getOrDefault("doc_type", detectDocumentType(sample)));
        meta.put("language", provided.getOrDefault("language", detectLanguage(sample)));

        // ── Dates ──
        meta.put("publication_date", provided.getOrDefault("publication_date", ""));
        meta.put("effective_date", provided.getOrDefault("effective_date",
                extractEffectiveDate(sample).map(LocalDate::toString).orElse("")));

        // ── Version ──
        meta.put("version_identifier", provided.getOrDefault("version_identifier", ""));
        meta.put("version_state", provided.getOrDefault("version_state", "current"));

        // ── Structural references ──
        meta.put("section_refs", extractSectionRefs(fullText));
        meta.put("article_refs", extractArticleRefs(fullText));
        meta.put("clause_refs", extractClauseRefs(fullText));
        meta.put("appendix_refs", extractAppendixRefs(fullText));

        // ── Structural hierarchy ──
        Map<String, String> hierarchy = extractHierarchy(sample);
        if (!hierarchy.isEmpty()) {
            meta.put("hierarchy", hierarchy);
        }

        // ── Chunk-level annotations (for downstream use) ──
        meta.put("section_refs_per_chunk", annotateChunks(fullText));

        return meta;
    }

    // ── Title extraction ──

    private String extractTitle(String text) {
        if (text == null || text.isBlank()) return "";
        // First non-empty line is usually the title
        String[] lines = text.split("\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isBlank() && trimmed.length() > 5 && !trimmed.startsWith("§")) {
                return trimmed.length() > 200 ? trimmed.substring(0, 200) : trimmed;
            }
        }
        return "";
    }

    private String extractShortTitle(String text) {
        Matcher m = SHORT_TITLE.matcher(text);
        if (m.find()) {
            for (int i = 1; i <= m.groupCount(); i++) {
                if (m.group(i) != null) return m.group(i).trim();
            }
        }
        return "";
    }

    // ── Domain detection ──

    private String detectDomain(String text) {
        String lower = text.toLowerCase();
        Map<String, Integer> scores = new LinkedHashMap<>();

        for (var entry : DOMAIN_PATTERNS.entrySet()) {
            String[] terms = entry.getKey().split("\\|");
            int score = 0;
            for (String term : terms) {
                if (lower.contains(term)) score++;
            }
            if (score > 0) scores.put(entry.getValue(), score);
        }

        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Allgemein");
    }

    // ── Authority detection ──

    private String detectAuthority(String text) {
        Matcher sm = SENATSVERWALTUNG.matcher(text);
        if (sm.find()) return "Senatsverwaltung für " + sm.group(1).trim();

        Matcher bm = BUNDESMINISTERIUM.matcher(text);
        if (bm.find()) return "Bundesministerium für " + bm.group(1).trim();

        Matcher ba = BEZIRKSAMT.matcher(text);
        if (ba.find()) return "Bezirksamt " + ba.group(1).trim() + " von Berlin";

        return "";
    }

    private String detectJurisdiction(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("berlin")) return "Berlin";
        if (lower.contains("bund") || lower.contains("bundesrepublik")) return "Bund";
        if (lower.contains("europäisch") || lower.contains("european")) return "EU";
        return "";
    }

    // ── Document type detection ──

    private String detectDocumentType(String text) {
        if (GESETZ.matcher(text).find()) return "Gesetz";
        if (VERORDNUNG.matcher(text).find()) {
            if (VERWALTUNGSVORSCHRIFT.matcher(text).find()) return "Verwaltungsvorschrift";
            return "Rechtsverordnung";
        }
        if (VERWALTUNGSVORSCHRIFT.matcher(text).find()) return "Verwaltungsvorschrift";
        if (RUNDSCHREIBEN.matcher(text).find()) return "Rundschreiben";
        if (TARIFVERTRAG.matcher(text).find()) return "Tarifvertrag";
        if (URTEIL.matcher(text).find()) return "Urteil";
        if (BESCHLUSS.matcher(text).find()) return "Beschluss";
        if (RICHTLINIE.matcher(text).find()) return "Richtlinie";
        if (LEITFADEN.matcher(text).find()) return "Leitfaden";
        return "Dokument";
    }

    // ── Language detection ──

    private String detectLanguage(String text) {
        if (text == null || text.isBlank()) return "DE";
        return GERMAN_CHARS.matcher(text).find() ? "DE" : "EN";
    }

    // ── Date extraction ──

    private Optional<LocalDate> extractEffectiveDate(String text) {
        Matcher em = EFFECTIVE_PATTERN.matcher(text);
        if (em.find()) {
            String dateContext = em.group(2).trim();
            // Try German date format first
            Matcher dm = DATE_GERMAN.matcher(dateContext);
            if (dm.find()) return parseGermanDate(dm.group(1), dm.group(2), dm.group(3));
            // Try ISO format
            Matcher im = DATE_ISO.matcher(dateContext);
            if (im.find()) return parseIsoDate(im.group(0));
        }
        // Fallback: any date that appears after a section heading
        Matcher dm = DATE_GERMAN.matcher(text);
        if (dm.find()) return parseGermanDate(dm.group(1), dm.group(2), dm.group(3));
        return Optional.empty();
    }

    private Optional<LocalDate> parseGermanDate(String day, String month, String year) {
        Map<String, Integer> months = Map.ofEntries(
                Map.entry("januar", 1), Map.entry("februar", 2), Map.entry("märz", 3),
                Map.entry("april", 4), Map.entry("mai", 5), Map.entry("juni", 6),
                Map.entry("juli", 7), Map.entry("august", 8), Map.entry("september", 9),
                Map.entry("oktober", 10), Map.entry("november", 11), Map.entry("dezember", 12));
        try {
            int d = Integer.parseInt(day);
            Integer m = months.get(month.toLowerCase().trim());
            int y = Integer.parseInt(year);
            if (m != null) return Optional.of(LocalDate.of(y, m, d));
        } catch (NumberFormatException ignored) {}
        return Optional.empty();
    }

    private Optional<LocalDate> parseIsoDate(String date) {
        try {
            return Optional.of(LocalDate.parse(date, DateTimeFormatter.ISO_DATE));
        } catch (DateTimeParseException ignored) {}
        return Optional.empty();
    }

    // ── Structural reference extraction ──

    /** Returns all § numbers found in the text (unique, sorted). */
    public List<String> extractSectionRefs(String text) {
        Set<String> refs = new LinkedHashSet<>();
        Matcher m = SECTION_REF.matcher(text);
        while (m.find()) refs.add(m.group(1));
        List<String> sorted = new ArrayList<>(refs);
        sorted.sort(Comparator.comparingInt(s -> {
            try { return Integer.parseInt(s.replaceAll("[a-z]$", "")); }
            catch (NumberFormatException e) { return 0; }
        }));
        return sorted;
    }

    /** Returns all Art. numbers found in the text. */
    public List<String> extractArticleRefs(String text) {
        Set<String> refs = new LinkedHashSet<>();
        Matcher m = ARTICLE_REF.matcher(text);
        while (m.find()) refs.add(m.group(1));
        return new ArrayList<>(refs);
    }

    /** Returns all clause numbers found in the text. */
    public List<String> extractClauseRefs(String text) {
        Set<String> refs = new LinkedHashSet<>();
        Matcher m = CLAUSE_REF.matcher(text);
        while (m.find()) refs.add(m.group(1));
        return new ArrayList<>(refs);
    }

    /** Returns Anlage references. */
    public List<String> extractAppendixRefs(String text) {
        Set<String> refs = new LinkedHashSet<>();
        Matcher m = ANLAGE.matcher(text);
        while (m.find()) refs.add("Anlage " + m.group(1));
        return new ArrayList<>(refs);
    }

    // ── Hierarchy extraction ──

    private Map<String, String> extractHierarchy(String text) {
        Map<String, String> h = new LinkedHashMap<>();
        Matcher tm = TEIL.matcher(text);
        if (tm.find()) h.put("teil", "Teil " + tm.group(1) + " — " + tm.group(2).trim());
        Matcher km = KAPITEL.matcher(text);
        if (km.find()) h.put("kapitel", "Kapitel " + km.group(1) + " — " + km.group(2).trim());
        Matcher am = ABSCHNITT.matcher(text);
        if (am.find()) h.put("abschnitt", "Abschnitt " + am.group(1) + " — " + am.group(2).trim());
        Matcher um = UNTERABSCHNITT.matcher(text);
        if (um.find()) h.put("unterabschnitt", "Unterabschnitt " + um.group(1) + " — " + um.group(2).trim());
        return h;
    }

    // ── Chunk annotation ──

    /**
     * For each chunk of text, extracts the § references present in that chunk.
     * Used by the indexing pipeline to annotate chunks with their legal location.
     *
     * @param fullText the complete document text
     * @return per-chunk § references (chunk boundaries determined by the caller)
     */
    public List<Map<String, String>> annotateChunks(String fullText) {
        // This is called by the chunking pipeline to annotate each chunk.
        // The actual chunking is done by SentenceAwareChunkingStrategy.
        // Here we just provide a utility that the pipeline can call per-chunk.
        return List.of(); // placeholder — called per-chunk by the indexing pipeline
    }

    /**
     * Annotates a single chunk's text with its § references.
     * Returns a map suitable for storage in chunk attributes.
     */
    public Map<String, String> annotateChunk(String chunkText, int chunkIndex) {
        Map<String, String> annotations = new LinkedHashMap<>();
        List<String> sections = extractSectionRefs(chunkText);
        if (!sections.isEmpty()) {
            annotations.put("section_ref", String.join(",", sections));
        }
        List<String> clauses = extractClauseRefs(chunkText);
        if (!clauses.isEmpty()) {
            annotations.put("clause_ref", String.join(",", clauses));
        }
        return annotations;
    }
}
