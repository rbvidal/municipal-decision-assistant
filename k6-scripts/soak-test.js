// Soak test — 20 concurrent users for 1 hour
// Tests memory stability and resource leaks under sustained load.
// Usage: k6 run k6-scripts/soak-test.js

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "1h",
  thresholds: {
    http_req_duration: ["p(95)<5000"],
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.95"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

const QUERIES = [
  "Bauordnung Abstandsflächen Berlin",
  "Vergaberecht Direktauftrag Wertgrenzen",
  "TV-L Entgeltgruppe 9a Stufe 3",
  "Dienstreise Tagegeld 8 Stunden",
  "Baugenehmigung Carport",
  "Brandschutz Bürogebäude",
  "VgV Schwellenwerte 2024",
  "UrlVO Resturlaub übertragen",
];

export default function () {
  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];

  // Search endpoint
  const searchRes = http.post(
    `${BASE_URL}/api/search`,
    JSON.stringify({ query, documentType: "all", domain: "all" }),
    { headers: { "Content-Type": "application/json" } },
  );
  check(searchRes, { "search OK": (r) => r.status === 200 });

  sleep(3);

  // Health check
  const healthRes = http.get(`${BASE_URL}/actuator/health`);
  check(healthRes, { "health OK": (r) => r.status === 200 });

  sleep(2);
}
