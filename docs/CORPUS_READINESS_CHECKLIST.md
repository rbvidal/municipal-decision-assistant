# Corpus Readiness Checklist — Version 1.1

> **Date:** 2026-07-14  
> **Purpose:** Measurable release gates that must pass before scaling from 300 to 1000+ documents  
> **Version:** 1.1

---

## Gate Structure

Each gate has:
- **Threshold:** the minimum acceptable value
- **Measurement:** how to measure it
- **Current state:** what the demo corpus achieves today (where measurable)
- **Target:** what must be achieved after 300-document ingestion

---

## Gate 1 — Ingestion Success Rate

**What:** Percentage of uploaded documents that complete ingestion without failure.

| Metric | Threshold | Measurement | Current State | Target (300 docs) |
|---|---|---|---|---|
| Batch ingestion success rate | ≥ 95% | `(completed_jobs / total_jobs) × 100` over a batch | Unknown (no batch ingestion yet) | ≥ 285 of 300 documents READY |
| Per-document failure reason logged | 100% | All `FAILED` jobs have non-null `failure_reason` | N/A | Every failure has a root cause |
| Ingestion retry success rate | ≥ 80% | Re-triggered ingestion jobs that succeed on 2nd attempt | No retry mechanism exists | Retry succeeds for transient failures (Ollama timeout, Qdrant restart) |

**Verification procedure:**
1. Ingest entire batch of 300 documents
2. Query `SELECT status, COUNT(*) FROM document_ingestion_jobs`
3. For all `FAILED` jobs: `SELECT failure_reason FROM document_ingestion_jobs WHERE status = 'FAILED'`
4. Manually re-trigger each failed job
5. Record retry success count

**Blockers to resolve before Gate 1 can pass:**
- Sequential embedding causes ingestion jobs to timeout on large documents → parallelize `embedBatch()`
- Scanned PDFs with no text layer cause extraction failure → add OCR detection + skip/flag logic
- Qdrant unavailability kills ingestion → add retry with backoff

---

## Gate 2 — Extraction Quality

**What:** Quality of text extracted from PDFs before chunking.

| Metric | Threshold | Measurement | Current State | Target (300 docs) |
|---|---|---|---|---|
| Text extraction success rate | ≥ 98% | `(documents_with_extracted_chars > 0) / total_documents` | 100% (demo TXT/HTML only) | ≥ 294 of 300 documents |
| Average extracted characters per page | ≥ 1500 | `SUM(extracted_chars) / SUM(page_count)` | ~950 (demo docs are small) | ≥ 1500 (indicates clean text extraction) |
| Scanned PDF detection rate | 100% | Documents with `extracted_chars < 100 AND page_count > 1` are flagged as OCR_REQUIRED | N/A | All scanned PDFs identified before ingestion |
| Encoding correctness | 100% | No mojibake, no `?` replacement characters in extracted text | Not tested with real PDFs | Spot-check 20 random chunks per domain |

**Verification procedure:**
1. Run pre-flight script on all PDFs before ingestion
2. For any document with `extracted_chars < 100 AND page_count > 1`: flag as OCR_REQUIRED, do not ingest
3. After ingestion, sample 20 chunks per domain and visually inspect for garbled text
4. Record rejection reason for each flagged document

**Known issues:**
- Two-column PDFs (Gesetz- und Verordnungsblatt) produce interleaved text from both columns → flag for manual review
- PDFs with custom font encoding may produce garbage characters → detectable via character frequency analysis
- Header/footer text interleaves with body text → acceptable for retrieval, not a blocker

---

## Gate 3 — Duplicate Detection

**What:** No duplicate documents in the corpus.

| Metric | Threshold | Measurement | Current State | Target (300 docs) |
|---|---|---|---|---|
| Duplicate titles | 0 | `SELECT title, COUNT(*) FROM corpus_manifest GROUP BY title HAVING COUNT(*) > 1` | 0 (demo docs have unique titles) | 0 |
| Duplicate source URLs | 0 | Same query on `source_url` | 0 | 0 |
| Near-duplicate SHA-256 | 0 pairs | Cross-check all checksums | 0 | 0 (exact duplicates blocked; near-duplicates flagged) |
| Version duplicates | 0 | No two documents share both title AND version identifier | N/A | 0 |

**Verification procedure:**
1. Pre-flight script checks SHA-256 against all existing documents
2. Pre-flight script checks title+version_identifier uniqueness
3. Post-ingestion: `CorpusManifestService.findDuplicates()` must return empty
4. Corpus Health Dashboard "Doppelte Dokumente" card must show 0

---

## Gate 4 — Metadata Completeness

**What:** Every document has complete, correct metadata.

| Field | Required | Threshold | Measurement |
|---|---|---|---|
| `title` | YES | 100% | No null/blank titles |
| `short_name` | YES | 100% | Used for citations |
| `legal_domain` | YES | 100% | Must be a valid domain enum value |
| `jurisdiction` | YES | 100% | "Berlin", "Bund", "EU" |
| `authority` | YES | 100% | Issuing authority |
| `doc_type` | YES | 100% | "Gesetz", "Verordnung", etc. |
| `language` | YES | 100% | "DE" for all German docs |
| `source_url` | YES | ≥ 95% | Official source link |
| `publication_date` | YES | 100% | Date of publication |
| `effective_date` | YES | ≥ 90% | Date of legal effect |
| `version_identifier` | YES | 100% | Unique version string |
| `checksum_sha256` | YES | 100% | Auto-computed during upload |
| `priority` | YES | 100% | P1, P2, or P3 |

**Verification procedure:**
1. Pre-flight script validates metadata spreadsheet before ingestion
2. Post-ingestion: `CorpusHealthService.DocumentHealth.metadataCompleteness()` ≥ 80% for every document
3. Corpus Health Dashboard "Metadaten" column must show ≥ 80% (green) for all documents
4. For any document below 80%: flag for manual metadata correction and re-ingestion

---

## Gate 5 — Chunk Quality

**What:** Chunks are semantically coherent and searchable.

| Metric | Threshold | Measurement |
|---|---|---|
| Average chunks per document | ≥ 5 | Calculate across all 300 documents |
| Maximum chunks per document | ≤ 200 | Cap on extremely long documents (e.g., complete legal codes) |
| Chunks with paragraph-level text | ≥ 90% | Chunks containing ≥ 200 chars (not just headers/footers) |
| Empty chunks | 0 | `text IS NULL OR LENGTH(text) = 0` |
| Single-chunk documents | ≤ 10% | Documents producing exactly 1 chunk (under-chunked) |
| Chunk size within target range | ≥ 80% | Chunks between 400-2000 chars |

**Verification procedure:**
1. Query chunk counts per document from `search_document_chunks`
2. Flag documents with single chunks for manual review
3. Sample 50 random chunks, visually verify they contain coherent legal text
4. Check for chunks that start or end mid-word (indicates chunker boundary issue)

---

## Gate 6 — Embedding and Vector Quality

**What:** All chunks have valid embeddings and vectors in Qdrant.

| Metric | Threshold | Measurement |
|---|---|---|
| Embedding coverage | ≥ 98% | `(chunks_with_embedding_ref / total_chunks) × 100` |
| Qdrant vector coverage | ≥ 95% | `(qdrant_points_count / total_chunks) × 100` (may be lower than embedding coverage due to partial failures) |
| Vector dimension consistency | 100% | All vectors in Qdrant have dimension = `embeddingProvider.dimension()` |
| Embedding reference format | 100% | Format: `{model}:{dimension}d` (e.g., `nomic-embed-text:768d`) |

**Verification procedure:**
1. Corpus Health Dashboard: "Mit Embedding" count
2. Corpus Health Dashboard: "Qdrant Vektoren" count
3. `QdrantCollectionManager` reports consistent collection info
4. Spot-check: search 5 reference queries, verify at least 3 relevant results per query

**Current blockers:**
- Qdrant currently has 0 vectors (embedding model not running in dev) — must be resolved before Gate 6
- Sequential embedding causes timeouts on large batches — must parallelize before 300-document ingestion

---

## Gate 7 — Benchmark Score

**What:** Overall benchmark pass rate across all 40 questions.

| Metric | Threshold | Measurement |
|---|---|---|
| Overall pass rate | ≥ 75% | `BenchmarkTest` / `ReleaseBenchmarkTest` |
| RULE_ENGINE pass rate | ≥ 96% (27/28) | Procurement + Travel + Salary questions |
| HYBRID_RETRIEVAL pass rate | ≥ 50% (6/12) | Building + Retrieval questions |
| No regressions | 100% | No previously-passing question newly fails |
| Semantic score (RULE_ENGINE) | ≥ 95% | All required concepts present |
| Semantic score (HYBRID_RETRIEVAL) | ≥ 70% | Dominant concepts present |
| Latency (RULE_ENGINE p95) | < 500ms | Pipeline profiler |
| Latency (HYBRID_RETRIEVAL p95) | < 3000ms | Pipeline profiler |

**Verification procedure:**
1. Run `BenchmarkTest` (unit test with stubs) — validates routing + grounding
2. Run `ReleaseBenchmarkTest` (integration test with real Ollama) — validates full pipeline
3. Compare results with previous benchmark run
4. Generate `release-validation.md` report
5. If any HYBRID_RETRIEVAL question fails: investigate which document is missing and why it wasn't retrieved

---

## Gate 8 — Retrieval Precision

**What:** Domain-specific queries return domain-appropriate results.

| Metric | Threshold | Measurement |
|---|---|---|
| DomainGate acceptance rate (procurement queries) | ≥ 90% | Run all PROC questions, aggregate DomainGate logs |
| DomainGate acceptance rate (building queries) | ≥ 85% | Run all BUILD questions, aggregate DomainGate logs |
| DomainGate acceptance rate (HR queries) | ≥ 90% | Run all HR questions, aggregate DomainGate logs |
| Cross-domain noise (procurement queries) | ≤ 5% | HR/building chunks in procurement results |
| Cross-domain noise (building queries) | ≤ 10% | Procurement/HR chunks in building results |

**Verification procedure:**
1. Run all 40 benchmark questions through the pipeline
2. For each HYBRID_RETRIEVAL question, inspect the top 10 retrieved chunks
3. Classify each chunk's domain
4. Calculate acceptance/rejection rates
5. If rejection rate > 10%: DomainGate needs tuning or wiring (currently not applied)

---

## Gate 9 — Citation Precision

**What:** Retrieved evidence can be cited at §-level granularity.

| Metric | Threshold | Measurement |
|---|---|---|
| Chunks with `section_ref` metadata | ≥ 80% | Chunks from legal documents have § reference in attributes |
| Citation in LLM answer matches source text | ≥ 90% | Spot-check 20 answers: the cited § actually contains the claimed rule |
| Document title in citation is correct | 100% | `SourceCitation.title` matches the actual document |

**Verification procedure:**
1. Query 50 random chunks from legal documents
2. Verify `attributes` contain `section_ref` key for chunks from documents with § structure
3. For 20 HYBRID_RETRIEVAL answers: manually verify that the cited § reference actually appears in the source document
4. If citation precision < 80%: the chunker is not capturing legal boundaries — LegalChunkingStrategy is justified

---

## Gate 10 — Indexing Throughput

**What:** The ingestion pipeline can handle the target corpus size within reasonable time.

| Metric | Threshold | Measurement |
|---|---|---|
| Time to ingest 300 documents | ≤ 4 hours | Wall-clock time for full batch ingestion |
| Time to ingest 1 document (average) | ≤ 60 seconds | Include extraction + chunking + embedding + indexing |
| Embedding throughput | ≥ 5 chunks/second | `embedBatch()` throughput with parallel execution |
| Reindex time for 300 documents | ≤ 4 hours | `reindexDocument()` for all 300 docs |

**Verification procedure:**
1. Time a batch of 10 documents from upload to READY
2. Extrapolate to 300 documents
3. If > 4 hours: profile the bottleneck (extraction, chunking, embedding, or Qdrant)
4. Embedding is the expected bottleneck — parallelization should reduce total time to ~1 hour

---

## Gate 11 — Grounding Quality

**What:** HYBRID_RETRIEVAL answers are properly grounded in retrieved evidence.

| Metric | Threshold | Measurement |
|---|---|---|
| Grounded answers (HYBRID_RETRIEVAL) | ≥ 80% | `ReasonedAnswer.grounded() == true` for all HYBRID_RETRIEVAL questions |
| Grounded answers (RULE_ENGINE) | 100% | Structured grounding must always succeed |
| "Insufficient evidence" rate | ≤ 10% | Answers returning "Insufficient retrieved evidence" |
| Average sources per HYBRID_RETRIEVAL answer | ≥ 3 | Number of `SourceCitation` objects in the answer |

**Verification procedure:**
1. Run all 12 HYBRID_RETRIEVAL benchmark questions
2. Check `BenchmarkResult.grounded()` for each
3. If any return "Insufficient retrieved evidence": the corpus is missing relevant content for that question
4. Cross-reference with the gap analysis to identify missing documents

---

## Gate 12 — Corpus Manifest Consistency

**What:** The Corpus Manifest accurately reflects database and Qdrant state.

| Metric | Threshold | Measurement |
|---|---|---|
| Manifest entries = database documents | 100% | `manifestService.findAll().size() == documentRepo.findAll().size()` after sync |
| Manifest chunk counts = DB chunk counts | ≥ 98% | Per-document chunk count matches |
| Manifest vector count populated | 100% | `vectorCount > 0` for all fully indexed documents |
| Manifest embedding status = DB embedding state | ≥ 98% | `EmbeddingStatus` matches actual embedding_reference counts |

**Verification procedure:**
1. Run `manifestService.syncFromDocuments()`
2. Run `CorpusHealthService.generateReport()`
3. Cross-check: manifest chunk counts vs health dashboard chunk counts per document
4. Fix: ensure `refreshMetrics()` updates `vectorCount` (currently not set — known bug from system consistency audit)

---

## Release Decision Matrix

| Gate | Weight | Must Pass? | Current Status |
|---|---|---|---|
| Gate 1 — Ingestion Success Rate | CRITICAL | YES | Not measured |
| Gate 2 — Extraction Quality | CRITICAL | YES | Not measured for real PDFs |
| Gate 3 — Duplicate Detection | HIGH | YES | 0 duplicates (demo) |
| Gate 4 — Metadata Completeness | HIGH | YES | ~60% (demo docs lack version fields) |
| Gate 5 — Chunk Quality | HIGH | NO (improvement target) | 23 single-chunk docs |
| Gate 6 — Embedding/Vector Quality | CRITICAL | YES | 0 vectors (Ollama not running) |
| Gate 7 — Benchmark Score | CRITICAL | YES | Unknown with real corpus |
| Gate 8 — Retrieval Precision | HIGH | NO (target) | DomainGate not wired |
| Gate 9 — Citation Precision | MEDIUM | NO (target) | No § metadata |
| Gate 10 — Indexing Throughput | MEDIUM | NO (improvement target) | Sequential embedding |
| Gate 11 — Grounding Quality | HIGH | YES | 100% RULE_ENGINE, unknown HYBRID |
| Gate 12 — Manifest Consistency | MEDIUM | NO (improvement target) | vectorCount always 0 |

### Minimum Release Criteria (Version 1.1)

**All CRITICAL gates must pass (Gates 1, 2, 6, 7).**  
**All HIGH gates must pass or have documented waiver (Gates 3, 4, 8, 11).**  
**MEDIUM gates are improvement targets, not release blockers (Gates 5, 9, 10, 12).**

---

## Pre-Flight Script (Recommended Implementation)

A bash/python script that runs BEFORE any batch ingestion:

```bash
#!/bin/bash
# preflight.sh — validates a batch of documents before ingestion

BATCH_DIR="$1"
FAILURES=0

for PDF in "$BATCH_DIR"/*.pdf; do
    # 1. File integrity
    if ! python3 -c "from pdfbox import PDFBox; PDFBox.open('$PDF')"; then
        echo "FAIL: $PDF is corrupt or not a valid PDF"
        ((FAILURES++))
        continue
    fi

    # 2. Text layer detection
    CHARS=$(python3 -c "from pdfbox import PDFBox; print(len(PDFBox.open('$PDF').extract_text()))")
    if [ "$CHARS" -lt 100 ]; then
        echo "OCR_REQUIRED: $PDF (extracted $CHARS chars)"
        ((FAILURES++))
        continue
    fi

    # 3. Metadata file check
    BASENAME=$(basename "$PDF" .pdf)
    if [ ! -f "$BATCH_DIR/$BASENAME.json" ]; then
        echo "FAIL: $PDF has no metadata file"
        ((FAILURES++))
    fi
done

echo "Pre-flight: $FAILURES failures out of $(ls "$BATCH_DIR"/*.pdf | wc -l) documents"
exit $FAILURES
```

---

## Post-Ingestion Verification Script

A script that runs AFTER batch ingestion:

```bash
#!/bin/bash
# verify.sh — validates ingested documents against expectations

# 1. Check all documents are READY
READY=$(curl -s http://localhost:8080/api/documents?status=READY | jq '.totalElements')
TOTAL=$(curl -s http://localhost:8080/api/documents | jq '.totalElements')
echo "Documents: $READY / $TOTAL READY"

# 2. Check embedding coverage
curl -s http://localhost:8080/admin/corpus-health | grep "embeddingCoverage"

# 3. Check benchmark
mvn test -pl platform-api -Dtest="ReleaseBenchmarkTest" -Dsurefire.failIfNoSpecifiedTests=false

# 4. Generate reports
curl -X POST http://localhost:8080/admin/corpus-inventory/generate
curl -X POST http://localhost:8080/admin/corpus-release-report/generate

echo "Verification complete. Review docs/CORPUS_INVENTORY.md and docs/RELEASE_CORPUS_REPORT.md"
```

---

## Future Architecture — LegalChunkingStrategy Evaluation

Based on the corpus acquisition plan (300 documents, ~15,000 chunks), here is the updated assessment of whether `LegalChunkingStrategy` is justified.

### Is it still needed?

**Yes, but not before Phase 1.** The current `SentenceAwareChunkingStrategy` will work adequately for 300 documents. Documents will be chunked at ~1200 char targets with sentence boundary awareness. Retrieval will work. Answers will be grounded.

### Should it be implemented before or after the first 300 documents?

**After.** Implementing it now would add 3-4 engineering days to the critical path before any documents are ingested. The pipeline should be validated with real documents first to establish a baseline. Then `LegalChunkingStrategy` can be evaluated against that baseline.

### What measurable problem would it solve?

1. **Citation precision:** Currently chunks cite "Document Title" only. `LegalChunkingStrategy` enables "BauO Bln §61 Abs. 2" citations — this is Gate 9's target.

2. **Retrieval precision:** §-level chunks are more relevant than 1200-char blocks. A query about carport exemptions retrieves the §61 chunk specifically, not a 1200-char block containing §§ 60-63.

3. **Chunk coherence:** Legal boundaries ensure no chunk splits a legal rule across two chunks. Currently, a long § with multiple clauses could be split mid-clause.

### What benchmark should justify its implementation?

**Gate 9 (Citation Precision) failing to reach 80% after 300-document ingestion.** If after ingesting 300 documents, fewer than 80% of chunks from legal documents carry `section_ref` metadata (which the regex-based `DocumentParser` can populate without `LegalChunkingStrategy`), or if 20%+ of LLM answers cite wrong paragraphs, `LegalChunkingStrategy` is justified.

**Conversely, if Gate 9 passes without `LegalChunkingStrategy`** (because the regex parser correctly annotates chunk metadata with § references even at 1200-char boundaries), then `LegalChunkingStrategy` is unnecessary — the existing chunker + `DocumentParser` metadata is sufficient.

### Recommendation

1. Ingest 300 documents using the current `SentenceAwareChunkingStrategy`
2. Add `DocumentParser` (regex-based) to populate `section_ref` in chunk metadata — this is the minimal change needed for §-level citation
3. Run the benchmark and measure Gate 9
4. If Gate 9 ≥ 80%: LegalChunkingStrategy is deferred to v1.2
5. If Gate 9 < 80%: LegalChunkingStrategy is implemented for v1.2, using the `LegalStructure` from `DocumentParser` as input
