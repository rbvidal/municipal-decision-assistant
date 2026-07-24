# Changelog

All notable changes to the Municipal Decision Assistant.

## v1.0.0-RC1 — 2026-07-23

### Added
- **AI Audit Pipeline** — AI inference events now flow through the platform audit SPI (`AiAuditEvents` → `PersistentAuditService` → SQL). All domains (Search, Documents, Auth, AI) use consistent audit publishing.
- **Knowledge Search** — Knowledge page wired to production `SearchFacade` (hybrid keyword + vector + graph retrieval). Replaced 7 hardcoded mock documents with real search results enriched via `DocumentFacade`.
- **Administrative Authorization** — Five admin controllers secured with `@PreAuthorize("hasRole('ADMIN')")`: `AdminHealthController`, `AdminKnowledgeController`, `CorpusHealthRestController`, `CorpusRestController`, `AuditController`.
- **Ingestion Job Monitoring** — `GET /api/admin/jobs` wired to `DocumentFacade.findIngestionJobs()` returning real ingestion pipeline status.
- **k6 Load Test Suite** — Eight load test scripts (smoke, daily load, peak, AI-heavy, search-intensive, upload stress, admin ops, long session).

### Changed
- **KnowledgeRestController** — Now uses `SearchFacade` + `DocumentFacade` for document search/discovery with real ranking, citations, and relevance scores.

### Fixed
- **AiAuditPublisher** — No longer bypasses audit SPI with `log.info()`. Uses proper `AiAuditEvents` → `PersistentAuditService` chain.
- **Production profile** — `docker-compose-prod.yml` and `start-prod.bat` now correctly activate `spring.profiles.active=prod`. Previously used default profile with `ddl-auto: update`.
- **Admin endpoint data** — Replaced hardcoded job/audit/department data with real service calls or intentional endpoint removal.

### Removed
- **UsersRestController + UsersPage** — Prototype user management (feature-flagged off, no backend service). Controller, frontend page, hooks, services, and types deleted.
- **SupervisorRestController + SupervisorPage** — Prototype approval workflow (no backend domain). Controller, frontend page, hooks, services, and approval components deleted.
- **Hardcoded admin endpoints** — `/api/admin/audit`, `/api/admin/departments`, `/api/corpus/packages`, `/api/corpus/metrics`, `/api/corpus/jobs` deleted (no backend services or duplicates of real endpoints).
- **DefaultRetrievalOrchestrator** — Dead `@Service` bean never injected into any production class. Interface and implementation deleted.
- **Frontend demo fallback** — `useCaseWorkspace.ts` hardcoded demo data removed. API failures show error state instead of fake cases.
- **Dead frontend code** — 16 unused hooks, 10 unused feature flags, 3 dead config files, approval component directory deleted.

### Security
- **Development endpoints** — `/dev/perf` and `/dev/knowledge` moved to `/api/dev/` under JWT authentication (RC-1).
- **Administrative endpoints** — Five controllers require `ADMIN` role via `@PreAuthorize` (RC-4).
- **No hardcoded credentials in production configuration.**

### Known Limitations
- **Dashboard** — Home page shows error state. Dashboard aggregation service deferred to future release.
- **Search sorting** — No user-configurable sort. Results ordered by retrieval ranking.
- **Document type semantics** — Knowledge page uses file-based type labels ("Dokument (PDF)") instead of semantic types ("Vorschrift").
- **Workspace Draft/Send tabs** — Placeholder content. Feature deferred.

---

## v1.0.0 — 2026-07-19 (Historical)

Initial internal release with core architecture:
- AI-assisted municipal decision support
- Hybrid retrieval (keyword + vector + graph)
- Rule Engine for deterministic procurement/salary/travel decisions
- Document ingestion pipeline
- Workspace management
- JWT authentication
- Audit logging
- Corpus health monitoring
