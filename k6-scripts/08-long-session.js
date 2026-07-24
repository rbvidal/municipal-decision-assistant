// Long Session — single VU, 60 minutes of realistic office activity.
// Purpose: detect memory leaks, session drift, GC pressure, connection exhaustion.
// Token is refreshed every 25 minutes (TTL is 15 min default).
//
// Run:  k6 run k6-scripts/08-long-session.js

import { login, authHeaders, healthCheck, think, pick, BASE_URL } from "./lib/auth.js";
import { check } from "k6";
import { Trend } from "k6/metrics";
import http from "k6/http";

export const options = {
  vus: 1,
  duration: "60m",
  thresholds: {
    "http_req_duration{name:health}":   ["p(95)<1000"],
    "http_req_duration{name:search}":   ["p(95)<15000"],
    "http_req_failed":                  ["rate<0.05"],
  },
};

// Custom trends track drift over time
const searchDrift = new Trend("search_latency_drift", true);
const heapGauge   = new Trend("heap_mb", true);

// ── Session management ──
let token       = null;
let tokenExpiry = 0;
const REFRESH_INTERVAL_SEC = 25 * 60;  // refresh every 25 min (token TTL=15 min)

function ensureSession() {
  const now = Math.floor(Date.now() / 1000);
  if (token && now < tokenExpiry - 120) return;  // still valid with 2-minute buffer

  const tokens = login();
  if (!tokens) return;

  token = tokens.accessToken;
  tokenExpiry = Math.floor(new Date(tokens.accessTokenExpiresAt).getTime() / 1000);
  console.log(`[${new Date().toISOString().substring(11, 19)}] Token refreshed — expires ${new Date(tokenExpiry * 1000).toISOString().substring(11, 19)}`);
}

// ── Work cycle — simulates 15-minute activity blocks ──
const SEARCHES = [
  "Baugenehmigung Berlin", "Vergaberecht Schwellenwerte", "TV-L Entgeltgruppe 9",
  "Dienstreise BRKG Pauschale", "Bauordnung Abstandsflaechen", "DSGVO Auftragsverarbeitung",
];

export default function () {
  // ── Minute 0: Health + Session ──
  healthCheck();
  think(0.1, 0.3);
  ensureSession();
  if (!token) { think(5, 10); return; }

  const h = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // ── Minute 1-2: Workspace check ──
  let wsId = null;
  const wsRes = http.get(`${BASE_URL}/api/workspaces`, { headers: h, tags: { name: "workspaces" } });
  if (wsRes.status === 200) {
    const wsList = wsRes.json();
    if (wsList.length > 0) wsId = pick(wsList).id;
  }
  think(1, 3);

  if (wsId) {
    http.get(`${BASE_URL}/api/workspaces/${wsId}`, { headers: h, tags: { name: "workspace" } });
    think(2, 4);
    http.get(`${BASE_URL}/api/workspaces/${wsId}/documents`, { headers: h, tags: { name: "ws-docs" } });
    think(1, 2);
  }

  // ── Minute 3-4: Search ──
  const res = http.post(`${BASE_URL}/api/search`,
    JSON.stringify({ query: pick(SEARCHES), page: 0, size: 10 }),
    { headers: h, tags: { name: "search" } });
  searchDrift.add(res.timings.duration);
  think(3, 6);

  // ── Minute 5-6: Documents ──
  const docsRes = http.get(`${BASE_URL}/api/documents`, { headers: h, tags: { name: "documents" } });
  if (docsRes.status === 200) {
    const docs = docsRes.json().documents || [];
    if (docs.length > 0) {
      http.get(`${BASE_URL}/api/documents/${pick(docs).id}/content`, { headers: h, tags: { name: "doc-content" } });
    }
  }
  think(2, 4);

  // ── Minute 7: Knowledge ──
  http.get(`${BASE_URL}/api/knowledge`, { headers: h, tags: { name: "knowledge" } });
  think(1, 3);

  // ── Minute 8: Decision status ──
  if (wsId) {
    http.get(`${BASE_URL}/api/decision/${wsId}`, { headers: h, tags: { name: "decision" } });
  }
  think(0.5, 1);

  // ── JVM metric sampling ──
  try {
    const mRes = http.get(`${BASE_URL}/actuator/metrics/jvm.memory.used`, { tags: { name: "metrics" } });
    if (mRes.status === 200) {
      const mb = mRes.json().measurements[0].value / 1024 / 1024;
      heapGauge.add(mb);
    }
  } catch (e) { /* metrics optional */ }

  // ── Office pace ~12-15 minutes between activity cycles ──
  think(720, 900);
}
