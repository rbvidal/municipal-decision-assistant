# Critical Path Analysis — Version 1.0

**Date:** 2026-07-17

---

## Dependency Graph

```
Level 0 (No dependencies — can start immediately):
  T-001  Dev Environment
  T-002  Maven Audit
  T-003  Frontend Audit
  T-004  Cleanup Stubs
  T-021  Procurement Categories
  T-023  NumericExtractor
  T-024  EvidencePackage
  T-028  Ingestion Observability

Level 1 (Depends on Level 0):
  T-005  Pre-commit Hooks       ← T-003
  T-006  Static Analysis        ← T-002
  T-007  Auth Audit             ← T-002
  T-022  DecisionRouter Edges   ← T-021
  T-029  Text Extraction        ← T-028
  T-030  Chunking Config        ← T-028
  T-025  DecisionPackage Tests  ← T-024
  T-031  Hybrid Retrieval       ← T-002
  T-033  Citation Service       ← T-002
  T-035  Neo4j Resilience       ← T-002
  T-056  Secrets Management     ← T-002

Level 2:
  T-008  Login Page             ← T-003, T-007
  T-009  Register Page          ← T-003, T-007
  T-012  API Client             ← T-003, T-007 ★ CRITICAL
  T-026  KnowledgeRegistry      ← T-021
  T-032  Reranking              ← T-031
  T-034  Advanced Search UI     ← T-015
  T-036  Graph Viz              ← T-035, T-012
  T-043  Manifest Import        ← T-028

Level 3:
  T-010  Protected Routes       ← T-008 ★ CRITICAL
  T-011  Logout                 ← T-008
  T-013  Decision Service       ← T-012 ★ CRITICAL
  T-014  Document Service       ← T-012
  T-015  Search Service         ← T-012
  T-016  Workspace Service      ← T-012
  T-027  Chunked Upload         ← T-014
  T-044  Corpus Alerts          ← T-017
  T-045  Corpus Versioning      ← T-043

Level 4:
  T-017  Corpus Health          ← T-012
  T-018  Knowledge Base         ← T-012
  T-019  Audit Log              ← T-012
  T-020  Admin Pages            ← T-012
  T-037  Case Workspace CRUD    ← T-016 ★ CRITICAL

Level 5:
  T-038  Checklist Tab          ← T-037
  T-039  Documents Tab          ← T-037
  T-040  Notes Tab              ← T-037
  T-041  Activity Tab           ← T-037
  T-042  My Work                ← T-037

Level 6:
  T-046  Backend Tests (AI)     ← T-021..T-026 ★ CRITICAL
  T-047  Backend Tests (Search) ← T-031..T-033

Level 7:
  T-048  Backend Integration    ← T-013..T-020
  T-049  Frontend Unit Tests    ← T-013..T-020 ★ CRITICAL
  T-053  CSP Headers            ← T-020
  T-054  Rate Limiting          ← T-007, T-013, T-014
  T-055  Input Validation       ← T-002
  T-057  HTTPS/TLS              ← T-053
  T-058  OpenTelemetry          ← T-002
  T-065  Production Dockerfile  ← T-002 ★ CRITICAL

Level 8:
  T-050  Frontend Integration   ← T-049
  T-052  Performance Baseline   ← T-048
  T-059  Metrics Dashboard      ← T-058
  T-060  Structured Logging     ← T-058
  T-061  Health Check Agg       ← T-035
  T-062  CI Pipeline            ← T-046, T-047, T-049 ★ CRITICAL
  T-066  Docker Compose Prod    ← T-065
  T-068  Flyway Baseline        ← T-002 ★ CRITICAL

Level 9:
  T-051  Playwright E2E         ← T-048, T-050
  T-063  CD Pipeline            ← T-062, T-067
  T-064  Quality Gates          ← T-062
  T-067  K8s Manifests          ← T-065
  T-069  PG Backup              ← T-068
  T-070  Qdrant Backup          ← T-065

Level 10:
  T-071  Incident Playbook      ← T-069, T-070
  T-072  LLM Eval               ← T-025
  T-073  Load Testing           ← T-052, T-066
  T-074  Chaos Testing          ← T-066
  T-076  Operations Manual      ← T-069, T-070, T-071
  T-077  API Reference          ← T-048

Level 11 (Final):
  T-075  Prod Readiness         ← ALL
  T-078  Final Integration      ← ALL
```

---

## Critical Path (Longest Chain)

The critical path is the sequence of tasks that determines the minimum project duration:

```
T-001 (8h) → T-002 (6h) → T-007 (8h) → T-012 (8h) → T-013 (16h)
  → T-037 (16h) [parallel to T-013] → T-046 (16h) → T-049 (40h)
  → T-062 (10h) → T-063 (14h) → T-078 (16h)
```

**Critical path tasks:** T-001, T-002, T-007, T-012, T-013, T-037, T-046, T-049, T-062, T-063, T-078

**Total critical path effort:** 158h (blocking chain only)

Wait — this is misleading. The critical path isn't simply summing hours. In practice:

**T-049 (40h Frontend Tests)** is the single longest task on the critical path. It directly blocks T-050, T-062, and the CI pipeline.

**T-013 + T-037 combined (32h)** represent the core feature work. Both depend on T-012. Together they enable everything downstream.

**Real critical path in calendar weeks:**
1. Foundation (T-001–T-006): 1 week
2. Auth + API Client (T-007, T-012): 1 week
3. Core Integration (T-013, T-014, T-037): 3 weeks
4. Testing (T-046, T-049): 3 weeks
5. CI/CD + Production (T-062, T-065, T-068): 2 weeks
6. Verification (T-078): 2 weeks

**Critical path calendar:** 12 weeks minimum (compressed)
**Realistic with parallel work:** 14 weeks

---

## Top Bottlenecks

### Bottleneck 1: T-012 (API Client Layer)
**Blocks:** 8 tasks (T-013 through T-020)
**Why:** Every frontend-backend integration depends on this foundation.
**Optimization:** Assign to most senior frontend engineer. Get right the first time. Review design before implementation.

### Bottleneck 2: T-049 (Frontend Unit Tests — 40h)
**Blocks:** T-050, T-062, CI pipeline
**Why:** The largest single task (40h = 1 full week). No shortcut — tests must be written.
**Optimization:** Split between 2 frontend engineers. Write tests incrementally alongside feature work (testing during Sprint 2-5, not in a separate phase).

### Bottleneck 3: T-037 (Case Workspace CRUD — 16h)
**Blocks:** T-038 through T-042 (5 tasks, 48h combined)
**Why:** Case management is the most complex UI workflow. Everything downstream depends on it.
**Optimization:** Start T-037 as early as dependencies allow. Tabs can be built in parallel once case header and routing are established.

### Bottleneck 4: T-065 (Production Dockerfile)
**Blocks:** T-066, T-067, T-069, T-070, T-073
**Why:** Deployment foundation. Without it, no production-like testing.
**Optimization:** Can start early (only depends on T-002). Build in parallel with frontend work.

### Bottleneck 5: T-068 (Flyway Baseline)
**Blocks:** T-069 (Backup), T-063 (CD)
**Why:** Must capture current schema before any production deployment.
**Optimization:** Generate baseline from Hibernate schema dump (semi-automated). Test on copy of dev database.

---

## Parallelization Opportunities

### Independent Streams (can run concurrently)

**Stream A — Backend Core:**
T-021 → T-022 → T-023 → T-024 → T-025 → T-026

**Stream B — Document Pipeline:**
T-028 → T-029 → T-030 → T-027 → T-043 → T-044 → T-045

**Stream C — Search & Graph:**
T-031 → T-032 → T-033 → T-034
T-035 → T-036 (parallel with T-031→T-034)

**Stream D — Frontend Pages (after T-012):**
T-013, T-014, T-015, T-016, T-017, T-018, T-019, T-020 (8 tasks, 4 engineers → 2 weeks)

**Stream E — Case Management (after T-037):**
T-038, T-039, T-040, T-041, T-042 (5 tasks, 3 engineers → 1.5 weeks)

**Stream F — Security + Observability (after T-002):**
T-053, T-054, T-055, T-056, T-057, T-058, T-059, T-060, T-061

**Stream G — Production + CI/CD (after T-002):**
T-065 → T-066 → T-067
T-068 → T-069 → T-070 → T-071
T-062 → T-063 → T-064

---

## Maximum Parallelization (Theoretical)

With 7 engineers working in parallel:

```
Week 1-2:  Stream A (BE1) + Stream B (BE2) + Stream D part 1 (FE1, FE2)
           + T-001..T-006 (DevOps) + T-007 (BE1) + T-012 (FE Lead)

Week 3-4:  Stream A complete, Stream B complete (BE1, BE2)
           Stream D complete (FE1, FE2, FE Lead)
           T-035..T-036 (BE1 + FE1)

Week 5-6:  Stream C (BE1, BE2)
           Stream E (FE1, FE2, FE Lead)
           Stream F begins (DevOps)

Week 7-8:  Stream E complete
           Stream F complete (DevOps, BE1)
           T-046, T-047 (BE1, BE2)
           T-049 begins (FE1, FE2)

Week 9-10: T-049 complete (FE1, FE2, QA)
           T-048, T-050, T-051 (BE1, BE2, QA)
           Stream G begins (DevOps)

Week 11-12: Stream G complete (DevOps, BE1)
            T-052, T-073, T-074 (QA, DevOps)
            T-072 (BE1)

Week 13-14: T-075, T-076, T-077, T-078 (All hands)
```

**Theoretical minimum:** 14 weeks with 7 engineers working at full capacity with zero coordination overhead.

---

## Risk to Critical Path

| Risk | Impact on Critical Path | Mitigation |
|---|---|---|
| T-012 API Client design rejected | +1 week | Senior engineer, review before code |
| T-049 Frontend tests > 40h | +1-2 weeks | Incremental testing, split between engineers |
| SSE streaming unstable (T-013) | +3 days | Polling fallback ready |
| Qdrant/Ollama unavailable in dev | +2-5 days per incident | Docker Compose is self-contained |
| Production DB migration rollback (T-068) | +3 days | Backup-first + dry run |
| Integration bugs found in T-078 | +1-2 weeks | Continuous integration, test early |

**Critical path buffer:** 2 weeks (14 → 16 week delivery commitment)

---

## Recommendations

1. **Start T-012 immediately after T-001.** The API client is the #1 bottleneck. Assign your best frontend engineer and review the design before coding.

2. **Don't defer testing to a separate phase.** Write unit tests for each component as it's built. T-049 at 40h is a schedule risk if done as a monolithic phase.

3. **Defer K8s (T-067) and LLM Eval (T-072) to v1.1.** They are not on the critical path for pilot readiness. Removing them saves ~2 weeks.

4. **Run Streams A, B, C, F, G in parallel with frontend work.** Backend hardening, document pipeline, search, security, observability, and production deployment can all proceed independently of frontend integration.

5. **Protect the critical path.** Any delay to T-001, T-002, T-007, T-012, T-013, T-037, T-046, T-049, T-062, T-063, or T-078 delays the entire project. These tasks get priority on resources and code review.
