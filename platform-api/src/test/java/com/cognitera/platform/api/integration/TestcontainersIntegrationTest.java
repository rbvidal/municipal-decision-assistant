package com.cognitera.platform.api.integration;

import com.cognitera.platform.workspace.api.CreateWorkspaceCommand;
import com.cognitera.platform.workspace.api.WorkspaceDto;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Database integration test using Testcontainers PostgreSQL.
 * Verifies the full Spring context with a real database.
 * Tagged as "integration" so it can be run separately from unit tests.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
@Tag("integration")
class TestcontainersIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("mda-test")
            .withUsername("mda")
            .withPassword("mda-test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("platform.auth.jwt-secret",
                () -> "test-secret-that-is-at-least-32-bytes-long-for-hs256");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldStartApplicationWithPostgres() {
        // Verify Spring context loads with Testcontainers PostgreSQL
        ResponseEntity<String> health = restTemplate.getForEntity("/actuator/health", String.class);
        assertEquals(HttpStatus.OK, health.getStatusCode());
    }

    @Test
    void shouldCreateAndRetrieveWorkspace() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = """
            {"name":"Integration Test Workspace","description":"Created by Testcontainers test",
             "workspaceType":"GENERAL","createdBy":"test-user"}""";

        ResponseEntity<WorkspaceDto> createResponse = restTemplate.postForEntity(
                "/api/workspaces", new HttpEntity<>(body, headers), WorkspaceDto.class);

        assertEquals(HttpStatus.OK, createResponse.getStatusCode());
        WorkspaceDto created = createResponse.getBody();
        assertNotNull(created);
        assertNotNull(created.id());
        assertEquals("Integration Test Workspace", created.name());

        // Retrieve it by ID
        ResponseEntity<WorkspaceDto> getResponse = restTemplate.getForEntity(
                "/api/workspaces/" + created.id(), WorkspaceDto.class);

        assertEquals(HttpStatus.OK, getResponse.getStatusCode());
        assertEquals(created.id(), getResponse.getBody().id());
    }

    @Test
    void shouldRegisterAndLoginUser() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Register
        String registerBody = """
            {"email":"tc-test@example.com","password":"SecurePass123!",
             "displayName":"TC Test User","roles":[]}""";

        ResponseEntity<String> registerResponse = restTemplate.postForEntity(
                "/api/auth/register", new HttpEntity<>(registerBody, headers), String.class);

        assertTrue(registerResponse.getStatusCode().is2xxSuccessful()
                || registerResponse.getStatusCode() == HttpStatus.CREATED);

        // Login
        String loginBody = """
            {"email":"tc-test@example.com","password":"SecurePass123!"}""";

        ResponseEntity<String> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", new HttpEntity<>(loginBody, headers), String.class);

        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertTrue(loginResponse.getBody().contains("accessToken"));
    }

    @Test
    void shouldHandleErrorResponses() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Missing password
        String body = """
            {"email":"bad@test.com","password":""}""";

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/auth/login", new HttpEntity<>(body, headers), String.class);

        assertTrue(response.getStatusCode().is4xxClientError());
    }

    @Test
    void shouldReturn404ForUnknownWorkspace() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/workspaces/nonexistent-id-12345", String.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
