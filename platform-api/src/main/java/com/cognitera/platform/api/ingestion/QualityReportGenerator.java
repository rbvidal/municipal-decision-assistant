package com.cognitera.platform.api.ingestion;

import com.cognitera.platform.document.infrastructure.persistence.DocumentEntity;
import com.cognitera.platform.document.infrastructure.persistence.JpaDocumentEntityRepository;
import com.cognitera.platform.search.infrastructure.persistence.DocumentChunkEntity;
import com.cognitera.platform.search.infrastructure.persistence.JpaDocumentChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Generates Markdown quality reports after each batch ingestion.
 * Reports cover: ingestion success, duplicates, extraction quality,
 * metadata completeness, chunk statistics, and embedding coverage.
 */
@Component
public class QualityReportGenerator {

    private static final Logger log = LoggerFactory.getLogger(QualityReportGenerator.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final JpaDocumentEntityRepository documentRepo;
    private final JpaDocumentChunkRepository chunkRepo;

    public QualityReportGenerator(JpaDocumentEntityRepository documentRepo,
                                   JpaDocumentChunkRepository chunkRepo) {
        this.documentRepo = documentRepo;
        this.chunkRepo = chunkRepo;
    }

    /**
     * Generates all quality reports for a batch import.
     *
     * @param batchResult the result from {@link BatchImportService}
     * @param outputDir   where to write the reports (e.g., docs/imports/batch-20250714/)
     */
    public void generateReports(BatchImportService.BatchResult batchResult, Path outputDir)
            throws IOException {
        Files.createDirectories(outputDir);

        writeSummaryReport(batchResult, outputDir.resolve("SUMMARY.md"));
        writeIngestionReport(batchResult, outputDir.resolve("INGESTION_REPORT.md"));
        writeMetadataReport(outputDir.resolve("METADATA_REPORT.md"));
        writeChunkReport(outputDir.resolve("CHUNK_REPORT.md"));
        writeEmbeddingReport(outputDir.resolve("EMBEDDING_REPORT.md"));

        log.info("Quality reports generated in {}", outputDir);
    }

    private void writeSummaryReport(BatchImportService.BatchResult batch, Path path)
            throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("# Batch Import Summary\n\n");
        sb.append("**Batch ID:** ").append(batch.batchId()).append("\n\n");
        sb.append("**Source:** ").append(batch.sourceDirectory()).append("\n\n");
        sb.append("**Duration:** ").append(batch.durationSeconds()).append(" seconds\n\n");

        sb.append("## Results\n\n");
        sb.append("| Metric | Count |\n");
        sb.append("|---|---|\n");
        sb.append("| Total files scanned | ").append(batch.totalFiles()).append(" |\n");
        sb.append("| Imported successfully | ").append(batch.imported()).append(" |\n");
        sb.append("| Skipped (duplicates) | ").append(batch.skippedDuplicates()).append(" |\n");
        sb.append("| Skipped (newer version exists) | ").append(batch.skippedNewerVersion()).append(" |\n");
        sb.append("| Failed validation | ").append(batch.failedValidation()).append(" |\n");
        sb.append("| Failed import | ").append(batch.failedImport()).append(" |\n\n");

        double successRate = batch.totalFiles() > 0
                ? 100.0 * batch.imported() / batch.totalFiles() : 0;
        sb.append("**Import success rate:** ").append(String.format("%.1f%%", successRate)).append("\n\n");

        if (!batch.errors().isEmpty()) {
            sb.append("## Errors\n\n");
            for (String err : batch.errors()) {
                sb.append("- ").append(err).append("\n");
            }
            sb.append("\n");
        }

        sb.append("## Imported Files\n\n");
        sb.append("| # | File | Document ID | Title | Domain | Size | Status |\n");
        sb.append("|---|---|---|---|---|---|---|\n");
        int idx = 1;
        for (var f : batch.importedFiles()) {
            sb.append("| ").append(idx++).append(" | ")
                    .append(f.fileName()).append(" | ")
                    .append(f.documentId() != null ? f.documentId() : "—").append(" | ")
                    .append(f.title()).append(" | ")
                    .append(f.legalDomain()).append(" | ")
                    .append(formatBytes(f.fileSizeBytes())).append(" | ")
                    .append(f.status()).append(" |\n");
        }

        Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
    }

    private void writeIngestionReport(BatchImportService.BatchResult batch, Path path)
            throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("# Ingestion Report\n\n");
        sb.append("**Generated:** ").append(LocalDateTime.now().format(DATE_FMT)).append("\n\n");

        long importedIds = batch.importedFiles().stream()
                .filter(f -> f.documentId() != null && "IMPORTED".equals(f.status())).count();

        sb.append("| Metric | Value |\n");
        sb.append("|---|---|\n");
        sb.append("| Documents ingested | ").append(importedIds).append(" |\n");
        sb.append("| Documents awaiting worker | ").append(importedIds).append(" |\n");
        sb.append("| Worker poll interval | 10 seconds |\n");
        sb.append("| Estimated time to full index | ").append(importedIds * 10).append(" seconds |\n");

        Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
    }

    private void writeMetadataReport(Path path) throws IOException {
        List<DocumentEntity> docs = documentRepo.findAll();
        // Only report on recently imported documents (tagged "imported")
        List<DocumentEntity> imported = docs.stream()
                .filter(d -> d.getTags().contains("imported"))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("# Metadata Completeness Report\n\n");
        sb.append("**Documents analyzed:** ").append(imported.size()).append("\n\n");

        if (imported.isEmpty()) {
            sb.append("No imported documents found.\n");
            Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
            return;
        }

        // Per-field completeness
        Map<String, Integer> fieldCounts = new LinkedHashMap<>();
        fieldCounts.put("title", 0);
        fieldCounts.put("category", 0);
        fieldCounts.put("tags", 0);
        fieldCounts.put("type", 0);

        for (var doc : imported) {
            if (doc.getTitle() != null && !doc.getTitle().isBlank()) fieldCounts.merge("title", 1, Integer::sum);
            if (doc.getCategory() != null && !doc.getCategory().isBlank()) fieldCounts.merge("category", 1, Integer::sum);
            if (!doc.getTags().isEmpty()) fieldCounts.merge("tags", 1, Integer::sum);
            if (doc.getType() != null) fieldCounts.merge("type", 1, Integer::sum);
        }

        sb.append("| Field | Present | Coverage |\n");
        sb.append("|---|---|---|\n");
        for (var entry : fieldCounts.entrySet()) {
            double pct = 100.0 * entry.getValue() / imported.size();
            sb.append("| ").append(entry.getKey()).append(" | ").append(entry.getValue())
                    .append(" / ").append(imported.size()).append(" | ")
                    .append(String.format("%.1f%%", pct)).append(" |\n");
        }
        sb.append("\n");

        // Per-document detail
        sb.append("## Per-Document Metadata\n\n");
        sb.append("| Title | Category | Tags | Type |\n");
        sb.append("|---|---|---|---|\n");
        for (var doc : imported) {
            sb.append("| ").append(truncate(doc.getTitle(), 50)).append(" | ")
                    .append(doc.getCategory() != null ? doc.getCategory() : "—").append(" | ")
                    .append(doc.getTags().size()).append(" tags").append(" | ")
                    .append(doc.getType()).append(" |\n");
        }

        Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
    }

    private void writeChunkReport(Path path) throws IOException {
        List<DocumentChunkEntity> chunks = chunkRepo.findAll();
        // Filter to imported documents
        List<DocumentEntity> imported = documentRepo.findAll().stream()
                .filter(d -> d.getTags().contains("imported"))
                .toList();
        Set<UUID> importedIds = new HashSet<>();
        for (var doc : imported) importedIds.add(doc.getId());

        List<DocumentChunkEntity> importedChunks = chunks.stream()
                .filter(c -> importedIds.contains(c.getDocumentId()))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("# Chunk Statistics Report\n\n");

        if (importedChunks.isEmpty()) {
            sb.append("No chunks found for imported documents. Ingestion may still be pending.\n");
            Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
            return;
        }

        double avgSize = importedChunks.stream().mapToInt(c -> c.getText().length()).average().orElse(0);
        int minSize = importedChunks.stream().mapToInt(c -> c.getText().length()).min().orElse(0);
        int maxSize = importedChunks.stream().mapToInt(c -> c.getText().length()).max().orElse(0);

        // § reference coverage
        long withSectionRef = importedChunks.stream()
                .filter(c -> c.getAttributes().stream()
                        .anyMatch(a -> "section_ref".equals(a.getKey())))
                .count();

        sb.append("| Metric | Value |\n");
        sb.append("|---|---|\n");
        sb.append("| Total chunks | ").append(importedChunks.size()).append(" |\n");
        sb.append("| Average chunk size | ").append(String.format("%.0f", avgSize)).append(" chars |\n");
        sb.append("| Min chunk size | ").append(minSize).append(" chars |\n");
        sb.append("| Max chunk size | ").append(maxSize).append(" chars |\n");
        sb.append("| Chunks with § reference | ").append(withSectionRef)
                .append(" (").append(String.format("%.1f%%",
                        100.0 * withSectionRef / importedChunks.size())).append(") |\n");
        sb.append("| Unique documents chunked | ").append(importedIds.size()).append(" |\n");
        sb.append("| Avg chunks per document | ").append(String.format("%.1f",
                (double) importedChunks.size() / Math.max(importedIds.size(), 1))).append(" |\n");

        Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
    }

    private void writeEmbeddingReport(Path path) throws IOException {
        List<DocumentChunkEntity> chunks = chunkRepo.findAll();
        List<DocumentEntity> imported = documentRepo.findAll().stream()
                .filter(d -> d.getTags().contains("imported"))
                .toList();
        Set<UUID> importedIds = new HashSet<>();
        for (var doc : imported) importedIds.add(doc.getId());

        List<DocumentChunkEntity> importedChunks = chunks.stream()
                .filter(c -> importedIds.contains(c.getDocumentId()))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("# Embedding Coverage Report\n\n");

        if (importedChunks.isEmpty()) {
            sb.append("No chunks found for imported documents.\n");
            Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
            return;
        }

        long embedded = importedChunks.stream()
                .filter(c -> c.getEmbeddingReference() != null && !c.getEmbeddingReference().isBlank())
                .count();

        sb.append("| Metric | Value |\n");
        sb.append("|---|---|\n");
        sb.append("| Total chunks | ").append(importedChunks.size()).append(" |\n");
        sb.append("| Chunks with embeddings | ").append(embedded).append(" |\n");
        sb.append("| Embedding coverage | ").append(String.format("%.1f%%",
                100.0 * embedded / Math.max(importedChunks.size(), 1))).append(" |\n");
        sb.append("| Chunks without embeddings | ").append(importedChunks.size() - embedded).append(" |\n");

        if (embedded < importedChunks.size()) {
            sb.append("\n**WARNING:** Not all chunks have embeddings. ");
            sb.append("Ensure Ollama is running and `platform.search.embedding.ollama.base-url` is set.\n");
        }

        Files.writeString(path, sb.toString(), StandardCharsets.UTF_8);
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }

    private String truncate(String s, int maxLen) {
        if (s == null) return "—";
        return s.length() > maxLen ? s.substring(0, maxLen) + "..." : s;
    }
}
