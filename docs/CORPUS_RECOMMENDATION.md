# Recommended Production Corpus — Version 1.1

> Auto-generated: 2026-07-14
> Source: PROJECT_VISION.md + V1_1_IMPLEMENTATION_ROADMAP.md
> Total recommended documents: 20

---

## Priority Distribution

| Priority | Count | Description |
|---|---|---|
| P1 | 5 | Required before release — fixes 5 failing benchmark questions |
| P2 | 8 | Important — deepens answers, enables backup queries |
| P3 | 7 | Nice to have — domain completeness |

---

## P1 — Required Before Release

Documents that fix currently-failing HYBRID_RETRIEVAL benchmark questions.

### 1. BauO Bln §§ 27-36 (Brandschutz)

- **Reason for inclusion:** Required for BUILD-006 (fire safety for mid-rise residential buildings). Contains fire resistance ratings, escape routes, fire compartments by building class.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~15
- **Estimated ingestion complexity:** Low — public PDF, structured sections
- **Chunking strategy:** By paragraph (§27, §28, etc.) with building class tags
- **Metadata:** category: building-regulations, tags: brandschutz, gebäudeklasse

### 2. BauO Bln §61 (Genehmigungsfreie Vorhaben)

- **Reason for inclusion:** Required for BUILD-003 (carport exemptions). Complete list of permit-free structures including carports, garages, sheds.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~3
- **Estimated ingestion complexity:** Low — short section, same source as existing BauO Bln doc
- **Chunking strategy:** By structure type (carport, garage, fence, etc.)
- **Metadata:** category: building-regulations, tags: genehmigungsfrei, verfahrensfrei

### 3. TV-L Entgeltordnung (Eingruppierungskatalog)

- **Reason for inclusion:** Required for SAL-008 (Verwaltungsfachwirt classification). Maps job titles to Entgeltgruppen including specific municipal roles.
- **Official source:** TdL (Tarifgemeinschaft deutscher Länder)
- **Estimated pages:** ~40
- **Estimated ingestion complexity:** Medium — multiple parts, structured tables
- **Chunking strategy:** One chunk per job title → EG mapping
- **Metadata:** category: hr-regulations, tags: eingruppierung, entgeltordnung

### 4. BerlAVG §7 + AV Umwelt (full text)

- **Reason for inclusion:** Required for RETR-001 (environmental criteria in procurement). Specific environmental criteria for Berlin procurement.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~5
- **Estimated ingestion complexity:** Low — Berlin legal portal PDF
- **Chunking strategy:** By criterion (energy efficiency, recycling, emissions, etc.)
- **Metadata:** category: procurement-regulations, tags: umwelt, nachhaltigkeit, berlavg

### 5. BauO Bln §63 (full text with Nutzungsänderung)

- **Reason for inclusion:** Required for BUILD-005 (change of use). Complete simplified procedure provisions including change-of-use rules.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~5
- **Estimated ingestion complexity:** Low — same source, just expanded
- **Chunking strategy:** Split into procedure type triggers
- **Metadata:** category: building-regulations, tags: nutzungsänderung, vereinfachtes-verfahren

---

## P2 — Important

Documents that deepen existing answers and enable backup queries.

### 6. VgV §§ 15-17 (electronic deadlines, urgency)

- **Reason for inclusion:** Deepens RETR-003 answer. Shortened deadlines for electronic submission, urgency provisions.
- **Official source:** Bundesministerium der Justiz (gesetze-im-internet.de)
- **Estimated pages:** ~5
- **Estimated ingestion complexity:** Low — existing document expansion
- **Chunking strategy:** By section with deadline type tag
- **Metadata:** category: procurement-regulations, tags: fristen, elektronisch, dringlichkeit

### 7. BauVorlV 2025 (full text)

- **Reason for inclusion:** Deepens BUILD-004 answer. Complete list of 11 procedure types and required documents for building applications.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~15
- **Estimated ingestion complexity:** Low — public PDF, structured
- **Chunking strategy:** By procedure type with document checklist
- **Metadata:** category: building-regulations, tags: bauvorlagen, bauantrag

### 8. GWB §§ 134-135 (Vergaberechtsverstöße)

- **Reason for inclusion:** Enables legal consequence questions. Consequences of procurement law violations, voidability of contracts.
- **Official source:** Bundesministerium der Justiz (gesetze-im-internet.de)
- **Estimated pages:** ~5
- **Estimated ingestion complexity:** Low — public legal text
- **Chunking strategy:** By section with consequence type
- **Metadata:** category: procurement-regulations, tags: rechtsfolgen, nichtigkeit

### 9. VOB/A §3a (ex-post publication thresholds)

- **Reason for inclusion:** Improves procurement procedure explanation completeness. Precise publication requirements by procedure type.
- **Official source:** DIN / Beuth Verlag
- **Estimated pages:** ~3
- **Estimated ingestion complexity:** Low — DIN standard, well-structured
- **Chunking strategy:** By publication trigger threshold
- **Metadata:** category: procurement-regulations, tags: vob, ex-post, bekanntmachung

### 10. UrlVO Bln (full text, §§ 1-28)

- **Reason for inclusion:** Deepens RETR-004 answer. Complete Berlin leave regulation including special leave categories.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~20
- **Estimated ingestion complexity:** Medium — Berlin legal portal
- **Chunking strategy:** By section, one per leave type
- **Metadata:** category: hr-regulations, tags: urlaub, sonderurlaub, urlvo

### 11. TV-L §34 (Kündigungsfristen, full table)

- **Reason for inclusion:** Enables notice period questions. Complete dismissal notice periods by years of service.
- **Official source:** TdL (Tarifgemeinschaft deutscher Länder)
- **Estimated pages:** ~3
- **Estimated ingestion complexity:** Low — existing document expansion
- **Chunking strategy:** One chunk per service-year bracket
- **Metadata:** category: hr-regulations, tags: kündigung, fristen

### 12. LRKG Berlin (full text)

- **Reason for inclusion:** Enables Berlin-specific travel answers. Berlin-specific travel expense provisions differing from BRKG.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~15
- **Estimated ingestion complexity:** Medium — Berlin legal portal
- **Chunking strategy:** By allowance type
- **Metadata:** category: hr-regulations, tags: lrkg, berlin, reisekosten

### 13. Beschaffungsordnung Berlin (full text)

- **Reason for inclusion:** Deepens RETR-002 Vergabevermerk documentation. Complete internal procurement procedures for Berlin administration.
- **Official source:** Senatsverwaltung für Finanzen Berlin
- **Estimated pages:** ~10
- **Estimated ingestion complexity:** Low — internal document, expand existing
- **Chunking strategy:** By purchasing threshold tier
- **Metadata:** category: internal-procedures, tags: vergabevermerk, beschaffung

---

## P3 — Nice to Have

Documents for domain completeness; deferrable to v1.2.

### 14. BauNVO (full text, §§ 1-26a)

- **Reason for inclusion:** Better planning law answers. Complete land use ordinance with all zone categories and density limits.
- **Official source:** Bundesministerium der Justiz (gesetze-im-internet.de)
- **Estimated pages:** ~15
- **Estimated ingestion complexity:** Medium — federal law, structured
- **Chunking strategy:** By zone category with GRZ/GFZ tables
- **Metadata:** category: building-regulations, tags: baunvo, nutzungsart

### 15. Musterbauordnung (MBO) — Gebäudeklassen

- **Reason for inclusion:** Better building classification for BUILD-006. Model building code building class definitions (GK 1-5).
- **Official source:** IS-Argebau (is-argebau.de)
- **Estimated pages:** ~5
- **Estimated ingestion complexity:** Low — IS-Argebau public document
- **Chunking strategy:** By building class with height/area thresholds
- **Metadata:** category: building-regulations, tags: gebäudeklasse, mbo

### 16. AV §55 LHO (full text with all appendices)

- **Reason for inclusion:** Better procurement completeness. Complete administrative regulation including special cases.
- **Official source:** Senatsverwaltung für Finanzen Berlin
- **Estimated pages:** ~20
- **Estimated ingestion complexity:** Medium — Senatsverwaltung internal document
- **Chunking strategy:** By section, appendix separately
- **Metadata:** category: procurement-regulations, tags: lho, av, wertgrenzen

### 17. ITDZ Berlin — IT-Sicherheitsleitlinie (full text)

- **Reason for inclusion:** Enables security questions. Complete IT security incident response procedures for Berlin administration.
- **Official source:** ITDZ Berlin
- **Estimated pages:** ~10
- **Estimated ingestion complexity:** Low — expand existing document
- **Chunking strategy:** By incident type with response steps
- **Metadata:** category: hr-regulations, tags: it-sicherheit, notfall

### 18. AZVO Bln (full text)

- **Reason for inclusion:** Enables working time questions. Complete working time regulation with flexitime core hours.
- **Official source:** Berliner Vorschriften- und Rechtsprechungsdatenbank
- **Estimated pages:** ~12
- **Estimated ingestion complexity:** Medium — Berlin legal portal
- **Chunking strategy:** By topic: flexitime, overtime, part-time
- **Metadata:** category: hr-regulations, tags: arbeitszeit, gleitzeit

### 19. Mobile Arbeit Rahmenvereinbarung (full text)

- **Reason for inclusion:** Enables remote work questions. Complete remote work agreement including equipment provisions for Berlin administration.
- **Official source:** Senatsverwaltung für Inneres und Sport Berlin
- **Estimated pages:** ~8
- **Estimated ingestion complexity:** Low — expand existing document
- **Chunking strategy:** By topic: equipment, health, data protection
- **Metadata:** category: hr-regulations, tags: homeoffice, mobile-arbeit

### 20. Baugenehmigungsformular Berlin (full form fields)

- **Reason for inclusion:** Complete form guidance for BUILD-004. All required fields and instructions for Berlin building applications.
- **Official source:** Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin
- **Estimated pages:** ~5
- **Estimated ingestion complexity:** Low — expand existing document
- **Chunking strategy:** By form section with field descriptions
- **Metadata:** category: forms, tags: bauantrag, formular

---

## Ingestion Summary

| Priority | Documents | Total Pages | Estimated Effort |
|---|---|---|---|
| P1 | 5 | ~68 | 3 days |
| P2 | 8 | ~76 | 3 days |
| P3 | 7 | ~75 | 2 days |
| **Total** | **20** | **~219** | **~8 days** |

## Legal Domains Covered

| Domain | P1 | P2 | P3 | Total |
|---|---|---|---|---|
| Vergaberecht (Procurement) | 1 | 4 | 1 | 6 |
| Baurecht (Building) | 3 | 1 | 3 | 7 |
| Personalrecht (HR) | 1 | 3 | 3 | 7 |

## Post-Ingestion Expected Benchmark Improvement

- Baseline (current demo corpus): ~40-50% pass rate
- After P1 ingestion: ~67% pass rate
- After P2 ingestion: ~80%+ pass rate
- Release gate threshold: ≥ 75%
