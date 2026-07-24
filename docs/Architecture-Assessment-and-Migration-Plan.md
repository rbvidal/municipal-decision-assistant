# Architecture Assessment and Migration Plan

**Project:** Municipal Decision Assistant  
**Date:** 2026-07-23  
**Scope:** Full-stack architecture review — 9 Maven modules, React SPA frontend, infrastructure integration  
**Status:** Pre-migration analysis — no code changes  

---

## 1. Executive Summary

### What Is Well Designed

The project follows a **layered hexagonal (ports-and-adapters) architecture** across 9 Maven modules. Each module maintains clean separation between API interfaces (ports), application services (implementations), and infrastructure adapters (Qdrant, Neo4j, Ollama, PostgreSQL). This is technically sound architecture.

**Strengths:**

- **Module boundaries are correct.** `platform-ai`, `platform-search`, `platform-document`, `platform-workspace`, `platform-auth`, `platform-audit`, `platform-neo4j`, `platform-observability`, and `platform-api` each have a clear, distinct responsibility.
- **Every infrastructure dependency is optional with graceful degradation.** Qdrant (`NoOpVectorSearchProvider`), Neo4j (`NoOpGraphSearchProvider`), and Ollama all have conditional availability with sensible fallbacks. Health indicators report `DEGRADED` rather than `DOWN` when non-critical services are unavailable.
- **The AI pipeline is architecturally comprehensive.** Intent classification → domain gating → hybrid retrieval (keyword + vector + graph) → reranking → evidence packaging → prompt building → LLM inference → grounding → citations — every stage is independently instrumented, profiled, and auditable.
- **Audit infrastructure is well-integrated.** Every module publishes structured audit events through typed publisher interfaces (`AiAuditEvents`, `SearchAuditEvents`, `DocumentAuditEvents`, `AuthAuditEvents`, `WorkflowAuditEvents`).
- **Observability is production-grade.** Micrometer metrics (`AiMetrics` with percentile histograms), Micrometer Tracing spans (`PipelineTracingAspect`), and aggregated health indicators cover all infrastructure dependencies.
- **The ingestion pipeline is complete.** `DefaultDocumentIngestionProcessor` orchestrates text extraction (PDFBox/POI/Tika), chunking (sentence-aware or fixed-size), embedding (Ollama/nomic-embed-text), vector indexing (Qdrant), and enrichment (Neo4j) in a single coordinated flow.
- **The frontend component architecture is mature.** ~84 components across 14 phases, proper separation of common/data/navigation/search/decision-support/workflow/layout, TypeScript throughout, React Query for server state.

### What Has Architectural Debt

1. **The Knowledge page (`/api/knowledge`) is a complete mock.** `KnowledgeRestController` returns 7 hardcoded documents with in-memory `String.contains()` filtering. It bypasses the entire search infrastructure (Qdrant, keyword search, hybrid retrieval, reranking) that already exists and works in the decision support pipeline.

2. **Multiple REST controllers return hardcoded demo data.** `DashboardRestController`, `SupervisorRestController`, `UsersRestController`, `CorpusRestController` (except `/audit`), and `AdminHealthController` (except `/health`) all return static in-memory data with no database access.

3. **Frontend-backend field name mismatch is patched at the service layer.** `RestDocumentService` and `RestCaseService` now contain manual mapping functions (`mapDocument()`, `mapWorkspaceToCaseDetails()`) that translate English API field names to German frontend field names. This mapping belongs in a dedicated DTO layer or should be handled by consistent naming.

4. **Duplicate search implementations exist.** The knowledge page has its own in-memory search. The document search endpoint (`/api/documents/search`) does server-side filtering of pre-loaded results. The main search endpoint (`POST /api/search`) uses the full hybrid pipeline. Three different search code paths, only one of which is production-grade.

5. **`useCaseWorkspace` hook has hardcoded demo data fallback.** Three complete case definitions (ORD-2024-8812, BAU-2026-0092, GEW-2026-0147) with workflow steps, checklist items, documents, timeline events, and notes are hardcoded in the frontend. This masks API failures and means the UI never shows empty states honestly.

6. **The frontend production build was stale.** The `-Dskip.frontend.build=true` Maven flag means the JAR served an outdated frontend until a manual rebuild was performed. The dev workflow should either always build the frontend or document the rebuild step.

### What Should Remain Unchanged

- The 9-module Maven structure
- The hexagonal architecture with SPI interfaces
- The AI pipeline orchestration (`AiService` → `RetrievalOrchestrator` → `HybridRetrievalService` → `RerankingService` → `EvidencePackageBuilder` → `PromptBuilder` → `ChatCompletionProvider` → `GroundingService`)
- The ingestion pipeline (`DefaultDocumentIngestionProcessor`)
- The audit and observability infrastructure
- The frontend component library (~84 components)
- The API client layer (`ApiClient` with auth, retry, streaming)

### What Should Be Refactored

1. Replace `KnowledgeRestController` mock with a real endpoint backed by the existing hybrid retrieval pipeline
2. Replace remaining hardcoded controllers with real implementations or remove unused ones
3. Consolidate search implementations into a single unified pipeline
4. Standardize API field naming (English) and handle localization in the frontend
5. Remove hardcoded demo data from `useCaseWorkspace` and rely on real API responses

---

## 2. Original Architecture vs Current Implementation

### 2.1 Intended Architecture

The project vision (derived from the AI pipeline design, module structure, and enterprise patterns) intended:

```
Frontend (React SPA)
    ↓
REST API (platform-api controllers)
    ↓
Unified Retrieval Orchestrator (platform-ai)
    ↓
Hybrid Retrieval (platform-search)
    ├── Keyword Search (PostgreSQL full-text / JPA)
    ├── Vector Search (Qdrant via Ollama embeddings)
    └── Graph Search (Neo4j knowledge graph)
    ↓
Reranking (Ollama cross-encoder)
    ↓
Evidence Package Builder (platform-ai)
    ↓
Prompt Builder (platform-ai)
    ↓
LLM (Ollama / OpenAI)
    ↓
Grounding + Citations (platform-ai)
    ↓
Decision Package → Frontend
```

Every search should go through this pipeline. The Knowledge page should be a first-class consumer of hybrid retrieval. Document search should use the same infrastructure. Workspace search should contextualize retrievals.

### 2.2 Actual Architecture

```
Frontend (React SPA)
    ↓
Multiple REST controllers:
    ├── POST /api/search          → SearchService → DefaultHybridRetrievalService → PRODUCTION
    ├── GET  /api/knowledge/search → KnowledgeRestController → String.contains() → MOCK
    ├── GET  /api/documents/search → DocumentController → in-memory filter → DEGRADED
    ├── POST /api/decision/{id}/analyze → DecisionController → AiService → PRODUCTION
    └── GET  /api/dashboard/*     → DashboardRestController → hardcoded → MOCK
```

### 2.3 Deviations

| Component | Intended | Actual | Severity |
|---|---|---|---|
| Knowledge search | Hybrid retrieval pipeline | 7 hardcoded docs, substring match | High |
| Dashboard | Real stats from DB/metrics | 6 hardcoded stats, 5 cases | Medium |
| Supervisor cases | Real workspace data | 3 hardcoded cases | Medium |
| User management | Real user CRUD | 7 hardcoded users | Medium |
| Corpus packages | Real corpus inventory | 3 hardcoded entries | Medium |
| Document search | Hybrid retrieval | In-memory stream filter of pre-loaded page | Medium |
| Admin jobs | Real ingestion job data | 2 hardcoded entries | Low |
| Admin audit | Real audit events | 5 hardcoded entries (but `/api/corpus/audit` is real) | Low |

### 2.4 Duplicated Functionality

| Function | Location 1 | Location 2 | Location 3 |
|---|---|---|---|
| Search | `SearchService` (hybrid, production) | `KnowledgeRestController.search()` (mock) | `DocumentController.search()` (in-memory filter) |
| Document listing | `DocumentController.find()` (paginated, real) | `KnowledgeRestController.getAll()` (mock) | — |
| Case/workspace data | `WorkspaceController` (real DB) | `SupervisorRestController` (mock) | `useCaseWorkspace` demo fallback |
| Audit logs | `AuditController` (real, ADMIN-only) | `CorpusRestController.getAuditLogs()` (real, via AuditService) | `AdminHealthController.getAuditLogs()` (mock) |

### 2.5 Mock Implementations

All mocks are concentrated in `platform-api/.../api/web/`:

- **`KnowledgeRestController`** — 7 hardcoded German legal documents, in-memory filter, no DB/Qdrant/Neo4j
- **`DashboardRestController`** — 6 stats, 5 cases, 1 task, 3 suggestions — all hardcoded
- **`SupervisorRestController`** — 3 cases with detailed fields — hardcoded
- **`UsersRestController`** — 7 users — hardcoded (toggle mutates in-memory list)
- **`AdminHealthController`** — Jobs and audit sections hardcoded; only `/health` is real
- **`CorpusRestController`** — Packages, metrics, jobs hardcoded; only `/audit` is real

### 2.6 Unfinished Components

- **`DraftTab`** — placeholder with `EmptyState`, no draft generation UI
- **`SendTab`** — placeholder with `EmptyState`, no document sending UI
- **`useCaseWorkspace.addNote`** — returns stub empty note (not persisted)
- **`useCaseWorkspace.uploadDocument`** — returns stub (not persisted)
- **`useCaseWorkspace.toggleChecklistItem`** — in-memory only (not persisted)
- **`caseService.toggleChecklistItem`** — returns `Promise.resolve()` (no backend call)
- **`caseService.addNote`** — returns stub note with empty fields
- **`caseService.uploadDocument`** — returns stub with empty fields

---

## 3. Search and AI Pipeline Analysis

### 3.1 Every Search Implementation

#### 3.1.1 Main Search (`POST /api/search`)

- **Location:** `SearchController` → `SearchService` → `DefaultHybridRetrievalService`
- **Purpose:** Primary application search
- **Technologies:** PostgreSQL JPA (keyword), Qdrant (vector via Ollama embeddings), Neo4j (graph, conditional)
- **Production-ready:** Yes
- **Should remain:** Yes

#### 3.1.2 Knowledge Search (`GET /api/knowledge/search`)

- **Location:** `KnowledgeRestController`
- **Purpose:** Knowledge base browsing
- **Technologies:** In-memory `ArrayList`, `String.contains()` filter
- **Production-ready:** No
- **Should remain:** No — replace with unified pipeline

#### 3.1.3 Document Search (`GET /api/documents/search`)

- **Location:** `DocumentController.search()`
- **Purpose:** Search within documents
- **Technologies:** Loads all documents (paginated, up to 200), filters in-memory by title/category
- **Production-ready:** Partially (works for small datasets)
- **Should remain:** Replace with unified pipeline or delegate to main search

#### 3.1.4 Decision Support Search (`POST /api/decision/{caseId}/analyze`)

- **Location:** `DecisionController` → `AiService` → `RetrievalOrchestrator` → `DefaultHybridRetrievalService`
- **Purpose:** AI-powered decision analysis within workspace context
- **Technologies:** Full pipeline — intent classification, hybrid retrieval, reranking, evidence packaging, prompt building, LLM, grounding
- **Production-ready:** Yes
- **Should remain:** Yes

### 3.2 Comparison Table

| Capability | Main Search | Knowledge Search | Document Search | Decision Support |
|---|---|---|---|---|
| Keyword search | PostgreSQL JPA | `String.contains()` | Stream filter | PostgreSQL JPA |
| Vector search | Qdrant (768d) | — | — | Qdrant (768d) |
| Graph search | Neo4j (conditional) | — | — | Neo4j (conditional) |
| Hybrid retrieval | Yes (keyword+vector+graph) | — | — | Yes |
| Reranking | Ollama cross-encoder | — | — | Ollama cross-encoder |
| Evidence package | — | — | — | Yes |
| Prompt builder | — | — | — | Yes (compact-v8) |
| LLM reasoning | — | — | — | Ollama/OpenAI |
| Citations | Yes (chunk-level) | — | — | Yes (structured) |
| Confidence scoring | — | — | — | Yes (multi-axis) |
| Pagination | Yes | — | — | — |
| Audit events | Yes | — | — | Yes |
| Production readiness | **Production** | **Mock** | **Degraded** | **Production** |

### 3.3 The Production Pipeline (Decision Support)

This is the reference implementation. Every other search should route through it or a simplified variant:

```
1. DecisionRouter.classify(question)
   ├── RULE_ENGINE → RuleEngine.evaluate() → KnowledgeRegistry tables → deterministic answer
   └── HYBRID_RETRIEVAL / GRAPH_REASONING →
       2. QueryIntentClassifier.classify(query) → Intent
       3. RetrievalPlanner.plan(query) → RetrievalPlan (domain, collections, strategy)
       4. DefaultHybridRetrievalService.retrieve(query, plan)
          ├── JpaKeywordSearchProvider.search() → PostgreSQL
          ├── QdrantVectorSearchProvider.search() → Qdrant (768d, Cosine)
          └── GraphSearchProvider.search() → Neo4j (conditional)
       5. Merge + deduplicate (by chunk ID, then by document ID)
       6. OllamaRerankingProvider.rerank() → cross-encoder + domain boosting
       7. DomainGate.filter() → domain relevance check
       8. DefaultRetrievalAugmentationService.retrieve() → diversity-aware sampling
       9. EvidencePackageBuilder.build() → compact evidence package
       10. EvidenceCoverageValidator.validate() → coverage completeness
       11. DefaultPromptBuilder.build() → German prompt (compact-v8 template)
       12. ChatCompletionProvider.chat() → Ollama / OpenAI
       13. DefaultGroundingService.ground() → answer grounded against evidence
       14. DefaultStructuredAnswerAssembler.assemble() → labeled sections
       15. PipelineProfiler → timing of every stage
```

---

## 4. Duplicated Logic

### 4.1 Retrieval

| Duplication | Locations | Why It Exists | Should Remove? | Replacement |
|---|---|---|---|---|
| Search execution | `SearchService`, `KnowledgeRestController`, `DocumentController.search()` | Incremental development, demo scaffolding | Yes | Route all searches through `SearchFacade` or a new `UnifiedSearchService` |
| Document listing | `DocumentController.find()`, `KnowledgeRestController.getAll()` | Knowledge mock never replaced | Yes | Knowledge page calls `/api/documents` or new knowledge endpoint backed by real data |

### 4.2 DTO Mapping

| Duplication | Locations | Why It Exists | Should Remove? | Replacement |
|---|---|---|---|---|
| Document mapping | `RestDocumentService.mapDocument()`, `useCaseWorkspace` (inline, now removed) | API field name mismatch (English vs German) | Consolidate | Single mapper in service layer; consider consistent API field naming |
| Workspace mapping | `RestCaseService.mapWorkspaceToCaseDetails()`, `useCaseWorkspace.getDemoCase()` | API workspace shape ≠ CaseDetails shape | Keep mapper; remove demo fallback | Clean separation: real data from API, demo only for development |

### 4.3 UI Logic

| Duplication | Locations | Why It Exists | Should Remove? | Replacement |
|---|---|---|---|---|
| AI question input | `DecisionSupportTab`, `AIAssistantPage` | Two entry points for AI | Keep both, unify via shared component | Extract `AIQuestionInput` component |
| Document list | `DocumentsPage`, `DocumentsTab`, `DocumentListWidget` | Different contexts | No — different data sources, appropriate | Keep, ensure consistent sorting/filtering |

### 4.4 Mock Data

| Mock | Location | Real Equivalent | Recommendation |
|---|---|---|---|
| 7 knowledge documents | `KnowledgeRestController` | `DocumentController` (45 real docs) | Delete mock, wire to real data |
| 5 dashboard cases | `DashboardRestController` | `WorkspaceController` (real workspaces) | Delete mock, aggregate real stats |
| 3 supervisor cases | `SupervisorRestController` | `WorkspaceController` | Delete mock or wire to real |
| 7 users | `UsersRestController` | `AuthService` (real user accounts) | Wire to real user repository |
| 3 corpus packages | `CorpusRestController` | `CorpusManifestService` | Wire to real manifest data |
| 3 demo cases in frontend | `useCaseWorkspace.demoCases` | API response | Remove, show empty states honestly |

---

## 5. Target Architecture

### 5.1 Unified Search and Knowledge Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                   │
│                                                          │
│  KnowledgePage  DocumentsPage  SearchPage  DecisionTab   │
│       │              │             │            │         │
│       ▼              ▼             ▼            ▼         │
│  knowledgeService documentService searchService decisionService │
│       │              │             │            │         │
└───────┼──────────────┼─────────────┼────────────┼─────────┘
        │              │             │            │
        ▼              ▼             ▼            ▼
┌─────────────────────────────────────────────────────────┐
│                 REST API (platform-api)                   │
│                                                          │
│  GET /api/knowledge/search   ──┐                         │
│  GET /api/documents/search   ──┤                         │
│  POST /api/search             ──┼── UnifiedSearchEndpoint │
│  POST /api/decision/analyze   ──┘    (new or refactored) │
│                                       │                   │
└───────────────────────────────────────┼───────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────┐
│           Unified Retrieval Orchestrator                  │
│              (platform-ai)                                │
│                                                          │
│  SearchOrchestrator (new)                                │
│  ├── QueryIntentClassifier                               │
│  ├── RetrievalPlanner                                    │
│  └── SearchFacade (platform-search)                      │
│       ├── JpaKeywordSearchProvider                       │
│       ├── QdrantVectorSearchProvider                     │
│       └── GraphSearchProvider (Neo4j)                    │
│                                                          │
│  Optional AI depth:                                       │
│  ├── RerankingService (Ollama cross-encoder)             │
│  ├── EvidencePackageBuilder                              │
│  ├── PromptBuilder                                       │
│  └── ChatCompletionProvider → Grounded Answer            │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Layer Responsibilities

| Layer | Responsibility | Module |
|---|---|---|
| **Frontend Pages** | Render UI, manage local state, call service hooks | `frontend/src/pages/` |
| **Frontend Hooks** | React Query cache, mutation lifecycle | `frontend/src/hooks/` |
| **Frontend Services** | API client calls, DTO mapping | `frontend/src/services/` |
| **REST Controllers** | HTTP request/response, validation, auth | `platform-api` |
| **Search Orchestrator** | Route search requests to retrieval, optional AI depth | `platform-ai` (new) |
| **Retrieval Pipeline** | Keyword + vector + graph, merge, dedup | `platform-search` |
| **Reranking** | Cross-encoder relevance scoring, domain boosting | `platform-search` |
| **Evidence Package** | Compact evidence from retrieval sources | `platform-ai` |
| **Prompt Builder** | German-language evidence-first prompts | `platform-ai` |
| **LLM Provider** | Ollama/OpenAI chat completion | `platform-ai` |
| **Grounding** | Answer validation against evidence, citations | `platform-ai` |
| **Knowledge Registry** | Structured tables (salary, travel, thresholds) | `platform-ai` |
| **Document Store** | Document CRUD, versioning, ingestion | `platform-document` |
| **Workspace Store** | Workspace CRUD, phases, timeline | `platform-workspace` |
| **Auth** | JWT, refresh tokens, user management | `platform-auth` |
| **Audit** | Structured event logging | `platform-audit` |
| **Observability** | Health, metrics, tracing | `platform-observability` |
| **Graph** | Neo4j enrichment, traversal | `platform-neo4j` |

---

## 6. Migration Plan

### Phase 1: Knowledge Page — Real Search Backend

**Goal:** Replace the `KnowledgeRestController` mock with a real endpoint backed by the existing hybrid retrieval pipeline.

**Files affected:**
- `KnowledgeRestController.java` — rewrite to delegate to `SearchFacade`
- `SearchFacade.java` — possibly add a simplified search method
- `RestKnowledgeService.ts` — may need minor adjustments for new response shape
- `KnowledgePage.tsx` — no changes (UI already done)

**Risk:** Low. The existing pipeline is proven. The knowledge page currently shows 7 docs; after migration it will show all indexed documents.

**Dependencies:** None. The search infrastructure is already running.

**Estimated effort:** 2-4 hours.

**Rollback:** Revert to mock controller. No database changes.

### Phase 2: Dashboard — Real Aggregation

**Goal:** Replace `DashboardRestController` mock with real aggregated data from workspaces, documents, and metrics.

**Files affected:**
- `DashboardRestController.java` — rewrite to query real services
- `DashboardService.java` (new) — aggregate stats from WorkspaceService, DocumentService, AiMetrics
- `DashboardResponse.java` — may need field adjustments

**Risk:** Low-Medium. Requires querying multiple services. Dashboard is read-only.

**Dependencies:** Phase 1 complete (knowledge search available).

**Estimated effort:** 3-5 hours.

**Rollback:** Revert to mock controller.

### Phase 3: Unified Search Endpoint

**Goal:** Route all searches (knowledge, documents, main) through a single `SearchOrchestrator` that provides consistent hybrid retrieval with configurable AI depth.

**Files affected:**
- `SearchOrchestrator.java` (new, in `platform-ai`) — unified search entry point
- `KnowledgeRestController.java` — delegate to SearchOrchestrator
- `DocumentController.search()` — delegate to SearchOrchestrator
- `SearchController.java` — delegate to SearchOrchestrator
- `RestKnowledgeService.ts` — update if response shape changes

**Risk:** Medium. Changes the search path for multiple endpoints. All have existing tests.

**Dependencies:** Phase 1 complete.

**Estimated effort:** 5-8 hours.

**Rollback:** Revert individual controllers to previous implementations.

### Phase 4: Remove Hardcoded Controllers

**Goal:** Wire remaining mock controllers to real services or remove them if unused.

**Files affected:**
- `SupervisorRestController.java` — wire to WorkspaceService
- `UsersRestController.java` — wire to UserAccountRepository
- `CorpusRestController.java` — wire to CorpusManifestService (packages), real Qdrant metrics
- `AdminHealthController.java` — remove hardcoded jobs/audit/departments

**Risk:** Low. These are admin/supervisor endpoints, not critical path.

**Dependencies:** None.

**Estimated effort:** 3-5 hours.

**Rollback:** Revert individual controllers.

### Phase 5: Frontend Cleanup

**Goal:** Remove hardcoded demo data, wire mutation stubs to real backend calls.

**Files affected:**
- `useCaseWorkspace.ts` — remove `demoCases` map and fallback logic
- `RestCaseService.ts` — implement `toggleChecklistItem()`, `addNote()`, `uploadDocument()` stubs
- `WorkspaceController.java` — ensure checklist/notes endpoints persist data (verify, may already work)

**Risk:** Medium. Changes UI behavior — empty states will show instead of demo data. This is correct behavior.

**Dependencies:** Backend endpoints must be verified to return real data (or proper empty states).

**Estimated effort:** 4-6 hours.

**Rollback:** Restore demo fallback in `useCaseWorkspace`.

### Phase 6: Naming Standardization

**Goal:** Standardize API field names to English, move localization to frontend only.

**Files affected:**
- All `*Response.java` DTOs — review field names
- `RestDocumentService.ts` — simplify mapper once field names match
- `RestCaseService.ts` — simplify mapper
- `domain.ts` — may simplify `DocumentItem`/`CaseDetails` types

**Risk:** High. Breaking API change. Requires coordinated frontend rebuild.

**Dependencies:** All previous phases complete.

**Estimated effort:** 6-10 hours.

**Rollback:** API versioning or revert. This phase is optional and can be deferred.

---

## 7. Test Impact Analysis

### 7.1 Existing Tests

**Backend (JUnit/Spring Boot):**
- Platform-api tests: Controller integration tests for auth endpoints
- Module-level unit tests: Document, workspace, auth, search
- No dedicated tests found for: `KnowledgeRestController`, `DashboardRestController`, `SupervisorRestController`, `UsersRestController`

**Frontend (Playwright):**
- `e2e-tests/acceptance.spec.ts` — broken (calling `test.describe()` in config context)
- `e2e-tests/exploratory.spec.ts` — broken (same issue)
- 39/57 Playwright tests pass; 18 are OUTDATED (stale pre-SPA selectors)

**k6 Load Tests:**
- `k6-scripts/01-smoke-test.js` to `08-long-session.js` — all operational after fixes
- Tests cover: auth, search, documents, upload, admin, AI validation, long session

### 7.2 Categorization

| Test | Category | Reason |
|---|---|---|
| Playwright acceptance spec | **REWRITE** | Broken configuration, pre-SPA selectors |
| Playwright exploratory spec | **REWRITE** | Broken configuration |
| k6 01-smoke | **KEEP** | Deployment gate, no changes needed |
| k6 02-daily | **KEEP** | Baseline load test |
| k6 03-peak | **MODIFY** | Rate limit fix still needed (shared token pool) |
| k6 04-ai-validation | **KEEP** | AI behaviour validation, works correctly |
| k6 05-search | **MODIFY** | Thresholds need adjustment for local dev |
| k6 06-upload | **MODIFY** | Rate-limited endpoint needs test redesign |
| k6 07-admin | **KEEP** | Admin ops, works correctly |
| k6 08-long-session | **KEEP** | Stability test, valuable for leak detection |
| Backend unit tests | **KEEP** | Core domain logic |
| Backend integration tests | **KEEP** | Auth endpoints verified |

### 7.3 Tests That Need Creation

1. **Knowledge search integration test** — verify new unified search endpoint returns results from Qdrant/PostgreSQL
2. **Dashboard aggregation test** — verify real stats match expected ranges
3. **Playwright page smoke tests** — one per page (home, documents, knowledge, work, admin, audit)
4. **AI pipeline integration test** — end-to-end: question → intent → retrieval → answer with citations

---

## 8. Code Removal

### 8.1 After Phase 1 (Knowledge Search)

- `KnowledgeRestController.createDocuments()` — the 7 hardcoded documents
- `KnowledgeRestController.DOCUMENTS` — the static list

### 8.2 After Phase 3 (Unified Search)

- `DocumentController.search()` — the in-memory filter method (replace with delegation)
- `KnowledgeRestController.search()` — the `String.contains()` logic (replace with delegation)

### 8.3 After Phase 4 (Remove Mocks)

- `DashboardRestController` — entire class (or rewrite with real data)
- `SupervisorRestController` — 3 hardcoded cases
- `UsersRestController` — 7 hardcoded users (wire to real or remove if `/api/admin/users` not needed)
- `AdminHealthController.getJobs()` — 2 hardcoded entries
- `AdminHealthController.getAuditLogs()` — 5 hardcoded entries
- `AdminHealthController.getDepartments()` — 4 hardcoded entries
- `CorpusRestController.getPackages()` — 3 hardcoded entries
- `CorpusRestController.getMetrics()` — hardcoded Qdrant metrics
- `CorpusRestController.getJobs()` — 2 hardcoded entries

### 8.4 After Phase 5 (Frontend Cleanup)

- `useCaseWorkspace.demoCases` — the entire 135-line `demoCases` map (3 cases with full data)
- `useCaseWorkspace.getDemoCase()` — the fallback function
- `useCaseWorkspace` — inline document mapping logic (already simplified)

### 8.5 After Phase 6 (Naming Standardization)

- `RestDocumentService.mapDocument()` — simplify if field names match
- `RestCaseService.mapWorkspaceToCaseDetails()` — simplify

---

## 9. Risks

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Breaking API compatibility during naming standardization | High | High | Defer to last phase; use API versioning if needed |
| Performance regression from unified search | Low | Medium | The existing hybrid pipeline already handles production load; knowledge search currently does no work |
| Lost demo data breaks UI expectations | Medium | Medium | Phase 5 removes demo fallback; ensure real data is seeded by `DemoDataInitializer` |
| Search behavior change for knowledge page | Low | Low | Results will improve (real retrieval vs substring match) |
| Increased coupling from shared orchestrator | Low | Medium | The orchestrator is a facade; underlying providers remain independent |

### 9.2 Process Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Stale frontend build in JAR | High | High | Remove `-Dskip.frontend.build=true` from dev workflow or document mandatory rebuild |
| Test coverage gaps after migration | Medium | Medium | Create new integration tests in Phase 1, verify with k6 suite |
| Incomplete migration leaves mixed mock/real state | Medium | Medium | Each phase is independently completable and testable |

---

## 10. Recommendation

### Incremental Refactoring Is Sufficient

A larger redesign is **not** justified. The core architecture is sound:

- The 9-module hexagonal structure is correct and should remain
- The AI pipeline is production-quality and needs no redesign
- The search infrastructure (hybrid retrieval, reranking, Qdrant, Neo4j) is already built and operational
- The frontend component library is mature and well-structured

The problems are all in the **integration layer** — mock controllers that were built for early demos and never replaced with real implementations. This is a common pattern in incremental development and is fixed by methodically replacing each mock with a real implementation backed by the existing infrastructure.

### Recommended Implementation Order

```
Phase 1: Knowledge search → hybrid retrieval     [2-4h]  ← Start here
Phase 2: Dashboard → real aggregation            [3-5h]
Phase 3: Unified search endpoint                 [5-8h]  ← Highest value
Phase 4: Remove remaining mocks                  [3-5h]
Phase 5: Frontend demo data cleanup              [4-6h]
Phase 6: Naming standardization (optional)       [6-10h] ← Defer
```

**Total estimated effort: 17-28 hours** (Phases 1-5, excluding Phase 6)

**Phase 1 should begin immediately.** Replacing the Knowledge page mock with the real hybrid retrieval pipeline delivers the highest user-visible impact (transforms a broken feature into an AI-powered search) with the lowest risk (the pipeline is already proven in the Decision Support tab). All subsequent phases build on this foundation.
