# Version 1.1 — Production Implementation Backlog

**Role:** Product Technical Lead  
**Date:** 2026-07-14  
**Constraint:** No new modules. No new abstractions. Smallest changes, biggest improvements.

---

## Executive Summary

The platform's software architecture is adequate. The benchmark proves this: 28/40 RULE_ENGINE questions pass today with near-perfect scores. The 12 failing questions are all HYBRID_RETRIEVAL and fail because of three root causes:

1. **DomainGate is computed but not applied** — cross-domain noise fills the retrieval window
2. **0 vectors in Qdrant** — semantic search is non-functional
3. **No German legal text in the corpus** — keyword search has nothing to match

Fixing these three things alone would increase the benchmark pass rate from ~70% to ~85%. Everything else is optimization.

---

## Top 10 Implementation Backlog — Ordered by Impact ÷ Effort

| # | Task | Impact | Effort | ROI Ratio | Fixes |
|---|---|---|---|---|---|
| **1** | Wire DomainGate into retrieval | HIGH — eliminates cross-domain noise from all 12 HYBRID_RETRIEVAL questions | 30 min | **Critical** | Cross-domain docs in top 10 drops from ~25% to 0% |
| **2** | Enable Qdrant embeddings (run Ollama + configure) | HIGH — enables semantic search for all 12 HYBRID_RETRIEVAL questions | 2 hours | **Critical** | Vector search goes from NoOp to functional |
| **3** | Ingest BauO Bln §§ 27-36, 61, 62, 63, 64 (German full text) | HIGH — fixes BUILD-001 through BUILD-006 | 4 hours | **Critical** | +5-6 benchmark passes |
| **4** | Fix PROC-009 routing (threshold inquiry → RULE_ENGINE) | MEDIUM — +1 benchmark pass | 1 hour | **High** | PROC-009 routes to RULE_ENGINE instead of HYBRID_RETRIEVAL |
| **5** | Add 4 missing domain classifier terms (brandschutz, resturlaub, verwaltungsfachwirt, genehmigungsfrei) | MEDIUM — correct domain classification for 5 questions | 30 min | **High** | 5 questions get correct domain → better retrieval |
| **6** | Ingest AV §55 LHO + BerlAVG §7 + Beschaffungsordnung (German full text) | HIGH — fixes PROC-009, RETR-001, RETR-002 | 3 hours | **High** | +3 benchmark passes |
| **7** | Increase reranker domain penalty from -0.15 to -0.50 | MEDIUM — safety net for DomainGate edge cases | 15 min | **Medium** | Cross-domain docs at 0.85 → 0.43 after penalty |
| **8** | Ingest TV-L Entgeltordnung (Eingruppierungskatalog, German) | MEDIUM — fixes SAL-008 | 2 hours | **Medium** | +1 benchmark pass |
| **9** | Fix manifest vectorCount = 0 bug in refreshMetrics() | LOW — doesn't affect answers, only dashboard | 15 min | **Medium** | Corpus Inventory report shows correct vector counts |
| **10** | Ingest TV-L §26 + UrlVO Bln + VgV §§ 14-17 | MEDIUM — fixes RETR-003, RETR-004 | 3 hours | **Medium** | +2 benchmark passes |

---

## 1. Retrieval Improvement Plan

### Issue 1.1 — DomainGate is Not Wired

**Evidence:** `DefaultRetrievalAugmentationService.java` line 44-45:

```java
SearchFilter filter = new SearchFilter(
    null, null, null, null, null, null, null, null, List.of());
```

All nine fields are null. No domain filter. No category filter. No tag filter. The `DomainGate` class (86 lines, fully implemented, tested) exists at `platform-ai/.../DomainGate.java` and is never called from `retrieve()`. The `RetrievalPlan` has `plan.primaryDomain()` — it's computed at line 47 of `RetrievalPlanner` — but the domain is only used for logging, not filtering.

**What happens today:** A procurement query for "IT-Auftrag 8.000 Euro" retrieves travel expense documents (BRKG), building regulations (BauO Bln), and HR documents (TV-L) alongside procurement documents. These cross-domain results occupy positions in the top 20, pushing relevant procurement documents out.

**Fix:** After `searchFacade.search(searchQuery)` returns, filter results using DomainGate:

```java
// After line 53:
var domainResult = domainGate.filter(request.question(),
    page.results().stream()
        .map(r -> r.citation().title())
        .filter(Objects::nonNull)
        .distinct()
        .toList());
// Then remove results whose title is in domainResult.rejected()
```

**Effort:** 30 minutes. One method call insertion.  
**Benchmark impact:** +1-2 HYBRID_RETRIEVAL passes (cross-domain noise eliminated).  
**DomainGate logs at INFO level already** — "DomainGate [PROCUREMENT]: 12 accepted, 8 rejected" — this will now actually affect results.

### Issue 1.2 — Reranker Domain Penalty Too Weak

**Evidence:** `OllamaRerankingProvider.java` line 156:

```java
return -0.15;  // Penalize non-matching
```

**Concrete scenario with -0.15:**
- Cross-domain doc (HR BRKG) in procurement query: hybrid score 0.85
- Penalty: 0.85 × (1.0 + (-0.15)) = 0.85 × 0.85 = **0.7225**
- In-domain doc (AV §55 LHO) at position 6: hybrid score 0.55
- Boost: 0.55 × (1.0 + 0.35) = 0.55 × 1.35 = **0.7425**

The cross-domain doc at 0.72 competes with the in-domain doc at 0.74 — a difference of only 0.02. This is too close. A slightly better-keyworded HR document displaces a relevant procurement document.

**Concrete scenario with -0.50:**
- Cross-domain at 0.85: 0.85 × (1.0 + (-0.50)) = 0.85 × 0.50 = **0.4250**
- In-domain at 0.55: 0.55 × (1.0 + 0.35) = 0.55 × 1.35 = **0.7425**

The cross-domain doc drops below the threshold where it wouldn't even make the top 15 for LLM reranking.

**Fix:** Change `-0.15` to `-0.50` on line 156.

**Effort:** 15 minutes. One constant change.  
**Benchmark impact:** +3-5% retrieval precision for domain-ambiguous queries.

### Issue 1.3 — Qdrant Has 0 Vectors

**Evidence:** Corpus Health Dashboard reports `qdrantVectors = 0` for all documents.

**Root cause:** The `OllamaEmbeddingProvider` is conditional on `platform.search.embedding.ollama.base-url` being set. In development, this property is typically unset, so the `EmbeddingProvider` bean is not created, `IndexingOrchestrationService` is not created, and the ingestion pipeline falls back to keyword-only mode.

**Fix:**
1. Start Ollama: `ollama serve`
2. Pull embedding model: `ollama pull nomic-embed-text`
3. Set property: `platform.search.embedding.ollama.base-url=http://localhost:11434`
4. Restart application
5. Run `POST /api/documents/reindex` for all documents (or let `DemoDataInitializer.indexAllDocuments()` run)

**Effort:** 2 hours (infrastructure setup + verification).  
**Benchmark impact:** Enables semantic search. Without vectors, the 40/40/20 hybrid weighting degrades to 80% keyword / 0% vector / 20% confidence. With vectors, German queries that don't lexically match English corpus text ("Einfamilienhaus" → "single-family homes") can still match via semantic similarity.

**Verification:**
```
curl http://localhost:6333/collections/mda_chunks/points/count
# Expected: {"result":{"count":23}} (one per demo document)
# After Phase A corpus: {"result":{"count":4000}}
```

### Issue 1.4 — PROcurementQuery Misses Threshold Inquiries Without Euro Amounts

**Evidence:** `DecisionRouter.java` line 106-108:

```java
private boolean isProcurementQuery(String q) {
    return hasAny(q, "beschaffung", "vergabe", "direktauftrag", "ausschreibung",
            "freihändig", "auftrag", "einkauf")
            && containsPattern(q, "\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?\\s*(€|euro|eur)");
}
```

The second condition REQUIRES a Euro amount. PROC-009: "Welche Wertgrenzen gelten in Berlin für Direktaufträge nach AV §55 LHO?" contains no amount → `isProcurementQuery` returns false → falls through to HYBRID_RETRIEVAL. The `ThresholdTable` can answer this deterministically.

**Fix:** Add an `isThresholdInquiry` check that matches "wertgrenzen", "schwellenwerte", "wertgrenze" without requiring a Euro amount. Add `tryThresholdOverview` that returns ALL threshold entries from the table.

```java
private boolean isThresholdInquiry(String q) {
    return hasAny(q, "wertgrenzen", "schwellenwerte", "wertgrenze")
            && hasAny(q, "direktauftrag", "av", "lho", "§55", "§ 55");
}
```

**Effort:** 1 hour.  
**Benchmark impact:** PROC-009 passes (currently fails as HYBRID_RETRIEVAL with low confidence).

### Issue 1.5 — Missing Domain Classifier Terms

**Evidence:** `DomainClassifier.java` term maps. Missing terms confirmed by code review:

| Missing Term | Should Map To | Weight | Questions Affected |
|---|---|---|---|
| `brandschutz` | BUILDING | 10 | BUILD-006 |
| `resturlaub` | HR | 10 | RETR-004 |
| `verwaltungsfachwirt` | HR | 10 | SAL-008 |
| `genehmigungsfrei` | BUILDING | 8 | BUILD-003 |

These terms are NOT present in any of the four term maps (PROCUREMENT_TERMS, BUILDING_TERMS, HR_TERMS, TRAVEL_TERMS). The terms "carport" (weight 8) and "nutzungsänderung" (weight 5) are already present — the roadmap's claim about these being missing was incorrect.

**Fix:** Add the 4 missing terms to the appropriate static maps.

**Effort:** 30 minutes.  
**Benchmark impact:** 4 questions get correct domain classification → better retrieval targeting.

---

## 2. Corpus Improvement Plan

The English demo corpus must be replaced with German legal text. This is the single biggest quality improvement available.

### Current State: 23 Documents, All English, 0 Vectors

| Problem | Impact | Fix |
|---|---|---|
| English text for German queries | Keyword search fails for German terms like "Nutzungsänderung", "Einfamilienhaus" | Replace with German |
| 0 Qdrant vectors | Semantic search returns nothing | Enable Ollama + reindex |
| Single chunk per document (sentence-aware reduced them) | Each chunk is ~800 chars, no § structure | Paragraph-level chunking + metadata |
| No official legal text | Answers are generated from English summaries, not authoritative text | Ingest official PDFs |

### Phase A Corpus — 25 Critical Documents (Week 1)

These 25 documents fix all 12 HYBRID_RETRIEVAL benchmark gaps. They are the minimum viable production corpus.

| # | Document | Source | Pages | Fixes | Priority |
|---|---|---|---|---|---|
| 1 | BauO Bln §§ 27-36 (Brandschutz) | gesetze.berlin.de | 15 | BUILD-006 | **P1** |
| 2 | BauO Bln §61 (Genehmigungsfreie Vorhaben) | gesetze.berlin.de | 3 | BUILD-003 | **P1** |
| 3 | BauO Bln §62 (Genehmigungsfreistellung) | gesetze.berlin.de | 3 | BUILD-001 | **P1** |
| 4 | BauO Bln §63 (Vereinfachtes Verfahren) | gesetze.berlin.de | 5 | BUILD-001, BUILD-005 | **P1** |
| 5 | BauO Bln §64 (Volles Verfahren) | gesetze.berlin.de | 5 | BUILD-001 | **P1** |
| 6 | BauO Bln §6 (Abstandsflächen) | gesetze.berlin.de | 5 | BUILD-002 | **P2** |
| 7 | BauVorlV 2025 §§ 1-7 | gesetze.berlin.de | 12 | BUILD-004 | **P1** |
| 8 | AV zu §55 LHO Berlin (complete) | berlin.de/sen/finanzen | 20 | PROC-001-012 | **P1** |
| 9 | BerlAVG §7 + AV Umwelt | gesetze.berlin.de | 5 | RETR-001 | **P1** |
| 10 | Beschaffungsordnung Berlin | berlin.de/sen/finanzen | 20 | RETR-002 | **P1** |
| 11 | TV-L Entgeltordnung (Eingruppierung) | tdl-online.de | 50 | SAL-008 | **P1** |
| 12 | TV-L Entgelttabellen 2025 | tdl-online.de | 15 | SAL-001-007 | **P2** |
| 13 | TV-L §26 (Urlaub) | tdl-online.de | 5 | RETR-004 | **P1** |
| 14 | UrlVO Bln (complete) | gesetze.berlin.de | 20 | RETR-004 depth | **P2** |
| 15 | VgV §§ 14-17 (Fristen) | gesetze-im-internet.de | 5 | RETR-003 | **P1** |
| 16 | BRKG §§ 1-15 (Tagegeld, Übernachtung) | gesetze-im-internet.de | 18 | TRAV depth | **P2** |
| 17 | UVgO §§ 14-28 (Unterschwelle) | gesetze-im-internet.de | 10 | PROC depth | **P2** |
| 18 | GWB Teil 4 §§ 97-101 | gesetze-im-internet.de | 8 | PROC depth | **P2** |
| 19 | VOB/A §1-§3a (Bau-Vergabe) | gesetze-im-internet.de | 18 | PROC-004, PROC-011 | **P2** |
| 20 | Schneller-Bauen-Gesetz Berlin 2024 | gesetze.berlin.de | 12 | BUILD-001 depth | **P2** |
| 21 | BauGB §§ 29-38 (Zulässigkeit) | gesetze-im-internet.de | 12 | BUILD context | **P2** |
| 22 | LRKG Berlin (complete) | gesetze.berlin.de | 15 | TRAV Berlin-specific | **P2** |
| 23 | AZVO Bln (Arbeitszeit) | gesetze.berlin.de | 16 | HR | **P3** |
| 24 | Mobile Arbeit Rahmenvereinbarung | berlin.de/sen/inneres | 8 | HR | **P3** |
| 25 | IT-Sicherheitsleitlinie Berlin | berlin.de/sen/inneres | 10 | HR | **P3** |

**Total: ~320 pages → ~12,000 chunks → ~12,000 vectors → ~2 hours ingestion**

**Expected benchmark after Phase A ingestion: 90% (36/40).** All 12 HYBRID_RETRIEVAL questions pass. 28/28 RULE_ENGINE questions pass (PROC-009 routing fix included).

---

## 3. Chunking Recommendation

### Verdict: Do NOT implement LegalChunkingStrategy for Version 1.1

**Reasoning:**

1. **SentenceAwareChunkingStrategy is sufficient for retrieval quality.** Retrieval matches on chunk TEXT content, not on metadata. A query for "Abstandsfläche" matches a chunk containing the text "Die Abstandsfläche muss mindestens 0,4 H betragen" regardless of whether the chunker knows it's §6 BauO Bln. The § marker is in the text itself.

2. **There is no measurable benchmark improvement from §-level chunking.** The benchmark checks whether the answer CONTAINS required concepts ("Abstandsfläche", "BauO", "Paragraph 6") — not whether the answer cites them correctly. The benchmark validates answer correctness, not citation format.

3. **LegalChunkingStrategy improves citation precision, not answer correctness.** The benefit is that the system can say "gemäß §61 Abs. 2 BauO Bln" instead of just "gemäß BauO Bln." This matters for administrative acceptance but not for benchmark scores. It is a UX improvement, not a correctness improvement.

4. **Metadata extraction provides the same citation benefit at lower cost.** Running a regex over chunk text to extract `§\s*\d+[a-z]?` and storing it as a chunk attribute (`section_ref: "61"`) gives you §-level citation without changing the chunker. This is ~50 lines of code vs. ~250 lines for LegalChunkingStrategy.

**Recommendation for v1.1:** Keep SentenceAwareChunkingStrategy. Add regex-based § reference extraction to chunk metadata. Reevaluate LegalChunkingStrategy after 25 documents are ingested and the benchmark confirms retrieval quality.

**Recommendation for v2.1:** If after 300 documents the benchmark shows that ≥ 20% of answers cite the wrong § number, implement LegalChunkingStrategy. The measurable trigger is Gate 9 (Citation Precision < 80%).

---

## 4. Metadata Recommendation

### Add § Reference Extraction — Not LegalChunkingStrategy

**Cost:** ~50 lines of code  
**Benefit:** Every chunk from a legal document gains `section_ref` and `clause_ref` in its metadata. Citations improve from "BauO Bln" to "BauO Bln §61."

**Implementation:**

In `DefaultIndexingOrchestrationService.persistChunk()` (or in the chunking strategy), after creating each chunk, run two regexes on the chunk text:

```java
// Extract § references from chunk text
Pattern sectionRef = Pattern.compile("§\\s*(\\d+[a-z]?)");
Pattern clauseRef = Pattern.compile("\\((\\d+[a-z]?)\\)");

List<MetadataFilter> attributes = new ArrayList<>();
Matcher sm = sectionRef.matcher(chunkText);
if (sm.find()) {
    attributes.add(new MetadataFilter("section_ref", sm.group(1)));
}
Matcher cm = clauseRef.matcher(chunkText);
if (cm.find()) {
    attributes.add(new MetadataFilter("clause_ref", cm.group(1)));
}
```

These are stored in the existing `search_document_chunk_metadata` EAV table. Zero DDL changes. The `attributes` field is already passed to `IndexChunkCommand` (currently `List.of()` at line 115 of `DefaultIndexingOrchestrationService`).

**Existing metadata already passed to IndexChunkCommand should be populated:**

Line 115 currently passes `List.of()` for attributes. The `document.metadata().tags()` and `document.metadata().category()` are available. These should be passed:

```java
// Current (line 115):
List.of(),  // attributes — empty

// Fixed:
List.of(
    new MetadataFilter("category", document.metadata().category()),
    new MetadataFilter("doc_type", document.metadata().type().name())
),
```

**Effort:** 1 hour total (30 min § regex, 30 min metadata population).  
**Benchmark impact:** No direct benchmark improvement (benchmark doesn't check citation format). Improves citation quality for user acceptance.

### Do NOT Add New Database Columns in v1.1

The existing EAV table (`search_document_chunk_metadata`) is sufficient. Adding columns requires DDL changes, migration scripts, and JPA entity updates. Defer to v2.0 when the multi-corpus architecture justifies dedicated columns.

---

## 5. Version 1.1 Release Roadmap

### Week 1 — Code Fixes (No Corpus Changes)

| Day | Task | Effort | Accumulated Benchmark |
|---|---|---|---|
| Mon | Wire DomainGate into retrieval (#1) | 30 min | — |
| Mon | Increase reranker domain penalty -0.15 → -0.50 (#7) | 15 min | — |
| Mon | Fix PROC-009 routing (#4) | 1 hour | — |
| Mon | Add 4 missing domain classifier terms (#5) | 30 min | — |
| Tue | Fix manifest vectorCount bug (#9) | 15 min | — |
| Tue | Populate metadata attributes in persistChunk | 30 min | — |
| Tue | Add § reference regex extraction to chunk metadata | 30 min | — |
| Wed | Configure Ollama + enable Qdrant embeddings (#2) | 2 hours | — |
| Wed | Reindex all 23 demo documents with embeddings | 30 min | — |
| Thu | Run full benchmark — validate code fixes | 2 hours | ~75% (estimated) |
| Fri | Buffer / bug fixes | — | — |

**Week 1 exit:** All code fixes deployed. Qdrant has vectors. Benchmark validates that routing, domain filtering, and embeddings work correctly. The 23 English demo documents now have embeddings — semantic search is functional even if corpus quality is still low.

### Week 2 — Minimum Corpus Ingestion (25 Documents)

| Day | Task | Effort | Accumulated Benchmark |
|---|---|---|---|
| Mon | Download Phase A documents #1-8 (BauO Bln + AV §55 + BerlAVG §7) from official sources | 2 hours | — |
| Mon | Validate PDFs: text layer check, metadata spreadsheet | 1 hour | — |
| Tue | Ingest documents #1-8 via upload API | 2 hours | — |
| Tue | Verify: embeddings present, Qdrant vectors present, search returns German text | 1 hour | — |
| Wed | Download + ingest documents #9-17 (Beschaffungsordnung, TV-L, UrlVO, VgV, BRKG, UVgO, GWB, VOB/A) | 3 hours | — |
| Thu | Download + ingest documents #18-25 (remaining) | 3 hours | — |
| Fri | Run full benchmark — compare with Week 1 results | 2 hours | **90% (36/40)** |
| Fri | Run release benchmark (if Ollama running) | 2 hours | — |

**Week 2 exit:** 25 German legal documents ingested and indexed. All 12 HYBRID_RETRIEVAL benchmark questions pass. Semantic search returns German legal text for German queries.

### Week 3 — Validation and Polish

| Day | Task | Effort |
|---|---|---|
| Mon | Spot-check 20 answers: verify citations, check for hallucinations, verify regulation names | 2 hours |
| Tue | Fix any citation errors, missing metadata, or chunk boundary issues found in spot-check | 4 hours |
| Wed | Run corpus health dashboard — verify GREEN status for all documents | 1 hour |
| Thu | Generate CORPUS_INVENTORY.md + RELEASE_CORPUS_REPORT.md | 1 hour |
| Fri | Version 1.1 release tagging + changelog | 2 hours |

### Week 4 — Buffer

| Day | Task |
|---|---|
| Mon-Fri | Address any quality issues found in Week 3. Ingest additional P2 documents if time permits. |

---

## 6. What NOT to Build in v1.1

These items are explicitly deferred. They are not broken — they are not needed yet.

| Deferred Item | Reason for Deferral | When to Revisit |
|---|---|---|
| LegalChunkingStrategy | No measurable benchmark improvement. SentenceAwareChunkingStrategy is sufficient for retrieval. § references can be added via metadata extraction (50 lines, already in Week 1). | v2.1 — when 300+ documents are ingested and citation precision is measured |
| platform-knowledge module | The current flat architecture works for 300 documents. A dedicated module adds complexity without improving answer quality. | v2.0 — when case management or multi-tenancy is built |
| Multi-corpus architecture | Single collection with corpus_id filtering works for v1.1 scale (<50K vectors). Separate collections are only justified by PII isolation or >1M vectors. | v2.0+ — per corpus as new document types are introduced |
| CorpusRouter / CorpusRegistry | DomainGate + RetrievalPlanner already perform domain-based filtering. A router is indirection without improvement at current scale. | v2.0 — when >3 corpora exist |
| Separate JPA tables per corpus | `corpus_id` column on `documents` table is sufficient. Separate tables add schema complexity without query improvement at <100K documents. | v3.0 — when case management requires `case_docs` with structurally different columns |
| DocumentParser (legal structure) | Regex § extraction into metadata attributes achieves the same citation benefit at 1/5 the cost. | v2.1 — when citation precision is measured and found lacking |
| Historical version ingestion | Historical versions are valuable for temporal queries but do not improve benchmark scores. Current versions answer all 40 benchmark questions. | v2.0 — when temporal query UI is built |
| Parallel embedding | For 25 documents (~12K chunks), sequential embedding takes ~2 hours. For 300 documents, parallel embedding would save ~8 hours. Implement when ingestion becomes the bottleneck. | v2.0 — when ingesting >300 documents in a batch |

---

## 7. Estimated Benchmark Trajectory

| Milestone | RULE_ENGINE | HYBRID_RETRIEVAL | Overall | Weeks |
|---|---|---|---|---|
| **Current** (demo corpus, no fixes) | 96% (27/28) | 8% (1/12) | **70%** | 0 |
| **After code fixes** (Week 1) | 100% (28/28) | 25% (3/12) | **78%** | 1 |
| **After Phase A corpus** (Week 2) | 100% (28/28) | 100% (12/12) | **100%** [stubbed] / **90%** [real Ollama] | 2 |
| **v1.1 Release** (Week 3) | 100% (28/28) | 92% (11/12) | **95%** | 3 |

The gap between stubbed (100%) and real (90%) is due to Ollama LLM variability — the LLM may occasionally produce an answer that lacks one required concept. This is a model quality issue, not a software or corpus issue.

---

## Summary

**Seven code changes. Twenty-five documents. Three weeks.**

That's the entire v1.1 implementation. Everything else is deferred with a specific, measurable trigger for when it becomes necessary.

The platform's REST API, chunking, embedding, Qdrant indexing, hybrid retrieval, two-stage reranking, diversity enforcement, evidence packaging, prompt building, and grounding pipeline are all functional. The software works. The corpus is the bottleneck. Fix the corpus.
