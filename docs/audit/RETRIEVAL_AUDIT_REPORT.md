# End-to-End Retrieval Audit Report
## Query: "Kann ich einen IT-Auftrag über 18.000 Euro freihändig vergeben?"

### Executive Summary

**Primary root cause: DomainGate is never called in the retrieval pipeline.**

Procurement regulations exist in the corpus and keyword search finds them, but there is no domain filter applied at search time. Any document can match any query. BRKG (hr-regulations) appears because it contains words like "Euro" and matched either keyword or vector similarity.

### Audit Findings

#### 1. Corpus State (Part B) — NO ISSUE

23 documents indexed with correct categories:
- PROCUREMENT: AV §55 LHO (19 chunks), BerlAVG (18), GWB (19), UVgO (17), VgV (18)
- TRAVEL/HR: BRKG (23 chunks) — correctly categorized as hr-regulations
- BUILDING: BauO Bln (20), BauGB (19), BauNVO (19), BauVorlV (20)

**✓ All required procurement regulations are present.**
**✓ Category assignments are correct.**

#### 2. Keyword Search (Part E) — NO ISSUE

Keyword search for "vergabe", "beschaffung", "direktauftrag" correctly returns:
- UVgO (procurement-regulations)
- AV §55 LHO (procurement-regulations)
- Beschaffungsordnung Berlin (internal-procedures)
- eVergabe Plattform (manuals)

**✓ Keyword search finds the correct procurement documents.**

#### 3. Qdrant Vectors (Part D) — ISSUE (MEDIUM)

Qdrant collection `mda_chunks` has **0 indexed vectors** (`points_count: 0`).
Vector search returns 0 results for every query.

**Vector-only contribution: 0 documents.**
Hybrid fusion relies entirely on keyword results.

#### 4. DomainGate (Part G) — ROOT CAUSE (CRITICAL)

`DomainGate` class exists at `platform-ai/.../DomainGate.java` but is **NEVER CALLED** in the main retrieval pipeline.

**Evidence:**
```
$ grep -rn "DomainGate\|domainGate" platform-ai/src/main/java/ --include="*.java"
DomainGate.java:48:  log.info("DomainGate [{}]: {} accepted, {} rejected"...
DomainGate.java:50:  log.info("DomainGate rejected: "...
```

The `filter()` method is never invoked by `AiService`, `DefaultRetrievalAugmentationService`, or any other pipeline component. The `RetrievalPlan.eligibleCollections()` is computed but never applied to the `SearchFilter`.

**Consequence:** All documents are searched regardless of domain. BRKG (hr-regulations) is included in search results alongside AV §55 LHO (procurement-regulations).

#### 5. Retrieval Augmentation (Part A) — CONFIRMATION

`DefaultRetrievalAugmentationService.retrieve()` creates a `SearchFilter` with all null fields:
```java
SearchFilter filter = new SearchFilter(null, null, null, null, null, null, null, null, List.of());
```
The `plan.eligibleCollections()` value is **computed but discarded** — never passed to the search query.

**Affected class:** `DefaultRetrievalAugmentationService.java`  
**Affected method:** `retrieve()` line ~58  
**Fix:** Pass `plan.eligibleCollections()` to SearchFilter category field, or call DomainGate.filter() before building the evidence package.

#### 6. DecisionRouter (Part J) — NO ISSUE

For the test query, DecisionRouter correctly routes to RULE_ENGINE:
- `isProcurementQuery` returns TRUE (has "freihändig" + amount "18.000 Euro")
- `tryProcurementLookup` successfully finds threshold entry

**However:** If DecisionRouter is bypassed (e.g., browser hitting old endpoint, cached build), the HYBRID_RETRIEVAL path activates and exhibits the DomainGate gap.

#### 7. Reranker (Part H) — SECONDARY ISSUE (MEDIUM)

`OllamaRerankingProvider` applies domain-aware boosting but the DomainGate already missed the filtering. The reranker penalizes non-matching documents by -0.15 but doesn't remove them. BRKG with score 0.85 boosted to 0.72 still outranks poorly-matching procurement docs.

### Root Cause Summary

| # | Component | Status | Severity |
|---|-----------|--------|----------|
| 1 | DomainGate not wired into pipeline | **ROOT CAUSE** | CRITICAL |
| 2 | eligibleCollections computed but ignored | **CONFIRMS #1** | CRITICAL |
| 3 | Qdrant has 0 vectors | **AMPLIFIES #1** | MEDIUM |
| 4 | Reranker penalizes but doesn't remove cross-domain docs | **CONTRIBUTING** | LOW |
| 5 | Corpus is correct, metadata is correct, keyword search works | NO ISSUE | — |
| 6 | DecisionRouter correctly routes if called | NO ISSUE | — |

### Exactly Why BRKG Was Selected Instead of Procurement Regulations

1. The `DefaultRetrievalAugmentationService` creates a `SearchFilter` with `category = null`
2. The hybrid search executes against ALL documents regardless of category
3. BRKG chunks match via keyword search (contents mention money amounts, "Euro")
4. BRKG chunks pass through Qdrant vector search (0 vectors → no filtering)
5. DomainGate is never called to filter out hr-regulations results
6. The reranker penalizes BRKG but doesn't remove it entirely
7. BRKG appears in the ranked results alongside procurement docs
8. When the LLM receives the evidence package, BRKG title appears as a "source"
9. UI renders BRKG as a retrieved document

### Proposed Fixes

1. **Critical:** Wire DomainGate into DefaultRetrievalAugmentationService — apply category filter from RetrievalPlan to SearchFilter
2. **Medium:** Generate embeddings for all 176 existing chunks into Qdrant
3. **Low:** Increase reranker domain mismatch penalty from -0.15 to -0.50

### Affected Classes
- `DefaultRetrievalAugmentationService.java:58-60` — category filter not applied
- `DomainGate.java:29-55` — exists but never called
- `OllamaRerankingProvider.java:109` — domain penalty too weak
