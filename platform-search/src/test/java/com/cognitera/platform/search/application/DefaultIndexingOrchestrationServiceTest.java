package com.cognitera.platform.search.application;

import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.api.TextExtractionService;
import com.cognitera.platform.document.model.Document;
import com.cognitera.platform.document.model.DocumentMetadata;
import com.cognitera.platform.document.model.DocumentStatus;
import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.document.model.DocumentVersion;
import com.cognitera.platform.search.api.ChunkManagementService;
import com.cognitera.platform.search.api.ChunkingStrategy;
import com.cognitera.platform.search.api.EmbeddingProvider;
import com.cognitera.platform.search.api.VectorSearchProvider;
import com.cognitera.platform.search.model.ChunkMetadata;
import com.cognitera.platform.search.model.ChunkPosition;
import com.cognitera.platform.search.model.ChunkType;
import com.cognitera.platform.search.model.DocumentChunk;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("DefaultIndexingOrchestrationService — ingestion metrics")
class DefaultIndexingOrchestrationServiceTest {

    private MeterRegistry meterRegistry;
    private DefaultIndexingOrchestrationService service;
    private UUID documentId;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        documentId = UUID.randomUUID();

        var metadata = new DocumentMetadata("Test Regulation", DocumentType.PDF,
                "Procurement", Set.of("test"), "PRIVATE");
        var version = new DocumentVersion(UUID.randomUUID(), 1, "test.pdf",
                "application/pdf", 1024L, "local", "test-key", null, "system", Instant.now());
        Document doc = new Document(documentId, "test-tenant", metadata,
                DocumentStatus.READY, 1, "system", "system",
                Instant.now(), Instant.now(), List.of(version));

        DocumentFacade documents = mock(DocumentFacade.class);
        when(documents.getDocument(documentId, "system")).thenReturn(doc);

        TextExtractionService textExtraction = mock(TextExtractionService.class);
        when(textExtraction.extractText(any(), any())).thenReturn("Sample extracted text.");

        var chunkMeta = new ChunkMetadata("title", DocumentType.PDF, "cat",
                Set.of(), "source", null, Instant.now(), List.of(), null);
        var chunk = new DocumentChunk(UUID.randomUUID(), documentId, 1,
                ChunkType.TEXT, "text", new ChunkPosition(0, 0, 0, 0, 10),
                chunkMeta, Instant.now(), Instant.now());
        ChunkingStrategy chunking = (id, v, title, text) -> List.of(chunk);

        ChunkManagementService chunkMgmt = new ChunkManagementService() {
            public DocumentChunk indexChunk(com.cognitera.platform.search.api.IndexChunkCommand cmd) { return chunk; }
            public DocumentChunk getChunk(UUID id) { throw new UnsupportedOperationException(); }
            public List<DocumentChunk> findChunks(com.cognitera.platform.search.model.SearchFilter f, int p, int s) { return List.of(); }
            public int deleteByDocumentId(UUID id) { return 0; }
        };

        EmbeddingProvider embedding = new EmbeddingProvider() {
            public float[] embed(String text) { return new float[768]; }
            public List<float[]> embedBatch(List<String> texts) {
                return texts.stream().map(t -> new float[768]).toList();
            }
            public int dimension() { return 768; }
            public String modelName() { return "test-model"; }
        };

        VectorSearchProvider vectorSearch = new VectorSearchProvider() {
            public List<com.cognitera.platform.search.model.RetrievalCandidate> search(com.cognitera.platform.search.model.SearchQuery q) { return List.of(); }
            public void index(DocumentChunk c, float[] e) {}
            public void deleteByDocument(UUID id) {}
        };

        service = new DefaultIndexingOrchestrationService(
                documents, textExtraction, chunking, chunkMgmt,
                embedding, vectorSearch, meterRegistry);
    }

    @Test
    @DisplayName("registers phase-level timers during ingestion")
    void registersPhaseTimers() {
        service.indexDocument(documentId);

        assertThat(meterRegistry.find("ingestion.extraction.duration").timer()).isNotNull();
        assertThat(meterRegistry.find("ingestion.chunking.duration").timer()).isNotNull();
        assertThat(meterRegistry.find("ingestion.embedding.duration").timer()).isNotNull();
        assertThat(meterRegistry.find("ingestion.indexing.duration").timer()).isNotNull();
    }

    @Test
    @DisplayName("registers pipeline-level counters after ingestion")
    void registersPipelineCounters() {
        service.indexDocument(documentId);

        assertThat(meterRegistry.find("ingestion.documents.total").counter())
                .isNotNull()
                .satisfies(c -> assertThat(c.count()).isEqualTo(1.0));
        assertThat(meterRegistry.find("ingestion.chunks.total").counter())
                .isNotNull()
                .satisfies(c -> assertThat(c.count()).isGreaterThan(0.0));
    }

    @Test
    @DisplayName("tags metrics with document type")
    void tagsWithDocumentType() {
        service.indexDocument(documentId);

        assertThat(meterRegistry.find("ingestion.extraction.duration")
                .tag("document_type", "PDF").timer()).isNotNull();
    }

    @Test
    @DisplayName("does not register duplicate meters on multiple calls")
    void noDuplicateMeters() {
        service.indexDocument(documentId);
        long countBefore = meterRegistry.getMeters().size();

        service.indexDocument(documentId);
        long countAfter = meterRegistry.getMeters().size();

        assertThat(countAfter).isEqualTo(countBefore);
    }
}
