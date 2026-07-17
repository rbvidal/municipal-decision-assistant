# Implementation Roadmap — Version 1.0

**Status:** Architecture FROZEN (v1.0-architecture-complete)
**Date:** 2026-07-17
**Total Tasks:** 78
**Total Effort:** ~814 engineering hours

---

## Milestones

### M1 — Platform Bootable (Week 1-2)
**Goal:** Any engineer can clone, build, and run the entire system locally.
**Tasks:** T-001 through T-006
**Effort:** 34h
**Acceptance criteria:**
- `docker-compose up` → all 5 services healthy
- `mvn clean install` → 0 failures
- `npm install && npm run dev` → frontend on localhost:5173
- Pre-commit hooks active
- Static analysis passing

### M2 — Authentication Complete (Week 2-4)
**Goal:** Users can register, login, and access protected routes. JWT lifecycle fully functional.
**Tasks:** T-007 through T-011
**Effort:** 42h
**Acceptance criteria:**
- Login page with real API
- Registration with validation
- Protected routes redirect unauthenticated users
- Token refresh transparent
- Logout invalidates tokens

### M3 — Backend Core Hardened (Week 2-4)
**Goal:** Decision Engine edge cases covered, DTOs validated, extraction robust.
**Tasks:** T-021 through T-026, T-028 through T-030
**Effort:** 82h
**Acceptance criteria:**
- All procurement categories normalize correctly
- DecisionRouter handles all edge cases
- NumericExtractor parses all German formats
- Document pipeline metrics exposed
- Text extraction fallback chain working

### M4 — API Integration Complete (Week 3-6)
**Goal:** All frontend pages call real backend APIs. Mock services fully replaced.
**Tasks:** T-012 through T-020
**Effort:** 104h
**Acceptance criteria:**
- API client layer with auth, error handling, retry
- Decision, Document, Search, Workspace services calling real endpoints
- Corpus health dashboard with live data
- All pages display real data or meaningful empty/error states

### M5 — Search & Graph Operational (Week 5-7)
**Goal:** Hybrid search returns fused keyword+vector results. Knowledge graph viewable.
**Tasks:** T-031 through T-036
**Effort:** 66h
**Acceptance criteria:**
- Hybrid search with deduplication and fusion
- Reranking improves result quality
- Graph visualization component renders Neo4j data
- Graceful degradation when Qdrant or Neo4j unavailable

### M6 — Case Management Complete (Week 6-8)
**Goal:** Full case lifecycle: create → work → complete. All tabs functional.
**Tasks:** T-037 through T-042
**Effort:** 64h
**Acceptance criteria:**
- Case CRUD with real API
- Checklist, Documents, Notes, Activity tabs all working
- My Work page shows assigned cases
- Case header with correct metadata

### M7 — Corpus Administration Operational (Week 7-8)
**Goal:** Batch import, health monitoring, versioning all working.
**Tasks:** T-043 through T-045
**Effort:** 32h
**Acceptance criteria:**
- Manifest-based batch import succeeds
- Health alerts fire on threshold violations
- Snapshot and rollback tested

### M8 — Test Coverage Met (Week 7-10)
**Goal:** 80%+ coverage across backend and frontend.
**Tasks:** T-046 through T-052
**Effort:** 134h
**Acceptance criteria:**
- Backend JaCoCo ≥ 80% line coverage
- Frontend Vitest ≥ 80% line coverage
- Integration tests pass with Testcontainers
- E2E tests pass against docker-compose
- Performance baseline established

### M9 — Security Hardened (Week 8-9)
**Goal:** Production security posture. CSP, rate limiting, HTTPS, secrets managed.
**Tasks:** T-053 through T-057
**Effort:** 40h
**Acceptance criteria:**
- CSP headers on all responses (zero violations)
- Rate limiting on critical endpoints
- Input validation on all DTOs
- Zero secrets in committed files
- HTTPS configured

### M10 — System Observable (Week 8-10)
**Goal:** Full observability stack: traces, metrics, structured logs, dashboards.
**Tasks:** T-058 through T-061
**Effort:** 36h
**Acceptance criteria:**
- OpenTelemetry traces across all services
- Grafana dashboard with key metrics
- JSON structured logs in production
- Health check aggregation with DEGRADED states

### M11 — CI/CD Operational (Week 9-11)
**Goal:** Automated pipeline from commit to staging deploy with quality gates.
**Tasks:** T-062 through T-064
**Effort:** 32h
**Acceptance criteria:**
- CI runs on every push: build, test, coverage, lint
- CD deploys to staging on merge to master
- Quality gates block merge on failure

### M12 — Production Deployable (Week 10-12)
**Goal:** Docker images, K8s manifests, database migrations, backup/restore all ready.
**Tasks:** T-065 through T-071
**Effort:** 64h
**Acceptance criteria:**
- Multi-stage Dockerfile builds and runs
- K8s manifests deploy to k3s
- Flyway migrations on production DB
- Backup and restore tested end-to-end
- Incident playbook complete

### M13 — Pilot Ready (Week 12-14)
**Goal:** All production readiness verification complete. System ready for municipal pilot.
**Tasks:** T-072 through T-078
**Effort:** 84h
**Acceptance criteria:**
- LLM eval framework operational
- Load tests passed (stress + soak)
- Chaos tests verify graceful degradation
- Operations manual complete
- API reference published
- Full integration verification passed

---

## Timeline Estimate

```
Week 1-2:  ████ M1 (Platform Bootable) + M2 (Auth) + M3 (Backend Core) begin
Week 3-4:  ████ M2 + M3 complete, M4 (API Integration) starts
Week 5-6:  ████ M4 continues, M5 (Search/Graph) starts, M6 (Case Mgmt) starts
Week 7-8:  ████ M4 complete, M5 complete, M6 complete, M7 (Corpus) complete
Week 8-9:  ████ M8 (Testing) continues, M9 (Security), M10 (Observability)
Week 9-10: ████ M8 continues, M11 (CI/CD)
Week 10-12:████ M8 complete, M12 (Production Deploy)
Week 12-14:████ M13 (Pilot Ready)
```

**Critical path duration:** 14 weeks
**Expected delivery:** 14 October 2026 (14 weeks from July 17)

---

## Critical Path

The tasks that block the largest number of later tasks:

| Task | Blocks | Why Critical |
|---|---|---|
| **T-001** (Dev Environment) | 77 tasks | Everything depends on buildable codebase |
| **T-002** (Maven Audit) | 5+ backend tasks | Dependency management affects all modules |
| **T-007** (Auth Audit) | T-008 through T-011, T-012 | Auth is the gateway to all API work |
| **T-012** (API Client Layer) | T-013 through T-020 (8 tasks) | Every frontend integration depends on the API client |
| **T-037** (Case CRUD) | T-038 through T-042 (5 tasks) | Case workspace foundation |
| **T-046** (Backend Tests) | T-062 (CI), T-064 (Quality Gates) | Coverage gates block CI completion |
| **T-049** (Frontend Tests) | T-050, T-051, T-062 | Coverage gates block CI completion |
| **T-065** (Production Dockerfile) | T-066, T-067, T-069, T-070, T-073 | Deployment foundation |
| **T-068** (Flyway Baseline) | T-069, T-063 | Database migration prerequisite |

---

## Recommended Team Composition

| Role | Count | Assignments |
|---|---|---|
| **Technical Lead** | 1 | Architecture oversight, code review, critical path tasks |
| **Backend Engineer** | 2 | platform-ai, platform-search, platform-document, platform-neo4j, platform-api |
| **Frontend Engineer** | 2 | All frontend pages, components, API integration |
| **DevOps Engineer** | 1 | Docker, K8s, CI/CD, observability, backup/restore |
| **QA Engineer** | 1 | Test framework, E2E tests, performance tests, load tests |
| **Total** | **7** | |

With 7 engineers, parallelization reduces calendar time from 24 weeks (solo) to 14 weeks.

---

## Risk-Adjusted Timeline

| Scenario | Duration | Probability |
|---|---|---|
| Best case (no blockers) | 12 weeks | 15% |
| Expected (some rework) | 14 weeks | 60% |
| Pessimistic (major integration issues) | 18 weeks | 20% |
| Worst case (architecture change needed) | 24+ weeks | 5% |

**Recommended commitment:** 16 weeks buffer (early November 2026) for stakeholder communication.

---

## Version 1.0 Delivery Estimate

- **Engineering effort:** 680–880 hours
- **Critical path:** 14 weeks
- **Team size:** 5–7 engineers
- **Calendar time (7 engineers):** 14 weeks
- **Delivery target:** October 2026
- **Confidence:** Medium-High (architecture is frozen, all interfaces defined)

---

## First Implementation Task

**T-001: Local Development Environment Bootstrapping**

**Why this is the optimal starting point:**

1. **Unblocks everyone.** Without a verified development environment, no other task can proceed. Every engineer must be able to `clone → build → run` before they can contribute.

2. **Reveals hidden issues.** This task forces validation of every dependency version, every service configuration, and every build step. Issues found here prevent days of debugging later.

3. **Establishes quality baseline.** Pre-commit hooks (T-005), static analysis (T-006), and dependency audits (T-002, T-003) set the quality standard from day one.

4. **No dependencies.** This task depends on nothing except the existing codebase. It can start immediately, requires no design decisions, and produces immediate value.

5. **One engineer, one day.** This task is scoped to a single experienced engineer in a single day. It provides an immediate win and proves the development workflow.

**Specific actions for T-001:**
```bash
git clone <repo>
cd municipal-decision-assistant
docker-compose up -d          # PostgreSQL + pgAdmin + Qdrant + Neo4j
docker-compose ps              # Verify all healthy
mvn clean install              # Build all 9 modules
cd frontend && npm install && npm run dev  # Start frontend
# Verify: http://localhost:5173 shows frontend
# Verify: http://localhost:8080/actuator/health returns UP
```

If these commands don't work on a clean machine, T-001 is not complete.
