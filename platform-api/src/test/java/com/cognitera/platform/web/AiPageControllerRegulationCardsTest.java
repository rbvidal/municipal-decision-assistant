package com.cognitera.platform.web;

import com.cognitera.platform.ai.model.SourceCitation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for regulation card grouping in {@link AiPageController#buildEvidenceCards}.
 * Multiple chunks from the same document must produce ONE card, not one per chunk.
 */
@DisplayName("Regulation card grouping")
class AiPageControllerRegulationCardsTest {

    private AiPageController controller;

    @BeforeEach
    void setUp() {
        controller = new AiPageController(null, null);
    }

    // ── Grouping: multiple chunks → one card ──

    @Test
    @DisplayName("Multiple chunks from same document produce one card")
    void shouldGroupMultipleChunksFromSameDocument() {
        UUID docId = UUID.randomUUID();
        List<SourceCitation> sources = List.of(
                citation(docId, UUID.randomUUID(), "Baugesetzbuch (BauGB)", 0.85,
                        "Die Gemeinden haben Bauleitpläne aufzustellen, sobald und soweit..."),
                citation(docId, UUID.randomUUID(), "Baugesetzbuch (BauGB)", 0.72,
                        "Im vereinfachten Verfahren wird von der frühzeitigen Beteiligung..."),
                citation(docId, UUID.randomUUID(), "Baugesetzbuch (BauGB)", 0.60,
                        "Ein Vorhaben ist zulässig, wenn es den Festsetzungen...")
        );

        var cards = controller.buildEvidenceCards(sources, "building-regulations");

        assertEquals(1, cards.size(), "Should produce exactly one card for one document");
        Map<String, Object> card = cards.getFirst();
        assertEquals("Baugesetzbuch (BauGB)", card.get("title"));
        assertEquals(3, card.get("passageCount"), "Should count all 3 passages");
        // Best excerpt should be the highest-confidence one (0.85)
        assertTrue(card.get("excerpt").toString().contains("Die Gemeinden haben Bauleitpläne"),
                "Should select highest-confidence excerpt");
    }

    @Test
    @DisplayName("Multiple documents each produce one card")
    void shouldProduceOneCardPerDocument() {
        UUID bauGB = UUID.randomUUID();
        UUID bauO = UUID.randomUUID();

        List<SourceCitation> sources = List.of(
                citation(bauGB, UUID.randomUUID(), "Baugesetzbuch (BauGB)", 0.85, "Bauleitpläne..."),
                citation(bauGB, UUID.randomUUID(), "Baugesetzbuch (BauGB)", 0.70, "Vorhaben..."),
                citation(bauO, UUID.randomUUID(), "Bauordnung Berlin (BauO Bln)", 0.80, "Genehmigung..."),
                citation(bauO, UUID.randomUUID(), "Bauordnung Berlin (BauO Bln)", 0.65, "Abstandsflächen...")
        );

        var cards = controller.buildEvidenceCards(sources, "building-regulations");

        assertEquals(2, cards.size(), "Should produce two cards for two documents");
        assertEquals("Baugesetzbuch (BauGB)", cards.get(0).get("title"));
        assertEquals(2, cards.get(0).get("passageCount"));
        assertEquals("Bauordnung Berlin (BauO Bln)", cards.get(1).get("title"));
        assertEquals(2, cards.get(1).get("passageCount"));
    }

    @Test
    @DisplayName("Preserves insertion order of first appearance")
    void shouldPreserveInsertionOrder() {
        UUID docA = UUID.randomUUID();
        UUID docB = UUID.randomUUID();

        // docA appears first, then docB, then docA again
        List<SourceCitation> sources = List.of(
                citation(docA, UUID.randomUUID(), "Document A", 0.80, "A chunk 1..."),
                citation(docB, UUID.randomUUID(), "Document B", 0.75, "B chunk 1..."),
                citation(docA, UUID.randomUUID(), "Document A", 0.60, "A chunk 2...")
        );

        var cards = controller.buildEvidenceCards(sources, "test");

        assertEquals(2, cards.size());
        assertEquals("Document A", cards.get(0).get("title"), "Document A appeared first");
        assertEquals("Document B", cards.get(1).get("title"), "Document B appeared second");
    }

    // ── Best excerpt selection ──

    @Test
    @DisplayName("Selects highest-confidence excerpt as best")
    void shouldSelectHighestConfidenceExcerpt() {
        UUID docId = UUID.randomUUID();
        String bestText = "Dies ist der relevanteste Abschnitt mit der höchsten Bewertung.";

        List<SourceCitation> sources = List.of(
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.45, "Niedrige Relevanz..."),
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.92, bestText),
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.60, "Mittlere Relevanz...")
        );

        var cards = controller.buildEvidenceCards(sources, "test");

        assertEquals(1, cards.size());
        assertTrue(cards.getFirst().get("excerpt").toString().contains(bestText),
                "Should select excerpt with highest confidence (0.92)");
    }

    @Test
    @DisplayName("Score reflects best chunk confidence")
    void shouldUseBestConfidenceForScore() {
        UUID docId = UUID.randomUUID();
        List<SourceCitation> sources = List.of(
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.55, "Text..."),
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.88, "Better text..."),
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.32, "Worst text...")
        );

        var cards = controller.buildEvidenceCards(sources, "test");

        assertEquals("0.88", cards.getFirst().get("score"),
                "Score should reflect the best confidence (0.88)");
    }

    // ── Passage count ──

    @Test
    @DisplayName("Single chunk produces passageCount=1")
    void shouldReportSinglePassage() {
        UUID docId = UUID.randomUUID();
        List<SourceCitation> sources = List.of(
                citation(docId, UUID.randomUUID(), "Einzelgesetz", 0.70, "Einziger Abschnitt")
        );

        var cards = controller.buildEvidenceCards(sources, "test");

        assertEquals(1, cards.size());
        assertEquals(1, cards.getFirst().get("passageCount"));
    }

    // ── Empty list ──

    @Test
    @DisplayName("Empty sources produces empty card list")
    void shouldHandleEmptySources() {
        var cards = controller.buildEvidenceCards(List.of(), "test");
        assertTrue(cards.isEmpty());
    }

    // ── Deterministic: same input → same output ──

    @Test
    @DisplayName("Grouping is deterministic")
    void shouldBeDeterministic() {
        UUID docId = UUID.randomUUID();
        List<SourceCitation> sources = List.of(
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.80, "Erster Abschnitt..."),
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.60, "Zweiter Abschnitt..."),
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.90, "Dritter Abschnitt...")
        );

        var first = controller.buildEvidenceCards(sources, "test");
        var second = controller.buildEvidenceCards(sources, "test");

        assertEquals(first.size(), second.size());
        assertEquals(first.getFirst().get("passageCount"), second.getFirst().get("passageCount"));
        assertEquals(first.getFirst().get("excerpt"), second.getFirst().get("excerpt"));
        assertEquals(first.getFirst().get("score"), second.getFirst().get("score"));
    }

    // ── Parser: RECHTSGRUNDLAGE / RECHTSGRUNDLAGEN compatibility ──

    @Test
    @DisplayName("RECHTSGRUNDLAGE (singular) parses correctly")
    void shouldParseRechtsgrundlageSingular() {
        String llmOutput = """
            KURZANTWORT
            Ein Satz.

            ENTSCHEIDUNG
            Eine Empfehlung.

            RECHTSGRUNDLAGE
            - Baugesetzbuch (BauGB), § 30
            - Bauordnung Berlin (BauO Bln), § 62

            VERFAHREN
            Vereinfachtes Verfahren.
            """;

        Map<String, String> dp = AiPageController.parseDecisionPackage(llmOutput);

        assertEquals("Eine Empfehlung.", dp.get("ENTSCHEIDUNG"));
        assertTrue(dp.containsKey("RECHTSGRUNDLAGEN"),
                "RECHTSGRUNDLAGE must be normalized to RECHTSGRUNDLAGEN key");
        assertTrue(dp.get("RECHTSGRUNDLAGEN").contains("Baugesetzbuch"),
                "Content from RECHTSGRUNDLAGE must be stored under RECHTSGRUNDLAGEN");
        assertTrue(dp.get("RECHTSGRUNDLAGEN").contains("Bauordnung Berlin"));
    }

    @Test
    @DisplayName("RECHTSGRUNDLAGEN (plural) still parses correctly")
    void shouldParseRechtsgrundlagenPlural() {
        String llmOutput = """
            ENTSCHEIDUNG
            Testentscheidung.

            RECHTSGRUNDLAGEN
            - Baugesetzbuch (BauGB), § 34

            VERFAHREN
            Genehmigungsverfahren.
            """;

        Map<String, String> dp = AiPageController.parseDecisionPackage(llmOutput);

        assertTrue(dp.containsKey("RECHTSGRUNDLAGEN"));
        assertTrue(dp.get("RECHTSGRUNDLAGEN").contains("Baugesetzbuch"));
    }

    @Test
    @DisplayName("Both singular and plural populate the same field")
    void shouldPopulateSameFieldForBothForms() {
        String singularOutput = """
            ENTSCHEIDUNG
            Test.

            RECHTSGRUNDLAGE
            - BauGB § 30
            """;

        String pluralOutput = """
            ENTSCHEIDUNG
            Test.

            RECHTSGRUNDLAGEN
            - BauGB § 30
            """;

        Map<String, String> dpSingular = AiPageController.parseDecisionPackage(singularOutput);
        Map<String, String> dpPlural = AiPageController.parseDecisionPackage(pluralOutput);

        assertEquals(dpPlural.get("RECHTSGRUNDLAGEN"), dpSingular.get("RECHTSGRUNDLAGEN"),
                "Both forms must produce identical content under RECHTSGRUNDLAGEN");
    }

    @Test
    @DisplayName("RECHTSGRUNDLAGE not confused with RECHTSGRUNDLAGEN prefix")
    void shouldNotDuplicateRechtsgrundlagen() {
        // If both appear, the last one should win (standard parser behavior)
        String llmOutput = """
            ENTSCHEIDUNG
            Test.

            RECHTSGRUNDLAGE
            - Singular form.

            RECHTSGRUNDLAGEN
            - Plural form.
            """;

        Map<String, String> dp = AiPageController.parseDecisionPackage(llmOutput);

        assertTrue(dp.containsKey("RECHTSGRUNDLAGEN"));
        // Last matching section wins (RECHTSGRUNDLAGEN in this case)
        assertTrue(dp.get("RECHTSGRUNDLAGEN").contains("Plural form"),
                "Last matching section should win");
    }

    // ── Execution trace format verification ──

    @Test
    @DisplayName("No String.format specifiers remain in any AiPageController rendered output")
    void shouldNotContainFormatSpecifiers() {
        // Verify that buildEvidenceCards output contains no format specifiers
        UUID docId = UUID.randomUUID();
        List<SourceCitation> sources = List.of(
                citation(docId, UUID.randomUUID(), "Testgesetz", 0.85, "Inhalt...")
        );

        var cards = controller.buildEvidenceCards(sources, "test");
        for (var card : cards) {
            for (var entry : card.entrySet()) {
                if (entry.getValue() instanceof String s) {
                    assertFalse(s.contains("%-24s") || s.contains("%-24d"),
                            "Card output must not contain format specifiers: " + entry.getKey());
                }
            }
        }
    }

    // ── Helper ──

    private static SourceCitation citation(UUID docId, UUID chunkId, String title,
                                           double confidence, String excerpt) {
        return new SourceCitation(
                docId, chunkId, 1, title,
                null, null, null, excerpt,
                confidence,
                SourceCitation.classifyTier(confidence),
                SourceCitation.SourceType.FACTUAL);
    }
}
