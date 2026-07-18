// Average load test — 10 concurrent users for 2 minutes
// Usage: k6 run k6-scripts/average-load.js

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "2m",
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

function randomString(len) {
  return Math.random().toString(36).substring(2, 2 + len);
}

export default function () {
  // Search query (most common user action)
  const searchPayload = JSON.stringify({
    query: "Bauordnung Abstandsflächen Berlin",
    documentType: "all",
    domain: "all",
  });
  const searchRes = http.post(`${BASE_URL}/api/search`, searchPayload, {
    headers: { "Content-Type": "application/json" },
  });
  check(searchRes, { "search OK": (r) => r.status === 200 });

  sleep(2);

  // Document listing
  const docsRes = http.get(`${BASE_URL}/api/documents?page=0&size=10`);
  check(docsRes, { "docs OK": (r) => r.status === 200 || r.status === 401 });

  sleep(1);
}
