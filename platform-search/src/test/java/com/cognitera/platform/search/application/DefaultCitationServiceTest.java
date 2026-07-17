package com.cognitera.platform.search.application;

import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.search.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("DefaultCitationService — German legal citation formatting")
class DefaultCitationServiceTest {

    private DefaultCitationService service;

    @BeforeEach
    void setUp() {
        service = new DefaultCitationService();
    }

    private ChunkReference chunkRef(UUID docId, String title) {
        return new ChunkReference(UUID.randomUUID(), docId, 1, title,
                new ChunkPosition(0, 0, 0, 0, 100));
    }

    private RetrievalCandidate candidate(UUID docId, String title, String text) {
        var ref = chunkRef(docId, title);
        return new RetrievalCandidate(ref, text, 0.9, 0.8, 0.85, 0.7, "hybrid",
                new CitationReference(docId, ref.chunkId(), 1, title,
                        null, 0, 100, text.length() > 240 ? text.substring(0, 240) : text));
    }

    // ── Citation formatting ──

    @Test
    @DisplayName("formats legal citation with title")
    void formatsLegalCitation() {
        var ref = chunkRef(UUID.randomUUID(), "AV zu Paragraph 55 LHO Berlin");
        assertThat(service.formatLegalCitation(ref))
                .isEqualTo("§ AV zu Paragraph 55 LHO Berlin");
    }

    @Test
    @DisplayName("extracts section reference from chunk text")
    void extractsSectionFromText() {
        var ref = chunkRef(UUID.randomUUID(), "Bauordnung Berlin");
        String result = service.formatCitationWithSection(ref,
                "Gemäß § 6 BauO Bln sind Abstandsflächen einzuhalten.");
        assertThat(result).isEqualTo("§ 6 Bauordnung Berlin");
    }

    @Test
    @DisplayName("falls back to title when no section reference in text")
    void fallsBackToTitle() {
        var ref = chunkRef(UUID.randomUUID(), "Beschaffungsordnung Berlin");
        String result = service.formatCitationWithSection(ref,
                "Allgemeine Bestimmungen zur Beschaffung.");
        assertThat(result).isEqualTo("Beschaffungsordnung Berlin");
    }

    @Test
    @DisplayName("handles null text in section extraction")
    void handlesNullText() {
        var ref = chunkRef(UUID.randomUUID(), "Test Document");
        String result = service.formatCitationWithSection(ref, null);
        assertThat(result).isEqualTo("Test Document");
    }

    @Test
    @DisplayName("handles null chunk title")
    void handlesNullTitle() {
        var ref = new ChunkReference(UUID.randomUUID(), UUID.randomUUID(), 1, null,
                new ChunkPosition(0, 0, 0, 0, 100));
        assertThat(service.formatLegalCitation(ref))
                .isEqualTo("§ Unbekannt");
    }

    // ── Grouping by document ──

    @Test
    @DisplayName("groups multiple citations from same document")
    void groupsByDocument() {
        UUID docId = UUID.randomUUID();
        var c1 = candidate(docId, "AV §55 LHO",
                "§ 55 Direktauftrag bis 1.000 Euro.");
        var c2 = candidate(docId, "AV §55 LHO",
                "§ 56 Beschränkte Ausschreibung.");

        Map<String, List<String>> grouped = service.groupCitationsByDocument(List.of(c1, c2));
        assertThat(grouped).hasSize(1);
        assertThat(grouped.get("AV §55 LHO")).hasSize(2);
    }

    @Test
    @DisplayName("separates citations from different documents")
    void separatesDifferentDocuments() {
        UUID doc1 = UUID.randomUUID();
        UUID doc2 = UUID.randomUUID();
        var c1 = candidate(doc1, "AV §55 LHO", "§ 55 Direktauftrag.");
        var c2 = candidate(doc2, "BauO Bln", "§ 6 Abstandsflächen.");

        Map<String, List<String>> grouped = service.groupCitationsByDocument(List.of(c1, c2));
        assertThat(grouped).hasSize(2);
    }

    @Test
    @DisplayName("deduplicates identical citations within same document")
    void deduplicatesIdenticalCitations() {
        UUID docId = UUID.randomUUID();
        var c1 = candidate(docId, "AV §55 LHO", "§ 55 Direktauftrag.");
        var c2 = candidate(docId, "AV §55 LHO", "§ 55 Direktauftrag.");

        Map<String, List<String>> grouped = service.groupCitationsByDocument(List.of(c1, c2));
        assertThat(grouped.get("AV §55 LHO")).hasSize(1);
    }

    // ── Chunk anchor links ──

    @Test
    @DisplayName("generates chunk anchor URL")
    void generatesAnchorLink() {
        UUID docId = UUID.randomUUID();
        var ref = new ChunkReference(UUID.randomUUID(), docId, 1, "Test",
                new ChunkPosition(0, 0, 0, 10, 50));
        String link = service.chunkAnchorLink(ref);
        assertThat(link).contains("/documents/" + docId);
        assertThat(link).contains("chunk=");
        assertThat(link).contains("start=10");
        assertThat(link).contains("end=50");
    }

    @Test
    @DisplayName("handles null position in anchor link")
    void handlesNullPosition() {
        UUID docId = UUID.randomUUID();
        var ref = new ChunkReference(UUID.randomUUID(), docId, 1, "Test", null);
        String link = service.chunkAnchorLink(ref);
        assertThat(link).contains("start=0");
        assertThat(link).contains("end=0");
    }

    // ── Section extraction ──

    @Nested
    @DisplayName("section extraction")
    class SectionExtraction {

        @Test
        @DisplayName("extracts simple section reference")
        void extractsSimple() {
            assertThat(service.extractSectionFromText("Gemäß § 55 LHO gilt..."))
                    .isEqualTo("55");
        }

        @Test
        @DisplayName("extracts section with letter suffix")
        void extractsWithLetter() {
            assertThat(service.extractSectionFromText("Nach § 9a BauO Bln..."))
                    .isEqualTo("9a");
        }

        @Test
        @DisplayName("returns null for text without section reference")
        void returnsNullWithoutSection() {
            assertThat(service.extractSectionFromText("Keine Paragraphen hier."))
                    .isNull();
        }

        @Test
        @DisplayName("returns null for null text")
        void returnsNullForNull() {
            assertThat(service.extractSectionFromText(null)).isNull();
        }
    }
}
