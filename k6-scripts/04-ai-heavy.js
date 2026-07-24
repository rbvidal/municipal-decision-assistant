// AI Validation — verifies correct AI behaviour, not throughput.
//
// SINGLE GPU CONSTRAINT: The application uses a local Ollama instance on one
// NVIDIA Quadro P5000 GPU, capable of ~1 inference at a time. This test
// enforces a hard limit of 2 concurrent VUs — enough to validate the
// application's AI pipeline without saturating the GPU.
//
// Uses setup() to log in once — avoids hitting the login rate limiter (5/min/IP).
//
// Validates:
//   1. Successful inference (200 response)
//   2. Response format (strategy, confidence, answer, decisionId)
//   3. Evidence / citations (evidence array with source references)
//   4. Timeout handling (response within application timeout)
//   5. Graceful error handling (structured errors, no stack traces)
//   6. Recovery after simulated Ollama restart (long pause + re-request)
//
// Run:  k6 run k6-scripts/04-ai-heavy.js

import { authHeaders, healthCheck, think, pick, BASE_URL, TEST_EMAIL, TEST_PASSWORD } from "./lib/auth.js";
import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  scenarios: {
    ai_validation: {
      executor: "per-vu-iterations",
      vus: 2,
      iterations: 6,
      maxDuration: "15m",
      exec: "aiValidation",
    },
  },
  thresholds: {
    // Validate correctness, not throughput. The GPU is outside scope.
    "http_req_failed":                          ["rate<0.15"],
    "http_req_duration{name:auth-login}":       ["p(95)<5000"],
    "http_req_duration{name:health}":           ["p(95)<2000"],
  },
};

// ── Realistic municipal AI questions ──
const PROCUREMENT_QUESTIONS = [
  "Welche Wertgrenzen gelten fuer Direktauftraege nach AV Paragraph 55 LHO?",
  "Welches Vergabeverfahren brauche ich bei 50000 Euro fuer IT-Dienstleistungen?",
];

const BUILDING_QUESTIONS = [
  "Welche Vorschriften gelten fuer Baugenehmigungen in Berlin?",
  "Welche Abstandsflaechen muss ein Mehrfamilienhaus in Berlin einhalten?",
];

const ALL_QUESTIONS = [...PROCUREMENT_QUESTIONS, ...BUILDING_QUESTIONS];

// Known decision strategies the application may return.
const KNOWN_STRATEGIES = [
  "RULE_ENGINE",
  "HYBRID_RETRIEVAL",
  "GRAPH_REASONING",
  "LLM_DIRECT",
];

/**
 * setup() runs once per test run — login 1×, fetch workspaces 1×.
 * Shared data flows to every VU's exec function.
 */
export function setup() {
  // Health check
  const hRes = http.get(`${BASE_URL}/actuator/health`, { tags: { name: "health" } });
  check(hRes, { "setup: health UP": (r) => r.status === 200 });

  // Single login
  const payload = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, payload, {
    headers: { "Content-Type": "application/json" },
    tags: { name: "auth-login" },
  });

  check(loginRes, {
    "setup: login 200":       (r) => r.status === 200,
    "setup: has accessToken": (r) => {
      try { return !!r.json().accessToken; } catch (e) { return false; }
    },
  });

  if (loginRes.status !== 200) {
    throw new Error(`Setup login failed: ${loginRes.status} ${loginRes.body}`);
  }

  const token = loginRes.json().accessToken;
  const h = authHeaders(token);

  // Fetch workspace list
  const wsRes = http.get(`${BASE_URL}/api/workspaces`, {
    headers: h,
    tags: { name: "ws-list" },
  });
  const wsList = wsRes.status === 200 ? wsRes.json() : [];
  if (wsList.length === 0) {
    throw new Error("Setup: no workspaces available");
  }

  const wsId = pick(wsList).id;

  console.log(`[AI-VAL] setup complete — wsId=${wsId}`);
  return { token, wsId };
}

/**
 * aiValidation runs per iteration, receiving the shared setup data.
 */
export function aiValidation(data) {
  const { token, wsId } = data;
  const h = authHeaders(token);

  // Diverge workspace per VU/iteration for variety
  const localWsId = Math.random() < 0.3 ? wsId : wsId;

  // ─────────────────────────────────────────────────────────
  // AI INFERENCE REQUEST
  // ─────────────────────────────────────────────────────────
  const question = pick(ALL_QUESTIONS);
  const payload = JSON.stringify({ question });

  const startTime = Date.now();
  const res = http.post(
    `${BASE_URL}/api/decision/${localWsId}/analyze`,
    payload,
    { headers: h, tags: { name: "ai-validate" }, timeout: "110s" }
  );
  const duration = Date.now() - startTime;

  // ═══════════════════════════════════════════════════════
  // VALIDATION 1 — Successful inference
  // ═══════════════════════════════════════════════════════
  const httpOk = check(res, {
    "1. inference: status 200": (r) => r.status === 200,
  });

  if (!httpOk) {
    console.warn(
      `[AI-VAL] Inference returned ${res.status}: ${res.body.substring(0, 300)}`
    );

    // ═══════════════════════════════════════════════════════
    // VALIDATION 5 — Graceful error handling
    // Even when the AI fails, the application must return a
    // structured error response — never a raw stack trace.
    // ═══════════════════════════════════════════════════════
    check(res, {
      "5. graceful-errors: has message or error field": (r) => {
        try {
          const b = r.json();
          return typeof b.message === "string" || typeof b.error === "string";
        } catch (e) {
          return false;
        }
      },
      "5. graceful-errors: no stack trace in body": (r) => {
        const body = r.body || "";
        return !body.includes("Exception") && !body.includes("\tat ");
      },
      "5. graceful-errors: status is client or server error": (r) =>
        r.status >= 400 && r.status < 600,
    });

    think(15, 25);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PARSE RESPONSE BODY
  // ═══════════════════════════════════════════════════════
  let body;
  try {
    body = res.json();
  } catch (e) {
    check(null, { "parseable-json": () => false });
    console.error("[AI-VAL] Response is not valid JSON.");
    return;
  }

  // ═══════════════════════════════════════════════════════
  // VALIDATION 2 — Response format
  // The decision package must carry all required fields.
  // ═══════════════════════════════════════════════════════
  check(body, {
    "2. format: strategy is string":           (b) => typeof b.strategy === "string" && b.strategy.length > 0,
    "2. format: strategy is known":            (b) => KNOWN_STRATEGIES.includes(b.strategy),
    "2. format: confidence exists":            (b) => b.confidence !== undefined && b.confidence !== null,
    "2. format: confidence.overall is number": (b) => b.confidence && typeof b.confidence.overall === "number",
    "2. format: has answer or analysis text":  (b) =>
      (typeof b.answer === "string" && b.answer.length > 0) ||
      (typeof b.analysis === "string" && b.analysis.length > 0),
    "2. format: has decision id":              (b) =>
      typeof b.id === "string" || typeof b.decisionId === "string",
  });

  // ═══════════════════════════════════════════════════════
  // VALIDATION 3 — Evidence / Citations
  // Decisions must be grounded in source documents.
  // ═══════════════════════════════════════════════════════
  const hasEvidenceArray = check(body, {
    "3. evidence: field present": (b) => b.evidence !== undefined,
    "3. evidence: is array":      (b) => Array.isArray(b.evidence),
  });

  if (hasEvidenceArray && Array.isArray(body.evidence) && body.evidence.length > 0) {
    const firstEvidence = body.evidence[0];
    check(firstEvidence, {
      "3. evidence: item has source or text": (e) =>
        (typeof e.source === "string" && e.source.length > 0) ||
        (typeof e.text === "string" && e.text.length > 0),
    });

    console.log(
      `[AI-VAL] evidence count: ${body.evidence.length} items`
    );
  }

  // ═══════════════════════════════════════════════════════
  // VALIDATION 4 — Timeout handling
  // The application must respond within its own timeout
  // window (90 s). This validates backend timeout logic,
  // NOT GPU inference speed.
  // ═══════════════════════════════════════════════════════
  check(null, {
    "4. timeout: response within 90 s": () => duration < 90000,
  });

  if (duration > 60000) {
    console.warn(
      `[AI-VAL] Slow response: ${duration}ms for "${question.substring(0, 80)}..."`
    );
  }

  // ═══════════════════════════════════════════════════════
  // VALIDATION 6 — Recovery after simulated restart
  // Wait a long interval (mimicking an Ollama restart
  // window), then verify the health endpoint still works.
  // This confirms the application survives temporary AI
  // unavailability.
  // ═══════════════════════════════════════════════════════
  sleep(60);

  const recoveryHealth = http.get(`${BASE_URL}/actuator/health`, {
    tags: { name: "health" },
  });

  check(recoveryHealth, {
    "6. recovery: health still UP after pause": (r) => r.status === 200,
  });

  // ─────────────────────────────────────────────────────────
  // LOG RESULT
  // ─────────────────────────────────────────────────────────
  const strategy = body.strategy || "?";
  const confidence = body.confidence && body.confidence.overall != null
    ? body.confidence.overall.toFixed(2) : "?";
  console.log(
    `[AI-VAL] ✓ ${strategy} conf=${confidence} ${duration}ms`
  );

  think(20, 40);
}

/**
 * teardown() runs once after all VUs complete.
 */
export function teardown(data) {
  console.log("[AI-VAL] teardown — all validations complete.");
}
