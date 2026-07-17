# Implementation Sequence — Solo Founder

**Principle:** Working software over completed layers. Every task produces visible progress. No task leaves the project broken.

**Original tasks:** 78 (from ENGINEERING_BACKLOG.md)
**Reordered/merged/split:** Yes — same work, different sequence
**Architecture:** FROZEN — no redesign

---

## Sequence Rules

1. **Backend before frontend.** Verify via curl before building UI. Debugging is faster against an API than against a React component calling an API.

2. **Test incrementally.** Write tests for each slice before moving to the next. No "testing phase" at the end.

3. **Working software every Friday.** If Friday arrives and the system doesn't work end-to-end, fix it before starting new work Monday.

4. **Merge small tasks.** Two 4-hour tasks by the same person on the same module merge to one 8-hour task. Context switching is the enemy.

5. **Split large tasks.** A 40-hour task (T-049) must be split into per-slice increments. Testing is continuous, not batched.

---

## Reordered Task Sequence

### SLICE 0: Developer Environment (Day 1–2)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S0.1 | T-001 | Dev environment bootstrapping: docker-compose up, mvn install, npm install, npm run dev. Document exact commands in DEVELOPER_SETUP.md. | 8 | Everything depends on a working dev environment. Must be first. |
| S0.2 | T-002 | Maven dependency audit: align versions in parent POM, remove unused deps, OWASP check. | 6 | Clean dependencies before writing any code. |
| S0.3 | T-003 | Frontend dependency audit: pin versions, npm audit clean, verify build. | 4 | Same as T-002 but for frontend. |
| S0.4 | T-004 | Remove 6 empty directory stubs from frontend/src/. | 2 | Quick cleanup. Remove dead code before building. |
| S0.5 | T-005 | Pre-commit hooks: husky + lint-staged + prettier + ESLint. | 6 | Quality gate before any code is committed. |
| S0.6 | T-006 | Backend static analysis: SpotBugs + Checkstyle in Maven build. | 8 | Quality gate for backend. Done once, enforced forever. |

**Slice 0 total:** 34h (4.25 days — round to 1 week with buffer)

---

### SLICE 1: Document Ingestion Pipeline (Day 3–12)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S1.1 | T-028 | Ingestion pipeline observability: Micrometer metrics for each phase (extraction_ms, chunk_count, embedding_ms, index_ms). | 8 | Metrics first. You can't debug what you can't measure. Instrument before touching pipeline code. |
| S1.2 | T-029 | Text extraction fallback chain: PDFBox → Tika for PDF, POI → Tika for DOCX. Partial extraction on failure. | 12 | Extraction is the pipeline entry point. Must work before anything downstream. |
| S1.3 | T-030 | Chunking strategy: configurable size, overlap, strategy (sentence vs. fixed). | 8 | Chunking follows extraction. Configuration externalized before indexing. |
| S1.4 | T-014 (partial) | Document upload endpoint + document list endpoint. Verify via curl: upload file → document appears in list with status. | 8 | Backend API first. Verify everything works via curl before building any UI. |
| S1.5 | T-014 (partial) | Document upload page + document list page. File input with progress. Document table with status column. | 8 | Frontend only after backend is verified. Single page, single purpose. |

**Slice 1 total:** 44h (5.5 days — round to 1.5 weeks)

**End-of-slice verification:** Upload 3 documents of different types (PDF, DOCX, TXT). All three appear in list. All three indexed in Qdrant. Metrics visible in /actuator/metrics.

---

### SLICE 2: Search & Retrieval (Day 13–22)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S2.1 | T-031 | Hybrid retrieval fusion: keyword (PostgreSQL full-text) + vector (Qdrant cosine). Configurable weights. Deduplication. | 10 | Search backend first. Verify fusion quality via curl before building UI. |
| S2.2 | T-033 | Citation service: German legal citation format. Grouping by document. Chunk anchor links. | 6 | Citations make search results useful. Build alongside retrieval. |
| S2.3 | T-015 (partial) | Search endpoint verification. curl queries against indexed documents. Verify fusion, dedup, citations. | 4 | Backend verification before frontend. |
| S2.4 | T-015 (partial) | Search page: SearchBar, ResultCard with highlighting, FilterPanel, SearchSummary, empty state. | 8 | Frontend for search. Single page, multiple components. |
| S2.5 | T-034 (simplified) | Basic search filters: document type dropdown, domain dropdown. Skip boolean operators and field-specific search (defer to v1.1). | 4 | Filters add value but advanced query building is v1.1. Keep it simple. |

**Slice 2 total:** 32h (4 days — round to 1.5 weeks with testing)

**End-of-slice verification:** Search "Wertgrenzen" → results with citations. Search "Bauordnung" → filtered by Bauen domain. Kill Qdrant → keyword results still return. Kill PostgreSQL → vector results still return.

---

### SLICE 3: Decision Engine (Day 23–36)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S3.1 | T-021 | Procurement category normalization: all VgV/DVO categories → Lieferung/Dienstleistung or Bauleistung. 100% branch coverage on normalizeCategory(). | 8 | Correct thresholds depend on correct categories. Must be right before any decision is made. |
| S3.2 | T-022 | DecisionRouter edge cases: empty question, null, >5000 chars, multi-category, German special chars. | 8 | Router is the decision entry point. Handle all edge cases before building the full pipeline. |
| S3.3 | T-023 | NumericExtractor robustness: all German number formats (1.234,56 €, 5.000-10.000 Euro, bare numbers). | 6 | Number extraction is critical for procurement lookups. Test all German formats. |
| S3.4 | T-024 | EvidencePackage validation: null safety, negative counts, flag consistency. | 4 | Small task. Clean up DTO validation before building the response pipeline. |
| S3.5 | T-025 | DecisionPackage JSON round-trip tests: all 10 DTOs, missing fields, null collections, enum handling. | 6 | Ensure JSON contract is stable before frontend consumes it. |
| S3.6 | T-026 | KnowledgeRegistry runtime reload: POST /api/admin/knowledge/reload, atomic swap, failure rollback. | 8 | Enables updating regulation tables without restart. Important for long-running pilot. |
| S3.7 | T-012 | API client layer foundation: base URL from env, auth interceptors, error normalization, request timeout. | 8 | API client must exist before any frontend decision UI. Build once, use everywhere. |
| S3.8 | T-013 (partial) | Decision endpoint verification via curl. Test all 4 DecisionResult subtypes. Verify SSE streaming. | 4 | Backend verification before frontend. |
| S3.9 | T-013 (partial) | DecisionSupportTab + DecisionWorkspace: question input, loading state, structured response display, confidence bar, evidence cards, SSE parsing. | 16 | The most important frontend component. Core user experience. |

**Slice 3 total:** 68h (8.5 days — round to 2 weeks)

**End-of-slice verification:** Ask 4 questions. Each returns correct structured response. RuleEngine: salary, travel, procurement, threshold overview. HYBRID_RETRIEVAL: legal reasoning with citations.

---

### SLICE 4: Authentication & App Shell (Day 37–46)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S4.1 | T-007 | Auth audit: token rotation, concurrent refresh, logout invalidation, edge cases. | 8 | Auth security before auth UI. |
| S4.2 | T-008 | LoginPage: email/password form, API integration, error display, loading state. | 12 | First auth page. Core authentication flow. |
| S4.3 | T-009 | RegisterPage: form with password strength, API integration, redirect to login on success. | 8 | Second auth page. Completes the auth entry flow. |
| S4.4 | T-010 | ProtectedRoute: auth guard, 401 interceptor, silent token refresh. | 10 | Gate all existing pages behind auth. |
| S4.5 | T-011 | Logout: button in UserMenu, token invalidation, redirect to /login. | 4 | Completes auth lifecycle. |
| S4.6 | (merged) | App shell: Sidebar, TopNavigation, Breadcrumb, UserMenu wired to auth state. AppShell layout. | 8 | Navigation shell. Merged from navigation component wiring tasks. |

**Slice 4 total:** 50h (6.25 days — round to 1.5 weeks)

---

### MVP CHECKPOINT — v0.1

**All Must Have features complete.** Run MVP verification script (see MVP_DEFINITION.md). Record demo video.

**Commit tag:** `v0.1-mvp`

---

### SLICE 5: Case Workspace (Day 47–66)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S5.1 | (merged) | Case CRUD endpoints verification via curl: create, list, get, update status. | 6 | Backend first. Merge T-016 + T-037 backend portions. |
| S5.2 | T-037 | CaseWorkspacePage: case header (number, citizen, assignee, status, deadline, priority), tab routing, breadcrumb. | 16 | Core case UI. Everything else tabs into this. |
| S5.3 | T-038 | ChecklistTab: dynamic checklist from API, check/uncheck, progress bar. | 10 | Most complex tab. Build first since it has the most logic. |
| S5.4 | T-039 | DocumentsTab: case-scoped documents, upload with case association, version list. | 12 | Second tab. Reuses document upload from Slice 1. |
| S5.5 | T-040 | InternalNotesTab: CRUD notes, timestamps, user attribution. | 8 | Simple CRUD. Quick to build. |
| S5.6 | T-041 | ActivityTab: event timeline, date grouping, auto-refresh, event type icons. | 8 | Timeline display. Depends on events existing from other actions. |
| S5.7 | T-042 | MyWorkPage: assigned cases table, status/priority/overdue filters, empty state. | 10 | Case list. Entry point for case workflow. |

**Slice 5 total:** 70h (8.75 days — round to 2.5 weeks)

---

### SLICE 6: Corpus Administration (Day 67–78)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S6.1 | T-043 | Manifest-based batch import: parse MANIFEST.yaml, create → extract → chunk → embed → index per document, failure isolation, summary report. | 12 | Batch import is essential for populating the corpus with real data. |
| S6.2 | T-044 | Automated health alerts: background job every hour, alert on coverage < 90%, alert on missing vectors. | 8 | Proactive monitoring. Catch issues before user notices. |
| S6.3 | T-017 | CorpusPage: stat cards, warning alerts, health table with 15 columns, refresh. | 12 | Admin dashboard. Shows corpus state at a glance. |
| S6.4 | T-018 | KnowledgePage: regulations grouped by domain, filters, links to document viewer. | 8 | Knowledge base UI. Simple display page. |
| S6.5 | T-019 | Audit log page: paginated table, filters by event type/user/date, detail view. | 8 | Audit trail UI. Read-only display. |
| S6.6 | T-020 (partial) | AdministrationPage: tool grid with links to corpus health, audit, users, jobs. | 6 | Admin landing page. Simple grid of links. |

**Slice 6 total:** 54h (6.75 days — round to 1.5 weeks)

---

### SLICE 7: Testing Coverage (Day 79–102)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S7.1 | T-046 | Backend unit tests platform-ai: RuleEngine (all lookup paths), DecisionRouter (all edge cases), DomainClassifier, EvidencePackageBuilder, NumericExtractor, PromptRegistry. JaCoCo ≥ 80%. | 16 | Most critical module. Test first. |
| S7.2 | T-047 | Backend unit tests platform-search: HybridRetrievalService, CitationService, ChunkManagementService. JaCoCo ≥ 80%. | 14 | Second most critical module. |
| S7.3 | T-048 | Backend integration tests: auth flow, document CRUD, search, workspace CRUD, decision queries. All use Testcontainers. Error responses tested. | 16 | API integration tests. Verify contract between frontend and backend. |
| S7.4 | T-049 (part 1) | Frontend unit tests — common components: Button, Badge, TextInput, DataTable, Alert, Spinner, etc. | 12 | Start with primitives. They're reused everywhere. |
| S7.5 | T-049 (part 2) | Frontend unit tests — interaction components: Dialog, Drawer, DropdownMenu, Tooltip, Wizard. | 8 | Interaction components have complex state. Test thoroughly. |
| S7.6 | T-049 (part 3) | Frontend unit tests — search + decision components: SearchBar, ResultCard, DecisionWorkspace, FilterPanel. | 10 | Core feature components. |
| S7.7 | T-049 (part 4) | Frontend unit tests — case workspace + pages: CaseWorkspacePage, tabs, MyWorkPage. | 10 | Case management components. |
| S7.8 | T-050 | Frontend integration tests: login flow, case flow, decision flow, error flow. MSW for API mocking. | 16 | Verify component composition works. |
| S7.9 | T-051 | Playwright E2E tests: 10 critical paths against docker-compose. | 20 | End-to-end verification with real services. |
| S7.10 | T-052 | Performance baseline: k6 scripts for 5 scenarios, baseline metrics documented. | 12 | Establish performance expectations before hardening. |

**Slice 7 total:** 134h (16.75 days — round to 3 weeks, some tests already written incrementally)

---

### SLICE 8: Security Hardening (Day 103–116)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S8.1 | T-056 | Secrets management: zero hardcoded secrets, all from env vars, .env.example committed, .env in .gitignore. | 6 | Secrets first. Don't accidentally commit keys while working on other security. |
| S8.2 | T-055 | Input validation: @Valid on all DTOs, max lengths, XSS filter, German error messages. | 10 | Validate input before adding more security layers. |
| S8.3 | T-053 | CSP headers: script-src 'self', report-only → enforced migration, zero violations. | 8 | CSP after input validation. Test in report-only first. |
| S8.4 | T-054 | Rate limiting: login 5/min/IP, decision 10/min/user, upload 20/h/user. 429 with Retry-After. | 10 | Rate limiting last — depends on knowing which endpoints exist and their usage patterns. |
| S8.5 | T-057 | HTTPS/TLS: listener on 8443, HTTP→HTTPS redirect, HSTS, self-signed cert for dev. | 6 | HTTPS after everything else is secure. |

**Slice 8 total:** 40h (5 days — round to 1.5 weeks with testing)

---

### SLICE 9: Observability (Day 117–126)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S9.1 | T-058 | OpenTelemetry tracing: auto-instrumentation, custom spans, trace ID in logs, Jaeger export. | 12 | Tracing first. Foundation for all other observability. |
| S9.2 | T-060 | Structured logging: JSON format in production, trace_id + span_id + user_id in every line, console format for dev. | 6 | Logging after tracing. Trace IDs must propagate to logs. |
| S9.3 | T-061 | Health check aggregation: per-component status (DB, Qdrant, Neo4j, Ollama), DEGRADED logic, Docker healthcheck. | 6 | Health checks last. Aggregate what tracing and logging expose. |
| S9.4 | T-035 | Neo4j resilience: health indicator, circuit breaker, graceful degradation when unavailable. | 8 | Neo4j health. Depends on health check infrastructure. |
| S9.5 | T-036 (deferred) | Graph visualization: defer to v0.5+ if time permits. Graph data available via API but visualization is nice-to-have for solo developer. | — | Deferred. Graph data is queryable via API. Visualization is a v0.5 feature. |

**Slice 9 total:** 32h (4 days — round to 1.5 weeks)

---

### PUBLIC DEMO CHECKPOINT — v0.5

**All Should Have features complete.** Record 10-minute demo video showing full workflow.

**Commit tag:** `v0.5-public-demo`

---

### SLICE 10: CI/CD Pipeline (Day 127–136)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S10.1 | T-062 | CI pipeline: build, test, coverage, lint on every push. Coverage reports as artifacts. Pipeline < 15 min. | 10 | CI first. CD depends on CI passing. |
| S10.2 | T-063 | CD pipeline: merge to master → build Docker image → push to registry → deploy to staging → smoke tests. | 14 | CD after CI. Automate what CI validates. |
| S10.3 | (skip T-064) | SonarQube quality gates deferred to v1.1. Solo developer doesn't need a separate quality gate dashboard. | — | Deferred. |

**Slice 10 total:** 24h (3 days — round to 1.5 weeks with pipeline debugging)

---

### SLICE 11: Production Deployment (Day 137–150)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S11.1 | T-065 | Production Dockerfile: multi-stage build, eclipse-temurin:21-jre-alpine, non-root user, HEALTHCHECK, < 400MB. | 8 | Docker first. Everything else runs inside it. |
| S11.2 | T-066 | Docker Compose production profile: no exposed ports except 8080, resource limits, restart policy, health checks. | 6 | Production compose for single-machine deployment. |
| S11.3 | T-068 | Flyway baseline: V1__baseline.sql from current schema, ddl-auto: validate, tested on clean DB. | 10 | Database migration before backup. Schema must be versioned. |
| S11.4 | T-069 | PostgreSQL backup: pg_dump daily, WAL archiving, restore procedure tested end-to-end. | 10 | Backup after migration is stable. |
| S11.5 | T-070 | Qdrant backup: snapshot via API, stored alongside PG backup, restore tested. | 6 | Qdrant backup after PG backup. |
| S11.6 | T-071 | Incident playbook: 8 scenarios, symptoms → diagnosis → mitigation → resolution. | 8 | Playbook last. Documents procedures for everything built above. |
| S11.7 | (skip T-067) | Kubernetes manifests deferred to v1.1. Docker Compose is sufficient for pilot. | — | Deferred. |

**Slice 11 total:** 48h (6 days — round to 2 weeks)

---

### SLICE 12: Production Readiness (Day 151–164)

| Seq | Original ID | Task | Hours | Why This Order |
|---|---|---|---|---|
| S12.1 | T-073 | Load testing: smoke (1 user), average (10), stress (50→100), soak (20 for 1h). k6 scripts. Report findings. | 14 | Load test before chaos test. Establish baseline behavior under load. |
| S12.2 | T-074 | Chaos testing: kill Qdrant → keyword works. Kill Neo4j → graph degrades. Kill Ollama → fallback responses. Verify architecture's degradation guarantees. | 10 | Chaos after load. Test resilience under failure. |
| S12.3 | T-077 | API reference: all endpoints with method, path, auth, request/response examples, error format, rate limits. | 8 | Document the API. Useful for pilot municipality IT team. |
| S12.4 | T-076 | Operations manual: architecture diagram, startup/shutdown, monitoring, alerts, troubleshooting 10 common issues. | 12 | Document operations. Hand-off to pilot municipality. |
| S12.5 | T-075 | Production readiness checklist: verify all 50+ items. Document gaps. Sign-off. | 8 | Final verification. Everything must be checked. |
| S12.6 | T-078 | Final integration verification: production-like environment, all workflows pass, zero critical/high bugs. | 16 | Last task. If this passes, ship. |
| S12.7 | (skip T-072) | LLM evaluation framework deferred to v1.1. Manual testing sufficient for pilot. | — | Deferred. |

**Slice 12 total:** 68h (8.5 days — round to 2 weeks)

---

### PILOT READY — v1.0

**All Must Have + Should Have + Nice to Have features complete.**

**Commit tag:** `v1.0-pilot-ready`

---

## Task Count Summary

| Original Tasks | Action | Result |
|---|---|---|
| 78 tasks | 5 merged into larger tasks | 73 distinct work items |
| 5 tasks | Deferred to v1.1 (T-027, T-034 full, T-064, T-067, T-072) | Removed from v1.0 sequence |
| 3 tasks | Simplified (T-034 basic, T-036 deferred, T-059 simplified) | Reduced scope |
| **~68** | **Effective v1.0 tasks** | |

---

## Key Sequence Decisions — Rationale

### Why document pipeline before search?
Documents must be indexed before they can be searched. The ingestion pipeline produces the data that search queries. Building search first means testing with mock data — which means building search twice (mock, then real).

### Why decision engine after search?
The Decision Engine's HYBRID_RETRIEVAL path depends on search. RuleEngine part could be built independently, but verifying it requires indexed documents in the system. Build the retrieval foundation, then add the reasoning layer on top.

### Why auth so late (Slice 4)?
The MVP works without auth. You can upload documents, search, and query the decision engine — all via curl — without a login page. Auth matters when there are users. For the first 6 weeks, the only user is you. Build the core loop first, then add the door.

### Why merge navigation tasks into AppShell (S4.6)?
The team plan had separate tasks for Sidebar, TopNavigation, Breadcrumb, UserMenu — because different engineers would work on them in parallel. A solo developer wires them all sequentially. Merging eliminates 4 task handoffs that don't exist.

### Why split T-049 (frontend tests) across 4 parts?
40 hours of testing is too large for a solo developer to complete in one go. Splitting by component category lets testing happen incrementally: build a component, test it, move on. The 4 parts also map to natural stopping points.

### Why defer T-067 (K8s)?
A single-machine docker-compose deployment is appropriate for a 1-2 municipality pilot. Kubernetes adds operational complexity with no benefit at this scale. When pilot grows beyond 5 municipalities or needs HA, add K8s.

### Why defer T-072 (LLM eval)?
Manual testing of decision quality is acceptable for pilot. Building an automated eval framework is weeks of work that doesn't change the user experience. Add it when the system has real usage data to calibrate against.
