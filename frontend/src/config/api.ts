import { ENV } from './environment';

const BASE = ENV.apiBaseUrl;

export const API = {
  baseUrl: BASE,
  auth: `${BASE}/api/auth`,
  workspaces: `${BASE}/api/workspaces`,
  documents: `${BASE}/api/documents`,
  search: `${BASE}/api/search`,
  decision: `${BASE}/api/decision`,
  audit: `${BASE}/api/audit/events`,
  ingestion: `${BASE}/api/document-ingestion-jobs`,
  providers: `${BASE}/api/providers`,
  ingestionPreview: `${BASE}/api/ingestion/preview-metadata`,
  corpus: {
    health: `${BASE}/admin/corpus-health`,
    inventory: `${BASE}/admin/corpus-inventory`,
    inventoryGenerate: `${BASE}/admin/corpus-inventory/generate`,
    releaseReport: `${BASE}/admin/corpus-release-report/generate`,
  },
  dev: {
    perf: `${BASE}/dev/perf`,
    knowledge: `${BASE}/dev/knowledge`,
  },
  upload: `${BASE}/documents/upload`,
  batchUpload: `${BASE}/documents/batch`,
  batchImport: `${BASE}/api/documents/batch-import`,
} as const;
