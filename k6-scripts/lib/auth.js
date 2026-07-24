// Shared authentication, helpers, and thresholds for all k6 test scripts.
import { check, sleep } from "k6";
import http from "k6/http";

// ── Environment Configuration ──
export const BASE_URL   = __ENV.BASE_URL        || "http://localhost:8080";
export const TEST_EMAIL    = __ENV.TEST_EMAIL    || "test@test.de";
export const TEST_PASSWORD = __ENV.TEST_PASSWORD || "Test123!";

// ── Token Cache (per-VU) ──
// Avoids re-login on every iteration when scenarios share a VU.
let cachedToken  = null;
let cachedExpiry = 0;   // epoch seconds

/**
 * Login (or return cached token if still valid).
 * The login rate limiter allows 5/min/IP — retries with backoff on 429.
 * Token is cached per-VU so only first iteration or expiry triggers a real call.
 */
export function login() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < cachedExpiry - 60) {   // refresh 60 s before expiry
    return { accessToken: cachedToken };
  }

  const payload = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
      headers: { "Content-Type": "application/json" },
      tags: { name: "auth-login" },
    });

    if (res.status === 429) {
      const retryAfter = Math.min((attempt + 1) * 20, 60);  // 20, 40, 60 s backoff
      console.warn(`Login rate-limited (429), retrying in ${retryAfter}s (attempt ${attempt + 1}/${maxRetries})`);
      sleep(retryAfter);
      continue;
    }

    check(res, {
      "login 200":          (r) => r.status === 200,
      "has accessToken":    (r) => { try { return !!r.json().accessToken; } catch (e) { return false; } },
    });

    if (res.status !== 200) {
      console.error(`Login failed ${res.status}: ${res.body.substring(0, 200)}`);
      return null;
    }

    try {
      const body = res.json();
      cachedToken  = body.accessToken;
      cachedExpiry = Math.floor(new Date(body.accessTokenExpiresAt).getTime() / 1000);
      return body;
    } catch (e) {
      return null;
    }
  }

  console.error("Login failed after all retries.");
  return null;
}

/**
 * Standard authenticated JSON headers.
 */
export function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Public health check.
 */
export function healthCheck() {
  const res = http.get(`${BASE_URL}/actuator/health`, { tags: { name: "health" } });
  check(res, { "health UP": (r) => r.status === 200 });
}

/**
 * Randomized think time between `min` and `max` seconds.
 * Usage: think(2, 5)  → sleeps 2-5 seconds
 */
export function think(min, max) {
  sleep(min + Math.random() * (max - min));
}

/**
 * Pick a random element from an array.
 */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Common k6 thresholds used across all non-AI scripts.
 */
export const STANDARD_THRESHOLDS = {
  "http_req_duration{name:health}":       ["p(95)<500"],
  "http_req_duration{name:auth-login}":   ["p(95)<3000"],
  "http_req_failed":                      ["rate<0.05"],
};

