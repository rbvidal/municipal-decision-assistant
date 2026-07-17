# Risk Register — Version 1.0 Implementation

**Date:** 2026-07-17
**Review cadence:** Every sprint retrospective

---

## Risk Matrix

| Probability | Low (1) | Medium (2) | High (3) |
|---|---|---|---|
| **High (3)** | 3 | 6 | **9** |
| **Medium (2)** | 2 | 4 | 6 |
| **Low (1)** | 1 | 2 | 3 |

Score = Probability × Impact. Treat scores ≥ 6 as high-priority mitigation.

---

## Technical Risks

### R-001: SSE Streaming Complexity for Decision Queries
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** The Decision Engine uses SSE streaming for progressive results. Frontend SSE parsing is error-prone — connection drops, reconnection logic, partial message handling, and browser compatibility issues are common.

**Affected tasks:** T-013 (Decision Service)

**Mitigation:**
1. Use the EventSource API with a robust wrapper that handles reconnection
2. Fall back to polling if SSE not supported (rare)
3. Implement timeout + error boundary on the client
4. Test with network throttling in Playwright

**Contingency:** If SSE proves unstable, replace with polling at 2s intervals. UX impact: results appear in chunks rather than streaming.

---

### R-002: Qdrant Version Compatibility
**Probability:** Low (1) | **Impact:** High (3) | **Score:** 3

**Description:** docker-compose uses `qdrant/qdrant:latest`. A future Qdrant update could break the API client or change collection behavior. Collection schema changes could require re-indexing.

**Affected tasks:** T-031 (Hybrid Retrieval), T-070 (Qdrant Backup)

**Mitigation:**
1. Pin Qdrant version in docker-compose (use `qdrant/qdrant:v1.9` not `latest`)
2. Add integration test that verifies collection schema on startup
3. Document Qdrant version in DEPENDENCIES.md

**Contingency:** Roll back Qdrant version. Re-indexing script available via T-043.

---

### R-003: Neo4j Schema Drift
**Probability:** Medium (2) | **Impact:** Medium (2) | **Score:** 4

**Description:** The knowledge graph schema is auto-generated during ingestion. Schema changes between Neo4j versions or ingestion runs could break graph queries.

**Affected tasks:** T-035 (Neo4j Resilience), T-036 (Graph Visualization)

**Mitigation:**
1. Pin Neo4j version (`neo4j:5.22-community` not `5-community`)
2. Version the graph schema alongside Flyway migrations
3. Graph queries use parameterized Cypher — no string concatenation

**Contingency:** Neo4j is optional per architecture. If schema issues arise, graph features degrade gracefully — search and decisions continue.

---

### R-004: Ollama Model Availability & Performance
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** The platform defaults to Ollama with `qwen2.5:14b` for chat and `nomic-embed-text` for embeddings. Model availability, inference speed, and quality vary by hardware. A developer without GPU may see 30-60s inference times.

**Affected tasks:** T-013 (Decision Service), T-029 (Text Extraction), T-032 (Reranking)

**Mitigation:**
1. Document minimum hardware requirements (32GB RAM, GPU recommended)
2. Support OpenAI as alternative provider (config already present, commented out)
3. Set aggressive timeouts (120s default) to prevent hanging
4. Cache embedding results to avoid redundant computation

**Contingency:** Uncomment and configure OpenAI provider. Switch embedding model to `text-embedding-3-small`. Decision queries fall back to keyword-only retrieval if LLM unavailable.

---

### R-005: Large File Upload Timeout
**Probability:** Medium (2) | **Impact:** Medium (2) | **Score:** 4

**Description:** Municipal documents (scanned PDFs) can exceed 200MB. Default HTTP timeouts and browser limitations may cause upload failures. Chunked upload (T-027) mitigates but adds complexity.

**Affected tasks:** T-014 (Document Service), T-027 (Chunked Upload)

**Mitigation:**
1. Chunked upload with 10MB chunks (T-027)
2. Configure Spring `spring.servlet.multipart.max-file-size: 500MB`
3. Frontend axios timeout increased for upload routes
4. Progress indicator for user feedback

**Contingency:** If chunked upload has issues, increase single-request limits to 500MB and add explicit upload timeout handling.

---

### R-006: PostgreSQL Full-Text Search Quality for German
**Probability:** Low (1) | **Impact:** Medium (2) | **Score:** 2

**Description:** PostgreSQL full-text search uses `tsvector` with language-specific stemming. German compound words (Rechtsschutzversicherungsgesellschaft) and umlauts may not stem correctly, reducing keyword search recall.

**Affected tasks:** T-031 (Hybrid Retrieval)

**Mitigation:**
1. Configure PostgreSQL with `german` text search dictionary
2. Vector search compensates for keyword misses via fusion
3. Test keyword recall with real German municipal queries

**Contingency:** Increase vector search weight in fusion to compensate. Add synonym dictionary for common municipal terms.

---

## Integration Risks

### R-007: Frontend-Backend DTO Mismatch
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** Frontend TypeScript types and backend Java DTOs must stay in sync. The architecture defines 30+ DTOs across auth, document, search, audit, and decision domains. A mismatch causes runtime errors that type checking won't catch.

**Affected tasks:** All frontend integration tasks (T-012 through T-020)

**Mitigation:**
1. Generate TypeScript types from Java DTOs (or maintain manually with strict review)
2. Integration tests verify actual API responses match expected types
3. Add JSON schema validation in API client
4. Document DTO contract changes in PR template

**Contingency:** Runtime validation in API client catches mismatches. Defensive rendering (optional chaining, fallback values) prevents crashes.

---

### R-008: Mock Service Residuals
**Probability:** Medium (2) | **Impact:** Medium (2) | **Score:** 4

**Description:** The frontend has extensive mock data in `src/mocks/`. During real API integration, some components may still reference mock data, causing confusing behavior where some data is real and some is fake.

**Affected tasks:** T-013 through T-020

**Mitigation:**
1. Grep for all mock imports before marking integration tasks complete
2. Remove mock files after real service is verified
3. Use environment variable `VITE_USE_MOCKS=false` to globally disable mocks
4. Add ESLint rule blocking mock imports in production services

**Contingency:** Remove mock directory entirely once integration is verified. Keep mocks only for unit tests.

---

## Testing Risks

### R-009: Frontend Test Coverage (0% → 80%)
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:** The frontend has 0 tests across 100 TSX files. Reaching 80% coverage requires ~40h of dedicated testing work. Components designed without testability in mind may need refactoring to be testable.

**Affected tasks:** T-049 (Frontend Unit Tests)

**Mitigation:**
1. Prioritize testing: services > common components > interaction components > pages
2. Use React Testing Library — test behavior, not implementation
3. Write tests alongside integration work, not as a separate phase
4. Start with "smoke tests" (does it render?) and increase depth incrementally

**Contingency:** If 80% is unreachable, target 60% line / 80% branch on critical paths (auth, decision, document upload).

---

### R-010: Testcontainers CI Performance
**Probability:** Medium (2) | **Impact:** Medium (2) | **Score:** 4

**Description:** Integration tests using Testcontainers (PostgreSQL, Qdrant) are slow to start and resource-intensive. CI runners may have insufficient resources or time out.

**Affected tasks:** T-048 (Backend Integration Tests), T-051 (E2E Tests)

**Mitigation:**
1. Use Testcontainers reuse mode in CI (keep containers between test classes)
2. Configure CI runner with sufficient resources (4 cores, 8GB RAM)
3. Parallelize test classes with JUnit Parallel Execution
4. Separate unit tests (fast) from integration tests (slow) in CI pipeline

**Contingency:** Run integration tests only on merge to master (not every push). Use mocked services for PR verification.

---

## Security Risks

### R-011: JWT Secret Exposure
**Probability:** Low (1) | **Impact:** Critical (3) | **Score:** 3

**Description:** The default JWT secret is hardcoded in `application.yml`: `change-this-development-secret-change-this-development-secret`. If this reaches production, anyone can forge tokens.

**Affected tasks:** T-056 (Secrets Management)

**Mitigation:**
1. T-056 moves all secrets to environment variables
2. Production startup fails if JWT secret equals the default value
3. `.env` in `.gitignore`, `.env.example` committed with placeholders
4. CI pipeline scans for hardcoded secrets

**Contingency:** Emergency rotation procedure documented in incident playbook (T-071).

---

### R-012: OWASP Top 10 Coverage
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** The platform handles municipal data including citizen names and case details. Incomplete security coverage on input validation, access control, or error handling could expose sensitive data.

**Affected tasks:** T-053 (CSP), T-054 (Rate Limiting), T-055 (Input Validation)

**Mitigation:**
1. OWASP dependency check in CI (T-002)
2. Input validation on all endpoints (T-055)
3. CSP headers (T-053)
4. Rate limiting on auth endpoints (T-054)
5. Security code review before pilot
6. Penetration testing before production (v1.0+)

**Contingency:** Security issues found after deployment require hotfix process defined in incident playbook.

---

## Deployment Risks

### R-013: Production PostgreSQL Migration
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** Switching from `ddl-auto: update` to Flyway migrations (T-068) is a one-way operation. An incorrect baseline migration could cause data loss or schema corruption.

**Affected tasks:** T-068 (Flyway Baseline)

**Mitigation:**
1. Generate baseline from actual schema dump, not hand-written
2. Run migration on a copy of production data first
3. Test rollback procedure
4. Take full backup before running first migration
5. Dry-run mode in CI

**Contingency:** Backup restoration procedure (T-069). If migration fails, restore from backup and fix migration, then re-run.

---

### R-014: K8s Configuration Complexity
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:** Kubernetes adds significant complexity. If the team lacks K8s experience, manifests may be incorrect, resource limits misconfigured, or networking broken.

**Affected tasks:** T-067 (Kubernetes Manifests)

**Mitigation:**
1. **Recommend deferring T-067 to v1.1.** Use docker-compose for pilot.
2. If K8s is mandatory, target single-node k3s which is simpler
3. Use Helm charts from Bitnami for PostgreSQL, Qdrant (don't hand-roll)
4. Test on minikube before any cloud deployment

**Contingency:** Fall back to docker-compose production profile (T-066). K8s can be added post-pilot.

---

### R-015: Network/DNS in Municipal Environments
**Probability:** Medium (2) | **Impact:** Medium (2) | **Score:** 4

**Description:** German municipal IT environments often have restricted networks, proxy servers, and air-gapped systems. The platform assumes internet access for Ollama model downloads.

**Affected tasks:** T-065 (Docker), T-001 (Dev Environment)

**Mitigation:**
1. Document offline model download procedure
2. Bundle models in Docker image for air-gapped deployment
3. All infrastructure runs locally (no cloud dependency)
4. Proxy configuration documented for all services

**Contingency:** Pre-download models during build. Use `docker save` / `docker load` for air-gapped transfer.

---

## People Risks

### R-016: Single Point of Knowledge
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** The architecture was designed by a single person. If that person is unavailable, decisions about design intent may be unclear. Domains like German municipal law (VgV, LHO, BRKG) require specific knowledge.

**Affected tasks:** All

**Mitigation:**
1. Architecture Handbook (already exists) documents design decisions
2. ADRs (20 exist) capture rationale
3. Pair programming on complex tasks
4. Knowledge transfer sessions in Sprint 1

**Contingency:** Escalation path to original architect documented. ADRs and handbook are comprehensive.

---

### R-017: German Legal Domain Knowledge Gap
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:** Engineers implementing procurement thresholds, salary tables, and travel allowances must understand German administrative law concepts. Misinterpreting "Lieferung/Dienstleistung" vs. "Bauleistung" could produce legally incorrect answers.

**Affected tasks:** T-021 (Procurement Categories), T-022 (DecisionRouter)

**Mitigation:**
1. Pair backend engineers with domain expert for procurement/TV-L/BRKG tasks
2. Document domain knowledge in `knowledge/` directory (already exists)
3. DecisionRouter tests use real German municipal questions
4. Eval dataset (T-072) validates legal correctness

**Contingency:** RuleEngine is deterministic and testable — wrong logic will be caught by tests. Domain expert reviews before pilot.

---

## Third-Party Dependency Risks

### R-018: Upstream Service Outages (Ollama, Qdrant, Neo4j)
**Probability:** Low (1) | **Impact:** Low (1) | **Score:** 1

**Description:** All third-party services run locally (Ollama, Qdrant, Neo4j). No external API dependencies at runtime. Outage risk is limited to local infrastructure failure.

**Affected tasks:** None specific

**Mitigation:**
1. Architecture already designed for graceful degradation
2. Health checks detect service failures
3. All services are optional except PostgreSQL

**Contingency:** Architecture guarantees make this low-risk by design.

---

### R-019: Model Deprecation (qwen2.5, nomic-embed-text)
**Probability:** Low (1) | **Impact:** Medium (2) | **Score:** 2

**Description:** Ollama models may be deprecated or replaced. The platform should not depend on a specific model version.

**Affected tasks:** T-013 (Decision Service)

**Mitigation:**
1. Model name is configuration, not hardcoded
2. ModelCapabilityRegistry abstracts provider selection
3. OpenAI provider alternative exists in config

**Contingency:** Change `OLLAMA_CHAT_MODEL` environment variable. No code change needed.

---

## Summary: High-Priority Risks (Score ≥ 6)

| ID | Risk | Score | Mitigation Status |
|---|---|---|---|
| R-001 | SSE Streaming Complexity | 6 | EventSource wrapper + polling fallback |
| R-004 | Ollama Model Performance | 6 | Hardware requirements doc + OpenAI alternative |
| R-007 | Frontend-Backend DTO Mismatch | 6 | Integration tests + JSON schema validation |
| R-009 | Frontend Test Coverage Gap | 6 | Prioritized testing + incremental approach |
| R-012 | OWASP Coverage | 6 | Security tasks (T-053–T-055) + code review |
| R-013 | Production DB Migration | 6 | Backup-first + dry-run + copy-testing |
| R-014 | K8s Complexity | 6 | Defer to v1.1, use docker-compose for pilot |
| R-016 | Single Point of Knowledge | 6 | Architecture docs + pairing + KT sessions |
| R-017 | German Legal Domain Gap | 6 | Domain expert pairing + test validation |

**9 high-priority risks — all have active mitigation plans.**
