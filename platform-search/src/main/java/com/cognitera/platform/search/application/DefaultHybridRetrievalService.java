package com.cognitera.platform.search.application;

import com.cognitera.platform.audit.api.AuditEventType;
import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.search.api.GraphSearchProvider;
import com.cognitera.platform.search.api.HybridRetrievalService;
import com.cognitera.platform.search.api.KeywordSearchProvider;
import com.cognitera.platform.search.api.QueryIntentClassifier;
import com.cognitera.platform.search.api.RerankingProvider;
import com.cognitera.platform.search.api.RerankingService;
import com.cognitera.platform.search.api.VectorSearchProvider;
import com.cognitera.platform.search.model.QueryIntent;
import com.cognitera.platform.search.model.RetrievalCandidate;
import com.cognitera.platform.search.model.SearchMode;
import com.cognitera.platform.search.model.SearchQuery;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.ObjectProvider;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/** Combines keyword and vector search results, merges them with configurable weights,
 *  deduplicates by document, and optionally applies cross-encoder reranking. */
@Service
public class DefaultHybridRetrievalService implements HybridRetrievalService {

    private static final Logger log = LoggerFactory.getLogger(DefaultHybridRetrievalService.class);

    private final KeywordSearchProvider keywordSearchProvider;
    private final VectorSearchProvider vectorSearchProvider;
    private final GraphSearchProvider graphSearchProvider;
    private final RerankingService rerankingService;
    private final SearchAuditPublisher auditPublisher;
    private final QueryIntentClassifier intentClassifier;
    private final ObjectProvider<RerankingProvider> rerankingProvider;
    private final RetrievalProperties retrievalProperties;
    private final MeterRegistry meterRegistry;

    public DefaultHybridRetrievalService(
            KeywordSearchProvider keywordSearchProvider,
            VectorSearchProvider vectorSearchProvider,
            GraphSearchProvider graphSearchProvider,
            RerankingService rerankingService,
            SearchAuditPublisher auditPublisher,
            QueryIntentClassifier intentClassifier,
            ObjectProvider<RerankingProvider> rerankingProvider,
            RetrievalProperties retrievalProperties,
            MeterRegistry meterRegistry) {
        this.keywordSearchProvider = keywordSearchProvider;
        this.vectorSearchProvider = vectorSearchProvider;
        this.graphSearchProvider = graphSearchProvider;
        this.rerankingService = rerankingService;
        this.auditPublisher = auditPublisher;
        this.intentClassifier = intentClassifier;
        this.rerankingProvider = rerankingProvider;
        this.retrievalProperties = retrievalProperties;
        this.meterRegistry = meterRegistry;
    }

    @Override
    public List<RetrievalCandidate> retrieve(SearchQuery query) {
        if (query.query() == null || query.query().isBlank()) {
            log.warn("RETRIEVAL Empty query received — returning empty result");
            return List.of();
        }

        Timer.Sample sample = Timer.start(meterRegistry);
        QueryIntent intent = intentClassifier.classify(query.query());
        log.info("RETRIEVAL [{}] Query: '{}' | Mode: {} | Intent: {}",
                query.context().requestId() != null ? query.context().requestId() : "no-id",
                query.query().length() > 80 ? query.query().substring(0, 80) + "..." : query.query(),
                query.mode(), intent.intent());

        List<RetrievalCandidate> keywordResults = shouldRunKeyword(query.mode())
                ? keywordSearchProvider.search(query)
                : List.of();
        log.info("RETRIEVAL Keyword hits: {}", keywordResults.size());

        List<RetrievalCandidate> vectorResults;
        if (shouldRunVector(query.mode())) {
            try {
                vectorResults = vectorSearchProvider.search(query);
            } catch (Exception e) {
                log.warn("RETRIEVAL Vector search unavailable: {}", e.getMessage());
                vectorResults = List.of();
            }
        } else {
            vectorResults = List.of();
        }
        log.info("RETRIEVAL Vector hits: {}", vectorResults.size());

        List<RetrievalCandidate> graphResults = shouldRunGraph(query.mode())
                ? graphSearchProvider.search(query)
                : List.of();
        log.info("RETRIEVAL GraphRAG nodes: {}", graphResults.size());

        List<RetrievalCandidate> merged = merge(keywordResults, vectorResults, graphResults, intent);
        log.info("RETRIEVAL Merged candidates: {} (chunk-level), {} unique docs",
                merged.size(), countUniqueDocs(merged));

        List<RetrievalCandidate> baseReranked = rerankingService.rerank(query, merged);
        RerankingProvider crossReranker = rerankingProvider.getIfAvailable();
        List<RetrievalCandidate> crossReranked = crossReranker != null
                ? crossReranker.rerank(query, baseReranked)
                : baseReranked;

        sample.stop(Timer.builder("retrieval.duration")
                .description("Total hybrid retrieval duration")
                .tag("mode", query.mode().name())
                .register(meterRegistry));

        log.info("RETRIEVAL Final (after rerank): {} candidates", crossReranked.size());
        if (crossReranked.isEmpty()) {
            log.warn("RETRIEVAL ZERO results — query may be in a different language than the indexed documents, "
                    + "or embeddings may not have been generated. Keyword hits: {}, Vector hits: {}, Graph hits: {}",
                    keywordResults.size(), vectorResults.size(), graphResults.size());
        }

        auditPublisher.emit(
                query.context().actorId(),
                query.context().tenantId(),
                AuditEventType.RETRIEVAL_EXECUTED,
                query.context().requestId(),
                Map.of(
                        "mode", query.mode().name(),
                        "intent", intent.intent(),
                        "keywordCandidates", Integer.toString(keywordResults.size()),
                        "vectorCandidates", Integer.toString(vectorResults.size()),
                        "graphCandidates", Integer.toString(graphResults.size()),
                        "resultCount", Integer.toString(crossReranked.size())));
        return crossReranked;
    }

    private boolean shouldRunKeyword(SearchMode mode) {
        return mode == SearchMode.KEYWORD || mode == SearchMode.HYBRID || mode == SearchMode.HYBRID_GRAPH;
    }

    private boolean shouldRunVector(SearchMode mode) {
        return mode == SearchMode.SEMANTIC || mode == SearchMode.HYBRID || mode == SearchMode.HYBRID_GRAPH;
    }

    private boolean shouldRunGraph(SearchMode mode) {
        return (mode == SearchMode.GRAPH || mode == SearchMode.HYBRID_GRAPH
                || mode == SearchMode.HYBRID)
                && graphSearchProvider.isAvailable();
    }

    /**
     * Merges results from keyword, vector, and graph sources.
     * Deduplicates by chunk ID (first seen wins) and by document ID
     * (keeps highest-ranking chunk per document).
     */
    private List<RetrievalCandidate> merge(List<RetrievalCandidate> keywordResults,
                                            List<RetrievalCandidate> vectorResults,
                                            List<RetrievalCandidate> graphResults,
                                            QueryIntent intent) {
        // Phase 1: Merge by chunk ID
        Map<UUID, RetrievalCandidate> byChunk = new LinkedHashMap<>();
        keywordResults.forEach(c -> byChunk.put(c.chunk().chunkId(), c));
        vectorResults.forEach(c -> byChunk.merge(
                c.chunk().chunkId(), c,
                (first, second) -> combine(first, second, intent)));
        graphResults.forEach(c -> byChunk.merge(
                c.chunk().chunkId(), c,
                (existing, graph) -> combineWithGraph(existing, graph)));

        // Phase 2: Deduplicate by document ID — keep highest-ranking chunk per document
        Map<UUID, RetrievalCandidate> byDoc = new LinkedHashMap<>();
        for (RetrievalCandidate c : byChunk.values()) {
            UUID docId = c.chunk().documentId();
            byDoc.merge(docId, c, (existing, incoming) ->
                    incoming.rankingScore() > existing.rankingScore() ? incoming : existing);
        }

        return List.copyOf(byDoc.values());
    }

    private RetrievalCandidate combine(RetrievalCandidate first, RetrievalCandidate second, QueryIntent intent) {
        double keywordWeight = retrievalProperties.getKeywordWeight();
        double vectorWeight = retrievalProperties.getVectorWeight();
        double confidenceWeight = retrievalProperties.getConfidenceWeight();
        double keywordScore = Math.max(first.keywordScore(), second.keywordScore());
        double vectorScore = Math.max(first.vectorScore(), second.vectorScore());
        double docTypeWeight = intent.weightFor(first.chunk().documentType());
        double rankingScore = ((keywordScore * keywordWeight)
                + (vectorScore * vectorWeight)
                + (Math.max(first.confidenceScore(), second.confidenceScore()) * confidenceWeight))
                * docTypeWeight;
        return new RetrievalCandidate(
                first.chunk(), first.text(),
                keywordScore, vectorScore,
                Math.min(1.0, rankingScore),
                Math.max(first.confidenceScore(), second.confidenceScore()),
                "hybrid", first.citation());
    }

    private RetrievalCandidate combineWithGraph(RetrievalCandidate existing, RetrievalCandidate graph) {
        double graphBoost = graph.rankingScore() > 0 ? graph.rankingScore() * 0.15 : 0;
        double newScore = Math.min(1.0, existing.rankingScore() + graphBoost);
        return new RetrievalCandidate(
                existing.chunk(), existing.text(),
                existing.keywordScore(), existing.vectorScore(),
                newScore, existing.confidenceScore(),
                "hybrid+graph", existing.citation());
    }

    private static long countUniqueDocs(List<RetrievalCandidate> candidates) {
        return candidates.stream().map(c -> c.chunk().documentId()).distinct().count();
    }
}
