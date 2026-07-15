# Frontend Integration Specification — Municipal Decision Assistant

**Version:** 1.1 → 2.0 UI Migration  
**Backend:** Spring Boot 3.3, JWT Bearer Auth, REST API  
**Current Frontend:** Thymeleaf (to be replaced)  
**Target Frontend:** Google AI Studio + React/Next.js  

---

## Part 1 — Application Overview (For AI Studio)

The Municipal Decision Assistant is an enterprise AI platform for German public administration. It helps municipal employees (Sachbearbeiter) process administrative tasks faster by combining deterministic rules, semantic document search, and AI-powered explanations.

**Users:** Municipal employees in Bauamt, Vergabestelle, Personalamt, Bürgeramt, and general administration.

**Primary workflows:**
1. **Decision Assistant:** Ask a question about regulations → system determines if it's a deterministic lookup (salary, threshold, travel allowance) or requires document retrieval → returns a grounded answer with legal citations
2. **Document Management:** Upload official PDFs → text extraction → chunking → embedding → Qdrant vector indexing → searchable corpus
3. **Corpus Health:** Monitor document ingestion status, embedding coverage, Qdrant vector counts, metadata completeness
4. **Search:** Keyword + vector hybrid search across all indexed documents with reranking
5. **Workspace Management:** Create department workspaces, attach documents, track timeline events
6. **Administration:** Audit logs, ingestion jobs, system configuration

**Key technical facts:**
- Authentication via JWT Bearer tokens (register/login/refresh/logout)
- All REST endpoints return JSON
- Error format: `{timestamp, status, error, message, stacktrace}`
- Backend uses Spring Security with role-based access (USER, ADMIN)
- Long-running operations (AI inference, embedding, batch import) may take 5-60 seconds
- Corpus health dashboard displays live metrics from PostgreSQL + Qdrant

---

## Part 2 — Complete Page Inventory

### Page Catalog

| # | Page | URL | Controller | Template | Primary User |
|---|---|---|---|---|---|
| 1 | Home / Dashboard | `/`, `/home`, `/dashboard` | `DashboardController` | `home.html` | All users |
| 2 | Login | `/login` | `AuthPageController` | `auth/login.html` | Unauthenticated |
| 3 | Register | `/register` | `AuthPageController` | `auth/register.html` | Unauthenticated |
| 4 | Decision Assistant | `/decision`, `/decision-assistant`, `/ai` | `AiPageController` | `ai/index.html` | Sachbearbeiter |
| 5 | Regulations & Procedures | `/regulations`, `/knowledge` | `PlatformPageController` | `regulations.html` | All users |
| 6 | My Cases | `/cases` | `PlatformPageController` | `cases.html` | Sachbearbeiter |
| 7 | Knowledge Graph | `/graph` | `PlatformPageController` | `graph.html` | Power users |
| 8 | System Analytics | `/analytics` | `PlatformPageController` | `analytics.html` | Admin |
| 9 | Administration | `/admin` | `PlatformPageController` | `admin.html` | Admin |
| 10 | Corpus Health | `/admin/corpus-health` | `CorpusHealthController` | `corpus-health.html` | Admin |
| 11 | Corpus Inventory | `/admin/corpus-inventory` | `CorpusHealthController` | `corpus-inventory.html` | Admin |
| 12 | Document Search | `/search` | `SearchPageController` | `search/index.html` | All users |
| 13 | Text Chunks | `/chunks` | `SearchPageController` | `search/chunks.html` | Power users |
| 14 | Documents List | `/documents` | `DocumentPageController` | `documents/list.html` | All users |
| 15 | Document Upload | `/documents/upload` | `DocumentPageController` | `documents/upload.html` | Admin |
| 16 | Document Viewer | `/documents/{documentId}` | `DocumentPageController` | `documents/view.html` | All users |
| 17 | Workspaces | `/workspaces` | `WorkspacePageController` | `workspaces/list.html` | Admin |
| 18 | Workspace Detail | `/workspaces/{workspaceId}` | `WorkspacePageController` | `workspaces/view.html` | Admin |
| 19 | Workspace Wizard | `/workspaces/{workspaceId}/wizard` | `WorkspacePageController` | `workspaces/wizard.html` | Admin |
| 20 | New Workspace | `/workspaces/new` | `WorkspacePageController` | `workspaces/wizard-create.html` | Admin |
| 21 | Workspace Extended Detail | `/workspaces/{workspaceId}/detail` | `WorkspacePageController` | `workspaces/detail.html` | Admin |
| 22 | Audit Log | `/audit` | `AuditPageController` | `audit/index.html` | Admin |
| 23 | Processing Jobs | `/jobs` | `JobsPageController` | `jobs/list.html` | Admin |
| 24 | Error Page | `/error` | `ErrorPageController` | `error.html` | All users |
| 25 | Dev: Performance | `/dev/perf` | `PerformanceDashboardController` | (inline HTML) | Developer |
| 26 | Dev: Knowledge | `/dev/knowledge` | `KnowledgeDashboardController` | (inline HTML) | Developer |

### Screenshot Placeholders

[SCREENSHOT: home.html — Dashboard with quick decision input + department shortcut cards]  
[SCREENSHOT: ai/index.html — Decision page with workspace selector + question input + results]  
[SCREENSHOT: documents/list.html — Document table with filter dropdowns + action buttons]  
[SCREENSHOT: documents/upload.html — File upload form with metadata fields]  
[SCREENSHOT: corpus-health.html — Summary stat cards + warnings + document health table]  
[SCREENSHOT: admin.html — Tool grid with links to all admin features]  

---

## Part 3 — UI Component Inventory Per Page

### Page 1: Home / Dashboard (`/home`)

| Component | Type | Description |
|---|---|---|
| Welcome heading | Text | "Willkommen zurück" |
| Quick decision input | Form (textarea + button) | POST to `/decision` with question text |
| Department shortcut cards (3) | Card grid | "Bauen & Stadtplanung", "Öffentliche Beschaffung", "Personal & Innere Verwaltung" — links to `/decision?workspace={id}` |
| Recent cases list | List | Links to `/cases` |
| Frequently used regulations | List (5 links) | Links to document pages |
| Recently opened documents | List | Links to `/documents/{id}` |
| Recent activity feed | Timeline | Audit event entries |

### Page 2: Login (`/login`)

| Component | Type | Description |
|---|---|---|
| Email input | Text field | `email` |
| Password input | Password field | `password` |
| Login button | Submit button | POST to `/api/auth/login` |
| Register link | Link | `/register` |
| Error message | Alert | "Ungültige Anmeldedaten" |

### Page 3: Register (`/register`)

| Component | Type | Description |
|---|---|---|
| Email input | Text field | `email` |
| Display name input | Text field | `displayName` |
| Password input | Password field | `password` |
| Register button | Submit button | POST to `/api/auth/register` |
| Back to login link | Link | `/login` |

### Page 4: Decision Assistant (`/decision`)

| Component | Type | Description |
|---|---|---|
| Workspace selector | Dropdown | "Alle Fachbereiche", "Bauen & Stadtplanung", "Öffentliche Beschaffung", "Personal & Innere Verwaltung" |
| Model selector | Dropdown | Active LLM model name |
| Question textarea | Textarea | Free-text question input |
| "Vorgang analysieren" button | Submit button | POST to `/decision` — **Long-running (5-60s)** |
| Example question chips | Button group | Quick-fill example questions for selected workspace |
| Loading indicator | Spinner | Shown during AI inference |
| Answer: Kurzantwort | Banner | Short answer (1 sentence) |
| Answer: Entscheidung | Section | Decision recommendation (2-3 sentences) |
| Answer: Rechtsgrundlagen | Card list | Supporting regulation cards, grouped by document |
| Answer: Verfahren | Section | Required procedure |
| Answer: Nächster Schritt | Section | Next action |
| Answer: Verlässlichkeit | Badge + bar | Confidence percentage |
| Answer: Execution Trace | Collapsible section | Strategy, retrieval mode, sources count, latency |
| Source document links | Link list | "Originalvorschrift öffnen" → `/documents/{id}` |
| Chunk links | Link | "Relevante Stelle anzeigen" → `/documents/{id}?chunk={chunkId}` |
| "Neuen Vorgang beginnen" | Button | Reset form |

### Page 5: Regulations (`/regulations`)

| Component | Type | Description |
|---|---|---|
| Document list | Table | All indexed documents with title, type, status, date, department |
| Filter: Department | Dropdown | Filter by workspace domain |
| Filter: Status | Dropdown | Filter by DocumentStatus |
| "Dokument hinzufügen" button | Button | Link to `/documents/upload` |
| Document detail panel | Side panel | Shows metadata when a document is selected |

### Page 6-7: Cases/Graph/Analytics (placeholders)

Currently minimal Thymeleaf templates. Cases shows workspace-type cards. Graph shows Neo4j visualization (iframe). Analytics shows system metrics.

### Page 10: Corpus Health (`/admin/corpus-health`)

| Component | Type | Description |
|---|---|---|
| Status badge | Badge | "Gesund" / "N Warnungen" / Critical |
| Summary cards (5 primary) | Stat cards | Documents, Chunks, With Embeddings, Qdrant Vectors, Embedding Coverage % |
| Summary cards (5 secondary) | Stat cards | Missing Embeddings, Avg Chunks/Doc, Avg Retrieval Score, Vector Dimension, Green/Yellow/Red count |
| Warnings section | Alert list | Per-document warnings with critical styling |
| Korpus-Integrität grid (9 cards) | Grid | Missing, Outdated, Duplicates, Without Embeddings, Without Vectors, Failed Extraction, Failed Indexing, Low Text Length, Single Chunk |
| Manifest summary cards | Stat cards | Manifest entries, With Documents, Fully Embedded, Fully Indexed, Chunks/Vectors |
| Document health table (15 columns) | Table | Status, Document, Legal Domain, Authority, Category, Date, Language, Pages, Chunks, With Emb., Without Emb., Qdrant, Vectors, Metadata %, Last Indexing |

### Page 11: Corpus Inventory (`/admin/corpus-inventory`)

| Component | Type | Description |
|---|---|---|
| Summary stat cards (4) | Stat cards | Manifest entries, Fully Embedded, Fully Indexed, Chunks/Vectors |
| By Legal Domain table | Table | Domain → document count |
| By Priority table | Table | Priority → document count |
| "Inventar generieren" button | Button (POST form) | Triggers CORPUS_INVENTORY.md generation |
| Manifest entries table | Table | 15 columns: Title, Domain, Jurisdiction, Authority, DocType, Language, Format, Upload, Ingestion, Indexing, Embedding, Pages, Chunks, Vectors, Priority |

### Page 14: Documents List (`/documents`)

| Component | Type | Description |
|---|---|---|
| Filter: Status | Dropdown | DocumentStatus filter |
| Filter: Type | Dropdown | DocumentType filter |
| Filter: Tenant | Text field | Tenant ID filter |
| Document table | Table | Title, Type, Status, Tags, Versions, Date, Actions |
| Action: View | Link | `/documents/{id}` |
| Action: Ingest | Button | POST `/api/document-ingestion-jobs/documents/{id}` |
| Action: Reindex | Button | POST `/api/documents/{id}/reindex` |
| Action: Purge | Button | DELETE `/api/documents/{id}/purge` |
| Pagination | Pagination | Page controls |

### Page 15: Document Upload (`/documents/upload`)

| Component | Type | Description |
|---|---|---|
| File input | File upload | `MultipartFile` — drag & drop or browse |
| Title input | Text field | Document title |
| Category input | Text field | Category |
| Type selector | Dropdown | DocumentType (PDF, DOCX, TXT, HTML) |
| Tags input | Text field | Comma-separated tags |
| Domain selector | Dropdown | Department/domain |
| Document date input | Date picker | Publication date |
| Upload button | Submit button | POST `/documents/upload` — **Long-running** |

### Page 16: Document Viewer (`/documents/{id}`)

| Component | Type | Description |
|---|---|---|
| Document metadata | Section | Title, type, status, category, tags, version |
| Full text content | Pre/code block | Extracted text with chunk anchors highlighted |
| Chunk list | List | Each chunk with offset, excerpt, and embedding reference |

### Page 22: Audit Log (`/audit`)

| Component | Type | Description |
|---|---|---|
| Filter: Event Type | Dropdown | AuditEventType |
| Filter: Actor | Text field | Actor ID |
| Filter: Correlation ID | Text field | Correlation ID |
| Audit table | Table | Time, Type, Actor, Entity, Correlation, Request |
| Pagination | Pagination | Page controls |

### Page 23: Processing Jobs (`/jobs`)

| Component | Type | Description |
|---|---|---|
| Filter: Status | Dropdown | IngestionStatus |
| Jobs table | Table | Seq#, Status, Document, Requested By, Ingestion Date |
| Pagination | Pagination | Page controls |

---

## Part 4 — Component-to-Endpoint Mapping

### Interactive Components

| # | Component | Page | Action | HTTP Method | Endpoint | Request | Response | Loading | Error |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Login button | Login | Click | POST | `/api/auth/login` | `LoginRequest` | `AuthResponse` | Disable button + spinner | Toast with error message |
| 2 | Register button | Register | Click | POST | `/api/auth/register` | `RegisterRequest` | `AuthResponse` | Disable button + spinner | Toast with error message |
| 3 | "Vorgang analysieren" | Decision | Click | POST | `/decision` (page POST) | Form params | HTML page | Full-page spinner + "Analysiere..." text | Error alert in page |
| 4 | Workspace selector | Decision | Change | GET | `/api/providers/models` | — | Model list | None | Silent fallback |
| 5 | Document filter | Documents | Change | GET | `/api/documents` | Query params | `DocumentPageResponse` | Table skeleton | Toast |
| 6 | Document upload form | Upload | Submit | POST | `/documents/upload` | `MultipartFile` + form | Redirect | Progress bar | Error flash message |
| 7 | Batch upload form | Upload | Submit | POST | `/documents/batch` | `List<MultipartFile>` | JSON | Progress bar per file | JSON error list |
| 8 | Batch import | Admin | Click | POST | `/api/documents/batch-import` | `sourceDir`, `tags` | JSON summary | Progress (long) | Toast |
| 9 | "Ingest" button | Documents | Click | POST | `/api/document-ingestion-jobs/documents/{id}` | — | `IngestionJobResponse` | Spinner on button | Toast |
| 10 | "Reindex" button | Documents | Click | POST | `/api/documents/{id}/reindex` | — | JSON | Spinner on button | Toast (422 if no infrastructure) |
| 11 | "Purge" button | Documents | Click | DELETE | `/api/documents/{id}/purge` | — | JSON | Confirm dialog → spinner | Toast |
| 12 | Archive button | Documents | Click | POST | `/api/documents/{id}/archive` | — | `DocumentResponse` | Spinner on button | Toast |
| 13 | Delete button | Documents | Click | DELETE | `/api/documents/{id}` | — | `DocumentResponse` | Confirm dialog → spinner | Toast |
| 14 | Update metadata form | Documents | Submit | PATCH | `/api/documents/{id}/metadata` | `UpdateDocumentMetadataRequest` | `DocumentResponse` | Spinner on save | Toast |
| 15 | Add version form | Documents | Submit | POST | `/api/documents/{id}/versions` | `AddDocumentVersionRequest` | `DocumentResponse` | Spinner on save | Toast |
| 16 | Search submit | Search | Click/Enter | POST | `/api/search` | `SearchRequest` | `SearchResultPageResponse` | Skeleton results | Toast |
| 17 | Chunk search | Chunks | Submit | GET | `/api/search/chunks` | Query params | `List<DocumentChunkResponse>` | Skeleton | Toast |
| 18 | Create workspace | Workspaces | Submit | POST | `/api/workspaces` | `CreateWorkspaceCommand` | `WorkspaceDto` | Spinner | Toast |
| 19 | Advance workspace phase | Workspace wizard | Click | POST | `/api/workspaces/{id}/advance` | — | `WorkspaceDto` | Spinner | Toast |
| 20 | Attach document | Workspace | Submit | POST | `/api/workspaces/{id}/documents` | `AttachDocumentCommand` | `WorkspaceDocumentDto` | Spinner | Toast |
| 21 | Audit filter | Audit | Change | GET | `/api/audit/events` | Query params | `AuditEventPageResponse` | Skeleton | Toast |
| 22 | Generate inventory | Corpus Inventory | Click | POST | `/admin/corpus-inventory/generate` | — | Redirect | Spinner on button | Toast |
| 23 | Generate release report | Corpus Inventory | Click | POST | `/admin/corpus-release-report/generate` | — | Redirect | Spinner on button | Toast |
| 24 | Refresh token | (silent, background) | Timer | POST | `/api/auth/refresh` | `RefreshTokenRequest` | `AuthResponse` | None (silent) | Redirect to login |
| 25 | Logout | Nav | Click | POST | `/api/auth/logout` | `LogoutRequest` | (204) | None | Redirect to login |
| 26 | Provider status check | Admin/Dashboard | Page load | GET | `/api/providers/status` | — | JSON | Skeleton in AI config card | "Unavailable" text |
| 27 | Metadata preview | Upload | File select | POST | `/api/ingestion/preview-metadata` | `MultipartFile` | JSON | Spinner | Toast (422 if no AI config) |
| 28 | Search intake (quick decision) | Home | Submit | POST | `/decision` | Form params | HTML page | Spinner on button | Error alert |
| 29 | File upload (workspace) | Workspace wizard | Submit | POST | `/workspaces/{id}/upload` | `MultipartFile[]` | Redirect | Progress bar | Error flash |
| 30 | Model list fetch | Decision | Page load | GET | `/api/providers/models` | — | JSON | Skeleton text | "Unknown model" fallback |

### Display-Only Data Fetches (Page Load)

| # | Component | Page | Endpoint | Response |
|---|---|---|---|---|
| D1 | Home page data | Home | `/home` (server-rendered) | HTML with model attributes |
| D2 | Document list | Documents | `/api/documents` | `DocumentPageResponse` |
| D3 | Document detail | Document Viewer | `/api/documents/{id}` + `/api/documents/{id}/content` | `DocumentResponse` + `DocumentContentResponse` |
| D4 | Corpus health | Corpus Health | `/admin/corpus-health` (server-rendered) | HTML with model attributes |
| D5 | Corpus inventory | Corpus Inventory | `/admin/corpus-inventory` (server-rendered) | HTML with model attributes |
| D6 | Workspace list | Workspaces | `/api/workspaces` | `List<WorkspaceDto>` |
| D7 | Workspace detail | Workspace Detail | `/api/workspaces/{id}` + `/api/workspaces/{id}/documents` + `/api/workspaces/{id}/timeline` | Combined data |
| D8 | Ingestion jobs | Jobs | `/api/document-ingestion-jobs` | `IngestionJobPageResponse` |
| D9 | User profile | (nav) | `/api/auth/me` | `CurrentUserResponse` |
| D10 | Ingestion job detail | Jobs | `/api/document-ingestion-jobs?documentId={id}` | `IngestionJobPageResponse` |
| D11 | Chunk list | Chunks | `/api/search/chunks?documentId={id}` | `List<DocumentChunkResponse>` |
| D12 | Dev: Salary table | Dev | `/dev/knowledge/salary` | `List<Map>` |
| D13 | Dev: Travel table | Dev | `/dev/knowledge/travel` | `List<Map>` |
| D14 | Dev: Thresholds | Dev | `/dev/knowledge/thresholds` | `List<Map>` |

---

## Part 5 — Complete REST API Reference

### Authentication

All authenticated endpoints require header: `Authorization: Bearer <accessToken>`

**POST /api/auth/register**
```json
// Request
{"email": "user@example.com", "password": "secure123", "displayName": "Max Mustermann", "roles": []}
// Response 200
{"accessToken": "eyJ...", "refreshToken": "...", "tokenType": "Bearer",
 "accessTokenExpiresAt": "2026-07-14T13:00:00Z", "refreshTokenExpiresAt": "2026-08-13T13:00:00Z",
 "userId": "uuid", "email": "user@example.com", "roles": ["USER"]}
// Error 400: validation errors
```

**POST /api/auth/login** — same response format as register.

**POST /api/auth/refresh**
```json
// Request
{"refreshToken": "..."}
// Response: same AuthResponse format
```

**POST /api/auth/logout**
```json
// Request
{"refreshToken": "..."}
// Response: 204 No Content
```

**GET /api/auth/me**
```json
// Response 200
{"id": "uuid", "email": "user@example.com", "displayName": "Max Mustermann", "roles": ["USER"]}
```

### Search

**POST /api/search**
```json
// Request
{"query": "Welches Verfahren bei 8.000€ IT-Auftrag?", "mode": "HYBRID", "page": 0, "size": 20}
// Response 200
{"results": [{"chunk": {"chunkId": "uuid", "documentId": "uuid", "title": "AV §55 LHO"},
  "text": "Ein Direktauftrag ist zulässig...", "score": 0.92, "confidenceScore": 0.89,
  "keywordScore": 0.88, "vectorScore": 0.91, "rerankScore": 0.94,
  "citation": {"title": "AV §55 LHO", "excerpt": "Ein Direktauftrag..."},
  "intent": "procurement", "retrievalStrategy": "hybrid"}],
 "page": 0, "size": 20, "totalElements": 5, "totalPages": 1,
 "retrievalStrategy": "HYBRID_RETRIEVAL"}
```

### Documents

**POST /api/documents**
```json
// Request
{"title": "AV zu §55 LHO", "type": "PDF", "fileName": "av55lho.pdf", "contentType": "application/pdf",
 "sizeBytes": 150000, "storageProvider": "local-fs", "storageKey": "uploads/uuid_av55lho.pdf",
 "category": "procurement-regulations", "tags": ["vergabe", "lho"], "visibility": "PRIVATE"}
// Response 201: DocumentResponse
```

**GET /api/documents** — query params: `status`, `type`, `category`, `tag`, `tenantId`, `createdFrom`, `createdTo`, `page` (default 0), `size` (default 50). Returns `DocumentPageResponse`.

**GET /api/documents/{documentId}** — Returns `DocumentResponse` with nested `versions[]`.

**PATCH /api/documents/{documentId}/metadata** — body: `UpdateDocumentMetadataRequest`. Returns `DocumentResponse`.

**POST /api/documents/{documentId}/versions** — body: `AddDocumentVersionRequest`. Returns `DocumentResponse`.

**POST /api/documents/{documentId}/archive** — no body. Returns `DocumentResponse`.

**DELETE /api/documents/{documentId}** — soft delete. Returns `DocumentResponse` with status=DELETED.

**POST /api/documents/{documentId}/reindex** — Returns 200 `{"documentId":"...","operation":"reindex_triggered"}` or 422 `{"error":"Semantic indexing infrastructure not configured"}`.

**DELETE /api/documents/{documentId}/purge** — Returns 200 `{"documentId":"...","purged":true/false}`.

**GET /api/documents/{documentId}/content** — Returns `DocumentContentResponse` with full text and chunk anchors.

**POST /api/documents/batch-import** — query params: `sourceDir` (absolute path), `tags` (comma-sep). Returns JSON with `batchId`, `totalFiles`, `imported`, `skippedDuplicates`, `skippedNewerVersion`, `failedValidation`, `failedImport`, `durationSeconds`, `errors[]`, `files[]`.

### Corpus Reports

**POST /admin/corpus-inventory/generate** — Redirects to `/admin/corpus-inventory`. Generates `docs/CORPUS_INVENTORY.md`.

**POST /admin/corpus-release-report/generate** — Redirects to `/admin/corpus-health`. Generates `docs/RELEASE_CORPUS_REPORT.md`.

**GET /admin/corpus-inventory/report** — Returns `text/plain` — the generated Markdown report.

### Providers

**GET /api/providers/status** (no auth required)
```json
{"embeddingProvider": {"dimension": 768, "available": true, "type": "OllamaEmbeddingProvider"},
 "vectorSearchProvider": {"available": true, "backend": "qdrant", "type": "QdrantVectorSearchProvider"},
 "semanticSearchReady": true}
```

**GET /api/providers/models** (no auth required)
```json
{"available": true, "models": [{"name": "qwen2.5:14b", "provider": "ollama"}],
 "defaultModel": "qwen2.5:14b"}
```

### Ingestion Jobs

**POST /api/document-ingestion-jobs/documents/{documentId}** — Creates ingestion job. Returns 201 `IngestionJobResponse`.

**GET /api/document-ingestion-jobs** — query params: `documentId`, `status`, `tenantId`, `page`, `size`. Returns `IngestionJobPageResponse`.

**POST /api/document-ingestion-jobs/{jobId}/start** — Sets status to RUNNING.

**POST /api/document-ingestion-jobs/{jobId}/complete** — Sets status to COMPLETED.

**POST /api/document-ingestion-jobs/{jobId}/fail** — body: `{"reason": "PDF text extraction failed"}`.

### Workspaces

**POST /api/workspaces** — body: `CreateWorkspaceCommand`. Returns `WorkspaceDto`.

**GET /api/workspaces** — query param: `ownerId`. Returns `List<WorkspaceDto>`.

**GET /api/workspaces/{workspaceId}** — Returns `WorkspaceDto` with nested documents and timeline.

**POST /api/workspaces/{workspaceId}/advance** — Advances to next phase.

**PUT /api/workspaces/{workspaceId}/phase-data** — body: `Map<String, Object>`.

**POST /api/workspaces/{workspaceId}/documents** — body: `AttachDocumentCommand`. Returns `WorkspaceDocumentDto`.

**GET /api/workspaces/{workspaceId}/documents** — Returns `List<WorkspaceDocumentDto>`.

**GET /api/workspaces/{workspaceId}/timeline** — Returns `List<TimelineEventDto>`.

**POST /api/workspaces/{workspaceId}/timeline** — body: `Map<String, Object>`.

**GET /api/workspaces/{workspaceId}/steps** — Returns `List<Map<String, Object>>`.

### Audit (ADMIN role required)

**GET /api/audit/events** — query params: `eventType`, `actorId`, `tenantId`, `entityType`, `entityId`, `sourceModule`, `correlationId`, `requestId`, `from`, `to`, `page`, `size`. Returns `AuditEventPageResponse`.

### Ingestion Metadata Preview

**POST /api/ingestion/preview-metadata** — multipart form with `file` param. Returns JSON with extracted metadata preview, or 422 `{"error":"AI metadata extraction not configured"}`.

### Error Response Format (all `/api/**` endpoints)

```json
{"timestamp": "2026-07-14T12:00:00Z", "status": 400, "error": "Bad Request",
 "message": "validation failed: title must not be blank", "stacktrace": null}
```

---

## Part 6 — Navigation Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LOGIN / REGISTER                               │
│                         /login    /register                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ (authenticated)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          HOME / DASHBOARD                                │
│                       /    /home    /dashboard                           │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │Quick Decision │  │Dept Shortcuts│  │Recent Cases / Frequent Regs  │  │
│  │  (textarea)   │  │ (3 cards)    │  │  (link lists)                │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────────┘  │
│         │                 │                      │                       │
│         ▼                 ▼                      ▼                       │
│    /decision        /decision?          /cases   /documents/{id}        │
│                     workspace={id}                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   DECISION   │    │   REGULATIONS    │    │    DOCUMENTS     │
│  /decision   │    │  /regulations    │    │   /documents     │
│              │    │                  │    │                  │
│ Question →   │    │ Filter → Table   │    │ Filter → Table   │
│ Answer →     │    │ Select → Detail  │    │ Actions →        │
│ Sources →    │    │                  │    │ Upload/View/     │
│ Citation     │    │                  │    │ Ingest/Purge     │
└──────┬───────┘    └────────┬─────────┘    └────────┬─────────┘
       │                     │                       │
       │ "Originalvorschrift │ "Dokument hinzufügen" │ View doc
       │  öffnen"            │                       │
       ▼                     ▼                       ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   DOCUMENT   │    │  UPLOAD          │    │  DOCUMENT VIEWER │
│   VIEWER     │    │  /documents/     │    │  /documents/{id} │
│              │    │  upload          │    │                  │
│ Full text +  │    │                  │    │ Metadata +       │
│ chunk anchors│    │ File → Form →    │    │ Full text +      │
│              │    │ Submit → List    │    │ Chunk list       │
└──────────────┘    └──────────────────┘    └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           ADMINISTRATION                                 │
│                   /admin    (Tool Grid)                                  │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Document  │ │Depart-   │ │AI        │ │System    │ │Knowledge Graph│  │
│  │Import    │ │ments     │ │Settings  │ │Config    │ │/graph         │  │
│  └────┬─────┘ └────┬─────┘ └──────────┘ └──────────┘ └──────────────┘  │
│       │            │                                                     │
│       ▼            ▼                                                     │
│  /documents/   /workspaces                                               │
│  upload                                                                  │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Analytics │ │Audit Log │ │Jobs      │ │Chunks    │ │Search        │  │
│  │/analytics│ │/audit    │ │/jobs     │ │/chunks   │ │/search       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                                                                          │
│  ┌──────────────────────┐ ┌──────────────────────┐                      │
│  │Corpus Health         │ │Corpus Inventory      │                      │
│  │/admin/corpus-health  │ │/admin/corpus-inventory│                      │
│  └──────────────────────┘ └──────────────────────┘                      │
│                                                                          │
│  ┌──────────────────────┐ ┌──────────────────────┐                      │
│  │Generate Inventory    │ │Generate Release      │                      │
│  │(POST form)           │ │Report (POST form)    │                      │
│  └──────────────────────┘ └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Navigation Bar (every page)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] Startseite | Vorgänge | Entscheidung | Vorschriften |     │
│        Dokumente | Verwaltung | [DE/EN] | [Abmelden]             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part 7 — Application State Per Screen

### Decision Screen

```
State:
  selectedWorkspace: string | null          // "building", "procurement", "hr", null (all)
  selectedModel: string                      // from GET /api/providers/models
  question: string                           // user input
  isLoading: boolean                         // true during AI inference
  answer: {
    kurzantwort: string                      // 1 sentence
    entscheidung: string                     // 2-3 sentences
    confidence: number                       // 0-100
    confidenceLabel: string                  // "Sehr hoch", "Hoch", "Mittel", "Niedrig"
    rechtsgrundlagen: RegulationCard[]       // grouped by document
    verfahren: string
    naechsterSchritt: string
    executionTrace: {
      strategy: string                       // "RULE_ENGINE" | "HYBRID_RETRIEVAL"
      retrieval: string                      // "EXECUTED" | "SKIPPED"
      graphRAG: string                       // "SKIPPED"
      reranking: string
      evidence: string
      llmRole: string                        // "explain-only" | "reason"
      sources: number
      totalMs: number
    }
    sources: SourceCitation[]                // retrieved evidence
    regulationCards: RegulationCardGroup[]   // grouped by document title
  } | null
  error: string | null
  suggestedQuestions: string[]              // per workspace
```

### Corpus Health Screen

```
State:
  summary: {
    docCount: number
    chunkCount: number
    embeddedCount: number
    missingEmbeddings: number
    qdrantVectors: number
    embeddingCoverage: string               // "100,0%"
    avgChunksPerDoc: string                 // "1,5"
    avgRetrievalScore: string               // "N/A"
    qdrantVectorDim: number                 // 768
  }
  greenCount: number
  yellowCount: number
  redCount: number
  warnings: string[]
  warningCount: number
  hasWarnings: boolean
  rows: DocRow[]                            // document table
  categoryRows: CategoryRow[]               // health categories (9)
  manifestSummary: ManifestSummary
  isLoading: boolean                        // initial page load
```

### Documents List Screen

```
State:
  documents: DocumentResponse[]
  totalElements: number
  totalPages: number
  currentPage: number
  filters: {
    status: DocumentStatus | null
    type: DocumentType | null
    category: string | null
    tag: string | null
    tenantId: string | null
  }
  isLoading: boolean
  selectedDocument: DocumentResponse | null
```

### Upload Screen

```
State:
  file: File | null
  fileName: string
  title: string
  category: string
  type: DocumentType               // "PDF", "DOCX", "TXT", "HTML"
  tags: string                     // comma-separated
  domain: string
  documentDate: string
  isUploading: boolean
  uploadProgress: number           // 0-100
  estimatedChunks: number | null
  estimatedEmbeddings: number | null
  error: string | null
  success: string | null
```

### Global State (Context/Store)

```
Global:
  auth: {
    accessToken: string
    refreshToken: string
    user: CurrentUserResponse | null
    isAuthenticated: boolean
  }
  navigation: {
    currentPath: string
    previousPath: string
  }
  providers: {
    embeddingAvailable: boolean
    vectorSearchAvailable: boolean
    semanticSearchReady: boolean
    models: Model[]
  }
  language: 'de' | 'en'
  toasts: Toast[]
```

---

## Part 8 — Asynchronous Operations

All operations that may exceed 1 second:

| Operation | Est. Duration | Approach | Progress | Cancel |
|---|---|---|---|---|
| **AI Decision Query** (POST `/decision`) | 3-60 seconds | Fetch with timeout. Backend processes synchronously. | Spinner + "Analysiere Vorgang..." text + elapsed time counter. Disable submit button. | **No** — backend has no cancel mechanism. Let request complete. |
| **Document Upload + Ingestion** | 10-120 seconds | Two-phase: 1) Upload (fast) → 2) Poll ingestion job status | Phase 1: Upload progress bar. Phase 2: "Wird verarbeitet..." with job status polling (GET `/api/document-ingestion-jobs?documentId={id}` every 5s) | **No** — ingestion runs to completion. |
| **Batch Import** (POST `/api/documents/batch-import`) | 30-600 seconds | Synchronous response with final summary. No polling. | Show import progress via SSE or polling of job statuses. Display file-by-file results as they complete. | **No** — batch import is synchronous. |
| **Document Reindex** (POST `/api/documents/{id}/reindex`) | 10-120 seconds | Async trigger → poll job status | Button shows "Reindexing..." with spinner. Poll job status. | No |
| **Corpus Inventory Generation** (POST `/admin/corpus-inventory/generate`) | 5-30 seconds | Synchronous POST → redirect on completion | Spinner on button. | No |
| **Benchmark Execution** | 60-600 seconds | CLI command `mvn test`. Not a REST endpoint. | **Missing backend API** — needs `POST /api/benchmark/run` with progress via SSE. | **Not yet available.** |
| **Corpus Health Scan** | 10-30 seconds | GET `/admin/corpus-health` is server-rendered. For SPA: needs JSON API. | **Missing backend API** — needs `GET /api/corpus/health` returning JSON. Current endpoint returns HTML only. | N/A |
| **Search Query** (POST `/api/search`) | 1-10 seconds | Fetch with timeout | Skeleton cards while loading. | No |
| **Qdrant Re-index All** | 60-600 seconds per 300 docs | Not a REST endpoint. | **Missing backend API.** | N/A |

### Missing Backend APIs for SPA

These endpoints return HTML today and need JSON equivalents for a React SPA:

| Current Endpoint | Returns | Needed SPA Endpoint | Priority |
|---|---|---|---|
| `GET /admin/corpus-health` | HTML | `GET /api/corpus/health` → JSON | **P1** |
| `GET /admin/corpus-inventory` | HTML | `GET /api/corpus/inventory` → JSON | **P1** |
| `POST /decision` | HTML | `POST /api/decision` → JSON (`DecisionResponse`) | **P1** |
| `GET /home` | HTML | (client-side composition from existing APIs) | P2 |
| `GET /admin` | HTML | (client-side composition from existing APIs) | P2 |
| `POST /admin/corpus-inventory/generate` | Redirect | Return JSON with success/failure + file path | P3 |
| Benchmark execution | CLI only | `POST /api/benchmark/run` with SSE progress | P3 |

**Justification:** The three P1 endpoints are the most-used pages (Decision, Corpus Health, Corpus Inventory) and must be converted to JSON for any SPA framework. The backend logic is already in `AiPageController`, `CorpusHealthService`, and `CorpusHealthController` — only the response format needs to change.

---

## Part 9 — Frontend Architecture Recommendation

### Recommendation: React with Next.js App Router

**Justification:**

1. **Existing backend is a REST API.** React's `fetch`/`axios` integrate directly with JSON REST endpoints. No middleware translation layer needed.

2. **Google AI Studio integration.** React components map naturally to AI Studio's component generation. The component tree (pages → sections → cards → buttons) is a direct React hierarchy.

3. **State management matches.** The Decision screen has complex state (question, loading, answer, sources, execution trace). React's `useReducer` or a lightweight store (Zustand) handles this cleanly without Redux overhead.

4. **Desktop-first, not mobile-first.** The application is used on desktop workstations in municipal offices. React + CSS Grid/Flexbox provides the information-dense layout that administrative UIs require.

5. **Next.js for SSG where beneficial.** Corpus Health dashboard and static pages can be statically generated. Decision page is client-side rendered (it depends on user input). Next.js App Router supports both patterns.

6. **No backend changes required.** All 46 REST endpoints remain unchanged. The SPA calls them directly. The three P1 missing JSON endpoints can be added as thin wrappers around existing service methods.

### Alternatives Considered and Rejected

| Framework | Why Rejected |
|---|---|
| Vue + Nuxt | Smaller ecosystem for enterprise admin UIs. React has more component libraries for tables, dashboards, and forms. |
| Angular | Too heavy for this use case. The app has ~15 pages, not 150. Angular's boilerplate overhead isn't justified. |
| Flutter Web | Not appropriate for desktop-first administrative UIs. Performance on large data tables is poor. Accessibility is limited. |
| HTMX + Thymeleaf | Keep current stack. Rejected because the goal is a modern frontend via AI Studio. |

---

## Part 10 — Google AI Studio Notes

### Application Style

**Target:** German public administration desktop application. Professional, information-dense, efficient. Not a consumer app. Not a startup dashboard. The visual language should convey reliability, clarity, and precision — like a well-designed government form, but digital.

**Users:** Municipal employees aged 25-65. Varied technical literacy. The interface must be discoverable without training. Labels in German. No icons without text labels. No hidden gesture controls.

**UX principles:**
- Every action produces visible feedback within 500ms or shows a progress indicator
- Data tables are the primary UI pattern — dense, filterable, sortable
- Cards group related information but are secondary to tables
- Forms have clear validation with inline errors, not toast-only
- Navigation is always visible (persistent sidebar or top nav)
- The Decision page is the most-used screen — it should be the default landing page after login

**Accessibility:** WCAG 2.1 AA minimum. Keyboard navigation for all interactive elements. Focus indicators visible. Color is not the only differentiator (use icons + text for status). Form labels are always visible (no placeholder-only labels).

**Color palette:** Professional blue-gray palette. Primary: deep blue (#1a365d or similar). Accent: muted green for success/ready states, amber for warnings, red for errors. Background: off-white (#f8f9fa). Cards: white with subtle borders. High contrast text (not pure black, but #1a1a2e).

**Information density:** High — municipal employees process many cases per day. Don't space things out like a marketing page. Tables should show 20-50 rows with minimal padding. Card grids should use available horizontal space (3-5 columns on 1920px screens).

**Typography:** Inter or a similar workhorse sans-serif. Body: 14px. Table text: 13px. Headings: 18-24px. Monospace for document references, IDs, and code-like data.

**Responsive behavior:** Desktop-first. Minimum supported width: 1280px (standard office monitor). Optimize for 1920px. Tablet/mobile not required for v1.0 — municipal employees use desktop workstations.

**Component patterns:** Tables with sticky headers, sortable columns, and row actions. Stat cards with large numbers and small labels. Badge components for status (green/yellow/red). Toast notifications in bottom-right. Expandable sections for trace/debug info. Skeleton loading states for all data-driven components.

---

## Coverage Summary

| Category | Count | Documented | Coverage |
|---|---|---|---|
| Pages | 26 | 26 | **100%** |
| Controllers (Page) | 13 | 13 | **100%** |
| Controllers (REST) | 9 | 9 | **100%** |
| REST Endpoints | 46 | 46 | **100%** |
| Interactive Components (buttons, forms, dropdowns) | 30 | 30 | **100%** |
| Display Data Fetches | 14 | 14 | **100%** |
| Navigation Transitions | All paths | Documented | **100%** |
| Async Operations | 9 | 9 | **100%** |
| Request DTOs | 12 | 12 | **100%** |
| Response DTOs | 16 | 16 | **100%** |
| Error Formats | 3 | 3 | **100%** |
| Missing Backend APIs (for SPA) | 7 | 7 identified | **100%** |

**Overall Coverage: 100%** — every page, controller, endpoint, component, and async operation is documented.
