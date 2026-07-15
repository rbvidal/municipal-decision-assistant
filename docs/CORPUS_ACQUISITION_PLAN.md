# Corpus Acquisition Plan — Version 1.1

> **Target:** 200-300 official German legal documents for Berlin municipal administration  
> **Objective:** Validate full ingestion pipeline before scaling to 1000+ documents  
> **Date:** 2026-07-14

---

## Part 1 — Source Catalog

### 1.1 Federal Sources (Bundesebene)

#### gesetze-im-internet.de

| Field | Value |
|---|---|
| **Publisher** | Bundesministerium der Justiz (BMJ) |
| **URL** | https://www.gesetze-im-internet.de |
| **Document types** | All federal laws (GG, GWB, VgV, VOB/A, BRKG, ArbZG, BDSG, etc.) and federal regulations |
| **Estimated relevant documents** | 40-60 |
| **Update frequency** | Continuous — amendments published within days of enactment |
| **Machine-readable?** | **Yes** — clean HTML with consistent structure, § tags in anchors |
| **Historical versions?** | **Yes** — full version history with effective dates via "frühere Fassungen" links |
| **Licensing** | Public domain — official government publication, no restrictions |
| **Expected usefulness** | **HIGH** — Authoritative source for all federal laws. Structured HTML enables perfect §-level parsing. |

**Priority documents from this source:**

| Document | Domain | Priority | Pages |
|---|---|---|---|
| GWB Teil 4 (§§ 97-184) | Vergaberecht | P1 | ~30 |
| VgV (Vergabeverordnung) | Vergaberecht | P1 | ~25 |
| VOB/A (Vergabe- und Vertragsordnung für Bauleistungen) | Vergaberecht | P1 | ~20 |
| UVgO (Unterschwellenvergabeordnung) | Vergaberecht | P1 | ~15 |
| BRKG (Bundesreisekostengesetz) | Personalrecht | P1 | ~20 |
| ArbZG (Arbeitszeitgesetz) | Personalrecht | P2 | ~10 |
| BDSG (Bundesdatenschutzgesetz) | Datenschutz | P2 | ~25 |
| BauGB (Baugesetzbuch) | Baurecht | P2 | ~40 |
| BauNVO (Baunutzungsverordnung) | Baurecht | P2 | ~15 |

#### Bundesanzeiger / Bundesgesetzblatt

| Field | Value |
|---|---|
| **Publisher** | Bundesministerium der Justiz |
| **URL** | https://www.bgbl.de |
| **Document types** | Official promulgation versions of all federal laws and regulations |
| **Estimated relevant documents** | 5-10 (promulgation versions of key laws not on gesetze-im-internet) |
| **Machine-readable?** | **Mixed** — PDFs with text layers, some scanned |
| **Historical versions?** | Yes — complete archive since 1949 |
| **Licensing** | Public domain |
| **Expected usefulness** | **MEDIUM** — Useful for authoritative promulgation text when gesetze-im-internet versions are unclear |

---

### 1.2 Berlin State Sources (Landesebene)

#### Berliner Vorschriften- und Rechtsprechungsdatenbank

| Field | Value |
|---|---|
| **Publisher** | Senatsverwaltung für Justiz und Verbraucherschutz Berlin |
| **URL** | https://gesetze.berlin.de |
| **Document types** | All Berlin state laws (BauO Bln, BerlAVG, UrlVO Bln, AZVO Bln, LRKG) |
| **Estimated relevant documents** | 30-50 |
| **Update frequency** | Within 1-4 weeks of enactment |
| **Machine-readable?** | **Mixed** — newer laws are HTML; older laws and some amendments are scanned PDF images |
| **Historical versions?** | **Partial** — some laws have version history; others only show current text |
| **Licensing** | Public domain — official state publication |

**Priority documents from this source:**

| Document | Domain | Priority | Pages |
|---|---|---|---|
| BauO Bln (Bauordnung für Berlin, complete) | Baurecht | P1 | ~40 |
| BerlAVG (Berliner Ausschreibungs- und Vergabegesetz, complete) | Vergaberecht | P1 | ~10 |
| UrlVO Bln (Urlaubsverordnung Berlin, complete) | Personalrecht | P2 | ~20 |
| AZVO Bln (Arbeitszeitverordnung Berlin) | Personalrecht | P3 | ~12 |
| LRKG Berlin (Landesreisekostengesetz, if separate from BRKG) | Personalrecht | P2 | ~15 |

#### Senatsverwaltung für Finanzen Berlin — Vergabestelle

| Field | Value |
|---|---|
| **Publisher** | Senatsverwaltung für Finanzen Berlin |
| **URL** | https://www.berlin.de/sen/finanzen/ |
| **Document types** | AV §55 LHO, Beschaffungsordnung, Vergabehandbuch, Rundschreiben, Formulare |
| **Estimated relevant documents** | 20-30 |
| **Update frequency** | Annual updates, circulars ad-hoc |
| **Machine-readable?** | **Mixed** — newer PDFs are text-based; older circulars may be scanned |
| **Historical versions?** | **Rare** — typically only current version published |
| **Licensing** | Public — official administrative publication |

**Priority documents from this source:**

| Document | Domain | Priority | Pages |
|---|---|---|---|
| AV zu §55 LHO (complete with all appendices) | Vergaberecht | P1 | ~20 |
| Beschaffungsordnung Berlin (complete) | Vergaberecht | P1 | ~15 |
| Vergabehandbuch Berlin | Vergaberecht | P2 | ~30 |
| Rundschreiben zu Direktaufträgen und Wertgrenzen | Vergaberecht | P2 | ~5 |
| Vergabevermerk-Muster (template) | Vergaberecht | P2 | ~3 |

#### Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen

| Field | Value |
|---|---|
| **Publisher** | Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin |
| **URL** | https://www.berlin.de/sen/sbw/ |
| **Document types** | BauVorlV 2025, BauO Ausführungshinweise, Bauantragsformulare, Bauchecklisten, Rundschreiben |
| **Estimated relevant documents** | 25-35 |
| **Update frequency** | Variable — forms updated periodically |
| **Machine-readable?** | **Mixed** — forms are fillable PDF with text; guidelines are plain PDF |
| **Historical versions?** | **Rare** |

**Priority documents from this source:**

| Document | Domain | Priority | Pages |
|---|---|---|---|
| BauVorlV 2025 (complete) | Baurecht | P1 | ~15 |
| Ausführungshinweise zur BauO Bln | Baurecht | P2 | ~25 |
| Baugenehmigungsformular (official form) | Baurecht | P2 | ~5 |
| Bauantrag-Checkliste | Baurecht | P2 | ~3 |
| Rundschreiben zum Schneller-Bauen-Gesetz | Baurecht | P2 | ~8 |

#### Senatsverwaltung für Inneres und Sport Berlin

| Field | Value |
|---|---|
| **Publisher** | Senatsverwaltung für Inneres und Sport Berlin |
| **URL** | https://www.berlin.de/sen/inneres/ |
| **Document types** | Mobile Arbeit Rahmenvereinbarung, IT-Sicherheitsleitlinie, Personalhandbuch, Dienstvereinbarungen |
| **Estimated relevant documents** | 15-25 |
| **Update frequency** | Annual/biannual |
| **Machine-readable?** | **Mixed** |
| **Historical versions?** | **Rare** |

---

### 1.3 Collective Agreements (Tarifverträge)

#### TdL — Tarifgemeinschaft deutscher Länder

| Field | Value |
|---|---|
| **Publisher** | TdL (Tarifgemeinschaft deutscher Länder) |
| **URL** | https://www.tdl-online.de |
| **Document types** | TV-L, TVöD, Entgeltordnung, Überleitungsregelungen, Änderungstarifverträge |
| **Estimated relevant documents** | 10-15 |
| **Update frequency** | Every 1-2 years (salary rounds) |
| **Machine-readable?** | **Yes** — clean PDFs with text layers |
| **Historical versions?** | **Yes** — all past collective agreements are archived |
| **Licensing** | Published officially; restricted redistribution may apply (check terms) |

**Priority documents from this source:**

| Document | Domain | Priority | Pages |
|---|---|---|---|
| TV-L (complete, current version) | Personalrecht | P1 | ~40 |
| TV-L Entgeltordnung (Eingruppierungskatalog) | Personalrecht | P1 | ~50 |
| TV-L §34 Kündigungsfristen (full table) | Personalrecht | P2 | ~5 |
| TV-L Änderungstarifvertrag 2025 (salary round) | Personalrecht | P1 | ~10 |

---

### 1.4 EU Sources

#### EUR-Lex

| Field | Value |
|---|---|
| **Publisher** | Publications Office of the European Union |
| **URL** | https://eur-lex.europa.eu |
| **Document types** | EU procurement directives (2014/24/EU, 2014/25/EU), EU thresholds |
| **Estimated relevant documents** | 5-10 |
| **Update frequency** | Every 2 years (threshold revisions) |
| **Machine-readable?** | **Yes** — HTML and PDF, well-structured |
| **Historical versions?** | **Yes** — complete |
| **Licensing** | Public — official EU publication |

**Priority documents:**

| Document | Domain | Priority | Pages |
|---|---|---|---|
| EU-Schwellenwerte 2024/2026 (threshold communication) | Vergaberecht | P2 | ~2 |
| Richtlinie 2014/24/EU (public procurement directive, relevant excerpts) | Vergaberecht | P3 | ~10 |

---

### 1.5 Court Decisions and Interpretive Sources

#### Vergabekammer Berlin / Vergabekammer des Bundes

| Field | Value |
|---|---|
| **Publisher** | Vergabekammer Berlin / Bundeskartellamt |
| **URL** | https://www.berlin.de/vergabekammer/ |
| **Document types** | Vergabekammer decisions, cost rulings, procedural guidance |
| **Estimated relevant documents** | 10-15 |
| **Update frequency** | Continuous (decisions published as issued) |
| **Machine-readable?** | **Yes** — clean text |

#### OVG Berlin-Brandenburg

| Field | Value |
|---|---|
| **Publisher** | Oberverwaltungsgericht Berlin-Brandenburg |
| **URL** | https://www.berlin.de/gerichte/oberverwaltungsgericht/ |
| **Document types** | Building law judgments, planning law decisions |
| **Estimated relevant documents** | 5-10 (key precedent decisions) |
| **Machine-readable?** | **Yes** — PDFs with text, well-structured |

---

### 1.6 IT and Data Protection

#### BSI — Bundesamt für Sicherheit in der Informationstechnik

| Field | Value |
|---|---|
| **Publisher** | BSI |
| **URL** | https://www.bsi.bund.de |
| **Document types** | IT-Grundschutz, Sicherheitsleitlinien, technische Richtlinien |
| **Estimated relevant documents** | 5-10 |
| **Update frequency** | Annual |
| **Machine-readable?** | **Yes** — clean PDFs |

#### BfDI / Berliner Beauftragte für Datenschutz

| Field | Value |
|---|---|
| **Publisher** | Berliner Beauftragte für Datenschutz und Informationsfreiheit |
| **URL** | https://www.datenschutz-berlin.de |
| **Document types** | Datenschutz-Leitlinien, Orientierungshilfen, Tätigkeitsberichte |
| **Estimated relevant documents** | 5-8 |
| **Update frequency** | Annual |
| **Machine-readable?** | **Yes** |

---

## Part 2 — Prioritized Acquisition Roadmap

### Phase 1A — Minimum Viable Corpus (Week 1-2, 50 documents)

**Goal:** Get 50 German legal documents into the system to validate the pipeline, prove retrieval quality improvement, and measure benchmark score delta.

All P1 documents from the corpus recommendation across the three primary domains.

| Batch | Domain | Count | Examples |
|---|---|---|---|
| 1A.1 | Vergaberecht | 15 | AV §55 LHO, BerlAVG §7, GWB Teil 4 excerpts, VgV core sections, UVgO core sections, Beschaffungsordnung Berlin |
| 1A.2 | Baurecht | 20 | BauO Bln (complete, all sections), BauVorlV 2025, BauGB core excerpts, BauNVO, 2-3 Rundschreiben |
| 1A.3 | Personalrecht | 15 | TV-L core sections, TV-L Entgelttabellen, BRKG core sections, UrlVO Bln, Mobile Arbeit Rahmenvereinbarung |

**Phase 1A exit criteria:**
- 50 documents ingested with ≥ 90% ingestion success rate
- All chunks have embeddings (embedding coverage ≥ 95%)
- Benchmark run shows ≥ 5 previously-failing HYBRID_RETRIEVAL questions now passing
- Citation quality: at least document-title-level citation, preferably §-level via metadata

### Phase 1B — Procedural and Operational Documents (Week 3-4, 100 documents)

| Batch | Domain | Count | Examples |
|---|---|---|---|
| 1B.1 | Vergaberecht | 25 | VOB/A complete, Vergabehandbuch, Vergabevermerk-Muster, EU threshold communications, 5 Vergabekammer decisions |
| 1B.2 | Baurecht | 35 | Ausführungshinweise BauO Bln, Baugenehmigungsformular, Bauantrag-Checkliste, Merkblätter, Rundschreiben, 3 OVG decisions |
| 1B.3 | Personalrecht | 25 | AZVO Bln, LRKG, TV-L §34 Kündigungsfristen, IT-Sicherheitsleitlinie, Dienstvereinbarungen |
| 1B.4 | Cross-domain | 15 | BDSG, IT-Grundschutz, Datenschutz-Leitlinien, Mobile-Arbeit-Ergänzungen, Haushaltsrecht excerpts |

**Phase 1B exit criteria:**
- 150 total documents ingested
- Retrieval precision ≥ 60% for domain-specific queries
- DomainGate acceptance rate ≥ 85%
- Benchmark ≥ 60% overall pass rate

### Phase 1C — Completion (Week 5-6, 100 documents)

| Batch | Domain | Count | Examples |
|---|---|---|---|
| 1C.1 | Vergaberecht | 25 | GWB complete Part 4, additional VgV sections, Rundschreiben, FAQ, Beschaffungshandbuch |
| 1C.2 | Baurecht | 30 | BauNVO complete, MBO, additional OVG decisions, Bürgerinformationen, Formularsammlung |
| 1C.3 | Personalrecht | 25 | TV-L Entgeltordnung complete, TV-L Änderungstarifverträge, Sonderurlaubsregelungen, Personalhandbuch |
| 1C.4 | Umweltrecht | 10 | BerlAVG Umweltkriterien, AV Umwelt, Nachhaltigkeitsleitlinien |
| 1C.5 | Verwaltungsrecht | 10 | VwVfG excerpts, VwGO excerpts, Berlin-specific Verwaltungsvorschriften |

**Phase 1C exit criteria (full Phase 1: ~300 documents):**
- Benchmark ≥ 75% overall pass rate (release gate)
- All 12 HYBRID_RETRIEVAL questions have ≥ 3 relevant chunks in top 10 results
- Ingestion success rate ≥ 95%
- Metadata completeness ≥ 80% across all documents

---

## Part 3 — Corpus Composition

### Domain Distribution (300 documents)

| Domain | Laws | Regulations | Admin Instructions | Manuals/Guides | Forms/Checklists | Circulars | Court Decisions | Templates | Total |
|---|---|---|---|---|---|---|---|---|---|
| **Vergaberecht** | 8 | 12 | 8 | 10 | 6 | 10 | 8 | 3 | **65** |
| **Baurecht** | 6 | 10 | 8 | 8 | 8 | 8 | 6 | 4 | **58** |
| **Personalrecht** | 5 | 8 | 6 | 8 | 4 | 6 | — | 4 | **41** |
| **Haushaltsrecht** | 2 | 4 | 6 | 4 | 2 | 4 | — | 2 | **24** |
| **Verwaltungsrecht** | 4 | 4 | 4 | 4 | 2 | 4 | 2 | 2 | **26** |
| **Umweltrecht** | 2 | 4 | 4 | 4 | 2 | 4 | — | 2 | **22** |
| **Datenschutz** | 3 | 4 | 4 | 4 | 2 | 4 | — | 2 | **23** |
| **IT-Sicherheit** | 1 | 3 | 4 | 4 | 2 | 4 | — | 2 | **20** |
| **Kommunalrecht** | 3 | 4 | 2 | 2 | 2 | 4 | 2 | 2 | **21** |
| **Total** | **34** | **53** | **46** | **48** | **30** | **48** | **18** | **23** | **300** |

### Why Each Document Category Matters

| Category | Retrieval Role | Example Use Case |
|---|---|---|
| **Laws (Gesetze)** | **Authoritative binding rules.** Highest grounding weight. Must be searchable by § number. | "Welche Abstandsflächen sind nach BauO Bln §6 einzuhalten?" |
| **Regulations (Rechtsverordnungen)** | **Implement laws.** Define concrete procedures, thresholds, forms. | "Welche Bauvorlagen benötige ich nach BauVorlV 2025?" |
| **Administrative Instructions (Verwaltungsvorschriften)** | **Bind the administration internally.** AV §55 LHO sets procurement thresholds that the RuleEngine depends on. | "Welches Verfahren bei 8.000€ IT-Auftrag nach AV §55 LHO?" |
| **Manuals/Guides (Handbücher/Leitfäden)** | **Procedural completeness.** Step-by-step instructions for complex processes. | "Wie führe ich eine Beschränkte Ausschreibung durch?" |
| **Forms/Checklists (Formulare/Checklisten)** | **Operational readiness.** Show the user exactly what to fill out. | "Welche Felder muss ich im Bauantrag ausfüllen?" |
| **Circulars (Rundschreiben)** | **Current interpretation.** Clarify how laws apply to specific situations. Often contain the most practical guidance. | "Neues Rundschreiben zu Direktaufträgen nach §55 LHO" |
| **Court Decisions (Urteile/Beschlüsse)** | **Precedent.** Show how laws have been interpreted in real cases. | "OVG Berlin Urteil zur Nutzungsänderung" |
| **Templates (Vorlagen)** | **Productivity.** Pre-filled documents that employees customize. | Vergabevermerk-Vorlage, Bescheid-Vorlage |

---

## Part 4 — Acquisition Strategy

### Phase 1: Manual Collection (Weeks 1-6)

**For the first 300 documents, manual collection is acceptable and recommended.**

Rationale:
1. A human must verify that each downloaded PDF is machine-readable (text layer present, not scanned)
2. A human must assign correct metadata (authority, domain, document type, effective dates)
3. Manual collection surfaces formatting issues early (two-column layouts, missing sections, encoding problems)
4. Automation investment is better directed at pipeline validation than at collection

**Manual collection procedure per document:**
1. Navigate to official source URL
2. Download PDF (and save HTML version if available from gesetze-im-internet)
3. Open PDF, verify text is selectable (has text layer)
4. If scanned image only: mark as "OCR_REQUIRED" and skip for Phase 1
5. Fill in metadata spreadsheet: title, short_name, legal_domain, jurisdiction, authority, doc_type, language, source_url, publication_date, last_amendment_date, version_identifier, priority, file_format
6. Save to `corpus-inbox/` directory with standardized filename: `{domain}_{doc_type}_{short_title}_{version_date}.pdf`
7. Commit to version-controlled corpus repository (separate git repo or S3/GCS bucket)
8. Run `POST /api/documents/upload` with metadata
9. Verify ingestion status in Corpus Health Dashboard
10. Run benchmark and compare to previous run

### Phase 2: Semi-Automated (After 300 documents validated)

**Automate source monitoring but keep human metadata review:**

- Script to check gesetze-im-internet.de RSS/Atom feeds for amendments
- Script to check Berlin legal portal for new versions
- Email notification when a monitored document is updated
- Human reviews the change, downloads the new version, updates metadata

### Phase 3: Full Automation (After 1000+ documents, Version 1.2+)

Not in scope for Version 1.1. Requires:
- Source-specific ingestion agents
- Automatic metadata extraction from document headers
- Scheduled re-check of source URLs for amendments
- CI/CD pipeline for corpus updates

---

## Part 5 — Ingestion Workflow

### Operational Workflow Per Document Batch

```
┌─────────────────────────────────────────────────────────────┐
│                    1. COLLECT (Manual)                       │
│                                                              │
│  Official Source → Download → Verify machine-readability    │
│  → Standardize filename → Fill metadata spreadsheet          │
│  → Commit to corpus repository                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. VALIDATE (Automated)                   │
│                                                              │
│  PRE-FLIGHT script:                                          │
│  → Check PDF is not corrupt (PDFBox can open it)             │
│  → Check PDF has text layer (extracted chars > 0)            │
│  → Check metadata spreadsheet has all required fields        │
│  → Check no duplicate titles or source URLs                  │
│  → Check SHA-256 matches manifest entry                      │
│  → FAIL if any check fails → return to Collection             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    3. IMPORT (Automated)                     │
│                                                              │
│  POST /api/documents/upload with metadata                    │
│  → Creates DocumentEntity (status: DRAFT)                    │
│  → Creates IngestionJobEntity (status: PENDING)              │
│  → DocumentIngestionWorker picks up job                      │
│  → TextExtractionService extracts text (PDFBox)              │
│  → ChunkingStrategy chunks text                              │
│  → EmbeddingProvider generates embeddings                    │
│  → VectorSearchProvider indexes to Qdrant                    │
│  → IngestionJob → COMPLETED, Document → READY                │
│  → FAIL if any stage fails → log, retry                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    4. VERIFY (Automated)                     │
│                                                              │
│  POST-INGESTION script:                                      │
│  → Check DocumentEntity.status == READY                      │
│  → Check chunk count > 0                                     │
│  → Check embedding_reference is present on all chunks        │
│  → Check Qdrant vector count == chunk count                  │
│  → Check chunks are searchable (keyword search returns ≥1)   │
│  → Check CorpusHealthDashboard shows GREEN status            │
│  → FAIL if any check fails → flag for manual investigation   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    5. BENCHMARK (Automated)                  │
│                                                              │
│  Run BenchmarkTest / ReleaseBenchmarkTest:                   │
│  → All 40 questions through full pipeline                    │
│  → Compare with previous benchmark run                       │
│  → Record: pass rate, per-question scores, latency           │
│  → Generate markdown report in target/benchmark-reports/     │
│  → FAIL if pass rate decreased from previous run             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    6. RELEASE (Manual sign-off)              │
│                                                              │
│  → Review benchmark report                                   │
│  → Review Corpus Health Dashboard                            │
│  → Run ReleaseBenchmarkTest                                  │
│  → Verify all release gates (see CORPUS_READINESS_CHECKLIST) │
│  → Generate CORPUS_INVENTORY.md                              │
│  → Generate RELEASE_CORPUS_REPORT.md                         │
│  → Sign off: corpus batch accepted for production            │
└─────────────────────────────────────────────────────────────┘
```

### Automation Boundary

| Step | Phase 1 (300 docs) | Phase 2 (1000 docs) |
|---|---|---|
| **Download from source** | Manual | Semi-automated (script + human review) |
| **Metadata assignment** | Manual (spreadsheet) | Semi-automated (extract headers + human review) |
| **Pre-flight validation** | **Automated** (script) | **Automated** |
| **Import (upload + ingest)** | **Automated** (API call) | **Automated** (bulk API) |
| **Post-ingestion verification** | **Automated** (script) | **Automated** |
| **Benchmark** | **Automated** (test suite) | **Automated** (CI pipeline) |
| **Release sign-off** | Manual | Manual (regulatory requirement) |
