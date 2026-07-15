# v1.1 Implementation Roadmap

---

## Batch 1 — Quick Wins (under 1 day total)

### 1.1 Wire DomainGate into DefaultRetrievalAugmentationService

**Objective:** Apply domain filter to retrieval results so cross-domain noise is removed. Fixes the CRITICAL gap identified in the audit report — `eligibleCollections` is computed but discarded.

**Expected improvement:** +8-12% benchmark success rate (cross-domain chunks in top 10 drop from ~25% to 0%).

**Effort:** Small (30 minutes)

**Production risk:** None. DomainGate is idempotent — worst case it filters nothing.

**Affected classes:**
- `DefaultRetrievalAugmentationService` — inject DomainGate, apply post-search filter, pass `plan.primaryDomain()` and result titles
- `DomainGate` — add `Set<String> acceptedTitles` convenience method

**Affected tests:**
- New: `DefaultRetrievalAugmentationServiceTest` — verify cross-domain chunks are filtered
- Update: `BenchmarkStubs.retrievalStub()` — add domain-appropriate titles

**Acceptance criteria:**
- Procurement query → 0 HR/building documents in results
- Building query → 0 procurement/HR documents in results
- DomainGate logged at INFO with accepted/rejected counts for every retrieval

**Implementation sketch:**
```
DefaultRetrievalAugmentationService.retrieve():
  → searchFacade.search() returns page
  → enforceDiversity()
  → domainGate.filterByDomain(plan.primaryDomain(), resultDocTitles)   // NEW
  → remove results whose title is in filterResult.rejected()             // NEW
  → build citations from surviving results
```

---

### 1.2 Fix PROC-009 Routing — Threshold Inquiry Without Amount

**Objective:** PROC-009 ("Welche Wertgrenzen gelten in Berlin für Direktaufträge nach AV §55 LHO?") contains no Euro amount, so `isProcurementQuery` returns false and it falls through to HYBRID_RETRIEVAL. The structured `ThresholdTable` can answer it deterministically.

**Expected improvement:** +1 passed benchmark question.

**Effort:** Small (1 hour)

**Production risk:** None. Only adds a new match path, doesn't change existing logic.

**Affected classes:**
- `DecisionRouter` — add `isThresholdInquiry` check, add `tryThresholdOverview` that returns ALL thresholds when no amount is extractable

**Affected tests:**
- `DecisionRouterTest` — add test for "Wertgrenzen" query without amount

**Acceptance criteria:**
- PROC-009 routes to RULE_ENGINE with a decision containing all 7 threshold entries
- Existing procurement routing tests unchanged

---

### 1.3 Add Missing Domain Terms to DomainClassifier

**Objective:** Three domain-relevant terms are missing from the classifier, causing domain misclassification for 5 benchmark questions.

| Missing term | Should map to | Questions affected |
|---|---|---|
| `brandschutz` | BUILDING (weight 10) | BUILD-006 |
| `nutzungsänderung` | BUILDING (weight 10) | BUILD-005 |
| `resturlaub` | HR (weight 10) | RETR-004 |
| `verwaltungsfachwirt` | HR (weight 10) | SAL-008 |
| `carport` | BUILDING — already present at weight 8. VERIFIED. | — |
| `genehmigungsfrei` | BUILDING (weight 8) | BUILD-003 |

**Expected improvement:** +5 questions with correct domain classification → better retrieval precision.

**Effort:** Small (30 minutes)

**Production risk:** None.

**Affected classes:**
- `DomainClassifier` — add entries to BUILDING_TERMS and HR_TERMS static maps

**Affected tests:**
- `DomainClassifierTest` — add classification tests for each new term

**Acceptance criteria:**
- "Brandschutz Wohngebäude" → domain BUILDING confidence ≥ 0.7
- "Nutzungsänderung genehmigungspflichtig" → domain BUILDING confidence ≥ 0.7
- "Resturlaub übertragen TV-L" → domain HR confidence ≥ 0.7

---

### 1.4 Fix Travel Routing — Kilometerpauschale vs. Tagegeld Priority

**Objective:** Queries like "Kilometerpauschale bei 8-stündiger Dienstreise" match the 8-hour Tagegeld entry instead of the kilometerpauschale entry. The lookup must check the query topic before falling back to hourly matching.

**Expected improvement:** TRAV-003 and TRAV-009 produce correct mileage-specific answers.

**Effort:** Small (2 hours)

**Production risk:** Low. Only affects travel queries containing "kilometerpauschale".

**Affected classes:**
- `DecisionRouter.tryTravelLookup()` — check for "kilometerpauschale" keyword → prefer mileage category entries

**Affected tests:**
- `DecisionRouterTest` — add kilometerpauschale routing tests

**Acceptance criteria:**
- "Kilometerpauschale für sonstiges KFZ bei 8-stündiger Dienstreise" → returns 0.20 €/km entry
- "Kilometerpauschale PKW Dienstreise" → returns 0.35 €/km entry
- Standard hourly Tagegeld queries unchanged

---

## Batch 2 — Retrieval Quality (2-3 days total)

### 2.1 Fix Qdrant Embedding Generation (0 Vectors → Live Vectors)

**Objective:** Qdrant collection `mda_chunks` has **0 indexed vectors**. All 23 documents × ~8-10 chunks each = ~200 chunks need embeddings. `DemoDataInitializer.repairMissingEmbeddings()` calls `indexingOrchestrationProvider.reindexDocument()` but either the provider is null (bean not available) or the embedding model returns errors silently.

**Expected improvement:** +15-25% retrieval precision for semantic queries. Critical for questions where German query terms don't lexically match English corpus text (BUILD-001: "Einfamilienhaus" → "single-family homes").

**Effort:** Medium (1-2 days: diagnose, fix, verify)

**Production risk:** Medium. Requires embedding model to be running (Ollama with nomic-embed-text or similar).

**Affected classes:**
- `DemoDataInitializer.repairMissingEmbeddings()` — add health check logging, handle null provider gracefully
- `IndexingOrchestrationService` / its implementation — verify the embedding pipeline end-to-end
- Configuration: verify `platform.search.qdrant` properties are set

**Affected tests:**
- New: integration test that verifies `vectors_count > 0` for known document IDs

**Acceptance criteria:**
- `QdrantCollectionManager` reports `points_count >= 150` after startup
- `repairMissingEmbeddings()` logs "Indexed N documents into Qdrant" with N > 0
- Vector search for "Einfamilienhaus" returns BauO Bln chunks in top 5

**Diagnosis steps:**
1. Check if Ollama is running: `ollama ps`
2. Check if embedding model is pulled: `ollama list | grep embed`
3. Check Qdrant is running: `docker ps | grep qdrant`
4. Verify Qdrant collection exists: `curl http://localhost:6333/collections/mda_chunks`
5. Check point count: `curl http://localhost:6333/collections/mda_chunks/points/count`
6. If no points → trace `reindexDocument()` through `IndexingOrchestrationService` → check logs for embedding errors

---

### 2.2 German Corpus Localization

**Objective:** The demo corpus is English-language summaries of German laws. Keyword search for German queries ("Nutzungsänderung", "Einfamilienhaus", "genehmigungsfrei") produces zero lexical matches against English text. Add a German title + German key terms section to each demo document chunk.

**Expected improvement:** +10-15% retrieval precision for German-language queries. Fixes BUILD-001, BUILD-003, BUILD-005.

**Effort:** Medium (1 day — rewrite 23 document content strings in German, regenerate chunks)

**Production risk:** None. Only changes demo seed data. Existing database must be dropped/re-seeded.

**Affected classes:**
- `DemoDataInitializer` — replace English content strings with German equivalents, preserving all procedural information

**Affected tests:**
- `BenchmarkTest` — no changes (test validates routing + semantics, not retrieval)

**Acceptance criteria:**
- Keyword search for "Einfamilienhaus" returns BauO Bln chunks
- Keyword search for "Nutzungsänderung" returns BauO Bln chunks
- Keyword search for "Carport genehmigungsfrei" returns relevant building chunks
- All 12 HYBRID_RETRIEVAL questions have at least 3 relevant chunks in top 10

---

### 2.3 Increase Reranker Domain Penalty

**Objective:** `OllamaRerankingProvider` applies -0.15 penalty for domain mismatch. Per audit report: "BRKG with score 0.85 boosted to 0.72 still outranks poorly-matching procurement docs." Increase penalty to -0.50 to push cross-domain documents out of the display window.

**Expected improvement:** +3-5% retrieval precision when DomainGate is bypassed or domain is ambiguous.

**Effort:** Small (15 minutes — one constant change)

**Production risk:** Low. Domain-matched documents are never penalized.

**Affected classes:**
- `OllamaRerankingProvider` — change `DOMAIN_MISMATCH_PENALTY` from 0.15 to 0.50

**Affected tests:**
- Verify existing reranker tests still pass

**Acceptance criteria:**
- Cross-domain document at score 0.85 → reranked to 0.35
- Domain-matched document at score 0.60 → unchanged at 0.60

---

### 2.4 Chunk Merging — Sentence → Paragraph

**Objective:** Current chunks are single sentences (`content.split("(?<=\\.) ");`). A legal rule like "Direct award up to 10,000 euros for supplies; up to 20,000 euros for construction" is split across chunks. Merge 2-3 consecutive sentences to form coherent paragraph-level chunks.

**Expected improvement:** +5-8% retrieval relevance (chunks contain complete rules, not sentence fragments).

**Effort:** Small (1 hour — change splitting logic in `DemoDataInitializer.createDoc`, re-seed)

**Production risk:** None. Re-seed only.

**Affected classes:**
- `DemoDataInitializer.createDoc()` — change `content.split("(?<=\\.) ")` to group 2-3 sentences per chunk

**Affected tests:**
- No existing tests cover chunk granularity; no test changes needed

**Acceptance criteria:**
- AV §55 LHO document has ~7 chunks (not ~19)
- Each chunk contains a complete threshold rule (amount range + procedure + requirements)
- Total chunk count across corpus: ~100 (down from ~200)

---

## Batch 3 — Corpus Engineering (3-5 days total)

### Prioritized Document Ingestion List (top 20 by benchmark impact)

Documents ranked by: (questions fixed × benchmark gain) / ingestion effort.

---

**P1 — Must have for v1.1**

| # | Document | Questions fixed | Benchmark gain | Pages | Ingestion difficulty | Chunking | Metadata |
|---|---|---|---|---|---|---|---|
| 1 | **BauO Bln §§ 27-36 (Brandschutz)** — fire resistance ratings, escape routes, fire compartments by building class | BUILD-006 | +1 pass, enables Building domain | ~15 | Low — public PDF, structured sections | By paragraph (§27, §28, etc.) with building class tags | category: building-regulations, tags: brandschutz, gebäudeklasse |
| 2 | **BauO Bln §61 (Genehmigungsfreie Vorhaben)** — complete list of permit-free structures incl. carports, garages, sheds | BUILD-003 | +1 pass | ~3 | Low — same source as existing BauO Bln doc | By structure type (carport, garage, fence, etc.) | category: building-regulations, tags: genehmigungsfrei, verfahrensfrei |
| 3 | **TV-L Entgeltordnung (Eingruppierungskatalog)** — maps job titles (incl. Verwaltungsfachwirt) to Entgeltgruppen | SAL-008 | +1 pass, enables HR classification queries | ~40 | Medium — multiple parts, structured tables | One chunk per job title → EG mapping | category: hr-regulations, tags: eingruppierung, entgeltordnung |
| 4 | **BerlAVG §7 + AV Umwelt (full text)** — specific environmental criteria for Berlin procurement | RETR-001 | +1 pass | ~5 | Low — Berlin legal portal PDF | By criterion (energy efficiency, recycling, emissions, etc.) | category: procurement-regulations, tags: umwelt, nachhaltigkeit, berlavg |
| 5 | **BauO Bln §63 (full text with Nutzungsänderung)** — complete simplified procedure provisions including change-of-use rules | BUILD-005 | +1 pass | ~5 | Low — same source, just expanded | Split into procedure type triggers | category: building-regulations, tags: nutzungsänderung, vereinfachtes-verfahren |

---

**P2 — High value**

| # | Document | Questions fixed | Benchmark gain | Pages | Ingestion difficulty | Chunking | Metadata |
|---|---|---|---|---|---|---|---|
| 6 | **VgV §§ 15-17 (electronic deadlines, urgency)** — shortened deadlines for electronic submission, urgency provisions | RETR-003 depth | Deeper answer, +semantics score | ~5 | Low — existing document expansion | By section with deadline type tag | category: procurement-regulations, tags: fristen, elektronisch, dringlichkeit |
| 7 | **BauVorlV 2025 (full text)** — complete list of 11 procedure types and required documents | BUILD-004 depth | Deeper answer, +evidence score | ~15 | Low — public PDF, structured | By procedure type with document checklist | category: building-regulations, tags: bauvorlagen, bauantrag |
| 8 | **GWB §§ 134-135 (Vergaberechtsverstöße)** — consequences of procurement law violations, voidability of contracts | RETR backup queries | Enables legal consequence questions | ~5 | Low — public legal text | By section with consequence type | category: procurement-regulations, tags: rechtsfolgen, nichtigkeit |
| 9 | **VOB/A §3a (ex-post publication thresholds)** — precise publication requirements by procedure type | PROC depth | Improves procedure explanation completeness | ~3 | Low — DIN standard, well-structured | By publication trigger threshold | category: procurement-regulations, tags: vob, ex-post, bekanntmachung |
| 10 | **UrlVO Bln (full text, §§ 1-28)** — complete Berlin leave regulation including special leave categories | RETR-004 depth | Deeper answer | ~20 | Medium — Berlin legal portal | By section, one per leave type | category: hr-regulations, tags: urlaub, sonderurlaub, urlvo |
| 11 | **TV-L §34 (Kündigungsfristen, full table)** — complete dismissal notice periods by years of service | HR backup queries | Enables notice period questions | ~3 | Low — existing document expansion | One chunk per service-year bracket | category: hr-regulations, tags: kündigung, fristen |
| 12 | **LRKG Berlin (full text)** — Berlin-specific travel expense provisions differing from BRKG | TRAV backup queries | Enables Berlin-specific travel answers | ~15 | Medium — Berlin legal portal | By allowance type | category: hr-regulations, tags: lrkg, berlin, reisekosten |
| 13 | **Beschaffungsordnung Berlin (full text)** — complete internal procurement procedures | RETR-002 depth | Deeper Vergabevermerk documentation | ~10 | Low — internal document, expand existing | By purchasing threshold tier | category: internal-procedures, tags: vergabevermerk, beschaffung |

---

**P3 — Nice to have**

| # | Document | Questions fixed | Benchmark gain | Pages | Ingestion difficulty | Chunking | Metadata |
|---|---|---|---|---|---|---|---|
| 14 | **BauNVO (full text, §§ 1-26a)** — complete land use ordinance with all zone categories and density limits | BUILD backup | Better planning law answers | ~15 | Medium — federal law, structured | By zone category with GRZ/GFZ tables | category: building-regulations, tags: baunvo, nutzungsart |
| 15 | **Musterbauordnung (MBO) — Gebäudeklassen** — model building code building class definitions (GK 1-5) | BUILD-006 depth | Better building classification | ~5 | Low — IS-Argebau public document | By building class with height/area thresholds | category: building-regulations, tags: gebäudeklasse, mbo |
| 16 | **AV §55 LHO (full text with all appendices)** — complete administrative regulation including special cases | PROC depth | Better procurement completeness | ~20 | Medium — Senatsverwaltung internal document | By section, appendix separately | category: procurement-regulations, tags: lho, av, wertgrenzen |
| 17 | **ITDZ Berlin — IT-Sicherheitsleitlinie (full text)** — complete IT security incident response procedures | Backup queries | Enables security questions | ~10 | Low — expand existing document | By incident type with response steps | category: hr-regulations, tags: it-sicherheit, notfall |
| 18 | **AZVO Bln (full text)** — complete working time regulation with flexitime core hours | Backup queries | Enables working time questions | ~12 | Medium — Berlin legal portal | By topic: flexitime, overtime, part-time | category: hr-regulations, tags: arbeitszeit, gleitzeit |
| 19 | **Mobile Arbeit Rahmenvereinbarung (full text)** — complete remote work agreement including equipment provisions | Backup queries | Enables remote work questions | ~8 | Low — expand existing document | By topic: equipment, health, data protection | category: hr-regulations, tags: homeoffice, mobile-arbeit |
| 20 | **Baugenehmigungsformular Berlin (full form fields)** — complete form with all required fields and instructions | BUILD-004 depth | Complete form guidance | ~5 | Low — expand existing document | By form section with field descriptions | category: forms, tags: bauantrag, formular |

---

### Batch 3 Implementation Plan

**Week 1 (P1 documents):** Ingest documents 1-5. These fix 5 failing benchmark questions directly.
- Total pages: ~68
- Estimated effort: 3 days (half day per document on average, including chunk tuning)
- After ingestion: re-run benchmark, expect 67% pass rate (up from baseline)

**Week 2 (P2 documents):** Ingest documents 6-13. These deepen existing answers and enable backup queries.
- Total pages: ~76
- Estimated effort: 3 days (higher density of pages)
- After ingestion: re-run benchmark, expect 80%+ pass rate

**P3 documents (14-20):** Defer to v1.2 unless time permits.

---

## Batch 4 — Release Readiness Gates

### Gate 1 — Benchmark Success Rate

**Threshold:** ≥ 75% (30/40 questions passing)

| Sub-gate | Threshold | Measurement |
|---|---|---|
| RULE_ENGINE success | ≥ 96% (27/28) | BenchmarkTest |
| HYBRID_RETRIEVAL success | ≥ 25% (3/12) | BenchmarkTest (without corpus changes); ≥ 58% (7/12) with P1 corpus changes |

### Gate 2 — Semantic Score

**Threshold:** ≥ 85% average across all questions

| Question type | Threshold |
|---|---|
| RULE_ENGINE | ≥ 95% (all required concepts present) |
| HYBRID_RETRIEVAL | ≥ 70% (dominant concepts present) |

### Gate 3 — Retrieval Precision

**Threshold:** DomainGate reports ≥ 90% accepted rate for domain-specific queries.

| Query domain | Min accepted % | Max rejected % |
|---|---|---|
| PROCUREMENT | 90% | 10% |
| BUILDING | 85% | 15% |
| HR | 90% | 10% |

Measurement: Run all 40 benchmark questions, aggregate DomainGate logs.

### Gate 4 — Grounding Coverage

**Threshold:** 100% of RULE_ENGINE answers grounded. ≥ 80% of HYBRID_RETRIEVAL answers grounded.

### Gate 5 — Latency

**Threshold:** p95 < 2 seconds end-to-end. p50 < 1 second.

| Strategy | p50 | p95 | p99 |
|---|---|---|---|
| RULE_ENGINE | < 200 ms | < 500 ms | < 1 s |
| HYBRID_RETRIEVAL | < 1 s | < 2 s | < 3 s |

### Gate 6 — Vector Index Health

**Threshold:** Qdrant `mda_chunks` collection has ≥ 150 vectors. Vector search for 5 reference queries returns ≥ 1 relevant result each.

### Gate 7 — Corpus Coverage

**Threshold:** All 12 HYBRID_RETRIEVAL questions have ≥ 3 relevant chunks in the top 10 retrieval results.

| Question | Min relevant chunks in top 10 |
|---|---|
| PROC-009 | 5 (AV doc + UVgO + Beschaffungsordnung) |
| SAL-008 | 3 (after Entgeltordnung ingestion) |
| BUILD-001 to BUILD-006 | 3 each |
| RETR-001 to RETR-004 | 3 each |

### Gate 8 — Hallucination Rate

**Threshold:** 0 forbidden concepts in all answers. 100% of required concepts present in RULE_ENGINE answers.

### Gate 9 — Routing Accuracy

**Threshold:** 100% correct routing (all 40 questions route to expected strategy).

### Gate 10 — No Regressions

**Threshold:** All existing tests pass. No previously-passing benchmark question newly fails.

---

## Prioritized Backlog (sorted by ROI)

| # | Priority | Item | Batch | Effort | Benchmark gain | Production impact |
|---|---|---|---|---|---|---|
| 1 | **P1** | Wire DomainGate into retrieval pipeline | 1.1 | 30 min | +8-12% | Eliminates cross-domain noise entirely |
| 2 | **P1** | German corpus localization | 2.2 | 1 day | +10-15% | German queries match corpus text |
| 3 | **P1** | Fix Qdrant 0-vector issue | 2.1 | 1-2 days | +15-25% | Enables semantic search, critical for concept matching |
| 4 | **P1** | Chunk merging (sentence → paragraph) | 2.4 | 1 hour | +5-8% | Chunks contain complete legal rules |
| 5 | **P1** | Add missing DomainClassifier terms | 1.3 | 30 min | +5 questions correctly classified | Prevents domain misrouting |
| 6 | **P1** | Fix PROC-009 routing (threshold inquiry) | 1.2 | 1 hour | +1 pass | Closes routing gap |
| 7 | **P2** | Ingest P1 corpus documents (Brandschutz, §61, Entgeltordnung, BerlAVG §7, §63 full) | 3 | 3 days | +5 passes | Fixes 5/6 missing-corpus failures |
| 8 | **P2** | Fix travel kilometerpauschale priority | 1.4 | 2 hours | Better TRAV answers | Prevents wrong Tagegeld for mileage queries |
| 9 | **P2** | Increase reranker domain penalty (-0.15 → -0.50) | 2.3 | 15 min | +3-5% | Safety net when DomainGate misses |
| 10 | **P3** | Ingest P2 corpus documents (VgV deadlines, BauVorlV full, GWB consequences, etc.) | 3 | 3 days | +2-3 passes, deeper answers | Completes corpus for all benchmark categories |
| 11 | **P3** | Release gates automation | 4 | 1 day | — | Prevent regression in v1.2 |
| 12 | **P4** | Ingest P3 corpus documents | 3 | 2 days | +backup query support | Nice-to-have domain completeness |

### Execution Order

```
Week 1:  P1 items 1-6 (Batch 1 + Batch 2.1-2.4)
         → Expected benchmark: 55-65% (up from baseline ~40-50%)
         → Gate: all routing tests pass, DomainGate logging verified

Week 2:  P2 item 7 (Batch 3, P1 documents)
         → Expected benchmark: 70-75%
         → Gate: 5 previously-failing HYBRID_RETRIEVAL questions now pass

Week 3:  P2 items 8-9 (Batch 1.4 + 2.3)
         → Expected benchmark: 75-80%
         → Gate: all 10 release gates green

Week 4:  P3 item 10 (Batch 3, P2 documents) + P3 item 11 (gates automation)
         → Expected benchmark: 80-85%
         → Gate: full release readiness confirmed

Deferred: P4 item 12 (Batch 3, P3 documents) → v1.2
```
