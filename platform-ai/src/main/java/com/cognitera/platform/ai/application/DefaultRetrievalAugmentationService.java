package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.*;
import com.cognitera.platform.ai.model.*;
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
 * The old quota-enforced retrieval that launched targeted searches
 * for every "missing" source role is removed.
 */
@Service
public class DefaultRetrievalAugmentationService implements RetrievalAugmentationService {

    private static final Logger log = LoggerFactory.getLogger(DefaultRetrievalAugmentationService.class);

    private final SearchFacade searchFacade;
    private final AuthorityGroundingService authorityGroundingService;
    private final RetrievalPlanner retrievalPlanner;

    public DefaultRetrievalAugmentationService(
            SearchFacade searchFacade,
            AuthorityGroundingService authorityGroundingService,
            RetrievalPlanner retrievalPlanner) {
        this.searchFacade = searchFacade;
        this.authorityGroundingService = authorityGroundingService;
        this.retrievalPlanner = retrievalPlanner;
    }

    @Override
    public RetrievalContext retrieve(AiRequest request) {
        // ── Plan retrieval once ──
        RetrievalPlan plan = retrievalPlanner.plan(request);

        // ── Execute single hybrid search ──
        SearchFilter filter = new SearchFilter(
                null, null, null, null, null, null, null, null, List.of());
        var searchQuery = new SearchQuery(
                request.question(),
                SearchMode.HYBRID,
                filter,
                new SearchRequestContext("system", null, null, null),
                0,
                plan.maxResults());
        var page = searchFacade.search(searchQuery);

        // ── Apply diversity constraint: max N chunks per document ──
        List<SearchResult> diverseResults = enforceDiversity(
                page.results(), plan.maxChunksPerDocument());

        log.info("Retrieval: {} total → {} diverse (max {}/doc) | domain={}",
                page.results().size(), diverseResults.size(),
                plan.maxChunksPerDocument(), plan.primaryDomain());

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

        log.info("Retrieval diversity: {} docs across {} unique titles | {} authorities",
                sources.size(), countUniqueDocs(sources), authorityResult.references().size());

        return new RetrievalContext(
                request.question(),
                plan.retrievalStrategy(),
                sources,
                authorityResult.references(),
                null, null, null);
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
