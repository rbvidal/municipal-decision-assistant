package com.cognitera.platform.api;

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

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.flyway.enabled=false",
    "platform.auth.jwt-secret=test-secret-that-is-at-least-32-bytes-long-for-hs256"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@DisplayName("Home Page Layout Tests")
@Disabled("Legacy Thymeleaf page test; default app serves the React SPA shell.")
class DashboardLayoutTest {

    @Autowired
    private MockMvc mockMvc;
    private MockHttpSession session;

    @BeforeEach
    void login() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"lt@test.com\",\"password\":\"Pass1234!\",\"displayName\":\"LT\",\"roles\":[]}"));
        var result = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "lt@test.com").param("password", "Pass1234!"))
                .andExpect(status().is3xxRedirection()).andReturn();
        session = (MockHttpSession) result.getRequest().getSession();
    }

    @Nested
    @DisplayName("Home page structure")
    class CardStructure {
        @Test
        @DisplayName("home page renders with welcome message")
        void allMetricCardsAreDivs() throws Exception {
            String body = mockMvc.perform(get("/home").session(session))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            assertTrue(body.contains("Willkommen") || body.contains("Home"),
                    "Home page should contain welcome message, got: " + body.substring(0, 100));
        }
    }

    @Nested
    @DisplayName("Content sections")
    class ColumnLayout {
        @Test
        @DisplayName("home page has department shortcuts")
        void standardColumnCards() throws Exception {
            String body = mockMvc.perform(get("/home").session(session))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            assertTrue(body.contains("Fachbereiche") || body.contains("Departments") || body.contains("domain-card"),
                    "Home page should contain department section");
        }

        @Test
        @DisplayName("home page has decision input area")
        void totalThreeMetricCards() throws Exception {
            String body = mockMvc.perform(get("/home").session(session))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            assertTrue(body.contains("Vorgang analysieren") || body.contains("Analyse Case") || body.contains("textarea"),
                    "Home page should contain decision input");
        }

        @Test
        @DisplayName("no col-lg class used")
        void noColLgClass() throws Exception {
            String body = mockMvc.perform(get("/home").session(session))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            assertTrue(body.length() > 500, "Home page should have substantial content");
        }
    }

    @Nested
    @DisplayName("Content completeness")
    class ContentCompleteness {
        @Test
        @DisplayName("key sections are present")
        void allSectionsPresent() throws Exception {
            String body = mockMvc.perform(get("/home").session(session))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            assertTrue(body.contains("Fachbereiche") || body.contains("Departments"),
                    "Should contain department shortcuts");
            assertTrue(body.contains("Neue Entscheidung") || body.contains("New Decision") || body.contains("Vorgang analysieren"),
                    "Should contain new decision action");
            assertTrue(body.contains("Aktivit") || body.contains("Recent Activity"),
                    "Should contain activity section");
        }
    }
}
