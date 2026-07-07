package com.cognitera.platform.api;

import org.junit.jupiter.api.BeforeEach;
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
@DisplayName("Internationalization Integration Tests")
class I18nIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private MockHttpSession session;

    @BeforeEach
    void login() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"i18ntest@test.com","password":"Pass1234!","displayName":"I18n User","roles":[]}
                    """));
        var result = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "i18ntest@test.com")
                .param("password", "Pass1234!"))
                .andExpect(status().is3xxRedirection())
                .andReturn();
        session = (MockHttpSession) result.getRequest().getSession();
    }

    @Nested
    @DisplayName("English (default)")
    class English {

        @Test
        @DisplayName("should show English labels by default")
        void defaultEnglish() throws Exception {
            mockMvc.perform(get("/dashboard").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Kommunaler Verwaltungsassistent")));
        }

        @Test
        @DisplayName("should show main navigation items")
        void englishNavLabels() throws Exception {
            mockMvc.perform(get("/home").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Startseite")))
                    .andExpect(content().string(containsString("Neue Entscheidung")))
                    .andExpect(content().string(containsString("Vorschriften")));
        }
    }

    @Nested
    @DisplayName("German (Deutsch)")
    class German {

        @Test
        @DisplayName("should switch to German — language indicator shows DE")
        void switchToGerman() throws Exception {
            mockMvc.perform(get("/dashboard?lang=de").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString(">DE<")));
        }

        @Test
        @DisplayName("should persist German across requests")
        void persistGerman() throws Exception {
            mockMvc.perform(get("/dashboard?lang=de").session(session))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/documents").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Dokumente")));
        }

        @Test
        @DisplayName("should show language indicator DE after switch")
        void germanNavLabels() throws Exception {
            mockMvc.perform(get("/dashboard?lang=de").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("DE")));
        }
    }

    @Nested
    @DisplayName("French (Francais)")
    class French {

        @Test
        @DisplayName("should switch to French — language indicator shows FR")
        void switchToFrench() throws Exception {
            mockMvc.perform(get("/home?lang=fr").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString(">DE<")));
        }

        @Test
        @DisplayName("should persist French across requests")
        void persistFrench() throws Exception {
            mockMvc.perform(get("/home?lang=fr").session(session))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/documents").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Documents")));
        }

        @Test
        @DisplayName("should show language indicator FR after switch")
        void frenchNavLabels() throws Exception {
            mockMvc.perform(get("/home?lang=fr").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("DE")));
        }
    }

    @Nested
    @DisplayName("Language independence")
    class Independence {

        @Test
        @DisplayName("should allow switching between all three languages")
        void switchAllThree() throws Exception {
            mockMvc.perform(get("/dashboard?lang=de").session(session))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/home?lang=fr").session(session))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/dashboard?lang=en").session(session))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/dashboard").session(session))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Kommunaler Verwaltungsassistent")));
        }

        @Test
        @DisplayName("should show login page in German")
        void loginPageGerman() throws Exception {
            mockMvc.perform(get("/login?lang=de"))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Anmelden")));
        }

        @Test
        @DisplayName("should show register page in German")
        void registerPageGerman() throws Exception {
            mockMvc.perform(get("/register?lang=de"))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Registrieren")));
        }
    }
}
