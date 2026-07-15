# Production Corpus Backlog — Version 1.1 → 2.0

**Role:** Knowledge Engineering Lead  
**Date:** 2026-07-14  
**Target:** ~1,000 documents across 8 legal domains  
**Platform:** Municipal Decision Assistant — Berlin administration

---

## Benchmark Gap Summary

12 HYBRID_RETRIEVAL questions currently fail or produce weak answers because the corpus is 23 English-language demo documents with 0 vectors.

| Question | Missing Content | Phase |
|---|---|---|
| PROC-009 | AV §55 LHO (complete text + all appendices) | A |
| SAL-008 | TV-L Entgeltordnung (job title → EG mapping) | A |
| BUILD-001 | BauO Bln §§ 62-64 (German full text) | A |
| BUILD-002 | BauO Bln §6 (Abstandsflächen, German full text) | A |
| BUILD-003 | BauO Bln §61 (Genehmigungsfreie Vorhaben, German full text) | A |
| BUILD-004 | BauVorlV 2025 (complete, all procedure types + document checklists) | A |
| BUILD-005 | BauO Bln §63 (Nutzungsänderung, German full text) | A |
| BUILD-006 | BauO Bln §§ 27-36 (Brandschutz, German full text) | A |
| RETR-001 | BerlAVG §7 + AV Umwelt (environmental criteria full text) | A |
| RETR-002 | Beschaffungsordnung Berlin (Vergabevermerk procedure) | B |
| RETR-003 | VgV §§ 14-17 (electronic deadlines, urgency provisions) | B |
| RETR-004 | TV-L §26 + UrlVO Bln (leave carryover full text) | B |

All 12 questions require German-language legal text that does not exist in the English demo corpus. None require architecture changes.

---

## Chunking Strategy Assessment Per Document Category

Before listing documents, here is the chunking recommendation per document type:

| Document Type | Avg Chars/Page | Est. Chunks/Page | Current Chunker Sufficient? | LegalChunking Needed? | Metadata Extraction Sufficient? |
|---|---|---|---|---|---|
| **Laws (Gesetze)** | ~2,500 | 2-3 | Yes — 1200-char chunks contain 1-2 complete paragraphs | **Yes (v2.1)** — §-level chunks would improve citation precision from "BauO Bln" to "BauO Bln §61 Abs. 2" | Yes — regex extracts § references, dates, authority |
| **Regulations (Rechtsverordnungen)** | ~2,500 | 2-3 | Yes | **Yes (v2.1)** — same reason | Yes |
| **Administrative Regulations (Verwaltungsvorschriften)** | ~2,000 | 1-2 | Yes | Optional — § structure is less rigid; paragraph chunking usually sufficient | Yes |
| **Court Decisions (Urteile)** | ~2,500 | 2-3 | Yes — decisions have natural paragraph structure | Not needed — decisions cite paragraphs, they don't have them | Yes — extracts case number, court, date, legal domains |
| **Manuals/Guides (Handbücher)** | ~1,800 | 1-2 | Yes — natural section structure | Not needed — manuals have headings, not § markers | Partial — extracts document title and domain |
| **Circulars (Rundschreiben)** | ~1,500 | 1-2 | Yes | Not needed | Yes — extracts issuing authority, date, topic |
| **Forms/Templates (Formulare)** | ~800 | 0-1 | Yes — forms are short | Not needed | N/A — forms are structural, not informational |
| **Checklists (Checklisten)** | ~500 | 0-1 | Yes — checklists are short | Not needed | N/A |
| **FAQs** | ~1,200 | 1 | Yes | Not needed | Partial |
| **Collective Agreements (Tarifverträge)** | ~2,500 | 2-3 | Yes — TV-L has § structure similar to laws | **Yes (v2.1)** — TV-L § references matter for HR decisions | Yes |

**Recommendation:** For Phase A + B (~400 documents), the current `SentenceAwareChunkingStrategy` is sufficient. LegalChunkingStrategy is deferred to v2.1 and justified specifically for laws, regulations, and collective agreements — documents with rigid §, Abs., and Satz structure. Forms, checklists, FAQs, and circulars do not benefit from legal chunking.

---

## Phase A — Critical Regulations (~100 documents)

**Goal:** Answer all 12 HYBRID_RETRIEVAL benchmark questions with correct, grounded answers.

**Exit criterion:** Benchmark pass rate ≥ 75% (30/40). All 12 HYBRID_RETRIEVAL questions have ≥ 3 relevant chunks in top 10.

**Estimated total chunks:** ~4,000  
**Estimated total vectors:** ~4,000  
**Estimated ingestion time:** ~3 hours (sequential) / ~45 minutes (parallel)

### A.1 — Vergaberecht / Procurement (25 documents)

| # | Document | Official Source | Pages | Type | Priority | Improves | Effort | Update Freq. | LegalChunk Needed? |
|---|---|---|---|---|---|---|---|---|---|
| A001 | **GWB Teil 4 §§ 97-101** (Grundsätze, Verfahrensarten) | gesetze-im-internet.de | 8 | Gesetz | P1 | PROC-009 context | 30 min | Jährlich | Yes (v2.1) |
| A002 | **GWB §§ 102-114** (Vergabe oberhalb EU-Schwellenwerte) | gesetze-im-internet.de | 12 | Gesetz | P2 | PROC-010 depth | 30 min | Jährlich | Yes (v2.1) |
| A003 | **GWB §§ 115-129** (Nachprüfungsverfahren) | gesetze-im-internet.de | 10 | Gesetz | P3 | Backlog | 30 min | Jährlich | Yes (v2.1) |
| A004 | **GWB §§ 130-184** (Vergabekammer, Rechtsweg) | gesetze-im-internet.de | 15 | Gesetz | P3 | Backlog | 45 min | Jährlich | Yes (v2.1) |
| A005 | **VgV §§ 1-13** (Allgemeine Bestimmungen) | gesetze-im-internet.de | 8 | Verordnung | P1 | RETR-003 context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A006 | **VgV §§ 14-17** (Fristen, elektronische Einreichung) | gesetze-im-internet.de | 5 | Verordnung | P1 | RETR-003 direct | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A007 | **VgV §§ 18-30** (Vergabeverfahren, Eignung) | gesetze-im-internet.de | 10 | Verordnung | P2 | PROC depth | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A008 | **VgV §§ 31-48** (Zuschlag, Aufhebung) | gesetze-im-internet.de | 12 | Verordnung | P2 | PROC depth | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A009 | **VgV §§ 49-81** (Besondere Verfahren, Anhänge) | gesetze-im-internet.de | 20 | Verordnung | P3 | Backlog | 45 min | Alle 2 Jahre | Yes (v2.1) |
| A010 | **UVgO §§ 1-13** (Allgemeine Bestimmungen) | gesetze-im-internet.de | 8 | Verordnung | P1 | PROC-001-008 context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A011 | **UVgO §§ 14-28** (Vergabeverfahren Unterschwelle) | gesetze-im-internet.de | 10 | Verordnung | P1 | PROC-001-008 context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A012 | **UVgO §§ 29-54** (Zuschlag, Aufhebung, Anhänge) | gesetze-im-internet.de | 12 | Verordnung | P2 | PROC depth | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A013 | **VOB/A §1-§3** (Allgemeine Bestimmungen Bau) | gesetze-im-internet.de | 15 | Verordnung | P1 | PROC-004, PROC-011 context | 45 min | Alle 2 Jahre | Yes (v2.1) |
| A014 | **VOB/A §3a** (Ex-Post-Bekanntmachungspflichten) | gesetze-im-internet.de | 3 | Verordnung | P1 | PROC depth | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A015 | **AV zu §55 LHO Berlin** (Wertgrenzen, complete) | berlin.de/sen/finanzen | 20 | Verwaltungsvorschrift | P1 | PROC-001-012 direct | 45 min | Jährlich | Yes (v2.1) |
| A016 | **AV zu §55 LHO — Anlage 1** (Wertgrenzentabelle) | berlin.de/sen/finanzen | 3 | Anlage | P1 | PROC-001-012 direct | 15 min | Jährlich | Not needed |
| A017 | **AV zu §55 LHO — Anlage 2** (Vergabevermerk-Muster) | berlin.de/sen/finanzen | 3 | Anlage | P1 | RETR-002 context | 15 min | Jährlich | Not needed |
| A018 | **AV zu §55 LHO — Anlage 3** (Dokumentationspflichten) | berlin.de/sen/finanzen | 5 | Anlage | P2 | RETR-002 context | 20 min | Jährlich | Not needed |
| A019 | **Berliner Ausschreibungs- und Vergabegesetz (BerlAVG) §§ 1-6** | gesetze.berlin.de | 5 | Gesetz | P1 | RETR-001 context | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A020 | **BerlAVG §7** (Umweltkriterien, complete) | gesetze.berlin.de | 3 | Gesetz | P1 | RETR-001 direct | 15 min | Alle 2 Jahre | Yes (v2.1) |
| A021 | **BerlAVG §§ 8-16** (Soziale Kriterien, Berichtspflichten) | gesetze.berlin.de | 8 | Gesetz | P2 | RETR-001 depth | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A022 | **VOB/A §4-§22** (Vergabeverfahren Bau, complete) | gesetze-im-internet.de | 20 | Verordnung | P2 | PROC-004, PROC-011 | 45 min | Alle 2 Jahre | Yes (v2.1) |
| A023 | **EU-Schwellenwerte 2024/2026** (Mitteilung der EU-Kommission) | eur-lex.europa.eu | 2 | Mitteilung | P2 | PROC-010 depth | 10 min | Alle 2 Jahre | Not needed |
| A024 | **Sektorenverordnung (SektVO) §§ 1-10** (Auszug) | gesetze-im-internet.de | 8 | Verordnung | P3 | Backlog | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A025 | **Vergabestatistikverordnung (VergStatVO)** | gesetze-im-internet.de | 5 | Verordnung | P3 | Backlog | 20 min | Jährlich | Not needed |

### A.2 — Baurecht / Building Law (30 documents)

| # | Document | Official Source | Pages | Type | Priority | Improves | Effort | Update Freq. | LegalChunk Needed? |
|---|---|---|---|---|---|---|---|---|---|
| A026 | **BauO Bln §1-§5** (Allgemeine Vorschriften, Begriffe) | gesetze.berlin.de | 5 | Gesetz | P2 | BUILD context | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A027 | **BauO Bln §6** (Abstandsflächen, complete) | gesetze.berlin.de | 5 | Gesetz | P1 | BUILD-002 direct | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A028 | **BauO Bln §§ 7-26** (Grundstücksbebauung) | gesetze.berlin.de | 15 | Gesetz | P2 | BUILD context | 45 min | Alle 2 Jahre | Yes (v2.1) |
| A029 | **BauO Bln §§ 27-36** (Brandschutz, complete) | gesetze.berlin.de | 15 | Gesetz | P1 | BUILD-006 direct | 45 min | Alle 2 Jahre | Yes (v2.1) |
| A030 | **BauO Bln §§ 37-50** (Bauliche Anlagen, Haustechnik) | gesetze.berlin.de | 12 | Gesetz | P3 | Backlog | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A031 | **BauO Bln §§ 51-60** (Bauprodukte, Bauarten) | gesetze.berlin.de | 10 | Gesetz | P3 | Backlog | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A032 | **BauO Bln §61** (Genehmigungsfreie Vorhaben, complete) | gesetze.berlin.de | 3 | Gesetz | P1 | BUILD-003 direct | 15 min | Alle 2 Jahre | Yes (v2.1) |
| A033 | **BauO Bln §62** (Genehmigungsfreistellung) | gesetze.berlin.de | 3 | Gesetz | P1 | BUILD-001 direct | 15 min | Alle 2 Jahre | Yes (v2.1) |
| A034 | **BauO Bln §63** (Vereinfachtes Verfahren / Nutzungsänderung) | gesetze.berlin.de | 5 | Gesetz | P1 | BUILD-001, BUILD-005 direct | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A035 | **BauO Bln §64** (Volles Baugenehmigungsverfahren) | gesetze.berlin.de | 5 | Gesetz | P1 | BUILD-001 direct | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A036 | **BauO Bln §§ 65-72** (Bauaufsicht, Verfahren) | gesetze.berlin.de | 10 | Gesetz | P2 | BUILD context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A037 | **BauO Bln §72a** (Typengenehmigung) | gesetze.berlin.de | 3 | Gesetz | P2 | BUILD context | 15 min | Alle 2 Jahre | Yes (v2.1) |
| A038 | **BauO Bln §§ 73-89** (Schlussvorschriften) | gesetze.berlin.de | 10 | Gesetz | P3 | Backlog | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A039 | **BauVorlV 2025 §1** (Verfahrensarten, Übersicht 11 Typen) | gesetze.berlin.de | 3 | Verordnung | P1 | BUILD-004 direct | 15 min | Alle 3 Jahre | Yes (v2.1) |
| A040 | **BauVorlV 2025 §2** (Elektronische Einreichung) | gesetze.berlin.de | 2 | Verordnung | P1 | BUILD-004 direct | 10 min | Alle 3 Jahre | Yes (v2.1) |
| A041 | **BauVorlV 2025 §§ 3-6** (Erforderliche Unterlagen nach Verfahren) | gesetze.berlin.de | 8 | Verordnung | P1 | BUILD-004 direct | 30 min | Alle 3 Jahre | Yes (v2.1) |
| A042 | **BauVorlV 2025 §7** (Qualifizierter Freiflächenplan) | gesetze.berlin.de | 3 | Verordnung | P2 | BUILD-004 depth | 15 min | Alle 3 Jahre | Yes (v2.1) |
| A043 | **BauVorlV 2025 §§ 8-15** (Typengenehmigung, Schlussvorschriften) | gesetze.berlin.de | 8 | Verordnung | P2 | BUILD context | 30 min | Alle 3 Jahre | Yes (v2.1) |
| A044 | **BauGB §§ 1-13** (Bauleitplanung, Allgemeines) | gesetze-im-internet.de | 15 | Gesetz | P2 | BUILD context | 45 min | Jährlich | Yes (v2.1) |
| A045 | **BauGB §§ 29-38** (Zulässigkeit von Vorhaben) | gesetze-im-internet.de | 12 | Gesetz | P2 | BUILD context | 30 min | Jährlich | Yes (v2.1) |
| A046 | **Schneller-Bauen-Gesetz Berlin 2024** (Artikel 1-10, Auszug) | gesetze.berlin.de | 12 | Gesetz | P1 | BUILD-001 depth | 30 min | Einmalig | Yes (v2.1) |
| A047 | **BauNVO §§ 1-8** (Art der baulichen Nutzung) | gesetze-im-internet.de | 10 | Verordnung | P2 | BUILD context | 30 min | Selten | Yes (v2.1) |
| A048 | **BauNVO §§ 9-15** (Maß der baulichen Nutzung) | gesetze-im-internet.de | 8 | Verordnung | P2 | BUILD context | 30 min | Selten | Yes (v2.1) |
| A049 | **BauNVO §§ 16-21a** (Bauweise, überbaubare Fläche) | gesetze-im-internet.de | 8 | Verordnung | P3 | Backlog | 30 min | Selten | Yes (v2.1) |
| A050 | **BauNVO §§ 22-26a** (Stellplätze, Garagen, Gemeinschaftsanlagen) | gesetze-im-internet.de | 8 | Verordnung | P3 | Backlog | 30 min | Selten | Yes (v2.1) |
| A051 | **MBO (Musterbauordnung) Gebäudeklassen GK 1-5** | is-argebau.de | 5 | Musterverordnung | P2 | BUILD-006 depth | 20 min | Selten | Yes (v2.1) |
| A052 | **Berliner Baugebührenordnung (BauGebO)** | gesetze.berlin.de | 8 | Verordnung | P3 | Backlog | 30 min | Alle 3 Jahre | Yes (v2.1) |
| A053 | **BauO Bln Ausführungshinweise — Brandschutz** | berlin.de/sen/sbw | 25 | Ausführungshinweis | P2 | BUILD-006 depth | 60 min | Alle 3 Jahre | Not needed |
| A054 | **BauO Bln Ausführungshinweise — Abstandsflächen** | berlin.de/sen/sbw | 10 | Ausführungshinweis | P2 | BUILD-002 depth | 30 min | Alle 3 Jahre | Not needed |
| A055 | **BauO Bln Ausführungshinweise — Genehmigungsverfahren** | berlin.de/sen/sbw | 15 | Ausführungshinweis | P2 | BUILD-001 depth | 45 min | Alle 3 Jahre | Not needed |

### A.3 — Personalrecht / HR (25 documents)

| # | Document | Official Source | Pages | Type | Priority | Improves | Effort | Update Freq. | LegalChunk Needed? |
|---|---|---|---|---|---|---|---|---|---|
| A056 | **TV-L §§ 1-14** (Allgemeine Vorschriften, Arbeitsvertrag) | tdl-online.de | 10 | Tarifvertrag | P2 | SAL, RETR-004 context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A057 | **TV-L §§ 15-25** (Arbeitszeit, Überstunden, Teilzeit) | tdl-online.de | 12 | Tarifvertrag | P2 | Backlog | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A058 | **TV-L §26** (Urlaub, complete) | tdl-online.de | 5 | Tarifvertrag | P1 | RETR-004 direct | 20 min | Alle 2 Jahre | Yes (v2.1) |
| A059 | **TV-L §§ 27-33** (Entgeltfortzahlung, Krankheit) | tdl-online.de | 10 | Tarifvertrag | P3 | Backlog | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A060 | **TV-L §34** (Kündigungsfristen, complete Tabelle) | tdl-online.de | 3 | Tarifvertrag | P2 | HR | 15 min | Alle 2 Jahre | Yes (v2.1) |
| A061 | **TV-L §§ 35-42** (Schlussvorschriften) | tdl-online.de | 8 | Tarifvertrag | P3 | Backlog | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A062 | **TV-L Entgeltordnung** (Eingruppierungskatalog, complete) | tdl-online.de | 50 | Tarifvertrag | P1 | SAL-008 direct | 90 min | Alle 3 Jahre | Yes (v2.1) |
| A063 | **TV-L Entgelttabellen 2025** (vollständig, alle EG 1-15, alle Stufen) | tdl-online.de | 15 | Tarifvertrag | P1 | SAL-001-007 context | 30 min | Jährlich | Not needed |
| A064 | **TV-L Änderungstarifvertrag 2025** (Gehaltsrunde) | tdl-online.de | 10 | Tarifvertrag | P1 | SAL-005 context | 30 min | Jährlich | Yes (v2.1) |
| A065 | **TV-L Überleitungstarifvertrag** (Besitzstandswahrung) | tdl-online.de | 5 | Tarifvertrag | P3 | Backlog | 20 min | Einmalig | Yes (v2.1) |
| A066 | **BRKG §§ 1-7** (Allgemeine Vorschriften, Tagegeld Inland) | gesetze-im-internet.de | 8 | Gesetz | P1 | TRAV-001-005 context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A067 | **BRKG §§ 8-15** (Übernachtung, Fahrkosten, Ausland) | gesetze-im-internet.de | 10 | Gesetz | P1 | TRAV-004-010 context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A068 | **BRKG §§ 16-23** (Abrechnung, Fristen, Schlussvorschriften) | gesetze-im-internet.de | 8 | Gesetz | P2 | TRAV context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A069 | **BRKG Auslandsreisekostentabelle 2025** | gesetze-im-internet.de | 5 | Tabelle | P2 | TRAV-006 depth | 15 min | Jährlich | Not needed |
| A070 | **UrlVO Bln §§ 1-10** (Erholungsurlaub, Übertragung) | gesetze.berlin.de | 8 | Verordnung | P2 | RETR-004 depth | 30 min | Selten | Yes (v2.1) |
| A071 | **UrlVO Bln §§ 11-20** (Sonderurlaub, Katalog) | gesetze.berlin.de | 8 | Verordnung | P2 | RETR-004 depth | 30 min | Selten | Yes (v2.1) |
| A072 | **UrlVO Bln §§ 21-28** (Schlussvorschriften, Übergangsregelungen) | gesetze.berlin.de | 5 | Verordnung | P3 | Backlog | 20 min | Selten | Yes (v2.1) |
| A073 | **AZVO Bln §§ 1-14** (Arbeitszeit, Gleitzeit, Kernzeit) | gesetze.berlin.de | 8 | Verordnung | P3 | Backlog | 30 min | Selten | Yes (v2.1) |
| A074 | **AZVO Bln §§ 15-28** (Teilzeit, Überstunden, Pausen) | gesetze.berlin.de | 8 | Verordnung | P3 | Backlog | 30 min | Selten | Yes (v2.1) |
| A075 | **LRKG Berlin §§ 1-10** (Landesreisekosten, Allgemeines) | gesetze.berlin.de | 8 | Gesetz | P2 | TRAV context (Berlin-specific) | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A076 | **LRKG Berlin §§ 11-23** (Tagegeld, Übernachtung, Fahrkosten) | gesetze.berlin.de | 10 | Gesetz | P2 | TRAV context | 30 min | Alle 2 Jahre | Yes (v2.1) |
| A077 | **Mobile Arbeit Rahmenvereinbarung Berlin** (complete) | berlin.de/sen/inneres | 8 | Dienstvereinbarung | P2 | HR | 30 min | Alle 3 Jahre | Not needed |
| A078 | **Arbeitszeitgesetz (ArbZG) §§ 1-15** | gesetze-im-internet.de | 8 | Gesetz | P2 | HR context | 30 min | Selten | Yes (v2.1) |
| A079 | **Teilzeit- und Befristungsgesetz (TzBfG) §§ 1-13** | gesetze-im-internet.de | 8 | Gesetz | P3 | Backlog | 30 min | Selten | Yes (v2.1) |
| A080 | **Bundeselterngeld- und Elternzeitgesetz (BEEG) Auszug** | gesetze-im-internet.de | 10 | Gesetz | P3 | Backlog | 30 min | Selten | Yes (v2.1) |

### A.4 — Operative Dokumente Vergabe / Procurement Operations (20 documents)

| # | Document | Official Source | Pages | Type | Priority | Improves | Effort | Update Freq. | LegalChunk Needed? |
|---|---|---|---|---|---|---|---|---|---|
| A081 | **Beschaffungsordnung Berlin §§ 1-10** (Interne Beschaffung) | berlin.de/sen/finanzen | 10 | Verwaltungsvorschrift | P1 | RETR-002 direct | 30 min | Jährlich | Not needed |
| A082 | **Beschaffungsordnung Berlin §§ 11-20** (Dokumentation, Vergabevermerk) | berlin.de/sen/finanzen | 10 | Verwaltungsvorschrift | P1 | RETR-002 direct | 30 min | Jährlich | Not needed |
| A083 | **Vergabehandbuch Berlin — Kapitel 1** (Grundlagen) | berlin.de/sen/finanzen | 15 | Handbuch | P2 | PROC, RETR context | 45 min | Alle 3 Jahre | Not needed |
| A084 | **Vergabehandbuch Berlin — Kapitel 2** (Vergabeverfahren im Detail) | berlin.de/sen/finanzen | 20 | Handbuch | P2 | PROC context | 45 min | Alle 3 Jahre | Not needed |
| A085 | **Vergabehandbuch Berlin — Kapitel 3** (Dokumentation) | berlin.de/sen/finanzen | 15 | Handbuch | P2 | RETR-002 depth | 45 min | Alle 3 Jahre | Not needed |
| A086 | **Vergabehandbuch Berlin — Kapitel 4** (Vertragsmanagement) | berlin.de/sen/finanzen | 15 | Handbuch | P3 | Backlog | 45 min | Alle 3 Jahre | Not needed |
| A087 | **eVergabe Plattform Berlin — Benutzerhandbuch** | vergabe-plattform.berlin.de | 20 | Handbuch | P2 | PROC context | 45 min | Jährlich | Not needed |
| A088 | **Rundschreiben SenFin 01/2025** (Direktaufträge — aktuelle Auslegung) | berlin.de/sen/finanzen | 5 | Rundschreiben | P2 | PROC-001-008 depth | 20 min | Ad-hoc | Not needed |
| A089 | **Rundschreiben SenFin 02/2025** (Beschränkte Ausschreibung — aktuelle Praxis) | berlin.de/sen/finanzen | 5 | Rundschreiben | P2 | PROC depth | 20 min | Ad-hoc | Not needed |
| A090 | **Rundschreiben SenFin 03/2025** (Vergabevermerk — Muster und Erläuterungen) | berlin.de/sen/finanzen | 8 | Rundschreiben | P2 | RETR-002 depth | 30 min | Ad-hoc | Not needed |
| A091 | **AV Umwelt — Nachhaltige Beschaffung Berlin** (complete) | berlin.de/sen/finanzen | 10 | Verwaltungsvorschrift | P1 | RETR-001 depth | 30 min | Alle 3 Jahre | Not needed |
| A092 | **Leitfaden Nachhaltige Beschaffung Berlin** | berlin.de/sen/finanzen | 15 | Leitfaden | P2 | RETR-001 depth | 45 min | Alle 3 Jahre | Not needed |
| A093 | **Vergabevermerk-Vorlage — Direktauftrag** (official template) | berlin.de/sen/finanzen | 2 | Vorlage | P2 | RETR-002 context | 10 min | Selten | Not needed |
| A094 | **Vergabevermerk-Vorlage — Beschränkte Ausschreibung** (official template) | berlin.de/sen/finanzen | 2 | Vorlage | P2 | RETR-002 context | 10 min | Selten | Not needed |
| A095 | **Vergabevermerk-Vorlage — Öffentliche Ausschreibung** (official template) | berlin.de/sen/finanzen | 3 | Vorlage | P2 | RETR-002 context | 10 min | Selten | Not needed |
| A096 | **Angebotsvergleich-Vorlage** (official template) | berlin.de/sen/finanzen | 2 | Vorlage | P3 | Backlog | 10 min | Selten | Not needed |
| A097 | **Checkliste Direktauftrag** | berlin.de/sen/finanzen | 2 | Checkliste | P2 | PROC-001 context | 10 min | Jährlich | Not needed |
| A098 | **Checkliste Beschränkte Ausschreibung** | berlin.de/sen/finanzen | 2 | Checkliste | P2 | PROC-002 context | 10 min | Jährlich | Not needed |
| A099 | **Checkliste Öffentliche Ausschreibung** | berlin.de/sen/finanzen | 2 | Checkliste | P2 | PROC context | 10 min | Jährlich | Not needed |
| A100 | **FAQ — Häufige Fragen zur Vergabe in Berlin** | berlin.de/sen/finanzen | 10 | FAQ | P3 | Backlog | 30 min | Jährlich | Not needed |

---

## Phase B — Operational & Procedural Documents (~300 documents)

**Goal:** Provide operational depth — implementation guidance, manuals, forms for all domains. Deepen answers beyond the minimum benchmark.

**Exit criterion:** All 12 HYBRID_RETRIEVAL questions produce detailed, procedurally complete answers. Benchmark questions that previously answered "what procedure" now answer "what procedure AND what forms AND what deadlines AND what to check."

**Estimated total chunks:** ~12,000 (Phase A 4,000 + Phase B 8,000)  
**Estimated total vectors:** ~12,000  
**Estimated ingestion time:** ~9 hours (sequential) / ~2 hours (parallel)

### B.1 — Building Operations (80 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Baugenehmigungsformulare** (official forms, all procedure types) | 15 | Bauantrag, Vorbescheid, Teilbaugenehmigung, Nutzungsänderung, Abbruch, Werbeanlage, Grundstücksteilung, Baulast, Abgeschlossenheitsbescheinigung, Brandschutznachweis, Standsicherheitsnachweis, Schallschutznachweis, Wärmeschutznachweis, Entwässerungsplan, Freiflächenplan | P2 |
| **Bau-Checklisten** (per procedure type) | 10 | Bauantrag Einfamilienhaus, Bauantrag Mehrfamilienhaus, Bauantrag Gewerbe, Vorbescheid, Nutzungsänderung, Abbruchantrag, vereinfachtes Verfahren, Genehmigungsfreistellung, Typengenehmigung, Bauantrag Sonderbau | P2 |
| **Bau-Rundschreiben** (current guidance) | 15 | Rundschreiben Brandschutz, Rundschreiben Abstandsflächen, Rundschreiben Barrierefreiheit, Rundschreiben Stellplätze, Rundschreiben Fahrradabstellplätze, Rundschreiben Spielplätze, Rundschreiben Dachgeschossausbau, Rundschreiben Aufstockung, Rundschreiben energetische Sanierung, Rundschreiben Denkmalschutz, Rundschreiben Werbeanlagen, Rundschreiben Photovoltaik, Rundschreiben Wärmepumpen, Rundschreiben Gründach, Rundschreiben Regenwassermanagement | P2 |
| **Bau-Leitfäden** (implementation guides) | 10 | Leitfaden Bauantragstellung, Leitfaden Genehmigungsfreie Vorhaben, Leitfaden Brandschutz im Wohnungsbau, Leitfaden Barrierefreies Bauen, Leitfaden Stellplatzsatzung, Leitfaden Denkmalschutz und Bauen, Leitfaden energetische Gebäudesanierung, Leitfaden Dachausbau, Leitfaden Bauen im Bestand, Leitfaden Nachverdichtung | P2 |
| **Merkblätter / Bürgerinformationen** | 15 | Bauen in Berlin — Ein Leitfaden für Bauherren, Abstandsflächen leicht erklärt, Brandschutz für Einfamilienhäuser, Genehmigungsfreie Vorhaben — Was ist erlaubt?, Carport und Garage — Was gilt?, Terrasse und Balkon — Genehmigung erforderlich?, Wintergarten — Baurechtliche Grundlagen, Gartenhaus und Geräteschuppen, Einfriedungen und Zäune, Dachgauben und Dachfenster, Solaranlagen auf dem Dach, Wärmepumpe im Garten, Fahrradabstellplätze — Pflichten, Regenwassernutzung und Versickerung, Baumschutz und Bauen | P2 |
| **Bebauungspläne (Bezirk Spandau, exemplarisch)** | 15 | 5-10 exemplarische Bebauungspläne mit Festsetzungen, Begründungen, Umweltberichten | P3 |

### B.2 — Procurement Operations (80 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Vergabe-Checklisten** (per procedure) | 10 | Direktauftrag Lieferung/Dienstleistung, Direktauftrag Bau, Beschränkte Ausschreibung, Öffentliche Ausschreibung, EU-weite Ausschreibung, Verhandlungsvergabe, Rahmenvertrag, Wettbewerblicher Dialog, Innovationspartnerschaft, eVergabe-Prozess | P2 |
| **Vergabe-Musterdokumente** | 15 | Vergabevermerk (vollständig, 5 Varianten), Angebotsaufforderung, Leistungsbeschreibung (Muster), Bewertungsmatrix, Bieterfragen-Protokoll, Aufklärungsgespräch-Protokoll, Absageschreiben, Zuschlagsschreiben, Vorinformation, Ex-Post-Bekanntmachung, Vergabeakte-Deckblatt, Angebotsöffnungs-Protokoll, Nachforderungs-E-Mail, Rüge-Antwort, Dokumentations-Checkliste | P2 |
| **Rundschreiben Senatsverwaltung für Finanzen** (2018-2026) | 15 | Alle Rundschreiben zu: Wertgrenzen, Direktaufträge, Beschränkte Ausschreibung, eVergabe-Pflicht, Ex-Post-Bekanntmachung, Eignungskriterien, Zuschlagskriterien, Nachhaltige Beschaffung, Soziale Kriterien, Tariftreue, Mindestlohn, ILO-Kernarbeitsnormen, Frauenförderung, Ausbildungsbetriebe, Inklusionsbetriebe | P2 |
| **EU-Vergabe-Leitfäden** | 10 | Leitfaden EU-Schwellenwerte, Leitfaden Grenzüberschreitendes Interesse, Leitfaden Bekanntmachungsmuster, Leitfaden Elektronische Kommunikation, Leitfaden Rahmenvereinbarungen, Leitfaden Dynamische Beschaffungssysteme, Leitfaden Eignungsleihe, Leitfaden Bietergemeinschaften, Leitfaden Unteraufträge, Leitfaden Außergewöhnlich niedrige Angebote | P2 |
| **Nachhaltige Beschaffung** | 15 | Leitfaden Umweltkriterien IT, Leitfaden Umweltkriterien Fahrzeuge, Leitfaden Umweltkriterien Gebäudereinigung, Leitfaden Umweltkriterien Büromaterial, Leitfaden Umweltkriterien Textilien, Leitfaden Umweltkriterien Lebensmittel/Catering, Leitfaden Umweltkriterien Möbel, Leitfaden Umweltkriterien Veranstaltungen, Leitfaden Faire Beschaffung, Leitfaden Bio-Lebensmittel, Leitfaden Recyclingpapier, Leitfaden Energieeffiziente Produkte, Leitfaden Blauer Engel, Leitfaden EU-Ecolabel, Leitfaden CO2-Schattenpreis | P3 |
| **eVergabe-Plattform Berlin** | 15 | Benutzerhandbuch (vollständig), Registrierungsleitfaden, Bieterleitfaden, Vergabestellen-Leitfaden, FAQ, Fehlerbehebung, Formular-Bibliothek, Bekanntmachungs-Assistent, Angebots-Assistent, Rahmenvertrags-Assistent, Vertragskataster, Lieferantenverwaltung, Berichtswesen, Compliance-Prüfung, Schnittstellen-Dokumentation | P3 |

### B.3 — HR Operations (70 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Personalhandbuch Berlin** (Kapitel) | 15 | Einstellung, Arbeitsvertrag, Probezeit, Arbeitszeit, Gleitzeit, Teilzeit, Beurlaubung, Urlaub, Krankmeldung, Nebentätigkeit, Dienstreise, Fortbildung, Disziplinarrecht, Personalakte, Datenschutz Personal | P2 |
| **Dienstvereinbarungen (exemplarisch)** | 15 | Gleitzeit, Mobile Arbeit, Homeoffice, Arbeitszeiterfassung, Raumbuchung, IT-Nutzung, Social Media, Diensthandy, Fahrzeugnutzung, Fortbildungsbudget, Gesundheitsmanagement, Suchtprävention, Mobbing-Prävention, Diversität, Inklusion | P2 |
| **IT-Sicherheit / IT-Verwaltung** | 15 | IT-Sicherheitsleitlinie Berlin (complete), IT-Grundschutz BSI Baustein "Kommune", IT-Notfallhandbuch, Passwort-Richtlinie, E-Mail-Richtlinie, Internet-Nutzungsrichtlinie, Mobile-Device-Richtlinie, Homeoffice-IT-Checkliste, Datensicherungsrichtlinie, Löschkonzept, Berechtigungskonzept, IT-Beschaffungsrichtlinie, Software-Zulassungsliste, IT-Asset-Management, Incident-Response-Plan | P3 |
| **Dienstreise-Handbuch** | 10 | Reisekostenabrechnung Inland, Reisekostenabrechnung Ausland, Kilometerpauschale-Leitfaden, Übernachtungs-Leitfaden, Dienstreisegenehmigung-Prozess, Rahmenreisekostenerstattung, Trennungsgeld bei Versetzung, Umzugskosten, Dienstreiseversicherung, Reisebuchungsportal-Leitfaden | P2 |
| **TV-L Kommentierung (Auszug)** | 15 | Eingruppierung, Stufenzuordnung, Höhergruppierung, Herabgruppierung, Bewährungsaufstieg, Leistungsentgelt, Jahressonderzahlung, vermögenswirksame Leistungen, Altersvorsorge, Jubiläumszuwendung, Sterbegeld, Abfindung, Ausschlussfrist, Geltungsbereich, Überleitung | P3 |

### B.4 — Cross-Domain (70 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Datenschutz** | 20 | BDSG (complete), Berliner Datenschutzgesetz (BlnDSG, complete), DSGVO (EU 2016/679) Auszug, Datenschutz-Folgenabschätzung (Vorlage), Auftragsverarbeitungsvertrag (Muster), Datenschutz-Verzeichnis von Verarbeitungstätigkeiten, Einwilligungserklärung (Muster), Auskunftsersuchen (Muster), Datenpanne-Meldeformular, Löschfristen-Übersicht, Datenschutz-Schulungsunterlagen, Datenschutz bei Homeoffice, Datenschutz bei Videoüberwachung, Datenschutz bei Bewerbungsverfahren, Datenschutz bei Dienstreisen, Datenschutz im Gesundheitsmanagement, Datenschutz bei Social Media, Datenschutz-Folgenabschätzung IT-Verfahren, Pseudonymisierungskonzept, Datenschutz-Checkliste neue Verfahren | P3 |
| **Haushaltsrecht** | 15 | LHO Berlin (complete), AV zu §7 LHO (Wirtschaftlichkeit), AV zu §9 LHO (Haushaltsvermerke), AV zu §34 LHO (Verpflichtungsermächtigungen), AV zu §55 LHO (Vergabe — bereits in A), AV zu §63 LHO (Zuwendungen), Haushaltsplan Berlin 2024/2025 (Auszug Einzelplan), Budgetierungsrichtlinien, Mittelabfluss-Controlling, Rückstellungen-Leitfaden, Anlagenbuchhaltung, Abschreibungsrichtlinien, Kassenordnung Berlin | P3 |
| **Verwaltungsverfahrensrecht** | 15 | VwVfG §§ 1-34 (Verwaltungsakt, Anhörung, Begründung), VwVfG §§ 35-53 (Nebenbestimmungen, Fristen, Wiedereinsetzung), VwGO Auszug (Klagearten, Vorverfahren), Berliner VwVfG (Abweichungen), Zustellungsgesetz (Auszug), Akteneinsichtsrecht (Leitfaden), Anhörungsverfahren (Leitfaden), Widerspruchsverfahren (Leitfaden), Gebührenordnung, Fristenberechnung (Leitfaden), Unterschriftenregelung, elektronische Akte, Schriftformerfordernis, Bekanntgabevorschriften, Ermessensausübung | P3 |
| **Kommunalrecht Berlin** | 10 | Bezirksverwaltungsgesetz (BezVG), GO Berlin (Auszug Gemeindeordnung), Allgemeines Zuständigkeitsgesetz (AZG), Zuständigkeitskatalog Ordnungsaufgaben, Bezirkshaushaltsrecht, Bürgerbeteiligungssatzung, Einwohnerantrag (Leitfaden), Bürgerbegehren (Leitfaden), Bezirksverordnetenversammlung (Geschäftsordnung), Ausschuss-Arbeit (Leitfaden) | P3 |
| **Antikorruption / Compliance** | 10 | Antikorruptionsrichtlinie Berlin, Verhaltenskodex öffentlicher Dienst, Sponsoring-Richtlinie, Annahme von Geschenken (Richtlinie), Nebentätigkeitsrichtlinie, Korruptionsprävention (Schulungsmaterial), Compliance-Meldeverfahren (Hinweisgeberschutzgesetz), Interessenkollision (Leitfaden), Befangenheit (Leitfaden), Vergabestrafrecht (GWB, StGB §§ 298-299) | P3 |

---

## Phase C — Supplementary & Historical (~600 documents)

**Goal:** Complete the corpus with court decisions, historical versions, explanatory memoranda, and specialized materials. Transform the platform from a regulation lookup tool into a comprehensive municipal decision support system.

**Exit criterion:** Platform can answer not just "what is the regulation" but "how has this been interpreted in practice" and "what was the regulation at the time of the case."

**Estimated total chunks:** ~24,000 (Phase A 4,000 + Phase B 8,000 + Phase C 12,000)  
**Estimated total vectors:** ~24,000  
**Estimated ingestion time:** ~18 hours (sequential) / ~4 hours (parallel)

### C.1 — Court Decisions / Rechtsprechung (150 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Vergabekammer Berlin — Leitsatzentscheidungen** (2018-2026) | 30 | Entscheidungen zu: Direktauftragswertgrenzen, Beschränkte Ausschreibung ohne Wettbewerb, Angebotswertung, Ausschlussgründe, Eignungsleihe, Nachforderung, Rügeobliegenheit, Vergabevermerk-Mängel, Dokumentationspflichtverletzung, ungewöhnlich niedriges Angebot, Intransparente Zuschlagskriterien, Produktvorgabe, Gleichbehandlungsverstoß, fehlende Ex-Post-Bekanntmachung, de-facto-Vergabe, Rahmenvereinbarungsmissbrauch, Losaufteilungspflicht, Interimsvergabe, Aufhebungsgründe, Eilantrag, Akteneinsicht, Kostenentscheidung, Rechtsschutz unterhalb Schwellenwerte, Unterschwellenvergabe, nachträgliche Angebotsänderung, fehlende Vergleichsangebote, BIeterfragenbehandlung, unzureichende Leistungsbeschreibung, Befangenheit des Vergabeprüfers, Vorbefassung | P3 |
| **Vergabekammer des Bundes** (Leitsatzentscheidungen) | 15 | EU-Schwellenwerte, grenzüberschreitendes Interesse, vergabefremde Kriterien, Tariftreueerklärung, Rügefrist §160 GWB, Nachprüfungsantrag, Akteneinsicht Bund, Rahmenvereinbarungen Bund, dynamische Beschaffungssysteme, wettbewerblicher Dialog, Innovationspartnerschaft, nicht offenes Verfahren, Verhandlungsverfahren EU, Sektorenvergabe, Konzessionsvergabe | P3 |
| **OVG Berlin-Brandenburg — Baurecht** (Leitsatzentscheidungen) | 30 | Entscheidungen zu: Abstandsflächen, Genehmigungsfreie Vorhaben, Nutzungsänderung, Brandschutz, Stellplatzpflicht, Gebietsverträglichkeit, Nachbarschutz, Drittwiderspruch, Bauvorbescheid, Denkmalschutz, Gebot der Rücksichtnahme, Einfügungsgebot, Bebauungsplan-Auslegung, Befreiung, Abweichung, Vorbescheid-Bindungswirkung, Baulast, Erschließung, Teilbaugenehmigung, Baueinstellung, Nutzungsuntersagung, Beseitigungsverfügung, Bauordnungsverfügung, Rechtsschutz Bauherr, Rechtsschutz Nachbar | P3 |
| **VG Berlin — Verwaltungsrecht** (Leitsatzentscheidungen) | 20 | Personalrecht, Beamtenrecht, Disziplinarrecht, Datenschutz, Informationsfreiheit, Akteneinsicht, Gebühren, Widerspruchsverfahren, Zuständigkeit, Ermessensfehler | P3 |
| **BVerwG — Bundesverwaltungsgericht** (Leitsatzentscheidungen, ausgewählte) | 15 | Bauplanungsrecht, Bauordnungsrecht, Abstandsflächen, Nachbarschutz, Gebietserhaltungsanspruch, Planerhaltung, UVP-Pflicht, Öffentlichkeitsbeteiligung, Zielabweichungsverfahren, Raumordnungsverfahren, Infrastrukturplanung, Einzelhandelssteuerung, Vergnügungsstätten, Windenergie, Mobilfunk | P3 |
| **EuGH — EU-Recht** (ausgewählte für Vergaberecht) | 10 | Vergaberichtlinien-Auslegung, Inhouse-Vergabe, Interkommunale Zusammenarbeit, Rahmenvereinbarungen, Wesentliche Vertragsänderung, Eignungsleihe, Ausschlussgründe, Zuschlagskriterien-Transparenz, Auftragswertberechnung, Schwellenwertumgehung | P3 |
| **BGH — Vergaberecht** (ausgewählte) | 5 | Schadensersatz Vergaberecht, Vorabentscheidungsersuchen, Rechtsschutz Primärrechtsschutz, Sekundärrechtsschutz, Amtshaftung | P3 |
| **Arbeitsgericht Berlin — Personalrecht** (Leitsatzentscheidungen) | 10 | Eingruppierung TV-L, Stufenzuordnung, Urlaubsübertragung, Kündigungsschutz, Befristung, Teilzeitanspruch, Mobile-Arbeit-Anspruch, Eingruppierung Verwaltungsfachwirt, Arbeitszeiterfassung | P3 |
| **Datenschutz — BfDI / Berliner Beauftragte** (Entscheidungen, Tätigkeitsberichte) | 15 | Datenschutzverstoß, Auskunftsanspruch, Löschungsanspruch, Beschäftigtendatenschutz, Videoüberwachung, Auftragsverarbeitung, Datenschutz-Folgenabschätzung, Meldepflichtverletzung, Bußgeld DSGVO, kommunale Datenverarbeitung | P3 |

### C.2 — Gesetzesbegründungen / Explanatory Memoranda (50 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Bundestags-Drucksachen (BT-Drs.)** | 25 | Begründung GWB-Reform 2024, Begründung VgV 2016, Begründung UVgO 2017, Begründung BRKG 2024, Begründung ArbZG, Begründung BDSG 2018, Begründung BauGB-Novelle, Begründung BauNVO-Änderung, Begründung VwVfG-Änderung, Begründung HinSchG 2023 | P3 |
| **Abgeordnetenhaus Berlin — Drucksachen** | 25 | Begründung BauO Bln Novelle, Begründung Schneller-Bauen-Gesetz, Begründung BerlAVG, Begründung UrlVO Bln, Begründung LRKG, Begründung AZVO, Begründung Beschaffungsordnung, Begründung IT-Sicherheitsleitlinie, Begründung Mobile Arbeit, Begründung Bezirksverwaltungsreform | P3 |

### C.3 — Historical Versions (120 documents)

For each major law that changes frequently, maintain the last 2-3 historical versions:

| Document | Versions to Retain | Pages Each |
|---|---|---|
| AV zu §55 LHO Berlin | 2018, 2021, 2024, 2025 (current) | ~20 × 4 |
| BauO Bln | 2018, 2023, 2025 (current) | ~40 × 3 |
| BauVorlV | 2017 (BauVerfV), 2025 (current) | ~15 × 2 |
| TV-L | 2023, 2025 (current) | ~40 × 2 |
| BRKG | 2020, 2024, 2025 (current) | ~20 × 3 |
| VgV | 2019, 2023, 2025 (current) | ~25 × 3 |
| UVgO | 2017, 2022, 2025 (current) | ~15 × 3 |
| BerlAVG | 2018, 2023, 2025 (current) | ~10 × 3 |
| Beschaffungsordnung Berlin | 2020, 2024 (current) | ~20 × 2 |
| TV-L Entgeltordnung | 2023, 2025 (current) | ~50 × 2 |
| EU-Schwellenwerte | 2018-2019, 2020-2021, 2022-2023, 2024-2025 (current) | ~2 × 4 |
| VOB/A | 2019, 2022, 2025 (current) | ~20 × 3 |
| UrlVO Bln | 2015, 2020 (current) | ~20 × 2 |
| LRKG | 2018, 2023 (current) | ~15 × 2 |

**Total historical: ~120 documents, ~2,000 pages**

### C.4 — Specialized Domains (80 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Vergaberecht Spezial** | 15 | VOL/A (ausgewählte Abschnitte), HOAI (Honorarordnung, Auszug), Konzessionsvergabeverordnung (KonzVgV), Vergabeverordnung Verteidigung (VSVgV), Unterschwellenvergabeordnung Bau (UVgO Bau), Kommunale Vergabe-Grundsätze NRW (Vergleich), Immobilienbeschaffung, Beschaffung von Sozialdienstleistungen, Reinigungsleistungen-Ausschreibung, Sicherheitsdienstleistungen-Ausschreibung, Catering-Ausschreibung, Facility-Management-Ausschreibung, IT-Beschaffung-Besonderheiten, Fahrzeugbeschaffung-Richtlinie, Druckerei-Ausschreibung | P3 |
| **Baurecht Spezial** | 20 | Energieeinsparverordnung (EnEV/GEG Auszug), Erneuerbare-Energien-Wärmegesetz (EEWärmeG), Trinkwasserverordnung (Auszug baulicher Teil), Garagenverordnung Berlin, Feuerungsverordnung, Versammlungsstättenverordnung (VStättVO), Beherbergungsstättenverordnung, Verkaufsstättenverordnung, Hochhaus-Richtlinie, Schulbau-Richtlinie, Krankenhausbau-Richtlinie, Industriebau-Richtlinie, Muster-Leitungsanlagen-Richtlinie, Muster-Lüftungsanlagen-Richtlinie, Flächennutzungsplan Berlin (exemplarisch), Landschaftsprogramm Berlin, Stadtentwicklungsplan Wohnen, Denkmalliste Berlin (Auszug), Baumschutzverordnung Berlin, Spielplatzgesetz Berlin | P3 |
| **Umweltrecht** | 15 | Bundes-Immissionsschutzgesetz (BImSchG Auszug), TA Lärm, TA Luft, Bundes-Bodenschutzgesetz (BBodSchG), Abfallrecht (KrWG Auszug), Berliner Naturschutzgesetz (NatSchGBln), Wasserhaushaltsgesetz (WHG Auszug), Berliner Wassergesetz (BWG), Bundes-Klimaschutzgesetz, Berliner Klimaschutzgesetz, Berliner Energie- und Klimaschutzprogramm, UVP-Gesetz (Auszug), Umweltinformationsgesetz (UIG), SUP-Richtlinie, Öko-Audit-Verordnung | P3 |
| **Sozialrecht / Personal Spezial** | 15 | Mutterschutzgesetz, Bundeselterngeldgesetz, Pflegezeitgesetz, Familienpflegezeitgesetz, Schwerbehindertenrecht (SGB IX Auszug), Gleichstellungsgesetz Berlin (LGG), Landesgleichberechtigungsgesetz, Personalvertretungsgesetz Berlin, Berufsbildungsgesetz (Auszug), Aufstiegsfortbildungsförderungsgesetz, TVöD (Auszug für Vergleich), Beamtenstatusgesetz, Landesbesoldungsgesetz Berlin, Beamtenversorgungsgesetz, Nebentätigkeitsverordnung Beamte | P3 |
| **E-Government / Digitalisierung** | 15 | E-Government-Gesetz Berlin (EGovG Bln), Onlinezugangsgesetz (OZG), E-Akte-Richtlinie Berlin, Digitalisierungsstrategie Berlin, IT-Staatsvertrag, FITKO-Leistungen (Föderale IT-Kooperation), XÖV-Standards (XJustiz, XBau, XVergabe), E-Rechnung-Verordnung, Elektronische Signatur-Verordnung, eIDAS-Verordnung (Auszug), De-Mail-Gesetz, Schriftform-Ersetzungsverordnung Berlin, Open-Data-Strategie Berlin, Geodateninfrastruktur Berlin, IT-Planungsrat-Beschlüsse (ausgewählte) | P3 |

### C.5 — Templates, Forms, and Checklists (200 documents)

| Category | Count | Examples | Priority |
|---|---|---|---|
| **Vergabe-Templates (alle Verfahrensarten)** | 50 | Vollständige Dokumentensets für: Direktauftrag, Beschränkte Ausschreibung (3 Varianten), Öffentliche Ausschreibung (2 Varianten), EU-weite Ausschreibung, Verhandlungsvergabe, Rahmenvereinbarung, Wettbewerblicher Dialog, Innovationspartnerschaft. Je Set: Vergabevermerk, Angebotsaufforderung, Bewertungsmatrix, Absageschreiben, Zuschlagsschreiben, Ex-Post-Bekanntmachung, Dokumentations-Checkliste | P3 |
| **Bau-Templates** | 40 | Bauantragsformulare (alle 11 Verfahrenstypen), Vorbescheid-Antrag, Teilbaugenehmigung, Nutzungsänderung-Antrag, Abbruchantrag, Abgeschlossenheitsbescheinigung, Baulast-Erklärung, Stellplatz-Ablösevereinbarung, Erschließungsvertrag (Muster), Durchführungsvertrag, Städtebaulicher Vertrag, Erschließungsvertrag, Folgekostenvertrag, Grundstücksteilung-Antrag, Werbeanlage-Antrag, Befreiung-Antrag, Abweichung-Antrag, Verlängerung-Antrag, Nachtrag-Antrag, Baueinstellung-Anordnung (Muster), Nutzungsuntersagung-Anordnung (Muster) | P3 |
| **HR-Templates** | 40 | Arbeitsvertrag TV-L (Muster), Änderungsvertrag, Teilzeit-Antrag, Elternzeit-Antrag, Urlaubsantrag, Sonderurlaub-Antrag, Dienstreise-Antrag, Dienstreise-Abrechnung, Fortbildungsantrag, Nebentätigkeit-Anzeige, Höhergruppierung-Antrag, Beurteilungsbogen, Stellenbeschreibung (Muster), Ausschreibungstext (Muster), Vorstellungsgespräch-Leitfaden, Absage (Muster), Einstellungszusage, Probezeit-Beurteilung, Krankmeldung-Formular, Homeoffice-Vereinbarung, Mobile-Arbeit-Antrag, Gleitzeit-Vereinbarung, Arbeitsunfähigkeitsbescheinigung-Einreichung, Datenschutzerklärung Personal, Einwilligungserklärung | P3 |
| **Bescheid-Templates (Verwaltungsakt-Muster)** | 30 | Baugenehmigung, Bauvorbescheid, Ablehnung Bauantrag, Teilbaugenehmigung, Nutzungsänderung-Genehmigung, Abbruchgenehmigung, Baueinstellung, Nutzungsuntersagung, Zwangsgeld-Androhung, Zwangsgeld-Festsetzung, Duldungsbescheid, Widerspruchsbescheid Bau, Widerspruchsbescheid Vergabe, Zuwendungsbescheid, Rückforderungsbescheid, Gebührenbescheid, Sondernutzungserlaubnis, Gaststättenerlaubnis, Gewerbeerlaubnis, Genehmigung Wohnungsauflösung, Zweckentfremdungsgenehmigung | P3 |
| **Allgemeine Verwaltungs-Templates** | 40 | Aktenvermerk, Gesprächsvermerk, Telefonvermerk, E-Mail-Vorlage Bürger, E-Mail-Vorlage Kollege, Besprechungsprotokoll, Entscheidungsvorlage, Mitteilungsvorlage, Sachstandsbericht, Tätigkeitsbericht, Quartalsbericht, Projektstatusbericht, Risikobericht, Beschaffungsantrag, Budgetantrag, Mittelabruf, Rechnungskontrolle, Zahlungsanweisung, Inventarisierung, Aussonderung, Akte-anlegen-Formular, Akte-schließen-Formular, Fristenkalender-Vorlage, Wiedervorlage-Vorlage, Delegationsverfügung, Zeichnungsvollmacht, Vertretungsregelung, Organisationsverfügung, Geschäftsverteilungsplan, Dienstvereinbarung (Muster) | P3 |

---

## Summary — Production Corpus by Phase

| Phase | Documents | Pages | Est. Chunks | Est. Vectors | Ingestion Time (Seq) | Ingestion Time (Parallel) | Benchmark Pass Rate |
|---|---|---|---|---|---|---|---|
| **Phase A** | 100 | ~850 | ~4,000 | ~4,000 | ~3 h | ~45 min | **75%** (30/40) |
| **Phase B** | 300 | ~2,800 | ~12,000 | ~12,000 | ~9 h | ~2 h | **85%** (34/40) |
| **Phase C** | 600 | ~7,500 | ~24,000 | ~24,000 | ~18 h | ~4 h | **92%** (37/40) |
| **Total** | **~1,000** | **~11,150** | **~40,000** | **~40,000** | **~30 h** | **~7 h** | **92%** |

### Ingestion Order

```
Week 1-2:   Phase A — Critical Regulations (100 docs)
            ↓ Validate: benchmark ≥ 75%
Week 3-5:   Phase B — Operational Documents (300 docs)
            ↓ Validate: benchmark ≥ 85%
Week 6-8:   Phase C — Supplementary (600 docs, batched: 150/week)
            ↓ Validate: benchmark ≥ 92%
Week 9:     Historical versions + final release benchmark
```

### Benchmark Improvement Trajectory

| Phase | RULE_ENGINE (28 Qs) | HYBRID_RETRIEVAL (12 Qs) | Overall |
|---|---|---|---|
| **Current** (demo corpus) | 96% (27/28) | 8% (1/12) — PROC-009 partially | ~70% |
| **Phase A** | 96% (27/28) | 75% (9/12) — BUILD-001-006, SAL-008, RETR-001, PROC-009 | **90%** |
| **Phase B** | 96% (27/28) | 92% (11/12) — adds RETR-002, RETR-003, RETR-004 | **95%** |
| **Phase C** | 100% (28/28) — SAL-008 deep | 92% (11/12) — RETR depth improved | **96%** |

### Documents Requiring LegalChunkingStrategy (v2.1)

Of the ~1,000 documents, approximately **250 documents** (25%) would benefit from LegalChunkingStrategy:

- All laws (Gesetze): ~80 documents — §, Abs., Satz structure
- All regulations (Rechtsverordnungen): ~85 documents — similar structure
- All collective agreements (Tarifverträge): ~15 documents — TV-L uses § structure
- All administrative regulations with § structure: ~50 documents — AVs
- Selected court decisions: ~20 documents — cite paragraphs, benefits from alignment

The remaining 750 documents (manuals, guides, checklists, forms, templates, circulars, FAQs, historical versions, explanatory memoranda) do NOT benefit from legal chunking — they have section/heading structure but not §/Abs./Satz hierarchy.

**LegalChunkingStrategy is a v2.1 optimization for citation precision, not a v1.1 blocker.**
