package com.cognitera.platform.web;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.ArrayList;
import java.util.List;

/**
 * Renders the Corpus Health Dashboard at /admin/corpus-health.
 * All view values are pre-computed in the controller — no enum method calls in templates.
 */
@Controller
public class CorpusHealthController {

    private final CorpusHealthService healthService;
    private final CorpusManifestService manifestService;
    private final CorpusReportService reportService;

    public CorpusHealthController(CorpusHealthService healthService,
                                  CorpusManifestService manifestService,
                                  CorpusReportService reportService) {
        this.healthService = healthService;
        this.manifestService = manifestService;
        this.reportService = reportService;
    }

    /** View-friendly document row with pre-computed display strings. */
    public record DocRow(
            String statusClass,  // "green", "yellow", "red"
            String statusLabel,  // "OK", "WARN", "FAIL"
            String title,
            String legalDomain,
            String authority,
            String category,
            String date,
            String language,
            String pages,
            int chunkCount,
            int chunksWithEmbeddings,
            int chunksWithoutEmbeddings,
            boolean indexedInQdrant,
            String indexedDisplay,
            String indexedClass,
            int vectorCount,
            String metadataPct,
            String metadataClass,
            String lastIndexing
    ) {}

    /** View-friendly health category row. */
    public record CategoryRow(
            String key,
            String label,
            int count,
            String statusClass,   // "green", "yellow", "red"
            boolean isEmpty,
            List<String> items
    ) {}

    @GetMapping("/admin/corpus-health")
    public String dashboard(Model model) {
        // Ensure manifest is populated from existing documents
        manifestService.syncFromDocuments();

        var report = healthService.generateReport();
        var summary = report.summary();

        // Summary
        model.addAttribute("docCount", summary.documentCount());
        model.addAttribute("chunkCount", summary.chunkCount());
        model.addAttribute("embeddedCount", summary.embeddedChunks());
        model.addAttribute("missingEmbeddings", summary.missingEmbeddings());
        model.addAttribute("qdrantVectors", summary.qdrantVectors());
        model.addAttribute("embeddingCoverage", String.format("%.1f", summary.embeddingCoveragePct()));
        model.addAttribute("avgChunksPerDoc", String.format("%.1f", summary.avgChunksPerDocument()));
        model.addAttribute("avgRetrievalScore", summary.avgRetrievalScore());
        model.addAttribute("qdrantVectorDim", summary.qdrantVectorDimension());

        // Traffic-light summary counts
        model.addAttribute("greenCount", report.documents().stream()
                .filter(d -> d.status() == CorpusHealthService.HealthStatus.GREEN).count());
        model.addAttribute("yellowCount", report.documents().stream()
                .filter(d -> d.status() == CorpusHealthService.HealthStatus.YELLOW).count());
        model.addAttribute("redCount", report.documents().stream()
                .filter(d -> d.status() == CorpusHealthService.HealthStatus.RED).count());

        // Warnings
        model.addAttribute("warnings", report.warnings());
        model.addAttribute("warningCount", report.warnings().size());
        model.addAttribute("hasWarnings", !report.warnings().isEmpty());

        // Document rows
        List<DocRow> rows = new ArrayList<>();
        for (var doc : report.documents()) {
            rows.add(toRow(doc));
        }
        model.addAttribute("rows", rows);

        // Health categories
        List<CategoryRow> categoryRows = new ArrayList<>();
        for (var cat : report.healthCategories()) {
            categoryRows.add(new CategoryRow(
                    cat.key(), cat.label(), cat.count(), cat.statusClass(),
                    cat.items().isEmpty(), cat.items()));
        }
        model.addAttribute("categoryRows", categoryRows);

        // Manifest summary
        model.addAttribute("manifestSummary", manifestService.getSummary());

        return "corpus-health";
    }

    @GetMapping("/admin/corpus-inventory")
    public String inventory(Model model) {
        manifestService.syncFromDocuments();
        var summary = manifestService.getSummary();
        var all = manifestService.findAll();

        model.addAttribute("summary", summary);
        model.addAttribute("entries", all);
        model.addAttribute("byDomain", summary.byDomain());
        model.addAttribute("byPriority", summary.byPriority());

        // Auto-generate the inventory markdown report
        model.addAttribute("reportGenerated", reportService.generateInventoryReport());

        return "corpus-inventory";
    }

    /** Generates docs/CORPUS_INVENTORY.md */
    @PostMapping("/admin/corpus-inventory/generate")
    public String generateInventory() {
        reportService.generateInventoryReport();
        return "redirect:/admin/corpus-inventory";
    }

    /** Generates docs/RELEASE_CORPUS_REPORT.md */
    @PostMapping("/admin/corpus-release-report/generate")
    public String generateReleaseReport() {
        reportService.generateReleaseCorpusReport();
        return "redirect:/admin/corpus-health";
    }

    /** Returns the generated inventory report as plain text. */
    @GetMapping(value = "/admin/corpus-inventory/report", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> inventoryReport() {
        String report = reportService.generateInventoryReport();
        return ResponseEntity.ok(report);
    }

    private static DocRow toRow(CorpusHealthService.DocumentHealth doc) {
        String statusClass = switch (doc.status()) {
            case GREEN -> "green";
            case YELLOW -> "yellow";
            case RED -> "red";
        };
        String statusLabel = switch (doc.status()) {
            case GREEN -> "OK";
            case YELLOW -> "WARN";
            case RED -> "FAIL";
        };

        String indexedDisplay = doc.indexedInQdrant() ? "Ja" : "Nein";
        String indexedClass = doc.indexedInQdrant() ? "health-green" : "health-red";

        String metadataPct = String.format("%.0f%%", doc.metadataCompleteness());
        String metadataClass;
        if (doc.metadataCompleteness() >= 80) {
            metadataClass = "health-green";
        } else if (doc.metadataCompleteness() >= 50) {
            metadataClass = "health-yellow";
        } else {
            metadataClass = "health-red";
        }

        String date = doc.uploadDate().length() >= 10
                ? doc.uploadDate().substring(0, 10) : doc.uploadDate();

        String lastIdx = doc.lastIndexingTime();
        if (lastIdx.length() >= 16) {
            lastIdx = lastIdx.substring(0, 16);
        }

        return new DocRow(
                statusClass, statusLabel, doc.title(), doc.legalDomain(),
                doc.authority(), doc.category(), date, doc.language(),
                doc.pageCount() > 0 ? String.valueOf(doc.pageCount()) : "—",
                doc.chunkCount(), doc.chunksWithEmbeddings(),
                doc.chunksWithoutEmbeddings(), doc.indexedInQdrant(),
                indexedDisplay, indexedClass, doc.vectorCount(),
                metadataPct, metadataClass, lastIdx
        );
    }
}
