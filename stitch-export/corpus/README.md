# Korpus-Status (Corpus Management)

## Screen Name

Korpus-Status (`/admin/corpus-health`)

## Purpose

Corpus health monitoring dashboard. Shows document indexing status, embedding coverage, Qdrant vector counts, and per-document health metrics. Administrators can generate inventory reports, release reports, trigger reindexing, and rebuild the Qdrant index. Accessible from Verwaltung > Korpus-Status.

## Screens Included

- Korpus-Status dashboard (status badge, stat cards, warnings, document health table)
- Korpus-Inventar (inventory report — manifest entries, by-domain, by-priority)
- Release-Report (release readiness report)

## States

- Healthy (green status badge, all stats green)
- Warnings (amber badge, documents with missing embeddings highlighted)
- Critical (red badge, multiple failures)
- Loading (skeleton stat cards + table)
- Inventory generation (progress indicator)
- Empty (no documents in corpus)

## Related Backend Module(s)

- `platform-api` — CorpusHealthController
- `platform-search` — ChunkManagementService, ChunkRepository
- `platform-search` — EmbeddingProvider, QdrantVectorSearchProvider

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/admin/corpus-health` | GET | Corpus health data (needs JSON wrapper) |
| `/admin/corpus-inventory` | GET | Corpus inventory data (needs JSON wrapper) |
| `/admin/corpus-inventory/generate` | POST | Generate CORPUS_INVENTORY.md |
| `/admin/corpus-release-report/generate` | POST | Generate release report |
| `/admin/corpus-inventory/report` | GET | View generated inventory report |
| `/api/documents/{id}/reindex` | POST | Reindex single document |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** Two endpoints (`/admin/corpus-health`, `/admin/corpus-inventory`) currently return HTML. JSON wrappers are required for the React SPA. Backend service logic already exists.
