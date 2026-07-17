# Architecture Verification Checklist

**Purpose:** After every milestone, verify that the implementation still follows the frozen architecture. This is an architecture compliance audit — NOT a redesign.

**Architecture frozen:** 2026-07-17 (v1.0-architecture-complete)
**Review cadence:** End of every slice

---

## Slice-Level Review

After each slice, answer every question. Any NO answer requires either a fix (before the next slice) or a documented exception with justification.

### Slice 0: Developer Environment
- [ ] Are all 9 Maven modules still present and compiling?
- [ ] Are module dependency directions still correct (higher → lower, never reverse)?
- [ ] Is `docker-compose.yml` unchanged (same services, same ports)?
- [ ] Are any new dependencies added to POMs? If yes, are they behind interfaces?
- [ ] Is `application.yml` configuration-driven (no hardcoded values except dev defaults)?
- [ ] Can the system start with only PostgreSQL (Qdrant/Neo4j/Ollama optional)?

### Slice 1: Document Pipeline
- [ ] Does text extraction use the `TextExtractionService` interface (not a specific implementation)?
- [ ] Is the fallback chain PDFBox → Tika (not hardcoded to one library)?
- [ ] Are chunking parameters in `application.yml` (not hardcoded)?
- [ ] Does the ingestion pipeline emit metrics through `Micrometer` (not custom logging)?
- [ ] Are documents stored via `DocumentStorageService` interface?
- [ ] Can ingestion run without Ollama (embeddings skipped, not crashed)?
- [ ] Are DTOs clean — no business logic, no service references?

### Slice 2: Search & Retrieval
- [ ] Does `HybridRetrievalService` return results when Qdrant is down (keyword only)?
- [ ] Are fusion weights configurable (not hardcoded 0.5/0.5)?
- [ ] Does `CitationService` format citations — not the controller or the frontend?
- [ ] Are search results typed as `SearchResultResponse` DTO (not raw Qdrant/PostgreSQL types)?
- [ ] Can search work without Neo4j graph enrichment?

### Slice 3: Decision Engine
- [ ] Does `DecisionRouter` correctly classify questions before any retrieval?
- [ ] Does RuleEngine lookup use `KnowledgeRegistry` (not direct table access)?
- [ ] Is `DecisionResult` still a sealed interface with exactly 4 subtypes?
- [ ] Are all DecisionPackage DTOs immutable (records, not mutable beans)?
- [ ] Does the HYBRID_RETRIEVAL path assemble `EvidencePackage` before LLM call?
- [ ] Is the LLM provider behind `ModelProvider` interface (not hardcoded Ollama)?
- [ ] Are prompts loaded from `PromptRegistry` (not string literals in service code)?
- [ ] Does `DecisionResult` include `strategy()`, `source()`, and `confidence()`?
- [ ] Can decisions work without Neo4j (graph enrichment skipped)?
- [ ] Can decisions work without Ollama (with appropriate degradation)?

### Slice 4: Authentication & App Shell
- [ ] Are JWT tokens stored in memory only (verified: no localStorage access in auth code)?
- [ ] Is token refresh handled by an interceptor (not duplicated in every service)?
- [ ] Do protected routes redirect to /login (not show blank page)?
- [ ] Is `AuthService` behind an interface (not called directly from controllers)?
- [ ] Are auth DTOs (`LoginRequest`, `RegisterRequest`, `AuthResponse`) unchanged?
- [ ] Are navigation components free of business logic (only UI, no API calls directly)?
- [ ] Is the frontend routing structure unchanged (same routes, same lazy loading)?

### Slice 5: Case Workspace
- [ ] Does the case workspace use the existing `WorkspaceService` interface?
- [ ] Are case DTOs separate from workspace DTOs (no field leakage)?
- [ ] Is the case header data from a single API call (not N+1 queries)?
- [ ] Are case tabs implemented as route segments (not conditional rendering)?
- [ ] Do documents in case tabs filter by case ID (not global document list)?
- [ ] Is document scoping enforced server-side (not just client-side filtering)?
- [ ] Is the breadcrumb rule still: Startseite > Meine Arbeit > CASE-ID > Tab?

### Slice 6: Corpus Administration
- [ ] Are admin endpoints behind `ADMIN` role (not `USER`)?
- [ ] Is the corpus health dashboard read-only (no mutations from GET)?
- [ ] Are admin DTOs separate from user-facing DTOs?
- [ ] Is batch import idempotent (re-running doesn't duplicate documents)?

### Slice 7: Testing Coverage
- [ ] Do tests test behavior, not implementation (can you refactor without breaking tests)?
- [ ] Are Testcontainers used (not embedded databases)?
- [ ] Do integration tests verify the actual JSON contract (not mock JSON)?
- [ ] Are test configurations isolated from production configuration?
- [ ] Do E2E tests run against real docker-compose services?

### Slice 8: Security Hardening
- [ ] Is CSP policy configuration-driven (not hardcoded in filter)?
- [ ] Are rate limits in `application.yml` (not hardcoded in interceptor)?
- [ ] Is XSS filtering applied generically (not per-endpoint)?
- [ ] Are secrets loaded from environment variables (verified: no secrets in any committed file)?
- [ ] Is HTTPS configuration profile-based (dev vs. prod)?

### Slice 9: Observability
- [ ] Is tracing via OpenTelemetry API (not vendor-specific SDK)?
- [ ] Are custom spans at service boundaries (not inside private methods)?
- [ ] Is structured logging via logback profile (not code-level JSON serialization)?
- [ ] Do health indicators implement Spring's `HealthIndicator` interface?
- [ ] Is DEGRADED distinct from DOWN (optional services degrade, critical services fail)?

### Slice 10: CI/CD Pipeline
- [ ] Does CI run the same commands as local development (no CI-specific workarounds)?
- [ ] Is the Docker image built from the multi-stage Dockerfile (not a different one)?
- [ ] Are smoke tests the same E2E tests from Slice 7?
- [ ] Does CD deploy the same artifact that CI tested?

### Slice 11: Production Deployment
- [ ] Is the Dockerfile multi-stage (build → runtime)?
- [ ] Does the runtime image run as non-root?
- [ ] Are Flyway migrations in `platform-api/src/main/resources/db/migration/`?
- [ ] Is `ddl-auto: validate` (not `update`, not `create-drop`)?
- [ ] Are backups stored outside the Docker container (volume mount or S3)?
- [ ] Is the restore procedure documented and tested?

### Slice 12: Production Readiness
- [ ] Does load testing match real usage patterns (not synthetic benchmarks)?
- [ ] Does chaos testing verify the architecture's degradation guarantees (not random failures)?
- [ ] Are all 10 DecisionPackage DTOs backwards-compatible with v0.1?
- [ ] Does the API reference match actual endpoint behavior?
- [ ] Are all architecture diagrams in the operations manual accurate?

---

## Cross-Cutting Verification (Every Slice)

These questions apply to every slice, every time:

### Module Boundaries
- [ ] Did any module gain a dependency on a higher module?
- [ ] Did any API interface change signature (breaking existing implementations)?
- [ ] Did any module's responsibility expand beyond its original scope?
- [ ] Are all new classes in the correct module?

### DTO Integrity
- [ ] Are all DTOs records or immutable classes (no setters)?
- [ ] Do DTOs contain only data (no business logic, no service calls)?
- [ ] Are JSON annotations on DTOs only (not on domain objects)?
- [ ] Are request DTOs validated with `@Valid` annotations?

### API Consistency
- [ ] Are error responses always `ErrorResponse` DTO (not arbitrary JSON)?
- [ ] Are all endpoints prefixed with `/api/` (except page controllers)?
- [ ] Do POST endpoints use `@RequestBody` (not query params for complex data)?
- [ ] Are response codes consistent (201 for create, 200 for update, 204 for delete)?

### Coupling
- [ ] Is every external dependency behind an interface?
- [ ] Are there any `new` operator calls to infrastructure classes in business logic?
- [ ] Are configuration values injected (not read from files or env directly in services)?
- [ ] Can each service be tested in isolation with mocks?

### God Object Detection
- [ ] Does any class exceed 300 lines?
- [ ] Does any class have more than 10 public methods?
- [ ] Does any class have more than 5 constructor dependencies?
- [ ] Does any class reference more than 3 other modules?

If YES to any: that class is a candidate for refactoring. Not necessarily wrong, but requires justification.

### Performance
- [ ] Has any endpoint latency increased > 20% from baseline?
- [ ] Has any page load time increased > 500ms?
- [ ] Has the Docker image size increased > 50MB?
- [ ] Has the build time increased > 2 minutes?

### Prompt & LLM Budget
- [ ] Are all prompt templates still in `PromptRegistry`?
- [ ] Has any prompt exceeded `max-prompt-length` (3800 chars)?
- [ ] Is every LLM call still logged with prompt version, model, and latency?
- [ ] Can every LLM call be traced to its source document?

### Retrieval Quality
- [ ] Does hybrid fusion still produce better results than keyword-only or vector-only?
- [ ] Are deduplication rates reasonable (< 10% duplicates in top 20)?
- [ ] Are citation links still valid (no broken chunk anchors)?
- [ ] Does the retrieval path still work with Qdrant down?

### GraphRAG Value
- [ ] Does graph enrichment improve answer quality measurably?
- [ ] Are graph queries performant (< 500ms)?
- [ ] Does the system still work when Neo4j is unavailable?
- [ ] Are graph nodes and relationships still auto-generated (not manually curated)?

### Simplification Opportunity
- [ ] Can any recently added code be simplified now that the full picture is clear?
- [ ] Are there any abstractions that turned out to be unnecessary?
- [ ] Are there any duplicated patterns that should be consolidated?
- [ ] Is there any dead code (unused imports, unreachable branches, leftover mock data)?

---

## Final Architecture Sign-off (Before v1.0)

Before tagging `v1.0-pilot-ready`, the architecture must pass this final review:

- [ ] All 9 modules compile without circular dependencies (`mvn dependency:analyze`)
- [ ] All interfaces have exactly the implementations defined in the architecture (no extras, no missing)
- [ ] All DTOs match the documented JSON contract (verify with round-trip tests)
- [ ] All degradation paths verified (kill each service, verify system degrades gracefully)
- [ ] All provider abstractions intact (swap Ollama for OpenAI in config — system still works)
- [ ] No business logic in controllers (controllers only: validate, delegate, return)
- [ ] No infrastructure code in domain services (services only: orchestrate, don't connect to DB/Qdrant/Neo4j directly)
- [ ] All configuration externalized (no hardcoded URLs, keys, sizes, timeouts)
- [ ] Module dependency direction: api → ai/search/document/auth/audit/neo4j/workspace → observability → (no further dependencies)
- [ ] Architecture matches the Architecture Handbook (read the handbook, compare to code)

**Architecture Reviewer:** _________________
**Date:** _________________
**Result:** PASS / FAIL with exceptions (list below)

**Exceptions (if any):**
1. 
2. 
3. 

---

## Quick Verification Command

Run this after every slice to check for common violations:

```bash
# Check for circular dependencies
mvn dependency:analyze -pl platform-api 2>&1 | grep -i "circular"

# Check for hardcoded secrets
grep -r "password\|secret\|api.key\|token" --include="*.yml" --include="*.properties" \
  | grep -v "password:" | grep -v "platform" | grep -v "change-this"

# Check for direct Qdrant/Ollama/Neo4j imports in business logic
grep -r "import.*qdrant\|import.*ollama\|import.*neo4j" \
  --include="*.java" platform-ai/src/main/java/ platform-api/src/main/java/ \
  | grep -v "config/" | grep -v "health/"

# Check for files exceeding 300 lines
find . -name "*.java" -exec wc -l {} + | awk '$1 > 300 {print $2, $1}' | sort -k2 -rn

# Check test counts
mvn test 2>&1 | grep "Tests run:"
cd frontend && npm test -- --coverage 2>&1 | grep "Tests:"
```
