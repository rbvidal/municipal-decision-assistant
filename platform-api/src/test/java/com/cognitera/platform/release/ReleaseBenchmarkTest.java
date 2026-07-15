package com.cognitera.platform.release;

import com.cognitera.platform.ai.benchmark.BenchmarkDataset;
import com.cognitera.platform.ai.benchmark.BenchmarkQuestion;
import com.cognitera.platform.ai.model.DecisionStrategy;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * End-to-end release validation benchmark.
 * <p>
 * Uses the REAL Spring Boot application with REAL Ollama, REAL retrieval,
 * REAL grounding — exactly as a production user would experience.
 */
@SpringBootTest(
    classes = com.cognitera.platform.api.PlatformApiApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:releasetest;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.flyway.enabled=false",
        "platform.auth.jwt-secret=test-secret-that-is-at-least-32-bytes-long-for-hs256"
    }
)
@DisplayName("Release Validation Benchmark")
class ReleaseBenchmarkTest {

    @LocalServerPort
    private int port;

    private final org.springframework.web.client.RestTemplate plainRest =
            new org.springframework.web.client.RestTemplate();

    private static String gitCommit;
    private static String modelName;
    private static String authToken;
    private static List<ReleaseReport.ReleaseResult> results;
    private static List<BenchmarkQuestion> questions;
    private static boolean ollamaAvailable;

    @BeforeAll
    static void detectEnvironment() throws Exception {
        questions = BenchmarkDataset.all();
        // Detect git commit
        try {
            Process p = new ProcessBuilder("git", "rev-parse", "--short", "HEAD").start();
            String commit = new String(p.getInputStream().readAllBytes()).trim();
            gitCommit = !commit.isBlank() ? commit : "unknown";
        } catch (Exception e) {
            gitCommit = "unknown";
        }
    }

    @BeforeEach
    void setupAuthAndOllama() {
        // ── Authenticate ──
        if (authToken == null) {
            try {
                var plainRest = new org.springframework.web.client.RestTemplate();
                HttpHeaders h = new HttpHeaders();
                h.setContentType(MediaType.APPLICATION_JSON);
                String base = "http://localhost:" + port;
                // Register (ignore if already exists)
                try {
                    plainRest.postForEntity(base + "/api/auth/register",
                            new HttpEntity<>("{\"email\":\"bench@test.local\",\"password\":\"bench123\","
                                    + "\"displayName\":\"Bench Mark\",\"roles\":[]}", h), String.class);
                } catch (Exception ignored) {}
                // Login
                ResponseEntity<Map> login = plainRest.postForEntity(base + "/api/auth/login",
                        new HttpEntity<>("{\"email\":\"bench@test.local\",\"password\":\"bench123\"}",
                                h), Map.class);
                if (login.getBody() != null && login.getBody().get("accessToken") != null) {
                    authToken = "Bearer " + login.getBody().get("accessToken");
                }
            } catch (Exception e) {
                System.err.println("Auth setup: " + e.getMessage());
            }
        }
        assumeTrue(authToken != null, "Cannot authenticate for benchmark");

        // ── Verify Ollama ──
        if (!ollamaAvailable) {
            ResponseEntity<Map> modelResp = plainRest.getForEntity(
                    "http://localhost:" + port + "/api/providers/models", Map.class);
            if (modelResp.getBody() != null) {
                Boolean avail = (Boolean) modelResp.getBody().get("available");
                if (Boolean.TRUE.equals(avail)) {
                    ollamaAvailable = true;
                    List<?> models = (List<?>) modelResp.getBody().get("models");
                    if (models != null && !models.isEmpty()) {
                        Map<?, ?> first = (Map<?, ?>) models.get(0);
                        modelName = (String) first.get("name");
                    }
                    System.out.println("Ollama available — model: " + modelName);
                }
            }
        }
        assumeTrue(ollamaAvailable,
                "Ollama is not reachable. Start Ollama and ensure the model is pulled.");
    }

    @Test
    @DisplayName("Release benchmark — 40 questions via real pipeline")
    void runAllBenchmarks() {
        assertFalse(questions.isEmpty(), "Dataset must not be empty");
        results = new ArrayList<>();

        Instant batchStart = Instant.now();
        int count = 0;
        for (BenchmarkQuestion q : questions) {
            count++;
            System.out.printf("[%2d/%-2d] %s...%n", count, questions.size(), q.id());
            results.add(runOne(q));
        }
        long batchMs = Duration.between(batchStart, Instant.now()).toMillis();

        // ── Generate reports ──
        String md = ReleaseReport.markdown(results, gitCommit, modelName);

        System.out.println(md);

        writeReports(md);

        // ── Assertions ──
        long passed = results.stream().filter(ReleaseReport.ReleaseResult::passed).count();
        double rate = 100.0 * passed / results.size();

        System.out.printf("%nBatch complete: %d ms for %d questions%n", batchMs, questions.size());
        System.out.printf("READY FOR RELEASE: %s%n", rate >= 75.0 ? "YES" : "NO");

        assertTrue(rate >= 50.0,
                "Success rate " + String.format("%.1f", rate) + "% below 50% threshold");
        assertTrue(rate >= 75.0,
                "Success rate " + String.format("%.1f", rate) + "% below 75% — not ready for release");
    }

    private ReleaseReport.ReleaseResult runOne(BenchmarkQuestion q) {
        Instant start = Instant.now();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", authToken);
            String body = "question=" + java.net.URLEncoder.encode(q.question(),
                    java.nio.charset.StandardCharsets.UTF_8);
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = plainRest.postForEntity(
                    "http://localhost:" + port + "/decision?workspaceId=procurement",
                    entity, String.class);

            long totalMs = Duration.between(start, Instant.now()).toMillis();
            String html = response.getBody() != null ? response.getBody() : "";

            if (response.getStatusCode().value() != 200 || html.contains("AI service is not configured")) {
                List<String> failures = new ArrayList<>();
                if (response.getStatusCode().value() != 200) {
                    failures.add("HTTP " + response.getStatusCode().value());
                }
                if (html.contains("AI service is not configured")) {
                    failures.add("AI service not configured — check Ollama");
                }
                return ReleaseReport.from(q, response.getStatusCode().value(),
                        "UNKNOWN", 0.0, totalMs, 0, 0, "", "", false, failures);
            }

            // Parse HTML response
            String actualStrategy = parseStrategy(html);
            double confidence = parseConfidence(html);
            int sourceCount = parseSourceCount(html);
            int docCount = parseDocCount(html);
            String answer = parseAnswer(html);
            String regulation = parseRegulation(html);

            // Validate — ALL checks are HARD for release validation
            List<String> failures = new ArrayList<>();
            List<String> warnings = new ArrayList<>();
            String lower = answer.toLowerCase();

            if (!q.expectedStrategy().name().equals(actualStrategy)) {
                failures.add("Strategy: expected " + q.expectedStrategy()
                        + " but was " + actualStrategy);
            }
            if (confidence < q.minConfidence() || confidence > q.maxConfidence()) {
                failures.add("Confidence: expected " + q.minConfidence() + "-"
                        + q.maxConfidence() + " but was " + String.format("%.3f", confidence));
            }
            // HARD: regulation
            if (q.expectedRegulation() != null && !q.expectedRegulation().isBlank()) {
                if (!html.contains(q.expectedRegulation())) {
                    failures.add("Regulation: '" + q.expectedRegulation() + "' not found");
                }
            }
            // HARD: semantic required concepts
            for (String concept : q.mustContainConcepts()) {
                if (!lower.contains(concept.toLowerCase())) {
                    failures.add("Semantic: required '" + concept + "' not found");
                }
            }
            // HARD: semantic forbidden concepts
            for (String concept : q.mustNotContainConcepts()) {
                if (lower.contains(concept.toLowerCase())) {
                    failures.add("Semantic: forbidden '" + concept + "' found");
                }
            }
            // SOFT: legacy keyword checks
            for (String kw : q.expectedKeywords()) {
                if (!lower.contains(kw.toLowerCase())) {
                    warnings.add("Keyword: '" + kw + "' not found");
                }
            }
            for (String kw : q.forbiddenKeywords()) {
                if (lower.contains(kw.toLowerCase())) {
                    warnings.add("Forbidden: '" + kw + "' found");
                }
            }
            if (!warnings.isEmpty()) {
                failures.add("[ADVISORY] " + warnings.size() + " keyword warning(s)");
            }

            return ReleaseReport.from(q, response.getStatusCode().value(),
                    actualStrategy, confidence, totalMs, sourceCount, docCount,
                    answer, regulation, true, failures);

        } catch (Exception e) {
            long totalMs = Duration.between(start, Instant.now()).toMillis();
            return ReleaseReport.from(q, 0, "ERROR", 0.0, totalMs, 0, 0,
                    e.getMessage(), "", false,
                    List.of("Exception: " + e.getClass().getSimpleName() + " — " + e.getMessage()));
        }
    }

    // ═══════════════════════════════════════════════════════════
    // HTML Parsing
    // ═══════════════════════════════════════════════════════════

    static String parseStrategy(String html) {
        if (html.contains("Entscheidung aus strukturierter Wissensbasis")) {
            return DecisionStrategy.RULE_ENGINE.name();
        }
        if (html.contains("Rechtsvorschriften analysiert")
                || html.contains("Rechtsvorschrift analysiert")) {
            return DecisionStrategy.HYBRID_RETRIEVAL.name();
        }
        return "HYBRID_RETRIEVAL";
    }

    static double parseConfidence(String html) {
        // "Verlässlichkeit: Sehr hoch (98%)" or "Sehr hoch"
        Pattern p = Pattern.compile("(\\d{1,3})\\s*%");
        Matcher m = p.matcher(html);
        if (m.find()) return Double.parseDouble(m.group(1)) / 100.0;
        if (html.contains("Sehr hoch")) return 0.92;
        if (html.contains("Hoch")) return 0.78;
        if (html.contains("Mittel")) return 0.60;
        if (html.contains("Niedrig")) return 0.35;
        return 0.0;
    }

    static int parseSourceCount(String html) {
        Pattern p = Pattern.compile("(\\d+)\\s+relevante\\s+Textstelle");
        Matcher m = p.matcher(html);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }

    static int parseDocCount(String html) {
        Pattern p = Pattern.compile("(\\d+)\\s+Rechtsvorschrift");
        Matcher m = p.matcher(html);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }

    static String parseAnswer(String html) {
        // Extract kurzantwort + decision recommendation text
        StringBuilder sb = new StringBuilder();
        Pattern pa = Pattern.compile("<div class=\"kurzantwort-banner\">(.*?)</div>",
                Pattern.DOTALL);
        Matcher ma = pa.matcher(html);
        if (ma.find()) sb.append(ma.group(1).strip()).append("\n");
        Pattern pd = Pattern.compile("<div class=\"decision-recommendation\">(.*?)</div>",
                Pattern.DOTALL);
        Matcher md = pd.matcher(html);
        if (md.find()) {
            String text = md.group(1).replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").strip();
            sb.append(text);
        }
        String result = sb.toString().strip();
        return !result.isBlank() ? result : html;
    }

    static String parseRegulation(String html) {
        // Extract first regulation title from regulation cards
        Pattern p = Pattern.compile("<h4 class=\"reg-card-title\">(.*?)</h4>");
        Matcher m = p.matcher(html);
        if (m.find()) return m.group(1).strip();
        return "";
    }

    // ═══════════════════════════════════════════════════════════
    // Report output
    // ═══════════════════════════════════════════════════════════

    private static void writeReports(String md) {
        try {
            Path dir = Paths.get("target", "benchmark-reports");
            Files.createDirectories(dir);
            Files.writeString(dir.resolve("release-validation.md"), md);
            System.out.println("Report: " + dir.resolve("release-validation.md").toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Report write failed: " + e.getMessage());
        }
    }
}
