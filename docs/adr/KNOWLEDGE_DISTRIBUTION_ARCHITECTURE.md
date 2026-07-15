# ADR: Knowledge Package Architecture — Multi-Tenant Distribution

**Date:** 2026-07-14  
**Status:** Proposed  
**Scope:** All platform modules  
**Depends on:** platform-knowledge (v2.0), CorpusRegistry (v2.0), Knowledge Packages (v2.0)

---

## Context

The platform currently contains embedded demo knowledge. The target deployment model requires:

1. **Generic platform** — no legal knowledge in the software distribution
2. **Installable knowledge packages** — municipalities install the legal knowledge they need
3. **Multi-tenancy** — one platform instance serves multiple municipalities
4. **Package lifecycle** — install, update, rollback, and dependency management for knowledge

This ADR defines the knowledge distribution architecture. The platform software is distributed as a Docker image or JAR. Knowledge is distributed as versioned, signed packages from a central repository.

---

## 1. Knowledge Package Manifest

### Package Format

A Knowledge Package is a `.kpak` file — a ZIP archive containing:

```
bauordnung-berlin-2025.1.0.kpak
│
├── MANIFEST.yml              # Package identity, version, dependencies, metadata
├── MANIFEST.sig              # Ed25519 digital signature over MANIFEST.yml
├── checksums.sha256          # SHA-256 of every file in the package
├── CHANGELOG.md              # Human-readable changelog
├── LICENSE.md                # Licensing information
│
├── documents/                # All document files
│   ├── BauO_Bln_27-36.pdf
│   ├── BauO_Bln_27-36.json   # Metadata sidecar
│   ├── BauO_Bln_6.pdf
│   ├── BauO_Bln_6.json
│   └── ...
│
├── structured/               # Structured knowledge (RuleEngine tables)
│   ├── threshold-tables.yml
│   └── salary-tables.yml
│
└── metadata/                 # Additional metadata
    ├── corpus-mapping.yml     # Which corpus each document belongs to
    ├── package-mapping.yml    # Which Knowledge Package each document belongs to
    └── chunking-hints.yml     # Per-document chunking strategy overrides
```

### MANIFEST.yml

```yaml
# ── Package Identity ──
package:
  name: "bauordnung-berlin"
  display_name: "Bauordnung Berlin — Building Regulations"
  version: "2025.1.0"
  semantic_version: "2025.1.0"    # Year.Major.Minor
  description: "Complete Berlin Building Code (BauO Bln) with supplementary regulations"
  category: "state-law"
  language: "de"
  jurisdiction: "Berlin"
  legal_domains: ["Baurecht"]

# ── Publisher ──
publisher:
  name: "Municipal Decision Platform"
  url: "https://packages.municipal-decision.de"
  contact: "packages@municipal-decision.de"

# ── Platform Compatibility ──
platform:
  minimum_version: "2.0.0"
  maximum_version: "2.x"
  required_modules: ["platform-knowledge", "platform-search"]
  embedding_model: "nomic-embed-text"     # Must match platform config
  embedding_dimension: 768

# ── Dependencies ──
depends_on:
  - package: "verwaltungsrecht-bund"
    version: ">=2024.0.0"
  - package: "baugesetzbuch-bund"
    version: ">=2024.0.0"
  - package: "baunvo-bund"
    version: ">=2023.0.0"

# ── Conflicts ──
conflicts_with:
  - package: "bauordnung-berlin"
    version: "<2025.0.0"         # Cannot install alongside older versions

# ── What this package provides ──
provides:
  corpora:
    - corpus_id: "legal"
      documents: 85               # Number of documents
      estimated_chunks: 2000
  knowledge_packages:
    - package_id: "building-permit"
    - package_id: "building-fire-safety"
    - package_id: "building-setbacks"
    - package_id: "building-change-of-use"
  structured_knowledge:
    - type: "THRESHOLD_TABLE"
      id: "BauO Berlin — Abstandsflächen"

# ── Integrity ──
integrity:
  checksum_algorithm: "SHA-256"
  signature_algorithm: "Ed25519"
  public_key_fingerprint: "SHA256:abc123def456..."

# ── Update Information ──
updates:
  channel: "stable"                # stable | preview | legacy
  replaces: ["bauordnung-berlin/2023.2.0"]
  superseded_by: null              # Set when a newer package supersedes this
  end_of_life: null                # When this version stops receiving updates
  suggested_update_interval: "monthly"

# ── License ──
license:
  type: "CC0"                      # Public domain — official government text
  attribution: "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin"
  source_urls:
    - "https://gesetze.berlin.de/baubln"
    - "https://gesetze.berlin.de/bauvorlv"

# ── Installation ──
installation:
  requires_confirmation: false      # Auto-install without user prompt
  estimated_duration: "15 minutes"  # For progress display
  estimated_chunks: 2000
  estimated_vectors: 2000
  restart_required: false

# ── Changelog ──
changelog_url: "https://packages.municipal-decision.de/packages/bauordnung-berlin/2025.1.0/CHANGELOG.md"
```

---

## 2. Package Repository

### Repository Model (Maven Central Analogue)

```
https://packages.municipal-decision.de/
│
├── releases/                         # Stable, signed packages
│   ├── bauordnung-berlin/
│   │   ├── 2025.1.0/
│   │   │   ├── bauordnung-berlin-2025.1.0.kpak
│   │   │   ├── bauordnung-berlin-2025.1.0.kpak.sig
│   │   │   └── metadata.json         # Machine-readable metadata
│   │   ├── 2023.2.0/
│   │   └── metadata.json             # All versions
│   ├── vergaberecht-bund/
│   └── ...
│
├── preview/                           # Pre-release packages
├── legacy/                            # Deprecated, no longer updated
├── community/                         # Community-contributed (unsigned or community-signed)
│
├── index.json                         # Full package index
├── public-key.pem                     # Repository signing public key
└── api/                               # REST API for package discovery
    └── v1/
        ├── search?q=bauordnung
        ├── packages/{name}
        └── packages/{name}/versions/{version}
```

### Package Signing

```
1. Package author creates MANIFEST.yml
2. Package author signs MANIFEST.yml with Ed25519 private key → MANIFEST.sig
3. Package author computes SHA-256 of every file → checksums.sha256
4. Package author uploads .kpak to repository
5. Repository verifies signature against author's public key
6. Repository re-signs with repository key (countersignature)
7. Platform verifies repository signature before installation
```

### Trust Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRUST CHAIN                               │
│                                                                  │
│  Root CA (Platform Vendor)                                       │
│      │                                                           │
│      ├── Repository Signing Key (signs all packages)             │
│      │       │                                                   │
│      │       ├── Publisher Key: "Land Berlin"                    │
│      │       │       └── Package: bauordnung-berlin              │
│      │       │                                                   │
│      │       ├── Publisher Key: "Bundesrepublik Deutschland"     │
│      │       │       └── Package: vergaberecht-bund              │
│      │       │                                                   │
│      │       └── Publisher Key: "Stadt München"                  │
│      │               └── Package: verfahren-muenchen             │
│      │                                                           │
│      └── Community Keyring (untrusted, user-approved)            │
│              └── Community packages (user accepts risk)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Package Manager

### Component Design

```java
package com.cognitera.platform.knowledge.packaging;

/**
 * Installs, updates, removes, and manages Knowledge Packages.
 * Analogous to apt, npm, or pip for municipal knowledge.
 */
public interface PackageManager {

    // ── Lifecycle ──

    /** Install a package from the repository. Resolves dependencies. */
    InstallResult install(String packageName, String version, InstallOptions options);

    /** Uninstall a package. Fails if other packages depend on it. */
    UninstallResult uninstall(String packageName, UninstallOptions options);

    /** Update a package to a newer version. Preserves customizations. */
    UpdateResult update(String packageName, String targetVersion, UpdateOptions options);

    /** Rollback to a previous version. Restores documents and metadata. */
    RollbackResult rollback(String packageName, String targetVersion);

    // ── Query ──

    /** List all installed packages with versions. */
    List<InstalledPackage> listInstalled();

    /** Check for available updates. */
    List<AvailableUpdate> checkForUpdates();

    /** Search the repository for packages. */
    List<PackageSummary> searchRepository(String query);

    // ── Maintenance ──

    /** Verify integrity of installed packages (checksum check). */
    List<IntegrityIssue> verifyIntegrity();

    /** Repair a package by re-downloading from the repository. */
    RepairResult repair(String packageName);

    // ── Repository ──

    /** Add a repository source. */
    void addRepository(String name, String url, String publicKeyFingerprint);

    /** Remove a repository source. */
    void removeRepository(String name);

    /** Synchronize with repository (check for new packages/updates). */
    SyncResult sync();
}

public record InstallOptions(
    boolean autoConfirm,          // Skip confirmation prompts
    boolean skipDependencies,     // Don't install dependencies (dangerous)
    boolean offline,              // Install from local cache only
    Path localFile,               // Install from local .kpak file instead of repository
    String tenantId,              // Install for a specific tenant
    Map<String,String> overrides  // Override package manifest values
) {}
```

### Installation Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PACKAGE INSTALLATION WORKFLOW                         │
│                                                                          │
│  1. RESOLVE                                                              │
│     User: "install bauordnung-berlin@2025.1.0"                           │
│     → PackageManager.resolve("bauordnung-berlin", "2025.1.0")           │
│     → Repository: GET /api/v1/packages/bauordnung-berlin/versions/...   │
│     → Download MANIFEST.yml                                              │
│     → Resolve dependency graph:                                          │
│         bauordnung-berlin/2025.1.0                                       │
│           ├── verwaltungsrecht-bund/>=2024.0.0                           │
│           ├── baugesetzbuch-bund/>=2024.0.0                               │
│           └── baunvo-bund/>=2023.0.0                                     │
│     → Check conflicts: no conflicting packages installed                 │
│     → Check platform compatibility: v2.0.0 >= v2.0.0 ✓                   │
│                                                                          │
│  2. VERIFY                                                               │
│     → Download .kpak file                                                │
│     → Verify Ed25519 signature against repository public key             │
│     → Verify SHA-256 checksums of all files                              │
│     → Verify publisher signature (if present)                            │
│                                                                          │
│  3. EXTRACT                                                              │
│     → Unpack .kpak to temp directory                                     │
│     → Parse corpus-mapping.yml                                           │
│     → Parse package-mapping.yml                                          │
│     → Parse structured/*.yml                                             │
│                                                                          │
│  4. IMPORT                                                               │
│     For each document in documents/:                                     │
│       → SHA-256 duplicate check against existing corpus                  │
│       → If duplicate with same version: skip                             │
│       → If newer version of existing: mark existing as historical        │
│       → Create DocumentEntity with metadata from JSON sidecar            │
│       → Assign corpus_id from corpus-mapping.yml                         │
│       → Create DocumentVersionEntity                                     │
│       → Enqueue IngestionJob                                             │
│                                                                          │
│  5. INDEX                                                                │
│     → DocumentIngestionWorker picks up jobs                              │
│     → TextExtractionService extracts text                                │
│     → SentenceAwareChunkingStrategy chunks                               │
│     → OllamaEmbeddingProvider generates embeddings                       │
│     → QdrantVectorSearchProvider indexes to Qdrant                      │
│     → LegalMetadataExtractor extracts § refs into attributes             │
│                                                                          │
│  6. REGISTER                                                             │
│     → KnowledgePackageService.register(packageId, documents)             │
│     → CorpusManifestService.syncFromDocuments()                          │
│     → KnowledgeRegistry.register(structured tables)                      │
│     → PackageManager.recordInstallation(package, version, tenantId)      │
│                                                                          │
│  7. VERIFY                                                               │
│     → Check embedding coverage >= 98%                                    │
│     → Run benchmark (subset for affected Knowledge Packages)             │
│     → Compare with previous benchmark — must not degrade                 │
│     → Log installation audit event                                       │
│                                                                          │
│  Result: Package installed. Documents searchable. Knowledge Packages     │
│          active. Tenant can now query against the new knowledge.        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Update Workflow (BauO Berlin changes)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PACKAGE UPDATE WORKFLOW                               │
│                                                                          │
│  1. NOTIFICATION                                                         │
│     → Repository has bauordnung-berlin/2026.1.0                          │
│     → PackageManager.checkForUpdates() → AvailableUpdate available       │
│     → Admin notified: "BauO Berlin update available (2026.1.0)"         │
│                                                                          │
│  2. DRY RUN                                                              │
│     → PackageManager.update("bauordnung-berlin", "2026.1.0",            │
│                             dryRun=true)                                 │
│     → Shows: documents to add, documents to update, documents to remove  │
│     → Shows: Knowledge Packages affected                                 │
│     → Shows: estimated indexing time                                     │
│                                                                          │
│  3. PRESERVE HISTORICAL                                                  │
│     → Current documents tagged "current" → re-tagged "historical"       │
│     → Current documents tagged "superseded-by:2026"                      │
│     → New documents tagged "current", "supersedes:2025"                  │
│     → Historical documents remain in corpus for temporal queries         │
│     → Historical documents excluded from default retrieval               │
│                                                                          │
│  4. REPLACE DOCUMENTS                                                    │
│     → New documents imported (same procedure as install)                 │
│     → Embeddings generated for new documents                             │
│     → Qdrant vectors for old documents: NOT deleted                     │
│     → Qdrant vectors for old documents: tagged with version=2025        │
│                                                                          │
│  5. RE-INDEX (IF NEEDED)                                                 │
│     → If chunking strategy changed: full re-index of new documents       │
│     → If embedding model changed: full re-embed of all new chunks        │
│     → If only content changed: index new, keep old                       │
│                                                                          │
│  6. RE-RUN BENCHMARK                                                     │
│     → Run benchmark against updated corpus                               │
│     → Compare with pre-update benchmark                                  │
│     → If regression: rollback automatically (if configured)              │
│     → If improvement: commit update                                      │
│                                                                          │
│  7. NOTIFY USERS                                                         │
│     → "BauO Berlin updated to 2026. BauO 2025 remains available for     │
│        temporal queries."                                                │
│     → Knowledge Packages containing BauO documents updated automatically │
│                                                                          │
│  Total time: ~10-30 minutes (depending on document count)               │
│  Downtime: None (old documents remain searchable during update)          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Rollback Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PACKAGE ROLLBACK WORKFLOW                             │
│                                                                          │
│  1. INITIATE                                                             │
│     → Admin: "rollback bauordnung-berlin to 2025.1.0"                   │
│     → Or: automatic rollback after benchmark regression                  │
│                                                                          │
│  2. VERIFY                                                               │
│     → PackageManager.rollback("bauordnung-berlin", "2025.1.0")          │
│     → Check: target version exists in local package cache                │
│     → If not cached: download from repository                            │
│     → Verify integrity of cached package                                 │
│                                                                          │
│  3. REVERT DOCUMENTS                                                     │
│     → All documents tagged "current" from failed version:                │
│         → Remove "current" tag                                           │
│         → Add "rolled-back" tag                                          │
│     → All documents from target version:                                 │
│         → Restore "current" tag                                          │
│         → Remove "historical" tag                                        │
│     → No documents deleted — all versions retained                       │
│                                                                          │
│  4. REVERT STRUCTURED KNOWLEDGE                                          │
│     → KnowledgeRegistry: replace threshold/salary tables                 │
│     → Verify RuleEngine produces same results as before update           │
│                                                                          │
│  5. RESTORE EMBEDDINGS                                                   │
│     → Qdrant vectors for target version still exist                      │
│     → No re-embedding needed (vectors were preserved during update)      │
│     → Retrieval immediately reverts to pre-update state                  │
│                                                                          │
│  6. VERIFY                                                               │
│     → Run benchmark — must match pre-update benchmark                    │
│     → Check Knowledge Packages — all documents present                   │
│     → Log rollback audit event                                           │
│                                                                          │
│  Total time: <1 minute (no re-indexing needed)                          │
│  Data loss: None (all versions preserved)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Multi-Tenant Knowledge Distribution

### Tenant Isolation Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PLATFORM (Single Installation)                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   SHARED PLATFORM SERVICES                        │   │
│  │                                                                    │   │
│  │  ● Authentication (Keycloak / OIDC)                               │   │
│  │  ● Search infrastructure (Qdrant, PostgreSQL)                     │   │
│  │  ● AI services (Ollama, PromptBuilder, GroundingService)          │   │
│  │  ● Document processing (TextExtraction, Chunking, Embedding)      │   │
│  │  ● Workflow engine                                                │   │
│  │  ● Audit logging                                                  │   │
│  │  ● Package Manager                                               │   │
│  │                                                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              FEDERAL KNOWLEDGE (Shared, Read-Only)                │   │
│  │                                                                    │   │
│  │  ● verwaltungsrecht-bund/2024.1.0                                 │   │
│  │  ● vergaberecht-bund/2025.1.0                                     │   │
│  │  ● personalrecht-bund/2025.1.0                                    │   │
│  │  ● datenschutz-bund/2024.1.0                                      │   │
│  │                                                                    │   │
│  │  All tenants share one copy. Read-only. Managed by platform admin. │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │  TENANT: Berlin-Mitte     │  │  TENANT: München          │            │
│  │                           │  │                           │            │
│  │  ● STATE: Berlin/2025.1.0 │  │  ● STATE: Bayern/2025.1.0 │            │
│  │  ● MUNI: Berlin-Mitte     │  │  ● MUNI: München          │            │
│  │  ● CUSTOMER: (isolated)   │  │  ● CUSTOMER: (isolated)   │            │
│  │                           │  │                           │            │
│  │  Qdrant: tenant_01_legal  │  │  Qdrant: tenant_02_legal  │            │
│  │  PG: tenant_01 schema     │  │  PG: tenant_02 schema     │            │
│  │  Users: tenant_01 realm   │  │  Users: tenant_02 realm   │            │
│  └──────────────────────────┘  └──────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tenant Isolation Levels

| Level | Knowledge | Shared? | Isolation Mechanism |
|---|---|---|---|
| **Platform** | Software, AI models | All tenants | Single instance |
| **Federal** | BRKG, GWB, VwVfG, DSGVO, TV-L | **All tenants (read-only)** | Shared Qdrant collection with `tenant_id = null`. All tenants can query. |
| **State** | BauO Berlin, BayBO, etc. | **Per state group** | Per-state Qdrant collection or `tenant_id = state_group_id`. Berlin tenants share Berlin knowledge. |
| **Municipality** | Bezirksamt procedures, local forms | **Optionally shared within municipality group** | `tenant_id = municipality_group_id`. Can be private or shared. |
| **Customer** | Internal SOPs, templates, emails | **Never shared** | `tenant_id = tenant_id`. Hard isolation. Per-tenant Qdrant collection for case/communication corpora. |

### Database Isolation Strategy

```
documents table:
  tenant_id VARCHAR(50)
    NULL        → Federal knowledge (all tenants)
    'state:be'  → Berlin state knowledge (Berlin tenants)
    'muni:01'   → Municipality 01 knowledge (tenants in that municipality)
    'tenant:01' → Customer-specific (only tenant 01)

search_document_chunks:
  tenant_id (same values)

Qdrant collections:
  federal_legal       → tenant_id = null
  state_be_legal      → tenant_id = 'state:be'
  tenant_01_case      → tenant_id = 'tenant:01'
  tenant_02_case      → tenant_id = 'tenant:02'
```

### Retrieval with Tenant Awareness

```
User (tenant: Berlin-Mitte) asks: "Welches Vergabeverfahren bei 8.000€?"

CorpusRouter.route(question, tenantId="tenant:01", stateGroup="state:be")
  → Eligible corpora:
      ● LEGAL corpus → includes federal + Berlin state + Berlin-Mitte municipal
      ● PROCEDURAL corpus → includes federal + Berlin state + Berlin-Mitte municipal
  → EXCLUDED:
      ● Bayern state knowledge (different state group)
      ● München municipal knowledge (different municipality)
      ● tenant:02 customer knowledge (different tenant)

FederatedSearchService.search(question, eligibleCorpora)
  → Qdrant: query federal_legal + state_be_legal + tenant_01_case
  → PostgreSQL: WHERE tenant_id IN (NULL, 'state:be', 'muni:01', 'tenant:01')
  → Results: only knowledge relevant to this tenant
```

---

## 5. Version Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PACKAGE VERSION LIFECYCLE                             │
│                                                                          │
│                                                                          │
│  PREVIEW ──────► STABLE ──────► SUPERSEDED ──────► LEGACY ──────► EOL  │
│    │                │               │                │            │     │
│    │                │               │                │            │     │
│  ● Pre-release   ● Production   ● Newer version  ● No updates   ● Removed│
│  ● May change    ● Supported    ● Still usable   ● Security fixes│ from  │
│  ● Community     ● Signed       ● Recommended    │   only        │ repo  │
│    testing       ● Full QA        to update      ● Not indexed   │      │
│                                                       │                 │
│                                                       ▼                 │
│                                                  ROLLBACK TARGET        │
│                                                  ● Available for        │
│                                                    rollback             │
│                                                  ● Vectors preserved    │
│                                                  ● Documents tagged     │
│                                                    "historical"         │
└─────────────────────────────────────────────────────────────────────────┘
```

| State | Retrieval | Updates | Can Rollback To? | Repository |
|---|---|---|---|---|
| **PREVIEW** | Experimental (flag to enable) | Yes | Yes | preview/ |
| **STABLE** | Default (tagged "current") | Yes | Yes | releases/ |
| **SUPERSEDED** | Excluded from default (tagged "historical") | No | **Yes** | releases/ |
| **LEGACY** | Excluded from all retrieval | No | No | legacy/ |
| **EOL** | Removed from tenant | No | No | Removed |

---

## 6. Deployment Model

### Single Municipality (Small)

```
One server, Docker Compose:
  ● Platform (single instance)
  ● PostgreSQL (single instance)
  ● Qdrant (single instance)
  ● Ollama (single instance)
  ● All knowledge packages installed locally
  ● One tenant
```

### Multiple Municipalities (Medium)

```
One server, Docker Compose:
  ● Platform (single instance)
  ● PostgreSQL (single instance, per-tenant schemas)
  ● Qdrant (single instance, per-tenant collections)
  ● Ollama (single instance)
  ● Federal packages shared
  ● State packages per state group
  ● Municipal packages per tenant
```

### State-Wide Deployment (Large)

```
Kubernetes cluster:
  ● Platform (multiple replicas)
  ● PostgreSQL (HA, read replicas)
  ● Qdrant (cluster mode)
  ● Ollama (GPU nodes)
  ● Package repository (local mirror for air-gapped)
  ● Hundreds of tenants (all Berlin Bezirksämter)
```

### Air-Gapped Deployment

```
Municipality with no internet access:
  1. Download .kpak files on internet-connected machine
  2. Transfer via USB/external drive
  3. PackageManager.install(offline=true, localFile=/media/packages/*.kpak)
  4. All packages verified against bundled public key
  5. No telemetry, no external calls
```

---

## 7. Migration from Current Implementation

### Phase 1 — Package Format (v2.0, Week 1-3)

1. Define `.kpak` format and `MANIFEST.yml` schema
2. Implement `PackageManager.install()` for local `.kpak` files
3. Convert the v1.1 300-document corpus into 6 `.kpak` packages:
   - `bauordnung-berlin/2025.1.0.kpak`
   - `vergaberecht-berlin/2025.1.0.kpak`
   - `personalrecht-bund/2025.1.0.kpak`
   - `verwaltungsrecht-bund/2024.1.0.kpak`
   - `verfahren-berlin/2025.1.0.kpak` (procedural docs)
   - `gerichtsentscheidungen-berlin/2025.1.0.kpak` (court decisions)

**Exit criterion:** All 300 documents can be installed by running `pm install *.kpak`.

### Phase 2 — Repository (v2.0, Week 4-5)

1. Set up `https://packages.municipal-decision.de`
2. Implement package upload, signing, and indexing
3. Implement `PackageManager.searchRepository()` and `checkForUpdates()`
4. Migrate packages to repository

**Exit criterion:** `pm install bauordnung-berlin` downloads and installs from the repository.

### Phase 3 — Multi-Tenancy (v2.1, Week 1-4)

1. Add `tenant_id` to documents, chunks, Qdrant payloads
2. Implement tenant-aware CorpusRouter
3. Implement tenant isolation in retrieval
4. Add `pm install --tenant=berlin-mitte bauordnung-berlin`

**Exit criterion:** Two tenants on one instance. Tenant A cannot see Tenant B's documents.

### Phase 4 — Update/Rollback (v2.1, Week 5-6)

1. Implement `PackageManager.update()` with historical version preservation
2. Implement `PackageManager.rollback()` with vector preservation
3. Add benchmark regression detection to update workflow
4. Implement package state machine (PREVIEW → STABLE → SUPERSEDED → LEGACY → EOL)

**Exit criterion:** Update BauO Berlin to 2026. All old documents preserved. Rollback restores 2025.

---

## 8. Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Package signing keys compromised | Low | High — malicious packages could be installed | Hardware security module (HSM) for repository key. Key rotation every 6 months. |
| Dependency hell (circular deps) | Medium | Medium — installation fails | Dependency resolver rejects circular dependencies. Maximum dependency depth of 5. |
| Package too large (100MB+) | Medium | Low — slow downloads | Chunked downloads. Delta updates (only changed files). |
| State law conflicts with federal law in package | Low | High — incorrect answers | Package conflict detection: `conflicts_with` in MANIFEST.yml. Legal review before publication. |
| Tenant data leakage via shared Qdrant collection | Medium | High — GDPR violation | Per-tenant Qdrant collections for all customer-level knowledge. Shared only for federal/state. |
| Embedding model change breaks all packages | Low | High — all vectors invalid | `embedding_model` in platform compatibility check. Model version pinned per package. Migration tool for re-embedding. |

---

## 9. Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Embedded knowledge in Docker image | 5GB Docker image. Update requires full redeployment. Cannot install subset. |
| Git repository of documents | No signing. No dependency resolution. No versioning semantics. |
| Individual PDF downloads | No metadata. No structured knowledge. No package concept at all. |
| API-based knowledge service (SaaS) | Requires internet. Not air-gappable. Latency. GDPR concerns. |
| Maven artifacts (.jar with PDFs) | PDFs are not code. Maven versioning semantics don't match legal versioning (2025.1.0 ≠ 1.0.0). |

---

## 10. Recommendation

**Implement Knowledge Package Distribution architecture in v2.0.**

The `.kpak` format, `PackageManager`, and repository are required before the platform can be shipped to a second municipality. Without them, every deployment is a custom corpus engineering project.

**Estimated effort: 8-10 weeks for Phase 1-2 (package format + repository), 14-16 weeks total for all four phases.**

The existing document model, retrieval pipeline, chunking, embedding, and indexing remain unchanged. The package manager is a new layer ABOVE the existing ingestion pipeline — it automates what is currently manual (download PDF → write JSON sidecar → run batch import).

**Priority: This is the most valuable architectural investment for turning the platform from a custom Berlin project into a commercial multi-tenant product.**
