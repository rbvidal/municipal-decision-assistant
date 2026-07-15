# platform-knowledge — Implementation Design

**Version:** 2.0  
**Date:** 2026-07-14  
**Status:** Proposed  
**Constraint:** Must be implementable incrementally; no breaking changes to existing modules

---

## 1. Module Responsibility Boundary

```
┌─────────────────────────────────────────────────────────────┐
│                      Responsibility Split                    │
│                                                              │
│  platform-document    →  stores raw files, versions, status  │
│                          (knows NOTHING about corpora)        │
│                                                              │
│  platform-search      →  keyword search, vector search,      │
│                          hybrid merge, rerank, Qdrant        │
│                          (knows HOW to search, not what)      │
│                                                              │
│  platform-knowledge   →  corpus definitions, metadata,       │
│  [NEW]                    lifecycle, acquisition, versioning, │
│                          health, routing, processing pipeline │
│                          (knows WHAT knowledge exists)        │
│                                                              │
│  platform-ai          →  DecisionRouter, RuleEngine,         │
│                          grounding, prompt building, LLM      │
│                          (knows HOW to answer questions)      │
└─────────────────────────────────────────────────────────────┘
```

**Dependency chain:**

```
platform-api
  └── platform-ai
        └── platform-knowledge  [NEW]
              ├── platform-search
              └── platform-document
```

`platform-knowledge` depends on `platform-document` (to read/write documents) and `platform-search` (to trigger indexing). `platform-ai` depends on `platform-knowledge` (to route queries to corpora). This is the only new dependency edge.

---

## 2. Schema Change — One Column

### `documents` table

```sql
ALTER TABLE documents ADD COLUMN corpus_id VARCHAR(50) DEFAULT 'legal';
```

That is the only DDL change for v2.0.

### Why not separate tables per corpus?

| Approach | Tables | Repositories | Migration | Query Complexity |
|---|---|---|---|---|
| Separate tables per corpus | `legal_docs`, `case_docs`, `comm_docs` + separate chunk tables | 1 Spring Data repo per table | Data migration scripts per corpus | Simple queries, complex cross-corpus |
| **Single table + corpus_id** | `documents` + 1 column | 1 Spring Data repo | One ALTER TABLE | Simple queries with WHERE corpus_id = ? |

**Decision:** Single table. The `documents` table already has generic fields (`title`, `category`, `tags`, `type`). A law and a case file both have a title, a type, and tags. The `corpus_id` discriminates them. The `corpus_manifest` table stores corpus-specific metadata.

### When would separate tables become justified?

When a document type requires **structurally different columns** that would make the generic `documents` table a sparse mess. Example: a `case_docs` table with `case_number`, `applicant_name`, `due_date`, `assigned_to` columns that are irrelevant for laws. This is deferred to v3.0 when case management is built.

---

## 3. Package Structure

```
platform-knowledge/
│
├── pom.xml
│
└── src/main/java/com/cognitera/platform/knowledge/
    │
    ├── api/                              [PUBLIC INTERFACES]
    │   ├── CorpusPlugin.java             ← main contract
    │   ├── CorpusDescriptor.java         ← metadata record
    │   ├── CorpusCapability.java         ← what this corpus supports
    │   ├── CorpusRegistry.java           ← register + lookup
    │   ├── CorpusRouter.java             ← select corpora for a query
    │   ├── KnowledgeFacade.java          ← public API for other modules
    │   ├── KnowledgeManifest.java        ← typed manifest (replaces web manifest)
    │   ├── KnowledgeLifecycle.java       ← state machine contract
    │   ├── KnowledgeHealth.java          ← health check contract
    │   ├── KnowledgeAcquisition.java     ← ingest new knowledge
    │   ├── KnowledgeVersioning.java      ← version management
    │   └── RetrievalPolicy.java          ← per-corpus retrieval config
    │
    ├── model/                            [RECORDS, ENUMS]
    │   ├── CorpusId.java                 ← "legal", "procedural", "case", etc.
    │   ├── KnowledgeState.java           ← lifecycle states
    │   ├── KnowledgeDomain.java          ← Vergaberecht, Baurecht, etc.
    │   ├── ManifestEntry.java            ← immutable manifest record
    │   ├── AcquisitionRequest.java       ← upload + metadata
    │   └── ProcessingPipeline.java       ← parser → metadata → chunk → embed
    │
    ├── application/                      [DEFAULT IMPLEMENTATIONS]
    │   ├── DefaultCorpusRegistry.java    ← collects CorpusPlugin beans
    │   ├── DefaultCorpusRouter.java      ← intent-based routing
    │   ├── DefaultKnowledgeFacade.java   ← orchestrates lifecycle
    │   ├── DefaultKnowledgeManifest.java ← manifest CRUD
    │   ├── DefaultKnowledgeLifecycle.java← state transitions
    │   ├── DefaultKnowledgeAcquisition.java ← upload → validate → ingest → index
    │   ├── DefaultKnowledgeVersioning.java  ← version chain management
    │   └── DefaultKnowledgeHealth.java   ← per-corpus health metrics
    │
    ├── plugin/                           [BUILT-IN CORPUS IMPLEMENTATIONS]
    │   ├── LegalCorpusPlugin.java        ← LEGAL corpus
    │   ├── ProceduralCorpusPlugin.java   ← PROCEDURAL corpus
    │   └── DefaultCorpusPlugin.java      ← fallback for uncategorized docs
    │
    └── config/                           [SPRING CONFIGURATION]
        └── KnowledgeAutoConfiguration.java
```

---

## 4. Interface Definitions

### 4.1 CorpusPlugin

The central contract. Every corpus implements this. It is a Spring bean — the registry discovers it automatically.

```
CorpusPlugin
│
├── Identity
│   ├── CorpusDescriptor describe()
│   │     Returns: corpusId, displayName, description, domain, priority
│   │
│   ├── CorpusCapability capabilities()
│   │     Returns: supportsVectorSearch, supportsKeywordSearch,
│   │              supportsEmbedding, supportsVersioning,
│   │              supportsTemporalQuery, requiresEncryption,
│   │              maxChunkSize, defaultSearchMode
│   │
├── Processing Pipeline
│   ├── Parser parser()
│   │     Optional. Returns null for TXT files (no parsing needed).
│   │     Returns LegalDocParser for PDFs with § structure.
│   │     Returns MimeParser for .eml files.
│   │
│   ├── MetadataExtractor metadataExtractor()
│   │     Extracts structured metadata from parsed content.
│   │     LegalMetadataExtractor → § references, effective dates
│   │     NoOpMetadataExtractor → for simple documents
│   │
│   ├── ChunkingStrategy chunkingStrategy()
│   │     Returns existing SentenceAwareChunkingStrategy for most corpora.
│   │     Workspace returns NoOpChunkingStrategy.
│   │
│   ├── EmbeddingProvider embeddingProvider()
│   │     Returns the shared OllamaEmbeddingProvider for most corpora.
│   │     Workspace returns null (no embeddings).
│   │
├── Retrieval
│   ├── RetrievalPolicy retrievalPolicy()
│   │     Returns: searchMode, maxResults, minScore, domainBoost,
│   │              rerankEnabled, crossEncoderModel
│   │
│   ├── String qdrantCollection()
│   │     Returns "legal_corpus" for LEGAL, null for WORKSPACE.
│   │     Same value for LEGAL + PROCEDURAL in v2.0.
│   │
├── Security
│   └── SecurityPolicy securityPolicy()
│       Returns: accessControl (PUBLIC, TENANT, OWNER),
│                encryptionRequired, piiClassification,
│                retentionPeriod, requiresAudit
│
├── Lifecycle
│   ├── boolean accepts(DocumentType type, Map<String,String> metadata)
│   │     Can this corpus handle this document?
│   │     LegalCorpusPlugin: type==PDF && domain in [Vergaberecht, Baurecht...]
│   │
│   └── void onDocumentRegistered(UUID documentId)
│       Hook called after a document is assigned to this corpus.
│       LegalCorpusPlugin: triggers metadata extraction + chunking.
```

### 4.2 CorpusDescriptor

Immutable identity record.

```
CorpusDescriptor
    corpusId: "legal"
    displayName: "Legal Corpus"
    description: "German federal and state laws, regulations, court decisions"
    domain: LEGAL
    priority: 1       (lower = higher priority when routing is ambiguous)
    icon: "gavel"     (UI hint, not functional)
```

### 4.3 CorpusCapability

Feature flags — what this corpus can and cannot do.

```
CorpusCapability
    supportsVectorSearch: true
    supportsKeywordSearch: true
    supportsEmbedding: true
    supportsVersioning: true
    supportsTemporalQuery: false   (v3.0)
    requiresEncryption: false
    maxChunkSize: 1200
    defaultSearchMode: HYBRID
```

### 4.4 CorpusRegistry

Discovers and indexes all `CorpusPlugin` beans.

```
CorpusRegistry
    void register(CorpusPlugin plugin)
    Optional<CorpusPlugin> get(CorpusId id)
    List<CorpusPlugin> all()
    List<CorpusPlugin> accepting(DocumentType type, Map<String,String> metadata)
    CorpusPlugin defaultPlugin()
```

Default implementation: `DefaultCorpusRegistry` implements `BeanPostProcessor` — after all beans are initialized, it collects every `CorpusPlugin` bean and indexes them. No manual registration. No configuration file. Add a new corpus → add a new `@Component` that implements `CorpusPlugin` → automatically registered.

### 4.5 CorpusRouter

Given a question and context, returns which corpora to query in which order.

```
CorpusRouter
    RoutingResult route(
        String question,
        QueryIntent intent,
        CorpusId workspaceCorpus,    // optional: from workspace context
        UUID caseId,                 // optional: from case context
        String tenantId,
        String userId
    )

RoutingResult
    List<CorpusTarget> targets     // ordered by priority
    boolean includeCaseContext     // should case docs be included?

CorpusTarget
    CorpusId corpusId
    SearchMode searchMode
    int maxResults
    float corpusWeight            // 1.0 = authoritative, 0.5 = contextual
    Set<String> requiredTags      // e.g., ["current"] for LEGAL
    Map<String,String> filterOverrides
```

### 4.6 RetrievalPolicy

Per-corpus retrieval configuration.

```
RetrievalPolicy
    SearchMode defaultMode        // HYBRID, KEYWORD, or SEMANTIC
    int defaultMaxResults         // typically 20
    float minScoreThreshold       // 0.1 — discard below this
    float domainBoostFactor       // 0.35 — boost for matching domain
    boolean rerankEnabled         // true for LEGAL, false for WORKSPACE
    String crossEncoderModel      // null = use default
```

### 4.7 KnowledgeLifecycle

State machine for knowledge units (documents within a corpus).

```
                    ┌─────────┐
                    │ACQUIRED │  ← document uploaded, not yet validated
                    └────┬────┘
                         │ validate()
                         ▼
                    ┌─────────┐
                    │VALIDATED│  ← metadata complete, file readable
                    └────┬────┘
                         │ ingest()
                         ▼
                    ┌─────────┐
                    │INGESTING│  ← text extraction + chunking in progress
                    └────┬────┘
                         │ complete() / fail()
                         ▼
                    ┌─────────┐     ┌─────────┐
                    │  READY  │────▶│ OUTDATED│  ← newer version exists
                    └────┬────┘     └─────────┘
                         │ retire()
                         ▼
                    ┌─────────┐
                    │RETIRED  │  ← no longer in active retrieval
                    └─────────┘
```

```
KnowledgeLifecycle
    void transition(UUID documentId, KnowledgeState target)
    void validate(UUID documentId)       // run pre-flight checks
    void ingest(UUID documentId)         // trigger indexing pipeline
    void markOutdated(UUID documentId, String supersededBy)
    void retire(UUID documentId)
    KnowledgeState currentState(UUID documentId)
    List<UUID> documentsInState(KnowledgeState state, CorpusId corpus)
```

### 4.8 KnowledgeAcquisition

Owns the end-to-end document onboarding process.

```
KnowledgeAcquisition
    AcquisitionResult acquire(AcquisitionRequest request)
        // 1. Determine which corpus accepts this document
        //    → ask CorpusRegistry.accepting(type, metadata)
        // 2. Validate: file readable, metadata complete, no duplicate
        // 3. Store: create DocumentEntity with corpusId
        // 4. Extract metadata: run corpus's MetadataExtractor
        // 5. Create manifest entry: KnowledgeManifest.register()
        // 6. Trigger ingestion: KnowledgeLifecycle.ingest()
        // 7. Return result with documentId + corpusId + validation warnings

    List<AcquisitionWarning> validate(AcquisitionRequest request)
        // Pre-flight checks before storage:
        // - File is not corrupt
        // - Text layer present (for PDFs)
        // - Required metadata fields present
        // - No duplicate SHA-256
        // - Corpus accepts this document type

AcquisitionRequest
    MultipartFile file           (or path to file)
    Map<String,String> metadata  (title, domain, authority, etc.)
    String requestedCorpus       (optional — auto-detect if null)
    String actorId
    String tenantId

AcquisitionResult
    UUID documentId
    CorpusId corpusId
    KnowledgeState finalState
    List<AcquisitionWarning> warnings
```

### 4.9 KnowledgeVersioning

Manages version chains within a corpus.

```
KnowledgeVersioning
    VersionChain getVersionChain(UUID documentId)
        // Returns: [v2018 → v2023 → v2025(CURRENT)]
        // Uses corpus_manifest.versionIdentifier and tags

    void registerNewVersion(UUID previousDocumentId, UUID newDocumentId)
        // Tags previous doc: "historical", "superseded-by:{newId}"
        // Tags new doc: "current", "supersedes:{previousId}"
        // Updates manifest: effective_date, last_amendment_date

    void repeal(UUID documentId, LocalDate repealDate)
        // Tags doc: "repealed", "repealed:{date}"
        // Updates manifest: expiry_date

    List<ManifestEntry> currentVersions(CorpusId corpus)
        // All documents tagged "current" in this corpus

    Optional<ManifestEntry> versionAsOf(UUID documentId, LocalDate date)
        // Which version of this document was in force on the given date?
        // v3.0 feature — not implemented in v2.0
```

### 4.10 KnowledgeManifest

Corpus-aware manifest. Moves the existing `CorpusManifestService` from `platform-api/web` into `platform-knowledge` where it belongs.

```
KnowledgeManifest
    ManifestEntry register(UUID documentId, Map<String,String> metadata)
    ManifestEntry update(UUID documentId, Map<String,String> metadata)
    Optional<ManifestEntry> get(UUID documentId)
    List<ManifestEntry> findByCorpus(CorpusId corpus)
    List<ManifestEntry> findByDomain(KnowledgeDomain domain)
    ManifestSummary summary(CorpusId corpus)
    void syncFromDocuments(CorpusId corpus)     // refresh metrics from DB
```

### 4.11 KnowledgeHealth

Corpus-aware health metrics. Extends the existing `CorpusHealthService`.

```
KnowledgeHealth
    CorpusHealthReport healthReport(CorpusId corpus)
        // Per-corpus: document count, chunk count, embedding coverage,
        // Qdrant vector count, missing/outdated/duplicate docs, warnings

    List<MissingDocument> findMissingDocuments(CorpusId corpus)
    List<OutdatedDocument> findOutdatedDocuments(CorpusId corpus)
    List<DuplicateGroup> findDuplicates(CorpusId corpus)

    GlobalHealthReport globalHealthReport()
        // Aggregates all corpora
```

---

## 5. Processing Pipeline — Per Corpus

Every corpus owns its processing pipeline. The pipeline is assembled from the `CorpusPlugin` methods:

```
┌──────────────────────────────────────────────────────────────────┐
│                  PROCESSING PIPELINE (per corpus)                  │
│                                                                    │
│  Document uploaded                                                 │
│      │                                                             │
│      ▼                                                             │
│  ┌──────────┐                                                      │
│  │  Parser  │  ← plugin.parser().parse(rawText)                   │
│  │          │    LegalDocParser → identifies § sections            │
│  │          │    MimeParser → separates headers/body/attachments   │
│  │          │    null → no parsing (TXT files pass through)        │
│  └────┬─────┘                                                      │
│       │ parsedDocument (with structural annotations)                 │
│       ▼                                                             │
│  ┌──────────────────┐                                              │
│  │ MetadataExtractor│  ← plugin.metadataExtractor().extract()      │
│  │                  │    Extracts: § references, effective dates,  │
│  │                  │    authority, short_title, jurisdiction       │
│  └────┬─────────────┘                                              │
│       │ enriched metadata                                           │
│       ▼                                                             │
│  ┌──────────────────┐                                              │
│  │ ChunkingStrategy │  ← plugin.chunkingStrategy().chunk()         │
│  │                  │    LEGAL: SentenceAware (future: Legal)      │
│  │                  │    PROCEDURAL: SentenceAware                 │
│  │                  │    WORKSPACE: null (no chunking)              │
│  └────┬─────────────┘                                              │
│       │ List<DocumentChunk>                                         │
│       ▼                                                             │
│  ┌──────────────────┐                                              │
│  │EmbeddingProvider │  ← plugin.embeddingProvider().embedBatch()   │
│  │                  │    LEGAL/PROCEDURAL: Ollama (shared)         │
│  │                  │    WORKSPACE: null (no embeddings)            │
│  └────┬─────────────┘                                              │
│       │ List<float[]>                                               │
│       ▼                                                             │
│  ┌──────────────────┐                                              │
│  │VectorSearchProvider│ ← IndexChunkCommand + embeddings → Qdrant  │
│  │                    │   Collection from plugin.qdrantCollection() │
│  └────────────────────┘                                            │
└──────────────────────────────────────────────────────────────────┘
```

### Concrete Examples

#### LEGAL corpus (BauO Bln PDF)

```
plugin = LegalCorpusPlugin

● parser() → LegalDocParser
  Input:  raw PDF text
  Output: ParsedDocument with structural elements identified:
          [§61 "Genehmigungsfreie Vorhaben" at offset 12400,
           §62 "Genehmigungsfreistellung" at offset 15200, ...]

● metadataExtractor() → LegalMetadataExtractor
  Extracts: short_title="BauO Bln", jurisdiction="Berlin",
            authority="SenStadt", effective_date=2025-06-30,
            §_count=15, version_identifier="2025-06-30"

● chunkingStrategy() → SentenceAwareChunkingStrategy (existing)
  Chunks at sentence boundaries, 1200-char target.
  LegalChunkingStrategy deferred to v2.1 — requires evaluation
  against Gate 9 (citation precision) after 300 documents.

● embeddingProvider() → ollamaEmbeddingProvider (shared)
  nomic-embed-text, 768 dimensions

● qdrantCollection() → "legal_corpus"
  Shared with PROCEDURAL in v2.0
```

#### PROCEDURAL corpus (BauVorlV PDF)

```
plugin = ProceduralCorpusPlugin

● parser() → LegalDocParser (same as LEGAL — it's still a legal doc)
● metadataExtractor() → LegalMetadataExtractor (same)
● chunkingStrategy() → SentenceAwareChunkingStrategy (same)
● embeddingProvider() → ollamaEmbeddingProvider (same)
● qdrantCollection() → "legal_corpus" (SAME as LEGAL in v2.0)
```

#### WORKSPACE corpus (user draft)

```
plugin = WorkspaceCorpusPlugin

● parser() → null (no parsing)
● metadataExtractor() → NoOpMetadataExtractor
● chunkingStrategy() → NoOpChunkingStrategy (returns empty list)
● embeddingProvider() → null
● qdrantCollection() → null (no Qdrant — filesystem only)

● retrievalPolicy() → KEYWORD only, maxResults=10
● securityPolicy() → OWNER only, retention=30d
```

---

## 6. Qdrant Collection Strategy

### v2.0: One Collection for Two Corpora

```
LEGAL + PROCEDURAL → shared collection "legal_corpus"
```

Documents are differentiated by `corpus_id` in Qdrant payload. A metadata filter at query time restricts results:

```
// LEGAL query: filter payload.corpus_id = "legal"
// PROCEDURAL query: filter payload.corpus_id = "procedural"
// Combined query: no filter (both)
```

This works because:
1. Both corpora use the same embedding model (nomic-embed-text, 768d)
2. Both have the same vector dimension
3. Both are public, read-heavy, permanent
4. Combined size in v2.0: ~300 documents × ~40 chunks = ~12,000 vectors. Qdrant handles this trivially.
5. Metadata filtering in Qdrant is efficient (<1ms overhead)

### v3.0: Separate Collections for Isolated Corpora

```
CASE            → collection "case_{tenant_id}"
COMMUNICATION   → collection "comm_{tenant_id}"
WORKSPACE       → no collection
```

This is justified when:
1. **Security:** CASE documents contain PII. A bug in a metadata filter could expose personal data. A separate collection provides infrastructure-level isolation — even if the filter is omitted, the wrong collection isn't queried.
2. **Performance:** CASE grows to ~1,000,000 vectors per tenant. Searching this alongside LEGAL (~50,000 vectors) means the legal search is crowded out by case noise. Separate collections keep legal search fast.
3. **Retention:** CASE documents are deleted after 5 years. Deleting from a dedicated collection is a simple collection drop for expired tenant data. Deleting filtered points from a shared collection requires scanning the entire collection.
4. **Embedding model divergence:** CASE documents may benefit from a different embedding model in the future. Separate collections allow per-corpus embedding models.

### Decision Rule for Future Corpora

| Condition | Shared Collection OK? | Separate Collection Required? |
|---|---|---|
| Same embedding model + dimension | YES | NO |
| Same access control level (public vs tenant) | YES | NO |
| Same retention policy | YES | NO |
| Combined size < 100K vectors | YES | NO |
| Contains PII | NO | **YES** |
| Combined size > 1M vectors | NO | **YES** |
| Different embedding model | NO | **YES** |
| GDPR Art. 9 data (special categories) | NO | **YES — physical isolation required** |

---

## 7. Knowledge Lifecycle — End to End

```
┌─────────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE LIFECYCLE                               │
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ACQUISITION│───▶│VALIDATION│───▶│INGESTION │───▶│INDEXING  │      │
│  │           │    │          │    │          │    │          │      │
│  │ ● Upload  │    │ ● Pre-   │    │ ● Text   │    │ ● Chunk  │      │
│  │ ● Metadata│    │   flight │    │   extract│    │ ● Embed  │      │
│  │ ● Corpus  │    │ ● Dupli- │    │ ● Parse  │    │ ● Qdrant │      │
│  │   assign  │    │   cate   │    │ ● Metadata│   │ ● Verify │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │                                                  │           │
│       │              ┌──────────────────────────────────┘           │
│       │              ▼                                              │
│       │         ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│       │         │ MONITOR  │◀──▶│ VERSION  │───▶│ RETIRE   │       │
│       │         │          │    │          │    │          │       │
│       │         │ ● Health │    │ ● Amend  │    │ ● Expire │       │
│       │         │ ● Drift  │    │ ● Repeal │    │ ● Archive│       │
│       │         │ ● Bench  │    │ ● History│    │ ● Purge  │       │
│       │         └──────────┘    └──────────┘    └──────────┘       │
│       │                                                              │
│       └──► All stages owned by KnowledgeLifecycle                    │
│            NOT by Search, NOT by AI, NOT by DocumentController       │
└─────────────────────────────────────────────────────────────────────┘
```

**Responsibility assignment:**

| Stage | Owner | Implementation |
|---|---|---|
| ACQUISITION | `KnowledgeAcquisition.acquire()` | Calls `CorpusRegistry.accepting()` → `DocumentFacade.createDocument()` → `KnowledgeLifecycle.transition(VALIDATED)` |
| VALIDATION | `KnowledgeAcquisition.validate()` | Pre-flight checks — file integrity, text layer, duplicate, required metadata |
| INGESTION | `KnowledgeLifecycle.ingest()` | Calls `TextExtractionService` → corpus `Parser` → corpus `MetadataExtractor` |
| INDEXING | `KnowledgeLifecycle.ingest()` | Calls corpus `ChunkingStrategy` → corpus `EmbeddingProvider` → `VectorSearchProvider` |
| MONITOR | `KnowledgeHealth.healthReport()` | Per-corpus metrics, drift detection, benchmark scores |
| VERSIONING | `KnowledgeVersioning` | Amendment, repeal, supersession, effective dates |
| RETIREMENT | `KnowledgeLifecycle.retire()` | Mark retired, exclude from retrieval, archive or delete after retention |

---

## 8. Case Management Readiness

The platform's long-term purpose is not document retrieval — it is municipal work assistance. The Knowledge module prepares for this in three ways.

### 8.1 Corpus Isolation Enables Case-Scoped Search

A case worker searches within a case. They do not search the entire legal corpus for case-specific documents.

```
Today (without Knowledge module):
  search("Bauantrag Spandau") → returns legal docs + everything
  Filtering happens nowhere — DomainGate not even wired

v2.0 (with Knowledge module):
  CorpusRouter.route(question, caseId="CASE-001")
    → returns [CASE(caseId=CASE-001), LEGAL, PROCEDURAL]
  FederatedSearchService queries CASE corpus filtered to caseId
  Legal + procedural results provide regulatory context
  Case results provide the specific application documents
```

The `CorpusRouter` already accepts `caseId` as input. When case management is built, it passes the case ID. The routing logic already handles it.

### 8.2 Metadata Schema Supports Workflow Fields

The `corpus_manifest` table already has generic fields. For CASE documents, additional metadata can be stored in the `tags` and `attributes` columns:

```
CASE document tags:
  ["case:CASE-2026-0714-001", "status:awaiting_documents",
   "assigned_to:frau-schmidt", "due:2026-08-14",
   "priority:high", "workflow:bauaufsicht_standard"]

These are queryable today via SearchFilter.tag and corpus manifest queries.
```

When case management is built, these become first-class columns on a `case_docs` table. But for v2.0, the EAV model is sufficient to prove the concept.

### 8.3 Lifecycle States Map to Workflow States

```
KnowledgeLifecycle state    →   Case Workflow state (future)
─────────────────────────────────────────────────────────
ACQUIRED                   →   SUBMITTED (citizen submitted)
VALIDATED                  →   UNDER_REVIEW (clerk verified)
INGESTING                  →   (internal)
READY                      →   IN_PROGRESS (being processed)
OUTDATED                   →   SUPERSEDED (newer version)
RETIRED                    →   CLOSED / ARCHIVED
```

The state machine is already generic. When case management is built, it extends the states with workflow-specific transitions (ASSIGNED, AWAITING_REVIEW, APPROVED, REJECTED).

### 8.4 What is NOT Being Built in v2.0 (but is prepared for)

| Feature | v2.0 (Knowledge module) | v3.0 (Case Management) |
|---|---|---|
| **Task queues** | `due_date` in manifest tags | `case_tasks` table with FIFO ordering |
| **FIFO inbox** | Not built | `SELECT * FROM case_tasks WHERE assigned_to = ? ORDER BY received_date` |
| **SLA monitoring** | `due_date` tag | `case_sla` table with escalation logic |
| **Assignment** | `assigned_to` tag | `case_assignments` table with role-based routing |
| **Workflow** | `workflow_state` tag | `case_workflows` table with BPMN or state machine |

The Knowledge module provides the **taxonomy and routing** that case management will need. It does not implement case management itself.

---

## 9. Migration Plan

### Phase 1 — Module Skeleton (Days 1-2)

1. Create `platform-knowledge` module with `pom.xml` depending on `platform-document` and `platform-search`
2. Create package structure (api/, model/, application/, plugin/, config/)
3. Implement `CorpusDescriptor`, `CorpusCapability`, `CorpusId` (records — no logic)
4. Implement `DefaultCorpusPlugin` — wraps all existing behavior, `corpusId = "default"`, accepts all documents
5. Implement `DefaultCorpusRegistry` — collects `CorpusPlugin` beans via `BeanPostProcessor`
6. Implement `DefaultCorpusRouter` — always returns `["default"]` for all queries
7. Wire into Spring context — `KnowledgeAutoConfiguration`

**Exit criterion:** Application starts. No behavioral change. All existing tests pass.

### Phase 2 — corpus_id Column (Day 3)

1. Add `corpus_id VARCHAR(50) DEFAULT 'legal'` to `documents` table
2. Migrate existing demo documents: set `corpus_id = 'legal'`
3. `DocumentEntity` gains `corpusId` field with getter/setter
4. `JpaDocumentEntityRepository` gains `findByCorpusId(String corpusId)`

**Exit criterion:** All 23 demo documents have `corpus_id = 'legal'`. No test failures.

### Phase 3 — Corpus Plugins (Days 4-5)

1. Implement `LegalCorpusPlugin` — `corpusId = "legal"`, Parser=LegalDocParser, Chunker=SentenceAware, Qdrant="legal_corpus"
2. Implement `ProceduralCorpusPlugin` — `corpusId = "procedural"`, same config, Qdrant="legal_corpus" (shared)
3. Implement `LegalDocParser` — regex-based § detection, no chunk splitting (just structural annotation)
4. Implement `LegalMetadataExtractor` — extracts short_title, authority, jurisdiction, effective_date
5. `CorpusRouter` now returns `["legal", "procedural"]` for HYBRID_RETRIEVAL queries

**Exit criterion:** Documents can be assigned to LEGAL or PROCEDURAL corpus. Health dashboard shows per-corpus metrics.

### Phase 4 — Knowledge Services (Days 6-8)

1. Move `CorpusManifestService` from `platform-api/web` to `platform-knowledge/application/DefaultKnowledgeManifest`
2. Move `CorpusHealthService` corpus-aware logic to `platform-knowledge/application/DefaultKnowledgeHealth`
3. Implement `DefaultKnowledgeAcquisition` — wraps `DocumentPageController.upload()` logic
4. Implement `DefaultKnowledgeLifecycle` — state machine with validation hooks
5. Implement `DefaultKnowledgeVersioning` — version chains via tags
6. `DocumentPageController` delegates to `KnowledgeFacade.acquire()` instead of direct upload logic

**Exit criterion:** All existing functionality preserved. New documents flow through Knowledge module. Health dashboard and manifest work as before.

### Phase 5 — Integration & Validation (Days 9-10)

1. Update `DefaultRetrievalAugmentationService` to use `CorpusRouter` for corpus selection
2. Update `SearchService` to accept corpus-scoped `SearchFilter` with `corpus_id`
3. Update `CorpusHealthController` to show per-corpus tabs
4. Run full benchmark (40 questions) — must produce identical or improved results
5. Run release benchmark if Ollama is available

**Exit criterion:** Benchmark pass rate unchanged or improved. All release gates recalculated.

---

## 10. Implementation Order (Prioritized)

| # | Item | Effort | Dependencies | Risk |
|---|---|---|---|---|
| 1 | `platform-knowledge` module skeleton + `DefaultCorpusPlugin` | 1 day | None | Low |
| 2 | `CorpusDescriptor`, `CorpusCapability`, `CorpusId` records | 0.5 days | #1 | Low |
| 3 | `CorpusRegistry` + `BeanPostProcessor` | 1 day | #1 | Low |
| 4 | `CorpusRouter` (always returns default) | 0.5 days | #3 | Low |
| 5 | `corpus_id` column + migration | 0.5 days | #1 | Medium — DDL change |
| 6 | `LegalCorpusPlugin` + `LegalDocParser` | 1.5 days | #3, #5 | Medium — regex accuracy |
| 7 | `ProceduralCorpusPlugin` | 0.5 days | #6 | Low |
| 8 | `DefaultKnowledgeManifest` (moved from web) | 1 day | #5 | Low |
| 9 | `DefaultKnowledgeHealth` (corpus-aware) | 1 day | #5 | Low |
| 10 | `DefaultKnowledgeAcquisition` | 1 day | #6, #7 | Low |
| 11 | `DefaultKnowledgeLifecycle` (state machine) | 1 day | #6, #7 | Low |
| 12 | `DefaultKnowledgeVersioning` | 1 day | #5 | Low |
| 13 | Integration: `DefaultRetrievalAugmentationService` → `CorpusRouter` | 0.5 days | #4, #6 | Medium |
| 14 | Integration: `SearchService` corpus-scoped filter | 0.5 days | #5 | Medium |
| 15 | Benchmark validation (40 questions) | 1 day | #13, #14 | Low |

**Total: ~12 days (2.5 weeks) for one developer.**

---

## 11. Design Principles Applied

1. **"Add corpus_id, not new tables."** One column. Zero new entities. Zero new repositories. The schema change is a single ALTER TABLE.

2. **"CorpusPlugin is a Spring bean, not a plugin system."** No classpath scanning, no configuration files, no hot-reloading. Add a corpus → add a `@Component`. Remove it → delete the class.

3. **"The default is always the existing behavior."** `DefaultCorpusPlugin` wraps everything that exists today. The Router returns `["default"]` for every query. The system behaves identically until you explicitly add a new corpus.

4. **"Move, don't rewrite."** `CorpusManifestService` and `CorpusHealthService` move from `platform-api/web` to `platform-knowledge`. Their logic is refactored, not rewritten.

5. **"Prepare, don't build."** The Knowledge module defines interfaces for case management (caseId in routing, workflow tags in metadata). It does not build case management. The interfaces ensure future code doesn't need to be rewritten — only extended.
