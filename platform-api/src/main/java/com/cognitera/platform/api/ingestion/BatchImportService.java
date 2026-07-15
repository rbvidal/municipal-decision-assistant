package com.cognitera.platform.api.ingestion;

import com.cognitera.platform.document.api.CreateDocumentCommand;
import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.model.DocumentType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Production batch importer for legal document corpora.
 *
 * <p>Scans a directory tree, validates each PDF against its JSON metadata sidecar,
 * detects duplicates, imports valid files, and produces a detailed summary report.
 * Failures are logged but do not stop the batch — the importer continues.
 */
@Service
public class BatchImportService {

    private static final Logger log = LoggerFactory.getLogger(BatchImportService.class);
    private static final ObjectMapper json = new ObjectMapper();
    private static final int MAX_FILE_SIZE_MB = 50;
    private static final int MIN_TEXT_CHARS = 100;
    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final DocumentFacade documents;
    private final DuplicateDetector duplicateDetector;

    public BatchImportService(DocumentFacade documents, DuplicateDetector duplicateDetector) {
        this.documents = documents;
        this.duplicateDetector = duplicateDetector;
    }

    /**
     * Result of a batch import operation.
     */
    public record BatchResult(
            String batchId,
            String sourceDirectory,
            int totalFiles,
            int imported,
            int skippedDuplicates,
            int skippedNewerVersion,
            int failedValidation,
            int failedImport,
            List<String> errors,
            List<ImportedFile> importedFiles,
            String startedAt,
            String completedAt,
            long durationSeconds
    ) {}

    public record ImportedFile(
            String fileName,
            UUID documentId,
            String title,
            String legalDomain,
            int fileSizeBytes,
            String checksum,
            String status  // IMPORTED, SKIPPED_DUPLICATE, SKIPPED_VERSION, FAILED
    ) {}

    /**
     * Imports all valid files from a directory tree.
     *
     * @param sourceDir    root directory containing PDFs and JSON sidecars
     * @param defaultTags  tags to apply to all imported documents
     * @return batch result with summary
     */
    @Transactional
    public BatchResult importDirectory(String sourceDir, Set<String> defaultTags) throws IOException {
        String batchId = "batch-" + TIMESTAMP.format(LocalDateTime.now());
        long startTime = System.currentTimeMillis();

        Path root = Path.of(sourceDir);
        if (!Files.exists(root)) {
            throw new IllegalArgumentException("Source directory does not exist: " + sourceDir);
        }

        // ── Discover files ──
        List<Path> pdfFiles = new ArrayList<>();
        Files.walkFileTree(root, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                String name = file.getFileName().toString().toLowerCase();
                if (name.endsWith(".pdf") || name.endsWith(".txt")
                        || name.endsWith(".html") || name.endsWith(".htm")
                        || name.endsWith(".docx")) {
                    pdfFiles.add(file);
                }
                return FileVisitResult.CONTINUE;
            }
        });

        log.info("Batch {}: Found {} files in {}", batchId, pdfFiles.size(), sourceDir);

        int imported = 0;
        int skippedDuplicates = 0;
        int skippedNewerVersion = 0;
        int failedValidation = 0;
        int failedImport = 0;
        List<String> errors = new ArrayList<>();
        List<ImportedFile> importedFiles = new ArrayList<>();

        for (Path pdfPath : pdfFiles) {
            String fileName = pdfPath.getFileName().toString();
            Map<String, String> metadata = Map.of("title", fileName.replaceAll("\\.[^.]+$", ""));
            try {
                // ── Find metadata sidecar ──
                Path jsonPath = findSidecar(pdfPath);
                if (jsonPath != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> raw = json.readValue(jsonPath.toFile(), Map.class);
                    Map<String, String> md = new LinkedHashMap<>();
                    raw.forEach((k, v) -> md.put(k, v != null ? v.toString() : ""));
                    metadata = md;
                } else {
                    metadata = Map.of("title", fileName.replaceAll("\\.[^.]+$", ""));
                }

                // ── Validate ──
                byte[] content = Files.readAllBytes(pdfPath);
                List<String> issues = validate(content, pdfPath, metadata);
                if (!issues.isEmpty()) {
                    failedValidation++;
                    String msg = fileName + ": " + String.join("; ", issues);
                    errors.add(msg);
                    log.warn("Batch {}: VALIDATION FAILED — {}", batchId, msg);
                    importedFiles.add(new ImportedFile(fileName, null,
                            metadata.getOrDefault("title", fileName), "", content.length,
                            "", "FAILED_VALIDATION"));
                    continue;
                }

                // ── Duplicate check ──
                String checksum = DuplicateDetector.computeSha256(content);
                String title = metadata.getOrDefault("title", fileName);
                DuplicateDetector.MatchInfo match = duplicateDetector.check(
                        checksum, title, parseDate(metadata.get("publication_date")));

                if (match.result() == DuplicateDetector.MatchResult.EXACT_DUPLICATE) {
                    skippedDuplicates++;
                    log.info("Batch {}: SKIP DUPLICATE — {} matches {}", batchId, fileName, match.existingTitle());
                    importedFiles.add(new ImportedFile(fileName, match.existingDocumentId(),
                            title, "", content.length, checksum, "SKIPPED_DUPLICATE"));
                    continue;
                }
                if (match.result() == DuplicateDetector.MatchResult.NEWER_VERSION) {
                    skippedNewerVersion++;
                    log.info("Batch {}: SKIP NEWER VERSION — {}", batchId, match.message());
                    // Mark existing as historical
                    importedFiles.add(new ImportedFile(fileName, match.existingDocumentId(),
                            title, "", content.length, checksum, "SKIPPED_NEWER_VERSION"));
                    continue;
                }

                // ── Store file ──
                Path uploadDir = Path.of("uploads", "imports");
                Files.createDirectories(uploadDir);
                Path storedPath = uploadDir.resolve(UUID.randomUUID() + "_" + fileName);
                Files.copy(pdfPath, storedPath);

                DocumentType docType = inferType(fileName);

                // ── Merge tags ──
                Set<String> tags = new LinkedHashSet<>(defaultTags);
                tags.add("imported");
                String metadataTags = metadata.get("tags");
                if (metadataTags != null && !metadataTags.isBlank()) {
                    for (String t : metadataTags.split("\\s*,\\s*")) {
                        tags.add(t.trim().toLowerCase());
                    }
                }
                String versionState = metadata.getOrDefault("version_state", "current");
                tags.add(versionState);

                // ── Create document ──
                var doc = documents.createDocument(new CreateDocumentCommand(
                        title,
                        docType,
                        fileName,
                        detectContentType(fileName),
                        content.length,
                        "local-fs",
                        storedPath.toString(),
                        checksum,
                        metadata.getOrDefault("legal_domain",
                                metadata.getOrDefault("category", "DOCUMENT")),
                        tags,
                        "PRIVATE",
                        "batch-import",
                        null));

                documents.createIngestionJob(doc.id(), "batch-import");

                imported++;
                importedFiles.add(new ImportedFile(fileName, doc.id(), title,
                        metadata.getOrDefault("legal_domain", ""),
                        content.length, checksum, "IMPORTED"));
                log.info("Batch {}: IMPORTED — {} → {} ({})", batchId, fileName, doc.id(), title);

            } catch (Exception e) {
                failedImport++;
                String msg = fileName + ": " + e.getMessage();
                errors.add(msg);
                log.error("Batch {}: IMPORT FAILED — {}", batchId, msg, e);
                importedFiles.add(new ImportedFile(fileName, null,
                        metadata.getOrDefault("title", fileName), "", 0, "", "FAILED_IMPORT"));
            }
        }

        long duration = (System.currentTimeMillis() - startTime) / 1000;
        BatchResult result = new BatchResult(batchId, sourceDir, pdfFiles.size(),
                imported, skippedDuplicates, skippedNewerVersion, failedValidation, failedImport,
                errors, importedFiles,
                LocalDateTime.now().minusSeconds(duration).format(TIMESTAMP),
                LocalDateTime.now().format(TIMESTAMP), duration);

        log.info("Batch {} complete: {} imported, {} dupes, {} newer, {} failed validation, {} failed import ({}s)",
                batchId, imported, skippedDuplicates, skippedNewerVersion,
                failedValidation, failedImport, duration);

        return result;
    }

    // ── Validation ──

    private List<String> validate(byte[] content, Path path, Map<String, String> metadata) {
        List<String> issues = new ArrayList<>();
        String fileName = path.getFileName().toString();

        // File size
        long sizeMb = content.length / (1024 * 1024);
        if (sizeMb > MAX_FILE_SIZE_MB) {
            issues.add("File too large: " + sizeMb + " MB (max " + MAX_FILE_SIZE_MB + ")");
        }
        if (content.length == 0) {
            issues.add("File is empty");
        }

        // PDF validation
        if (fileName.toLowerCase().endsWith(".pdf")) {
            if (content.length < 4 || content[0] != '%' || content[1] != 'P'
                    || content[2] != 'D' || content[3] != 'F') {
                issues.add("Corrupt or invalid PDF (missing PDF header)");
            }
        }

        // Required metadata
        List<String> required = List.of("title", "legal_domain");
        for (String field : required) {
            if (!metadata.containsKey(field) || metadata.get(field).isBlank()) {
                issues.add("Missing required metadata field: " + field);
            }
        }

        return issues;
    }

    // ── Helpers ──

    private Path findSidecar(Path pdfPath) {
        String pdfName = pdfPath.getFileName().toString();
        // Strip extension, try .json
        String base = pdfName.contains(".")
                ? pdfName.substring(0, pdfName.lastIndexOf('.'))
                : pdfName;
        Path jsonPath = pdfPath.resolveSibling(base + ".json");
        if (Files.exists(jsonPath)) return jsonPath;
        // Try same name + .json
        jsonPath = pdfPath.resolveSibling(pdfName + ".json");
        if (Files.exists(jsonPath)) return jsonPath;
        return null;
    }

    private DocumentType inferType(String fileName) {
        if (fileName == null) return DocumentType.PDF;
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".docx")) return DocumentType.DOCX;
        if (lower.endsWith(".txt")) return DocumentType.TXT;
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return DocumentType.HTML;
        return DocumentType.PDF;
    }

    private String detectContentType(String fileName) {
        if (fileName == null) return "application/octet-stream";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".txt")) return "text/plain";
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
        return "application/octet-stream";
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        try {
            return LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        } catch (Exception e) {
            return null;
        }
    }
}
