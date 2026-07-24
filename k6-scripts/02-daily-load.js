// Normal Daily Municipal Office Load — 20 concurrent VUs, 15 minutes.
// Simulates: login → browse workspaces → search regulations → read documents → review knowledge.
//
// Run:  k6 run k6-scripts/02-daily-load.js

import { login, authHeaders, healthCheck, think, pick, BASE_URL } from "./lib/auth.js";
import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "30s", target: 1  },   // single-user warmup
    { duration: "2m",  target: 10 },   // gradual ramp
    { duration: "2m",  target: 20 },   // full load
    { duration: "8m",  target: 20 },   // steady state — 8 minutes of normal office activity
    { duration: "2m",  target: 5  },   // wind-down
    { duration: "30s", target: 0  },   // drain
  ],
  thresholds: {
    "http_req_duration{name:health}":       ["p(95)<500"],
    "http_req_duration{name:auth-login}":   ["p(95)<3000"],
    "http_req_failed":                      ["rate<0.05"],
    "http_req_duration{name:workspaces}":   ["p(95)<1500"],
    "http_req_duration{name:documents}":    ["p(95)<2000"],
    "http_req_duration{name:search}":       ["p(95)<12000"],
    "http_req_duration{name:doc-content}":  ["p(95)<3000"],
    "http_req_duration{name:knowledge}":    ["p(95)<1000"],
  },
};

// ── Realistic municipal search queries ──
const SEARCH_QUERIES = [
  "Baugenehmigung Verfahren Berlin",
  "Vergaberecht Schwellenwerte Direktauftrag",
  "Bauordnung Abstandsflaechen Mehrfamilienhaus",
  "TV-L Entgeltgruppe Stufenaufstieg",
  "Dienstreise Verpflegungspauschale BRKG",
  "Gemeindeordnung Gemeinderat Beschluss",
  "Datenschutz DSGVO Auftragsverarbeitung",
  "Haushaltsrecht Uebertragbarkeit Restmittel",
];

// ── Knowledge categories ──
const CATEGORIES = ["Vergaberecht", "Bauplanungsrecht", "Umweltrecht", "Kommunalrecht"];

// ── Workflow weights (realistic office distribution) ──
const WORKFLOWS = [
  { name: "workspace-review", weight: 35 },
  { name: "regulation-search", weight: 30 },
  { name: "document-access",  weight: 20 },
  { name: "knowledge-browse", weight: 10 },
  { name: "audit-review",     weight: 5  },
];

function chooseWorkflow() {
  const r = Math.random() * 100;
  let acc = 0;
  for (const w of WORKFLOWS) { acc += w.weight; if (r < acc) return w.name; }
  return "workspace-review";
}

export default function () {
  healthCheck();
  think(0.1, 0.3);

  const tokens = login();
  if (!tokens) return;
  const h = authHeaders(tokens.accessToken);
  think(0.2, 0.5);

  // Every VU fetches workspaces (always needed for context)
  let wsId = null;
  const wsRes = http.get(`${BASE_URL}/api/workspaces`, { headers: h, tags: { name: "workspaces" } });
  if (wsRes.status === 200) {
    const wsList = wsRes.json();
    if (wsList.length > 0) wsId = pick(wsList).id;
  }
  think(0.5, 1);

  // ── Execute a weighted workflow ──
  const wf = chooseWorkflow();

  switch (wf) {

    case "workspace-review":
      if (wsId) {
        http.get(`${BASE_URL}/api/workspaces/${wsId}`, { headers: h, tags: { name: "workspace" } });
        think(0.5, 1);
        http.get(`${BASE_URL}/api/workspaces/${wsId}/documents`, { headers: h, tags: { name: "ws-docs" } });
        think(0.3, 0.6);
        http.get(`${BASE_URL}/api/workspaces/${wsId}/checklist`, { headers: h, tags: { name: "ws-checklist" } });
        think(0.3, 0.6);
        http.get(`${BASE_URL}/api/workspaces/${wsId}/timeline`, { headers: h, tags: { name: "ws-timeline" } });
      }
      break;

    case "regulation-search": {
      const q = pick(SEARCH_QUERIES);
      const res = http.post(`${BASE_URL}/api/search`,
        JSON.stringify({ query: q, page: 0, size: 10 }),
        { headers: h, tags: { name: "search" } });
      check(res, { "search ok": (r) => r.status === 200 });
      think(2, 4);  // reading search results
      break;
    }

    case "document-access": {
      const docsRes = http.get(`${BASE_URL}/api/documents`, { headers: h, tags: { name: "documents" } });
      if (docsRes.status === 200) {
        const docs = docsRes.json().documents || [];
        if (docs.length > 0) {
          const docId = pick(docs).id;
          http.get(`${BASE_URL}/api/documents/${docId}/content`, { headers: h, tags: { name: "doc-content" } });
          think(2, 5);  // reading a document
        }
      }
      break;
    }

    case "knowledge-browse": {
      http.get(`${BASE_URL}/api/knowledge`, { headers: h, tags: { name: "knowledge" } });
      think(0.5, 1);
      const cat = pick(CATEGORIES);
      http.get(`${BASE_URL}/api/knowledge/search?q=&category=${cat}`, { headers: h, tags: { name: "knowledge-filter" } });
      think(1, 3);
      break;
    }

    case "audit-review":
      http.get(`${BASE_URL}/api/corpus/audit`, { headers: h, tags: { name: "audit" } });
      think(1, 2);
      break;
  }

  // Lightweight decision status check on most iterations
  if (Math.random() < 0.3 && wsId) {
    http.get(`${BASE_URL}/api/decision/${wsId}`, { headers: h, tags: { name: "decision" } });
  }

  // Office pace: 30-90 seconds between meaningful actions
  think(30, 90);
}
