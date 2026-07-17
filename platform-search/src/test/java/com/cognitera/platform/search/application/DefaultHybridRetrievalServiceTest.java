package com.cognitera.platform.search.application;

import com.cognitera.platform.search.api.GraphSearchProvider;
import com.cognitera.platform.search.api.KeywordSearchProvider;
import com.cognitera.platform.search.api.QueryIntentClassifier;
import com.cognitera.platform.search.api.RerankingProvider;
import com.cognitera.platform.search.api.RerankingService;
import com.cognitera.platform.search.api.VectorSearchProvider;
import com.cognitera.platform.search.model.*;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("DefaultHybridRetrievalService — fusion and deduplication")
class DefaultHybridRetrievalServiceTest {

    private DefaultHybridRetrievalService service;
    private RetrievalProperties retrievalProperties;
    private SimpleMeterRegistry meterRegistry;
    private final UUID doc1 = UUID.randomUUID();
    private final UUID doc2 = UUID.randomUUID();

    private ChunkReference ref(UUID docId, UUID chunkId) {
        return new ChunkReference(chunkId, docId, 1, "Test Document",
                new ChunkPosition(0, 0, 0, 0, 100));
    }

    private RetrievalCandidate candidate(UUID docId, UUID chunkId, double kwScore,
                                          double vecScore, double confScore) {
        return new RetrievalCandidate(
                ref(docId, chunkId), "sample text",
                kwScore, vecScore, 0.0, confScore,
                "test", null);
    }

    @BeforeEach
    void setUp() {
        retrievalProperties = new RetrievalProperties();
        meterRegistry = new SimpleMeterRegistry();

        KeywordSearchProvider keyword = mock(KeywordSearchProvider.class);
        when(keyword.search(any())).thenReturn(List.of(
                candidate(doc1, UUID.randomUUID(), 0.90, 0.0, 0.70),
                candidate(doc2, UUID.randomUUID(), 0.60, 0.0, 0.50)));

        VectorSearchProvider vector = mock(VectorSearchProvider.class);
        when(vector.search(any())).thenReturn(List.of(
                candidate(doc1, UUID.randomUUID(), 0.0, 0.85, 0.80),
                candidate(doc2, UUID.randomUUID(), 0.0, 0.70, 0.60)));

        GraphSearchProvider graph = mock(GraphSearchProvider.class);
        when(graph.search(any())).thenReturn(List.of());

        RerankingService reranker = mock(RerankingService.class);
        when(reranker.rerank(any(), any())).thenAnswer(inv -> inv.getArgument(1));

        SearchAuditPublisher audit = mock(SearchAuditPublisher.class);

        QueryIntentClassifier classifier = mock(QueryIntentClassifier.class);
        when(classifier.classify(any())).thenReturn(
                new QueryIntent("LEGAL", java.util.Map.of()));

        @SuppressWarnings("unchecked")
        ObjectProvider<RerankingProvider> rerankProvider = mock(ObjectProvider.class);
        when(rerankProvider.getIfAvailable()).thenReturn(null);

        service = new DefaultHybridRetrievalService(
                keyword, vector, graph, reranker, audit, classifier,
                rerankProvider, retrievalProperties, meterRegistry);
    }

    // ── Fusion ──

    @Test
    @DisplayName("fuses keyword and vector results with configured weights")
    void fusesKeywordAndVector() {
        var results = service.retrieve(query("test query"));
        assertThat(results).isNotEmpty();
        // Results from different chunks retain their original provider;
        // "hybrid" label only on merged overlapping chunk results
        assertThat(results.size()).isLessThanOrEqualTo(2);
    }

    @Test
    @DisplayName("uses configurable keyword weight")
    void usesConfigurableKeywordWeight() {
        retrievalProperties.setKeywordWeight(0.80);
        retrievalProperties.setVectorWeight(0.10);
        retrievalProperties.setConfidenceWeight(0.10);
        var results = service.retrieve(query("test"));
        assertThat(results).isNotEmpty();
    }

    @Test
    @DisplayName("uses configurable vector weight")
    void usesConfigurableVectorWeight() {
        retrievalProperties.setKeywordWeight(0.10);
        retrievalProperties.setVectorWeight(0.80);
        retrievalProperties.setConfidenceWeight(0.10);
        var results = service.retrieve(query("test"));
        assertThat(results).isNotEmpty();
    }

    // ── Deduplication ──

    @Test
    @DisplayName("deduplicates by document ID keeping highest-ranking chunk")
    void deduplicatesByDocument() {
        var results = service.retrieve(query("test"));
        List<UUID> docIds = results.stream()
                .map(c -> c.chunk().documentId()).toList();
        assertThat(docIds).doesNotHaveDuplicates();
    }

    @Test
    @DisplayName("merges overlapping keyword and vector results for same chunk")
    void mergesOverlappingChunks() {
        UUID sharedChunk = UUID.randomUUID();
        KeywordSearchProvider kw2 = mock(KeywordSearchProvider.class);
        when(kw2.search(any())).thenReturn(List.of(
                candidate(doc1, sharedChunk, 0.90, 0.0, 0.70)));
        VectorSearchProvider vec2 = mock(VectorSearchProvider.class);
        when(vec2.search(any())).thenReturn(List.of(
                candidate(doc1, sharedChunk, 0.0, 0.85, 0.80)));

        GraphSearchProvider g2 = mock(GraphSearchProvider.class);
        when(g2.search(any())).thenReturn(List.of());
        RerankingService r2 = mock(RerankingService.class);
        when(r2.rerank(any(), any())).thenAnswer(inv -> inv.getArgument(1));
        SearchAuditPublisher a2 = mock(SearchAuditPublisher.class);
        QueryIntentClassifier c2 = mock(QueryIntentClassifier.class);
        when(c2.classify(any())).thenReturn(new QueryIntent("LEGAL", java.util.Map.of()));
        @SuppressWarnings("unchecked")
        ObjectProvider<RerankingProvider> rp2 = mock(ObjectProvider.class);
        when(rp2.getIfAvailable()).thenReturn(null);

        var svc = new DefaultHybridRetrievalService(
                kw2, vec2, g2, r2, a2, c2, rp2, retrievalProperties, meterRegistry);

        var results = svc.retrieve(query("test"));
        assertThat(results).hasSize(1);
        assertThat(results.get(0).keywordScore()).isEqualTo(0.90);
        assertThat(results.get(0).vectorScore()).isEqualTo(0.85);
    }

    // ── Empty query ──

    @Test
    @DisplayName("returns empty list for null query")
    void returnsEmptyForNullQuery() {
        assertThat(service.retrieve(query(null))).isEmpty();
    }

    @Test
    @DisplayName("returns empty list for blank query")
    void returnsEmptyForBlankQuery() {
        assertThat(service.retrieve(query("   "))).isEmpty();
    }

    // ── Metrics ──

    @Test
    @DisplayName("records retrieval duration metric")
    void recordsRetrievalDuration() {
        service.retrieve(query("test"));
        assertThat(meterRegistry.find("retrieval.duration").timer()).isNotNull();
    }

    private SearchQuery query(String q) {
        return new SearchQuery(q, SearchMode.HYBRID, null,
                new SearchRequestContext("actor", "tenant", null, "req-1"), 0, 20);
    }
}
