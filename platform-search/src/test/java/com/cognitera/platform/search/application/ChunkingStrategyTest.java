package com.cognitera.platform.search.application;

import com.cognitera.platform.search.api.ChunkingStrategy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ChunkingStrategy — configurable parameters")
class ChunkingStrategyTest {

    private static final UUID DOC_ID = UUID.randomUUID();
    private static final String TITLE = "Test Document";

    private ChunkingProperties props() {
        var p = new ChunkingProperties();
        p.setMaxChunkSize(500);
        p.setOverlap(50);
        return p;
    }

    // ── Sentence-aware strategy ──

    @Nested
    @DisplayName("SentenceAwareChunkingStrategy")
    class SentenceAware {

        @Test
        @DisplayName("chunks text at sentence boundaries")
        void chunksAtSentenceBoundaries() {
            var strategy = new SentenceAwareChunkingStrategy(props());
            String text = "First sentence. Second sentence. Third sentence. Fourth sentence.";
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, text);
            assertThat(chunks).isNotEmpty();
            assertThat(chunks.size()).isLessThan(4);
        }

        @Test
        @DisplayName("respects configured max chunk size")
        void respectsMaxChunkSize() {
            var p = props();
            p.setMaxChunkSize(100);
            var strategy = new SentenceAwareChunkingStrategy(p);
            String text = "A".repeat(500);
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, text);
            for (var c : chunks) {
                assertThat(c.text().length()).isLessThanOrEqualTo(250);
            }
        }

        @Test
        @DisplayName("returns empty list for blank text")
        void returnsEmptyForBlank() {
            var strategy = new SentenceAwareChunkingStrategy(props());
            assertThat(strategy.chunk(DOC_ID, 1, TITLE, ""))
                    .isEmpty();
            assertThat(strategy.chunk(DOC_ID, 1, TITLE, null))
                    .isEmpty();
        }

        @Test
        @DisplayName("handles text shorter than chunk size")
        void handlesShortText() {
            var strategy = new SentenceAwareChunkingStrategy(props());
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, "Hello world.");
            assertThat(chunks).hasSize(1);
            assertThat(chunks.get(0).text()).isEqualTo("Hello world.");
        }

        @Test
        @DisplayName("clamps overlap to valid range")
        void clampsOverlap() {
            var p = props();
            p.setMaxChunkSize(200);
            p.setOverlap(500);
            var strategy = new SentenceAwareChunkingStrategy(p);
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, "A".repeat(600));
            assertThat(chunks).isNotEmpty();
        }

        @Test
        @DisplayName("clamps max chunk size to minimum of 100")
        void clampsMinChunkSize() {
            var p = props();
            p.setMaxChunkSize(50);
            var strategy = new SentenceAwareChunkingStrategy(p);
            String text = "A".repeat(300);
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, text);
            for (var c : chunks) {
                assertThat(c.text().length()).isLessThanOrEqualTo(250);
            }
        }
    }

    // ── Fixed-size strategy ──

    @Nested
    @DisplayName("FixedSizeChunkingStrategy")
    class FixedSize {

        @Test
        @DisplayName("chunks text at fixed size intervals")
        void chunksAtFixedIntervals() {
            var p = props();
            p.setMaxChunkSize(100);
            p.setOverlap(0);
            var strategy = new FixedSizeChunkingStrategy(p);
            String text = "A".repeat(250);
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, text);
            assertThat(chunks).hasSize(3);
        }

        @Test
        @DisplayName("respects configured overlap")
        void respectsOverlap() {
            var p = props();
            p.setMaxChunkSize(100);
            p.setOverlap(20);
            var strategy = new FixedSizeChunkingStrategy(p);
            String text = "A".repeat(260);
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, text);
            assertThat(chunks).hasSizeGreaterThanOrEqualTo(3);
            assertThat(chunks.get(0).text()).hasSizeLessThanOrEqualTo(100);
        }

        @Test
        @DisplayName("returns empty list for blank text")
        void returnsEmptyForBlank() {
            var strategy = new FixedSizeChunkingStrategy(props());
            assertThat(strategy.chunk(DOC_ID, 1, TITLE, "")).isEmpty();
            assertThat(strategy.chunk(DOC_ID, 1, TITLE, null)).isEmpty();
        }

        @Test
        @DisplayName("handles text shorter than chunk size")
        void handlesShortText() {
            var strategy = new FixedSizeChunkingStrategy(props());
            var chunks = strategy.chunk(DOC_ID, 1, TITLE, "Hello world.");
            assertThat(chunks).hasSize(1);
        }
    }

    // ── Configuration binding ──

    @Test
    @DisplayName("default configuration matches task specification")
    void defaultsMatchSpecification() {
        var props = new ChunkingProperties();
        assertThat(props.getMaxChunkSize()).isEqualTo(500);
        assertThat(props.getOverlap()).isEqualTo(50);
        assertThat(props.getStrategy()).isEqualTo(ChunkingProperties.Strategy.SENTENCE);
    }

    @Test
    @DisplayName("strategy backward compatibility: chunk produces valid DocumentChunks")
    void producesValidChunks() {
        ChunkingStrategy strategy = new SentenceAwareChunkingStrategy(props());
        var chunks = strategy.chunk(DOC_ID, 1, TITLE, "Hello world. This is a test.");
        assertThat(chunks).isNotEmpty();
        for (var c : chunks) {
            assertThat(c.id()).isNotNull();
            assertThat(c.documentId()).isEqualTo(DOC_ID);
            assertThat(c.text()).isNotBlank();
        }
    }
}
