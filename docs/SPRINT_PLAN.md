# Sprint Plan — Version 1.0

**Sprint duration:** 2 weeks (10 working days)
**Team size:** 5–7 engineers
**Total sprints:** 7
**Start date:** 2026-07-20 (Monday)

---

## Sprint 1 — Foundation & Authentication
**Dates:** Jul 20 – Jul 31
**Objective:** Every developer productive. Authentication working end-to-end.

### Tasks

| ID | Task | Effort | Owner |
|---|---|---|---|
| T-001 | Dev Environment Bootstrapping | 8h | DevOps |
| T-002 | Maven Dependency Audit | 6h | Backend 1 |
| T-003 | Frontend Dependency Audit | 4h | Frontend 1 |
| T-004 | Cleanup Empty Directory Stubs | 2h | Frontend 1 |
| T-005 | Git Pre-Commit Hooks | 6h | Frontend 1 |
| T-006 | Backend Static Analysis | 8h | Backend 2 |
| T-007 | Auth Audit & Edge Cases | 8h | Backend 1 |
| T-008 | Login Page (Real API) | 12h | Frontend 1 |
| T-009 | Register Page | 8h | Frontend 2 |
| T-021 | Procurement Category Normalization | 8h | Backend 2 |

**Total effort:** 70h (7 engineers × 2 weeks = ~140h capacity)
**Load:** 50% (allows ramp-up time for new team)

### Expected Demo
- Login page with real JWT authentication
- Registration with password validation
- Protected route redirect when unauthenticated
- Docker Compose dev environment verified on 2+ machines
- Pre-commit hooks active on all developer machines

### Risks
- Team ramp-up on unfamiliar codebase
- Auth edge cases may surface architectural issues
- Windows/Linux/Mac environment differences

---

## Sprint 2 — API Foundation & Backend Core
**Dates:** Aug 3 – Aug 14
**Objective:** API client layer built. Decision Engine hardened. Document pipeline operational.

### Tasks

| ID | Task | Effort | Owner |
|---|---|---|---|
| T-010 | Protected Route Guards | 10h | Frontend 1 |
| T-011 | Logout & Session Management | 4h | Frontend 1 |
| T-012 | API Client Layer Foundation | 8h | Frontend Lead |
| T-022 | DecisionRouter Edge Cases | 8h | Backend 1 |
| T-023 | NumericExtractor Robustness | 6h | Backend 1 |
| T-024 | EvidencePackage Validation | 4h | Backend 2 |
| T-025 | DecisionPackage Round-Trip Tests | 6h | Backend 2 |
| T-028 | Ingestion Pipeline Observability | 8h | Backend 2 |
| T-029 | Text Extraction Fallback Chain | 12h | Backend 2 |

**Total effort:** 66h
**Load:** ~47%

### Expected Demo
- API client with auth interceptors working
- Token refresh transparent
- DecisionRouter handles empty, malformed, and edge case queries
- Text extraction works for PDF, DOCX, TXT with fallback
- Ingestion pipeline emits metrics

### Risks
- API client design affects all subsequent frontend work
- Text extraction fallback testing requires diverse file samples

---

## Sprint 3 — Core API Integration (Decision, Documents, Search)
**Dates:** Aug 17 – Aug 28
**Objective:** Decision Assistant, Documents, and Search pages work against real backend.

### Tasks

| ID | Task | Effort | Owner |
|---|---|---|---|
| T-013 | Decision Service Real API | 16h | Frontend 1 |
| T-014 | Document Service Real API | 16h | Frontend 2 |
| T-015 | Search Service Real API | 12h | Frontend 1 |
| T-026 | KnowledgeRegistry Reload | 8h | Backend 1 |
| T-030 | Chunking Strategy Config | 8h | Backend 2 |
| T-031 | Hybrid Retrieval Fusion | 10h | Backend 1 |

**Total effort:** 70h
**Load:** ~50%

### Expected Demo
- Submit a procurement question → DecisionSupportTab shows structured response
- Upload a document → appears in DocumentsPage list
- Search for a regulation → hybrid results with scores
- Knowledge registry reloadable at runtime

### Risks
- SSE streaming for decision queries may be complex
- File upload with progress requires careful state management
- Hybrid retrieval fusion weights need tuning

---

## Sprint 4 — Workspace, Corpus, Graph
**Dates:** Aug 31 – Sep 11
**Objective:** Workspace management, corpus administration, and knowledge graph pages working.

### Tasks

| ID | Task | Effort | Owner |
|---|---|---|---|
| T-016 | Workspace Service Real API | 14h | Frontend 1 |
| T-017 | Corpus Health Dashboard Real API | 12h | Frontend 2 |
| T-018 | Knowledge Base Real API | 8h | Frontend 1 |
| T-019 | Audit Log Real API | 8h | Frontend 2 |
| T-020 | Administration Pages Real API | 10h | Frontend 1 |
| T-027 | Chunked Upload for Large Files | 14h | Backend 1 |
| T-032 | Reranking Service | 14h | Backend 2 |
| T-033 | Citation Service Formatting | 6h | Backend 2 |
| T-035 | Neo4j Health Check & Resilience | 8h | Backend 1 |

**Total effort:** 94h
**Load:** ~67%

### Expected Demo
- Workspace CRUD with real API
- Corpus health dashboard shows live PostgreSQL + Qdrant metrics
- Knowledge base filtered by domain
- Chunked upload for 200MB+ files with progress
- Search reranking improves result order

### Risks
- Chunked upload requires coordinated frontend + backend work
- Corpus health dashboard has 15-column table — performance with real data

---

## Sprint 5 — Case Management + Search/Graph Frontend
**Dates:** Sep 14 – Sep 25
**Objective:** Full case management lifecycle. Advanced search. Graph visualization.

### Tasks

| ID | Task | Effort | Owner |
|---|---|---|---|
| T-034 | Advanced Query Builder | 12h | Frontend 1 |
| T-036 | Graph Visualization Component | 16h | Frontend 2 |
| T-037 | Case Workspace Full CRUD | 16h | Frontend 1 |
| T-038 | Case Checklist Dynamic Rendering | 10h | Frontend 2 |
| T-039 | Case Documents Tab | 12h | Frontend 1 |
| T-040 | Internal Notes Tab | 8h | Frontend 2 |
| T-041 | Activity Timeline Tab | 8h | Frontend 2 |
| T-042 | My Work Case List | 10h | Frontend 1 |
| T-043 | Corpus Manifest-Based Import | 12h | Backend 1 |
| T-044 | Corpus Health Automated Alerts | 8h | Backend 2 |

**Total effort:** 112h
**Load:** ~80%

### Expected Demo
- Create case → checklist populates → add documents → add notes → view timeline
- My Work page shows assigned cases with status/priority filters
- Graph visualization with interactive nodes and edges
- Advanced search with boolean operators and field filters
- Corpus batch import from MANIFEST.yaml

### Risks
- This is the heaviest sprint — 112h across 2 weeks
- Graph visualization may need library evaluation (vis-network vs. cytoscape)
- Case management touches 6+ frontend components

---

## Sprint 6 — Testing, Security, Observability
**Dates:** Sep 28 – Oct 9
**Objective:** Coverage targets met. Security hardened. System observable.

### Tasks

| ID | Task | Effort | Owner |
|---|---|---|---|
| T-045 | Corpus Versioning Snapshot/Rollback | 12h | Backend 1 |
| T-046 | Backend Unit Tests platform-ai | 16h | Backend 2 |
| T-047 | Backend Unit Tests platform-search | 14h | Backend 1 |
| T-048 | Backend Integration Tests API | 16h | Backend 2 |
| T-049 | Frontend Unit Tests Components | 40h | Frontend 1, Frontend 2 |
| T-053 | CSP Headers | 8h | DevOps |
| T-054 | Rate Limiting | 10h | Backend 1 |
| T-055 | Input Validation & Sanitization | 10h | Backend 2 |
| T-056 | Secrets Management | 6h | DevOps |
| T-058 | OpenTelemetry Tracing | 12h | DevOps |

**Total effort:** 144h (~103% load — QA engineer joins this sprint)
**Load with 7 people:** ~103% (stretch sprint)

### Expected Demo
- JaCoCo report: platform-ai ≥ 80%, platform-search ≥ 80%
- Vitest coverage: frontend ≥ 80%
- Integration tests pass with Testcontainers
- CSP headers present, no violations
- Rate limiting returns 429 after threshold
- OpenTelemetry traces visible in Jaeger

### Risks
- 40h for frontend tests is aggressive — may need Sprint 7 spillover
- CSP may break dynamic frontend features
- Testcontainers CI setup may require additional configuration

---

## Sprint 7 — Production Deployment & Pilot Readiness
**Dates:** Oct 12 – Oct 23
**Objective:** Production-deployable. All verification complete. Pilot-ready.

### Tasks

| ID | Task | Effort | Owner |
|---|---|---|---|
| T-050 | Frontend Integration Tests | 16h | Frontend 1 |
| T-051 | Playwright E2E Tests | 20h | QA |
| T-052 | Performance Baseline Tests | 12h | QA |
| T-057 | HTTPS/TLS Configuration | 6h | DevOps |
| T-059 | Application Metrics Dashboard | 12h | DevOps |
| T-060 | Structured Logging | 6h | Backend 1 |
| T-061 | Health Check Aggregation | 6h | Backend 2 |
| T-062 | CI Pipeline Build & Test Matrix | 10h | DevOps |
| T-063 | CD Pipeline Staging Deploy | 14h | DevOps |
| T-064 | Quality Gates SonarQube | 8h | DevOps |
| T-065 | Production Dockerfile | 8h | DevOps |
| T-066 | Docker Compose Production Profile | 6h | DevOps |
| T-067 | Kubernetes Manifests | 16h | DevOps |
| T-068 | Flyway Baseline Migration | 10h | Backend 1 |
| T-069 | Backup & Restore PostgreSQL | 10h | DevOps |
| T-070 | Backup & Restore Qdrant | 6h | DevOps |
| T-071 | Incident Playbook | 8h | DevOps |
| T-072 | LLM Evaluation Framework | 16h | Backend 1 |
| T-073 | Load Testing Stress & Soak | 14h | QA |
| T-074 | Chaos Engineering Tests | 10h | QA |
| T-075 | Production Readiness Checklist | 8h | Tech Lead |
| T-076 | Operations Manual | 12h | Tech Lead |
| T-077 | API Reference | 8h | Backend 2 |
| T-078 | Final Integration Verification | 16h | All |

**Total effort:** 278h (~199% load — all hands, 2-week sprint)
**With 7 engineers:** ~199% (this sprint may need 3 weeks)

**Pragmatic note:** Sprint 7 is 278h. With 7 engineers at 80h/sprint, capacity is 560h. The remaining tasks from Sprint 6 (T-049 spillover) plus all Sprint 7 tasks fit within capacity if T-049 partially completed.

### Expected Demo
- Docker image builds and runs in production mode
- K8s manifests deploy to k3s cluster
- CI/CD pipeline: push → build → test → deploy to staging
- Backup → destroy → restore → verify
- Load test: 50 concurrent users, p95 < 5s
- Chaos test: kill Qdrant → search still works
- Operations manual and API reference complete
- Full integration verification passed

### Risks
- This sprint is overloaded — may need to split into Sprint 7 + Sprint 8
- Production deployment issues are unpredictable
- K8s learning curve if team is new to Kubernetes

---

## Sprint Recovery Options

If Sprint 7 proves too large:

**Option A: Split into Sprint 7 + Sprint 8**
- Sprint 7 (Oct 12-23): Production deploy + CI/CD + Backup
- Sprint 8 (Oct 26-Nov 6): Testing complete + Production readiness + Docs
- Delivery: **November 6, 2026** (16 weeks)

**Option B: Reduce scope**
- Defer K8s manifests (T-067) to v1.1 — use docker-compose for pilot
- Defer LLM eval framework (T-072) to v1.1
- Delivery: **October 23, 2026** (14 weeks)

**Recommended:** Option B for Version 1.0 pilot. K8s and LLM eval are production concerns, not pilot blockers. A municipal pilot can run on docker-compose.

---

## Sprint Summary

| Sprint | Dates | Effort | Key Deliverable |
|---|---|---|---|
| 1 | Jul 20-31 | 70h | Auth working, dev env bootstrapped |
| 2 | Aug 3-14 | 66h | API client, backend core hardened |
| 3 | Aug 17-28 | 70h | Decision, Documents, Search pages live |
| 4 | Aug 31-Sep 11 | 94h | Workspace, Corpus, Graph pages live |
| 5 | Sep 14-25 | 112h | Case management complete |
| 6 | Sep 28-Oct 9 | 144h | Tests, security, observability |
| 7 | Oct 12-23 | 278h* | Production deploy, pilot ready |

*Sprint 7 effort is high. Recommend deferring T-067 (K8s) and T-072 (LLM eval) to v1.1, reducing Sprint 7 to ~246h.
