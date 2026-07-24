package com.cognitera.platform.api.web;

import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.model.Document;
import com.cognitera.platform.document.model.DocumentStatus;
import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.search.api.SearchFacade;
import com.cognitera.platform.search.model.SearchFilter;
import com.cognitera.platform.search.model.SearchMode;
import com.cognitera.platform.search.model.SearchQuery;
import com.cognitera.platform.search.model.SearchRequestContext;
import com.cognitera.platform.search.model.SearchResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeRestController {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy").withZone(ZoneId.of("Europe/Berlin"));
    private static final String SYSTEM_ACTOR = "knowledge-search";

    private final SearchFacade searchFacade;
    private final DocumentFacade documentFacade;

    public KnowledgeRestController(SearchFacade searchFacade, DocumentFacade documentFacade) {
        this.searchFacade = searchFacade;
        this.documentFacade = documentFacade;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        var filter = new com.cognitera.platform.document.api.DocumentFilter(
                DocumentStatus.READY, null, null, null, null, null, null, 0, 200);
        var page = documentFacade.findDocuments(filter);
        List<Map<String, Object>> docs = new ArrayList<>();
        for (Document doc : page.documents()) {
            docs.add(toKnowledgeDocument(doc, null));
        }
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam("q") String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "fachbereich", required = false) String fachbereich,
            @RequestParam(value = "bundesland", required = false) String bundesland) {

        SearchFilter searchFilter = new SearchFilter(
                null, null, trimToNull(category), null, null,
                trimToNull(bundesland), null, null, List.of());

        SearchQuery searchQuery = new SearchQuery(
                query.trim(), SearchMode.HYBRID, searchFilter,
                new SearchRequestContext(SYSTEM_ACTOR, null, null, null), 0, 50);

        var resultPage = searchFacade.search(searchQuery);

        Map<UUID, SearchResult> bestByDoc = new LinkedHashMap<>();
        for (SearchResult sr : resultPage.results()) {
            UUID docId = sr.chunk().documentId();
            bestByDoc.merge(docId, sr,
                    (existing, incoming) -> existing.score() >= incoming.score() ? existing : incoming);
        }

        List<Map<String, Object>> docs = new ArrayList<>();
        for (var entry : bestByDoc.entrySet()) {
            try {
                Document doc = documentFacade.getDocument(entry.getKey(), SYSTEM_ACTOR);
                docs.add(toKnowledgeDocument(doc, entry.getValue()));
            } catch (IllegalArgumentException ignored) {
                // document not found — skip
            }
        }
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable String id) {
        try {
            UUID docId = UUID.fromString(id);
            Document doc = documentFacade.getDocument(docId, SYSTEM_ACTOR);
            return ResponseEntity.ok(toKnowledgeDocument(doc, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Map<String, Object> toKnowledgeDocument(Document doc, SearchResult searchResult) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("id", doc.id().toString());
        d.put("title", doc.metadata().title());

        // Type: map DocumentType to a display label
        d.put("type", documentTypeLabel(doc.metadata().type()));

        d.put("category", Objects.requireNonNullElse(doc.metadata().category(), "Allgemein"));
        d.put("fachbereich", "Allgemein");
        d.put("bundesland", Objects.requireNonNullElse(doc.tenantId(), "Bund"));
        d.put("status", doc.status() == DocumentStatus.READY ? "Aktiv" : doc.status().name());
        d.put("lastUpdated", DATE_FMT.format(doc.updatedAt()));

        // Excerpt: prefer search result chunk text, fall back to first 200 chars of title
        if (searchResult != null && searchResult.text() != null && !searchResult.text().isBlank()) {
            d.put("excerpt", searchResult.text());
        } else {
            String title = doc.metadata().title();
            d.put("excerpt", title.length() > 200 ? title.substring(0, 200) + "…" : title);
        }

        // fullText: not stored in Document model — omit so frontend falls back to excerpt
        d.put("tags", new ArrayList<>(doc.metadata().tags()));

        // downloads: derived from document versions
        List<Map<String, Object>> downloads = new ArrayList<>();
        for (var version : doc.versions()) {
            Map<String, Object> dl = new LinkedHashMap<>();
            dl.put("id", version.id().toString());
            dl.put("name", version.fileName());
            dl.put("format", contentTypeToFormat(version.contentType()));
            dl.put("size", formatSize(version.sizeBytes()));
            downloads.add(dl);
        }
        d.put("downloads", downloads);

        return d;
    }

    private static String documentTypeLabel(DocumentType type) {
        return switch (type) {
            case PDF -> "Dokument (PDF)";
            case DOCX -> "Dokument (DOCX)";
            case TXT -> "Textdokument";
            case HTML -> "Webdokument";
        };
    }

    private static String contentTypeToFormat(String contentType) {
        if (contentType == null) return "Unbekannt";
        return switch (contentType.toLowerCase()) {
            case "application/pdf" -> "PDF";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> "DOCX";
            case "text/plain" -> "TXT";
            case "text/html" -> "HTML";
            default -> contentType;
        };
    }

    private static String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }

    private static String trimToNull(String value) {
        return value != null && !value.isBlank() ? value.trim() : null;
    }
}
