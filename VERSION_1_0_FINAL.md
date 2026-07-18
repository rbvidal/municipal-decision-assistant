# Municipal Decision Assistant — Version 1.0

**Release Date:** 2026-07-18
**Release Decision:** GO WITH MINOR FOLLOW-UP
**License:** Apache 2.0

---

## Project Overview

The **Municipal Decision Assistant** is an AI-powered decision support platform for German municipal administrations. It provides semantic search, deterministic rule evaluation, and evidence-based reasoning across thousands of administrative documents — regulations, building codes, procurement guidelines, salary tables, and travel allowance regulations.

**Primary purpose:** Enable municipal caseworkers to ask natural-language questions about administrative procedures and receive structured, source-cited answers grounded in official documents.

**Target users:** Municipal administration staff (Sachbearbeiter) in building permits, public procurement, and human resources departments.

**Core capabilities:**
- Hybrid semantic search (keyword + vector) across indexed municipal documents
- Deterministic rule engine for procurement thresholds, salary grades, and travel allowances
- LLM-powered reasoning with evidence citations for open-ended legal questions
- Document ingestion pipeline (PDF, DOCX, TXT) with chunking, embedding, and vector indexing
- Case workspace management with checklist, documents, notes, activity timeline, and decision support tabs
- Corpus administration with health monitoring, manifest-based import, and automated health alerts

---

## Architecture Summary

**9 Maven modules** with strict compile-time boundaries:

```
platform-api              REST controllers, Spring Boot assembly, DTOs
platform-ai               LLM orchestration, RuleEngine, DecisionRouter, knowledge tables
platform-search           Hybrid retrieval (keyword + vector fusion), citation service
platform-document         Document lifecycle, ingestion pipeline, versioning
platform-neo4j            Knowledge graph persistence (optional, gracefully degraded)
platform-workspace        Case/workspace management, timeline, document linking
platform-observability    Micrometer metrics, Prometheus, OpenTelemetry tracing, health
platform-auth             JWT authentication, BCrypt, refresh tokens, user management
platform-audit            Immutable audit event log
```

**Decision engine:** Dual-path architecture — `DecisionRouter` classifies questions. Deterministic queries (procurement thresholds, salary grades, travel allowances) use the `RuleEngine` with structured knowledge tables. Open-ended legal questions use hybrid retrieval (keyword + vector) + LLM reasoning with evidence citations.

**AI Pipeline:** Document → Extract → Chunk → Embed → Index → Query → Retrieve → Rerank → Assemble Evidence → LLM → Ground → Evaluate → Respond

**Security:** JWT (HS256) with refresh token rotation, BCrypt (strength 12), role-based access (ADMIN/ANALYST/USER), CSP headers, XSS filter, rate limiting.

**Observability:** OpenTelemetry tracing (Micrometer bridge), structured JSON logging in production, Prometheus metrics, aggregated health (UP/DEGRADED/DOWN) across DB/Qdrant/Ollama/Neo4j.

**Deployment:** Docker multi-stage build (<400 MB), Docker Compose with resource limits, Flyway database migrations, backup/restore scripts for PostgreSQL and Qdrant.

---

## Major Features

| Feature | Description |
|---------|-------------|
| Hybrid Retrieval | Keyword (PostgreSQL full-text) + vector (Qdrant cosine) fusion with configurable weights |
| Decision Engine | RuleEngine for deterministic lookups + LLM reasoning with evidence package |
| Document Ingestion | PDF, DOCX, TXT pipeline: extract → chunk → embed → index with scheduled worker |
| Authentication | JWT with refresh token rotation, BCrypt hashing, role-based access control |
| Case Workspace | 8-tab workspace: overview, checklist, documents, notes, activity, decision, draft, send |
| Corpus Administration | Health dashboard, manifest-based batch import, automated health alerts |
| Search Page | Full-text + vector search with document type/domain filters, citation display |
| Decision UI | Question input, SSE streaming, structured response with confidence and evidence |
| Admin Tools | Knowledge table reload, audit log page, user management, corpus health |
| Observability | OpenTelemetry tracing, JSON structured logging, Prometheus metrics, health aggregation |
| CI/CD | GitHub Actions: backend + frontend + E2E in parallel, Docker push to GHCR |
| Security | CSP, X-Frame-Options, XSS filter, rate limiting, input validation with German errors |

---

## Technology Stack

**Backend:** Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Flyway

**Frontend:** React 19, TypeScript, Vite, TanStack React Query, CSS Modules

**Database:** PostgreSQL 16 + pgvector

**Vector Database:** Qdrant (REST + gRPC)

**Knowledge Graph:** Neo4j 5 Community (optional, gracefully degraded)

**AI:** Ollama (qwen2.5:14b for chat, nomic-embed-text for embeddings), OpenAI-compatible API optional

**Build:** Maven 3.9+, npm, GitHub Actions

**Deployment:** Docker, Docker Compose, GitHub Container Registry

**Testing:** JUnit 5, Mockito, Testcontainers, Vitest, Playwright, k6

**Observability:** OpenTelemetry, Micrometer, Prometheus, Jaeger, logback JSON

---

## Testing Summary

| Level | Count | Status |
|-------|-------|--------|
| platform-ai unit tests | 282 | All passing |
| platform-search unit tests | 45 | All passing |
| platform-auth unit tests | 13 | All passing |
| platform-api controller/integration tests | ~200 | All passing |
| Frontend component tests (vitest) | 6 | All passing |
| Playwright E2E tests | 11 scenarios | Configured in CI |
| k6 performance scripts | 4 scenarios | smoke/load/stress/soak |
| **Total** | **~540** | **0 failures** |

---

## Security Summary

- **Authentication:** JWT (HS256), 15-min access tokens, 30-day refresh tokens with rotation
- **Password hashing:** BCrypt strength 12
- **Authorization:** Role-based (ADMIN, ANALYST, USER) via Spring Security
- **CSP:** `default-src 'self'` with Google Fonts CDN whitelist
- **Headers:** X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy
- **XSS Protection:** Global servlet filter stripping script/injection patterns
- **Input Validation:** Jakarta Bean Validation on all DTOs, German error messages
- **Rate Limiting:** Login 5/min/IP, Decision 10/min/user, Upload 20/h/user
- **Secrets:** Zero hardcoded secrets, `.env.example` with 30+ variables
- **TLS:** Production profile with SSL, HSTS via Spring Security

---

## Deployment Summary

- **Dockerfile:** Multi-stage (eclipse-temurin:21-jdk-alpine → jre-alpine), non-root user, HEALTHCHECK, <400 MB
- **Docker Compose:** Production profile with resource limits, restart policies, internal-only ports
- **Database Migrations:** Flyway with 7 migration files (V1-V7), `ddl-auto=validate` in production
- **Backup:** PostgreSQL pg_dump with gzip + Qdrant snapshot API, 30-day retention
- **Restore:** Drop/recreate PostgreSQL + Qdrant snapshot restore scripts
- **CI/CD:** GitHub Actions backend (Maven + JaCoCo + OWASP) + frontend (npm + vitest) + E2E (Playwright), Docker → GHCR
- **Incident Playbook:** 8 scenarios with symptoms, diagnosis, mitigation, resolution

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total commits | 67 |
| Maven modules | 9 |
| Java source files | 419 |
| TypeScript source files | 263 |
| Backend tests | ~540 |
| Frontend tests | 6 |
| k6 performance scenarios | 4 |
| Playwright E2E scenarios | 11 |
| Roadmap tasks complete | 71 / 78 (91%) |
| Roadmap tasks deferred | 7 (all authorized) |

---

## Known Limitations

Version 1.0 intentionally does not provide:

- **Kubernetes manifests** — Single-machine Docker Compose sufficient for 1-2 municipality pilot. Planned for v1.1.
- **Distributed rate limiting** — In-memory via ConcurrentHashMap. Single-instance only. Planned for v1.1.
- **Graph visualization** — Neo4j data is queryable via Cypher but not rendered visually. Planned for v1.1.
- **SonarQube quality gates** — Static analysis via SpotBugs + Checkstyle. SonarQube dashboard deferred.
- **Automated LLM evaluation** — Decision quality assessed manually. Evaluation framework deferred.
- **Full frontend test coverage** — 6 tests covering 1 component. UI regressions detected visually during pilot.
- **Nonce-based CSP** — Currently allows `unsafe-inline` for Thymeleaf compatibility. Planned for v1.1.
- **Multi-tenant isolation** — Single-tenant design. Multi-tenancy is a v1.1 capability.
- **WAL archiving for PostgreSQL** — Daily pg_dump backups only. Point-in-time recovery planned for v1.1.

---

## Roadmap for Version 1.1

Planned improvements (already designed, deferred for v1.0):

1. **Kubernetes manifests** — Self-contained K8s deployment for multi-node HA
2. **Full frontend test coverage** — Component tests for all ~84 components
3. **platform-document/workspace unit tests** — Complete backend coverage
4. **Graph visualization** — Interactive Neo4j knowledge graph explorer
5. **LLM evaluation framework** — Automated benchmarking of decision quality
6. **Distributed rate limiting** — Redis-backed rate limiter for multi-instance deployments
7. **Nonce-based CSP** — Replace `unsafe-inline` with nonce-based script execution
8. **SonarQube quality gates** — Automated quality gate in CI/CD pipeline
9. **WAL archiving** — PostgreSQL point-in-time recovery for production deployments

---

## Final Release Decision

**GO WITH MINOR FOLLOW-UP**

The Municipal Decision Assistant Version 1.0 is complete, tested, secure, observable, and deployable. All 12 roadmap slices are implemented. 540+ tests pass with zero failures. The architecture is frozen and compliant. Documentation covers API reference, operations, incident response, and deployment.

**Five operational tasks remain before production deployment:**

1. **Set production secrets** — Copy `.env.example` to `.env` and set `AUTH_JWT_SECRET`, `DB_PASSWORD`, etc.
2. **Generate TLS keystore** — `keytool -genkeypair -alias mda -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12`
3. **Install Ollama** — Pull `qwen2.5:14b` (chat) and `nomic-embed-text` (embeddings) models
4. **Schedule backups** — Add `0 2 * * * /path/to/scripts/backup-all.sh` to crontab
5. **Run production load test** — `k6 run k6-scripts/smoke-test.js` against deployed instance

None of these tasks require software changes.
