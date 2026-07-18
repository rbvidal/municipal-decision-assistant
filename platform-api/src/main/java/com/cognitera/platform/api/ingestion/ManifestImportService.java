package com.cognitera.platform.api.ingestion;

import com.cognitera.platform.document.api.CreateDocumentCommand;
import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.model.DocumentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Manifest-driven batch import for legal document corpora.
 *
 * <p>Parses a MANIFEST.yaml file, locates document files, and drives
 * the full pipeline: create → extract → chunk → embed → index.
 * Each document is processed independently with failure isolation —
 * one failure does not stop the batch.
 */
@Service
public class ManifestImportService {

    private static final Logger log = LoggerFactory.getLogger(ManifestImportService.class);
    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final DocumentFacade documents;
    private final DuplicateDetector duplicateDetector;

    public ManifestImportService(DocumentFacade documents, DuplicateDetector duplicateDetector) {
        this.documents = documents;
        this.duplicateDetector = duplicateDetector;
    }

    /** Result of a manifest-driven batch import. */
    public record ManifestBatchResult(
            String batchId,
            String manifestPath,
            String knowledgeBase,
            int totalInManifest,
            int created,
            int imported,
            int skippedPlanned,
            int skippedMissingFile,
            int failed,
            List<String> errors,
            List<DocumentEntry> documents,
            String startedAt,
            String completedAt,
            long durationSeconds
    ) {}

    public record DocumentEntry(
            String manifestId,
            String title,
            String filePath,
            String status,       // IMPORTED, SKIPPED_PLANNED, MISSING_FILE, FAILED
            UUID documentId,
            String error
    ) {}

    @SuppressWarnings("unchecked")
    @Transactional
    public ManifestBatchResult importFromManifest(String manifestPath, String corpusBaseDir) throws IOException {
        String batchId = "manifest-" + TIMESTAMP.format(LocalDateTime.now());
        long startTime = System.currentTimeMillis();

        Path manifestFile = Path.of(manifestPath);
        if (!Files.exists(manifestFile)) {
            throw new IllegalArgumentException("Manifest file does not exist: " + manifestPath);
        }

        // ── Parse YAML ──
        Yaml yaml = new Yaml();
        Map<String, Object> manifest;
        try {
            manifest = yaml.load(Files.readString(manifestFile));
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse manifest YAML: " + e.getMessage(), e);
        }

        Map<String, Object> meta = (Map<String, Object>) manifest.getOrDefault("meta", Map.of());
        String knowledgeBase = (String) meta.getOrDefault("project", "Unknown");
        List<String> domains = (List<String>) meta.getOrDefault("domains", List.of());

        log.info("Manifest batch {}: Parsed manifest v{} — {} domains, {} total documents",
                batchId, meta.getOrDefault("version", "?"), domains.size(),
                meta.getOrDefault("total_documents", 0));

        // ── Collect all document entries ──
        List<Map<String, Object>> manifestDocs = new ArrayList<>();
        for (String domain : domains) {
            String key = domain + "_regulations";
            Object domainSection = manifest.get(key);
            if (domainSection instanceof List) {
                for (Object entry : (List<Object>) domainSection) {
                    if (entry instanceof Map) {
                        Map<String, Object> doc = (Map<String, Object>) entry;
                        doc.put("_domain", domain);
                        manifestDocs.add(doc);
                    }
                }
            }
        }

        log.info("Manifest batch {}: {} document entries found in manifest", batchId, manifestDocs.size());

        int created = 0;
        int imported = 0;
        int skippedPlanned = 0;
        int skippedMissingFile = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();
        List<DocumentEntry> entries = new ArrayList<>();

        for (Map<String, Object> doc : manifestDocs) {
            String id = (String) doc.getOrDefault("id", "unknown");
            String title = (String) doc.getOrDefault("title", "Untitled");
            String filePath = (String) doc.getOrDefault("file", "");
            String status = (String) doc.getOrDefault("status", "PLANNED");
            String domain = (String) doc.getOrDefault("_domain", "general");

            // Skip planned documents
            if ("PLANNED".equalsIgnoreCase(status)) {
                skippedPlanned++;
                entries.add(new DocumentEntry(id, title, filePath, "SKIPPED_PLANNED", null, null));
                continue;
            }

            // Resolve file path
            Path resolvedPath = Path.of(corpusBaseDir).resolve(filePath).normalize();
            if (!Files.exists(resolvedPath)) {
                // Try alternate locations
                Path alt = Path.of(corpusBaseDir).resolve(id + ".txt");
                if (Files.exists(alt)) resolvedPath = alt;
                else {
                    skippedMissingFile++;
                    String msg = id + ": File not found — " + filePath;
                    errors.add(msg);
                    log.warn("Manifest batch {}: {}", batchId, msg);
                    entries.add(new DocumentEntry(id, title, filePath, "MISSING_FILE", null, msg));
                    continue;
                }
            }

            try {
                byte[] content = Files.readAllBytes(resolvedPath);
                if (content.length < 100) {
                    failed++;
                    String msg = id + ": File too small (" + content.length + " bytes)";
                    errors.add(msg);
                    entries.add(new DocumentEntry(id, title, filePath, "FAILED", null, msg));
                    continue;
                }

                String fileName = resolvedPath.getFileName().toString();
                String checksum = computeSha256(content);
                DocumentType docType = inferType(fileName);

                // Duplicate check
                var match = duplicateDetector.check(checksum, title, null);
                if (match.result() == DuplicateDetector.MatchResult.EXACT_DUPLICATE) {
                    entries.add(new DocumentEntry(id, title, filePath, "IMPORTED",
                            match.existingDocumentId(), "Already exists (duplicate)"));
                    imported++;
                    continue;
                }

                // Store file
                Path uploadDir = Path.of("uploads", "manifest-imports");
                Files.createDirectories(uploadDir);
                Path stored = uploadDir.resolve(UUID.randomUUID() + "_" + fileName);
                Files.copy(resolvedPath, stored);

                // Create document
                Set<String> tags = new LinkedHashSet<>();
                tags.add("manifest-imported");
                tags.add(domain);

                var docEntity = documents.createDocument(new CreateDocumentCommand(
                        title, docType, fileName,
                        detectContentType(fileName), content.length,
                        "local-fs", stored.toString(), checksum,
                        domain, tags, "PRIVATE", "manifest-import", null));

                // Trigger ingestion job
                documents.createIngestionJob(docEntity.id(), "manifest-import");

                created++;
                imported++;
                entries.add(new DocumentEntry(id, title, filePath, "IMPORTED", docEntity.id(), null));
                log.info("Manifest batch {}: IMPORTED — {} → {} ({})", batchId, id, docEntity.id(), title);

            } catch (Exception e) {
                failed++;
                String msg = id + ": " + e.getMessage();
                errors.add(msg);
                log.error("Manifest batch {}: FAILED — {}", batchId, msg, e);
                entries.add(new DocumentEntry(id, title, filePath, "FAILED", null, msg));
            }
        }

        long duration = (System.currentTimeMillis() - startTime) / 1000;
        ManifestBatchResult result = new ManifestBatchResult(
                batchId, manifestPath, knowledgeBase, manifestDocs.size(),
                created, imported, skippedPlanned, skippedMissingFile, failed,
                errors, entries,
                LocalDateTime.now().minusSeconds(duration).format(TIMESTAMP),
                LocalDateTime.now().format(TIMESTAMP), duration);

        log.info("Manifest batch {} complete: {} created, {} imported, {} planned, {} missing, {} failed ({}s)",
                batchId, created, imported, skippedPlanned, skippedMissingFile, failed, duration);

        return result;
    }

    private DocumentType inferType(String fileName) {
        if (fileName == null) return DocumentType.TXT;
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return DocumentType.PDF;
        if (lower.endsWith(".docx")) return DocumentType.DOCX;
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return DocumentType.HTML;
        if (lower.endsWith(".md")) return DocumentType.TXT;
        return DocumentType.TXT;
    }

    private String detectContentType(String fileName) {
        if (fileName == null) return "text/plain";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".md")) return "text/markdown";
        return "text/plain";
    }

    private String computeSha256(byte[] content) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(content);
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
