package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.*;
import com.cognitera.platform.ai.model.*;
import com.cognitera.platform.search.api.GraphSearchProvider;
import com.cognitera.platform.search.api.SearchFacade;
import com.cognitera.platform.search.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Single-pass, diversity-aware retrieval. NO recursive searches.
 *
 * <p>One question → one retrieval → one set of results.
 * When Neo4j graph is available, retrieval mode is upgraded to
 * HYBRID_GRAPH so graph traversal results contribute to the candidate set.
 */
@Service
public class DefaultRetrievalAugmentationService implements RetrievalAugmentationService {

    private static final Logger log = LoggerFactory.getLogger(DefaultRetrievalAugmentationService.class);

    private final SearchFacade searchFacade;
    private final AuthorityGroundingService authorityGroundingService;
    private final RetrievalPlanner retrievalPlanner;
    private final DomainGate domainGate;
    private final GraphSearchProvider graphSearchProvider;
    private final SourceOrchestrationService sourceOrchestrationService;

    public DefaultRetrievalAugmentationService(
            SearchFacade searchFacade,
            AuthorityGroundingService authorityGroundingService,
            RetrievalPlanner retrievalPlanner,
            DomainGate domainGate,
            GraphSearchProvider graphSearchProvider,
            SourceOrchestrationService sourceOrchestrationService) {
        this.searchFacade = searchFacade;
        this.authorityGroundingService = authorityGroundingService;
        this.retrievalPlanner = retrievalPlanner;
        this.domainGate = domainGate;
        this.graphSearchProvider = graphSearchProvider;
        this.sourceOrchestrationService = sourceOrchestrationService;
    }

    @Override
    public RetrievalContext retrieve(AiRequest request) {
        // ── Plan retrieval once ──
        RetrievalPlan plan = retrievalPlanner.plan(request);

        // ── Execute single hybrid search ──
        SearchFilter filter = new SearchFilter(
                null, null, null, null, null, null, null, null, List.of());
        boolean graphAvailable = graphSearchProvider != null && graphSearchProvider.isAvailable();
        SearchMode searchMode = graphAvailable ? SearchMode.HYBRID_GRAPH : SearchMode.HYBRID;
        log.info("Retrieval mode: {} (graphAvailable={})", searchMode, graphAvailable);
        var searchQuery = new SearchQuery(
                request.question(),
                searchMode,
                filter,
                new SearchRequestContext("system", null, null, null),
                0,
                plan.maxResults());
        var page = searchFacade.search(searchQuery);

        // ── Apply domain filter — DomainGate was previously computed but never applied ──
        List<SearchResult> domainFiltered = page.results();
        if (!page.results().isEmpty()) {
            List<String> titles = page.results().stream()
                    .map(r -> r.citation() != null ? r.citation().title() : null)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
            if (!titles.isEmpty()) {
                DomainGate.FilterResult domainResult = domainGate.filter(
                        request.question(), titles);
                Set<String> accepted = new LinkedHashSet<>(domainResult.accepted());
                domainFiltered = page.results().stream()
                        .filter(r -> r.citation() == null || r.citation().title() == null
                                || accepted.contains(r.citation().title()))
                        .toList();
                log.info("DomainGate: {} accepted, {} rejected → {} results remain (was {})",
                        accepted.size(), domainResult.rejected().size(),
                        domainFiltered.size(), page.results().size());
            }
        }

        // ── Apply diversity constraint: max N chunks per document ──
        List<SearchResult> diverseResults = enforceDiversity(
                domainFiltered, plan.maxChunksPerDocument());

        log.info("Retrieval: {} total → {} domain-filtered → {} diverse (max {}/doc) | domain={}",
                page.results().size(), domainFiltered.size(), diverseResults.size(),
                plan.maxChunksPerDocument(), plan.primaryDomain());

        // ── Per-source breakdown ──
        long keywordHits = page.results().stream().filter(r -> r.keywordScore() > 0).count();
        long vectorHits = page.results().stream().filter(r -> r.vectorScore() > 0).count();
        long graphHits = page.results().stream().filter(r -> "graph".equalsIgnoreCase(r.provider())).count();
        long reranked = page.results().stream().filter(r -> r.rerankScore() > 0).count();
        log.info("Retrieval breakdown: keyword={} vector={} graph={} reranked={}",
                keywordHits, vectorHits, graphHits, reranked);

        // ── Build citations ──
        List<SourceCitation> sources = new ArrayList<>();
        for (var r : diverseResults) {
            sources.add(new SourceCitation(
                    r.chunk().documentId(), r.chunk().chunkId(),
                    r.chunk().documentVersion(),
                    r.citation().title() != null ? r.citation().title() : "",
                    r.citation().pageNumber(),
                    r.citation().startOffset(),
                    r.citation().endOffset(),
                    r.citation().excerpt() != null ? r.citation().excerpt() : r.text(),
                    r.score(),
                    SourceCitation.classifyTier(r.score()),
                    SourceCitation.SourceType.FACTUAL));
        }

        // ── Authority grounding ──
        var authorityResult = authorityGroundingService.ground(request.question());

        // ── Build source dossier for coverage confidence ──
        SourceDossier dossier = sourceOrchestrationService.buildDossier(
                sources, request.question());
        log.info("Source dossier: coverageScore={}, {} sources classified",
                dossier.coverageScore(), sources.size());

        log.info("Retrieval diversity: {} docs across {} unique titles | {} authorities",
                sources.size(), countUniqueDocs(sources), authorityResult.references().size());

        return new RetrievalContext(
                request.question(),
                plan.retrievalStrategy(),
                sources,
                authorityResult.references(),
                null, dossier, null, null);
    }

    /**
     * Enforces diversity: at most maxPerDoc chunks from any single document.
     * Chunks are kept in ranking order but the maxPerDoc constraint
     * ensures different regulations appear.
     */
    private List<SearchResult> enforceDiversity(List<SearchResult> results, int maxPerDoc) {
        List<SearchResult> diverse = new ArrayList<>();
        Map<UUID, Integer> docCounts = new LinkedHashMap<>();

        for (var r : results) {
            UUID docKey = r.chunk().documentId();
            int count = docCounts.getOrDefault(docKey, 0);
            if (count < maxPerDoc) {
                diverse.add(r);
                docCounts.put(docKey, count + 1);
            }
        }
        return diverse;
    }

    private long countUniqueDocs(List<SourceCitation> sources) {
        return sources.stream()
                .map(s -> s.title() != null ? s.title() : s.documentId().toString())
                .distinct().count();
    }
}
