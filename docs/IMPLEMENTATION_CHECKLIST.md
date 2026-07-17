# Implementation Checklist — Version 1.0

**Purpose:** Master verification checklist. Every item must be checked before Version 1.0 ships.
**Last updated:** 2026-07-17

---

## 1. Platform Foundation

- [ ] T-001: Fresh clone → `docker-compose up` → all services healthy
- [ ] T-001: `mvn clean install` passes all 9 modules
- [ ] T-001: `npm install && npm run dev` serves frontend
- [ ] T-001: `DEVELOPER_SETUP.md` committed with exact commands
- [ ] T-002: Parent POM `<dependencyManagement>` covers all modules
- [ ] T-002: `mvn dependency:analyze` reports zero unused declared dependencies
- [ ] T-002: OWASP dependency check passes (0 critical/high CVEs)
- [ ] T-003: `package.json` uses exact versions (no `^` or `~`)
- [ ] T-003: `npm audit` returns 0 critical/high
- [ ] T-003: `npm run build` produces production bundle without warnings
- [ ] T-004: 6 empty directory stubs removed
- [ ] T-004: `tsc --noEmit` passes after removal
- [ ] T-005: `git commit` triggers lint-staged (Prettier + ESLint)
- [ ] T-005: Commit blocked on ESLint errors
- [ ] T-006: SpotBugs runs in `mvn verify`
- [ ] T-006: Checkstyle runs in `mvn verify`
- [ ] T-006: 0 high-priority SpotBugs warnings
- [ ] T-006: Checkstyle passes with configured rules

## 2. Authentication

- [ ] T-007: Expired access token returns 401 with clear error
- [ ] T-007: Malformed token returns 401 (not 500)
- [ ] T-007: Refresh token rotation invalidates old refresh token
- [ ] T-007: Logout invalidates refresh token
- [ ] T-007: Concurrent refresh requests handled safely
- [ ] T-008: `/login` route renders login form
- [ ] T-008: Form validates email format and password presence
- [ ] T-008: Successful login stores tokens in memory, redirects to `/home`
- [ ] T-008: Failed login displays API error message
- [ ] T-008: Loading state during authentication request
- [ ] T-009: `/register` route renders registration form
- [ ] T-009: Password strength indicator visible
- [ ] T-009: Successful registration redirects to `/login` with success message
- [ ] T-009: API errors displayed on registration failure
- [ ] T-010: Unauthenticated users redirected to `/login`
- [ ] T-010: Expired access token triggers silent refresh
- [ ] T-010: 401 from any API call redirects to `/login`
- [ ] T-010: Token stored in memory only (verify: no localStorage access)
- [ ] T-011: Logout button visible in navigation
- [ ] T-011: Logout calls `/api/auth/logout` with refresh token
- [ ] T-011: Tokens cleared from memory on logout
- [ ] T-011: Redirect to `/login` after logout

## 3. API Integration

- [ ] T-012: API client configured with `VITE_API_BASE_URL` env var
- [ ] T-012: Auth header automatically attached from in-memory token
- [ ] T-012: 401 responses trigger auth redirect
- [ ] T-012: All responses normalized to typed interfaces
- [ ] T-012: Request timeout handling with retry logic
- [ ] T-013: Decision question POSTs to `/api/ai/decision`
- [ ] T-013: SSE stream parsed for progressive results
- [ ] T-013: RULE_ENGINE decisions display structured values
- [ ] T-013: HYBRID_RETRIEVAL decisions display evidence items and citations
- [ ] T-013: ConfidenceBar reflects API confidence value
- [ ] T-013: Error state for timeout or API failure
- [ ] T-013: Loading state during inference (5-60s)
- [ ] T-014: DocumentsPage fetches from `/api/documents` with pagination
- [ ] T-014: Filter dropdowns call API with query params
- [ ] T-014: Document upload POSTs multipart to `/api/documents/upload`
- [ ] T-014: Upload progress bar shown for large files
- [ ] T-014: Document viewer fetches content from `/api/documents/{id}`
- [ ] T-014: Ingestion status reflected in document table
- [ ] T-015: SearchBar submits query to `/api/search`
- [ ] T-015: Results rendered as ResultCard list with scores
- [ ] T-015: FilterPanel filters by type, domain, date
- [ ] T-015: SearchSummary shows hit count and query time
- [ ] T-015: Empty state when no results
- [ ] T-016: Workspace list fetches from `/api/workspaces`
- [ ] T-016: Create workspace wizard POSTs to `/api/workspaces`
- [ ] T-016: Workspace detail shows timeline from API
- [ ] T-016: Error handling for duplicate names
- [ ] T-017: CorpusPage fetches from `/api/admin/corpus-health`
- [ ] T-017: Summary stat cards show live values
- [ ] T-017: Warnings displayed per document
- [ ] T-017: Health table with 15 columns populated from API
- [ ] T-018: KnowledgePage fetches regulation documents from API
- [ ] T-018: Grouped by legal domain (building, procurement, HR)
- [ ] T-018: Filter by document type, status, authority
- [ ] T-019: Audit page fetches from `/api/audit`
- [ ] T-019: Paginated table with event type, user, timestamp
- [ ] T-019: Filter by event type, user, date range
- [ ] T-020: AdministrationPage shows admin tool grid
- [ ] T-020: UsersPage lists users from `/api/admin/users`
- [ ] T-020: Admin-only access enforced

## 4. Decision Engine

- [ ] T-021: All VgV/DVO categories map to correct parent category
- [ ] T-021: IT-Dienstleistung → Lieferung/Dienstleistung
- [ ] T-021: All Bauleistung subtypes resolve correctly
- [ ] T-021: Unknown categories default to Lieferung/Dienstleistung with warning
- [ ] T-021: 100% branch coverage on `normalizeCategory()`
- [ ] T-022: Empty question → graceful error (not NPE)
- [ ] T-022: Question > 5000 chars → truncated with warning
- [ ] T-022: Multi-category question → routes to first match or ambiguity signal
- [ ] T-022: German special characters handled correctly
- [ ] T-022: Null question → IllegalArgumentException
- [ ] T-023: `1.234,56 €` → 1234.56
- [ ] T-023: `5.000 - 10.000 Euro` → [5000.0, 10000.0]
- [ ] T-023: Null input → empty result (not NPE)
- [ ] T-024: Null items → defensive copy to empty list
- [ ] T-024: Negative counts → clamped to 0
- [ ] T-024: `hasInsufficientEvidence` consistent with `coverageStatus`
- [ ] T-025: All DTOs serialize → deserialize without data loss
- [ ] T-025: Missing optional fields handled correctly
- [ ] T-025: Enum values case-insensitive on deserialization
- [ ] T-025: Unknown JSON fields ignored
- [ ] T-026: `POST /api/admin/knowledge/reload` triggers registry reload
- [ ] T-026: Reload is atomic (no partial updates)
- [ ] T-026: Reload failure leaves existing data intact

## 5. Document Pipeline

- [ ] T-027: Files > 100MB split into 10MB chunks client-side
- [ ] T-027: Chunks uploaded sequentially with progress
- [ ] T-027: Backend reassembles and verifies checksum
- [ ] T-027: Failed chunk retried (max 3 attempts)
- [ ] T-028: Each ingestion phase emits Micrometer timer metric
- [ ] T-028: Document-level metrics: extraction_ms, chunk_count, embedding_ms, index_ms
- [ ] T-028: Pipeline-level metrics: documents_ingested_total, ingestion_errors_total
- [ ] T-029: PDF extraction: PDFBox → Tika fallback
- [ ] T-029: DOCX extraction: POI → Tika fallback
- [ ] T-029: Extraction failure returns partial text with error metadata
- [ ] T-030: Configurable chunk size, overlap, strategy
- [ ] T-030: Changes take effect on next ingestion

## 6. Search & Retrieval

- [ ] T-031: Keyword search via PostgreSQL full-text with ts_rank
- [ ] T-031: Vector search via Qdrant with cosine similarity
- [ ] T-031: Fusion combines results with configurable weight
- [ ] T-031: Duplicate documents deduplicated
- [ ] T-031: Performance under 500ms for 10K documents
- [ ] T-032: Reranker re-orders top-N results by relevance
- [ ] T-032: Configurable top-n and final-n
- [ ] T-032: Reranker unavailable → return original order
- [ ] T-033: German legal citation format: "§ [number] [title], [authority], [date]"
- [ ] T-033: Multiple citations from same document grouped
- [ ] T-033: Citation links to document viewer with chunk anchor
- [ ] T-034: Boolean operators (AND, OR, NOT)
- [ ] T-034: Field-specific search (title:, authority:, domain:)
- [ ] T-034: Date range filter
- [ ] T-034: Query preview showing constructed search

## 7. Knowledge Graph

- [ ] T-035: Neo4j health indicator in `/actuator/health`
- [ ] T-035: Circuit breaker opens after 3 consecutive failures
- [ ] T-035: Graph enrichment skipped when circuit is open
- [ ] T-035: Search results not degraded by graph unavailability
- [ ] T-036: Graph page fetches nodes and edges from `/api/graph`
- [ ] T-036: Nodes rendered as labeled circles (color-coded by type)
- [ ] T-036: Edges show relationship type on hover
- [ ] T-036: Click node → detail panel
- [ ] T-036: Zoom, pan, and layout controls
- [ ] T-036: 500 nodes rendered without lag

## 8. Workspace & Case Management

- [ ] T-037: Create case wizard: workspace + metadata → POST
- [ ] T-037: Case list: paginated, filterable by status, assignee, priority
- [ ] T-037: Case header: number, title, citizen, assignee, status, deadline, priority
- [ ] T-037: Case tabs switch without page navigation
- [ ] T-038: ChecklistTab fetches dynamic checklist from API
- [ ] T-038: Check/uncheck persists via PUT
- [ ] T-038: Progress bar shows completion percentage
- [ ] T-039: DocumentsTab shows only case-scoped documents
- [ ] T-039: Upload attaches document to case
- [ ] T-039: Version history for case documents
- [ ] T-040: InternalNotesTab shows timestamped notes
- [ ] T-040: CRUD operations via API
- [ ] T-040: Notes sorted by most recent first
- [ ] T-041: ActivityTab shows chronological event list
- [ ] T-041: Events grouped by date with type icons
- [ ] T-041: Auto-refresh every 30s or via SSE
- [ ] T-042: `/work` shows assigned cases in paginated table
- [ ] T-042: Status, priority, overdue filters
- [ ] T-042: Click case → navigate to `/work/{caseId}`

## 9. Corpus Administration

- [ ] T-043: Batch import reads MANIFEST.yaml entries
- [ ] T-043: Each document: create → extract → chunk → embed → index
- [ ] T-043: Failed documents don't block the batch
- [ ] T-043: Summary report after completion
- [ ] T-044: Background health check runs every hour
- [ ] T-044: Alert when embedding coverage < 90%
- [ ] T-044: Alert when chunks missing Qdrant vectors
- [ ] T-045: `POST /api/admin/corpus/snapshot` creates named snapshot
- [ ] T-045: `GET /api/admin/corpus/snapshots` lists available snapshots
- [ ] T-045: `POST /api/admin/corpus/rollback/{id}` reverts to snapshot

## 10. Testing

- [ ] T-046: RuleEngine: 100% coverage of all lookup paths
- [ ] T-046: DomainClassifier: all domain combinations covered
- [ ] T-046: JaCoCo ≥ 80% for platform-ai
- [ ] T-047: HybridRetrievalService: fusion, deduplication, edge cases
- [ ] T-047: JaCoCo ≥ 80% for platform-search
- [ ] T-048: Auth flow integration test: register → login → refresh → logout
- [ ] T-048: Document CRUD integration test
- [ ] T-048: Search integration test
- [ ] T-048: Workspace CRUD integration test
- [ ] T-048: Decision query integration test
- [ ] T-048: Error responses tested (400, 401, 404, 500)
- [ ] T-048: All tests use Testcontainers
- [ ] T-049: Every reusable component has at least one test
- [ ] T-049: Page components tested for loading, empty, error, populated states
- [ ] T-049: Vitest coverage ≥ 80% line coverage
- [ ] T-050: Login flow integration test
- [ ] T-050: Case workspace flow integration test
- [ ] T-050: Decision flow integration test
- [ ] T-050: Error flow integration test
- [ ] T-051: 10 E2E test scenarios pass
- [ ] T-051: Login → register → login
- [ ] T-051: Upload document → verify in list → open viewer
- [ ] T-051: Submit decision query → verify structured response
- [ ] T-051: Create case → add note → verify in timeline
- [ ] T-051: Admin: corpus health dashboard with data
- [ ] T-052: k6 scripts for 5 scenarios
- [ ] T-052: Baseline metrics documented
- [ ] T-052: Performance tests run in CI (non-blocking)

## 11. Security

- [ ] T-053: CSP header present on all responses
- [ ] T-053: `script-src 'self'` only (no 'unsafe-inline')
- [ ] T-053: CSP violation reports sent to `/api/csp-report`
- [ ] T-053: Zero CSP violations in production build
- [ ] T-054: Login: 5 attempts/minute/IP → 429 with Retry-After
- [ ] T-054: Decision query: 10/minute/user → 429
- [ ] T-054: Document upload: 20/hour/user → 429
- [ ] T-055: All request DTOs have validation annotations
- [ ] T-055: Error messages in German
- [ ] T-055: XSS filter on all text inputs
- [ ] T-055: SQL injection test suite passes
- [ ] T-056: Zero secrets in committed files
- [ ] T-056: All secrets loaded from environment variables
- [ ] T-056: `.env.example` committed, `.env` in `.gitignore`
- [ ] T-057: HTTPS listener on port 8443
- [ ] T-057: HTTP → HTTPS redirect
- [ ] T-057: HSTS header with max-age=31536000

## 12. Observability

- [ ] T-058: All HTTP requests traced with span
- [ ] T-058: Database queries traced
- [ ] T-058: External calls (Qdrant, Neo4j, Ollama) traced
- [ ] T-058: Trace ID in log pattern
- [ ] T-058: Traces exportable to Jaeger
- [ ] T-059: Grafana dashboard with request rate, error rate, latency
- [ ] T-059: Dashboard JSON committed to repo
- [ ] T-059: Alert thresholds configured
- [ ] T-060: JSON log format in production profile
- [ ] T-060: Trace ID and span ID in every log line
- [ ] T-060: User ID in logs when authenticated
- [ ] T-061: Health endpoint shows all components
- [ ] T-061: DEGRADED when optional service is down
- [ ] T-061: UP only when all critical services up

## 13. CI/CD

- [ ] T-062: Pipeline: backend-build, backend-test, frontend-build, frontend-test, e2e
- [ ] T-062: Coverage reports uploaded as artifacts
- [ ] T-062: Failed tests block merge
- [ ] T-062: Pipeline completes in < 15 minutes
- [ ] T-063: Merge to master → build Docker image → push to registry
- [ ] T-063: Deploy to staging server
- [ ] T-063: Smoke tests after deploy
- [ ] T-063: Rollback on smoke test failure
- [ ] T-064: SonarQube analysis in CI
- [ ] T-064: Quality gate: 0 bugs, 0 vulnerabilities, < 3% code smells
- [ ] T-064: Quality gate status reported on PR

## 14. Production Deployment

- [ ] T-065: Multi-stage Dockerfile: build → runtime
- [ ] T-065: Runtime image: eclipse-temurin:21-jre-alpine
- [ ] T-065: Non-root user `appuser`
- [ ] T-065: HEALTHCHECK instruction
- [ ] T-065: Image size < 400MB
- [ ] T-066: Production docker-compose starts all services
- [ ] T-066: Only app port 8080 exposed
- [ ] T-066: Memory limits on each service
- [ ] T-067: Deployment: 2 replicas with resource requests/limits
- [ ] T-067: Service: ClusterIP on port 8080
- [ ] T-067: ConfigMap + Secret for configuration
- [ ] T-067: Ingress with TLS termination
- [ ] T-067: Readiness and liveness probes
- [ ] T-067: Deployed and verified on k3s
- [ ] T-068: `V1__baseline.sql` captures current schema
- [ ] T-068: Flyway enabled, `ddl-auto: validate`
- [ ] T-068: Migration tested on fresh database
- [ ] T-069: `pg_dump` scheduled daily
- [ ] T-069: WAL archiving configured
- [ ] T-069: Restore procedure tested: backup → restore → verify
- [ ] T-069: Backup retention: 7 daily, 4 weekly
- [ ] T-070: Qdrant snapshot via API
- [ ] T-070: Snapshot stored alongside PostgreSQL backup
- [ ] T-070: Restore tested: snapshot → delete → restore → verify
- [ ] T-071: Incident playbook covers 8 scenarios
- [ ] T-071: Each scenario: symptoms → diagnosis → mitigation → resolution

## 15. Production Readiness

- [ ] T-072: Eval framework with grounding, faithfulness, relevance, completeness
- [ ] T-072: Eval dataset: 20 German municipal questions
- [ ] T-072: Eval runner produces comparable scores
- [ ] T-073: Smoke test: all endpoints under 1 concurrent user
- [ ] T-073: Average load: p95 < 5s for decision queries
- [ ] T-073: Stress test: no crashes at 100 concurrent
- [ ] T-073: Soak test: no memory leaks over 1 hour
- [ ] T-074: Qdrant down: keyword search works, vector returns warning
- [ ] T-074: Neo4j down: graph shows "nicht verfügbar"
- [ ] T-074: Ollama down: no 500 errors, fallback responses
- [ ] T-074: All failures logged clearly
- [ ] T-074: Recovery automatic when service returns
- [ ] T-075: All 50+ production readiness items verified
- [ ] T-075: Gaps documented with remediation plan
- [ ] T-076: Architecture diagram with all services
- [ ] T-076: Startup and shutdown procedures
- [ ] T-076: Monitoring dashboard locations
- [ ] T-076: Troubleshooting guide for 10 common issues
- [ ] T-077: All endpoints documented with method, path, auth, examples
- [ ] T-077: Error response format documented
- [ ] T-077: Rate limit information included
- [ ] T-078: Production-like environment deployed
- [ ] T-078: All user workflows pass
- [ ] T-078: All admin workflows pass
- [ ] T-078: Zero critical or high bugs
- [ ] T-078: Performance within baseline
- [ ] T-078: Integration verification report complete

---

## Verification Gates

### Gate 1: Sprint 1 Complete (End of Week 2)
- [ ] Dev environment bootstrapped on 2+ machines
- [ ] Login/Register pages functional with real API
- [ ] Pre-commit hooks active on all developer machines
- [ ] Static analysis passing

### Gate 2: Backend Core Hardened (End of Week 4)
- [ ] All procurement categories normalize correctly
- [ ] DecisionRouter edge case tests pass
- [ ] Text extraction fallback chain tested
- [ ] Ingestion pipeline metrics visible

### Gate 3: API Integration Complete (End of Week 6)
- [ ] All frontend pages display real data
- [ ] No mock service imports in production code
- [ ] Error and loading states on every page
- [ ] SSE decision queries working

### Gate 4: Search & Case Management (End of Week 8)
- [ ] Hybrid search returns fused results
- [ ] Graph visualization renders Neo4j data
- [ ] Case creation → tabs → workflow complete
- [ ] Corpus batch import succeeds

### Gate 5: Tests & Security (End of Week 10)
- [ ] JaCoCo ≥ 80% backend
- [ ] Vitest ≥ 80% frontend
- [ ] 10 E2E scenarios pass
- [ ] CSP headers deployed, zero violations
- [ ] Rate limiting active

### Gate 6: Production Ready (End of Week 12)
- [ ] Docker image builds and runs
- [ ] Backup → destroy → restore → verify
- [ ] Flyway migrations tested
- [ ] CI/CD pipeline operational
- [ ] Operations manual complete

### Gate 7: Pilot Ready (End of Week 14)
- [ ] All production readiness items verified
- [ ] Load tests passed
- [ ] Chaos tests passed
- [ ] API reference complete
- [ ] Final integration verification passed

---

## Checklist Summary

| Section | Items | Critical Items |
|---|---|---|
| 1. Platform Foundation | 18 | T-001, T-002 |
| 2. Authentication | 20 | T-007, T-008, T-010 |
| 3. API Integration | 30 | T-012, T-013, T-014 |
| 4. Decision Engine | 20 | T-021, T-022 |
| 5. Document Pipeline | 12 | T-027, T-029 |
| 6. Search & Retrieval | 16 | T-031 |
| 7. Knowledge Graph | 12 | T-035 |
| 8. Case Management | 24 | T-037 |
| 9. Corpus Administration | 12 | T-043 |
| 10. Testing | 28 | T-046, T-049, T-051 |
| 11. Security | 20 | T-053, T-054 |
| 12. Observability | 16 | T-058 |
| 13. CI/CD | 12 | T-062 |
| 14. Production Deployment | 28 | T-065, T-068 |
| 15. Production Readiness | 28 | T-078 |
| **Total** | **296** | |

---

## Sign-off

- [ ] Technical Lead: _________________ Date: ________
- [ ] Backend Lead: _________________ Date: ________
- [ ] Frontend Lead: _________________ Date: ________
- [ ] DevOps Lead: _________________ Date: ________
- [ ] QA Lead: _________________ Date: ________

**Version 1.0 ships when all 296 items are checked and all 7 gates are green.**
