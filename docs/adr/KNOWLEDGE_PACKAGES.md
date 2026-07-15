# ADR: Knowledge Packages

**Date:** 2026-07-14  
**Status:** Proposed for v2.0  
**Supersedes:** None (new capability)  
**Depends on:** platform-knowledge (v2.0), CorpusRegistry (v2.0)

---

## 1. What Is a Knowledge Package?

### Definition

A **Knowledge Package** is a named, versioned collection of all knowledge artifacts — documents, chunks, structured tables, templates, checklists, decision trees, and FAQs — required to complete one specific municipal business capability.

### Examples

| Package | Business Capability | Artifacts |
|---|---|---|
| `building-permit` | Process a building permit application | BauO Bln §§ 62-64, BauVorlV 2025, Bauantrag-Checkliste, Bauantrag Formular, Gebührenverzeichnis Bauamt, Standardbescheid Baugenehmigung (Muster), Abstandsflächen-Merkblatt, Prüfschema Genehmigungsverfahren |
| `procurement-direct-award` | Execute a direct award procurement | AV §55 LHO §2, Beschaffungsordnung Berlin, Checkliste Direktauftrag, Vergabevermerk-Vorlage, Rundschreiben Direktaufträge 2025, FAQ Vergabe, Prüfschema Vergabeverfahren |
| `personnel-hiring` | Hire a new employee | TV-L §15-25, TV-L Entgeltordnung, Checkliste Einstellung, Arbeitsvertrag TV-L (Muster), Stellenausschreibung (Muster), Personalhandbuch Berlin Kap. 2, FAQ Gehalt |
| `travel-expenses-domestic` | Process domestic travel expense claim | BRKG §§ 5-7, Dienstreise-Handbuch, Checkliste Dienstreise, Dienstreise-Abrechnung (Muster), FAQ Dienstreisen, BRKG Tagegeld-Tabelle |
| `citizen-registration` | Register a new resident | Meldegesetz Berlin, Anmeldung Formular, Checkliste Anmeldung, Gebührenverzeichnis Bürgeramt, FAQ Anmeldung, Zuständigkeitskatalog |

### What It Is NOT

| Concept | What It Is | Knowledge Package Is Different Because... |
|---|---|---|
| **Corpus** | A collection of documents by type/origin (LEGAL, PROCEDURAL, CASE) | A package spans multiple corpora. A building permit needs legal docs (BauO Bln) AND procedural docs (checklists) AND templates (Bescheid-Muster). |
| **Workspace** | An organizational department (Building, Procurement, HR) | A package is a task, not a department. Multiple departments use the same package (e.g., "travel-expenses" is used by ALL departments). |
| **Collection** | A Qdrant vector index partition | A package is a logical grouping, not a physical storage partition. Documents in one package may be in different Qdrant collections. |
| **Folder** | A filesystem directory | A package is queryable, versioned, and contains relationships between artifacts. It's not a file hierarchy. |
| **Tag** | A flat keyword | A package has structure: it knows that a checklist SUPPLEMENTS a law, and a template IMPLEMENTS a regulation. Tags have no relationships. |

### Core Insight

> **A municipal employee doesn't search for "BauO Bln §61." They search for "Can I build a carport without a permit?" The Knowledge Package bridges the gap between the user's task and the documents that answer it.**

---

## 2. Data Model

### Decision: JPA Entity with YAML Bootstrapping

**Why JPA entity and not pure YAML/Config:**
- Packages must be queryable at runtime ("which packages contain this document?")
- Package membership must be updatable without redeployment
- Packages can be created by administrators through a UI (future)
- The M:N relationship with documents requires a join table

**Why YAML bootstrap and not pure JPA:**
- The initial set of ~20 packages can be defined in a single YAML file
- YAML is human-readable and diffable in version control
- Administrators can modify packages by editing a YAML file without SQL

**Why not pure metadata/tags:**
- Tags are flat. Packages have structure (a checklist SUPPLEMENTS a regulation).
- Tags don't capture the relationship between artifacts in a package.
- "Tag = building-permit" doesn't tell you whether a document is the LAW, the CHECKLIST, or the TEMPLATE for building permits.

### Schema

```sql
-- The package definition
CREATE TABLE knowledge_packages (
    id UUID PRIMARY KEY,
    package_id VARCHAR(100) NOT NULL UNIQUE,   -- "building-permit"
    display_name VARCHAR(200) NOT NULL,         -- "Baugenehmigung"
    description TEXT,
    domain VARCHAR(50) NOT NULL,                -- "Baurecht"
    icon VARCHAR(50),                           -- UI hint
    priority INT DEFAULT 100,                   -- display order
    version INT DEFAULT 1,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Which documents belong to which package (M:N)
CREATE TABLE knowledge_package_documents (
    package_id UUID NOT NULL REFERENCES knowledge_packages(id),
    document_id UUID NOT NULL REFERENCES documents(id),
    role VARCHAR(50) NOT NULL,                  -- "law", "checklist", "template", "faq", "form", "decision_tree"
    sort_order INT DEFAULT 0,                   -- display order within package
    PRIMARY KEY (package_id, document_id)
);

-- Structured knowledge references (RuleEngine tables)
CREATE TABLE knowledge_package_knowledge (
    package_id UUID NOT NULL REFERENCES knowledge_packages(id),
    knowledge_type VARCHAR(50) NOT NULL,        -- "SALARY_TABLE", "THRESHOLD_TABLE", "TRAVEL_TABLE"
    knowledge_id VARCHAR(100) NOT NULL,         -- "TV-L", "AV §55 LHO", "BRKG"
    PRIMARY KEY (package_id, knowledge_type, knowledge_id)
);
```

**Why only three tables:** Every additional table increases migration complexity. The `role` column on the join table captures the artifact's role without a separate entity. The `knowledge_package_knowledge` table references structured knowledge by type+ID without requiring the knowledge tables to be modified.

### YAML Bootstrap

```yaml
# knowledge-packages.yml — loaded at startup
packages:
  - package_id: "building-permit"
    display_name: "Baugenehmigung"
    description: "Baugenehmigungsverfahren für Wohn- und Gewerbebauten"
    domain: "Baurecht"
    icon: "building"
    priority: 10
    documents:
      - document_title: "BauO Bln §§ 62-64"
        role: "law"
      - document_title: "BauVorlV 2025"
        role: "regulation"
      - document_title: "Bauantrag-Checkliste Einfamilienhaus"
        role: "checklist"
      - document_title: "Prüfschema Genehmigungsverfahren"
        role: "decision_tree"
      - document_title: "Standardbescheid Baugenehmigung"
        role: "template"
      - document_title: "Abstandsflächen-Merkblatt"
        role: "guidance"
      - document_title: "Gebührenverzeichnis Bauamt"
        role: "fee_schedule"
    knowledge:
      - type: "THRESHOLD_TABLE"
        id: "AV §55 LHO"

  - package_id: "procurement-direct-award"
    display_name: "Direktauftrag"
    description: "Freihändige Vergabe bis 10.000 € (Lieferung/Dienstleistung)"
    domain: "Vergaberecht"
    icon: "shopping-cart"
    priority: 20
    documents:
      - document_title: "AV zu §55 LHO §2"
        role: "regulation"
      - document_title: "Beschaffungsordnung Berlin"
        role: "regulation"
      - document_title: "Checkliste Direktauftrag"
        role: "checklist"
      - document_title: "Vergabevermerk-Vorlage Direktauftrag"
        role: "template"
      - document_title: "Rundschreiben Direktaufträge 2025"
        role: "circular"
      - document_title: "FAQ Vergabe Berlin"
        role: "faq"
    knowledge:
      - type: "THRESHOLD_TABLE"
        id: "AV §55 LHO"
```

---

## 3. Retrieval Flow — Task-Scoped Search

### Current Flow

```
Question → RetrievalPlanner → HybridRetrieval → DomainGate → Diversity → Grounding → LLM
```

### Proposed Flow with Knowledge Packages

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  User selects: "Baugenehmigung" (or system detects intent)              │
│       │                                                                  │
│       ▼                                                                  │
│  KnowledgePackageResolver.resolve(question, selectedPackage)             │
│       │                                                                  │
│       ├── If package explicitly selected:                                │
│       │     → Load package document IDs                                  │
│       │     → Set SearchFilter.documentIds = packageDocs                 │
│       │     → This scopes ALL retrieval to package documents             │
│       │                                                                  │
│       └── If no package selected (fallback):                             │
│             → Classify intent via DomainClassifier                       │
│             → Find best-matching package by intent + domain              │
│             → Suggest package to user: "Meinten Sie 'Direktauftrag'?"   │
│             → If user accepts, scope to package                          │
│             → If not, fall through to full-corpus search                 │
│       │                                                                  │
│       ▼                                                                  │
│  CorpusRouter.route(question, packageContext)                            │
│       │                                                                  │
│       ├── Determine which corpora contain the package's documents        │
│       │     (a package may span LEGAL + PROCEDURAL corpora)              │
│       │                                                                  │
│       └── Return List<CorpusSearchTarget> filtered to package scope      │
│       │                                                                  │
│       ▼                                                                  │
│  FederatedSearchService.search(question, corpusTargets, packageFilter)   │
│       │                                                                  │
│       ├── Search only within package document set                        │
│       ├── Boost results where chunk metadata matches package documents   │
│       └── Return results with package-aware scoring                      │
│       │                                                                  │
│       ▼                                                                  │
│  PackageContextAssembler.assemble(results, package)                      │
│       │                                                                  │
│       ├── Group results by role: law, checklist, template, faq, etc.    │
│       ├── Include structured knowledge from package (ThresholdTable)     │
│       ├── Include package-specific prompt instructions                   │
│       └── Return PackageContext                                          │
│       │                                                                  │
│       ▼                                                                  │
│  PromptBuilder.build(packageContext)                                     │
│       │                                                                  │
│       ├── "Sie bearbeiten einen Direktauftrag nach AV §55 LHO."         │
│       ├── Evidence grouped by role:                                      │
│       │     RECHTSGRUNDLAGE: [AV §55 LHO §2, Beschaffungsordnung]       │
│       │     CHECKLISTE: [Direktauftrag Checkliste]                       │
│       │     VORLAGE: [Vergabevermerk Direktauftrag]                      │
│       │     FAQ: [Häufige Fragen Vergabe]                                │
│       └── "Ergebnis: KURZANTWORT, ENTSCHEIDUNG, RECHTSGRUNDLAGE,        │
│       │     ERFORDERLICHE SCHRITTE (aus Checkliste),                     │
│       │     BENÖTIGTE FORMULARE (aus Vorlagen)"                          │
│       │                                                                  │
│       ▼                                                                  │
│  LLM                                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Difference from Current Retrieval

**Today:** All 28+ documents in all corpora are searched. The DomainGate filters by domain. Results are ranked by hybrid score alone.

**With packages:** If the user selects "Baugenehmigung," only ~7 documents (the package members) are searched. Every result is guaranteed relevant to the task. The prompt groups evidence by role (law, checklist, template). The LLM produces a task-specific answer format.

**Performance improvement:** Searching 7 documents vs. 300 reduces retrieval latency, eliminates cross-domain noise, and produces more focused prompts.

---

## 4. Document-to-Package Relationship

### Many-to-Many

A document belongs to **multiple packages.** BauO Bln §61 (Genehmigungsfreie Vorhaben) belongs to:

| Package | Role |
|---|---|
| `building-permit` | `law` |
| `building-inspection` | `law` |
| `carport-construction` | `law` |
| `building-compliance` | `law` |

**Without duplication.** The document is stored once. The join table records each membership. When the document is updated (new version), all packages automatically reference the new version.

### Role Semantics

The `role` column on the join table tells the system HOW a document is used within a package:

| Role | Meaning | Display Priority | Prompt Grouping |
|---|---|---|---|
| `law` | The binding legal basis | 1 | RECHTSGRUNDLAGE |
| `regulation` | Implementing regulation | 2 | RECHTSGRUNDLAGE |
| `admin_regulation` | Administrative regulation (AV) | 3 | VERWALTUNGSVORSCHRIFT |
| `checklist` | Step-by-step verification | 4 | CHECKLISTE / ERFORDERLICHE SCHRITTE |
| `template` | Fill-in document template | 5 | VORLAGE / FORMULAR |
| `form` | Official form | 6 | FORMULAR |
| `faq` | Frequently asked questions | 7 | HINWEISE |
| `guidance` | Interpretive guidance | 8 | HINWEISE |
| `decision_tree` | Structured decision logic | 9 | PRÜFSCHEMA |
| `fee_schedule` | Cost/fee reference | 10 | GEBÜHREN |
| `circular` | Current administrative guidance | 11 | AKTUELLE HINWEISE |
| `sample` | Completed example | 12 | MUSTERBEISPIEL |

The roles enable the UI to display documents in a meaningful order (law first, samples last) and the prompt to group evidence logically.

---

## 5. Structured Knowledge in Packages

Packages reference structured knowledge in addition to documents.

**Example: `travel-expenses-domestic`**

| Artifact | Type | Source |
|---|---|---|
| BRKG §§ 5-7 (German text) | Document (LEGAL corpus) | gesetze-im-internet.de |
| Dienstreise-Handbuch Berlin | Document (PROCEDURAL corpus) | berlin.de/sen/inneres |
| Checkliste Dienstreise | Document (PROCEDURAL corpus) | Bezirksamt |
| Dienstreise-Abrechnung (Muster) | Document (PROCEDURAL corpus) | Bezirksamt |
| **BRKG TravelAllowanceTable** | **Structured Knowledge** | **KnowledgeRegistry** |
| FAQ Dienstreisen | Document (PROCEDURAL corpus) | Bezirksamt |

The structured knowledge reference (`knowledge_type: TRAVEL_TABLE, knowledge_id: BRKG`) tells the system: when answering a question in this package, ALSO consult the TravelAllowanceTable in the KnowledgeRegistry. The RuleEngine can provide deterministic answers for "Wie hoch ist das Tagegeld bei 12 Stunden?" without any retrieval.

**Why include structured knowledge:** The RuleEngine already answers salary, travel, and procurement threshold questions deterministically. Including the structured table reference in the package ensures the system knows that "travel-expenses-domestic" can answer "Tagegeld" questions without retrieval, while "building-permit" cannot.

---

## 6. Package Evolution

### Phase 1 — Static YAML (v2.0)

20 packages defined in `knowledge-packages.yml`. Loaded at startup by `KnowledgePackageLoader`. Document references resolved by title match against the corpus. Administrators edit the YAML file to add/remove documents.

### Phase 2 — Administrator UI (v2.1)

A simple CRUD UI at `/admin/knowledge-packages` allows administrators to:
- Create new packages
- Search for documents and add them with a role
- Reorder documents within a package
- Activate/deactivate packages

Changes are persisted to JPA. The YAML file becomes the "seed" for initial package creation, not the runtime source of truth.

### Phase 3 — Auto-Discovery (v3.0)

Machine learning from query patterns: if 80% of queries containing "Direktauftrag" retrieve the same 5 documents, the system suggests creating a "procurement-direct-award" package. An administrator reviews and approves.

### Package Versioning

Packages have a `version` integer. When a package's document set changes (a new circular replaces an old one), the version increments. Historical queries can reference "building-permit v3" to understand what documents were available at the time.

---

## 7. UI Design

### Task Selector

```
┌──────────────────────────────────────────────────────────────┐
│  Municipal Decision Assistant                                │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Woran arbeiten Sie heute?                          [▼]  │ │
│  │ ┌─────────────────────────────────────────────────────┐ │ │
│  │ │ 🏠 Baugenehmigung                                   │ │ │
│  │ │ 🛒 Direktauftrag                                    │ │ │
│  │ │ 👤 Einstellung neuer Mitarbeiter                    │ │ │
│  │ │ ✈️  Dienstreise Inland                              │ │ │
│  │ │ 📋 Bürgeranmeldung                                  │ │ │
│  │ │ 💶 Wohngeld                                         │ │ │
│  │ │ 🏢 Gewerbeanmeldung                                 │ │ │
│  │ │ 🔥 Brandschutzprüfung                               │ │ │
│  │ │ 📝 Vergabevermerk                                   │ │ │
│  │ │ 🔍 Alle Dokumente (ohne Einschränkung)              │ │ │
│  │ └─────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Beschreiben Sie den Vorgang...                          │ │
│  │                                                         │ │
│  │ [Carport 24m² in Berlin-Spandau, Innenbereich]          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Vorgang analysieren]                                       │
│                                                               │
│  📋 Scope: Baugenehmigung (7 Dokumente)                      │
└──────────────────────────────────────────────────────────────┘
```

### After Package Selection

When "Baugenehmigung" is selected:

1. All searches are automatically scoped to the 7 package documents
2. The user can still switch to "Alle Dokumente" for unconstrained search
3. The answer format changes based on the package: "Baugenehmigung" answers include a "Benötigte Bauvorlagen" section based on the checklist role
4. Related packages are suggested: "Auch relevant: Brandschutzprüfung, Bauabnahme"

---

## 8. Java Design

### Package Structure

```
com.cognitera.platform.knowledge.package         [NEW — in platform-knowledge]
│
├── api/
│   ├── KnowledgePackage.java                    (interface)
│   ├── KnowledgePackageResolver.java            (interface)
│   └── PackageContext.java                      (record — output of resolution)
│
├── model/
│   ├── KnowledgePackageEntity.java              (JPA entity)
│   ├── PackageDocumentEntity.java               (JPA entity — join table)
│   ├── PackageKnowledgeEntity.java              (JPA entity — structured knowledge refs)
│   └── PackageDocumentRole.java                 (enum: LAW, CHECKLIST, TEMPLATE, etc.)
│
├── application/
│   ├── DefaultKnowledgePackageResolver.java     (resolves package by intent/selection)
│   ├── KnowledgePackageLoader.java              (loads YAML on startup)
│   ├── PackageContextAssembler.java             (builds PackageContext from retrieval)
│   └── KnowledgePackageService.java             (CRUD operations)
│
├── config/
│   ├── KnowledgePackageProperties.java          (YAML file location)
│   └── knowledge-packages.yml                   (default package definitions)
│
└── infrastructure/
    ├── JpaKnowledgePackageRepository.java        (Spring Data JPA)
    └── YamlKnowledgePackageInitializer.java      (seed from YAML)
```

### Key Interfaces

#### KnowledgePackage (Domain Model — Immutable Record)

```java
/**
 * A named collection of all knowledge artifacts required for one municipal task.
 * References documents (by ID + role) and structured knowledge (by type + ID).
 * Immutable — changes produce a new version.
 */
public record KnowledgePackage(
    UUID id,
    String packageId,           // "building-permit"
    String displayName,         // "Baugenehmigung"
    String description,
    String domain,              // "Baurecht"
    int version,
    List<PackageDocument> documents,  // ordered by role priority
    List<PackageKnowledge> knowledge, // structured knowledge references
    Instant createdAt,
    Instant updatedAt
) {}

public record PackageDocument(
    UUID documentId,
    String documentTitle,
    PackageDocumentRole role,   // LAW, CHECKLIST, TEMPLATE, etc.
    int sortOrder
) {}

public record PackageKnowledge(
    String knowledgeType,       // "SALARY_TABLE", "THRESHOLD_TABLE", "TRAVEL_TABLE"
    String knowledgeId          // "TV-L", "AV §55 LHO", "BRKG"
) {}
```

#### KnowledgePackageResolver

```java
/**
 * Resolves which KnowledgePackage(s) apply to a given query.
 * Used by the retrieval pipeline BEFORE corpus routing.
 */
public interface KnowledgePackageResolver {
    /**
     * Resolve packages for a query.
     * @param question the user's question
     * @param selectedPackage explicit package selection (from UI), or null
     * @param domain the classified domain from DomainClassifier
     * @return resolution result with primary package and alternatives
     */
    PackageResolution resolve(
        String question,
        String selectedPackage,
        Domain domain
    );
}

public record PackageResolution(
    KnowledgePackage primary,           // the selected/best-matching package
    List<KnowledgePackage> alternatives, // other relevant packages
    boolean isExplicitSelection,         // true if user explicitly selected
    double matchConfidence              // 0-1 confidence in auto-detection
) {}
```

#### PackageContextAssembler

```java
/**
 * Assembles a PackageContext from retrieval results and a KnowledgePackage.
 * Groups evidence by document role for structured prompt building.
 */
public interface PackageContextAssembler {
    PackageContext assemble(
        List<RetrievalCandidate> results,
        KnowledgePackage pkg,
        List<DecisionResult> structuredDecisions
    );
}

public record PackageContext(
    KnowledgePackage pkg,
    Map<PackageDocumentRole, List<EvidenceItem>> evidenceByRole,
    List<DecisionResult> structuredDecisions,  // from RuleEngine
    List<String> missingDocuments              // package docs not found in results
) {}
```

### Modified Classes

| Class | Change | Reason |
|---|---|---|
| `DefaultRetrievalAugmentationService` | Accept optional `packageId` in `AiRequest`. If present, pass to `KnowledgePackageResolver`. Scope `SearchFilter` to package document IDs. | Scoped retrieval. Backward compatible — null packageId = full corpus search. |
| `DefaultPromptBuilder` | Accept `PackageContext`. If present, group evidence by role and use task-specific output format. If null, use existing generic format. | Task-aware answers. Backward compatible. |
| `DefaultGroundingService` | Accept `PackageContext`. If structured knowledge is referenced, include in grounding confidence. | Structured + document evidence. |
| `AiPageController` | Add `workspaceId` → `packageId` mapping. Pass `packageId` to `AiRequest`. | UI integration. Backward compatible. |
| `CorpusRouter` | Accept `PackageResolution` as optional input. Use package document IDs to determine which corpora to query. | Package-aware routing. Backward compatible. |

### Classes That Remain Unchanged

| Class | Why |
|---|---|
| `RuleEngine` | Packages reference structured knowledge; RuleEngine already provides deterministic answers. |
| `DecisionRouter` | Unchanged — still routes between RULE_ENGINE and HYBRID_RETRIEVAL. |
| `HybridRetrievalService` | Unchanged — still does keyword+vector merge. Package scoping happens at the SearchFilter level above it. |
| `SentenceAwareChunkingStrategy` | Unchanged. |
| `OllamaEmbeddingProvider` | Unchanged. |
| `QdrantVectorSearchProvider` | Unchanged. |
| `CorpusRegistry` | Unchanged — packages reference corpora indirectly through document membership. |
| `DomainGate` | Unchanged — domain filtering is redundant when a package is selected (all docs are same domain), but still runs as a safety net. |

---

## 9. Migration Plan

### Phase 1 — Foundation (v2.0, Week 1-2)

1. Create `KnowledgePackageEntity`, `PackageDocumentEntity`, `PackageKnowledgeEntity` (JPA entities, 3 tables)
2. Create `KnowledgePackage` domain record
3. Create `YamlKnowledgePackageInitializer` — loads `knowledge-packages.yml` at startup, creates entities if not present
4. Create `KnowledgePackageService` — CRUD, find by document, find by domain
5. Add `packageId` (nullable) to `AiRequest`
6. Pass `packageId` through to `DefaultRetrievalAugmentationService`

**Exit criterion:** Packages load from YAML. Queries with `packageId` scope SearchFilter to package documents. Queries without `packageId` work exactly as today.

### Phase 2 — Task-Scoped Retrieval (v2.0, Week 3)

1. Implement `DefaultKnowledgePackageResolver` — matches queries to packages by intent + domain
2. Implement `PackageContextAssembler` — groups results by role
3. Modify `DefaultPromptBuilder` to accept `PackageContext` and produce task-specific output format
4. Modify `DefaultGroundingService` to include structured knowledge from packages

**Exit criterion:** Selecting "Baugenehmigung" scopes retrieval to 7 documents. Answer includes "Benötigte Bauvorlagen" section derived from checklist role.

### Phase 3 — UI (v2.0, Week 4)

1. Add task selector to `decision.html` — dropdown populated from `KnowledgePackageService`
2. On package selection: set `packageId` in form, display "Scope: N Dokumente"
3. On answer: display evidence grouped by role (law, checklist, template sections)

**Exit criterion:** User can select "Direktauftrag" from dropdown, ask a question, and receive an answer grouped by RECHTSGRUNDLAGE, CHECKLISTE, VORLAGE.

### No Breaking Changes

- `AiRequest.packageId` is nullable → existing callers pass null → full corpus search
- `SearchFilter.documentIds` is already nullable → adding package document IDs is additive
- `PromptBuilder` accepts `PackageContext` as optional parameter → existing format is fallback
- All existing tests pass because they don't set `packageId`

---

## 10. Critical Review

### Advantages

1. **Task-aligned experience.** The system aligns with how employees think ("I'm processing a building permit") rather than how documents are organized ("I need §62 BauO Bln").

2. **Scoped retrieval = better precision.** Searching 7 documents instead of 300 eliminates domain noise, reduces latency, and produces more focused prompts.

3. **Role-aware answers.** The LLM can produce task-specific output: a procurement answer includes "Vergabevermerk-Vorlage," a building answer includes "Bauvorlagen-Liste," an HR answer includes "Arbeitsvertrag-Muster."

4. **Structured knowledge integration.** Packages bridge the gap between RuleEngine (deterministic) and retrieval (semantic). A travel expense package knows the BRKG structured table can answer "Tagegeld" without retrieval.

5. **Incremental adoption.** Zero breaking changes. Full corpus search remains the fallback. Packages are additive.

6. **No duplication.** Documents are stored once. Package membership is a join table.

### Disadvantages

1. **Curated metadata.** Package definitions must be manually created and maintained. Unlike tags (which can be crowd-sourced), packages require domain expertise.

2. **Cold start.** Until ~100 documents are in the corpus, packages have only 2-3 documents each — scoping provides little benefit. Packages become valuable at 300+ documents.

3. **Outdated packages.** If a document is removed from the corpus, package references become stale. A cleanup job or foreign key constraint is needed.

4. **Duplication of effort.** The existing DomainGate already provides domain-level filtering. Packages provide task-level filtering — is the granularity worth the complexity?

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Package definitions become stale | Medium | Wrong documents in package → wrong answers | Package health dashboard shows documents no longer in corpus. Scheduled validation job. |
| Users don't use the task selector | Medium | Package feature unused → wasted development | Auto-detect package from query intent (Phase 2). Suggest package: "Meinten Sie Direktauftrag?" |
| Too many packages (50+) | Low | Selection becomes overwhelming | Group packages by domain. Show top 5 by usage. Searchable dropdown. |
| Package maintenance burden | Medium | Domain expert time required | Start with 10 packages. Add 5 per month. Open-source package definitions so Berlin Bezirksämter can contribute. |

### Comparison: Packages vs. Corpora

| Dimension | Corpus (v2.0) | Knowledge Package (v2.0+) |
|---|---|---|
| **Organizing principle** | Document type/origin (LEGAL, PROCEDURAL, CASE) | Business task (Baugenehmigung, Direktauftrag) |
| **Granularity** | Broad — 5-7 corpora for the entire platform | Specific — 20+ packages, each with 5-15 documents |
| **Creation** | Architectural decision — defines storage and indexing | Admin/domain expert decision — defines task scope |
| **Primary value** | Infrastructure isolation (security, performance) | User experience (task-aligned search) |
| **Relationship** | One corpus contains many documents | One package references documents from many corpora |
| **When to use** | Always — corpus is the storage layer | When task-specific scoping improves answer quality |

### Recommendation

**Knowledge Packages should be a lightweight layer ON TOP OF corpora, not a replacement.**

Corpora handle storage, indexing, and security. Packages handle user experience and task scoping. This is the same relationship as "database tables" (corpora) vs. "views" (packages). You don't replace tables with views — you use views to present a task-specific slice of the data.

**Knowledge Packages belong in v2.0, AFTER the platform-knowledge module and multi-corpus architecture are implemented.** They depend on:
- `CorpusRegistry` (to know which corpora contain package documents)
- `FederatedSearchService` (to search across corpora with document ID filtering)
- A corpus of 100+ documents (packages need depth to provide value)

**Estimated implementation effort: 3-4 weeks** (1 week foundation, 1 week retrieval, 1 week UI, 1 week validation + benchmark).

### Comparison: With vs. Without Knowledge Packages

| | Without Packages (v1.1) | With Packages (v2.0) |
|---|---|---|
| User searches for | "Kann ich ein Carport bauen?" | "Kann ich ein Carport bauen?" (Baugenehmigung selected) |
| Documents searched | All 300 documents across all corpora | 7 Baugehmigung documents |
| Answer structure | Generic: KURZANTWORT, ENTSCHEIDUNG, RECHTSGRUNDLAGE | Task-specific: ENTSCHEIDUNG, RECHTSGRUNDLAGE (§61), BENÖTIGTE UNTERLAGEN (Checkliste), GEBÜHREN (250€), NÄCHSTER SCHRITT (Bauantrag einreichen) |
| Cross-domain noise | 15% of results from wrong domain (mitigated by DomainGate) | 0% (only package documents are searched) |
| User satisfaction | "I found the law but I still need the form" | "The system told me the law, the fee, the checklist, and gave me the template" |
