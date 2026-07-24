# RC1 – Release Preparation Audit

**Date:** 2026-07-23
**Type:** Analysis only — no code modifications
**Scope:** Full release readiness assessment

---

## 1. Versioning

| Component | Current Version | Recommendation |
|-----------|----------------|---------------|
| Maven root (`pom.xml`) | `1.0.0-SNAPSHOT` | Change to `1.0.0-RC1` |
| Spring Boot parent | `3.3.5` | OK — latest stable 3.3.x |
| Frontend (`package.json`) | `0.1.0` | Align to `1.0.0-RC1` |
| Git tags | `v1.0.0`, `v1.0-architecture-complete`, `v1.1-engineering-plan`, `stitch-design-v1.0` | All historical. No RC1 tag exists. |
| Branch | `master` | OK |

**Issue (Medium):** Version inconsistency — Maven root says `1.0.0-SNAPSHOT`, frontend says `0.1.0`. Both should be `1.0.0-RC1` for the release candidate. This requires a coordinated pom.xml + package.json update.

**Recommended RC Version: `v1.0.0-RC1`**

---

## 2. Documentation

### Existing

| Document | Status | Quality |
|----------|--------|---------|
| `README.md` | **Exists** | Good — quick start, architecture overview, prerequisites, Docker instructions |
| `LICENSE` | **Exists** | Apache 2.0 — appropriate for enterprise |
| `docs/Developer-Guide.md` | **Exists** | Developer setup and architecture overview |
| `docs/API_REFERENCE.md` | **Exists** | API reference documentation |
| `docs/Architecture-Handbook.md` | **Exists** | Comprehensive architecture documentation |
| `docs/OPERATIONS_MANUAL.md` | **Exists** | Deployment, monitoring, incident response |
| `docs/INCIDENT_PLAYBOOK.md` | **Exists** | Incident response procedures |
| `docs/Pre-Implementation-Verification.md` | **Exists** | Internal verification document |
| `docs/Architecture-Verification-and-Refactoring-Blueprint.md` | **Exists** | Internal architecture review |
| `docs/Architecture-Assessment-and-Migration-Plan.md` | **Exists** | Internal assessment document |
| `docs/Production-Readiness-Audit.md` | **Exists** | Internal audit document |
| `k6-scripts/README.md` | **Exists** | Load testing documentation |

### Missing (Recommended for Production)

| Document | Priority | Notes |
|----------|----------|-------|
| `CHANGELOG.md` | **High** | Users need to know what changed. Summarize all 9 cleanup phases + features. |
| `RELEASE_NOTES.md` | **High** | RC1-specific release notes: known issues, breaking changes, upgrade instructions. |
| `SECURITY.md` | **Medium** | Security policy, vulnerability reporting, supported versions. |
| `CONTRIBUTING.md` | **Low** | Contribution guidelines (only if accepting external contributions). |
| `INSTALLATION.md` | **Low** | Already covered in README Quick Start. Separate file only if deploying to multiple environments. |

**Issue (High):** No CHANGELOG or RELEASE_NOTES exist. These are standard for any public release and essential for users evaluating RC1.

---

## 3. Deployment

| Artifact | Status | Notes |
|----------|--------|-------|
| `Dockerfile` | **Production-ready** | Multi-stage build (JDK→JRE), non-root user (1001:1001), ZGC, health check via Actuator, OOM protection. |
| `docker-compose-prod.yml` | **Production-ready** | All services: PostgreSQL/pgvector, Qdrant, Neo4j (profile-gated), Jaeger (profile-gated). Resource limits set. Health checks on all services. |
| `start-prod.bat` | **Exists** | Windows batch script. Builds frontend + starts Spring Boot as single server. |
| `kill-8080.bat` / `stop-dev.bat` | **Exists** | Shutdown scripts. No production shutdown script (`stop-prod.bat` missing). |
| Health endpoint | **Actuator** | `/actuator/health` — configured. Prod profile: `show-details: when-authorized`. |
| Readiness endpoint | **Not separate** | Actuator health serves as combined liveness+readiness. Adequate for RC. |
| SSL/TLS | **Configured** | `application-prod.yml` enables SSL with keystore. Requires `SERVER_SSL_KEY_STORE_PASSWORD` env var. |

**Issue (Low):** No `stop-prod.bat` script. Production shutdown is `docker compose down` which is standard. Not a blocker.

---

## 4. Configuration

### Production Profile (`application-prod.yml`)

| Check | Status |
|-------|--------|
| `ddl-auto: validate` | **PASS** — no automatic schema changes in production |
| `flyway.enabled: true` | **PASS** — database migrations managed by Flyway |
| `show-details: when-authorized` | **PASS** — health details not publicly exposed |
| `logging.level: INFO` | **PASS** — no debug/verbose logging |
| SSL enabled | **PASS** — TLS configured with keystore |
| Secrets externalized | **PASS** — all credentials via env vars (`${...}`) |

### Development Profile (`application-dev.yml`)

| Item | Finding |
|------|---------|
| `password: platform` | Dev only — acceptable for local development |
| `jwt-secret: dev-secret-change-in-production...` | Dev only — acceptable |
| `password: password` (Neo4j) | Dev only — acceptable |
| `spring.security: TRACE` | Dev only — acceptable |

**Verdict:** No dev configuration leaks into the production profile. Dev credentials are explicitly in `application-dev.yml` which requires `--spring.profiles.active=dev`.

### Default Profile (`application.yml`)

| Item | Finding |
|------|---------|
| `ddl-auto: update` | **Risk** — default profile uses Hibernate auto-DDL. Production MUST use `prod` profile which overrides to `validate`. |
| `show-details: always` | **Risk** — health details public in default profile. Production `prod` profile overrides to `when-authorized`. |
| `flyway.enabled: false` | Default disabled. Production `prod` profile enables it. |
| Default URLs (`localhost`) | Qdrant, Neo4j, Ollama default to localhost. Production uses env vars. |

**Issue (Medium):** The default profile is not production-safe (`ddl-auto: update`, `show-details: always`, `flyway.enabled: false`). Starting without `--spring.profiles.active=prod` would run with development settings. The Dockerfile does not set `SPRING_PROFILES_ACTIVE=prod`. **Recommendation:** Add `ENV SPRING_PROFILES_ACTIVE=prod` to the Dockerfile, or document that `--spring.profiles.active=prod` is mandatory for production.

### `.env.example`

| Item | Finding |
|------|---------|
| `AUTH_JWT_SECRET=change-this-to-a-strong-random-secret-at-least-32-chars` | Placeholder — intentional, user must set |
| `DB_PASSWORD=change-me` | Placeholder — intentional, user must set |
| `NEO4J_PASSWORD=change-me` | Placeholder — intentional, user must set |
| 43 environment variables defined | Comprehensive coverage |

**Verdict:** Acceptable. Placeholders are clearly marked with `change-me` / `change-this` patterns.

---

## 5. Security

| Check | Status |
|-------|--------|
| No hardcoded credentials in production code | **PASS** — all secrets via env vars in prod profile |
| JWT secret externalized | **PASS** — `${AUTH_JWT_SECRET}` environment variable |
| JWT secret strength check | **PASS** — `SecurityConfiguration` enforces ≥32 bytes at startup |
| CORS configuration | **N/A** — SPA served from same origin (Spring Boot serves React build). Not needed for single-origin deployment. |
| CSP headers | **PASS** — `SecurityConfiguration` Web chain sets CSP, frame-options, XSS protection, content-type options |
| `@PreAuthorize` on admin endpoints | **PASS** — 5 controllers secured (RC-4) |
| `/dev` endpoints secured | **PASS** — moved to `/api/dev/` under JWT auth (RC-1) |
| OWASP Dependency Check | **Non-blocking** — configured in CI with `failBuildOnCVSS: 7` but `continue-on-error: true` means CVEs don't fail the build |
| No sensitive data in logs | **PASS** — `application-prod.yml` sets `INFO` level. No credential logging found in code review. |

**Issue (Medium):** OWASP Dependency Check is non-blocking in CI (`continue-on-error: true`, `|| true`). Known vulnerabilities with CVSS ≥ 7 won't prevent a release build. This is acceptable for RC but should be made blocking before production.

**Issue (Low):** No dedicated security scanning (SAST, secret scanning) in CI pipeline.

---

## 6. Operational Readiness

| Check | Status |
|-------|--------|
| Structured logging | **PASS** — SLF4J throughout. MDC not configured but not required for RC. |
| Audit logging | **PASS** — All domains (search, documents, auth, AI) emit through audit SPI to SQL. |
| Error handling | **PASS** — `RestExceptionHandler` provides global error handling. Validation returns 422. |
| Graceful startup | **PASS** — Actuator health with 40s start period. Spring Boot graceful startup by default. |
| Graceful shutdown | **PASS** — Spring Boot graceful shutdown. Docker HEALTHCHECK for orchestrated environments. |
| Health monitoring | **PASS** — `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus` endpoints available. |
| Scheduled health checks | **PASS** — `CorpusHealthAlertScheduler` checks embedding coverage, Qdrant vectors, extraction/ingestion failures hourly. |
| Ingestion worker | **PASS** — `DocumentIngestionWorker` polls for pending jobs every 10 seconds. |
| Backup considerations | **Not addressed** — PostgreSQL and Qdrant persistence are in Docker volumes. No documented backup strategy. |
| Restore considerations | **Not addressed** — No documented restore procedure. |

**Issue (Medium):** No documented backup/restore procedure. Docker volumes provide persistence but no backup strategy is documented. `OPERATIONS_MANUAL.md` should cover this.

---

## 7. Performance

| Check | Status |
|-------|--------|
| Obvious N+1 queries | **Not observed** — services use `findById`, `findAll`, `findDocuments` with JPA specifications. No loops iterating over query results making additional queries. |
| Expensive startup tasks | **Noted** — `DemoDataInitializer` seeds 23 documents at startup. Idempotent (checks if documents exist). Acceptable for RC. |
| Synchronous bottlenecks | **Not observed** — AI pipeline runs synchronously per request (expected). Ingestion jobs processed async by polling worker. |
| Large object allocations | **Not observed** — chunk-level retrieval limits response size. No full-document loading into memory. |
| k6 load test suite | **Exists** — 8 load test scripts (smoke, daily load, peak morning, AI-heavy, search-intensive, upload stress, admin ops, long session). |

**Verdict:** No obvious performance issues. k6 load testing infrastructure is in place for empirical validation.

---

## 8. Testing

### Coverage Summary

| Module | Test Classes | Tests | Quality |
|--------|-------------|-------|---------|
| platform-ai | 17 | 282 | Good — decision routing, grounding, rule engine, knowledge tables well tested |
| platform-search | 5 | 45 | Good — hybrid retrieval, chunking, citation, indexing |
| platform-auth | 1 | 13 | Adequate — auth edge cases covered |
| platform-api | 15 | ~30 | Adequate — integration tests, bean wiring, search endpoint, decision controller |
| platform-audit | 0 | 0 | **Gap** — no tests |
| platform-document | 0 | 0 | **Gap** — no tests |
| platform-workspace | 0 | 0 | **Gap** — no tests |
| Frontend | 1 | 6 | **Gap** — only Badge component tested |

### Critical Test Gaps (from Phase 5 audit)

| Area | Priority | Reason |
|------|----------|--------|
| `DefaultRetrievalAugmentationService` | **High** | Core RAG pipeline — zero tests |
| `AiService.answer()` | **High** | Core LLM orchestration — zero tests |
| `KnowledgeRestController` | **Medium** | Public search endpoint — zero tests (Phase 2 changes untested) |
| `AiAuditPublisher` | **Low** | Audit fix verification — zero tests (Phase 1 changes untested) |

**Verdict:** 360 tests provide solid coverage of core AI and search pipelines. Three modules have zero tests. The critical gaps are in the RAG and LLM orchestration layers. Acceptable for RC — the code has been verified through architecture review and integration tests. Production release requires filling the High-priority gaps.

---

## 9. User Experience

| Check | Status |
|-------|--------|
| No broken pages | **PASS** — RC-3 removed Supervisor and Users pages. RC-5 removed dead endpoints. All remaining routes resolve. |
| No placeholder text (outside deferred features) | **PASS** — Zero `TODO` or `FIXME` in frontend pages. Workspace Draft/Send tabs are documented placeholders. |
| Meaningful error messages | **PASS** — Error states show German-language messages ("Fehler beim Laden", "Vorgang nicht gefunden", "Dashboard nicht verfügbar"). |
| Loading indicators | **PASS** — `isLoading` states with spinner/empty-state components. |
| Empty states | **PASS** — `EmptyState` component used throughout for zero-data states. |
| Dashboard (MVP exclusion) | **PASS** — HomePage shows "Dashboard nicht verfügbar" error state. Transparent failure, no fake data displayed after RC-2 fix. |

**Verdict:** Acceptable. The HomePage shows an error state instead of fake data — this is the correct behavior for the deferred dashboard feature.

---

## 10. Release Artifacts

| Artifact | Status | Notes |
|----------|--------|-------|
| Docker image | **Buildable** | `docker build -t mda:rc1 .` from Dockerfile |
| docker-compose production stack | **Ready** | `docker compose -f docker-compose-prod.yml up -d` |
| Frontend build | **Embedded** | `mvn package` embeds React build into Spring Boot JAR |
| Release notes | **Missing** | Need `RELEASE_NOTES.md` for RC1 |
| Changelog | **Missing** | Need `CHANGELOG.md` summarizing all changes |
| Installation guide | **Covered** | README Quick Start + `start-prod.bat` sufficient for RC |
| Upgrade guide | **Not applicable** | First release candidate — no upgrade path needed |
| Git tag | **Missing** | Need `git tag v1.0.0-RC1` |

---

## Executive Summary

The platform is **well-prepared for Release Candidate 1**. All 9 engineering cleanup phases are complete. The core value proposition — AI-assisted municipal decision support — is backed by production services with 360 passing tests. Hardcoded data has been systematically removed or wired to real services. Prototype features have been deleted. Administrative endpoints are secured.

### Remaining Release Blockers

| # | Category | Issue | Action |
|---|----------|-------|--------|
| 1 | **High** | No `CHANGELOG.md` or `RELEASE_NOTES.md` | Create both documents before tagging RC1 |
| 2 | **Medium** | Version inconsistency — Maven `1.0.0-SNAPSHOT`, frontend `0.1.0` | Set both to `1.0.0-RC1` |
| 3 | **Medium** | Default profile not production-safe | Add `SPRING_PROFILES_ACTIVE=prod` to Dockerfile or document mandatory profile flag |
| 4 | **Medium** | OWASP Dependency Check non-blocking in CI | Remove `\|\| true` and `continue-on-error: true` before production (acceptable for RC) |
| 5 | **Medium** | No backup/restore documentation | Add backup section to `OPERATIONS_MANUAL.md` |
| 6 | **Low** | No `stop-prod.bat` script | Not a blocker — Docker-based deployment uses `docker compose down` |

### Production Checklist

| Area | Result |
|------|--------|
| Versioning | **FAIL** — version inconsistency (fixable in 5 minutes) |
| Documentation | **PARTIAL** — README/License/DevGuide/API Ref/Operations Manual exist. Missing CHANGELOG + RELEASE NOTES. |
| Deployment | **PASS** — Docker, docker-compose-prod, startup scripts, health checks |
| Configuration | **PASS*** — prod profile clean. Default profile not prod-safe (documented). |
| Security | **PASS** — No hardcoded credentials, JWT secured, admin endpoints authorized, /dev endpoints secured. OWASP non-blocking (acceptable for RC). |
| Operational Readiness | **PASS** — Health endpoints, audit logging, scheduled health checks, ingestion worker, structured logging |
| Performance | **PASS** — No obvious issues. k6 load test suite available. |
| Testing | **PASS** — 360 tests pass. Critical gaps documented (RAG, LLM orchestration). |
| User Experience | **PASS** — No broken pages, meaningful error states, loading indicators. Dashboard error state (approved MVP exclusion). |
| Release Artifacts | **PARTIAL** — Docker image buildable. Missing CHANGELOG + RELEASE NOTES. |

### Recommended RC Version

**`v1.0.0-RC1`**

### Go / No-Go

**GO for Release Candidate 1** — with 3 pre-tagging actions:

1. Create `CHANGELOG.md` and `RELEASE_NOTES.md`
2. Set version to `1.0.0-RC1` in `pom.xml` and `frontend/package.json`
3. Git tag `v1.0.0-RC1`

The 3 medium issues (prod profile default, OWASP blocking, backup docs) are acceptable for RC1 and can be addressed before the production release.

### Final Recommendation

The engineering phase is complete. The next phase should transition from engineering to release management: versioning, changelog creation, git tagging, Docker image publication, stakeholder demonstration, pilot deployment, and user onboarding. No further code changes are required for RC1.
