// Smoke test — 1 virtual user, basic endpoint health check
// Usage: k6 run k6-scripts/smoke-test.js

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests under 2s
    http_req_failed: ["rate<0.01"],     // <1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  // Health check
  const health = http.get(`${BASE_URL}/actuator/health`);
  check(health, { "health status 200": (r) => r.status === 200 });

  sleep(1);
}
