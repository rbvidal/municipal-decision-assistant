package com.cognitera.platform.api.config;

import com.cognitera.platform.neo4j.model.GraphNode;
import com.cognitera.platform.neo4j.service.GraphEnrichmentService;
import com.cognitera.platform.search.api.GraphSearchProvider;
import com.cognitera.platform.search.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

/**
 * Adapter bridging Neo4j graph enrichment to the search pipeline's GraphSearchProvider SPI.
 * Enables GraphRAG: graph traversal results participate in retrieval fusion.
 */
@Component
@ConditionalOnProperty(name = "platform.neo4j.uri")
public class Neo4jGraphSearchAdapter implements GraphSearchProvider {

    private static final Logger log = LoggerFactory.getLogger(Neo4jGraphSearchAdapter.class);

    private final GraphEnrichmentService graphService;

    public Neo4jGraphSearchAdapter(GraphEnrichmentService graphService) {
        this.graphService = graphService;
    }

    @Override
    public boolean isAvailable() {
        return graphService.isAvailable();
    }

    @Override
    public List<RetrievalCandidate> search(SearchQuery query) {
        if (!isAvailable() || query.query() == null || query.query().isBlank()) return List.of();
        try {
            // Phase 1: Find document nodes matching query keywords
            List<String> keywords = extractKeywords(query.query());
            if (keywords.isEmpty()) return List.of();

            List<GraphNode> docNodes = graphService.searchDocumentsByKeywords(keywords, 10);
            if (docNodes.isEmpty()) return List.of();

            // Phase 2: Traverse from matching documents to find related chunks and documents
            List<String> seedIds = docNodes.stream().map(GraphNode::getId).toList();
            List<GraphNode> relatedNodes = graphService.traverse(seedIds, 2);

            // Phase 3: Merge document nodes with traversal results
            Set<String> seenIds = new HashSet<>();
            List<GraphNode> allNodes = new ArrayList<>();
            for (GraphNode n : docNodes) {
                if (seenIds.add(n.getId())) allNodes.add(n);
            }
            for (GraphNode n : relatedNodes) {
                if (seenIds.add(n.getId())) allNodes.add(n);
            }

            // Phase 4: Build retrieval candidates
            List<RetrievalCandidate> candidates = new ArrayList<>();
            for (int i = 0; i < allNodes.size(); i++) {
                GraphNode node = allNodes.get(i);
                String label = node.getLabel() != null ? node.getLabel() : "";
                String docIdStr = (String) node.getProperties().getOrDefault("docId",
                        node.getId());
                UUID chunkId = UUID.nameUUIDFromBytes((node.getId() + i).getBytes());
                UUID docUuid = safeUuid(docIdStr);

                ChunkReference chunkRef = new ChunkReference(chunkId, docUuid, 1,
                        label, new ChunkPosition(null, null, i, null, null));

                String excerpt = label.length() > 200 ? label.substring(0, 200) : label;
                CitationReference citation = new CitationReference(
                        docUuid, chunkId, 1, label,
                        null, null, null, excerpt);

                double graphScore = node.getType() == GraphNode.NodeType.DOCUMENT
                        ? 0.6 : 0.5;

                candidates.add(new RetrievalCandidate(chunkRef, label,
                        0.0, 0.0, Math.min(1.0, graphScore),
                        0.3, "graph", citation));
            }
            log.info("GraphRAG: {} document hits + {} related = {} candidates (keywords: {})",
                    docNodes.size(), relatedNodes.size(), candidates.size(),
                    keywords.size());
            return candidates;
        } catch (Exception e) {
            log.warn("Graph search failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public List<String> findRelatedDocuments(String documentId, int maxDepth) {
        if (!isAvailable()) return List.of();
        return graphService.findRelatedDocuments(documentId, maxDepth);
    }

    private List<String> extractKeywords(String query) {
        return Arrays.stream(query.toLowerCase().split("\\W+"))
                .filter(w -> w.length() > 3)
                .distinct()
                .limit(10)
                .toList();
    }

    private static UUID safeUuid(String s) {
        try { return UUID.fromString(s); }
        catch (IllegalArgumentException e) { return UUID.nameUUIDFromBytes(s.getBytes()); }
    }
}
