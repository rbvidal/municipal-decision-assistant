package com.cognitera.platform.api.web;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end verification of the auth flow: register → login → refresh → me → logout.
 * Uses real Spring context with in-memory H2 database.
 */
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:authverify;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "platform.auth.jwt-secret=test-secret-that-is-at-least-32-bytes-long-for-hs256"
})
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthEndpointVerificationTest {

    @Autowired
    private MockMvc mockMvc;

    private static String accessToken;
    private static String refreshToken;

    @Test
    @Order(1)
    void shouldRegisterNewUser() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"verify@test.com","password":"SecurePass123!","displayName":"Verify Test","roles":[]}
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.email").value("verify@test.com"))
                .andDo(result -> {
                    accessToken = com.jayway.jsonpath.JsonPath.read(
                            result.getResponse().getContentAsString(), "$.accessToken");
                    refreshToken = com.jayway.jsonpath.JsonPath.read(
                            result.getResponse().getContentAsString(), "$.refreshToken");
                });
    }

    @Test
    @Order(2)
    void shouldRejectDuplicateRegistration() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"verify@test.com","password":"AnotherPass1","displayName":"Dup","roles":[]}
                            """))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @Order(3)
    void shouldLoginWithValidCredentials() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"verify@test.com","password":"SecurePass123!"}
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    @Order(4)
    void shouldRejectWrongPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"verify@test.com","password":"WrongPassword1!"}
                            """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void shouldAccessMeWithValidToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("verify@test.com"));
    }

    @Test
    @Order(6)
    void shouldRejectMeWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(7)
    void shouldRefreshToken() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());
    }

    @Test
    @Order(8)
    void shouldRejectInvalidRefreshToken() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"garbage-token-value\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(9)
    void shouldValidateRegistrationInput() throws Exception {
        // Missing password
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"bad@test.com","password":"","displayName":"Bad","roles":[]}
                            """))
                .andExpect(status().is4xxClientError());

        // Missing email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"","password":"Pass1234!","displayName":"Bad","roles":[]}
                            """))
                .andExpect(status().is4xxClientError());
    }
}
