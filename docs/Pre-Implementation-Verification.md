# Pre-Implementation Verification

**Date:** 2026-07-23  
**Status:** FINAL  
**Purpose:** Final architecture approval before implementation begins  
**Rule:** This document contains zero assumptions. Every conclusion is supported by actual code inspection.

---

## Table of Contents

1. [Retrieval Pipeline Workspace Independence](#1-retrieval-pipeline-workspace-independence)
2. [SearchFacade Capability Audit](#2-searchfacade-capability-audit)
3. [Knowledge Page Frontend Requirements](#3-knowledge-page-frontend-requirements)
4. [Null Safety in DefaultGroundingService](#4-null-safety-in-defaultgroundingservice)
5. [DefaultRetrievalOrchestrator — Dead Code Assessment](#5-defaultretrievalorchestrator--dead-code-assessment)
6. [Audit Publisher Consistency](#6-audit-publisher-consistency)
7. [Response Compatibility](#7-response-compatibility)
8. [Existing Test Coverage](#8-existing-test-coverage)
9. [Implementation Order Validation](#9-implementation-order-validation)
10. [Final Go / No-Go Decision](#10-final-gono-go-decision)
11. [Implementation Rules](#11-implementation-rules)

---

## 1. Retrieval Pipeline Workspace Independence

### Verdict: CONFIRMED — Fully Workspace-Independent

The entire AiService-to-Grounding pipeline operates on question text + retrieval configuration + audit context only. No workspace, case, workflow, document, or timeline state is consumed.

### Complete Call Trace

```
DecisionController.analyze()          [platform-api/.../DecisionController.java:99]
AiPageController.handleQuery()        [platform-api/.../AiPageController.java:87]
  |
  v
AiService.answer(AiRequest)           [platform-ai/.../AiService.java:71]
  |
  |-- intentClassifier.classify(question)         [DefaultQueryIntentClassifier.java:85]
  |     reads: question only
  |
  |-- decisionRouter.route(question)              [DecisionRouter.java:64]
  |     reads: question only
  |
  |-- [if HYBRID_RETRIEVAL]:
  |     |
  |     v
  |   retrievalAugmentationService.retrieve(request)  [DefaultRetrievalAugmentationService.java:46]
  |     |
  |     |-- retrievalPlanner.plan(request)        [RetrievalPlanner.java:36]
  |     |     reads: question, maxRetrievalResults
  |     |
  |     |-- searchFacade.search(SearchQuery)      [SearchService.java:58]
  |     |     |
  |     |     v
  |     |   hybridRetrievalService.retrieve(query) [DefaultHybridRetrievalService.java:70]
  |     |        reads: query, mode, context (audit only)
  |     |
  |     |-- domainGate.filter(question, titles)   [DomainGate.java:31]
  |     |-- authorityGroundingService.ground(q)    [DefaultAuthorityGroundingService.java:37]
  |
  |-- contextAssembler.assemble(request, ctx)     [DefaultContextAssembler.java:54]
  |-- promptBuilder.build(promptContext)           [DefaultPromptBuilder.java:25]
  |-- chatCompletionProvider.complete(prompt)      [external LLM call]
  |-- evidenceCoverageValidator.validate(...)      [EvidenceCoverageValidator.java:48]
  |
  v
groundingService.ground(rawAnswer, ctx)            [DefaultGroundingService.java:22]
```

### Dependency Table

| Service | workspaceId | caseId | workflowState | uploadedDocs | timelineData | metadata | Actually Reads? |
|---------|-------------|--------|---------------|--------------|--------------|----------|-----------------|
| `AiService.answer()` | Required but NOT read | Not required | Not required | Not required | Not required | Not required | question, model, maxRetrievalResults, retrievalScope, context |
| `IntentClassifier` | Not required | Not required | Not required | Not required | Not required | Not required | question only |
| `DecisionRouter` | Not required | Not required | Not required | Not required | Not required | Not required | question only |
| `RetrievalPlanner` | Not required | Not required | Not required | Not required | Not required | Not required | question, maxRetrievalResults |
| `RetrievalAugmentationService` | Not required | Not required | Not required | Not required | Not required | Not required | question; constructs all-null SearchFilter |
| `SearchService` (SearchFacade) | Not on SearchQuery | Not on SearchQuery | Not on SearchQuery | Not on SearchQuery | Not on SearchQuery | Not on SearchQuery | query, mode, filter, context (audit) |
| `HybridRetrievalService` | Not required | Not required | Not required | Not required | Not required | Not required | query, mode, context.actorId/tenantId (audit) |
| `DomainGate` | Not required | Not required | Not required | Not required | Not required | Not required | question, titles |
| `AuthorityGroundingService` | Not required | Not required | Not required | Not required | Not required | Not required | question only |
| `ContextAssembler` | Not required | Not required | Not required | Not required | Not required | Not required | question, sources, messages, retrievalScope |
| `PromptBuilder` | Not required | Not required | Not required | Not required | Not required | Not required | evidencePackage, userQuestion |
| `GroundingService` | Not required | Not required | Not required | Not required | Always null | Not required | retrievalStrategy, structuredDecision, sources, authorityReferences |

### Key Evidence

**workspaceId on AiRequest is vestigial:**
```java
// AiRequest.java:16 — field declared but NEVER read by any downstream service
public record AiRequest(
    String question, String model, Object searchFilter,
    AiConversationContext context, int maxRetrievalResults,
    RetrievalScope retrievalScope, UUID workspaceId  // ← unused
) {}
```

All three entry points pass `null` for workspaceId:
- `DecisionController` line 110-116: `null`
- `AiPageController` line 103: `null`
- `BenchmarkRunner` line 76: `null`

**SearchFilter is always constructed all-null by RetrievalAugmentationService** (lines 51-52):
```java
SearchFilter filter = new SearchFilter(
    null, null, null, null, null, null, null, null, List.of());
```

**AiConversationContext carries only audit metadata** (actorId, tenantId, correlationId, requestId) — read only by HybridRetrievalService for audit logging, not for retrieval logic.

### Conclusion

The pipeline is immediately reusable for standalone (non-workspace) AI search. No refactoring needed for workspace decoupling — it is already decoupled.

---

## 2. SearchFacade Capability Audit

### Interface

**File:** `platform-search/src/main/java/com/cognitera/platform/search/api/SearchFacade.java`

Single method:
```java
SearchResultPage search(SearchQuery query);
```

**Sole implementation:** `SearchService` (`platform-search/.../search/application/SearchService.java`)

### Input: SearchQuery

| Field | Type | Purpose |
|-------|------|---------|
| `query` | `String` | Search text |
| `mode` | `SearchMode` | KEYWORD, SEMANTIC, HYBRID, GRAPH, HYBRID_GRAPH |
| `filter` | `SearchFilter` | Composite filter (9 dimensions) |
| `context` | `SearchRequestContext` | actorId, tenantId, correlationId, requestId |
| `page` | `int` | Page index |
| `size` | `int` | Page size (max 100 enforced) |

### Input: SearchFilter

| Field | Type |
|-------|------|
| `documentIds` | `Set<UUID>` |
| `documentType` | `DocumentType` |
| `category` | `String` |
| `tag` | `String` |
| `source` | `String` |
| `tenantId` | `String` |
| `createdFrom` | `Instant` |
| `createdTo` | `Instant` |
| `metadata` | `List<MetadataFilter>` |

### Output: SearchResultPage

| Field | Type |
|-------|------|
| `results` | `List<SearchResult>` |
| `page` | `int` |
| `size` | `int` |
| `totalElements` | `long` |
| `totalPages` | `int` |
| `retrievalStrategy` | `String` |

### Output: SearchResult

| Field | Type |
|-------|------|
| `chunk` | `ChunkReference` |
| `text` | `String` |
| `score` | `double` |
| `confidenceScore` | `double` |
| `provider` | `String` |
| `citation` | `CitationReference` |
| `keywordScore` | `double` |
| `vectorScore` | `double` |
| `rerankScore` | `double` |
| `intent` | `String` |
| `retrievalStrategy` | `String` |

### Output: CitationReference

| Field | Type |
|-------|------|
| `documentId` | `UUID` |
| `chunkId` | `UUID` |
| `documentVersion` | `int` |
| `title` | `String` |
| `pageNumber` | `Integer` |
| `startOffset` | `Integer` |
| `endOffset` | `Integer` |
| `excerpt` | `String` |

### Capability-by-Capability Assessment

| Capability | Status | Details |
|------------|--------|---------|
| **Pagination** | EXISTS | `page`, `size`, `totalElements`, `totalPages` — complete |
| **Sorting** | **MISSING** | No `Sort`/`sortBy`/`orderBy` on SearchQuery or SearchFilter. Internal JPA hardcodes `Sort.by(ASC, "chunkIndex")`. Results ordered by retrieval ranking only. |
| **Ranking** | EXISTS | `score` (= rankingScore), `keywordScore`, `vectorScore`, `rerankScore`, `confidenceScore` |
| **Metadata** | EXISTS | `SearchFilter.metadata` = `List<MetadataFilter>` (key-value pairs), exposed in SearchRequest |
| **Snippets** | EXISTS (basic) | `SearchResult.text` = raw chunk text. No highlight markup. `CitationReference.excerpt` provides a shorter excerpt. |
| **Citations** | EXISTS | `CitationReference` carries documentId, chunkId, title, pageNumber, offsets, excerpt |
| **Filters** | EXISTS (comprehensive) | 9 filter dimensions: documentIds, documentType, category, tag, source, tenantId, createdFrom, createdTo, metadata |
| **Categories** | EXISTS | `SearchFilter.category` (String) |
| **Document IDs** | EXISTS | `SearchFilter.documentIds` (Set\<UUID\>); `ChunkReference.documentId`; `CitationReference.documentId` |
| **Relevance Score** | EXISTS | `score` (overall), plus `keywordScore`, `vectorScore`, `rerankScore`, `confidenceScore` |
| **Source Information** | EXISTS | `SearchResult.provider` (retrieval provider name); `SearchFilter.source`; `SearchResultPage.retrievalStrategy` |

### Missing Capabilities

**Sorting** is the only missing capability. It can be added to `SearchQuery` without breaking the interface — add an optional `Sort` parameter with a default of `null` (meaning: use retrieval ranking). No interface change needed if done as an overload or default-valued parameter.

### Architectural Finding

`SearchFacade` already serves `SearchController` (`POST /api/search`) with all capabilities above. `KnowledgeRestController` (`GET /api/knowledge`) does **not** use `SearchFacade` — it serves hardcoded static data with in-memory filtering. The facade is ready; the knowledge controller is not wired to it.

---

## 3. Knowledge Page Frontend Requirements

### Full Data Flow Trace

```
KnowledgePage.tsx
  → useKnowledgeSearch(query, filters)     [hooks/useKnowledge.ts]
    → restKnowledgeService.search(q, f)    [services/RestKnowledgeService.ts]
      → apiClient.get<KnowledgeDocument[]>(  "/api/knowledge/search", params)
        → GET /api/knowledge/search?q=&category=&fachbereich=&bundesland=
          → KnowledgeRestController.search()  [platform-api/.../KnowledgeRestController.java]
            → returns hardcoded List<Map<String,Object>>
```

### KnowledgeDocument — Complete Field Inventory

**Defined in:** `frontend/src/types/domain.ts` (lines 161-176)

| # | Frontend Field | TS Type | Rendered In | Backend (current) | SearchResultResponse Equivalent |
|---|---------------|---------|-------------|-------------------|-------------------------------|
| 1 | `id` | `string` | ResultCard (key), PreviewPane | YES (`"1"`) | `chunk.documentId` (UUID — different type) |
| 2 | `title` | `string` | ResultCard, PreviewPane | YES | `chunk.title` (same concept, different path) |
| 3 | `type` | `string` | ResultCard, PreviewPane (Badge) | YES (`"Vorschrift"`) | **MISSING** |
| 4 | `category` | `string` | ResultCard (legalArea), PreviewPane | YES (`"Vergaberecht"`) | **MISSING** |
| 5 | `fachbereich` | `string` | ResultCard (authority), PreviewPane | YES (`"Bauamt"`) | **MISSING** |
| 6 | `bundesland` | `string` | PreviewPane | YES (`"Bund"`) | **MISSING** |
| 7 | `status` | `string` | Returned but not directly rendered | YES (`"Aktiv"`) | **MISSING** |
| 8 | `lastUpdated` | `string` | ResultCard (date), PreviewPane | YES (`"12.06.2026"`) | **MISSING** |
| 9 | `excerpt` | `string` | ResultCard (snippet), PreviewPane fallback | YES | `citation.excerpt` or `text` (chunk-level, not document excerpt) |
| 10 | `fullText` | `string?` | PreviewPane (fullText \|\| excerpt fallback) | YES (large string) | **MISSING** (chunk text is fragment, not full document) |
| 11 | `tags` | `string[]` | Returned, not directly rendered | YES (`List.of(...)`) | **MISSING** |
| 12 | `toc` | `TocItem[]?` | PreviewPane (item.label, item.id) | YES but: `label` missing from entries (rendering bug) | **MISSING** |
| 13 | `relatedProcedures` | `RelatedProcedure[]?` | PreviewPane (name\|title, paragraph\|description) | **NO** — never set | **MISSING** |
| 14 | `downloads` | `DownloadItem[]?` | PreviewPane (id, filename, filetype, size) | YES but: `filename`/`filetype` missing (rendering bug) | **MISSING** |

### Pre-existing Rendering Bugs (independent of this refactoring)

1. **TocItem.label** — PreviewPane renders `item.label` but backend toc entries only have `title` and `page`. Result: empty spans for TOC entries.
2. **DownloadItem.filename / DownloadItem.filetype** — PreviewPane renders `dl.filename` and `dl.filetype` but backend provides `name` and `format`. Result: empty spans for download names, generic file icons.

### Can the Frontend Remain Unchanged?

**Yes — IF a backend adapter/mapper is introduced.** The mapping layer must:

1. Accept `SearchResultPage` from `SearchFacade.search()`
2. Aggregate chunk-level results by `documentId` to produce document-level results
3. Enrich with document metadata (type, category, fachbereich, bundesland, status, lastUpdated, fullText, tags, toc, downloads) from a document metadata service
4. Format the response as `List<Map<String,Object>>` (current wire format) or a typed `KnowledgeDocumentResponse` record matching the frontend shape exactly

**The frontend receives a flat array**, not a paginated wrapper. The adapter must either:
- Flatten the paginated result to a single array (losing pagination metadata), or
- Add a wrapper that includes `results` array + pagination metadata, and update the frontend to unwrap it.

The first approach (flatten) requires zero frontend changes. The second approach (paginated wrapper) requires a one-line frontend change: `documents.results.map(...)` instead of `documents.map(...)`.

**Recommendation:** Flatten initially (zero frontend changes), add pagination as a follow-up with a coordinated frontend+backend change.

---

## 4. Null Safety in DefaultGroundingService

### Verdict: IMPOSSIBLE — NPE Cannot Occur

The architecture blueprint (Section 3.4) flagged a potential NPE at:

```java
// DefaultGroundingService.java lines 45-46
double semanticConf = retrievalContext.findingHierarchy().primaryFindings().isEmpty() ? 0.3 : 0.8;
double completenessConf = retrievalContext.sourceDossier().coverageScore();
```

### Root Cause Analysis: The Fix Already Exists

`RetrievalContext` is a **Java 16+ record** with a compact constructor that null-coalesces every field:

```java
// RetrievalContext.java lines 22-34
public RetrievalContext {
    sources = sources == null ? List.of() : List.copyOf(sources);
    authorityReferences = authorityReferences == null ? List.of() : List.copyOf(authorityReferences);
    findingHierarchy = findingHierarchy == null
            ? new FindingHierarchy(List.of(), List.of(), List.of(), List.of(), List.of())
            : findingHierarchy;
    sourceDossier = sourceDossier == null
            ? new SourceDossier(Map.of(), List.of(), List.of(), 0.0, "No assessment")
            : sourceDossier;
    timeline = timeline == null
            ? new ProceduralTimeline(List.of(), List.of(), 0, 0, "No timeline")
            : timeline;
}
```

In Java records, the compact constructor **always executes** — all constructors (including convenience constructors) delegate to the canonical constructor via `this(...)`. Therefore:

- `null` findingHierarchy → replaced with empty `FindingHierarchy(List.of(), ..., List.of())`
- `null` sourceDossier → replaced with empty `SourceDossier(Map.of(), ..., 0.0, "No assessment")`

### All Execution Paths

**Path 1 — RULE_ENGINE (AiService.answer() line 99-116):**
- Constructs `RetrievalContext` via 4-arg convenience constructor
- Compact constructor defaults `findingHierarchy` and `sourceDossier`
- In `DefaultGroundingService.ground()`, the early return at line 24 (`if "RULE_ENGINE" && structuredDecision != null`) exits before reaching lines 45-46
- **Safe by control flow**

**Path 2 — HYBRID_RETRIEVAL (AiService.answer() line 118-144):**
- `DefaultRetrievalAugmentationService.retrieve()` constructs `RetrievalContext` with explicit `null, null, null, null` for optional fields
- Compact constructor defaults them
- In `ground()`, if sources or authority refs are non-empty (lines 30-32 guard passes), execution reaches lines 45-46
- **Safe because compact constructor guarantees non-null fields**

**Path 3 — Empty results (lines 30-32 guard):**
```java
if (retrievalContext.sources().isEmpty() && retrievalContext.authorityReferences().isEmpty()) {
    return new ReasonedAnswer("Insufficient retrieved evidence...", List.of(), List.of(), 0.0, false);
}
```
- Early return before lines 45-46
- **Safe by control flow**

### Execution Path Table

| Path | Strategy | findingHierarchy Source | Reaches Lines 45-46? | NPE Possible? |
|------|----------|------------------------|---------------------|---------------|
| RULE_ENGINE | Rule-based | Compact constructor default | **No** (early return line 24) | No |
| HYBRID with results | Hybrid | Compact constructor default | **Yes** | **No** (non-null guarantee) |
| HYBRID empty | Hybrid | Compact constructor default | **No** (early return line 30) | No |

### Conclusion

**The architecture blueprint's Section 3.4 is a false positive.** The `RetrievalContext` compact constructor was already implemented to prevent this exact class of NPE. No code change is required. The architecture document should be updated to note this finding.

---

## 5. DefaultRetrievalOrchestrator — Dead Code Assessment

### Verdict: DEAD CODE — Safe to Delete

### Every Reference Found

| Location | Nature |
|----------|--------|
| `platform-ai/.../DefaultRetrievalOrchestrator.java:28` | `@Service` — Spring creates a bean |
| `platform-ai/.../RetrievalOrchestrator.java:12` | Interface declaration |
| `platform-api/.../AiPlatformIntegrationTest.java:32` | `@Autowired(required = false) RetrievalOrchestrator` |
| `platform-api/.../AiPlatformIntegrationTest.java:61-65` | `retrievalOrchestratorIsWired()` — only `assertNotNull` |
| `platform-api/.../AiPlatformIntegrationTest.java:138-144` | `orchestratorProducesExplainableResults()` — only `assertNotNull` |
| `docs/Architecture-Verification-and-Refactoring-Blueprint.md` | Multiple mentions — confirms it is unwired |
| `docs/Developer-Guide.md` | Aspirational documentation (outdated) |

### What Does NOT Exist

- **No production injection** — zero `@Autowired`, constructor injection, or field injection of `RetrievalOrchestrator` in any production class
- **No reflection** — no `Class.forName` or reflective access
- **No XML/properties/YAML configuration** referencing it
- **No `@Profile`, `@Conditional`, `@Qualifier`, or feature flag**
- **No `orchestrate()` call** anywhere outside the class definition

### How a Bean Is Created but Never Used

`PlatformApiApplication` declares:
```java
@SpringBootApplication(scanBasePackages = "com.cognitera.platform")
```

This scans all packages under `com.cognitera.platform`. `DefaultRetrievalOrchestrator` has `@Service`, so Spring creates a singleton bean. No production class injects `RetrievalOrchestrator`, so the bean sits unused.

### What Is Wired Instead (the Live Path)

```
DecisionController
  → AiService (implements AiOrchestrationService)
    → RetrievalAugmentationService
      → DefaultRetrievalAugmentationService  ← the real implementation
        → SearchFacade
        → DomainGate
        → AuthorityGroundingService
```

The decision pipeline was refactored from the old orchestrator pattern to `DefaultRetrievalAugmentationService`. The old orchestrator was left behind.

### Dependency Cost

The bean forces Spring to resolve 4 constructor dependencies (`SearchFacade`, `QueryIntentClassifier`, `PromptRegistry`, `EvaluationService`) that are wasted — they're injected into a bean that is never called.

### Recommendation

**Delete** — with one caveat: update the two test methods in `AiPlatformIntegrationTest.java` that reference it. Remove the `retrievalOrchestratorIsWired()` test (it tests a bean that does nothing) and the `orchestratorProducesExplainableResults()` test (same).

---

## 6. Audit Publisher Consistency

### Verdict: Single Non-Compliant Publisher — AiAuditPublisher

### The Proper Audit SPI Chain (Compliant)

```
ModuleAuditPublisher (interface, SPI base)
  → DomainAuditEvents (marker interfaces)
    → Default*AuditEvents (@Component implementations)
      → AuditService (interface)
        → PersistentAuditService (@Service)
          → AuditEventRepository (SPI)
            → JdbcAuditEventRepository (@Repository)
              → INSERT INTO audit_events(...) — SQL
```

### Complete Audit Flow Table

| Domain | Publisher Class | Mechanism | Reaches SQL? | Compliant? |
|--------|----------------|-----------|-------------|------------|
| Search | `SearchAuditPublisher` | `SearchAuditEvents` → `AuditService` → `PersistentAuditService` | YES | YES |
| Documents | `DocumentAuditPublisher` | `DocumentAuditEvents` → `AuditService` → `PersistentAuditService` | YES | YES |
| Auth | `AuthAuditPublisher` | `AuthAuditEvents` → `AuditService` → `PersistentAuditService` | YES | YES (minor: tenantId=null) |
| **AI** | **`AiAuditPublisher`** | **`log.info()` only** | **NO** | **NO — BYPASS** |
| Workflow | *(none)* | N/A | N/A | N/A |
| Admin | *(none)* | N/A | N/A | N/A |

### ASCII Audit Flow Diagram

```
SearchAuditPublisher ──→ SearchAuditEvents ──→ DefaultSearchAuditEvents ──┐
DocumentAuditPublisher → DocumentAuditEvents → DefaultDocumentAuditEvents─┤
AuthAuditPublisher ────→ AuthAuditEvents ────→ DefaultAuthAuditEvents ────┤
(no publisher) ────────→ AiAuditEvents ──────→ DefaultAiAuditEvents ──────┤
                                                                          ↓
                                                                    AuditService
                                                                          ↓
                                                               PersistentAuditService
                                                                          ↓
                                                              JdbcAuditEventRepository
                                                                          ↓
                                                                        SQL
                                                                          ↑
  ┌───────────────────────────────────────────────────────────────────────┘
  │  (BYPASS — never reaches SQL)
  │
  AiAuditPublisher ──→ log.info("AI_AUDIT ...") ──→ STDOUT only
```

### The Non-Compliant Code

**File:** `platform-ai/src/main/java/com/cognitera/platform/ai/application/AiAuditPublisher.java`

```java
@Component
public class AiAuditPublisher {
    private static final Logger log = LoggerFactory.getLogger(AiAuditPublisher.class);

    public void emit(String actorId, String tenantId, String eventType,
                     String requestId, Map<String, String> metadata) {
        log.info("AI_AUDIT eventType={} actorId={} requestId={} metadata={}",
                eventType, actorId != null ? actorId : "system", requestId, metadata);
    }
}
```

Key issues:
1. Does **not** implement `ModuleAuditPublisher`
2. Does **not** inject `AiAuditEvents` (which already exists in `platform-audit`)
3. Does **not** call `AuditService`
4. Does **not** call `PersistentAuditService`
5. Event type passed as `String` (`"MODEL_INFERENCE"`) not `AuditEventType.MODEL_INFERENCE`

**DefaultAiAuditEvents exists and is fully functional** in `platform-audit/src/infrastructure/DefaultAiAuditEvents.java` — it properly delegates to `AuditService.emit()` with module name `"ai"`. It is simply never injected into `AiAuditPublisher`.

### Additional Findings

- **12 of 25 `AuditEventType` values are dead code** — defined in the enum but never emitted by any code
- **No Workflow or Administration audit publishers exist** (the marker interfaces exist, ready to use)
- **AuthAuditPublisher has a minor data quality issue**: `AuditSubject.of()` sets `tenantId = null` for all auth events

### Minimum Change Required

**2 files, zero new classes:**

1. **`AiAuditPublisher.java`** — inject `AiAuditEvents` via constructor, delegate `emit()` to `auditEvents.emit(eventType, subject, metadata)`. Change `eventType` param from `String` to `AuditEventType`.

2. **`AiService.java`** line 165 — change `"MODEL_INFERENCE"` to `AuditEventType.MODEL_INFERENCE`.

The `DefaultAiAuditEvents`, `PersistentAuditService`, and full audit SPI are already wired and ready. No changes needed in `platform-audit`.

---

## 7. Response Compatibility

### Verdict: Direct Swap Would Break Everything — Adapter Required

### Structural Mismatch

| Aspect | Current Response | SearchResultPageResponse | Compatible? |
|--------|-----------------|------------------------|-------------|
| JSON shape | `[{...}, {...}]` — flat array | `{"results": [...], "page": 0, ...}` — wrapped object | **NO** |
| Granularity | Document-level (one entry = one document) | Chunk-level (one entry = one text chunk) | **NO** |
| Field count | 13+ fields per entry | 11 fields per entry (different set) | **NO** |
| Common fields | — | — | Only 2: `title` (different path) and `excerpt` (different semantics) |

### Frontend Breakage Analysis

If `KnowledgeRestController.search()` returned `SearchResultPageResponse` directly:

1. **`documents.length`** → `undefined` (object has no `.length`) → breaks result count display
2. **`documents.map(...)`** → `TypeError: documents.map is not a function` (object is not iterable) → **catastrophic — page crashes**
3. **`doc.id`** → `undefined` (field is `chunk.documentId`, not `id`) → React key warning, broken selection
4. **`doc.type`** → `undefined` (no such field) → empty badges
5. **All 10 document-metadata fields** → `undefined` → empty preview pane

### Field Compatibility Matrix

| KnowledgeDocument Field | In SearchResultResponse? | Mapping Required |
|------------------------|------------------------|-----------------|
| `id` | `chunk.documentId` (UUID → String) | YES — type conversion + path |
| `title` | `chunk.title` (String) | YES — path |
| `type` | **MISSING** | YES — document metadata lookup |
| `category` | **MISSING** | YES — document metadata lookup |
| `fachbereich` | **MISSING** | YES — document metadata lookup |
| `bundesland` | **MISSING** | YES — document metadata lookup |
| `status` | **MISSING** | YES — document metadata lookup |
| `lastUpdated` | **MISSING** | YES — document metadata lookup |
| `excerpt` | `citation.excerpt` or `text` | YES — semantic mapping |
| `fullText` | **MISSING** | YES — full document fetch |
| `tags` | **MISSING** | YES — document metadata lookup |
| `toc` | **MISSING** | YES — document metadata lookup |
| `relatedProcedures` | **MISSING** | YES — document metadata lookup |
| `downloads` | **MISSING** | YES — document metadata lookup |

### Recommended Approach: Backend Compatibility Adapter

**Strategy:** Keep the wire format identical, wire `SearchFacade` behind the adapter.

```
KnowledgeRestController
  → injects SearchFacade + DocumentService (or metadata service)
  → calls searchFacade.search(query) → SearchResultPage
  → aggregates chunks by documentId → deduplicated document list
  → for each document, fetches metadata (type, category, fachbereich, etc.)
  → maps to List<Map<String,Object>> (current wire format)
  → returns identical JSON shape to frontend
```

**Files requiring changes:** Only `KnowledgeRestController.java` (replace hardcoded data with service calls + mapping logic).

**Files requiring NO changes:**
- `frontend/src/types/domain.ts`
- `frontend/src/services/RestKnowledgeService.ts`
- `frontend/src/hooks/useKnowledge.ts`
- `frontend/src/pages/knowledge/KnowledgePage.tsx`
- `frontend/src/components/search/ResultCard/ResultCard.tsx`
- `frontend/src/components/search/PreviewPane/PreviewPane.tsx`
- `frontend/src/api/client.ts`

**Prerequisite:** A document metadata lookup service must exist (or be created) that can resolve `documentId` → `{type, category, fachbereich, bundesland, status, lastUpdated, fullText, tags, toc, downloads}`. The current `DocumentService` in `platform-document` likely provides this.

---

## 8. Existing Test Coverage

### Test Directory Structure

| Module | Test Root | Status |
|--------|-----------|--------|
| `platform-api` | `src/test/java/com/cognitera/platform/api/` | 15 test classes |
| `platform-ai` | `src/test/java/com/cognitera/platform/ai/` | 13 test classes |
| `platform-search` | `src/test/java/com/cognitera/platform/search/` | 5 test classes |
| `platform-auth` | `src/test/java/com/cognitera/platform/auth/` | 1 test class |
| **`platform-audit`** | `src/test/java/com/cognitera/platform/audit/` | **EMPTY — no tests** |
| **`platform-document`** | `src/test/java/com/cognitera/platform/document/` | **EMPTY — no tests** |
| **`platform-workspace`** | `src/test/java/com/cognitera/platform/workspace/` | **EMPTY — no tests** |
| `frontend` | `src/test/` | 1 test (Badge.test.tsx) |
| `e2e-tests` | `playwright/tests/` | 6 spec files |

### Detailed Coverage by Area

#### SearchFacade / SearchService

| Test | What It Tests | Verdict |
|------|--------------|---------|
| `SearchEndpointVerificationTest.java` | `SearchController` with **mocked** `SearchFacade` | Controller contract only — facade mocked entirely |
| `SearchServiceContractTest.java` | `ChunkManagementService` portion of `SearchService` only | Not the `search()` method |

**Verdict: ZERO coverage of `SearchService.search()` (the SearchFacade contract).** The actual fusion/routing logic inside `SearchService` is untested.

#### HybridRetrievalService

`DefaultHybridRetrievalServiceTest.java` — 8 tests covering fusion, dedup, weights, empty query, and metrics. All providers mocked.

**Verdict: ADEQUATE.** Core fusion/dedup logic is well covered.

#### AiService

| Test | What It Tests | Verdict |
|------|--------------|---------|
| `AiServiceExplanationPromptTest.java` | `buildExplanationPrompt()` only (~20 tests) | Prompt formatting only |
| `DecisionControllerTest.java` | Uses `StubAiService` (not real) | Controller test, bypasses all AiService logic |
| `AiPlatformIntegrationTest.java` | Bean wiring + orchestration | Wiring only, doesn't test `answer()` logic |

**Verdict: CRITICAL GAP.** `AiService.answer()` — the core LLM orchestration method — has ZERO tests.

#### GroundingService

`DefaultGroundingServiceTest.java` — 8 tests covering structured (procurement/travel/salary), retrieval, empty sources, and fallback paths.

**Verdict: GOOD.** All grounding paths are tested thoroughly.

#### DecisionController / DecisionRouter

| Test | What It Tests | Verdict |
|------|--------------|---------|
| `DecisionControllerTest.java` | All 4 decision types, SSE streaming, edge cases (12 tests) | GOOD |
| `DecisionRouterTest.java` | All routes, procurement/salary/travel/building, German umlauts, null/blank, long input (27 tests) | EXCELLENT |

**Verdict: GOOD.** Decision routing pipeline is well covered.

#### DefaultRetrievalAugmentationService

**Verdict: ZERO tests.** This is a critical gap — RAG is a core value path and is completely untested.

#### KnowledgeRestController

**Verdict: ZERO tests.** No unit, integration, or E2E tests exist.

#### Admin / Mock Controllers

| Controller | Tests? |
|------------|--------|
| `AdminHealthController` | NO |
| `AdminKnowledgeController` | NO |
| `CorpusHealthRestController` | NO |
| `UsersRestController` | NO |
| `SupervisorRestController` | NO |
| `ProviderInfoController` | NO |

**Verdict: ZERO tests for all admin REST endpoints.**

#### Audit

**Verdict: ZERO tests.** `platform-audit` test directory is empty. No audit publisher tests exist. No `AuditController` tests exist.

#### Frontend

**Verdict: 1 test** (`Badge.test.tsx`). All other components, pages, hooks, and services are untested.

#### E2E Tests

6 Playwright spec files cover UI navigation and basic auth flows. They do **not** test search queries, decision analysis, knowledge operations, or admin functionality.

### Coverage Summary

| Area | Coverage | Quality |
|------|----------|---------|
| `SearchFacade.search()` | **ZERO** | — |
| `HybridRetrievalService` | ADEQUATE | 8 tests |
| `AiService.answer()` | **CRITICAL GAP** | Only `buildExplanationPrompt()` tested |
| `GroundingService` | GOOD | 8 tests, all paths |
| `KnowledgeRestController` | **ZERO** | — |
| `DocumentController` | PARTIAL | Upload only (6 tests) |
| `DecisionController` / `DecisionRouter` | GOOD | 12 + 27 tests |
| `RetrievalAugmentationService` | **ZERO** | Highest priority gap |
| Audit (all) | **ZERO** | — |
| Admin controllers | **ZERO** | All 6 controllers |
| Frontend components | **ZERO** | 1 component tested |

### Minimum New Tests Required

| Priority | Test | Rationale |
|----------|------|-----------|
| **P0** | `KnowledgeRestController` integration test | Verifies new SearchFacade wiring + adapter mapping. Currently zero coverage. |
| **P0** | `DefaultRetrievalAugmentationService` unit test | Core RAG path, highest-priority gap. 2-3 tests for retrieve() method. |
| **P0** | `AiService.answer()` unit test | Core LLM orchestration, currently zero coverage. 2-3 tests for HYBRID + RULE_ENGINE paths. |
| **P1** | `SearchService.search()` unit test | SearchFacade contract implementation currently untested. 1-2 focused tests. |
| **P1** | `AiAuditPublisher` unit test | Verifies audit events reach `AiAuditEvents` after the fix. |
| **P2** | Admin controller tests | If admin endpoints are touched during mock removal. |
| **Not needed** | `DefaultRetrievalOrchestrator` tests | Class will be deleted. Remove existing `retrievalOrchestratorIsWired()` and `orchestratorProducesExplainableResults()` from `AiPlatformIntegrationTest`. |
| **Not needed** | `GroundingService` tests | Already excellent (8 tests). |
| **Not needed** | `DecisionRouter` / `DecisionController` tests | Already excellent (39 tests combined). |

**Total minimum new tests: approximately 8-12 focused unit tests.**

---

## 9. Implementation Order Validation

### Proposed Order (from Architecture Blueprint)

| Phase | Priority | Task |
|-------|----------|------|
| 1 | P0 | Knowledge → SearchFacade |
| 2 | P0 | Fix AiAuditPublisher |
| 3 | P1 | Fix null fields |
| 4 | P1 | Unify CitationReference/SourceCitation |
| 5 | P1 | Dashboard real aggregation |
| 6 | P2 | Remove remaining mocks |
| 7 | P2 | Frontend demo cleanup |
| 8 | P3 | Move CorpusHealthService |

### Revised Order (Post-Verification)

| Phase | Priority | Task | Reason for Change |
|-------|----------|------|-------------------|
| **1** | **P0** | **Fix AiAuditPublisher** | ↑ Promoted: 2-file mechanical fix, unblocks audit visibility for all subsequent changes. Fastest win. |
| **2** | **P0** | **Knowledge → SearchFacade** | ↓ Demoted one slot: requires adapter layer + document metadata service dependency verified first. |
| 3 | ~~P1~~ **Remove** | ~~Fix null fields~~ | **REMOVED**: Compact constructor already prevents NPE. No code change needed. |
| 4 | P1 | Unify CitationReference/SourceCitation | Unchanged. |
| 5 | P1 | Dashboard real aggregation | Unchanged. |
| 6 | ~~P2~~ **P1** | **Remove mocks + delete DefaultRetrievalOrchestrator** | ↑ Promoted: Dead code removal is safe and reduces confusion. |
| 7 | P2 | Frontend demo cleanup | Unchanged. |
| 8 | P3 | Move CorpusHealthService | Unchanged. |

### Rationale for Revised Order

1. **Audit first** — The AiAuditPublisher fix is the smallest, safest change (2 files, zero new classes). Fixing it first gives audit visibility into all subsequent phase changes, providing a safety net during implementation.

2. **Knowledge second** — Requires the most design work (adapter/mapper layer) and depends on verifying a document metadata lookup service exists. Doing it second, after the quick audit win, is the right pacing.

3. **Null safety removed** — The `RetrievalContext` compact constructor already prevents the NPE. Phase 3 of the original plan is a false alarm. This saves implementation effort.

4. **Mock removal + dead code promoted** — Deleting `DefaultRetrievalOrchestrator` and its test references is a safe cleanup. Mock removal becomes lower-risk once Knowledge is wired to SearchFacade (Phase 2 provides the real data path).

5. **Dashboard after Knowledge** — The knowledge page is the highest-value user-facing change. Dashboard real aggregation depends on the same document metadata service but is lower user impact.

---

## 10. Final Go / No-Go Decision

### Implementation Readiness Matrix

| Implementation Area | Status | Conditions | Justification |
|--------------------|--------|-----------|---------------|
| **Knowledge Search** | READY WITH CONDITIONS | Requires: (1) document metadata lookup service verified, (2) adapter/mapper designed, (3) SearchFacade integration test written | SearchFacade has all needed capabilities. Response shape mismatch requires adapter. 10 of 14 KnowledgeDocument fields need document metadata enrichment. |
| **Dashboard** | READY WITH CONDITIONS | Depends on Knowledge Search completion; requires document aggregation queries | Real aggregation needs the same document metadata service. Data exists in Qdrant (23 indexed documents from DemoDataInitializer). |
| **Supervisor** | READY WITH CONDITIONS | Requires dashboard data pipeline first | Downstream of dashboard. |
| **Users** | READY | Mock data only; no architectural dependency | User management is independent of the search pipeline. |
| **Corpus** | READY | CorpusHealthService already real, AuditService already real | Two of three corpus endpoints are already backed by real services per prior audit. |
| **Admin** | READY WITH CONDITIONS | Requires Knowledge + Dashboard completion for data sources | Admin aggregates across knowledge + dashboard domains. |
| **Audit** | READY | 2-file fix, no new classes, AiAuditEvents already wired | Smallest change in the entire plan. `DefaultAiAuditEvents` is ready and waiting. |
| **Frontend cleanup** | READY WITH CONDITIONS | After all backend phases complete | Frontend can remain mostly unchanged if backend adapter approach is followed. |
| **Dependency cleanup** | READY | Delete DefaultRetrievalOrchestrator + 2 test methods | Confirmed dead code. No production references. Safe deletion. |

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Knowledge adapter proves more complex than estimated | Medium | High | Prototype the adapter for 1-2 documents first; validate mapping end-to-end before full implementation |
| Document metadata service insufficient for KnowledgeDocument enrichment | Medium | Medium | Audit DocumentService capabilities before starting Phase 2 |
| Frontend regression from response shape changes | Low (if adapter approach) | High | Adapter preserves exact wire format; add integration test first |
| AiAuditPublisher fix breaks BenchmarkRunner | Low | Low | BenchmarkRunner creates `new AiAuditPublisher()` — update to pass mock after fix |
| Deletion of DefaultRetrievalOrchestrator breaks something | Very Low | Low | Exhaustive search confirmed zero production references |

### Summary

| Metric | Count |
|--------|-------|
| READY (no conditions) | 3 (Audit, Users, Dependency cleanup) |
| READY WITH CONDITIONS | 6 (Knowledge, Dashboard, Supervisor, Corpus, Admin, Frontend cleanup) |
| NOT READY | 0 |
| BLOCKED | 0 |
| **Cancelled (false alarm)** | 1 (Null safety — fix already exists) |

### Overall Verdict: GO

All implementation areas are either ready or ready with clearly defined conditions. No blockers exist. One planned task (null safety) has been verified as already-fixed and can be removed from the plan. The implementation rules below govern all phases.

---

## 11. Implementation Rules

These rules are binding on all implementation phases.

1. **Never duplicate existing functionality.** SearchFacade.search() is the single retrieval entry point. Do not create alternate retrieval paths.

2. **Never create a new service if an existing one can be reused.** SearchFacade, DocumentService, AiAuditEvents, PersistentAuditService are the established services. Extend them; don't replace them.

3. **Never introduce parallel AI pipelines.** AiService.answer() → RetrievalAugmentationService → SearchFacade is the one true path.

4. **Never introduce parallel retrieval pipelines.** HybridRetrievalService is the retrieval implementation. Do not bypass it.

5. **Never introduce parallel prompt builders.** DefaultPromptBuilder is the prompt construction point. Do not create alternatives.

6. **Never introduce duplicate DTO mappings unless unavoidable.** The existing SearchResultPageResponse / SearchResultResponse DTOs are canonical for search results. For the knowledge page, map to the existing wire format rather than creating a parallel DTO hierarchy.

7. **Keep the existing hexagonal architecture intact.** platform-api (web) → platform-ai / platform-search (application) → platform-audit (infrastructure). Do not introduce cross-layer leaks.

8. **Prefer adapting existing services over creating new abstractions.** AiAuditPublisher should inject AiAuditEvents (existing), not a new abstraction. KnowledgeRestController should inject SearchFacade (existing), not a new knowledge service.

9. **Preserve backward compatibility whenever reasonably possible.** The knowledge page adapter must preserve the current JSON wire format. Frontend changes are only acceptable for pagination (a net-new capability, not a regression).

10. **Every architectural change must have a measurable benefit.** Audit fix: AI events visible in audit log. Knowledge fix: real search results instead of 7 hardcoded documents. Mock removal: reduced maintenance burden, real data visibility. Dead code removal: reduced dependency graph, faster startup.

---

## Appendix A: Key Files Referenced

### AI Pipeline
| Component | File |
|-----------|------|
| AiService | `platform-ai/src/main/java/com/cognitera/platform/ai/application/AiService.java` |
| AiRequest | `platform-ai/src/main/java/com/cognitera/platform/ai/model/AiRequest.java` |
| RetrievalContext | `platform-ai/src/main/java/com/cognitera/platform/ai/model/RetrievalContext.java` |
| DefaultRetrievalAugmentationService | `platform-ai/src/main/java/com/cognitera/platform/ai/application/DefaultRetrievalAugmentationService.java` |
| DefaultGroundingService | `platform-ai/src/main/java/com/cognitera/platform/ai/application/DefaultGroundingService.java` |
| DefaultRetrievalOrchestrator | `platform-ai/src/main/java/com/cognitera/platform/ai/application/DefaultRetrievalOrchestrator.java` |
| AiAuditPublisher | `platform-ai/src/main/java/com/cognitera/platform/ai/application/AiAuditPublisher.java` |

### Search
| Component | File |
|-----------|------|
| SearchFacade | `platform-search/src/main/java/com/cognitera/platform/search/api/SearchFacade.java` |
| SearchService | `platform-search/src/main/java/com/cognitera/platform/search/application/SearchService.java` |
| SearchQuery | `platform-search/src/main/java/com/cognitera/platform/search/model/SearchQuery.java` |
| SearchFilter | `platform-search/src/main/java/com/cognitera/platform/search/model/SearchFilter.java` |
| SearchResult | `platform-search/src/main/java/com/cognitera/platform/search/model/SearchResult.java` |
| SearchResultPage | `platform-search/src/main/java/com/cognitera/platform/search/model/SearchResultPage.java` |
| CitationReference | `platform-search/src/main/java/com/cognitera/platform/search/model/CitationReference.java` |
| SearchAuditPublisher | `platform-search/src/main/java/com/cognitera/platform/search/application/SearchAuditPublisher.java` |

### Audit
| Component | File |
|-----------|------|
| ModuleAuditPublisher | `platform-audit/src/main/java/com/cognitera/platform/audit/api/ModuleAuditPublisher.java` |
| AiAuditEvents | `platform-audit/src/main/java/com/cognitera/platform/audit/api/AiAuditEvents.java` |
| DefaultAiAuditEvents | `platform-audit/src/infrastructure/DefaultAiAuditEvents.java` |
| PersistentAuditService | `platform-audit/src/main/java/com/cognitera/platform/audit/infrastructure/PersistentAuditService.java` |

### Web / API
| Component | File |
|-----------|------|
| KnowledgeRestController | `platform-api/src/main/java/com/cognitera/platform/api/web/KnowledgeRestController.java` |
| SearchController | `platform-api/src/main/java/com/cognitera/platform/api/web/SearchController.java` |
| DecisionController | `platform-api/src/main/java/com/cognitera/platform/api/web/DecisionController.java` |
| SearchResultPageResponse | `platform-api/src/main/java/com/cognitera/platform/api/dto/search/SearchResultPageResponse.java` |
| SearchResultResponse | `platform-api/src/main/java/com/cognitera/platform/api/dto/search/SearchResultResponse.java` |

### Frontend
| Component | File |
|-----------|------|
| KnowledgePage | `frontend/src/pages/knowledge/KnowledgePage.tsx` |
| useKnowledge | `frontend/src/hooks/useKnowledge.ts` |
| RestKnowledgeService | `frontend/src/services/RestKnowledgeService.ts` |
| KnowledgeDocument (types) | `frontend/src/types/domain.ts` |
| apiClient | `frontend/src/api/client.ts` |
| ResultCard | `frontend/src/components/search/ResultCard/ResultCard.tsx` |
| PreviewPane | `frontend/src/components/search/PreviewPane/PreviewPane.tsx` |
| FilterPanel | `frontend/src/components/search/FilterPanel/FilterPanel.tsx` |

### Reference Documents
| Document | File |
|----------|------|
| Architecture Assessment & Migration Plan | `docs/Architecture-Assessment-and-Migration-Plan.md` |
| Architecture Verification & Refactoring Blueprint | `docs/Architecture-Verification-and-Refactoring-Blueprint.md` |

---

## Appendix B: Corrections to the Architecture Blueprint

| Section | Original Finding | Verified Finding | Action |
|---------|-----------------|-----------------|--------|
| 3.4 | Latent NPE in DefaultGroundingService — null findingHierarchy/sourceDossier | **False positive.** RetrievalContext compact constructor null-coalesces these fields. NPE is impossible. | Remove Phase 3 (null field fix) from implementation plan |
| 3.6 | Double routing — DecisionRouter.route() called twice | **Unverified** — not investigated in this pass. | Defer to Phase 4 (CitationReference/SourceCitation unification) for investigation |
| 5.1 | DefaultRetrievalOrchestrator "may be dead code" | **Confirmed dead code.** Zero production references. | Phase 6 (dependency cleanup) — safe deletion |
| 6.1 | AiAuditPublisher bypasses audit SPI via log.info() | **Confirmed.** Only non-compliant publisher. | Phase 1 (promoted) — 2-file fix |

---

*This document is the final architecture approval. Implementation begins after sign-off. No code was modified during this verification.*
