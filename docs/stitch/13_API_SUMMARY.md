# API Summary — UI Actions Only

This document describes every user-visible action and the API endpoint that powers it. No DTOs. No Java. Only what the UI needs to know.

## Authentication

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Login | POST | `/api/auth/login` | email, password | accessToken, refreshToken, user |
| Register | POST | `/api/auth/register` | email, password, displayName | accessToken, refreshToken, user |
| Refresh session | POST | `/api/auth/refresh` | refreshToken | new accessToken, new refreshToken |
| Logout | POST | `/api/auth/logout` | refreshToken | 204 No Content |
| Get current user | GET | `/api/auth/me` | — | userId, email, displayName, roles |

## AI & Decisions

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Ask AI question | POST | `/decision` | question (form), workspace (form) | HTML page (today) — needs JSON endpoint |
| Get available AI models | GET | `/api/providers/models` | — | model list, default model |
| Check AI provider status | GET | `/api/providers/status` | — | embedding status, vector search status, readiness |

Note: The `/decision` POST endpoint currently returns an HTML page (Thymeleaf). A JSON version (`POST /api/decision`) is needed for the SPA.

## Search

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Search documents | POST | `/api/search` | query, mode (HYBRID), page, size | results with scores, citations, strategy |
| Get document chunks | GET | `/api/search/chunks` | documentId | chunk list with text, offsets, embedding refs |

## Documents

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| List documents | GET | `/api/documents` | status, type, category, tag, page, size | paginated document list |
| Get document detail | GET | `/api/documents/{id}` | — | document with metadata, versions |
| Get document content | GET | `/api/documents/{id}/content` | — | full extracted text, chunk anchors |
| Create document record | POST | `/api/documents` | title, type, fileName, contentType, size, category, tags | created document |
| Update metadata | PATCH | `/api/documents/{id}/metadata` | any subset of metadata fields | updated document |
| Add version | POST | `/api/documents/{id}/versions` | new file data | updated document with new version |
| Archive document | POST | `/api/documents/{id}/archive` | — | archived document |
| Delete document (soft) | DELETE | `/api/documents/{id}` | — | document with status=DELETED |
| Reindex document | POST | `/api/documents/{id}/reindex` | — | confirmation or 422 if no infrastructure |
| Purge document (hard) | DELETE | `/api/documents/{id}/purge` | — | purge confirmation |
| Batch import | POST | `/api/documents/batch-import` | sourceDir (path), tags | batchId, imported count, errors |

## Ingestion Jobs

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Start ingestion | POST | `/api/document-ingestion-jobs/documents/{id}` | — | job response |
| List ingestion jobs | GET | `/api/document-ingestion-jobs` | documentId, status, page, size | paginated job list |
| Start job execution | POST | `/api/document-ingestion-jobs/{jobId}/start` | — | updated job |
| Mark job complete | POST | `/api/document-ingestion-jobs/{jobId}/complete` | — | updated job |
| Mark job failed | POST | `/api/document-ingestion-jobs/{jobId}/fail` | reason | updated job |

## Workspaces (Administration)

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| List workspaces | GET | `/api/workspaces` | ownerId (optional) | workspace list |
| Create workspace | POST | `/api/workspaces` | name, description, domain | created workspace |
| Get workspace detail | GET | `/api/workspaces/{id}` | — | workspace with documents, timeline |
| Advance phase | POST | `/api/workspaces/{id}/advance` | — | workspace with updated phase |
| Attach document | POST | `/api/workspaces/{id}/documents` | documentId | attached document |
| List workspace documents | GET | `/api/workspaces/{id}/documents` | — | workspace document list |
| Get timeline | GET | `/api/workspaces/{id}/timeline` | — | timeline event list |
| Add timeline event | POST | `/api/workspaces/{id}/timeline` | event data | created event |
| Get workflow steps | GET | `/api/workspaces/{id}/steps` | — | step list |

## Corpus Reports (Administration)

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Generate inventory | POST | `/admin/corpus-inventory/generate` | — | redirect to inventory page |
| Generate release report | POST | `/admin/corpus-release-report/generate` | — | redirect to health page |
| View inventory report | GET | `/admin/corpus-inventory/report` | — | markdown text |

## Audit (Administration)

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Search audit events | GET | `/api/audit/events` | eventType, actorId, correlationId, from, to, page, size | paginated audit events |

## File Upload (Page-Level)

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Upload document file | POST | `/documents/upload` | file (multipart), title, category, type, tags, domain, date | redirect to document view |
| Batch upload files | POST | `/documents/batch` | files (multipart list) | JSON batch result |
| Preview metadata | POST | `/api/ingestion/preview-metadata` | file (multipart) | extracted metadata or 422 |

## Corpus Health (Administration — needs JSON)

| UI Action | Method | Endpoint | Status |
|---|---|---|---|
| View corpus health | GET | `/admin/corpus-health` | Returns HTML today — needs JSON endpoint |
| View corpus inventory | GET | `/admin/corpus-inventory` | Returns HTML today — needs JSON endpoint |

## Knowledge Dashboard (Developer)

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| View salary table | GET | `/dev/knowledge/salary` | — | salary entries |
| View travel table | GET | `/dev/knowledge/travel` | — | travel allowance entries |
| View threshold table | GET | `/dev/knowledge/thresholds` | — | procurement threshold entries |
| Knowledge stats | GET | `/dev/knowledge/stats` | — | table statistics |

## Performance (Developer)

| UI Action | Method | Endpoint | Input | Output |
|---|---|---|---|---|
| Performance dashboard | GET | `/dev/perf` | — | HTML page |
| Performance config | GET | `/dev/perf/config` | — | configuration JSON |
| Performance profile | GET | `/dev/perf/profile` | — | profiling data |

---

## Missing JSON APIs (for SPA)

These endpoints currently return HTML and need JSON equivalents:

| Priority | Needed Endpoint | Current State | What It Returns |
|---|---|---|---|
| **P1** | `POST /api/decision` | `/decision` returns HTML | DecisionResponse: answer, confidence, sources, execution trace |
| **P1** | `GET /api/corpus/health` | `/admin/corpus-health` returns HTML | CorpusHealthResponse: summary stats, warnings, document table |
| **P1** | `GET /api/corpus/inventory` | `/admin/corpus-inventory` returns HTML | CorpusInventoryResponse: manifest entries, by-domain, by-priority |
| P2 | `GET /api/home` | `/home` returns HTML | Can be composed from existing APIs on client side |
| P3 | `POST /api/benchmark/run` | CLI only | Benchmark result with progress via SSE |
