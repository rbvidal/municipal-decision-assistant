package com.cognitera.platform.api.web;

import com.cognitera.platform.web.CorpusHealthService;
import com.cognitera.platform.web.CorpusManifestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST API for corpus health data consumed by the frontend SPA.
 * Exposes the same data as the Thymeleaf dashboard but as JSON.
 */
@RestController
@RequestMapping("/api/admin/corpus")
@PreAuthorize("hasRole('ADMIN')")
public class CorpusHealthRestController {

    private final CorpusHealthService healthService;
    private final CorpusManifestService manifestService;

    public CorpusHealthRestController(CorpusHealthService healthService,
                                       CorpusManifestService manifestService) {
        this.healthService = healthService;
        this.manifestService = manifestService;
    }

    /** Returns the full corpus health report as JSON. */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        try {
            var report = healthService.generateReport();
            var summary = report.summary();

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("summary", Map.of(
                    "documentCount", summary.documentCount(),
                    "chunkCount", summary.chunkCount(),
                    "embeddedChunks", summary.embeddedChunks(),
                    "missingEmbeddings", summary.missingEmbeddings(),
                    "qdrantVectors", summary.qdrantVectors(),
                    "embeddingCoveragePct", summary.embeddingCoveragePct(),
                    "avgChunksPerDocument", summary.avgChunksPerDocument(),
                    "avgRetrievalScore", summary.avgRetrievalScore() != null
                            ? summary.avgRetrievalScore() : "N/A",
                    "qdrantVectorDimension", summary.qdrantVectorDimension()));

            result.put("warnings", report.warnings() != null
                    ? report.warnings() : List.of());

            result.put("categories", report.healthCategories() != null
                    ? report.healthCategories().stream()
                            .map(c -> Map.of(
                                    "key", c.key(),
                                    "label", c.label(),
                                    "count", c.count(),
                                    "statusClass", c.statusClass() != null
                                            ? c.statusClass() : "green"))
                            .toList()
                    : List.of());

            result.put("documents", report.documents().stream()
                    .map(d -> {
                        Map<String, Object> doc = new LinkedHashMap<>();
                        doc.put("title", d.title());
                        doc.put("legalDomain", d.legalDomain() != null ? d.legalDomain() : "");
                        doc.put("authority", d.authority() != null ? d.authority() : "");
                        doc.put("language", d.language() != null ? d.language() : "de");
                        doc.put("pageCount", d.pageCount());
                        doc.put("chunkCount", d.chunkCount());
                        doc.put("chunksWithEmbeddings", d.chunksWithEmbeddings());
                        doc.put("chunksWithoutEmbeddings", d.chunksWithoutEmbeddings());
                        doc.put("indexedInQdrant", d.indexedInQdrant());
                        doc.put("vectorCount", d.vectorCount());
                        doc.put("metadataCompleteness", d.metadataCompleteness());
                        doc.put("lastIndexingTime", d.lastIndexingTime() != null ? d.lastIndexingTime() : "");
                        doc.put("status", d.status() != null ? d.status().name() : "YELLOW");
                        return doc;
                    })
                    .toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "summary", Map.of("documentCount", 0),
                    "warnings", List.of("Health check unavailable: " + e.getMessage()),
                    "categories", List.of(),
                    "documents", List.of()));
        }
    }

    /** Returns manifest summary statistics. */
    @GetMapping("/manifest-summary")
    public ResponseEntity<Map<String, Object>> getManifestSummary() {
        try {
            var summary = manifestService.getSummary();
            return ResponseEntity.ok(Map.of(
                    "totalEntries", summary.totalEntries(),
                    "byDomain", summary.byDomain(),
                    "byPriority", summary.byPriority()));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "totalEntries", 0,
                    "byDomain", Map.of(),
                    "byPriority", Map.of()));
        }
    }
}
