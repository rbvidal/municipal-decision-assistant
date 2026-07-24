// Smoke Test — 1 VU, 5 minutes — deployment gate check.
// If this fails, do NOT proceed to larger tests.
//
// Run:  k6 run k6-scripts/01-smoke-test.js
//   or k6 run k6-scripts/01-smoke-test.js -e BASE_URL=http://staging:8080

import { login, authHeaders, healthCheck, think, BASE_URL, STANDARD_THRESHOLDS } from "./lib/auth.js";
import { check } from "k6";
import http from "k6/http";

export const options = {
  vus: 1,
  duration: "5m",
  thresholds: STANDARD_THRESHOLDS,
};

export default function () {
  // ── 1. Health ──
  healthCheck();
  think(0.2, 0.5);

  // ── 2. Login ──
  const tokens = login();
  if (!tokens) return;
  const h = authHeaders(tokens.accessToken);
  think(0.2, 0.5);

  // ── 3. Workspaces ──
  let res = http.get(`${BASE_URL}/api/workspaces`, { headers: h, tags: { name: "workspaces" } });
  check(res, { "ws list 200": (r) => r.status === 200 });
  const wsId = res.status === 200 ? (res.json()[0] || {}).id : null;
  think(0.3, 0.8);
  if (wsId) {
    res = http.get(`${BASE_URL}/api/workspaces/${wsId}`, { headers: h, tags: { name: "workspace" } });
    check(res, { "ws get 200": (r) => r.status === 200 });
    think(0.3, 0.8);
  }

  // ── 4. Documents ──
  res = http.get(`${BASE_URL}/api/documents`, { headers: h, tags: { name: "documents" } });
  check(res, { "docs 200": (r) => r.status === 200 });
  const docs = res.status === 200 ? (res.json().documents || []) : [];
  think(0.3, 0.8);

  if (docs.length > 0) {
    const docId = docs[0].id;
    res = http.get(`${BASE_URL}/api/documents/${docId}/content`, { headers: h, tags: { name: "doc-content" } });
    check(res, { "content 200": (r) => r.status === 200 });
    think(0.5, 1);
  }

  // ── 5. Knowledge ──
  res = http.get(`${BASE_URL}/api/knowledge`, { headers: h, tags: { name: "knowledge" } });
  check(res, { "knowledge 200": (r) => r.status === 200 });
  think(0.3, 0.8);

  // ── 6. Search ──
  res = http.post(`${BASE_URL}/api/search`,
    JSON.stringify({ query: "Baugenehmigung", page: 0, size: 5 }),
    { headers: h, tags: { name: "search" } });
  check(res, { "search 200": (r) => r.status === 200 });
  think(1, 2);

  // ── 7. Decision status (light) ──
  res = http.get(`${BASE_URL}/api/decision/test-case`, { headers: h, tags: { name: "decision" } });
  check(res, { "decision 200": (r) => r.status === 200 });
  think(0.2, 0.5);

  // ── 8. Audit ──
  res = http.get(`${BASE_URL}/api/corpus/audit`, { headers: h, tags: { name: "audit" } });
  check(res, { "audit 200": (r) => r.status === 200 });
}
