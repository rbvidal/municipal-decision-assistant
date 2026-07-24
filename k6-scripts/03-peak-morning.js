// Peak Morning Load — 50 VUs simulating login rush.
// NOTE: The login endpoint is rate-limited to 5 req/min/IP.
// When testing from a single machine, VUs will be throttled.
// For full-scale testing, distribute VUs across multiple load generators
// or use a shared token pool via the setup() function.
//
// This script uses k6's exec.default with staggered ramp to avoid
// triggering the rate limiter on a single-IP test machine.
//
// Run:  k6 run k6-scripts/03-peak-morning.js

import { login, authHeaders, healthCheck, think, pick, BASE_URL } from "./lib/auth.js";
import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "30s", target: 1  },    // single-user warmup
    { duration: "1m",  target: 5  },    // early birds — within rate limit
    { duration: "2m",  target: 15 },    // morning ramp (token cache avoids re-login)
    { duration: "2m",  target: 30 },    // approaching peak
    { duration: "1m",  target: 50 },    // peak rush — many VUs, token cache critical
    { duration: "4m",  target: 50 },    // sustained peak
    { duration: "2m",  target: 10 },    // settling
    { duration: "30s", target: 0  },    // drain
  ],
  thresholds: {
    "http_req_duration{name:health}":       ["p(95)<500"],
    "http_req_duration{name:auth-login}":   ["p(95)<3000"],
    "http_req_failed":                      ["rate<0.08"],  // allow some rate-limit 429s
    "http_req_duration{name:workspaces}":   ["p(95)<2000"],
    "http_req_duration{name:search}":       ["p(95)<15000"],
  },
};

const QUERIES = [
  "Baugenehmigung Berlin Verfahren",
  "Vergaberecht Schwellenwerte",
  "Bauordnung Abstandsflaechen",
  "TV-L Entgeltgruppe Stufe",
  "Dienstreise Verpflegung",
  "Gemeinderat Beschluss Zustimmung",
];

export default function () {
  healthCheck();
  think(0.1, 0.5);  // staggered — spreads load naturally

  // Login (cached after first call per VU)
  const tokens = login();
  if (!tokens) return;
  const h = authHeaders(tokens.accessToken);
  think(0.3, 2);  // random stagger — critical for avoiding rate limiter

  // Fetch workspaces
  let wsId = null;
  const wsRes = http.get(`${BASE_URL}/api/workspaces`, { headers: h, tags: { name: "workspaces" } });
  if (wsRes.status === 200) {
    const wsList = wsRes.json();
    if (wsList.length > 0) wsId = pick(wsList).id;
  }
  think(0.5, 2);

  // Open workspace
  if (wsId) {
    http.get(`${BASE_URL}/api/workspaces/${wsId}`, { headers: h, tags: { name: "workspace" } });
    think(0.5, 1.5);
    http.get(`${BASE_URL}/api/workspaces/${wsId}/documents`, { headers: h, tags: { name: "ws-docs" } });
    think(0.3, 1);
    http.get(`${BASE_URL}/api/workspaces/${wsId}/checklist`, { headers: h, tags: { name: "ws-checklist" } });
    think(0.3, 1);
  }

  // Search — typical morning task
  const q = pick(QUERIES);
  const res = http.post(`${BASE_URL}/api/search`,
    JSON.stringify({ query: q, page: 0, size: 10 }),
    { headers: h, tags: { name: "search" } });
  check(res, { "search ok": (r) => r.status === 200 });
  think(1, 4);

  // Documents
  http.get(`${BASE_URL}/api/documents`, { headers: h, tags: { name: "documents" } });
  think(0.5, 1.5);

  // Decision status
  if (wsId) {
    http.get(`${BASE_URL}/api/decision/${wsId}`, { headers: h, tags: { name: "decision" } });
  }

  // Morning pace — 1-5 minutes between actions as users settle in
  think(60, 300);
}
