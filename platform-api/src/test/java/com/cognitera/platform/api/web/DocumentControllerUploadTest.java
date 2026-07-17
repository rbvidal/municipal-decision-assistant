package com.cognitera.platform.api.web;

import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.api.DocumentIngestionService;
import com.cognitera.platform.document.model.Document;
import com.cognitera.platform.document.model.DocumentMetadata;
import com.cognitera.platform.document.model.DocumentStatus;
import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.document.model.DocumentVersion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("DocumentController — upload endpoint")
class DocumentControllerUploadTest {

    private DocumentController controller;
    private DocumentFacade documents;
    private DocumentIngestionService ingestionService;
    private TestingAuthenticationToken auth;

    @BeforeEach
    void setUp(@TempDir Path tempDir) {
        documents = mock(DocumentFacade.class);
        @SuppressWarnings("unchecked")
        var lifecycleHook = (ObjectProvider<com.cognitera.platform.search.api.DocumentLifecycleHook>)
                mock(ObjectProvider.class);
        var textExtraction = mock(com.cognitera.platform.document.api.TextExtractionService.class);
        var chunks = mock(com.cognitera.platform.search.api.ChunkManagementService.class);
        var batchImport = mock(com.cognitera.platform.api.ingestion.BatchImportService.class);
        ingestionService = mock(DocumentIngestionService.class);

        controller = new DocumentController(documents, lifecycleHook, textExtraction,
                chunks, batchImport, ingestionService);

        auth = new TestingAuthenticationToken("test-user", null);
    }

    private Document fakeDocument(UUID id) {
        var metadata = new DocumentMetadata("Test", DocumentType.PDF, "cat", Set.of(), "PRIVATE");
        var version = new DocumentVersion(UUID.randomUUID(), 1, "test.pdf",
                "application/pdf", 100L, "local-fs", "key", null, "system", Instant.now());
        return new Document(id, null, metadata, DocumentStatus.INGESTION_PENDING,
                1, "test-user", "test-user", Instant.now(), Instant.now(), List.of(version));
    }

    @Test
    @DisplayName("accepts valid file upload")
    void acceptsValidFileUpload() throws Exception {
        UUID docId = UUID.randomUUID();
        when(documents.createDocument(any())).thenReturn(fakeDocument(docId));

        var file = new MockMultipartFile("file", "test.pdf",
                "application/pdf", "PDF content".getBytes());
        var result = controller.upload(file, "Test Doc", "Procurement", "tag1,tag2", auth);

        assertThat(result.getStatusCode().value()).isEqualTo(201);
        assertThat(result.getBody()).containsKey("id");
        assertThat(result.getBody()).containsEntry("status", "INGESTION_PENDING");
    }

    @Test
    @DisplayName("rejects empty file upload")
    void rejectsEmptyFileUpload() throws Exception {
        var file = new MockMultipartFile("file", "test.pdf",
                "application/pdf", new byte[0]);
        var result = controller.upload(file, "Test", null, null, auth);

        assertThat(result.getStatusCode().value()).isEqualTo(400);
        assertThat(result.getBody()).containsKey("error");
    }

    @Test
    @DisplayName("detects PDF type from file extension")
    void detectsPdfType() throws Exception {
        UUID docId = UUID.randomUUID();
        when(documents.createDocument(any())).thenReturn(fakeDocument(docId));

        var file = new MockMultipartFile("file", "regulation.pdf",
                "application/pdf", "PDF content".getBytes());
        var result = controller.upload(file, "Test", null, null, auth);

        assertThat(result.getBody()).containsEntry("type", "PDF");
    }

    @Test
    @DisplayName("detects DOCX type from file extension")
    void detectsDocxType() throws Exception {
        UUID docId = UUID.randomUUID();
        when(documents.createDocument(any())).thenReturn(fakeDocument(docId));

        var file = new MockMultipartFile("file", "document.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "DOCX content".getBytes());
        var result = controller.upload(file, "Test", null, null, auth);

        assertThat(result.getBody()).containsEntry("type", "DOCX");
    }

    @Test
    @DisplayName("uses filename as title when title not provided")
    void usesFilenameAsDefaultTitle() throws Exception {
        UUID docId = UUID.randomUUID();
        when(documents.createDocument(any())).thenReturn(fakeDocument(docId));

        var file = new MockMultipartFile("file", "regulation.pdf",
                "application/pdf", "PDF content".getBytes());
        var result = controller.upload(file, null, null, null, auth);

        assertThat(result.getBody()).containsEntry("title", "regulation.pdf");
    }
}
