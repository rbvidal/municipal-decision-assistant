# Production Ingestion Pipeline — Implementation Report

**Date:** 2026-07-14  
**Version:** 1.1

---

## Phase 1 — Existing Pipeline Review

### Current Ingestion Flow

```
Upload                          Scheduled Worker               Processing
──────                          ────────────────               ──────────

DocumentPageController          DocumentIngestionWorker        DefaultDocumentIngestionProcessor
  │                               │                              │
  │ POST /documents/upload        │ @Scheduled(10s)              │ ingest(documentId)
  │                               │                              │
  ├─ Write file to uploads/       ├─ Poll top 10 PENDING jobs    ├─ IF orchestrator EXISTS:
  ├─ SHA-256 checksum             ├─ startIngestion(job)         │    orchestrator.indexDocument()
  ├─ CreateDocumentCommand         ├─ processor.ingest(docId)      │    → extract → chunk → embed → Qdrant
  ├─ documentFacade.createDocument│─ completeIngestion(job)      │    runEnrichment()
  ├─ documentFacade.createIngest  │  OR                          │
  └─ Redirect to /documents       └─ failIngestion(job, reason)  ├─ ELSE:
                                                                 │    ingestKeywordOnly()
                                                                 │    → extract → simple chunk → JPA
                                                                 └─ (no embeddings, no Qdrant)
```

### Stage-by-Stage Assessment

| Stage | What Works | What's Missing | Should NOT Change |
|---|---|---|---|
| **Upload** | File written to `uploads/`, SHA-256 computed, DocumentEntity created, IngestionJob enqueued | File validation (corrupt PDF detection, text layer check). Metadata extraction from content. Duplicate detection before upload. | REST API contract. DB schema. SHA-256 computation. |
| **Text Extraction** | PDFBox, POI, Jsoup extraction for PDF/DOCX/HTML/TXT | Scanned PDF detection (text layer check). Markdown support. OCR fallback. | Extraction interface. File-based storage. |
| **Metadata Extraction** | Manual entry via form (`title`, `category`, `tags`, `type`) | Automatic extraction of: title from PDF metadata, legal domain from content analysis, § references, effective dates, authority. Everything is manual. | Form-based upload as fallback. |
| **Chunking** | `SentenceAwareChunkingStrategy` (orchestrator path) or simple fixed-size (`ingestKeywordOnly` path) | Consistent chunking regardless of orchestrator availability. The two code paths produce different chunk boundaries. § reference annotation in chunk metadata. | `SentenceAwareChunkingStrategy`. Keep as primary chunker. |
| **Embedding** | `OllamaEmbeddingProvider` (conditional on config). Sequential `embedBatch()`. | Parallel embedding for large documents. Embedding model validation. | Embedding interface. nomic-embed-text model. 768d dimension. |
| **Indexing** | `QdrantVectorSearchProvider` indexes vectors. `ChunkManagementService` persists chunks to JPA. | No transaction across JPA + Qdrant. If Qdrant write fails, chunks exist in DB without vectors. | Qdrant collection config. JPA chunk storage. |
| **Manifest Update** | `CorpusManifestService.syncFromDocuments()` scans all documents and creates/refreshes entries. Called on-demand from dashboard. | `vectorCount` never set. Manifest not updated automatically after ingestion. No per-batch ingestion tracking. | Manifest schema (corpus_manifest table). syncFromDocuments() logic. |
| **Health Monitoring** | `CorpusHealthService` queries DB + Qdrant live. Produces per-document health status. | No per-batch quality reports. No automatic ingestion success/failure aggregation. No benchmark-linked health checks. | Health dashboard. Per-document health status. Qdrant integration. |

### Critical Gaps (Ranked by Impact)

1. **No duplicate detection before ingestion.** SHA-256 is computed but never checked against existing documents. Two uploads of the same PDF produce two documents with different IDs.

2. **No file validation before ingestion.** Corrupt PDFs, scanned-image PDFs, and password-protected PDFs pass through upload and fail during extraction — wasting an ingestion cycle.

3. **Two different chunking paths.** `ingestKeywordOnly()` uses simple character-window chunking with `CHUNK_SIZE=1200`. `indexDocument()` uses `SentenceAwareChunkingStrategy`. Same document produces different chunks depending on whether Ollama is running.

4. **No metadata extraction from content.** Every metadata field (`title`, `category`, `tags`, `authority`) is manually entered. For 1000 documents, this is unsustainable.

5. **No batch processing capability.** The upload API accepts one file at a time. The batch endpoint exists but does not allow per-file metadata. No directory scanning. No resume-after-failure.

6. **No ingestion quality reports.** After a batch, there's no automated report showing: how many succeeded, how many failed, why they failed, embedding coverage, or chunk statistics.

7. **Manifest vectorCount always 0.** `setVectorCount()` is never called during sync.

8. **No benchmark integration.** After ingestion, the benchmark is not automatically re-run. There's no before/after comparison.

---

## Phase 2 — Production Pipeline Design

### Target Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION INGESTION PIPELINE                          │
│                                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ACQUISITION│───▶│VALIDATION│───▶│ STORAGE  │───▶│METADATA EXTRACTION│  │
│  │           │    │          │    │          │    │                  │   │
│  │● Download │    │● PDF ok? │    │● Write   │    │● Title, domain  │   │
│  │● Source   │    │● Text    │    │  to      │    │● Authority      │   │
│  │  tracking │    │  layer?  │    │  uploads/│    │● § references   │   │
│  │● Metadata │    │● SHA-256 │    │● Create  │    │● Dates          │   │
│  │  CSV      │    │● Dupli-  │    │  Document│    │● Document type  │   │
│  │           │    │  cate?   │    │  Entity  │    │                  │   │
│  └──────────┘    └──────────┘    └──────────┘    └────────┬─────────┘   │
│                                                           │              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────┴─────────┐   │
│  │ BENCHMARK│◀───│ QUALITY  │◀───│ INDEXING │◀───│CHUNK + EMBED    │   │
│  │          │    │  GATES   │    │          │    │                 │   │
│  │● Before  │    │● Success │    │● JPA     │    │● Chunking      │   │
│  │  / After │    │  report  │    │  persist │    │● Embedding     │   │
│  │● Delta   │    │● Metadata│    │● Qdrant  │    │● § annotations │   │
│  │● Which Qs│    │  coverage│    │  index   │    │● Manifest      │   │
│  │  improved│    │● Warnings│    │● Manifest│    │  update        │   │
│  └──────────┘    └──────────┘    └──────────┘    └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Stage Details

#### Stage 1 — ACQUISITION (Manual + CSV metadata)

Documents are collected from official sources and placed in a directory structure:

```
corpus-inbox/
  procurement/
    AV_zu_Paragraf_55_LHO_Berlin_2025.pdf
    AV_zu_Paragraf_55_LHO_Berlin_2025.json   ← metadata sidecar
    BerlAVG_2025.pdf
    BerlAVG_2025.json
  building/
    BauO_Bln_2025.pdf
    BauO_Bln_2025.json
  hr/
    TV-L_Entgelttabellen_2025.pdf
    TV-L_Entgelttabellen_2025.json
```

Each PDF has a JSON metadata sidecar:

```json
{
  "title": "AV zu Paragraph 55 LHO Berlin — Wertgrenzen",
  "short_name": "AV §55 LHO",
  "legal_domain": "Vergaberecht",
  "jurisdiction": "Berlin",
  "authority": "Senatsverwaltung für Finanzen Berlin",
  "doc_type": "Verwaltungsvorschrift",
  "document_category": "admin_regulation",
  "language": "DE",
  "publication_date": "2025-01-01",
  "effective_date": "2025-01-01",
  "version_identifier": "2025-01-01",
  "version_state": "current",
  "source_url": "https://www.berlin.de/sen/finanzen/...",
  "tags": ["vergabe", "wertgrenzen", "direktauftrag", "lho"],
  "priority": "P1",
  "update_frequency": "jährlich"
}
```

#### Stage 2 — VALIDATION (Automated pre-flight)

```
For each file in corpus-inbox/:
  □ PDF opens correctly (not corrupt)
  □ Text layer present (extracted chars > 100)
  □ Not password-protected
  □ SHA-256 does NOT match any existing document (duplicate check)
  □ Title does NOT match existing document with same version_identifier
  □ Metadata sidecar is present and has all required fields
  □ Metadata sidecar is valid JSON
  □ File size is reasonable (< 50 MB)

If ALL checks pass → proceed to storage
If ANY check fails → log warning, skip file, continue batch
```

#### Stage 3 — STORAGE (Automated)

```
For each validated file:
  1. Copy to uploads/imports/{UUID}_{original_filename}
  2. Read metadata sidecar
  3. Create DocumentEntity:
     - title ← metadata.title
     - type ← inferred from file extension
     - category ← metadata.legal_domain
     - tags ← metadata.tags + ["imported", metadata.version_state]
     - status ← DRAFT
  4. Create DocumentVersionEntity:
     - versionNumber ← 1
     - fileName ← original filename
     - storageKey ← uploads/imports/{UUID}_{filename}
     - checksumSha256 ← computed SHA-256
  5. Create IngestionJobEntity (status: PENDING)
  6. The scheduled DocumentIngestionWorker picks it up
```

#### Stage 4 — METADATA EXTRACTION (Automated, deterministic)

After text extraction but before chunking:

```
Extracted text
    │
    ▼
MetadataExtractor.extract(text, metadataSidecar)
    │
    ├── Title: from sidecar (authoritative), fallback to regex from text
    ├── Short name: from sidecar, fallback to regex "([A-Z][a-z]+)\\s*(\\([A-Z][a-z ]+\\))?"
    ├── § references: regex "§\\s*(\\d+[a-z]?)" → List<String>
    ├── Article references: regex "Art\\.\\s*(\\d+[a-z]?)" → List<String>
    ├── Effective date: from sidecar, fallback to regex "in Kraft.*?(\\d{1,2}\\.\\s*(\\w+)\\s*\\d{4})"
    ├── Authority: from sidecar
    ├── Jurisdiction: from sidecar
    └── Language: from sidecar, fallback to character detection
```

#### Stage 5 — DUPLICATE & VERSION DETECTION (Automated)

Before creating a DocumentEntity:

```
For each file to be imported:
  1. Compute SHA-256
  2. Query document_versions WHERE checksum_sha256 = {sha256}
     → IF found: EXACT DUPLICATE. Skip, log "Already imported as {docId}".
  3. Query documents WHERE title ILIKE {title}
     → IF found with same title but different checksum:
        → IF metadata.version_state == "current" AND existing has "current":
          → Compare publication_date. Newer date = NEWER VERSION.
          → Tag existing as "historical", "superseded-by:{newId}"
          → Import new as "current", "supersedes:{existingId}"
        → IF metadata.version_state == "current" AND existing has "historical":
          → Import as new "current" version. Link both.
  4. If no duplicate or version conflict: normal import.
```

#### Stage 6 — CHUNKING + EMBEDDING (Existing, enhanced)

Uses the existing `DefaultIndexingOrchestrationService.indexDocument()` path. Two enhancements:

1. After chunking, run `LegalMetadataAnnotator` on each chunk to add § references to `attributes`
2. Pass metadata from sidecar + extraction into chunk attributes

#### Stage 7 — INDEXING + MANIFEST (Existing, enhanced)

Uses existing `ChunkManagementService` + `QdrantVectorSearchProvider`. After indexing:

1. Call `CorpusManifestService.syncFromDocuments()` — now also updates `vectorCount`
2. Record ingestion batch metadata: `batch_id`, `imported_at`, `file_count`

#### Stage 8 — QUALITY GATES (New, automated)

After batch completes, generate:

```
docs/imports/{batch_id}/
  INGESTION_REPORT.md     ← success/failure counts, durations
  DUPLICATE_REPORT.md     ← duplicates found, version conflicts
  EXTRACTION_REPORT.md    ← per-doc extracted chars, text quality
  METADATA_REPORT.md      ← completeness per field
  CHUNK_REPORT.md         ← chunk counts, sizes, § coverage
  EMBEDDING_REPORT.md     ← embedding coverage, vector counts
  FAILURE_REPORT.md       ← failed documents with reasons
```

#### Stage 9 — BENCHMARK (Existing, integrated)

```
1. Run benchmark BEFORE import → save results
2. Run import batch
3. Run benchmark AFTER import → save results
4. Generate IMPROVEMENT_REPORT.md:
   - Which questions' scores improved
   - Which stayed the same
   - Which degraded (regression alert)
   - Before/after comparison table
```
