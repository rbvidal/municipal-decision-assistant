# Dokumentenverwaltung (Document Management)

## Screen Name

Dokumentenverwaltung (`/documents`)

## Purpose

Municipality-wide document management. Manages ALL municipal documents — citizen submissions, building permits, contracts, incoming mail, generated decisions, templates, forms, and archive. This is the global repository, distinct from the case-level Dokumente tab which shows only documents belonging to a specific case.

## Screens Included

- Alle Dokumente (filterable, sortable document list — 50 rows default)
- Hochladen (drag-and-drop upload with metadata form, progress, processing status)
- Index-Status (indexing health summary, warnings, reindex actions)
- Document Detail (metadata, versions, full text, version comparison)
- Version Comparison (side-by-side diff, auto-detected changes)

## States

- Document list: normal, empty (no documents), loading (skeleton)
- Upload: idle (drop zone), uploading (progress bar), processing (status card), complete (toast), error (toast)
- Index-Status: healthy (all green), warnings (amber), critical (red)
- Document Detail: normal, not found (404)
- Version Comparison: loading, ready, single version (no comparison possible)

## Related Backend Module(s)

- `platform-api` — DocumentController, DocumentPageController
- `platform-search` — IndexingOrchestrationService, ChunkManagementService

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/documents` | GET | List documents |
| `/api/documents` | POST | Create document record |
| `/api/documents/{id}` | GET | Document detail |
| `/api/documents/{id}` | DELETE | Soft delete document |
| `/api/documents/{id}/content` | GET | Document full text |
| `/api/documents/{id}/metadata` | PATCH | Update metadata |
| `/api/documents/{id}/versions` | POST | Add new version |
| `/api/documents/{id}/archive` | POST | Archive document |
| `/api/documents/{id}/reindex` | POST | Reindex document |
| `/api/documents/{id}/purge` | DELETE | Hard delete document |
| `/api/documents/batch-import` | POST | Batch import documents |
| `/documents/upload` | POST | Upload document file |
| `/documents/batch` | POST | Batch upload files |
| `/api/ingestion/preview-metadata` | POST | Preview extracted metadata |
| `/api/document-ingestion-jobs` | GET | List ingestion jobs |
| `/api/document-ingestion-jobs/documents/{id}` | POST | Start ingestion |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
