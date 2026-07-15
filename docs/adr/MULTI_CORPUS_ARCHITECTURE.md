# ADR: Multi-Corpus Knowledge Architecture — Version 2.0

**Date:** 2026-07-14  
**Status:** Proposed  
**Author:** Enterprise Architecture Review  
**Supersedes:** Single-corpus model (current implementation)  
**Scope:** All platform modules

---

## Executive Summary

The current platform manages all documents in a single PostgreSQL table (`documents`), a single chunk table (`search_document_chunks`), and a single Qdrant collection (`mda_chunks`). This is appropriate for a 300-document legal corpus but will not scale to a system managing fundamentally different content types: laws, procedures, case files, emails, citizen applications, templates, and workspace documents — each with different security, retention, indexing, and retrieval requirements.

This ADR proposes a **Corpus abstraction** — a self-contained logical unit that owns its storage, indexing, chunking, metadata, and retrieval policy. A `CorpusRegistry` registers all corpora. A `CorpusRouter` selects which corpora to query for a given request. The architecture is designed to scale from 300 to millions of documents while maintaining strict isolation between content types.

---

## Context

### Current State (Single Corpus)

```
┌──────────────────────────────────────────────────────┐
│                 SINGLE CORPUS MODEL                   │
│                                                       │
│  documents                     (PostgreSQL)           │
│  document_versions             (PostgreSQL)           │
│  search_document_chunks        (PostgreSQL)           │
│  mda_chunks                    (Qdrant, 1 collection) │
│  corpus_manifest               (PostgreSQL)           │
│                                                       │
│  ↑ All document types share one storage path          │
│  ↑ All chunks share one chunking strategy             │
│  ↑ All vectors share one Qdrant collection            │
│  ↑ SearchFilter accepts null for all fields            │
│  ↑ No per-document-type retrieval policy              │
│  ↑ No tenant isolation                                │
└──────────────────────────────────────────────────────┘
```

**What this model cannot do:**

| Limitation | Impact |
|---|---|
| A citizen email and a federal law live in the same table | PII risk; no data classification |
| A case file and a checklist share the same Qdrant collection | Cross-contamination of search results |
| A workspace draft and a binding regulation use the same chunker | 1200-char chunks for a 3-line template |
| A multi-tenant deployment shares all documents | Tenant A sees Tenant B's internal procedures |
| A 5-year retention policy for case files applies to everything | Legal documents get deleted; emails are kept forever |

### Drivers

1. **Content diversity:** The platform must manage 6+ fundamentally different content types
2. **Security:** Case files and emails contain personal data (GDPR Art. 9); laws do not
3. **Retention:** Laws are permanent; case files expire; workspace docs are temporary
4. **Performance:** Searching 10 million case files should not slow down legal citation retrieval
5. **Multi-tenancy:** Department A's procedures differ from Department B's
6. **Future features:** Case management work queues, document lifecycle, FIFO processing

---

## Decision

### Multi-Corpus Architecture

Each corpus is a self-contained logical unit with:
- Its own storage configuration (directory or table partition)
- Its own Qdrant collection (or shared with security filters)
- Its own metadata schema
- Its own parser and chunking strategy
- Its own indexing policy
- Its own retrieval policy
- Its own retention and lifecycle rules

### C4 Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐               │
│  │Sachbear- │  │Vergabe-  │  │Bauauf-   │  │Bürger         │               │
│  │beiter    │  │stelle    │  │sicht     │  │(via Antrag)   │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘               │
└───────┼─────────────┼─────────────┼─────────────────┼───────────────────────┘
        │             │             │                 │
        ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MUNICIPAL DECISION ASSISTANT                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        DecisionRouter                                 │   │
│  │  RULE_ENGINE (deterministic)  │  HYBRID_RETRIEVAL (corpus-backed)    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        CorpusRouter                                   │   │
│  │  Selects which corpora to query based on:                             │   │
│  │  - Query intent (domain classification)                               │   │
│  │  - User role / tenant context                                         │   │
│  │  - Request scope (case_id, workspace_id)                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│          │              │              │              │                      │
│          ▼              ▼              ▼              ▼                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐             │
│  │  LEGAL   │   │PROCEDURAL│   │  CASE    │   │COMMUNICATION │             │
│  │  CORPUS  │   │  CORPUS  │   │  CORPUS  │   │   CORPUS     │             │
│  └──────────┘   └──────────┘   └──────────┘   └──────────────┘             │
│                     │                                                        │
│                     ▼                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      CorpusRegistry                                   │   │
│  │  Registers all corpora, their capabilities, and their metadata        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### C4 Container Diagram — Corpus Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORPUS: LEGAL                                     │
│                                                                           │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐    │
│  │ Storage         │   │ Indexing        │   │ Retrieval           │    │
│  │                 │   │                 │   │                     │    │
│  │ ● DB table:     │   │ ● Parser:       │   │ ● Qdrant:           │    │
│  │   legal_docs    │   │   LegalDocParser│   │   collection=       │    │
│  │ ● Filesystem:   │   │ ● Chunker:      │   │   "legal_corpus"    │    │
│  │   /corpora/     │   │   SentenceAware │   │ ● Keyword:          │    │
│  │   legal/        │   │   (future:      │   │   JpaKeywordSearch  │    │
│  │ ● Retention:    │   │   LegalChunking)│   │ ● Domain filter:    │    │
│  │   PERMANENT     │   │ ● Embedding:    │   │   ONLY legal domain │    │
│  └─────────────────┘   │   nomic-embed   │   │ ● Version filter:   │    │
│                         └─────────────────┘   │   CURRENT only (dflt│    │
│                                               └─────────────────────┘    │
│  Metadata Schema:                                                         │
│  ● authority, doc_type, legal_domain, jurisdiction, §_ref                │
│  ● effective_date, expiry_date, version_state, supersedes, superseded_by │
│  ● official_source_url, publication_date, amendment_history              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                       CORPUS: CASE FILES                                  │
│                                                                           │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐    │
│  │ Storage         │   │ Indexing        │   │ Retrieval           │    │
│  │                 │   │                 │   │                     │    │
│  │ ● DB table:     │   │ ● Parser:       │   │ ● Qdrant:           │    │
│  │   case_docs     │   │   CaseDocParser │   │   collection=       │    │
│  │ ● Filesystem:   │   │ ● Chunker:      │   │   "case_corpus_     │    │
│  │   /corpora/     │   │   RecursiveSplit│   │    {tenant_id}"     │    │
│  │   cases/        │   │   (structured)  │   │ ● Keyword:          │    │
│  │ ● Retention:    │   │ ● Embedding:    │   │   tenant-scoped     │    │
│  │   5 years after │   │   OPTIONAL      │   │ ● Security filter:  │    │
│  │   case closure  │   │   (keyword-only │   │   tenant_id +       │    │
│  └─────────────────┘   │   may suffice)  │   │   owner_id          │    │
│                         └─────────────────┘   └─────────────────────┘    │
│  Metadata Schema:                                                         │
│  ● case_number, applicant_name, case_status, assigned_to, department     │
│  ● received_date, due_date, priority, gdpr_classification                │
│  ● documents_contained, next_action, workflow_state                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    CORPUS: PROCEDURAL                                     │
│                                                                           │
│  ● Shared Qdrant collection with LEGAL (metadata-filtered)               │
│  ● Parser: lightweight (forms/templates need structural parsing)          │
│  ● Chunker: SentenceAwareChunkingStrategy (1200-char target)              │
│  ● Metadata: procedure_type, required_forms, estimated_duration           │
│  ● Retention: keep until superseded (like legal, but softer)              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                 CORPUS: COMMUNICATION                                     │
│                                                                           │
│  ● Separate Qdrant collection: "comm_corpus_{tenant_id}"                 │
│  ● Encryption at rest (GDPR Art. 9 — personal data)                       │
│  ● Chunker: email-aware (headers, body, attachments separated)            │
│  ● Metadata: sender, recipient, date, subject, thread_id, pii_flag       │
│  ● Retention: 2 years default, configurable per department                │
│  ● Retrieval: restricted by sender/recipient/tenant                       │
│  ● NOT available for general AI queries — only for case-specific context  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                  CORPUS: WORKSPACE (EPHEMERAL)                            │
│                                                                           │
│  ● No Qdrant collection — filesystem only                                 │
│  ● No embedding — too expensive for temporary documents                   │
│  ● Keyword search via JPA only (LIKE queries on document metadata)        │
│  ● Auto-deletion after 30 days of inactivity                              │
│  ● Per-user, per-workspace isolation                                      │
│  ● Purpose: draft documents, user uploads before formal submission        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Corpus Definitions

### Corpus Types and Isolation Levels

| Corpus | Document Examples | Qdrant Collection | DB Table(s) | Chunker | Embedding | Retention | Security Boundary |
|---|---|---|---|---|---|---|---|
| **LEGAL** | Laws, regulations, admin instructions, court decisions | `legal_corpus` (shared, single collection) | `legal_docs`, `legal_doc_chunks` | SentenceAware → LegalChunking (future) | Required (nomic-embed-text) | Permanent (versioned) | Public — all tenants |
| **PROCEDURAL** | Manuals, guides, checklists, templates, forms, FAQs | Shared with LEGAL, filtered by `doc_type` | Same as LEGAL (`procedural_docs` optional partition) | SentenceAwareChunkingStrategy | Required | Until superseded | Department-scoped (optional) |
| **CASE** | Case files, citizen applications (Anträge), internal memos, decision drafts | `case_corpus_{tenant_id}` (per-tenant) | `case_docs`, `case_doc_chunks` (partitioned by tenant) | RecursiveSplitChunkingStrategy (structured form fields) | Optional (keyword-first) | 5 years after closure | Tenant + Owner |
| **COMMUNICATION** | Citizen emails, internal emails, correspondence | `comm_corpus_{tenant_id}` (per-tenant) | `comm_docs`, `comm_doc_chunks` | EmailAwareChunkingStrategy (headers/body/attachments) | Optional | 2 years (configurable) | Tenant + Sender/Recipient |
| **WORKSPACE** | User uploads, drafts, temporary documents | None | `workspace_docs` (per-user, no chunks) | None | None | 30 days inactivity | Owner only |

### Why These Boundaries?

1. **LEGAL + PROCEDURAL share storage, not Qdrant** — Procedural documents reference legal ones. Querying them together produces better answers. But procedural documents have different metadata (procedure_type, required_forms) and should be filtered by `doc_type` in search.

2. **CASE gets its own Qdrant collection per tenant** — A case file contains personal data (GDPR Art. 9). It must never appear in a general legal search. Per-tenant Qdrant collections provide strict isolation. Qdrant supports hundreds of collections; the overhead is negligible.

3. **COMMUNICATION gets its own Qdrant collection per tenant** — Emails contain PII and are irrelevant for general decision support. They are only searchable within a case context. Different retention and security rules apply.

4. **WORKSPACE gets no Qdrant collection** — Temporary documents are ephemeral. The cost of embedding and indexing them outweighs the benefit. Filesystem + JPA metadata is sufficient.

---

## CorpusRegistry Design

### Responsibility

The `CorpusRegistry` is the single source of truth for which corpora exist and what they can do. It is NOT a routing decision engine — it is a directory.

### Registration Model

Every corpus self-registers at startup with a `CorpusDescriptor`:

```
┌─────────────────────────────────────────────────────────────┐
│                    CorpusDescriptor                          │
│                                                              │
│  Identity:                                                   │
│    corpusId: "legal"                                         │
│    displayName: "Legal Corpus"                               │
│    description: "German federal and state laws"              │
│                                                              │
│  Capabilities:                                               │
│    supportsVectorSearch: true                                │
│    supportsKeywordSearch: true                               │
│    supportsMetadataFiltering: true                           │
│    supportsTemporalQueries: true                             │
│    supportsVersioning: true                                  │
│    isMultiTenant: false                                      │
│                                                              │
│  Storage:                                                    │
│    storageProvider: "local-fs"                               │
│    storagePath: "/corpora/legal/"                            │
│    documentEntityClass: LegalDocumentEntity                  │
│    chunkEntityClass: LegalDocumentChunkEntity                │
│                                                              │
│  Search:                                                     │
│    vectorSearchProvider: "qdrant"                            │
│    qdrantCollection: "legal_corpus"                          │
│    keywordSearchProvider: "jpa"                              │
│    defaultSearchMode: HYBRID                                 │
│                                                              │
│  Processing:                                                 │
│    parserClass: LegalDocParser                               │
│    chunkingStrategy: SentenceAwareChunkingStrategy           │
│    embeddingProvider: ollamaEmbeddingProvider                │
│                                                              │
│  Metadata Schema:                                            │
│    requiredFields: [title, legal_domain, authority, ...]     │
│    optionalFields: [effective_date, §_ref, ...]              │
│    filterableFields: [legal_domain, doc_type, authority, ...]│
│    sortableFields: [publication_date, title]                 │
│                                                              │
│  Retention & Lifecycle:                                      │
│    retentionPolicy: PERMANENT                                │
│    versioningPolicy: LEGAL_VERSIONING                        │
│    requiresReviewBeforePublication: true                     │
│                                                              │
│  Security:                                                   │
│    accessControl: PUBLIC                                     │
│    encryptionRequired: false                                 │
│    piiClassification: NONE                                   │
│    auditRequired: true                                       │
└─────────────────────────────────────────────────────────────┘
```

### Registration Mechanism (Phase 1 — Spring Beans)

Each corpus defines a `@Bean` of type `CorpusDescriptor` in a configuration class:

```
@Configuration
class LegalCorpusConfig {
    @Bean
    CorpusDescriptor legalCorpus() {
        return CorpusDescriptor.builder()
            .corpusId("legal")
            .capabilities(CorpusCapabilities.builder()
                .supportsVectorSearch(true)
                .supportsKeywordSearch(true)
                .supportsMetadataFiltering(true)
                .supportsTemporalQueries(true)
                .supportsVersioning(true)
                .build())
            .storage(CorpusStorage.builder()
                .documentEntityClass(LegalDocumentEntity.class)
                .chunkEntityClass(LegalDocumentChunkEntity.class)
                .storagePath("/corpora/legal/")
                .build())
            .search(CorpusSearch.builder()
                .qdrantCollection("legal_corpus")
                .defaultSearchMode(SearchMode.HYBRID)
                .build())
            .processing(CorpusProcessing.builder()
                .parserClass(LegalDocParser.class)
                .chunkingStrategy("sentenceAwareChunkingStrategy")
                .build())
            .metadata(MetadataSchema.builder()
                .requiredFields(List.of("title", "legal_domain", "authority", "doc_type",
                    "publication_date", "effective_date", "jurisdiction"))
                .filterableFields(List.of("legal_domain", "doc_type", "authority",
                    "jurisdiction", "version_state", "effective_date"))
                .build())
            .security(CorpusSecurity.builder()
                .accessControl(AccessControl.PUBLIC)
                .piiClassification(PiiClassification.NONE)
                .build())
            .build();
    }
}
```

The `CorpusRegistry` simply collects all `CorpusDescriptor` beans:

```
CorpusRegistry
    │
    ├── legal (CorpusDescriptor)
    ├── procedural (CorpusDescriptor)
    ├── case (CorpusDescriptor)
    ├── communication (CorpusDescriptor)
    └── workspace (CorpusDescriptor)
```

### Phase 2 — Pluggable Registration

Corpora can be registered via:
- Spring beans (Phase 1 — existing mechanism)
- Configuration file: `corpus-registry.yml`
- Plugin JARs: drop a JAR with a `CorpusDescriptor` SPI implementation into `/plugins/` — hot-reloadable

This supports third-party corpora and department-specific extensions without recompilation.

---

## CorpusRouter Design

### Responsibility

The `CorpusRouter` selects which corpora to query for a given request. It does NOT execute the search — it returns a list of corpus IDs and search parameters. The actual search is performed by a separate `FederatedSearchService`.

### Routing Logic

```
Input: AiRequest (question, workspaceId, caseId, userRole, tenantId)
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                     CorpusRouter.route()                      │
│                                                               │
│  1. QueryIntent → what is the user asking about?              │
│     ├── PROCUREMENT → legal + procedural + (case if caseId)   │
│     ├── BUILDING    → legal + procedural + (case if caseId)   │
│     ├── HR          → legal + procedural + (case if caseId)   │
│     ├── CASE_SPECIFIC → case + legal (relevant domain)        │
│     ├── COMMUNICATION → communication + (case if caseId)      │
│     └── GENERAL     → legal + procedural                      │
│                                                               │
│  2. User context → what is the user allowed to see?           │
│     ├── tenantId → scopes case + communication corpora        │
│     └── userRole → may restrict legal domain access           │
│                                                               │
│  3. Request scope → explicit narrowing                       │
│     ├── caseId → include case corpus for that case            │
│     └── workspaceId → include workspace corpus if present     │
│                                                               │
│  Output: List<CorpusSearchTarget>                             │
│          (corpusId, searchMode, filterOverrides, maxResults)  │
└──────────────────────────────────────────────────────────────┘
```

### Routing Table

| Request Type | Legal | Procedural | Case | Communication | Workspace |
|---|---|---|---|---|---|
| General decision question ("Welches Verfahren?") | YES (HYBRID) | YES (HYBRID) | NO | NO | NO |
| Procurement question with case context | YES (HYBRID) | YES (HYBRID) | YES (HYBRID, filtered to case) | NO | NO |
| Building permit application processing | YES (HYBRID) | YES (HYBRID) | YES (KEYWORD, application docs) | NO | YES (KEYWORD, user uploads) |
| "Show all communication about case X" | NO | NO | YES (KEYWORD) | YES (HYBRID, filtered to case) | NO |
| User uploads draft document | NO | NO | NO | NO | YES (FILE_ONLY) |
| RULE_ENGINE (salary, travel, procurement threshold) | NO | NO | NO | NO | NO |

### FederatedSearchService

```
FederatedSearchService.search(question, corpusTargets)
    │
    ├── For each CorpusSearchTarget:
    │     ├── Resolve corpus via CorpusRegistry
    │     ├── Apply corpus-specific SearchFilter
    │     ├── Apply security filter (tenant_id, owner_id)
    │     ├── Execute search (keyword / vector / hybrid per corpus capability)
    │     └── Collect results with corpus origin tag
    │
    ├── Merge results across corpora:
    │     ├── Legal results weighted at 1.0 (authoritative)
    │     ├── Procedural results weighted at 0.9 (implementation guidance)
    │     ├── Case results weighted at 0.5 (case-specific, lower authority)
    │     └── Communication results: NOT merged into general queries
    │
    ├── Apply diversity enforcement across corpora (max 3/doc, but documents
    │     from different corpora are counted separately)
    │
    └── Return List<RetrievalCandidate> with corpus origin metadata
```

---

## Example Request: "Process a Bauantrag"

### Scenario

A Bauaufsicht employee receives a building permit application (Bauantrag) from a citizen. They ask the platform:

> "Ein Bürger hat einen Bauantrag für ein Einfamilienhaus in Berlin-Spandau eingereicht. Der Bauantrag enthält Lageplan, Bauzeichnungen und Baubeschreibung. Welches Verfahren gilt, welche zusätzlichen Unterlagen werden benötigt, und welche Fristen muss ich einhalten?"

### Corpus Routing

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: CorpusRouter.route(question, workspaceId="building",       │
│                              caseId="CASE-2026-0714-001",           │
│                              tenantId="bezirk-spandau")              │
│                                                                      │
│  QueryIntent → BUILDING, has caseId                                  │
│                                                                      │
│  Selected corpora:                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ LEGAL            │  │ PROCEDURAL       │  │ CASE             │   │
│  │                  │  │                  │  │                  │   │
│  │ Query: "Baugeneh-│  │ Query: "Bauantrag│  │ Query: "Bauantrag│   │
│  │ migungsverfahren  │  │ Einfamilienhaus  │  │ Einfamilienhaus  │   │
│  │ Einfamilienhaus   │  │ Checkliste       │  │ Spandau"         │   │
│  │ Berlin"           │  │ Bauvorlagen"     │  │                  │   │
│  │                  │  │                  │  │ Filter: caseId=   │   │
│  │ Mode: HYBRID     │  │ Mode: HYBRID     │  │ CASE-2026-...    │   │
│  │ Filter: current   │  │                  │  │ Mode: KEYWORD    │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │                     │              │
│           ▼                     ▼                     ▼              │
│  STEP 2: FederatedSearchService.search()                             │
│                                                                      │
│  LEGAL returns:                                                      │
│  ● BauO Bln §62 (permit exemption)     score: 0.89                  │
│  ● BauO Bln §63 (simplified procedure) score: 0.92  ◀── TOP MATCH  │
│  ● BauO Bln §64 (full permit)          score: 0.78                  │
│  ● BauO Bln §70 (neighbor participation) score: 0.65                │
│                                                                      │
│  PROCEDURAL returns:                                                 │
│  ● BauVorlV §1 (11 procedure types)    score: 0.91                  │
│  ● BauVorlV §2 (required documents)    score: 0.94  ◀── TOP MATCH  │
│  ● Bauantrag-Checkliste                score: 0.87                  │
│  ● Schneller-Bauen-Gesetz (fees)       score: 0.72                  │
│                                                                      │
│  CASE returns:                                                       │
│  ● CASE-2026-0714-001 Bauantrag.pdf (submitted by citizen)          │
│  ● CASE-2026-0714-001 Lageplan.pdf                                  │
│                                                                      │
│  STEP 3: Merge, deduplicate, diversity enforce, ground              │
│                                                                      │
│  Final evidence package (4 docs, 3 chunks each):                     │
│  1. BauO Bln §63 — "Vereinfachtes Baugenehmigungsverfahren"         │
│  2. BauVorlV §2 — elektronische Einreichung, erforderliche Unterlagen│
│  3. Bauantrag-Checkliste — "Erforderliche Unterlagen für Einfamilien-│
│     haus: Lageplan M 1:500, Bauzeichnungen M 1:100, Baubeschreibung"│
│  4. CASE-2026-0714-001 — "Eingereichte Unterlagen durch Bürger:      │
│     Lageplan (vorhanden), Bauzeichnungen (vorhanden),                │
│     Baubeschreibung (vorhanden), Statik (FEHLT)"                    │
│                                                                      │
│  STEP 4: LLM synthesizes across corpora:                             │
│  "Das vereinfachte Verfahren nach BauO Bln §63 ist anwendbar.        │
│   Die Bauvorlagen sind fast vollständig — es fehlt der               │
│   Standsicherheitsnachweis (Statik) nach BauVorlV 2025 §7.           │
│   Frist: Vollständigkeitsprüfung innerhalb 4 Wochen nach             │
│   Schneller-Bauen-Gesetz. Nächster Schritt: Nachforderung der        │
│   fehlenden Statik mit Frist 2 Wochen."                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Observations from This Example

1. **Three corpora contributed different knowledge:** LEGAL provided the law, PROCEDURAL provided the checklist, CASE provided the actual submitted documents. No single corpus could answer the question alone.

2. **Cross-corpus synthesis:** The LLM compared the checklist (PROCEDURAL) against the submitted documents (CASE) and identified a gap (missing Statik). This is only possible when both corpora are queried.

3. **Case-specific context:** The CASE corpus returned the applicant's actual documents — but ONLY because `caseId` was provided. Without it, the Case corpus is not queried (no cross-contamination).

4. **Communication corpus was NOT queried** — it's irrelevant for this question and would only add noise.

---

## Metadata Schema per Corpus

### Legal Corpus — First-Class Columns (recommended)

These should be dedicated database columns (not EAV key-value pairs) because they are queried, filtered, and sorted frequently:

| Column | Type | Example | Indexed? |
|---|---|---|---|
| `title` | VARCHAR(500) | "Bauordnung für Berlin" | YES |
| `short_name` | VARCHAR(100) | "BauO Bln" | YES |
| `legal_domain` | VARCHAR(50) | "Baurecht" | YES |
| `jurisdiction` | VARCHAR(50) | "Berlin" | YES |
| `authority` | VARCHAR(300) | "Senatsverwaltung für Stadtentwicklung" | NO |
| `doc_type` | VARCHAR(30) | "Gesetz" | YES |
| `publication_date` | DATE | 2025-06-30 | YES |
| `effective_date` | DATE | 2025-06-30 | YES |
| `expiry_date` | DATE | NULL | YES |
| `version_state` | VARCHAR(20) | CURRENT | YES |
| `language` | VARCHAR(5) | "DE" | NO |
| `source_url` | VARCHAR(1024) | https://gesetze.berlin.de/... | NO |
| `checksum_sha256` | VARCHAR(64) | abc123... | NO |
| `hierarchy_level` | VARCHAR(20) | BUND | NO |
| `priority` | VARCHAR(3) | P1 | NO |

### Dynamic Metadata (EAV — `attributes` collection)

Fields that vary significantly between document types or are rarely queried:

| Key | Example Value | Purpose |
|---|---|---|
| `section_ref` | "61" | § reference within a chunk |
| `clause_ref` | "(2)" | Sub-clause reference |
| `amended_by` | "Schneller-Bauen-Gesetz" | Amendment history |
| `replaces` | "bauo-bln-2018" | Supersedes link |
| `replaced_by` | "bauo-bln-2027" | Future replacement |
| `official_gazette` | "GVBl. 2025, S. 234" | Official publication reference |
| `keywords` | "Brandschutz, Gebäudeklasse" | Domain-specific tags |

### Case Corpus — First-Class Columns

| Column | Type | Example |
|---|---|---|
| `case_number` | VARCHAR(50) | "BA-2026-0714-001" |
| `applicant_name` | VARCHAR(200) | (encrypted if PII) |
| `case_status` | VARCHAR(20) | IN_PROGRESS |
| `assigned_to` | VARCHAR(100) | "frau-schmidt" |
| `department` | VARCHAR(100) | "Bauaufsicht Spandau" |
| `received_date` | DATE | 2026-07-14 |
| `due_date` | DATE | 2026-08-14 |
| `priority` | VARCHAR(10) | HIGH |
| `workflow_state` | VARCHAR(30) | AWAITING_DOCUMENTS |
| `next_action` | VARCHAR(300) | "Statik nachfordern" |

---

## Scaling Assessment

### From 300 to 300,000 to 3,000,000 Documents

| Scale | Documents | Chunks | Qdrant Points | PostgreSQL Rows | Retrieval Latency | Viable? |
|---|---|---|---|---|---|---|
| **Today** | 23 demo | 23 | 0 | ~200 | <50ms keyword, N/A vector | Yes |
| **Phase 1** | 300 (legal) | ~15,000 | ~15,000 | ~20,000 | <50ms keyword, <15ms vector | Yes |
| **v2.0 Launch** | 3,000 (all corpora) | ~100,000 | ~80,000 | ~150,000 | <100ms hybrid | Yes |
| **v2.1** | 30,000 | ~1,000,000 | ~800,000 | ~1,500,000 | <200ms hybrid with quantization | Yes — add Qdrant scalar quantization |
| **v3.0** | 300,000 | ~10,000,000 | ~8,000,000 | ~15,000,000 | <500ms hybrid with sharding | Yes — add PostgreSQL partitioning + Qdrant sharding |
| **Enterprise** | 3,000,000+ | ~100,000,000 | ~80,000,000 | ~150,000,000 | <1s hybrid with multi-stage reranking | Yes — add read replicas, CDN for legal corpus |

### Scaling Strategy Per Corpus

| Corpus | Growth Rate | Scaling Approach |
|---|---|---|
| **LEGAL** | Slow (~100 new docs/year) | Single Qdrant collection + read replicas. Embeddings cached in memory. |
| **PROCEDURAL** | Slow (~50 new docs/year) | Shared with LEGAL. Metadata-filtered. |
| **CASE** | Fast (~1,000 new cases/year per department) | Per-tenant Qdrant collections. PostgreSQL partitioning by `tenant_id` + `closed_date`. |
| **COMMUNICATION** | Very fast (~10,000 emails/year per department) | Per-tenant Qdrant collections. PostgreSQL partitioning by `tenant_id` + `date`. Archive after retention period. |
| **WORKSPACE** | Fast but ephemeral (~1,000 active at any time) | Filesystem only. No Qdrant. DB row auto-deleted after 30 days. |

### Performance Isolation

The key scaling benefit of the multi-corpus architecture:

- A legal citation query searches ONLY the `legal_corpus` Qdrant collection (~15,000 vectors). It never touches the case corpus (~1,000,000 vectors). Latency is independent of case volume.
- A case search queries ONLY the tenant's `case_corpus_{tenant_id}` collection. Other tenants' cases are physically isolated in different collections.
- The workspace corpus has NO Qdrant footprint. Adding 10,000 workspace documents has zero impact on vector search.

---

## Package Structure (Proposed v2.0)

```
com.cognitera.platform
│
├── corpus                              [NEW — corpus abstraction]
│   ├── api
│   │   ├── CorpusDescriptor.java       (corpus registration model)
│   │   ├── CorpusCapabilities.java     (feature flags per corpus)
│   │   ├── CorpusStorage.java          (storage configuration)
│   │   ├── CorpusSearch.java           (search configuration)
│   │   ├── CorpusProcessing.java       (parser + chunker + embedder)
│   │   ├── CorpusSecurity.java         (access control + PII class)
│   │   ├── MetadataSchema.java         (required + filterable fields)
│   │   ├── CorpusSearchTarget.java     (routing output: corpus + params)
│   │   ├── CorpusRegistry.java         (registry interface)
│   │   └── CorpusRouter.java           (routing interface)
│   │
│   ├── application
│   │   ├── DefaultCorpusRegistry.java  (collects CorpusDescriptor beans)
│   │   ├── DefaultCorpusRouter.java    (intent-based routing logic)
│   │   ├── FederatedSearchService.java (multi-corpus search execution)
│   │   └── CorpusHealthService.java    (per-corpus health metrics)
│   │
│   ├── config
│   │   ├── LegalCorpusConfig.java      (legal corpus bean definition)
│   │   ├── ProceduralCorpusConfig.java
│   │   ├── CaseCorpusConfig.java
│   │   ├── CommunicationCorpusConfig.java
│   │   └── WorkspaceCorpusConfig.java
│   │
│   └── model
│       ├── CorpusOrigin.java           (enum: LEGAL, PROCEDURAL, CASE, ...)
│       └── CorpusSearchResult.java     (result + origin metadata)
│
├── legal                               [NEW — legal corpus module]
│   ├── api
│   │   ├── LegalDocumentService.java
│   │   ├── LegalDocParser.java         (interface)
│   │   └── LegalChunkingStrategy.java  (future: §-aware chunking)
│   ├── application
│   │   ├── DefaultLegalDocParser.java  (regex-based § detection)
│   │   └── LegalDocumentIndexingService.java
│   └── infrastructure
│       ├── LegalDocumentEntity.java    (extends/uses DocumentEntity)
│       ├── LegalDocumentChunkEntity.java
│       └── LegalDocumentRepository.java
│
├── document                            [MODIFIED — generalized]
│   │  DocumentEntity becomes abstract or gains corpus_id column
│   │  DocumentFacade gains corpus-aware methods
│   │
│   (existing classes preserved; new corpus_id discriminator added)
│
├── search                              [MODIFIED — multi-collection aware]
│   │  QdrantVectorSearchProvider → accepts collection name parameter
│   │  SearchService → delegates to FederatedSearchService
│   │  SearchFilter → gains corpus_id and security_filter fields
│   │
│   (existing classes extended; backward-compatible)
│
├── ai                                  [MINIMAL CHANGES]
│   │  DefaultRetrievalAugmentationService → uses CorpusRouter
│   │  DomainGate → works per-corpus
│   │
│   (route() calls CorpusRouter; retrieve() calls FederatedSearchService)
│
├── case                                [NEW — case management module]
│   ├── api
│   │   ├── CaseService.java
│   │   ├── CaseWorkflowEngine.java
│   │   └── CaseDocumentIndexer.java
│   └── ...
│
├── communication                       [NEW — email/communication module]
│   └── ...
│
└── workspace                           [EXISTING, MODIFIED]
    │  Existing workspace module gains ephemeral document handling
    │  WorkspaceCorpusConfig registers with CorpusRegistry
    └── ...
```

### What Remains Unchanged

| Module | Change Level | Rationale |
|---|---|---|
| `platform-ai/DecisionRouter` | **None** | Routing between RULE_ENGINE and HYBRID_RETRIEVAL is unchanged |
| `platform-ai/RuleEngine` | **None** | Deterministic decisions don't use corpora |
| `platform-ai/DefaultGroundingService` | **Minimal** | Now receives `CorpusOrigin` in SourceCitation |
| `platform-ai/DefaultPromptBuilder` | **Minimal** | Evidence items may display corpus origin |
| `platform-search/SentenceAwareChunkingStrategy` | **None** | Used by LEGAL and PROCEDURAL corpora |
| `platform-search/OllamaEmbeddingProvider` | **None** | Shared across all corpora |
| `platform-search/QdrantVectorSearchProvider` | **Parameterized** | Now accepts collection name from CorpusSearch config |
| `platform-api/CorpusHealthDashboard` | **Extended** | Gains per-corpus health tabs |
| `platform-api/CorpusManifestService` | **Extended** | Per-corpus manifest support |

---

## Migration Plan

### Phase 1 — v2.0 Foundation (2-3 weeks)

**Goal:** Introduce the Corpus abstraction without changing existing behavior.

1. Create `platform-corpus` module with `CorpusDescriptor`, `CorpusRegistry`, `CorpusRouter`, `FederatedSearchService`
2. Create a single `DefaultCorpusDescriptor` bean with `corpusId = "default"` that wraps all existing documents
3. `DefaultRetrievalAugmentationService` routes through `CorpusRouter` — which returns `["default"]` for all queries
4. All existing code paths unchanged; the Corpus abstraction is a pass-through
5. Run full benchmark — must produce identical results

**Exit criteria:** Benchmark pass rate unchanged. All existing tests pass.

### Phase 2 — Corpus Separation (2-3 weeks)

**Goal:** Split the existing document base into LEGAL and PROCEDURAL corpora.

1. Add `corpus_id` column to `documents` table (nullable, default: `"default"`)
2. Migrate existing demo documents: set `corpus_id = "legal"` for regulations; `corpus_id = "procedural"` for manuals/forms
3. Create `LegalCorpusConfig` and `ProceduralCorpusConfig` beans
4. Register both in `CorpusRegistry`
5. `CorpusRouter` now returns `["legal", "procedural"]` for HYBRID_RETRIEVAL queries
6. Both corpora share the same Qdrant collection for now (metadata-filtered by `corpus_id`)
7. Run full benchmark — verify no regression

**Exit criteria:** Documents correctly assigned to corpora. Benchmark pass rate unchanged or improved.

### Phase 3 — Dedicated Qdrant Collections (1-2 weeks)

**Goal:** Give each corpus its own Qdrant collection.

1. Create `legal_corpus` and `procedural_corpus` Qdrant collections
2. Re-index: move legal documents to `legal_corpus`, procedural documents to `procedural_corpus`
3. `FederatedSearchService` now queries multiple Qdrant collections and merges results
4. Add corpus origin to `RetrievalCandidate` metadata
5. Run full benchmark — measure retrieval precision improvement from corpus isolation

**Exit criteria:** No cross-corpus contamination. Retrieval precision stable or improved.

### Phase 4 — New Corpora (v2.0+) (per corpus, 1-2 weeks each)

1. **CASE corpus:** Post-v2.0. Requires case management UI, workflow engine, tenant isolation.
2. **COMMUNICATION corpus:** Post-v2.0. Requires email ingestion pipeline, PII detection, GDPR compliance.
3. **WORKSPACE corpus:** Minimal — uses existing workspace module with new `WorkspaceCorpusConfig`.

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Over-engineering for 300 documents** | **Medium** | The current flat model works fine at this scale. Multi-corpus adds complexity before it's needed. | Phase 1 is a pass-through — zero behavioral change. Only Phase 2+ adds actual corpus separation. Deploy Phase 1, validate, then decide when to activate Phase 2. |
| **Cross-corpus relevance scoring inconsistency** | **Medium** | Legal and procedural documents are scored by the same embedding model but may have different score distributions. Merging results requires score normalization. | Use min-max normalization per corpus before cross-corpus merging. Legal corpus scores are anchored (authoritative); procedural scores are relative. |
| **Increased operational complexity** | **Medium** | 5 corpora × (DB tables + Qdrant collections + configuration + monitoring) = significantly more moving parts. | Start with 2 corpora (LEGAL + PROCEDURAL). Add CASE only when case management is built. Defer COMMUNICATION and WORKSPACE until there's demand. |
| **CorpusRouter misclassification** | **Low** | A building query incorrectly routed to only the procedural corpus, missing the law. | Default to querying ALL public corpora when intent confidence is low. Use explicit `corpus_id` filter only when confidence is high. |
| **Legacy code assuming single corpus** | **Medium** | Code that calls `documentRepo.findAll()` or `chunkRepo.findAll()` without corpus filter will return everything. | Add `corpus_id` to repository query methods. Deprecate `findAll()` in favor of `findByCorpus(corpusId)`. |

---

## Recommendation for Version 2.0

### What to Build Now (v2.0)

1. **`platform-corpus` module** — `CorpusDescriptor`, `CorpusRegistry`, `CorpusRouter`, `FederatedSearchService`
2. **Two corpora:** LEGAL and PROCEDURAL (shared Qdrant collection, metadata-filtered)
3. **`corpus_id` column** on `documents` table (default: `"legal"`)
4. **Phase 1 pass-through:** All queries route through CorpusRouter → returns `["legal", "procedural"]` → FederatedSearchService executes → merges
5. **Corpus Health Dashboard:** per-corpus health metrics

### What to Defer (v2.1+)

1. CASE corpus — requires case management module (separate project)
2. COMMUNICATION corpus — requires email pipeline and GDPR review
3. WORKSPACE corpus — requires workspace document lifecycle
4. Per-corpus Qdrant collections (Phase 3) — only when a single collection reaches 100K+ vectors
5. Pluggable corpus registration (Phase 2) — Spring beans are sufficient for v2.0

### Key Architectural Principle

**"A corpus is defined by what it excludes, not what it includes."**

The primary benefit of the multi-corpus architecture is NOT better organization. It is **security isolation and performance independence.** A case corpus query must never return legal documents. A citizen email must never appear in a general decision search. The architecture enforces these boundaries at the infrastructure level (separate collections, separate tables), not at the application level (query filters that can be forgotten).

### Effort Estimate

| Phase | Deliverables | Effort |
|---|---|---|
| Phase 1 — Foundation | platform-corpus module, CorpusRegistry, pass-through | 5-7 days |
| Phase 2 — Corpus Separation | corpus_id migration, Legal/Procedural configs, benchmark validation | 5-7 days |
| Phase 3 — Dedicated Collections | Per-corpus Qdrant, FederatedSearchService, score normalization | 3-5 days |
| **Total v2.0** | | **13-19 days** |
| Phase 4+ — New Corpora | 1-2 weeks per new corpus (CASE, COMMUNICATION, WORKSPACE) | Per project |
