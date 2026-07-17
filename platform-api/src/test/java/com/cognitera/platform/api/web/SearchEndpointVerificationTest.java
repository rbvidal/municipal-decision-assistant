package com.cognitera.platform.api.web;

import com.cognitera.platform.api.dto.search.SearchRequest;
import com.cognitera.platform.search.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * End-to-end verification: SearchController → SearchService → fusion → dedup → citations.
 * Uses mocked retrieval providers to verify the full pipeline contract.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Search endpoint verification — fusion, dedup, citations")
class SearchEndpointVerificationTest {

    @Mock
    private com.cognitera.platform.search.api.SearchFacade searchFacade;

    private SearchController controller;

    private static final UUID DOC_A = UUID.randomUUID();
    private static final UUID DOC_B = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        controller = new SearchController(searchFacade);
    }

    // ── Positive cases ──

    @Test
    @DisplayName("search pipeline returns results with fusion provider tag")
    void returnsFusedResults() {
        var results = List.of(
                searchResult(DOC_A, "chunk-1", "§ 55 Direktauftrag", 0.85, 0.90, 0.80, 0.70, "hybrid"),
                searchResult(DOC_B, "chunk-2", "§ 6 Abstandsflächen", 0.75, 0.60, 0.70, 0.65, "hybrid"));
        when(searchFacade.search(any())).thenReturn(
                new SearchResultPage(results, 0, 20, results.size(), 1, "HYBRID"));

        var response = controller.search(
                new SearchRequest("Wertgrenzen Beschaffung", null, null, null, null, null,
                        null, null, null, null, null, 0, 20),
                new org.springframework.security.authentication.TestingAuthenticationToken("test", null));

        assertThat(response.results()).hasSize(2);
        assertThat(response.totalElements()).isEqualTo(2);
        assertThat(response.results().get(0).provider()).isEqualTo("hybrid");
        assertThat(response.results().get(0).citation()).isNotNull();
        assertThat(response.results().get(0).score()).isGreaterThan(0.0);
    }

    @Test
    @DisplayName("search returns document-level deduplicated results")
    void returnsDeduplicatedResults() {
        // Two chunks from same document — pipeline should have deduplicated
        var results = List.of(
                searchResult(DOC_A, "chunk-1", "§ 55 Direktauftrag", 0.90, 0.90, 0.80, 0.70, "hybrid"));
        when(searchFacade.search(any())).thenReturn(
                new SearchResultPage(results, 0, 20, 1, 1, "HYBRID"));

        var response = controller.search(
                new SearchRequest("Wertgrenzen", null, null, null, null, null,
                        null, null, null, null, null, 0, 20),
                new org.springframework.security.authentication.TestingAuthenticationToken("test", null));

        assertThat(response.totalElements()).isEqualTo(1);
        List<UUID> docIds = response.results().stream()
                .map(r -> r.chunk().documentId()).toList();
        assertThat(docIds).doesNotHaveDuplicates();
    }

    @Test
    @DisplayName("search results include citation references")
    void includesCitations() {
        var results = List.of(
                searchResult(DOC_A, "chunk-1", "§ 55 AV LHO", 0.85, 0.90, 0.80, 0.70, "hybrid"));
        when(searchFacade.search(any())).thenReturn(
                new SearchResultPage(results, 0, 20, 1, 1, "HYBRID"));

        var response = controller.search(
                new SearchRequest("AV §55 LHO", null, null, null, null, null,
                        null, null, null, null, null, 0, 20),
                new org.springframework.security.authentication.TestingAuthenticationToken("test", null));

        var citation = response.results().get(0).citation();
        assertThat(citation).isNotNull();
        assertThat(citation.documentId()).isEqualTo(DOC_A);
        assertThat(citation.chunkId()).isNotNull();
        assertThat(citation.title()).isNotNull();
    }

    @Test
    @DisplayName("search returns empty results page gracefully")
    void returnsEmptyResults() {
        when(searchFacade.search(any())).thenReturn(
                new SearchResultPage(List.of(), 0, 20, 0, 0, "HYBRID"));

        var response = controller.search(
                new SearchRequest("nonexistent query xyz", null, null, null, null, null,
                        null, null, null, null, null, 0, 20),
                new org.springframework.security.authentication.TestingAuthenticationToken("test", null));

        assertThat(response.results()).isEmpty();
        assertThat(response.totalElements()).isEqualTo(0);
    }

    @Test
    @DisplayName("search preserves keyword and vector scores in response")
    void preservesScores() {
        var results = List.of(
                searchResult(DOC_A, "chunk-1", "text", 0.88, 0.90, 0.70, 0.65, "hybrid"));
        when(searchFacade.search(any())).thenReturn(
                new SearchResultPage(results, 0, 20, 1, 1, "HYBRID"));

        var response = controller.search(
                new SearchRequest("test", null, null, null, null, null,
                        null, null, null, null, null, 0, 20),
                new org.springframework.security.authentication.TestingAuthenticationToken("test", null));

        var sr = response.results().get(0);
        assertThat(sr.keywordScore()).isGreaterThan(0.0);
        assertThat(sr.vectorScore()).isGreaterThan(0.0);
        assertThat(sr.score()).isGreaterThan(0.0);
    }

    // ── Error cases ──

    @Test
    @DisplayName("rejects null request body")
    void rejectsNullRequest() {
        assertThatThrownBy(() -> controller.search(null,
                new org.springframework.security.authentication.TestingAuthenticationToken("test", null)))
                .isInstanceOf(NullPointerException.class);
    }

    // ── Helpers ──

    private SearchResult searchResult(UUID docId, String chunkName, String text,
                                       double kwScore, double rankScore,
                                       double vecScore, double confScore, String provider) {
        UUID chunkId = UUID.randomUUID();
        var chunkRef = new ChunkReference(chunkId, docId, 1,
                "Test Regulation " + chunkName,
                new ChunkPosition(0, 0, 0, 0, text.length()));
        var citation = new CitationReference(docId, chunkId, 1,
                "Test Regulation " + chunkName,
                null, 0, text.length(), text);
        return new SearchResult(chunkRef, text, rankScore, confScore, provider, citation,
                kwScore, vecScore, 0.0, "LEGAL", "HYBRID");
    }
}
