// Stress test — ramp from 10 to 100 users, identify breaking point
// Usage: k6 run k6-scripts/stress-test.js

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },  // warm up
    { duration: "1m", target: 50 },   // ramp up
    { duration: "1m", target: 100 },  // peak load
    { duration: "30s", target: 0 },   // cool down
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000"],
    http_req_failed: ["rate<0.10"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  const res = http.get(`${BASE_URL}/actuator/health`);
  check(res, { "OK": (r) => r.status === 200 });
  sleep(1);
}
