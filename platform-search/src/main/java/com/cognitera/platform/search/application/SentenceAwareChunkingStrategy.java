package com.cognitera.platform.search.application;

import com.cognitera.platform.search.api.ChunkingStrategy;
import com.cognitera.platform.search.model.ChunkMetadata;
import com.cognitera.platform.search.model.ChunkPosition;
import com.cognitera.platform.search.model.ChunkType;
import com.cognitera.platform.search.model.DocumentChunk;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Chunks text at sentence boundaries with configurable target chunk size and overlap. */
public class SentenceAwareChunkingStrategy implements ChunkingStrategy {

    private static final Pattern SENTENCE_BOUNDARY = Pattern.compile(
            "(?<=[.!?])\\s+(?=[A-Z\\u0410-\\u042F\\n])|(?<=\\n\\n)|(?<=[:;])\\s+(?=[A-Z\\u0410-\\u042F])");

    private final int maxChunkSize;
    private final int overlap;

    public SentenceAwareChunkingStrategy(ChunkingProperties properties) {
        this.maxChunkSize = Math.max(properties.getMaxChunkSize(), 100);
        this.overlap = clampOverlap(properties.getOverlap());
    }

    private int clampOverlap(int value) {
        if (value < 0) return 0;
        if (value >= maxChunkSize) return maxChunkSize / 4;
        return value;
    }

    @Override
    public List<DocumentChunk> chunk(UUID documentId, int documentVersion, String title, String text) {
        String normalized = text == null ? "" : text.replace("\r\n", "\n").trim();
        if (normalized.isBlank()) {
            return List.of();
        }

        List<Integer> boundaries = findSentenceBoundaries(normalized);
        List<DocumentChunk> chunks = new ArrayList<>();
        int start = 0;
        int chunkIndex = 0;

        while (start < normalized.length()) {
            int idealEnd = Math.min(start + maxChunkSize, normalized.length());
            int end = findBestSplitPoint(normalized, boundaries, start, idealEnd);
            String slice = normalized.substring(start, end).trim();
            if (!slice.isBlank()) {
                chunks.add(createChunk(documentId, documentVersion, title, slice, chunkIndex, start, end));
                chunkIndex++;
            }
            if (end >= normalized.length()) {
                break;
            }
            start = Math.max(start + maxChunkSize - overlap, findPreviousBoundary(boundaries, end));
            start = Math.min(start, normalized.length());
        }
        return chunks;
    }

    private int findBestSplitPoint(String text, List<Integer> boundaries, int start, int idealEnd) {
        if (idealEnd >= text.length()) {
            return text.length();
        }
        int minSize = maxChunkSize / 3;
        for (int boundary : boundaries) {
            if (boundary > start + minSize && boundary <= idealEnd + 200) {
                return Math.min(boundary, text.length());
            }
        }
        int fallback = text.indexOf('\n', idealEnd - 100);
        if (fallback > start + minSize && fallback < idealEnd + 200) {
            return fallback + 1;
        }
        return Math.min(idealEnd, text.length());
    }

    private int findPreviousBoundary(List<Integer> boundaries, int position) {
        for (int i = boundaries.size() - 1; i >= 0; i--) {
            if (boundaries.get(i) < position) {
                return boundaries.get(i);
            }
        }
        return position;
    }

    private List<Integer> findSentenceBoundaries(String text) {
        List<Integer> boundaries = new ArrayList<>();
        Matcher matcher = SENTENCE_BOUNDARY.matcher(text);
        while (matcher.find()) {
            boundaries.add(matcher.start() + 1);
        }
        return boundaries;
    }

    static DocumentChunk createChunk(UUID documentId, int documentVersion, String title,
                                      String text, int chunkIndex, int start, int end) {
        return new DocumentChunk(
                UUID.randomUUID(),
                documentId,
                documentVersion,
                ChunkType.TEXT,
                text,
                new ChunkPosition(null, null, chunkIndex, start, end),
                new ChunkMetadata(title, null, null, null, null, null, null, null, null),
                null,
                null
        );
    }
}
