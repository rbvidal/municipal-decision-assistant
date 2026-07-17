package com.cognitera.platform.search.application;

import com.cognitera.platform.search.api.CitationService;
import com.cognitera.platform.search.model.ChunkReference;
import com.cognitera.platform.search.model.CitationReference;
import com.cognitera.platform.search.model.DocumentChunk;
import com.cognitera.platform.search.model.RetrievalCandidate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Builds German legal citations from document chunks and retrieval candidates.
 * Formats citations as: "§ [section] [title]" with grouping by document
 * and chunk anchor position data.
 */
@Service
public class DefaultCitationService implements CitationService {

    @Override
    public CitationReference citationFor(DocumentChunk chunk) {
        return new CitationReference(
                chunk.documentId(),
                chunk.id(),
                chunk.documentVersion(),
                chunk.metadata().title(),
                chunk.position().pageNumber(),
                chunk.position().startOffset(),
                chunk.position().endOffset(),
                excerpt(chunk.text()));
    }

    @Override
    public CitationReference citationFor(RetrievalCandidate candidate) {
        return candidate.citation();
    }

    /**
     * Builds a German legal-format citation string from a chunk reference.
     * Format: "§ [section] [title]" when a section reference exists,
     * otherwise: "[title]".
     */
    public String formatLegalCitation(ChunkReference chunk) {
        String title = chunk.title() != null ? chunk.title() : "Unbekannt";
        return "§ " + title;
    }

    /**
     * Builds a citation string with section reference extracted from text.
     * Format: "§ [number] [title]" when a section is found, otherwise "[title]".
     */
    public String formatCitationWithSection(ChunkReference chunk, String text) {
        String section = extractSectionFromText(text);
        String title = chunk.title() != null ? chunk.title() : "Unbekannt";
        if (section != null) {
            return "§ " + section + " " + title;
        }
        return title;
    }

    /**
     * Groups retrieval candidates by document ID, producing a map of
     * document title → list of formatted legal citations.
     */
    public Map<String, List<String>> groupCitationsByDocument(List<RetrievalCandidate> candidates) {
        Map<UUID, GroupedDoc> byDoc = new LinkedHashMap<>();
        for (RetrievalCandidate c : candidates) {
            ChunkReference chunk = c.chunk();
            UUID docId = chunk.documentId();
            String title = chunk.title() != null ? chunk.title() : "Unbekannt";
            String citation = formatCitationWithSection(chunk, c.text());
            byDoc.computeIfAbsent(docId, k -> new GroupedDoc(title))
                    .citations.add(citation);
        }
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (GroupedDoc g : byDoc.values()) {
            result.put(g.title, g.citations.stream().distinct().toList());
        }
        return result;
    }

    /**
     * Returns the document viewer URL fragment for anchoring to a specific chunk.
     */
    public String chunkAnchorLink(ChunkReference chunk) {
        return "/documents/" + chunk.documentId() + "?chunk=" + chunk.chunkId()
                + "&start=" + (chunk.position() != null ? chunk.position().startOffset() : 0)
                + "&end=" + (chunk.position() != null ? chunk.position().endOffset() : 0);
    }

    /**
     * Extracts the first § reference from chunk text.
     */
    String extractSectionFromText(String text) {
        if (text == null) return null;
        var m = java.util.regex.Pattern.compile("§\\s*(\\d+[a-z]?)")
                .matcher(text);
        return m.find() ? m.group(1) : null;
    }

    private String excerpt(String text) {
        if (text == null || text.length() <= 240) {
            return text;
        }
        return text.substring(0, 240);
    }

    private static class GroupedDoc {
        final String title;
        final List<String> citations = new ArrayList<>();

        GroupedDoc(String title) {
            this.title = title;
        }
    }
}
