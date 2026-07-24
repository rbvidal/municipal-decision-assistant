// Search Intensive — high search + document retrieval load.
// Simulates research-heavy periods (policy analysis, legal research).
// Targets: Qdrant vector search, Neo4j graph, PostgreSQL full-text.
// Run: k6 run k6-scripts/05-search-intensive.js

import { login, authHeaders, healthCheck, think, pick, BASE_URL } from "./lib/auth.js";
import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "30s", target: 1  },
    { duration: "2m",  target: 8  },
    { duration: "2m",  target: 15 },
    { duration: "6m",  target: 15 },
    { duration: "1m",  target: 0  },
  ],
  thresholds: {
    "http_req_duration{name:health}":       ["p(95)<500"],
    "http_req_duration{name:auth-login}":   ["p(95)<3000"],
    "http_req_failed":                      ["rate<0.05"],
    "http_req_duration{name:search}":      ["p(95)<15000"],
    "http_req_duration{name:doc-content}": ["p(95)<3000"],
    "http_req_duration{name:knowledge}":   ["p(95)<1000"],
  },
};

const QUERIES = [
  "Baugenehmigung Verfahren Berlin",
  "Vergaberecht Schwellenwerte Direktauftrag",
  "Bauordnung Abstandsflaechen Mehrfamilienhaus",
  "TV-L Entgeltgruppe Stufenaufstieg",
  "Dienstreise Verpflegungspauschale BRKG",
  "Gemeindeordnung Gemeinderat Beschluss",
  "Datenschutz DSGVO Auftragsverarbeitung",
  "Haushaltsrecht Uebertragbarkeit Restmittel",
  "Beschaffung IT-Dienstleistungen Wertgrenze",
  "BImSchG Genehmigung Umweltvertraeglichkeit",
  "Personalrat Mitbestimmung Eingruppierung",
  "Bauvorlageverordnung Bauantrag Unterlagen",
];

const CATEGORIES = ["Vergaberecht", "Bauplanungsrecht", "Umweltrecht", "Kommunalrecht"];

export default function () {
  healthCheck();
  think(0.1, 0.3);

  const tokens = login();
  if (!tokens) return;
  const h = authHeaders(tokens.accessToken);
  think(0.2, 0.5);

  // Fetch documents once per iteration for content access
  const docsRes = http.get(`${BASE_URL}/api/documents`, { headers: h, tags: { name: "docs-list" } });
  const allDocs = docsRes.status === 200 ? (docsRes.json().documents || []) : [];
  think(0.5, 1);

  // ── 2-3 searches per iteration ──
  for (let i = 0; i < 3; i++) {
    const q = pick(QUERIES);
    const res = http.post(`${BASE_URL}/api/search`,
      JSON.stringify({ query: q, page: 0, size: 10 }),
      { headers: h, tags: { name: "search" } });
    check(res, { "search ok": (r) => r.status === 200 });
    think(1.5, 3);
  }

  // ── Access 2 random document contents ──
  for (let i = 0; i < 2; i++) {
    if (allDocs.length > 0) {
      const doc = pick(allDocs);
      http.get(`${BASE_URL}/api/documents/${doc.id}/content`, { headers: h, tags: { name: "doc-content" } });
      think(0.5, 1.5);
    }
  }

  // ── Knowledge browsing ──
  http.get(`${BASE_URL}/api/knowledge/search?q=&category=${pick(CATEGORIES)}`, { headers: h, tags: { name: "knowledge" } });
  think(0.5, 1);
  http.get(`${BASE_URL}/api/knowledge`, { headers: h, tags: { name: "knowledge" } });
  think(1, 2);
}
