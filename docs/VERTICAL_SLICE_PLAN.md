# Vertical Slice Plan — Solo Founder

**Principle:** Each slice delivers a working, demonstrable system. No slice leaves the project broken. Every slice adds user-visible value.

---

## Slice 0: Developer Environment (Week 1, Days 1–2)

**Objective:** A single command starts the entire system.

**Backend work:**
- Verify docker-compose: PostgreSQL + pgAdmin + Qdrant + Neo4j + Ollama all healthy
- Run `mvn clean install` — fix any build issues
- Run `mvn spring-boot:run -pl platform-api` — verify API starts on :8080
- Audit Maven dependencies (T-002): align versions, remove unused
- Check `/actuator/health` returns UP

**Frontend work:**
- `npm install && npm run dev` — verify frontend on :5173
- Audit npm dependencies (T-003): pin versions, `npm audit` clean
- Verify `npm run build` produces production bundle
- Remove 6 empty directory stubs (T-004)

**Testing:**
- Manual: `curl localhost:8080/actuator/health` → UP
- Manual: Browser → localhost:5173 → frontend renders
- No automated tests yet

**Expected demo:** `docker-compose up && mvn spring-boot:run -pl platform-api` — browser shows frontend. `/actuator/health` shows all services.

**Acceptance criteria:**
- Clean clone → single command starts everything
- All 5 infrastructure services healthy
- Backend compiles and starts
- Frontend compiles and renders

**Duration:** 2 days (14h)

---

## Slice 1: Document Ingestion Pipeline (Week 1–2)

**Objective:** Upload a German municipal document. System extracts text, chunks it, generates embeddings, indexes in Qdrant. User sees the document appear in the document list.

**Implemented features:**
- Document upload (multipart POST /api/documents/upload)
- Text extraction (PDFBox → Tika fallback for PDF, POI → Tika for DOCX)
- Text chunking with configurable size/overlap
- Embedding generation via Ollama (nomic-embed-text)
- Qdrant vector indexing
- Document list page showing all indexed documents

**Backend work:**
- T-028: Add Micrometer metrics to ingestion pipeline
- T-029: Text extraction fallback chain hardening
- T-030: Configurable chunking parameters
- T-014 (partial): Document upload and list endpoints verified via curl
- Verify: chunk → embed → index lifecycle completes without errors

**Frontend work:**
- T-014 (partial): DocumentUploadPage with file input and progress
- T-014 (partial): DocumentsPage with paginated document table
- Document status indicator (UPLOADED → EXTRACTING → CHUNKING → EMBEDDING → INDEXED)

**Testing:**
- Upload test-document.txt → verify in document list
- Upload corrupt PDF → verify fallback behavior
- Upload PDF with German text → verify chunks contain correct text
- Query Qdrant directly: verify vectors exist for uploaded document
- `curl -X POST /api/documents/upload -F file=@test.pdf` → 200

**Expected demo:** Upload "AV zu Paragraph 55 LHO Berlin — Wertgrenzen.txt". Document appears in list. Status progresses to INDEXED. Qdrant contains embeddings.

**Acceptance criteria:**
- Upload a document → text extracted → chunks created → embeddings generated → indexed in Qdrant
- Document appears in frontend document list with correct metadata
- Extraction failure returns partial text with error metadata (not 500)
- Ingestion metrics visible in `/actuator/metrics`

**Duration:** 2 weeks (80h) — ~70% backend, 30% frontend

---

## Slice 2: Search & Retrieval (Week 3–4)

**Objective:** User types a search query. System returns ranked results from both keyword (PostgreSQL) and vector (Qdrant) search. Results show citations and relevance scores.

**Implemented features:**
- Hybrid search: keyword + vector with configurable fusion weights
- Result deduplication across sources
- Citation formatting in German legal style
- Search results page with filtering by type, domain, date
- Result cards with highlighted matching text and relevance scores

**Backend work:**
- T-031: Hybrid retrieval fusion + deduplication
- T-033: Citation service — German legal format
- T-015 (partial): Search endpoint verified via curl

**Frontend work:**
- T-015 (partial): SearchBar component wired to real API
- ResultCard with highlighting and score
- FilterPanel for type, domain, date
- Empty state when no results
- SearchSummary with hit count and query time

**Testing:**
- Search for "Wertgrenzen" → results from indexed documents
- Search for "Bauordnung" → results with correct citations
- Empty search → graceful error
- Verify keyword-only results when Qdrant is down
- Verify fusion: same query → keyword rank vs. vector rank vs. fused rank documented

**Expected demo:** Search "Vergaberecht Beschaffung". Results appear with: document title, matching excerpt, relevance score, legal citation. Filter by domain narrows results.

**Acceptance criteria:**
- Hybrid search returns fused keyword + vector results
- Deduplication: same document from both sources appears once
- Citations follow German legal format
- Performance: < 500ms for 10K documents
- Qdrant down → keyword results still return (graceful degradation verified)

**Duration:** 1.5 weeks (60h) — ~50% backend, 50% frontend

---

## Slice 3: Decision Engine (Week 4–6)

**Objective:** User asks a question. RuleEngine answers deterministic queries (salary, travel, procurement thresholds) from structured tables. HYBRID_RETRIEVAL answers legal reasoning questions from the indexed document corpus. Answer includes evidence, citations, and confidence score.

**Implemented features:**
- DecisionRouter classifies question → routes to RULE_ENGINE or HYBRID_RETRIEVAL
- RuleEngine: salary lookup (TV-L table), travel allowance (BRKG table), procurement threshold (AV §55 LHO table)
- HYBRID_RETRIEVAL: evidence retrieval → context assembly → LLM answer with citations
- DecisionPackage structured response (DecisionResult sealed interface → 4 subtypes)
- DecisionSupportTab UI with question input, loading state, structured response display
- SSE streaming for long-running LLM queries

**Backend work:**
- T-021: Procurement category normalization completion
- T-022: DecisionRouter edge case coverage
- T-023: NumericExtractor robustness (German number formats)
- T-024: EvidencePackage validation
- T-025: DecisionPackage JSON round-trip tests
- T-026: KnowledgeRegistry runtime reload
- T-013 (partial): Decision endpoint verified via curl

**Frontend work:**
- T-012: API client layer foundation (auth interceptors, error normalization)
- T-013 (partial): DecisionSupportTab with question input
- DecisionWorkspace component: workspace selector, question textarea, submit button
- Structured response display: decision text, source, confidence bar, evidence cards
- Loading state for 5-60s inference
- Error state for timeout or API failure
- SSE stream parsing for progressive results

**Testing:**
- "EG 10 Stufe 3 Gehalt" → RuleEngine returns SalaryDecision with correct monthly amount
- "8-stündige Dienstreise Berlin" → RuleEngine returns TravelDecision with Tagegeld
- "50.000 € IT-Dienstleistung Beschaffung" → RuleEngine returns ProcurementDecision with correct procedure
- "Welche Abstandsflächen gelten in Berlin?" → HYBRID_RETRIEVAL returns evidence with citations
- Empty question → graceful error
- Question with no matches → "Keine deterministische Regel" → HYBRID_RETRIEVAL fallback

**Expected demo:** Three queries demonstrating all decision types:
1. Salary: "EG 10 Stufe 3 TV-L" → structured salary response
2. Procurement: "Beschaffung 50.000 € IT-Software" → "Direktauftrag" procedure
3. Legal reasoning: "Abstandsflächen Berlin" → cited evidence from BauO Bln

**Acceptance criteria:**
- RuleEngine correctly answers salary, travel, procurement, fee questions
- HYBRID_RETRIEVAL returns evidence-grounded answers with citations
- Confidence scores reflect actual certainty (0.98–0.99 for RuleEngine, lower for retrieval)
- SSE streaming delivers progressive results
- Error and loading states handled gracefully

**Duration:** 2 weeks (80h) — ~60% backend, 40% frontend

---

## Slice 4: Authentication & Application Shell (Week 6–7)

**Objective:** Real authentication. Users register, login, access protected routes. JWT lifecycle complete. Application shell with navigation, breadcrumbs, and layout.

**Implemented features:**
- Login page with real JWT authentication
- Registration with password validation
- Protected route guards (unauthenticated → /login)
- Silent token refresh on expiry
- Logout with token invalidation
- Application shell: sidebar navigation, top bar, breadcrumbs
- User menu with logout

**Backend work:**
- T-007: Auth audit & edge case hardening (token rotation, concurrent refresh, logout invalidation)

**Frontend work:**
- T-008: LoginPage with form validation and API integration
- T-009: RegisterPage with password strength indicator
- T-010: ProtectedRoute component, 401 interceptor, silent refresh
- T-011: Logout button, session management
- Wire navigation components (Sidebar, TopNavigation, Breadcrumb) to auth state
- AppShell layout with authenticated vs. unauthenticated states

**Testing:**
- Register → login → access protected route → logout → cannot access protected route
- Expired token → silent refresh → request succeeds
- Refresh with invalid refresh token → redirect to /login
- Concurrent requests during token refresh → no race condition

**Expected demo:** Register account → login → see home page with user name → access decision page → close tab → reopen → still logged in → logout → cannot access decision page.

**Acceptance criteria:**
- Full JWT lifecycle: register → login → refresh → logout
- Token in memory only (verify: no localStorage, no sessionStorage)
- 401 from any API → redirect to /login
- Auth state survives page refresh

**Duration:** 1.5 weeks (60h) — ~20% backend, 80% frontend

---

## MVP CHECKPOINT — v0.1 (End of Week 7)

At this point the system does everything described in MVP_DEFINITION.md.

**Demo script (5 minutes):**
1. `docker-compose up` → all services healthy
2. Register → Login
3. Upload 3 documents (procurement regulation, building code, salary table)
4. Search "Wertgrenzen" → see results
5. Ask "50.000 € IT-Beschaffung Verfahren" → RuleEngine: Direktauftrag
6. Ask "Welche Abstandsflächen gelten?" → HYBRID_RETRIEVAL with citations
7. Done. Working product.

---

## Slice 5: Case Workspace (Week 8–10)

**Objective:** Full case lifecycle. Create case, work through checklist, attach documents, write internal notes, view activity timeline. My Work page shows assigned cases.

**Implemented features:**
- Case CRUD (create, list, view, update status)
- Case header with metadata (number, citizen, assignee, status, deadline, priority)
- Case tabs: Overview, Checklist, Documents, Internal Notes, Activity, Decision Support
- Dynamic checklist based on case type
- Case-scoped document attachment
- Activity timeline auto-refresh
- My Work page with case filters

**Backend work:**
- T-016: Workspace service — verify endpoints work via curl
- T-037 (partial): Case CRUD endpoints

**Frontend work:**
- T-037: CaseWorkspacePage with case header and tab routing
- T-038: ChecklistTab — dynamic checklist from API
- T-039: DocumentsTab — case-scoped documents
- T-040: InternalNotesTab — CRUD notes
- T-041: ActivityTab — event timeline with auto-refresh
- T-042: MyWorkPage — assigned cases table with filters
- Breadcrumb: Startseite > Meine Arbeit > CASE-ID > Tab

**Testing:**
- Create case → appears in My Work list
- Add checklist item → check off → progress updates
- Upload document to case → only visible in case documents tab
- Add internal note → appears in timeline
- Change case status → activity timeline reflects change
- Overdue case → highlighted in red on My Work page

**Expected demo:** Create case "BAU-2026-0001 Neubau Carport". Checklist populates. Upload building permit. Add note "Prüfung erforderlich". Activity timeline shows all events. My Work page shows case with status and priority.

**Acceptance criteria:**
- Full case lifecycle functional
- Case tabs switch without page navigation
- Case header always visible within workspace
- Documents scoped to case (not global)
- Activity timeline reflects all case events

**Duration:** 2.5 weeks (100h) — ~20% backend, 80% frontend

---

## Slice 6: Corpus Administration (Week 10–11)

**Objective:** Batch import from MANIFEST.yaml. Corpus health dashboard with live metrics. Document re-indexing. Admin-only access.

**Implemented features:**
- Manifest-based batch document import
- Corpus health dashboard (documents, chunks, embeddings, Qdrant vectors)
- Health warnings for missing embeddings or vectors
- Document re-index action
- Ingestion job management

**Backend work:**
- T-043: Manifest import service
- T-044: Automated health alerts (background job)
- T-017: Corpus health endpoints verified via curl

**Frontend work:**
- T-017: CorpusPage with stat cards and health table
- T-020 (partial): AdministrationPage with corpus health link

**Testing:**
- Import MANIFEST.yaml → all 22 documents indexed
- Corpus health dashboard shows correct document/chunk/embedding/vector counts
- Document with missing embeddings → warning displayed
- Re-index document → chunks and embeddings regenerated

**Expected demo:** Import all 22 demo documents from MANIFEST.yaml. Corpus health dashboard shows 22 documents, N chunks, N embeddings, N vectors. Warning-free.

**Acceptance criteria:**
- Batch import processes all manifest entries
- Corpus health dashboard reflects real-time state
- Warnings actionable (link to re-index)
- Admin-only access verified

**Duration:** 1.5 weeks (60h) — ~50% backend, 50% frontend

---

## Slice 7: Testing Coverage (Week 12–14)

**Objective:** 80%+ line coverage on backend and frontend. Integration tests with Testcontainers. E2E tests for critical paths. Performance baseline.

**Implemented features:**
- Backend unit tests: platform-ai (RuleEngine, DecisionRouter, all services)
- Backend unit tests: platform-search (HybridRetrieval, Reranking, Citations)
- Backend integration tests: all REST endpoints with Testcontainers
- Frontend unit tests: all components, all pages
- Frontend integration tests: critical user flows
- Playwright E2E tests: 10 critical paths
- Performance baseline with k6

**Work:**
- T-046: Backend unit tests — platform-ai (16h)
- T-047: Backend unit tests — platform-search (14h)
- T-048: Backend integration tests — API layer with Testcontainers (16h)
- T-049: Frontend unit tests — components + pages (40h, spread across this slice)
- T-050: Frontend integration tests — user flows (16h)
- T-051: Playwright E2E tests — critical paths (20h)
- T-052: Performance baseline — k6 scripts (12h)

**Testing strategy for a solo developer:**
- Write backend tests as you build each service (don't defer)
- Write frontend tests for each component immediately after building it
- Integration tests after each slice is "done" (before moving to next slice)
- E2E tests after Slice 6

**Acceptance criteria:**
- JaCoCo: platform-ai ≥ 80%, platform-search ≥ 80%, platform-api ≥ 70%
- Vitest: frontend ≥ 80% line coverage
- Integration tests pass with Testcontainers
- 10 E2E scenarios pass against docker-compose
- k6 baseline metrics documented

**Duration:** 3 weeks (120h, minus what was tested incrementally in Slices 1-6) — actual net new effort ~90h

---

## Slice 8: Security Hardening (Week 15–16)

**Objective:** Production security posture. CSP headers, rate limiting, input validation, HTTPS, secrets management.

**Implemented features:**
- CSP headers on all responses
- Rate limiting on auth endpoints (5/min/IP) and decision queries (10/min/user)
- Input validation on all DTOs (XSS prevention, SQL injection hardening)
- HTTPS/TLS configuration
- Secrets moved to environment variables

**Work:**
- T-053: CSP headers (8h)
- T-054: Rate limiting (10h)
- T-055: Input validation & sanitization (10h)
- T-056: Secrets management (6h)
- T-057: HTTPS/TLS (6h)

**Testing:**
- CSP: zero violations in production build
- Rate limiting: exceed limit → 429 with Retry-After
- Input validation: XSS payloads rejected
- Secret scan: zero secrets in committed files
- HTTPS: browser connects without certificate warning (self-signed OK for dev)

**Acceptance criteria:**
- CSP header present, script-src 'self' only
- Rate limits return 429
- All DTOs validated, error messages in German
- Zero hardcoded secrets
- HTTPS configured

**Duration:** 2 weeks (40h)

---

## Slice 9: Observability (Week 16–17)

**Objective:** Traces, structured logs, health checks. Know what the system is doing in production.

**Implemented features:**
- OpenTelemetry tracing across all services
- JSON structured logging in production
- Health check aggregation (DB, Qdrant, Neo4j, Ollama)
- Graceful degradation dashboards

**Work:**
- T-058: OpenTelemetry tracing (12h)
- T-059: Metrics dashboard — skip Grafana, use `/actuator/metrics` + health endpoint (simplified for solo) (6h)
- T-060: Structured logging — JSON in production profile (6h)
- T-061: Health check aggregation (6h)

**Testing:**
- Trace ID in log output
- Health endpoint shows all components with status
- Kill Neo4j → health shows DEGRADED, not DOWN
- Structured log line contains trace_id, span_id, user_id

**Acceptance criteria:**
- All HTTP requests traced
- Trace ID in every log line
- Health check shows per-component status
- DEGRADED when optional service down

**Duration:** 1.5 weeks (30h — simplified for solo: no Grafana dashboard)

---

## PUBLIC DEMO CHECKPOINT — v0.5 (End of Week 17.5)

Full feature set. Secure. Observable. Tested.

---

## Slice 10: CI/CD Pipeline (Week 18–19)

**Objective:** Push to GitHub → automated build → test → coverage report. Merge to master → deploy to staging.

**Implemented features:**
- CI pipeline: build, test, coverage, lint on every push
- CD pipeline: deploy to staging on merge to master
- Flyway baseline migration
- Pre-commit hooks active

**Work:**
- T-062: CI pipeline — build & test matrix (10h)
- T-063: CD pipeline — staging deploy (14h)
- T-005: Pre-commit hooks (already done in Slice 0)
- T-006: Static analysis (already done in Slice 0)

**Acceptance criteria:**
- Push → CI runs → tests pass → coverage reported
- Merge to master → CD deploys to staging
- Pipeline completes < 15 minutes
- Failed tests block merge

**Duration:** 1.5 weeks (24h)

---

## Slice 11: Production Deployment (Week 19–21)

**Objective:** Production Docker image. Database migrations. Backup & restore. Incident playbook.

**Implemented features:**
- Multi-stage production Dockerfile
- Docker Compose production profile
- Flyway database migrations (switch from ddl-auto:update)
- PostgreSQL backup & restore (pg_dump + WAL)
- Qdrant snapshot backup & restore
- Incident response playbook

**Work:**
- T-065: Production Dockerfile (8h)
- T-066: Docker Compose production profile (6h)
- T-068: Flyway baseline migration (10h)
- T-069: PostgreSQL backup & restore (10h)
- T-070: Qdrant backup & restore (6h)
- T-071: Incident playbook (8h)

**Testing:**
- Docker build → run → health check pass
- Flyway migration on clean database → schema matches current
- Backup → destroy database → restore → verify data
- Qdrant snapshot → delete collection → restore → verify vectors
- Incident playbook: follow "database down" procedure → system recovers

**Acceptance criteria:**
- Production Docker image builds and runs
- Flyway enabled, ddl-auto: validate
- Backup → restore cycle tested end-to-end
- Incident playbook covers 8 scenarios

**Duration:** 2 weeks (48h — excludes T-067 K8s, deferred to v1.1)

---

## Slice 12: Production Readiness (Week 21–23)

**Objective:** Load tested. Chaos tested. Documented. Verified. Ready for municipal pilot.

**Implemented features:**
- Load testing: smoke, average, stress, soak
- Chaos testing: graceful degradation under dependency failure
- Operations manual
- API reference
- Final integration verification

**Work:**
- T-073: Load testing (14h)
- T-074: Chaos testing (10h)
- T-075: Production readiness checklist (8h)
- T-076: Operations manual (12h)
- T-077: API reference (8h)
- T-078: Final integration verification (16h)

**Acceptance criteria:**
- Load test: 50 concurrent users, p95 < 5s, no crashes
- Chaos test: kill Qdrant → keyword search works, kill Neo4j → graph degrades, kill Ollama → fallback responses
- Operations manual covers startup, shutdown, monitoring, troubleshooting
- API reference documents all endpoints
- Full integration verification passed

**Duration:** 2 weeks (68h)

---

## PILOT READY — v1.0 (End of Week 23)

System is production-ready for 1–2 pilot municipalities.

---

## Slice Summary

| Slice | Weeks | Cumulative | Deliverable |
|---|---|---|---|
| 0: Dev Environment | 0.4 | 0.4 | Single-command startup |
| 1: Document Pipeline | 2.0 | 2.4 | Upload → extract → chunk → embed → index |
| 2: Search & Retrieval | 1.5 | 3.9 | Hybrid search with citations |
| 3: Decision Engine | 2.0 | 5.9 | RuleEngine + HYBRID_RETRIEVAL |
| 4: Auth & Shell | 1.5 | 7.4 | **MVP v0.1 — working product** |
| 5: Case Workspace | 2.5 | 9.9 | Case lifecycle management |
| 6: Corpus Admin | 1.5 | 11.4 | Batch import + health dashboard |
| 7: Testing Coverage | 3.0 | 14.4 | 80% coverage, integration + E2E |
| 8: Security Hardening | 2.0 | 16.4 | CSP, rate limiting, HTTPS |
| 9: Observability | 1.5 | 17.9 | **Public Demo v0.5 — feature complete** |
| 10: CI/CD Pipeline | 1.5 | 19.4 | Automated build, test, deploy |
| 11: Production Deploy | 2.0 | 21.4 | Docker, Flyway, backup/restore |
| 12: Production Readiness | 2.0 | 23.4 | **Pilot Ready v1.0** |

**Total:** 23.4 weeks (~5.5 months)
**With buffer:** 27 weeks (~6.5 months)
