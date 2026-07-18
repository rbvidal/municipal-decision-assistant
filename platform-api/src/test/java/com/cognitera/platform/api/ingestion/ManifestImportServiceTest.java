package com.cognitera.platform.api.ingestion;

import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.model.Document;
import com.cognitera.platform.document.model.DocumentMetadata;
import com.cognitera.platform.document.model.DocumentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for manifest-driven batch import with failure isolation.
 */
class ManifestImportServiceTest {

    private ManifestImportService service;
    private DocumentFacade documents;
    private DuplicateDetector duplicateDetector;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        documents = mock(DocumentFacade.class);
        duplicateDetector = mock(DuplicateDetector.class);
        service = new ManifestImportService(documents, duplicateDetector);

        when(duplicateDetector.check(any(), any(), any()))
                .thenReturn(new DuplicateDetector.MatchInfo(
                        DuplicateDetector.MatchResult.NEW, null, null, "new document"));
    }

    @Test
    void shouldParseManifestAndImportCreatedDocuments() throws Exception {
        // Create a minimal manifest
        String manifestYaml = """
            meta:
              project: Test Knowledge Base
              version: 1.0.0
              total_documents: 2
              domains:
                - procurement
            procurement_regulations:
              - id: PROC-001
                title: Test Regulation
                file: procurement/test.txt
                status: CREATED
                priority: HIGHEST
                indexing_order: 1
              - id: PROC-002
                title: Planned Regulation
                file: procurement/planned.txt
                status: PLANNED
                priority: HIGH
                indexing_order: 2
            """;

        Path manifestFile = tempDir.resolve("MANIFEST.yaml");
        Files.writeString(manifestFile, manifestYaml);

        // Create a document file
        Path docFile = tempDir.resolve("procurement").resolve("test.txt");
        Files.createDirectories(docFile.getParent());
        Files.writeString(docFile, "This is test content for the regulation. ".repeat(20));

        // Mock document creation — return a proper Document record
        when(documents.createDocument(any())).thenAnswer(inv -> {
            var cmd = inv.getArgument(0, com.cognitera.platform.document.api.CreateDocumentCommand.class);
            return new Document(UUID.randomUUID(), null,
                    new DocumentMetadata(cmd.title(), cmd.type(), cmd.category(), cmd.tags(), "PRIVATE"),
                    DocumentStatus.DRAFT, 0, "batch-import", null,
                    Instant.now(), Instant.now(), List.of());
        });
        when(documents.createIngestionJob(any(), any())).thenReturn(null);

        // Run import
        var result = service.importFromManifest(manifestFile.toString(), tempDir.toString());

        assertEquals(2, result.totalInManifest());
        assertEquals(1, result.imported());
        assertEquals(1, result.skippedPlanned());
        assertEquals(0, result.failed());
        assertEquals(0, result.skippedMissingFile());
        assertEquals("Test Knowledge Base", result.knowledgeBase());
        assertTrue(result.durationSeconds() >= 0);

        // Verify document entries
        assertEquals(2, result.documents().size());
        assertEquals("IMPORTED", result.documents().get(0).status());
        assertEquals("SKIPPED_PLANNED", result.documents().get(1).status());
    }

    @Test
    void shouldHandleMissingFiles() throws Exception {
        String manifestYaml = """
            meta:
              project: Test
              version: 1.0
              domains:
                - building
            building_regulations:
              - id: BUILD-001
                title: Missing File Doc
                file: building/nonexistent.txt
                status: CREATED
                priority: HIGH
              - id: BUILD-002
                title: Another Missing
                file: building/also-missing.txt
                status: CREATED
                priority: HIGH
            """;

        Path manifestFile = tempDir.resolve("MANIFEST.yaml");
        Files.writeString(manifestFile, manifestYaml);

        var result = service.importFromManifest(manifestFile.toString(), tempDir.toString());

        assertEquals(2, result.totalInManifest());
        assertEquals(0, result.imported());
        assertEquals(2, result.skippedMissingFile());
        assertEquals(2, result.errors().size());
    }

    @Test
    void shouldHandleEmptyManifest() throws Exception {
        String manifestYaml = """
            meta:
              project: Empty
              version: 1.0
              domains: []
            """;

        Path manifestFile = tempDir.resolve("MANIFEST.yaml");
        Files.writeString(manifestFile, manifestYaml);

        var result = service.importFromManifest(manifestFile.toString(), tempDir.toString());

        assertEquals(0, result.totalInManifest());
        assertEquals(0, result.imported());
    }

    @Test
    void shouldRejectNonExistentManifest() {
        assertThrows(IllegalArgumentException.class, () ->
                service.importFromManifest(tempDir.resolve("nonexistent.yaml").toString(),
                        tempDir.toString()));
    }

    @Test
    void shouldSkipSmallFiles() throws Exception {
        String manifestYaml = """
            meta:
              project: Test
              version: 1.0
              domains:
                - procurement
            procurement_regulations:
              - id: PROC-001
                title: Tiny File
                file: procurement/tiny.txt
                status: CREATED
                priority: HIGH
            """;

        Path manifestFile = tempDir.resolve("MANIFEST.yaml");
        Files.writeString(manifestFile, manifestYaml);

        Path docFile = tempDir.resolve("procurement").resolve("tiny.txt");
        Files.createDirectories(docFile.getParent());
        Files.writeString(docFile, "too small");

        var result = service.importFromManifest(manifestFile.toString(), tempDir.toString());

        assertEquals(1, result.totalInManifest());
        assertEquals(1, result.failed());
        assertEquals(0, result.imported());
    }

    @Test
    void shouldHandleFailureIsolation() throws Exception {
        when(documents.createDocument(any())).thenThrow(new RuntimeException("DB error"));

        String manifestYaml = """
            meta:
              project: Test
              version: 1.0
              domains:
                - procurement
            procurement_regulations:
              - id: PROC-001
                title: Will Fail
                file: procurement/test.txt
                status: CREATED
                priority: HIGH
              - id: PROC-002
                title: Planned Doc
                file: procurement/p2.txt
                status: PLANNED
                priority: HIGH
            """;

        Path manifestFile = tempDir.resolve("MANIFEST.yaml");
        Files.writeString(manifestFile, manifestYaml);

        Path docFile = tempDir.resolve("procurement").resolve("test.txt");
        Files.createDirectories(docFile.getParent());
        Files.writeString(docFile, "This is test content for the regulation. ".repeat(20));

        var result = service.importFromManifest(manifestFile.toString(), tempDir.toString());

        assertEquals(2, result.totalInManifest());
        assertEquals(1, result.failed());       // PROC-001 failed
        assertEquals(1, result.skippedPlanned()); // PROC-002 skipped
    }
}
