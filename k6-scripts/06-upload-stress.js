// Upload Stress — concurrent document uploads.
// Tests multipart upload handling, file size limits, and ingestion pipeline.
// Run: k6 run k6-scripts/06-upload-stress.js

import { sleep } from "k6";
import { login, authHeaders, healthCheck, BASE_URL } from "./lib/auth.js";
import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "1m", target: 1 },
    { duration: "1m", target: 5 },
    { duration: "5m", target: 5 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    "http_req_duration{name:upload}": ["p(95)<10000"],
    "http_req_duration{name:docs-list}": ["p(95)<2000"],
    "http_req_failed{name:upload}": ["rate<0.10"],
  },
};

// Create a small in-memory text file for upload
function createTestFile(name) {
  const content =
    `Test-Dokument ${name}\nErstellt: ${new Date().toISOString()}\n\n` +
    "Dies ist ein automatisch generiertes Testdokument fuer den Upload-Stress-Test.\n" +
    "Es simuliert einen Dokument-Upload wie er in einer Kommunalverwaltung vorkommt.\n\n" +
    "Art des Dokuments: Sachstandsbericht\n" +
    "Aktenzeichen: TEST-2026-" + Math.floor(Math.random() * 9999) + "\n" +
    "Fachbereich: Bauamt\n";
  return http.file(
    content,
    `test-upload-${name}.txt`,
    "text/plain"
  );
}

export default function () {
  healthCheck();
  const tokens = login();
  if (!tokens) return;
  const h = authHeaders(tokens.accessToken);
  // Note: upload uses multipart, so we need a separate header set without JSON content-type
  const uploadHeaders = { Authorization: `Bearer ${tokens.accessToken}` };
  sleep(1);

  // First: list existing documents
  http.get(`${BASE_URL}/api/documents`, { headers: h, tags: { name: "docs-list" } });
  sleep(1);

  // Upload a document via multipart
  const file = createTestFile(Date.now());
  const res = http.post(
    `${BASE_URL}/api/documents/upload?title=Upload-Stress-Test`,
    { file },
    { headers: uploadHeaders, tags: { name: "upload" } }
  );

  check(res, {
    "upload 200 or 201": (r) => r.status === 200 || r.status === 201,
  });

  if (res.status >= 400) {
    console.log(`Upload response (${res.status}): ${res.body.substring(0, 200)}`);
  }

  sleep(3);
}
