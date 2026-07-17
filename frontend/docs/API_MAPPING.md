# API Mapping

Spring Boot REST endpoints consumed by the frontend. All endpoints are prefixed with the backend base URL (configured via `VITE_API_BASE_URL`).

## Authentication

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/auth/login` | POST | Authenticate user | No |
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/refresh` | POST | Refresh JWT token | No (refresh token in body) |
| `/api/auth/logout` | POST | Invalidate refresh token | Yes |
| `/api/auth/me` | GET | Get current user profile | Yes |

## Workspaces (Cases)

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/workspaces` | GET | List workspaces/cases | Yes |
| `/api/workspaces` | POST | Create new workspace/case | Yes |
| `/api/workspaces/{id}` | GET | Get workspace detail | Yes |
| `/api/workspaces/{id}/advance` | POST | Advance to next phase | Yes |
| `/api/workspaces/{id}/documents` | GET | List workspace documents | Yes |
| `/api/workspaces/{id}/documents` | POST | Attach document to workspace | Yes |
| `/api/workspaces/{id}/timeline` | GET | Get workspace activity timeline | Yes |
| `/api/workspaces/{id}/timeline` | POST | Add timeline event | Yes |
| `/api/workspaces/{id}/steps` | GET | Get workflow steps | Yes |
| `/api/workspaces/{id}/phase-data` | PUT | Update phase data | Yes |

## Decision Support

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/decision` | POST | Run decision support analysis | Yes |

**Note:** Currently returns HTML. Needs JSON wrapper. Backend logic exists.

## Search

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/search` | POST | Unified search across all content | Yes |
| `/api/search/chunks` | GET | Search document chunks | Yes |

## Documents

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/documents` | GET | List documents | Yes |
| `/api/documents` | POST | Create document record | Yes |
| `/api/documents/{id}` | GET | Get document detail | Yes |
| `/api/documents/{id}` | DELETE | Soft delete document | Yes |
| `/api/documents/{id}/content` | GET | Get document full text | Yes |
| `/api/documents/{id}/metadata` | PATCH | Update document metadata | Yes |
| `/api/documents/{id}/versions` | POST | Add document version | Yes |
| `/api/documents/{id}/archive` | POST | Archive document | Yes |
| `/api/documents/{id}/reindex` | POST | Reindex document | Yes |
| `/api/documents/{id}/purge` | DELETE | Hard delete document | Yes |
| `/api/documents/batch-import` | POST | Batch import documents | Yes |

## File Upload

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/documents/upload` | POST | Upload document file (multipart) | Yes |
| `/documents/batch` | POST | Batch upload files (multipart) | Yes |

## Ingestion Jobs

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/document-ingestion-jobs` | GET | List ingestion jobs | Yes |
| `/api/document-ingestion-jobs/documents/{id}` | POST | Start document ingestion | Yes |
| `/api/document-ingestion-jobs/{jobId}/start` | POST | Start job execution | Yes |
| `/api/document-ingestion-jobs/{jobId}/complete` | POST | Mark job complete | Yes |
| `/api/document-ingestion-jobs/{jobId}/fail` | POST | Mark job failed | Yes |
| `/api/ingestion/preview-metadata` | POST | Preview extracted metadata | Yes |

## Corpus Reports

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/admin/corpus-health` | GET | Corpus health data | Yes (ADMIN) |
| `/admin/corpus-inventory` | GET | Corpus inventory data | Yes (ADMIN) |
| `/admin/corpus-inventory/generate` | POST | Generate inventory report | Yes (ADMIN) |
| `/admin/corpus-release-report/generate` | POST | Generate release report | Yes (ADMIN) |
| `/admin/corpus-inventory/report` | GET | View generated report | Yes (ADMIN) |

**Note:** `/admin/corpus-health` and `/admin/corpus-inventory` currently return HTML. JSON wrappers needed.

## Audit & Providers

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/audit/events` | GET | Search audit events | Yes (ADMIN) |
| `/api/providers/status` | GET | Provider health status | No |
| `/api/providers/models` | GET | Available AI models | No |

## Developer

| Endpoint | Method | Purpose | Auth Required |
|---|---|---|---|
| `/dev/perf` | GET | Performance dashboard | Yes (ADMIN) |
| `/dev/perf/config` | GET | Performance configuration | Yes (ADMIN) |
| `/dev/perf/profile` | GET | Performance profile | Yes (ADMIN) |
| `/dev/knowledge/salary` | GET | Salary table data | Yes (ADMIN) |
| `/dev/knowledge/travel` | GET | Travel allowance data | Yes (ADMIN) |
| `/dev/knowledge/thresholds` | GET | Procurement thresholds data | Yes (ADMIN) |
| `/dev/knowledge/stats` | GET | Knowledge statistics | Yes (ADMIN) |

## API Client Configuration

- **Base URL:** `VITE_API_BASE_URL` (default: `http://localhost:8080`)
- **Auth Header:** `Authorization: Bearer <accessToken>`
- **Token Storage:** In-memory (never localStorage)
- **Silent Refresh:** 5 minutes before access token expiry
- **Error Format:** `{ timestamp, status, error, message, stacktrace }`
- **Pagination:** `?page=0&size=50` (default)

## P1 Missing JSON Endpoints

Three endpoints need JSON wrappers before the SPA can fully replace Thymeleaf:

| Priority | Endpoint | Current State | Backend Logic |
|---|---|---|---|
| P1 | `POST /api/decision` | Returns HTML | Exists — controller change only |
| P1 | `GET /api/corpus/health` | Returns HTML | Exists — controller change only |

## Phase 12 — REST Service Endpoints

### Workspaces / Cases (RestCaseService)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/workspaces/:id` | Get case details |
| GET | `/api/workspaces/:id/steps` | Get workflow steps |
| GET | `/api/workspaces/:id/checklist` | Get checklist items |
| GET | `/api/workspaces/:id/documents` | Get case documents |
| GET | `/api/workspaces/:id/timeline` | Get activity timeline |
| GET | `/api/workspaces/:id/notes` | Get internal notes |

### Knowledge (RestKnowledgeService)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/knowledge` | Get all knowledge documents |
| GET | `/api/knowledge/search` | Search with query param `q` |
| GET | `/api/knowledge/:id` | Get single document |

### Documents (RestDocumentService)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/documents` | Get all documents |
| GET | `/api/documents/search` | Search with query param `q` |
| GET | `/api/documents/:id` | Get single document |

### Users (RestUserService)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/users` | Get all users |
| PUT | `/api/users/:id/toggle-status` | Toggle user active/inactive |

### Supervisor (RestSupervisorService)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/supervisor/cases` | Get all supervisor cases |
| GET | `/api/supervisor/cases/:id` | Get single case |

### Corpus (RestCorpusService)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/corpus/packages` | Get knowledge packages |
| GET | `/api/corpus/metrics` | Get Qdrant metrics |
| GET | `/api/corpus/jobs` | Get background jobs |
| GET | `/api/corpus/audit` | Get audit logs |

### Administration (RestAdminService)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/health` | Get system health |
| GET | `/api/admin/jobs` | Get background jobs |
| GET | `/api/admin/audit` | Get audit logs |
| GET | `/api/admin/departments` | Get department configs |
| P1 | `GET /api/corpus/inventory` | Returns HTML | Exists — controller change only |
