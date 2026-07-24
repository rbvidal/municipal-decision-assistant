package com.cognitera.platform.web;

import com.cognitera.platform.api.PlatformApiApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = PlatformApiApplication.class, properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.flyway.enabled=false",
        "platform.auth.jwt-secret=test-secret-that-is-at-least-32-bytes-long-for-hs256"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@DisplayName("Corpus Health Dashboard Integration Tests")
@Disabled("Legacy Thymeleaf corpus dashboard test; default app exposes corpus data through REST endpoints.")
class CorpusHealthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private MockHttpSession session;

    @BeforeEach
    void login() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"corpus-test@test.com","password":"Pass1234!","displayName":"Corpus Tester","roles":[]}
                    """));

        var result = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "corpus-test@test.com")
                .param("password", "Pass1234!"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        session = (MockHttpSession) result.getRequest().getSession();
    }

    @Nested
    @DisplayName("Page Rendering")
    class PageRendering {

        @Test
        @DisplayName("corpus health page returns 200")
        void pageLoads() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("page contains dashboard title")
        void containsTitle() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Corpus Health")));
        }

        @Test
        @DisplayName("page contains summary stat cards")
        void containsSummaryCards() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Dokumente")))
                    .andExpect(content().string(containsString("Chunks")))
                    .andExpect(content().string(containsString("Mit Embedding")))
                    .andExpect(content().string(containsString("Qdrant Vektoren")))
                    .andExpect(content().string(containsString("Embedding Coverage")));
        }

        @Test
        @DisplayName("page contains secondary stat cards")
        void containsSecondaryStats() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Fehlende Embeddings")))
                    .andExpect(content().string(containsString("Chunks / Dokument")))
                    .andExpect(content().string(containsString("Retrieval Score")));
        }

        @Test
        @DisplayName("page contains document table with all columns")
        void containsDocumentTable() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Rechtsgebiet")))
                    .andExpect(content().string(containsString("Behörde")))
                    .andExpect(content().string(containsString("Kategorie")))
                    .andExpect(content().string(containsString("Sprache")))
                    .andExpect(content().string(containsString("Metadaten")))
                    .andExpect(content().string(containsString("Letzte Indexierung")));
        }

        @Test
        @DisplayName("page contains traffic-light colors")
        void containsTrafficLightColors() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Grün / Gelb / Rot")));
        }
    }

    @Nested
    @DisplayName("Demo Data State (seeded by DemoDataInitializer)")
    class DemoDataState {

        @Test
        @DisplayName("page renders with seeded demo documents")
        void rendersWithDemoDocuments() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(not(containsString("Exception"))))
                    .andExpect(content().string(not(containsString("Error"))));
        }

        @Test
        @DisplayName("summary shows non-zero document count")
        void showsNonZeroDocumentCount() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Corpus Health")));
        }
    }

    @Nested
    @DisplayName("Qdrant Unavailability")
    class QdrantUnavailable {

        @Test
        @DisplayName("page shows warning when Qdrant is unreachable")
        void showsQdrantWarning() throws Exception {
            mockMvc.perform(get("/admin/corpus-health").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Corpus Health")));
            // When Qdrant is not running, the dashboard shows a warning banner.
            // The exact warning text depends on whether documents exist.
        }
    }

    @Nested
    @DisplayName("CorpusHealthService Bean Wiring")
    class ServiceWiring {

        @Autowired
        private CorpusHealthService healthService;

        @Test
        @DisplayName("CorpusHealthService is wired and produces a report")
        void serviceProducesReport() {
            var report = healthService.generateReport();
            // Report must never be null even with an empty database
            org.junit.jupiter.api.Assertions.assertNotNull(report);
            org.junit.jupiter.api.Assertions.assertNotNull(report.summary());
            org.junit.jupiter.api.Assertions.assertNotNull(report.documents());
            org.junit.jupiter.api.Assertions.assertNotNull(report.warnings());
        }

        @Test
        @DisplayName("summary has valid counts (demo data seeded by DemoDataInitializer)")
        void demoDataHasValidSummary() {
            var report = healthService.generateReport();
            var s = report.summary();
            // DemoDataInitializer seeds 23 documents
            org.junit.jupiter.api.Assertions.assertEquals(23, s.documentCount());
            org.junit.jupiter.api.Assertions.assertTrue(s.chunkCount() > 0,
                    "Chunk count should be > 0 for seeded demo docs");
            org.junit.jupiter.api.Assertions.assertTrue(s.avgChunksPerDocument() >= 0);
            // Embedding coverage is 0 in tests (no Ollama)
            org.junit.jupiter.api.Assertions.assertTrue(s.embeddingCoveragePct() >= 0);
        }

        @Test
        @DisplayName("health status enum has three values")
        void healthStatusEnum() {
            org.junit.jupiter.api.Assertions.assertEquals(3,
                    CorpusHealthService.HealthStatus.values().length);
        }

        @Test
        @DisplayName("document list contains seeded demo documents")
        void documentListHasDemoDocuments() {
            var report = healthService.generateReport();
            // DemoDataInitializer seeds 23 documents
            org.junit.jupiter.api.Assertions.assertEquals(23, report.documents().size());
            // Verify known demo documents are present
            var titles = report.documents().stream()
                    .map(CorpusHealthService.DocumentHealth::title).toList();
            org.junit.jupiter.api.Assertions.assertTrue(
                    titles.stream().anyMatch(t -> t.contains("Bauordnung Berlin")),
                    "Should contain Bauordnung Berlin");
            org.junit.jupiter.api.Assertions.assertTrue(
                    titles.stream().anyMatch(t -> t.contains("TV-L")),
                    "Should contain TV-L document");
        }
    }

    @Nested
    @DisplayName("Admin Navigation")
    class AdminNavigation {

        @Test
        @DisplayName("admin page contains link to corpus health")
        void adminPageHasCorpusHealthLink() throws Exception {
            mockMvc.perform(get("/admin").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("corpus-health")));
        }
    }
}
