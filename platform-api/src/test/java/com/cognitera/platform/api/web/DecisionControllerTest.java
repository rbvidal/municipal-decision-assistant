package com.cognitera.platform.api.web;

import com.cognitera.platform.ai.application.AiService;
import com.cognitera.platform.ai.application.DecisionRouter;
import com.cognitera.platform.ai.application.DomainClassifier;
import com.cognitera.platform.ai.knowledge.*;
import com.cognitera.platform.ai.model.DecisionResult;
import com.cognitera.platform.ai.model.DecisionStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Decision endpoint verification tests.
 *
 * <p>Covers all 4 DecisionResult subtypes via the DecisionController REST API:
 * SalaryDecision, TravelDecision, ProcurementDecision, and threshold overview.
 * Also covers SSE streaming endpoint and edge cases.
 *
 * <p>Uses standalone MockMvc with a real KnowledgeRegistry and DecisionRouter.
 * The AiService is a stub since Ollama is not available in test.
 */
class DecisionControllerTest {

    private MockMvc mockMvc;
    private KnowledgeRegistry registry;

    // ── Setup ──

    @BeforeEach
    void setUp() {
        registry = new KnowledgeRegistry();

        // Threshold table
        ThresholdTable av55 = new ThresholdTable(
                "AV zu Paragraph 55 LHO Berlin", "AV §55 LHO",
                LocalDate.of(2024, 1, 1));
        av55.addEntry(0, 500.0, "Kein formelles Verfahren",
                "Lieferung/Dienstleistung",
                List.of("Keine Genehmigung erforderlich"), "Unter 500 €");
        av55.addEntry(500.0, 1000.0, "Direktauftrag mit Genehmigung",
                "Lieferung/Dienstleistung",
                List.of("Schriftliche Genehmigung"), "500 € bis 1.000 €");
        av55.addEntry(1000.0, 10_000.0, "Direktauftrag",
                "Lieferung/Dienstleistung",
                List.of("Vergabevermerk"), "1.000 € bis 10.000 €");
        av55.addEntry(10_000.0, 100_000.0, "Beschränkte Ausschreibung",
                "Lieferung/Dienstleistung",
                List.of("Ex-post-Veröffentlichung"), "10.000 € bis 100.000 €");
        av55.addEntry(100_000.0, null, "Öffentliche Ausschreibung / EU-weit",
                "Lieferung/Dienstleistung",
                List.of("EU-Schwellenwerte prüfen"), "Ab 100.000 €");
        av55.addEntry(0, 20_000.0, "Direktauftrag",
                "Bauleistung", List.of(), "Bauleistung bis 20.000 €");
        registry.register(av55);

        // Salary table
        SalaryTable tvl = new SalaryTable("TV-L 2025", "TV-L",
                LocalDate.of(2025, 2, 1), null);
        tvl.addEntry("EG 9a", 3, 4117.53, 0, "");
        tvl.addEntry("EG 10", 2, 4231.36, 0, "");
        registry.register(tvl);

        // Travel table
        TravelAllowanceTable brkg = new TravelAllowanceTable("BRKG", "BRKG",
                LocalDate.of(2024, 1, 1));
        brkg.addEntry(8, 24.0, 6.0, "domestic", false, "Über 8 Stunden");
        brkg.addEntry(11, 24.0, 12.0, "domestic", false, "Über 11 Stunden");
        registry.register(brkg);

        DecisionRouter router = new DecisionRouter(registry, new DomainClassifier());

        // Stub AiService — returns a fixed response
        AiService aiService = new StubAiService();

        DecisionController controller = new DecisionController(aiService, router);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    // ── Status endpoint ──

    @Test
    void shouldReturnReadyStatus() throws Exception {
        mockMvc.perform(get("/api/decision/test-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value("test-123"))
                .andExpect(jsonPath("$.status").value("ready"));
    }

    // ── Procurement decision (RULE_ENGINE) ──

    @Test
    void shouldReturnProcurementDecision() throws Exception {
        String body = """
            {"question": "Kann ich einen IT-Auftrag über 18.000 Euro freihändig vergeben?"}
            """;

        MvcResult result = mockMvc.perform(post("/api/decision/case-001/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value("case-001"))
                .andExpect(jsonPath("$.strategy").value("RULE_ENGINE"))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertTrue(json.contains("RULE_ENGINE"));
    }

    @Test
    void shouldReturnProcurementDecisionForStandardBeschaffung() throws Exception {
        String body = """
            {"question": "Ist eine Beschaffung über 800 Euro ohne Genehmigung zulässig?"}
            """;

        mockMvc.perform(post("/api/decision/case-002/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("RULE_ENGINE"));
    }

    // ── Salary decision (RULE_ENGINE) ──

    @Test
    void shouldReturnSalaryDecision() throws Exception {
        String body = """
            {"question": "Wie hoch ist das Gehalt von EG 9a Stufe 3 TV-L?"}
            """;

        mockMvc.perform(post("/api/decision/case-003/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("RULE_ENGINE"));
    }

    // ── Travel decision (RULE_ENGINE) ──

    @Test
    void shouldReturnTravelDecision() throws Exception {
        String body = """
            {"question": "Wie hoch ist das Tagegeld bei einer 9-stündigen Dienstreise?"}
            """;

        mockMvc.perform(post("/api/decision/case-004/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("RULE_ENGINE"));
    }

    // ── Threshold overview (RULE_ENGINE) ──

    @Test
    void shouldReturnThresholdOverview() throws Exception {
        String body = """
            {"question": "Welche Wertgrenzen gelten für Direktaufträge nach AV §55 LHO?"}
            """;

        mockMvc.perform(post("/api/decision/case-005/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("RULE_ENGINE"));
    }

    // ── HYBRID_RETRIEVAL fallback ──

    @Test
    void shouldReturnHybridRetrievalForLegalQuestion() throws Exception {
        String body = """
            {"question": "Welche Abstandsflächen gelten in Berlin?"}
            """;

        mockMvc.perform(post("/api/decision/case-006/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("HYBRID_RETRIEVAL"));
    }

    // ── Draft endpoint ──

    @Test
    void shouldGenerateDraft() throws Exception {
        String body = """
            {"question": "IT-Auftrag über 18.000 Euro"}
            """;

        mockMvc.perform(post("/api/decision/case-007/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Entscheidungsentwurf — case-007"))
                .andExpect(jsonPath("$.content").isString());
    }

    // ── SSE streaming ──

    @Test
    void shouldStreamDecisionEvents() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/decision/case-008/stream")
                        .param("question", "IT-Auftrag über 18.000 Euro freihändig vergeben?"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertNotNull(content);
    }

    // ── Edge cases ──

    @Test
    void shouldHandleEmptyQuestion() throws Exception {
        String body = """
            {"question": ""}
            """;

        mockMvc.perform(post("/api/decision/case-009/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleSpecialCharactersInQuestion() throws Exception {
        String body = """
            {"question": "Können wir eine Überarbeitung der Beschaffungsrichtlinie für 15.000 € vornehmen?"}
            """;

        mockMvc.perform(post("/api/decision/case-010/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("RULE_ENGINE"));
    }

    @Test
    void shouldHandleMissingModelParameter() throws Exception {
        String body = """
            {"question": "IT-Auftrag über 5.000 Euro"}
            """;

        mockMvc.perform(post("/api/decision/case-011/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("RULE_ENGINE"));
    }
}
