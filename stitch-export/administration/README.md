# Verwaltung (Administration)

## Screen Name

Verwaltung (`/admin`)

## Purpose

Administration area for system administrators. Tool grid landing page linking to all administration functions. Includes audit log viewer, ingestion job monitor, benchmark runner, and developer tools. Visible only to users with ADMIN role.

## Screens Included

- Übersicht (8-card tool grid — Korpus-Status, Audit, Aufträge, Benchmarks, Wissensgraph, Entwickler, Analytik, Systemkonfiguration)
- Audit (filterable event log table with pagination)
- Aufträge (ingestion job monitoring — filterable, with status indicators)
- Benchmarks (retrieval quality metrics — precision, recall, MRR, NDCG)
- Entwickler (performance dashboard, knowledge tables — salary, travel, thresholds)
- Systemkonfiguration (inline panel — AI provider settings, model selection)

## States

- Each sub-screen: normal, loading (skeleton), empty, error
- Audit: with events, no events in range, filter error
- Aufträge: active jobs, no jobs, failed jobs highlighted
- Benchmarks: results present, no benchmark history, running (progress)
- Systemkonfiguration: provider available, provider unavailable (warning)

## Related Backend Module(s)

- `platform-api` — AuditController, DocumentIngestionController
- `platform-api` — ProviderInfoController, KnowledgeDashboardController
- `platform-search` — IndexingOrchestrationService

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/audit/events` | GET | Search audit events |
| `/api/document-ingestion-jobs` | GET | List ingestion jobs |
| `/api/document-ingestion-jobs/{id}/start` | POST | Start job |
| `/api/document-ingestion-jobs/{id}/complete` | POST | Complete job |
| `/api/document-ingestion-jobs/{id}/fail` | POST | Mark job failed |
| `/api/providers/status` | GET | Provider health status |
| `/api/providers/models` | GET | Available AI models |
| `/dev/perf` | GET | Performance dashboard |
| `/dev/perf/config` | GET | Performance configuration |
| `/dev/perf/profile` | GET | Performance profile |
| `/dev/knowledge/salary` | GET | Salary table |
| `/dev/knowledge/travel` | GET | Travel allowance table |
| `/dev/knowledge/thresholds` | GET | Procurement thresholds table |
| `/dev/knowledge/stats` | GET | Knowledge statistics |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
