# Corpus Versioning Strategy — Version 1.1

> **Date:** 2026-07-14  
> **Context:** German legal documents are amended, repealed, and superseded continuously. The corpus must accurately reflect the law at any point in time.

---

## 1. Version Model

### Core Principle

**Every legal document has exactly one "current" version and zero or more "historical" versions.** The current version is used for retrieval by default. Historical versions are retained for audit and temporal queries.

### Version Identity

A legal document version is identified by:

```
{doc_type} {short_title} {version_date} [{status}]
```

Example: `Gesetz BauO Bln 2025-06-30 [CURRENT]`

### Version States

| State | Meaning | Retrieval Behavior | Display |
|---|---|---|---|
| `CURRENT` | The authoritative version in force today | Included in default retrieval | No badge |
| `FUTURE` | Enacted but not yet in force (effective date in future) | Excluded from retrieval | "In Kraft ab {date}" |
| `HISTORICAL` | Superseded by a newer version | Excluded from default retrieval; available for temporal queries | "Außer Kraft seit {date}" |
| `REPEALED` | Repealed without replacement | Excluded from retrieval | "Aufgehoben am {date}" |
| `AMENDED` | Partially amended; a newer version exists but this one may still apply to certain cases | Excluded from default retrieval; flaggable for temporal queries | "Geändert durch {amending_law} am {date}" |

### Relationship Model

```
BauO Bln 2018-05-15 [HISTORICAL]
    │  supersededBy
    ▼
BauO Bln 2023-01-01 [HISTORICAL]
    │  supersededBy
    ▼
BauO Bln 2025-06-30 [CURRENT]
    │  amendedBy (partial)
    ▼
Schneller-Bauen-Gesetz 2024-12-12 [AMENDMENT]
```

**Implementation approach (no schema changes in Phase 1):**

Use the existing `document_tags` EAV collection and `DocumentEntity.category` to encode version relationships:

```java
// On DocumentEntity:
tags: ["sccon-demo", "building-regulations", "baurecht", "current"]
category: "building-regulations"

// Historical version:
tags: ["sccon-demo", "building-regulations", "baurecht", "historical", "superseded-by:{document-id}"]
category: "building-regulations"

// Future version:
tags: ["sccon-demo", "building-regulations", "baurecht", "future", "effective:{date}"]
category: "building-regulations"
```

This works with the existing `DocumentEntity` schema — zero DDL changes. The `CorpusManifestEntity` already has `lastAmendmentDate` and `versionIdentifier` fields that can store version metadata.

---

## 2. Handling Legal Lifecycle Events

### 2.1 Amended Regulation

**Scenario:** BauO Bln §63 is amended by the Schneller-Bauen-Gesetz, changing the simplified procedure requirements.

**Procedure:**
1. Download the amending law (Schneller-Bauen-Gesetz) as a separate document
2. Download the new consolidated version of BauO Bln (incorporating the amendment) from gesetze-im-internet or Berlin legal portal
3. Upload the NEW consolidated version as a new DocumentVersion of the existing BauO Bln document entity, OR as a new DocumentEntity with tags indicating it supersedes the old version
4. Update the previous version's tags: add `historical`, add `superseded-by:{new-doc-id}`
5. The `CorpusManifestEntity.lastAmendmentDate` is updated to reflect the amendment date
6. Run benchmark to verify the amendment didn't break existing answers

**Decision (Phase 1): Treat amendments as separate documents, not as DocumentVersions.**

Rationale:
- `DocumentVersion` tracks UPLOAD versions (same document re-uploaded), not LEGAL versions (different legal text)
- Legal amendments produce materially different text — they should be separate corpus entries
- This avoids conflating the upload version concept with the legal version concept
- Links between versions are maintained via tags and the manifest

**Phase 2 improvement:** Introduce a `parent_document_id` column on `DocumentEntity` for explicit version chain relationships.

### 2.2 Repealed Regulation

**Scenario:** A regulation is repealed without replacement.

**Procedure:**
1. Mark the document's tags: add `repealed`, add `repealed:{date}`
2. Set `CorpusManifestEntity.ingestionStatus` to an appropriate withdrawn state
3. The document remains in the database for audit but is excluded from retrieval
4. The SearchFilter in retrieval queries excludes documents tagged `repealed`

### 2.3 Historical Version

**Scenario:** A user asks "Was the direct award threshold 8,000 EUR or 10,000 EUR in 2023?"

**Procedure:**
1. The historical version of AV §55 LHO (2023) is stored with tags `historical`, `effective:2023-01-01`, `superseded-by:{current-doc-id}`
2. A temporal query filter can restrict search to documents effective during a date range
3. The RuleEngine handles the current threshold via structured knowledge
4. For retrieval-based questions about historical law, the user can toggle a temporal filter

**Phase 1 behavior:** Historical versions are indexed but excluded from default search. A future UI toggle ("Include historical regulations") can enable temporal search.

### 2.4 Effective Dates

German legal documents have two critical dates:

| Date Type | Meaning | Stored In |
|---|---|---|
| **Publication date** (Verkündungsdatum) | When the law was published in the official gazette | `CorpusManifestEntity.publicationDate` |
| **Effective date** (Inkrafttretensdatum) | When the law becomes legally binding | `CorpusManifestEntity.lastAmendmentDate` (current use) → should become explicit `effectiveDate` field |
| **Expiry date** (Außerkrafttretensdatum) | When the law ceases to be in force | Not currently stored → needed |

**Implementation (Phase 1):**
- Store effective dates as tag entries: `effective:{YYYY-MM-DD}`
- Store expiry dates as tag entries: `expired:{YYYY-MM-DD}`  
- The `CorpusManifestEntity` already has `publicationDate` and `lastAmendmentDate` fields

**Implementation (Phase 2):**
- Add `effective_date` and `expiry_date` columns to `corpus_manifest` table
- Add temporal filter to SearchQuery: `effectiveFrom`, `effectiveTo`

---

## 3. Versioning in Search and Retrieval

### Default Behavior

```
Search query → documents tagged "current" AND NOT tagged "historical"
                                          AND NOT tagged "repealed"
                                          AND effective_date <= NOW
                                          AND (expiry_date IS NULL OR expiry_date > NOW)
```

### Temporal Query (Phase 2 feature)

```
Search query + temporal context: "as_of": "2023-06-15"
  → documents WHERE effective_date <= "2023-06-15"
                AND (expiry_date IS NULL OR expiry_date > "2023-06-15")
```

### Version Display in Results

| Version | Display Badge | Example Citation |
|---|---|---|
| CURRENT | (none or green "Aktuell") | "BauO Bln §61" |
| FUTURE | "In Kraft ab 01.01.2027" | "BauO Bln §61 (Fassung 2027)" |
| HISTORICAL | "Außer Kraft seit 30.06.2025" | "BauO Bln §61 (Fassung 2018)" |
| REPEALED | "Aufgehoben am 15.03.2024" | — (excluded from retrieval) |

---

## 4. Corpus Manifest Version Fields

The `CorpusManifestEntity` already has the following version-relevant fields:

| Field | Purpose | Currently Populated? |
|---|---|---|
| `versionIdentifier` | Unique version string (e.g., "2025-06-30") | Not populated during sync — **GAP** |
| `publicationDate` | Date of official publication | Set from `DocumentEntity.createdAt` (approximate) |
| `lastAmendmentDate` | Date of most recent amendment | Not populated — **GAP** |
| `checksumSha256` | Content integrity verification | Set from `DocumentVersionEntity.checksumSha256` during sync |
| `sourceUrl` | Official source URL | Not populated — **GAP** |

**Recommendation for Phase 1:** Populate these fields from the metadata spreadsheet during manual collection. They must be filled BEFORE ingestion so the manifest correctly reflects the legal version.

---

## 5. Metadata Spreadsheet Template

Each document batch should be accompanied by a CSV/JSON metadata file:

```csv
title,short_name,legal_domain,jurisdiction,authority,doc_type,language,source_url,publication_date,effective_date,expiry_date,last_amendment_date,version_identifier,file_format,priority,supersedes,superseded_by,amends,tags
"Bauordnung für Berlin","BauO Bln","Baurecht","Berlin","Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen","Gesetz","DE","https://gesetze.berlin.de/baubln","2025-06-30","2025-06-30","","2025-06-30","2025-06-30","PDF","P1","bauo-bln-2023-01-01","","","baurecht,current"
```

This metadata file serves as the **authoritative input** for both the document upload API call and the corpus manifest entry. It ensures the manifest's version fields are populated before ingestion begins.

---

## 6. Migration Path

### From Demo Corpus to Version-Aware Corpus

The current 23 demo documents are all tagged `sccon-demo` and have no version metadata. When the production corpus is introduced:

1. Demo documents remain as-is (tagged `sccon-demo`) — they are excluded from production queries by the demo tag filter
2. All production documents are tagged with their version state (`current`, `historical`, etc.)
3. Production retrieval queries add a filter: `NOT tagged "sccon-demo" AND tagged "current"`
4. The benchmark is updated to use production documents instead of demo documents

### From Phase 1 to Phase 2

1. Phase 1: version metadata lives in tags (EAV) and `CorpusManifestEntity` fields — no DDL changes
2. Phase 2: after validating the versioning model with 300 documents, add dedicated columns:
   - `documents.effective_date`
   - `documents.expiry_date`
   - `documents.parent_document_id`
   - `documents.version_state` (enum: CURRENT, HISTORICAL, FUTURE, REPEALED)
3. Migrate tag-based version data to dedicated columns
4. Update retrieval queries to use indexed columns instead of tag filters
