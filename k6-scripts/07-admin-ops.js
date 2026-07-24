// Admin Operations — audit browsing, corpus inspection, supervisor review.
// Simulates administrative staff checking logs, monitoring corpus health.
// Run: k6 run k6-scripts/07-admin-ops.js

import { sleep } from "k6";
import { login, authHeaders, healthCheck, BASE_URL } from "./lib/auth.js";
import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "30s", target: 1 },
    { duration: "1m",  target: 3 },
    { duration: "5m",  target: 3 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    "http_req_duration{name:audit}":     ["p(95)<2000"],
    "http_req_duration{name:corpus-packages}": ["p(95)<1000"],
    "http_req_duration{name:corpus-metrics}":  ["p(95)<1000"],
    "http_req_failed": ["rate<0.02"],
  },
};

const adminTasks = [
  "audit",           // Review audit log
  "corpus-packages", // Check corpus packages
  "corpus-metrics",  // View corpus metrics
  "corpus-jobs",     // Monitor ingestion jobs
  "health-details",  // Check detailed health
];

export default function () {
  healthCheck();
  const tokens = login();
  if (!tokens) return;
  const h = authHeaders(tokens.accessToken);
  sleep(1);

  // Pick 3 random admin tasks per iteration
  const tasks = adminTasks.sort(() => Math.random() - 0.5).slice(0, 3);

  for (const task of tasks) {
    let res;
    switch (task) {
      case "audit":
        res = http.get(`${BASE_URL}/api/corpus/audit`, { headers: h, tags: { name: "audit" } });
        check(res, { "audit 200": (r) => r.status === 200 });
        break;

      case "corpus-packages":
        res = http.get(`${BASE_URL}/api/corpus/packages`, { headers: h, tags: { name: "corpus-packages" } });
        check(res, { "packages 200": (r) => r.status === 200 });
        break;

      case "corpus-metrics":
        res = http.get(`${BASE_URL}/api/corpus/metrics`, { headers: h, tags: { name: "corpus-metrics" } });
        check(res, { "metrics 200": (r) => r.status === 200 });
        break;

      case "corpus-jobs":
        res = http.get(`${BASE_URL}/api/corpus/jobs`, { headers: h, tags: { name: "corpus-jobs" } });
        check(res, { "jobs 200": (r) => r.status === 200 });
        break;

      case "health-details":
        res = http.get(`${BASE_URL}/actuator/health`, { tags: { name: "health-detail" } });
        check(res, { "health 200": (r) => r.status === 200 });
        break;
    }
    sleep(2);
  }

  // Check workspaces for admin overview
  http.get(`${BASE_URL}/api/workspaces`, { headers: h, tags: { name: "ws-list" } });
  sleep(1);

  // List all documents
  http.get(`${BASE_URL}/api/documents`, { headers: h, tags: { name: "docs-all" } });
  sleep(1);
}
