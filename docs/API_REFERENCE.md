# Municipal Decision Assistant — API Reference

Version 1.0. Base URL: `http://localhost:8080`. All request/response bodies are JSON. Authentication via Bearer JWT token (except auth endpoints).

---

## Authentication

### POST /api/auth/register
Register a new user account.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Request | `RegisterRequest` | | |
| `email` | string | Yes | Valid email, max 320 chars |
| `password` | string | Yes | 3-128 chars |
| `displayName` | string | Yes | Max 255 chars |
| `roles` | string[] | No | Defaults to `["USER"]`. Cannot self-assign ADMIN. |

Response: `201 Created` — `AuthResponse` with `accessToken`, `refreshToken`, `tokenType`, `userId`, `email`, `roles`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`.

### POST /api/auth/login
Authenticate and receive JWT tokens. **Rate limit: 5/min/IP.**

Response: `200 OK` — `AuthResponse`. `401` — invalid credentials.

### POST /api/auth/refresh
Refresh an expired access token. Token rotation: old token is revoked.

Response: `200 OK` — `AuthResponse` with new token pair. `401` — invalid/revoked/expired refresh token.

### POST /api/auth/logout
Invalidate a refresh token session. Idempotent.

Response: `204 No Content`.

### GET /api/auth/me
Get current authenticated user. Requires: Bearer token.

Response: `200 OK` — `CurrentUserResponse` (`id`, `email`, `displayName`, `roles`). `401` — missing/invalid token.

---

## Documents

### POST /api/documents/upload
Upload a document file. **Rate limit: 20/h/user.**

| Field | Type | Required |
|-------|------|----------|
| `file` | MultipartFile | Yes |
| `title` | string | No |
| `category` | string | No |
| `tags` | string | No |

Response: `201 Created` — `{id, title, type, status, fileName, sizeBytes, ingestionPending}`.

### GET /api/documents
List documents with pagination and filters.

| Parameter | Type | Default |
|-----------|------|---------|
| `page` | int | 0 |
| `size` | int | 20 |
| `status` | string | — (all) |
| `type` | string | — |
| `category` | string | — |
| `tag` | string | — |
| `dateFrom` | ISO date | — |
| `dateTo` | ISO date | — |

Response: `200 OK` — `DocumentPageResponse` with `documents[]`, `totalElements`, `totalPages`.

### GET /api/documents/{documentId}
Get a single document. Response: `200` — `DocumentResponse`. `404` — not found.

### PATCH /api/documents/{documentId}/metadata
Update document metadata. Body: `UpdateDocumentMetadataRequest` (`title`, `type`, `category`, `tags`, `visibility`).

### POST /api/documents/{documentId}/versions
Add a new version to an existing document. Body: `AddDocumentVersionRequest`.

### POST /api/documents/{documentId}/archive
Archive a document. Response: `204`.

### DELETE /api/documents/{documentId}
Soft-delete a document. Response: `204`.

### POST /api/documents/{documentId}/reindex
Trigger reindexing of a document's chunks. Response: `200`.

### GET /api/documents/{documentId}/content
Get document content with chunk positions. Response: `200` — `DocumentContentResponse`.

### DELETE /api/documents/{documentId}/purge
Hard-delete a document and its index entries. Response: `204`.

### POST /api/documents/batch-import
Import documents from a directory tree. Parameters: `sourceDir` (required), `tags` (optional, comma-separated). Response: `200` — `BatchResult` with counts and per-file statuses.

### POST /api/documents/manifest-import
Import documents from a MANIFEST.yaml file. Parameters: `manifestPath` (default: `knowledge/MANIFEST.yaml`), `corpusBaseDir` (default: `knowledge`). Response: `200` — `ManifestBatchResult` with per-document status and error list.

---

## Search

### POST /api/search
Execute a hybrid (keyword + vector) search query.

| Field | Type | Required |
|-------|------|----------|
| `query` | string | Yes |
| `documentType` | string | No |
| `domain` | string | No |
| `page` | int | No (default 0) |
| `size` | int | No (default 10) |

Response: `200 OK` — `SearchResultPageResponse` with `results[]`, `totalElements`, `totalPages`. Each result has `documentId`, `title`, `excerpt`, `score`, `documentType`, `domain`, `citations[]`, `highlights[]`.

---

## Decision Engine

### POST /api/decision/{caseId}/analyze
Submit a question for AI analysis. **Rate limit: 10/min/user.**

| Field | Type | Required |
|-------|------|----------|
| `question` | string | No (defaults to threshold overview) |
| `model` | string | No (default: `"default"`) |

Response: `200 OK` — `DecisionResponse` (`caseId`, `question`, `strategy`, `decision`, `answerText`, `confidence`, `debug`).

Strategies: `RULE_ENGINE` (deterministic procurement/salary/travel lookup) or `HYBRID_RETRIEVAL` (full evidence-based reasoning).

### GET /api/decision/{caseId}
Get decision status. Response: `200` — `{caseId, status: "ready", message}`.

### POST /api/decision/{caseId}/draft
Generate a draft document. Body: `DecisionRequest`.

Response: `200` — `{id, title, version, content, createdAt}`.

### GET /api/decision/{caseId}/stream
SSE streaming endpoint for progressive decision display. Parameter: `question`. Events: `routing`, `decision`, `complete`.

---

## Workspaces / Cases

### POST /api/workspaces
Create a new workspace.

| Field | Type | Required |
|-------|------|----------|
| `name` | string | No (auto-generated if blank) |
| `description` | string | No |
| `workspaceType` | string | No |
| `createdBy` | string | No |

Response: `200` — `WorkspaceDto` (id, name, description, status, phase, documents, timelineEvents).

### GET /api/workspaces
List workspaces. Optional: `?ownerId=<id>`. Response: `200` — `WorkspaceDto[]`.

### GET /api/workspaces/{workspaceId}
Get single workspace. Response: `200` — `WorkspaceDto`. `404` — not found.

### POST /api/workspaces/{workspaceId}/advance
Advance to next phase. Response: `200` — `WorkspaceDto` with new phase.

### PUT /api/workspaces/{workspaceId}/status
Update status. Body: `{"status": "ACTIVE"}`. Valid: `DRAFT`, `ACTIVE`, `CLOSED`, `ARCHIVED`.

### GET /api/workspaces/{workspaceId}/documents
List linked documents. Response: `200` — `WorkspaceDocumentDto[]`.

### POST /api/workspaces/{workspaceId}/documents
Attach document. Body: `AttachDocumentCommand`.

### GET /api/workspaces/{workspaceId}/timeline
Get timeline events. Response: `200` — `TimelineEventDto[]`.

### POST /api/workspaces/{workspaceId}/timeline
Add timeline event. Body: `{eventDate, title, description, eventType}`.

### GET /api/workspaces/{workspaceId}/checklist
Get checklist items. Response: `200` — `[{id, title, description, checked}]`.

### PUT /api/workspaces/{workspaceId}/checklist
Update checklist. Body: array of checklist item objects.

### GET /api/workspaces/{workspaceId}/notes
Get internal notes. Response: `200` — `[{id, author, time, content}]`.

### POST /api/workspaces/{workspaceId}/notes
Add internal note. Body: `{author, content}`.

### GET /api/workspaces/{workspaceId}/steps
Get completed workflow steps. Response: `200` — `[{id, phase, stepName, status, completedAt}]`.

---

## Admin

### POST /api/admin/knowledge/reload
Reload structured knowledge tables at runtime. Response: `200` — `{status, salaryEntries, travelEntries, thresholdEntries, totalTables}`.

### GET /api/admin/knowledge/status
Get knowledge table status. Response: `200`.

### GET /api/admin/corpus/health
Corpus health report. Response: `200` — `{summary, warnings, categories[], documents[]}`.

### GET /api/admin/corpus/manifest-summary
Manifest statistics. Response: `200` — `{totalEntries, byDomain, byPriority}`.

---

## Error Responses

All errors follow the same format:

```json
{
  "timestamp": "2026-07-18T20:00:00Z",
  "status": 400,
  "error": "Validierungsfehler",
  "message": "Die Eingabe enthält ungültige Werte.",
  "fieldErrors": {
    "email": "darf nicht leer sein",
    "password": "darf nicht leer sein"
  }
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error (German messages) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 413 | Upload too large |
| 422 | Validation error (field-level) |
| 429 | Rate limit exceeded (Retry-After header) |
| 500 | Internal server error |

---

## Rate Limits

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `/api/auth/login` | 5 | 1 min | Per IP |
| `/api/decision/*/analyze` | 10 | 1 min | Per user |
| `/api/documents/upload` | 20 | 1 hour | Per user |
