package com.cognitera.platform.api.web;

import com.cognitera.platform.api.dto.document.AddDocumentVersionRequest;
import com.cognitera.platform.api.dto.document.CreateDocumentRequest;
import com.cognitera.platform.api.dto.document.DocumentPageResponse;
import com.cognitera.platform.api.dto.document.DocumentResponse;
import com.cognitera.platform.api.dto.document.UpdateDocumentMetadataRequest;
import com.cognitera.platform.api.dto.document.DocumentContentResponse;
import com.cognitera.platform.api.ingestion.BatchImportService;
import com.cognitera.platform.api.ingestion.ManifestImportService;
import com.cognitera.platform.document.api.AddDocumentVersionCommand;
import com.cognitera.platform.document.api.CreateDocumentCommand;
import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.api.DocumentFilter;
import com.cognitera.platform.document.api.DocumentIngestionService;
import com.cognitera.platform.document.api.TextExtractionService;
import com.cognitera.platform.document.api.UpdateDocumentMetadataCommand;
import com.cognitera.platform.document.model.DocumentStatus;
import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.document.model.DocumentVersion;
import com.cognitera.platform.document.model.Document;
import com.cognitera.platform.search.api.ChunkManagementService;
import com.cognitera.platform.search.api.DocumentLifecycleHook;
import com.cognitera.platform.search.model.SearchFilter;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * REST controller for document CRUD operations, version management, archival, deletion, reindexing, and content retrieval.
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);
    private static final Path UPLOAD_DIR = Path.of("uploads");

    private final DocumentFacade documents;
    private final ObjectProvider<DocumentLifecycleHook> lifecycleHook;
    private final TextExtractionService textExtractionService;
    private final ChunkManagementService chunks;
    private final BatchImportService batchImportService;
    private final ManifestImportService manifestImportService;
    private final DocumentIngestionService ingestionService;

    public DocumentController(DocumentFacade documents, ObjectProvider<DocumentLifecycleHook> lifecycleHook,
                              TextExtractionService textExtractionService, ChunkManagementService chunks,
                              BatchImportService batchImportService,
                              ManifestImportService manifestImportService,
                              DocumentIngestionService ingestionService) {
        this.documents = documents;
        this.lifecycleHook = lifecycleHook;
        this.textExtractionService = textExtractionService;
        this.chunks = chunks;
        this.batchImportService = batchImportService;
        this.manifestImportService = manifestImportService;
        this.ingestionService = ingestionService;
    }

    /**
     * Uploads a document file, stores it locally, creates the document record,
     * and triggers ingestion.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "tags", required = false) String tags,
            Authentication authentication) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File must not be empty"));
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
        String docTitle = title != null && !title.isBlank() ? title.trim() : originalName;
        DocumentType type = detectType(originalName);
        Set<String> tagSet = tags != null && !tags.isBlank()
                ? Set.of(tags.split("\\s*,\\s*")) : Set.of();

        Files.createDirectories(UPLOAD_DIR);
        String storageKey = UPLOAD_DIR.resolve(UUID.randomUUID() + "_" + originalName).toString();
        file.transferTo(Path.of(storageKey));

        var command = new CreateDocumentCommand(
                docTitle, type, originalName, file.getContentType(),
                file.getSize(), "local-fs", storageKey, null,
                category != null ? category.trim() : null,
                tagSet, "PRIVATE", authentication.getName(), null);

        Document doc = documents.createDocument(command);
        log.info("Document {} uploaded: title={}, type={}, size={}",
                doc.id(), docTitle, type, file.getSize());

        ingestionService.createIngestionJob(doc.id(), authentication.getName());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", doc.id());
        response.put("title", docTitle);
        response.put("type", type.name());
        response.put("status", doc.status().name());
        response.put("fileName", originalName);
        response.put("sizeBytes", file.getSize());
        response.put("ingestionPending", true);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private static DocumentType detectType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return DocumentType.PDF;
        if (lower.endsWith(".docx")) return DocumentType.DOCX;
        if (lower.endsWith(".txt")) return DocumentType.TXT;
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return DocumentType.HTML;
        return DocumentType.PDF;
    }

    /**
     * Creates a new document with the provided metadata and storage details.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse create(@Valid @RequestBody CreateDocumentRequest request,
                                    Authentication authentication) {
        return DocumentResponse.from(documents.createDocument(new CreateDocumentCommand(
                request.title(),
                request.type(),
                request.fileName(),
                request.contentType(),
                request.sizeBytes(),
                request.storageProvider(),
                request.storageKey(),
                request.checksumSha256(),
                request.category(),
                request.tags(),
                request.visibility(),
                authentication.getName(),
                request.tenantId())));
    }

    /**
     * Returns a paginated list of documents filtered by optional criteria.
     */
    @GetMapping
    public DocumentPageResponse find(
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(required = false) DocumentType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return DocumentPageResponse.from(documents.findDocuments(new DocumentFilter(
                status,
                type,
                category,
                tag,
                tenantId,
                createdFrom,
                createdTo,
                page,
                size)));
    }

    /**
     * Retrieves a single document by its identifier.
     */
    @GetMapping("/{documentId}")
    public DocumentResponse get(@PathVariable UUID documentId, Authentication authentication) {
        return DocumentResponse.from(documents.getDocument(documentId, authentication.getName()));
    }

    /**
     * Updates the metadata for an existing document.
     */
    @PatchMapping("/{documentId}/metadata")
    public DocumentResponse updateMetadata(
            @PathVariable UUID documentId,
            @Valid @RequestBody UpdateDocumentMetadataRequest request,
            Authentication authentication
    ) {
        return DocumentResponse.from(documents.updateMetadata(new UpdateDocumentMetadataCommand(
                documentId,
                request.title(),
                request.type(),
                request.category(),
                request.tags(),
                request.visibility(),
                authentication.getName())));
    }

    /**
     * Adds a new version to an existing document.
     */
    @PostMapping("/{documentId}/versions")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse addVersion(
            @PathVariable UUID documentId,
            @Valid @RequestBody AddDocumentVersionRequest request,
            Authentication authentication
    ) {
        return DocumentResponse.from(documents.addVersion(new AddDocumentVersionCommand(
                documentId,
                request.fileName(),
                request.contentType(),
                request.sizeBytes(),
                request.storageProvider(),
                request.storageKey(),
                request.checksumSha256(),
                authentication.getName())));
    }

    /**
     * Archives a document, changing its status to {@code ARCHIVED}.
     */
    @PostMapping("/{documentId}/archive")
    public DocumentResponse archive(@PathVariable UUID documentId, Authentication authentication) {
        return DocumentResponse.from(documents.archiveDocument(documentId, authentication.getName()));
    }

    /**
     * Soft-deletes a document, changing its status to {@code DELETED}.
     */
    @DeleteMapping("/{documentId}")
    public DocumentResponse delete(@PathVariable UUID documentId, Authentication authentication) {
        return DocumentResponse.from(documents.deleteDocument(documentId, authentication.getName()));
    }

    /**
     * Triggers reindexing of a document's chunks for search.
     */
    @PostMapping("/{documentId}/reindex")
    public ResponseEntity<Map<String, Object>> reindex(@PathVariable UUID documentId) {
        DocumentLifecycleHook hook = lifecycleHook.getIfAvailable();
        if (hook == null) {
            return ResponseEntity.unprocessableEntity().body(
                    Map.of("error", "Semantic indexing infrastructure not configured"));
        }
        hook.onDocumentReindexed(documentId);
        return ResponseEntity.ok(Map.of("documentId", documentId, "operation", "reindex_triggered"));
    }

    /**
     * Purges a document and its search index entries.
     */
    @DeleteMapping("/{documentId}/purge")
    public ResponseEntity<Map<String, Object>> purge(@PathVariable UUID documentId,
                                                      Authentication authentication) {
        DocumentLifecycleHook hook = lifecycleHook.getIfAvailable();
        if (hook != null) {
            hook.onDocumentDeleted(documentId);
        }
        documents.deleteDocument(documentId, authentication.getName());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("documentId", documentId);
        result.put("purged", hook != null);
        return ResponseEntity.ok(result);
    }

    /**
     * Retrieves a document's full extracted text content with chunk anchor positions.
     */
    @GetMapping("/{documentId}/content")
    public DocumentContentResponse getContent(@PathVariable UUID documentId) {
        Document document = documents.getDocument(documentId, "system");
        DocumentVersion version = document.versions().stream()
                .filter(v -> v.versionNumber() == document.currentVersion())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Document has no current version"));

        String text = textExtractionService.extractText(document.metadata().type(), version);
        List<com.cognitera.platform.search.model.DocumentChunk> chunkList = chunks.findChunks(
                new SearchFilter(Set.of(documentId), null, null, null, null, null, null, null, List.of()),
                0, 500);

        List<DocumentContentResponse.ChunkAnchor> anchors = chunkList.stream()
                .map(c -> new DocumentContentResponse.ChunkAnchor(
                        c.id(), c.position().chunkIndex(),
                        c.position().startOffset(), c.position().endOffset(),
                        c.text().length() > 240 ? c.text().substring(0, 240) : c.text()))
                .toList();

        return new DocumentContentResponse(
                document.id(), document.metadata().title(),
                document.metadata().type() != null ? document.metadata().type().name() : "UNKNOWN",
                version.versionNumber(), text, anchors);
    }

    /**
     * Batch-imports documents from a directory tree.
     * Each PDF should have a JSON metadata sidecar.
     * Returns a summary of imported, skipped, and failed files.
     */
    @PostMapping("/batch-import")
    public ResponseEntity<Map<String, Object>> batchImport(
            @RequestParam String sourceDir,
            @RequestParam(defaultValue = "") String tags) throws IOException {

        Set<String> tagSet = tags.isBlank() ? Set.of() : Set.of(tags.split("\\s*,\\s*"));
        BatchImportService.BatchResult result = batchImportService.importDirectory(sourceDir, tagSet);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("batchId", result.batchId());
        response.put("totalFiles", result.totalFiles());
        response.put("imported", result.imported());
        response.put("skippedDuplicates", result.skippedDuplicates());
        response.put("skippedNewerVersion", result.skippedNewerVersion());
        response.put("failedValidation", result.failedValidation());
        response.put("failedImport", result.failedImport());
        response.put("durationSeconds", result.durationSeconds());
        response.put("errors", result.errors());
        response.put("files", result.importedFiles().stream()
                .map(f -> Map.of("fileName", f.fileName(),
                        "documentId", f.documentId() != null ? f.documentId().toString() : "",
                        "title", f.title(),
                        "status", f.status()))
                .toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Imports documents from a MANIFEST.yaml file.
     * Parses the manifest, locates document files, creates documents,
     * and triggers ingestion (create → extract → chunk → embed → index).
     * Each document is processed independently with failure isolation.
     */
    @PostMapping("/manifest-import")
    public ResponseEntity<Map<String, Object>> manifestImport(
            @RequestParam(defaultValue = "knowledge/MANIFEST.yaml") String manifestPath,
            @RequestParam(defaultValue = "knowledge") String corpusBaseDir) throws IOException {

        ManifestImportService.ManifestBatchResult result =
                manifestImportService.importFromManifest(manifestPath, corpusBaseDir);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("batchId", result.batchId());
        response.put("knowledgeBase", result.knowledgeBase());
        response.put("totalInManifest", result.totalInManifest());
        response.put("created", result.created());
        response.put("imported", result.imported());
        response.put("skippedPlanned", result.skippedPlanned());
        response.put("skippedMissingFile", result.skippedMissingFile());
        response.put("failed", result.failed());
        response.put("durationSeconds", result.durationSeconds());
        response.put("errors", result.errors());
        response.put("documents", result.documents().stream()
                .map(d -> Map.of(
                        "manifestId", d.manifestId(),
                        "title", d.title(),
                        "filePath", d.filePath(),
                        "status", d.status(),
                        "documentId", d.documentId() != null ? d.documentId().toString() : "",
                        "error", d.error() != null ? d.error() : ""))
                .toList());

        return ResponseEntity.ok(response);
    }
}
