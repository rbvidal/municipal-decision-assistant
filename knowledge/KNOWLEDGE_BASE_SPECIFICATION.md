# Knowledge Base Specification — Municipal Decision Assistant SCCON Demo

**Version:** 1.0.0
**Purpose:** Smart Country Convention (SCCON) Demonstration Dataset
**Scope:** Berlin Municipal Administration — Three Domains
**Classification:** Public Demonstration Material

---

## 1. Directory Structure

```
knowledge/
├── README.md                                    # Knowledge base overview & usage guide
│
├── procurement/                                 # Domain 1: Public Procurement
│   ├── regulations/
│   │   ├── README.md                            # Domain overview
│   │   ├── gwb-teil4.md                         # GWB Part 4 — Cartel Law (Procurement)
│   │   ├── vgv.md                               # Procurement Ordinance (VgV)
│   │   ├── uvgO.md                              # Sub-Threshold Procurement Ordinance
│   │   ├── vob-a.md                             # VOB/A — Construction Procurement
│   │   ├── vob-b.md                             # VOB/B — Construction Contract Terms
│   │   ├── vob-c.md                             # VOB/C — Technical Construction Standards
│   │   ├── berlavg.md                           # Berlin Tender & Procurement Act
│   │   ├── av-55-lho.md                         # AV to § 55 LHO — Berlin Procurement Rules
│   │   ├── vwvbu.md                             # Administrative Regulation Procurement & Environment
│   │   ├── gem-rs-2024-01.md                    # Joint Circular 01/2024 — Procurement
│   │   └── eu-vergabe.md                        # EU Procurement Directives (2014/24/EU)
│   │
│   ├── procedures/
│   │   ├── vergabeverfahren-ueberschwellig.md   # Above-Threshold Procurement Procedure
│   │   ├── vergabeverfahren-unterschwellig.md    # Sub-Threshold Procurement Procedure
│   │   ├── direktauftrag.md                     # Direct Award Procedure
│   │   ├── freihandige-vergabe.md               # Negotiated Award Without Competition
│   │   ├── beschraenkte-ausschreibung.md        # Restricted Tender Procedure
│   │   ├── offene-ausschreibung.md              # Open Tender Procedure
│   │   ├── eVergabe-workflow.md                 # eProcurement Workflow (Berlin Platform)
│   │   └── vergabevermerk.md                    # Procurement Memorandum Template
│   │
│   ├── forms/
│   │   ├── eigenerklaerung-eignung.md           # Self-Declaration of Suitability
│   │   ├── vergabeunterlagen-checkliste.md      # Procurement Documents Checklist
│   │   ├── angebotsschreiben-muster.md          # Offer Letter Template
│   │   ├── verhandlungsprotokoll.md             # Negotiation Minutes Template
│   │   └── zuschlagschreiben-muster.md          # Award Letter Template
│   │
│   ├── templates/
│   │   ├── leistungsbeschreibung-muster.md      # Service Specification Template
│   │   ├── bewertungsmatrix-muster.md           # Evaluation Matrix Template
│   │   ├── vergabeakte-checkliste.md            # Procurement File Checklist
│   │   └── bieterfragen-protokoll.md            # Bidder Q&A Protocol
│   │
│   ├── manuals/
│   │   ├── vergabehandbuch-berlin.md            # Berlin Procurement Manual
│   │   ├── leitfaden-unterschwellenvergabe.md   # Sub-Threshold Guide
│   │   ├── leitfaden-nachhaltige-beschaffung.md # Sustainable Procurement Guide
│   │   └── eVergabe-leitfaden.md                # eProcurement Guide
│   │
│   ├── FAQs/
│   │   ├── faq-vergaberecht.md                  # Procurement Law FAQ
│   │   ├── faq-eVergabe.md                      # eProcurement FAQ
│   │   ├── faq-wertgrenzen.md                   # Value Thresholds FAQ
│   │   └── faq-nachhaltige-beschaffung.md       # Sustainable Procurement FAQ
│   │
│   └── checklists/
│       ├── checkliste-vergabe-vorbereitung.md   # Procurement Preparation Checklist
│       ├── checkliste-angebotspruefung.md       # Bid Review Checklist
│       └── checkliste-zuschlagserteilung.md     # Award Decision Checklist
│
├── building/                                    # Domain 2: Building & Urban Planning
│   ├── regulations/
│   │   ├── README.md                            # Domain overview
│   │   ├── bauo-bln.md                          # Berlin Building Code (BauO Bln)
│   │   ├── baugb.md                             # Federal Building Code (BauGB)
│   │   ├── baunvo.md                            # Land Use Ordinance (BauNVO)
│   │   ├── bauvorlv.md                          # Building Documents Ordinance (NEW 2025)
│   │   ├── planzv.md                            # Plan Symbols Ordinance (PlanZV)
│   │   ├── bauvorl-verordnung.md                # Building Template Ordinance
│   │   ├── schneller-bauen-gesetz.md            # Faster Building Act (Dec 2024)
│   │   ├── garagenverordnung.md                 # Garage Ordinance Berlin
│   │   ├── feuerungsverordnung.md               # Combustion Ordinance Berlin
│   │   └── enev-geg.md                          # Building Energy Act (GEG)
│   │
│   ├── zoning/
│   │   ├── baunutzungsverordnung.md             # Land Use Classification
│   │   ├── bebauungsplan-muster.md              # Sample Development Plan
│   │   ├── flaechennutzungsplan-berlin.md       # Berlin Land Use Plan (FNP)
│   │   ├── baugebiete-uebersicht.md             # Building Zone Categories
│   │   └── abstandsflaechen-berlin.md           # Setback Requirements Berlin
│   │
│   ├── permits/
│   │   ├── baugenehmigung-verfahren.md          # Building Permit — Full Procedure
│   │   ├── vereinfachtes-verfahren.md           # Simplified Permit Procedure
│   │   ├── genehmigungsfreistellung.md          # Permit Exemption Procedure
│   │   ├── vorbescheid.md                       # Preliminary Decision
│   │   ├── typengenehmigung.md                  # Type Approval (NEW)
│   │   ├── abweichungsantrag.md                 # Deviation Application
│   │   └── nutzungsaenderung.md                 # Change of Use Permit
│   │
│   ├── procedures/
│   │   ├── bauantragsverfahren-ablauf.md        # Building Application Process Flow
│   │   ├── bauantragskonferenz.md               # Building Application Conference (NEW)
│   │   ├── vollstaendigkeitspruefung.md          # Completeness Check
│   │   ├── nachbar-beteiligung.md               # Neighbor Participation
│   │   ├── denkmalschutz-beteiligung.md         # Monument Protection Participation
│   │   └── brandschutz-pruefung.md              # Fire Safety Review
│   │
│   ├── citizen-information/
│   │   ├── bauen-in-berlin-ueberblick.md        # Building in Berlin — Overview
│   │   ├── bauantrag-schritt-fuer-schritt.md    # Building Application Step by Step
│   │   ├── gebuehren-baugenehmigung.md          # Building Permit Fees
│   │   ├── bauvoranfrage-wegweiser.md           # Preliminary Inquiry Guide
│   │   └── digitaler-bauantrag-info.md          # Digital Building Application Info
│   │
│   ├── forms/
│   │   ├── bauantrag-formular.md                # Building Application Form
│   │   ├── bauvorlagen-liste.md                 # Building Documents Checklist
│   │   ├── statistischer-erhebungsbogen.md      # Statistical Survey Form
│   │   ├── standsicherheitsnachweis.md          # Structural Stability Certificate
│   │   └── brandschutznachweis.md               # Fire Safety Certificate
│   │
│   └── checklists/
│       ├── checkliste-bauantrag.md              # Building Application Checklist
│       ├── checkliste-bauvorlagen.md            # Building Documents Checklist
│       └── checkliste-genehmigungsfreiheit.md   # Permit Exemption Checklist
│
├── hr/                                          # Domain 3: HR & Internal Administration
│   ├── travel/
│   │   ├── brkg.md                              # Federal Travel Expense Act
│   │   ├── lrkg-berlin.md                       # Berlin State Travel Expense Act
│   │   ├── reisekosten-abrechnung.md            # Travel Expense Reimbursement Procedure
│   │   ├── reisekosten-formular.md              # Travel Expense Form
│   │   ├── reisekostensaetze-2025.md            # Travel Expense Rates 2025
│   │   └── dienstreise-genehmigung.md           # Business Travel Authorization
│   │
│   ├── vacation/
│   │   ├── urlaubsverordnung-berlin.md           # Berlin Leave Regulation
│   │   ├── urlaubsantrag-verfahren.md            # Leave Application Procedure
│   │   ├── urlaubsantrag-formular.md             # Leave Application Form
│   │   ├── sonderurlaub-verordnung.md            # Special Leave Regulation
│   │   └── urlaubsuebertragung.md                # Leave Carry-Over Rules
│   │
│   ├── home-office/
│   │   ├── mobile-arbeit-rahmenvereinbarung.md   # Mobile Work Framework Agreement
│   │   ├── telearbeit-dienstvereinbarung.md      # Telework Service Agreement
│   │   ├── homeoffice-antrag.md                  # Home Office Application
│   │   ├── homeoffice-ausstattung.md             # Home Office Equipment Policy
│   │   └── arbeitsschutz-homeoffice.md           # Occupational Safety — Home Office
│   │
│   ├── working-time/
│   │   ├── arbeitszeitverordnung-berlin.md       # Berlin Working Time Regulation
│   │   ├── arbeitszeitgesetz.md                  # Federal Working Time Act (ArbZG)
│   │   ├── gleitzeit-rahmenvereinbarung.md       # Flexitime Framework Agreement
│   │   ├── teilzeit-antrag.md                    # Part-Time Application
│   │   └── arbeitszeitkonto.md                   # Working Time Account Rules
│   │
│   ├── procurement-approval/
│   │   ├── beschaffungsordnung-berlin.md         # Berlin Procurement Order (Internal)
│   │   ├── beschaffungsantrag-formular.md        # Procurement Request Form
│   │   ├── vergabevermerk-intern.md              # Internal Procurement Memo Template
│   │   └── wertgrenzen-beschaffung.md            # Procurement Value Thresholds
│   │
│   ├── IT-security/
│   │   ├── it-sicherheitsleitlinie-berlin.md     # Berlin IT Security Policy
│   │   ├── dienstanweisung-it-nutzung.md         # IT Usage Service Instruction
│   │   ├── datenschutz-dienstanweisung.md        # Data Protection Service Instruction
│   │   ├── passwort-richtlinie.md                # Password Policy
│   │   └── mobiles-arbeiten-it-sicherheit.md     # Mobile Work IT Security
│   │
│   ├── employment/
│   │   ├── tv-l-2025.md                          # TV-L 2025 (Collective Agreement)
│   │   ├── tv-l-entgelttabellen-2025.md          # TV-L Pay Tables 2025
│   │   ├── eingruppierung-richtlinien.md         # Classification Guidelines
│   │   ├── nebentaetigkeit-verordnung.md         # Secondary Employment Regulation
│   │   └── beurteilungsrichtlinien.md            # Performance Review Guidelines
│   │
│   ├── remuneration/
│   │   ├── besoldungstabellen-berlin-2025.md     # Berlin Salary Tables 2025
│   │   ├── zulagen-uebersicht.md                 # Allowances Overview
│   │   ├── jahressonderzahlung-tv-l.md           # Annual Special Payment TV-L
│   │   └── vermoegenswirksame-leistungen.md      # Capital-Forming Benefits
│   │
│   └── internal-procedures/
│       ├── aktenordnung-berlin.md                # Berlin File Management Regulation
│       ├── unterschriftsregelung.md              # Signature Authorization Rules
│       ├── geschaeftsordnung-bezirksamt.md       # District Office Rules of Procedure
│       └── dienstreise-genehmigung-intern.md     # Internal Travel Authorization
│
└── cross-domain/                                # Cross-Domain Resources
    ├── verwaltungsverfahrensgesetz.md            # Administrative Procedure Act (VwVfG)
    ├── verwaltungsvollstreckungsgesetz.md         # Administrative Enforcement Act
    ├── gebuehrenordnung-berlin.md                # Berlin Fee Ordinance
    ├── egovg-berlin.md                           # Berlin eGovernment Act
    └── datenschutz-grundverordnung.md            # GDPR / BDSG Reference
```

---

## 2. Document Catalog — Complete Metadata

### 2.1 Domain: Public Procurement (Beschaffung/Vergabe)

#### REGULATIONS

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| PROC-REG-001 | GWB Teil 4 — Vergaberecht (§§ 97–184) | Bund / BMWK | 1958 | 2024 | Gesetz | gesetze-im-internet.de/gwb |
| PROC-REG-002 | Vergabeverordnung (VgV) | Bundesregierung | 2016 | 2024 | Verordnung | gesetze-im-internet.de/vgv |
| PROC-REG-003 | Unterschwellenvergabeordnung (UVgO) | Bundesregierung | 2017 | 2024 | Verordnung | gesetze-im-internet.de/uvgo |
| PROC-REG-004 | VOB/A — Vergabe- und Vertragsordnung für Bauleistungen, Teil A | DVA | 1926 | 2024 | Regelwerk | vergabe.bund.de |
| PROC-REG-005 | VOB/B — VOB Teil B (Allgemeine Vertragsbedingungen) | DVA | 1926 | 2024 | Regelwerk | vergabe.bund.de |
| PROC-REG-006 | VOB/C — VOB Teil C (Technische Vertragsbedingungen) | DVA | 1926 | 2024 | Regelwerk | vergabe.bund.de |
| PROC-REG-007 | Berliner Ausschreibungs- und Vergabegesetz (BerlAVG) | Land Berlin / Abgeordnetenhaus | 2010 | 2024 | Landesgesetz | gesetze.berlin.de |
| PROC-REG-008 | AV zu § 55 LHO — Ausführungsvorschriften Beschaffung | Senatsverwaltung Finanzen | 2020 | 2024 | Verwaltungsvorschrift | berlin.de/vergabeservice |
| PROC-REG-009 | VwVBU — Verwaltungsvorschrift Beschaffung und Umwelt | Senatsverwaltung Umwelt | 2005 | 2024 | Verwaltungsvorschrift | berlin.de/nachhaltige-beschaffung |
| PROC-REG-010 | Gemeinsames Rundschreiben Vergabe 01/2024 | Senatsverwaltung Bauen | 2024 | 2024 | Rundschreiben | berlin.de/sen/sbw |
| PROC-REG-011 | EU-Richtlinie 2014/24/EU (Öffentliche Auftragsvergabe) | Europäische Union | 2014 | 2024 | EU-Richtlinie | eur-lex.europa.eu |

#### PROCEDURES

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| PROC-PRO-001 | Vergabeverfahren oberhalb EU-Schwellenwerte | Senatsverwaltung Finanzen | 2020 | 2024 | Verfahrensanweisung | berlin.de/vergabeservice |
| PROC-PRO-002 | Vergabeverfahren unterhalb EU-Schwellenwerte | Senatsverwaltung Finanzen | 2020 | 2024 | Verfahrensanweisung | berlin.de/vergabeservice |
| PROC-PRO-003 | Direktauftrag — Verfahren und Wertgrenzen | Senatsverwaltung Finanzen | 2024 | 2024 | Verfahrensanweisung | berlin.de/vergabeservice |
| PROC-PRO-004 | Freihändige Vergabe / Verhandlungsvergabe | Senatsverwaltung Finanzen | 2020 | 2024 | Verfahrensanweisung | berlin.de/vergabeservice |
| PROC-PRO-005 | Beschränkte Ausschreibung ohne Teilnahmewettbewerb | Senatsverwaltung Finanzen | 2020 | 2024 | Verfahrensanweisung | berlin.de/vergabeservice |
| PROC-PRO-006 | Offene Ausschreibung — EU-weit | Senatsverwaltung Finanzen | 2020 | 2024 | Verfahrensanweisung | berlin.de/vergabeservice |
| PROC-PRO-007 | eVergabe Workflow — Vergabeplattform Berlin | Senatsverwaltung Finanzen | 2024 | 2024 | Verfahrensanweisung | vergabe-plattform.berlin.de |
| PROC-PRO-008 | Vergabevermerk — Dokumentationspflichten | Senatsverwaltung Finanzen | 2020 | 2024 | Vorlage | berlin.de/vergabeservice |

#### FORMS

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| PROC-FRM-001 | Eigenerklärung zur Eignung (EEE) | Bundesregierung | 2016 | 2024 | Formular | evergabe-online.de |
| PROC-FRM-002 | Vergabeunterlagen Checkliste | Senatsverwaltung Finanzen | 2020 | 2024 | Checkliste | berlin.de/vergabeservice |
| PROC-FRM-003 | Angebotsschreiben Muster | Senatsverwaltung Finanzen | 2020 | 2024 | Muster | berlin.de/vergabeservice |
| PROC-FRM-004 | Verhandlungsprotokoll Muster | Senatsverwaltung Finanzen | 2020 | 2024 | Muster | berlin.de/vergabeservice |
| PROC-FRM-005 | Zuschlagschreiben Muster | Senatsverwaltung Finanzen | 2020 | 2024 | Muster | berlin.de/vergabeservice |

#### MANUALS

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| PROC-MAN-001 | Vergabehandbuch Berlin | Senatsverwaltung Finanzen | 2020 | 2024 | Handbuch | berlin.de/vergabeservice |
| PROC-MAN-002 | Leitfaden Unterschwellenvergabe | Senatsverwaltung Finanzen | 2020 | 2024 | Leitfaden | berlin.de/vergabeservice |
| PROC-MAN-003 | Leitfaden Nachhaltige Beschaffung | Senatsverwaltung Umwelt | 2024 | 2024 | Leitfaden | berlin.de/nachhaltige-beschaffung |
| PROC-MAN-004 | eVergabe Leitfaden Berlin | Senatsverwaltung Finanzen | 2024 | 2024 | Leitfaden | vergabe-plattform.berlin.de |

### 2.2 Domain: Building & Urban Planning (Bauen & Stadtplanung)

#### REGULATIONS

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| BLD-REG-001 | Bauordnung Berlin (BauO Bln) | Land Berlin / Abgeordnetenhaus | 2005 | 2025 | Landesgesetz | gesetze.berlin.de/bauobln |
| BLD-REG-002 | Baugesetzbuch (BauGB) | Bund / BMWSB | 1960 | 2024 | Bundesgesetz | gesetze-im-internet.de/baugb |
| BLD-REG-003 | Baunutzungsverordnung (BauNVO) | Bundesregierung | 1962 | 2024 | Verordnung | gesetze-im-internet.de/baunvo |
| BLD-REG-004 | Bauvorlagenverordnung (BauVorlV) — NEU 2025 | Senatsverwaltung Bauen | 2025-06-19 | 2025 | Verordnung | berlin.de/sen/sbw |
| BLD-REG-005 | Planzeichenverordnung (PlanZV) | Bundesregierung | 1990 | 2024 | Verordnung | gesetze-im-internet.de/planzv |
| BLD-REG-006 | Schneller-Bauen-Gesetz Berlin | Land Berlin / Abgeordnetenhaus | 2024-12-11 | 2024 | Landesgesetz | parlament-berlin.de |
| BLD-REG-007 | Garagenverordnung Berlin | Senatsverwaltung Bauen | 2015 | 2024 | Verordnung | gesetze.berlin.de |
| BLD-REG-008 | Feuerungsverordnung Berlin | Senatsverwaltung Bauen | 2010 | 2024 | Verordnung | gesetze.berlin.de |
| BLD-REG-009 | Gebäudeenergiegesetz (GEG) | Bund / BMWK | 2020 | 2024 | Bundesgesetz | gesetze-im-internet.de/geg |
| BLD-REG-010 | Bundes-Bodenschutzgesetz (BBodSchG) | Bund / BMUV | 1998 | 2024 | Bundesgesetz | gesetze-im-internet.de/bbodschg |

#### ZONING

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| BLD-ZON-001 | Flächennutzungsplan Berlin (FNP) | Senatsverwaltung Bauen | 1994 | 2024 | Plan | stadtentwicklung.berlin.de/fnp |
| BLD-ZON-002 | Baugebiete nach BauNVO — Übersicht | Senatsverwaltung Bauen | — | 2024 | Übersicht | stadtentwicklung.berlin.de |
| BLD-ZON-003 | Abstandsflächen nach § 6 BauO Bln | Senatsverwaltung Bauen | — | 2025 | Merkblatt | berlin.de/sen/sbw |
| BLD-ZON-004 | Bebauungsplan Muster (Textliche Festsetzungen) | Senatsverwaltung Bauen | — | 2024 | Muster | stadtentwicklung.berlin.de |

#### PERMITS

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| BLD-PER-001 | Baugenehmigungsverfahren § 64 BauO Bln | Bezirksämter / Bauaufsicht | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |
| BLD-PER-002 | Vereinfachtes Verfahren § 63 BauO Bln | Bezirksämter / Bauaufsicht | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |
| BLD-PER-003 | Genehmigungsfreistellung § 62 BauO Bln | Bezirksämter / Bauaufsicht | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |
| BLD-PER-004 | Vorbescheid § 75 BauO Bln | Bezirksämter / Bauaufsicht | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |
| BLD-PER-005 | Typengenehmigung § 72a BauO Bln (NEU) | Senatsverwaltung Bauen | 2025 | 2025 | Verfahrensanweisung | berlin.de/sen/sbw |
| BLD-PER-006 | Abweichungsantrag § 67 BauO Bln | Bezirksämter / Bauaufsicht | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |
| BLD-PER-007 | Nutzungsänderung — Verfahren | Bezirksämter / Bauaufsicht | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |

#### PROCEDURES

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| BLD-PRC-001 | Bauantragsverfahren — Gesamtablauf | Bezirksämter | 2025 | 2025 | Verfahrensablauf | berlin.de/bauaufsicht |
| BLD-PRC-002 | Bauantragskonferenz § 58 Abs. 1a BauO Bln (NEU) | Bezirksämter | 2025 | 2025 | Verfahrensanweisung | berlin.de/sen/sbw |
| BLD-PRC-003 | Vollständigkeitsprüfung § 69 BauO Bln | Bezirksämter | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |
| BLD-PRC-004 | Nachbarbeteiligung § 70 BauO Bln | Bezirksämter | 2025 | 2025 | Verfahrensanweisung | berlin.de/bauaufsicht |
| BLD-PRC-005 | Denkmalschutzbeteiligung | Bezirksämter / Landesdenkmalamt | — | 2024 | Verfahrensanweisung | berlin.de/landesdenkmalamt |
| BLD-PRC-006 | Brandschutzprüfung | Bezirksämter / Feuerwehr | — | 2024 | Verfahrensanweisung | berliner-feuerwehr.de |

#### CITIZEN INFORMATION

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| BLD-CIT-001 | Bauen in Berlin — Bürgerinformation | Senatsverwaltung Bauen | — | 2025 | Information | berlin.de/sen/sbw |
| BLD-CIT-002 | Bauantrag Schritt für Schritt | Bezirksämter | — | 2025 | Anleitung | service.berlin.de |
| BLD-CIT-003 | Gebühren Baugenehmigung | Bezirksämter | — | 2024 | Information | berlin.de/bauaufsicht |
| BLD-CIT-004 | Bauvoranfrage Wegweiser | Bezirksämter | — | 2025 | Anleitung | service.berlin.de |
| BLD-CIT-005 | Digitaler Bauantrag — Informationen | Senatsverwaltung Bauen | 2025 | 2025 | Information | berlin.de/sen/sbw |

#### FORMS

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| BLD-FRM-001 | Bauantragsformular Berlin | Senatsverwaltung Bauen | 2025 | 2025 | Formular | berlin.de/bauaufsicht |
| BLD-FRM-002 | Bauvorlagenliste (Checkliste) | Senatsverwaltung Bauen | 2025 | 2025 | Checkliste | berlin.de/bauaufsicht |
| BLD-FRM-003 | Statistischer Erhebungsbogen | Senatsverwaltung Bauen | 2025 | 2025 | Formular | berlin.de/bauaufsicht |
| BLD-FRM-004 | Standsicherheitsnachweis Muster | Senatsverwaltung Bauen | 2025 | 2025 | Muster | berlin.de/bauaufsicht |
| BLD-FRM-005 | Brandschutznachweis Muster | Senatsverwaltung Bauen | 2025 | 2025 | Muster | berlin.de/bauaufsicht |

### 2.3 Domain: HR & Internal Administration (Personal & Innere Verwaltung)

#### TRAVEL

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-TRV-001 | Bundesreisekostengesetz (BRKG) | Bund / BMI | 2005 | 2024 | Bundesgesetz | gesetze-im-internet.de/brkg |
| HR-TRV-002 | Landesreisekostengesetz Berlin (LRKG) | Land Berlin | 2010 | 2024 | Landesgesetz | gesetze.berlin.de |
| HR-TRV-003 | Reisekostenabrechnung — Verfahren | Senatsverwaltung Finanzen | 2024 | 2024 | Verfahrensanweisung | berlin.de/sen/finanzen |
| HR-TRV-004 | Reisekostenantrag — Formular | Senatsverwaltung Finanzen | 2024 | 2024 | Formular | berlin.de/sen/finanzen |
| HR-TRV-005 | Reisekostensätze 2025 (Tagegeld, Übernachtung, Km) | Senatsverwaltung Finanzen | 2025 | 2025 | Übersicht | berlin.de/sen/finanzen |
| HR-TRV-006 | Dienstreisegenehmigung — Verfahren | Senatsverwaltung Finanzen | 2024 | 2024 | Verfahrensanweisung | berlin.de/sen/finanzen |

#### VACATION

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-VAC-001 | Urlaubsverordnung Berlin (UrlVO Bln) | Land Berlin | 2010 | 2024 | Verordnung | gesetze.berlin.de |
| HR-VAC-002 | Urlaubsantrag — Verfahren | Bezirksämter / Personalstellen | 2024 | 2024 | Verfahrensanweisung | berlin.de |
| HR-VAC-003 | Urlaubsantrag — Formular | Bezirksämter / Personalstellen | 2024 | 2024 | Formular | berlin.de |
| HR-VAC-004 | Sonderurlaubsverordnung (SUrlV) | Bundesregierung | 1985 | 2024 | Verordnung | gesetze-im-internet.de |
| HR-VAC-005 | Urlaubsübertragung — Regelungen | Bezirksämter / Personalstellen | 2024 | 2024 | Merkblatt | berlin.de |

#### HOME OFFICE

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-HMO-001 | Mobile Arbeit — Rahmenvereinbarung Berlin | Senatsverwaltung Inneres | 2022 | 2024 | Vereinbarung | berlin.de/sen/inneres |
| HR-HMO-002 | Telearbeit — Dienstvereinbarung Muster | Senatsverwaltung Inneres | 2022 | 2024 | Vereinbarung | berlin.de/sen/inneres |
| HR-HMO-003 | Homeoffice-Antrag — Formular | Bezirksämter / Personalstellen | 2024 | 2024 | Formular | berlin.de |
| HR-HMO-004 | Homeoffice-Ausstattung — Richtlinie | Senatsverwaltung Inneres | 2024 | 2024 | Richtlinie | berlin.de/sen/inneres |
| HR-HMO-005 | Arbeitsschutz Homeoffice | Senatsverwaltung Inneres | 2024 | 2024 | Merkblatt | berlin.de/sen/inneres |

#### WORKING TIME

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-WKT-001 | Arbeitszeitverordnung Berlin (AZVO Bln) | Land Berlin | 2010 | 2024 | Verordnung | gesetze.berlin.de |
| HR-WKT-002 | Arbeitszeitgesetz (ArbZG) — Bund | Bund / BMAS | 1994 | 2024 | Bundesgesetz | gesetze-im-internet.de |
| HR-WKT-003 | Gleitzeit — Rahmenvereinbarung | Senatsverwaltung Inneres | 2022 | 2024 | Vereinbarung | berlin.de/sen/inneres |
| HR-WKT-004 | Teilzeitantrag — Formular | Bezirksämter / Personalstellen | 2024 | 2024 | Formular | berlin.de |
| HR-WKT-005 | Arbeitszeitkonto — Regelungen | Senatsverwaltung Inneres | 2024 | 2024 | Regelung | berlin.de/sen/inneres |

#### PROCUREMENT APPROVAL (Internal)

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-PAP-001 | Beschaffungsordnung Berlin (Intern) | Senatsverwaltung Inneres | 2020 | 2024 | Dienstvereinbarung | berlin.de/sen/inneres |
| HR-PAP-002 | Beschaffungsantrag — Formular (Intern) | Bezirksämter | 2024 | 2024 | Formular | berlin.de |
| HR-PAP-003 | Vergabevermerk — Internes Muster | Bezirksämter | 2024 | 2024 | Muster | berlin.de |
| HR-PAP-004 | Wertgrenzen Beschaffung (Intern) | Senatsverwaltung Finanzen | 2024 | 2024 | Übersicht | berlin.de/vergabeservice |

#### IT SECURITY

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-ITS-001 | IT-Sicherheitsleitlinie Berlin | ITDZ Berlin / Senatsverwaltung Inneres | 2022 | 2024 | Leitlinie | itdz-berlin.de |
| HR-ITS-002 | Dienstanweisung IT-Nutzung | Bezirksämter / IT-Stellen | 2024 | 2024 | Dienstanweisung | berlin.de |
| HR-ITS-003 | Datenschutz-Dienstanweisung | Bezirksämter / Datenschutz | 2024 | 2024 | Dienstanweisung | berlin.de |
| HR-ITS-004 | Passwortrichtlinie | ITDZ Berlin | 2024 | 2024 | Richtlinie | itdz-berlin.de |
| HR-ITS-005 | Mobile Arbeit — IT-Sicherheit | ITDZ Berlin | 2024 | 2024 | Richtlinie | itdz-berlin.de |

#### EMPLOYMENT

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-EMP-001 | TV-L 2025 — Tarifvertrag Länder | Tarifgemeinschaft dt. Länder (TdL) | 2024 | 2025 | Tarifvertrag | oeffentlicher-dienst.info/tv-l |
| HR-EMP-002 | TV-L Entgelttabellen 2025 | TdL | 2025 | 2025 | Tabelle | oeffentlicher-dienst.info/tv-l |
| HR-EMP-003 | Eingruppierungsrichtlinien TV-L | TdL | 2024 | 2024 | Richtlinie | oeffentlicher-dienst.info |
| HR-EMP-004 | Nebentätigkeitsverordnung Berlin | Land Berlin | 2010 | 2024 | Verordnung | gesetze.berlin.de |
| HR-EMP-005 | Beurteilungsrichtlinien Berlin | Senatsverwaltung Inneres | 2020 | 2024 | Richtlinie | berlin.de/sen/inneres |

#### REMUNERATION

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-REM-001 | Besoldungstabellen Berlin 2025 | Senatsverwaltung Finanzen | 2025 | 2025 | Tabelle | berlin.de/sen/finanzen |
| HR-REM-002 | Zulagenübersicht TV-L | TdL | 2025 | 2025 | Übersicht | oeffentlicher-dienst.info |
| HR-REM-003 | Jahressonderzahlung TV-L | TdL | 2024 | 2025 | Regelung | oeffentlicher-dienst.info |

#### INTERNAL PROCEDURES

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| HR-INT-001 | Aktenordnung Berlin (AktO Bln) | Senatsverwaltung Inneres | 2015 | 2024 | Verwaltungsvorschrift | berlin.de/sen/inneres |
| HR-INT-002 | Unterschriftsregelung Berlin | Senatsverwaltung Finanzen | 2020 | 2024 | Regelung | berlin.de/sen/finanzen |
| HR-INT-003 | Geschäftsordnung Bezirksamt | Bezirksämter | 2020 | 2024 | Ordnung | berlin.de |
| HR-INT-004 | Dienstreisegenehmigung — Intern | Bezirksämter / Personalstellen | 2024 | 2024 | Verfahrensanweisung | berlin.de |

### 2.4 Cross-Domain Resources

| ID | Title | Authority | Published | Updated | Type | URL |
|----|-------|-----------|-----------|---------|------|-----|
| CRS-001 | Verwaltungsverfahrensgesetz (VwVfG) | Bund / BMI | 1976 | 2024 | Bundesgesetz | gesetze-im-internet.de/vwvfg |
| CRS-002 | Verwaltungsvollstreckungsgesetz (VwVG) | Bund | 1953 | 2024 | Bundesgesetz | gesetze-im-internet.de/vwvg |
| CRS-003 | Berliner E-Government-Gesetz (EGovG Bln) | Land Berlin | 2016 | 2024 | Landesgesetz | gesetze.berlin.de |
| CRS-004 | DSGVO / BDSG — Datenschutz | EU / Bund | 2016/2018 | 2024 | Verordnung/Gesetz | gesetze-im-internet.de/bdsg |
| CRS-005 | Gebührenordnung Berlin | Land Berlin | 2012 | 2024 | Verordnung | gesetze.berlin.de |

---

## 3. Download Plan

### 3.1 Tier 1 — Core Foundation (First to Index)
_Priority: HIGHEST — These documents are referenced by nearly every query in the domain_

**Procurement:**
1. GWB Teil 4 (§§ 97–184) — gesetze-im-internet.de/gwb
2. VgV — gesetze-im-internet.de/vgv
3. UVgO — gesetze-im-internet.de/uvgo
4. BerlAVG — gesetze.berlin.de
5. AV zu § 55 LHO — berlin.de/vergabeservice

**Building:**
6. BauO Bln — gesetze.berlin.de/bauobln
7. BauGB — gesetze-im-internet.de/baugb
8. BauNVO — gesetze-im-internet.de/baunvo
9. BauVorlV 2025 — berlin.de/sen/sbw
10. Schneller-Bauen-Gesetz — parlament-berlin.de

**HR:**
11. TV-L Vertragstext — oeffentlicher-dienst.info/tv-l
12. BRKG — gesetze-im-internet.de/brkg
13. LRKG Berlin — gesetze.berlin.de
14. Urlaubsverordnung Berlin — gesetze.berlin.de
15. Arbeitszeitverordnung Berlin — gesetze.berlin.de

### 3.2 Tier 2 — Operational Documents (Second to Index)
_Priority: HIGH — These provide operational detail_

16. VOB/A, VOB/B, VOB/C — vergabe.bund.de
17. VwVBU — berlin.de/nachhaltige-beschaffung
18. eVergabe Leitfaden — vergabe-plattform.berlin.de
19. Vergabehandbuch Berlin — berlin.de/vergabeservice
20. BLD-PER-001: Baugenehmigungsverfahren — berlin.de/bauaufsicht
21. BLD-CIT-001: Bauen in Berlin — berlin.de/sen/sbw
22. HR-HMO-001: Mobile Arbeit Rahmenvereinbarung — berlin.de/sen/inneres
23. HR-ITS-001: IT-Sicherheitsleitlinie — itdz-berlin.de
24. HR-EMP-002: TV-L Entgelttabellen 2025 — oeffentlicher-dienst.info
25. HR-TRV-005: Reisekostensätze 2025 — berlin.de/sen/finanzen

### 3.3 Tier 3 — Forms, Checklists, Citizen Info (Third to Index)
_Priority: MEDIUM — Practical forms and citizen-facing content_

26–45: All forms (FRM), citizen information (CIT), and checklists (CHK) from all three domains.

### 3.4 Tier 4 — Supplementary (Last to Index)
_Priority: STANDARD — Supporting documentation_

46–60: All remaining documents including FAQs, internal procedures, cross-domain resources.

---

## 4. Demo Questions (Per Document)

### 4.1 Procurement

| Document | Demo Questions |
|----------|---------------|
| GWB Teil 4 | "Welche Grundsätze muss unsere Vergabestelle bei einer EU-weiten Ausschreibung beachten?" / "Welche Rechtsmittel hat ein übergangener Bieter?" |
| VgV | "Welche Fristen gelten für ein offenes Verfahren nach VgV?" / "Welche Eignungskriterien darf ich im Teilnahmewettbewerb abfragen?" |
| UVgO | "Ab welchem Auftragswert muss ich eine beschränkte Ausschreibung machen?" / "Wann ist eine Verhandlungsvergabe ohne Teilnahmewettbewerb zulässig?" |
| VOB/A | "Wie schreibe ich Bauleistungen nach VOB/A aus?" / "Welche Besonderheiten gelten bei der Vergabe von Bauaufträgen?" |
| BerlAVG | "Welche vergabespezifischen Mindestlöhne gelten in Berlin?" / "Welche umweltbezogenen Kriterien muss ich nach BerlAVG berücksichtigen?" |
| AV zu § 55 LHO | "Wie hoch ist die Wertgrenze für einen Direktauftrag im Bereich Lieferungen und Dienstleistungen?" / "Was muss ich bei einer freihändigen Vergabe dokumentieren?" |
| Vergabeverfahren oberschwellig | "Von der Bekanntmachung bis zum Zuschlag — wie läuft ein EU-Vergabeverfahren ab?" |
| eVergabe | "Wie reiche ich ein Angebot über die Vergabeplattform Berlin ein?" |
| Vergabehandbuch | "Unser Bezirksamt will IT-Dienstleistungen beschaffen — was sind die einzelnen Schritte?" |
| Nachhaltige Beschaffung | "Welche Umweltkriterien gelten bei der Beschaffung von Fahrzeugen?" |

### 4.2 Building & Urban Planning

| Document | Demo Questions |
|----------|---------------|
| BauO Bln | "Welche Abstandsflächen gelten in geschlossener Bauweise?" / "Welche Anforderungen bestehen an den Brandschutz bei Wohngebäuden mittlerer Höhe?" |
| BauGB | "Wann muss ein Bebauungsplan aufgestellt werden?" / "Was ist der Unterschied zwischen qualifiziertem und einfachem Bebauungsplan?" |
| BauNVO | "Welche Nutzungen sind in einem Mischgebiet zulässig?" / "Wie hoch ist die maximale Grundflächenzahl in einem reinen Wohngebiet?" |
| BauVorlV (NEU 2025) | "Welche Bauvorlagen muss ich für einen Bauantrag einreichen?" / "Was ist neu an der Bauvorlagenverordnung 2025?" |
| Schneller-Bauen-Gesetz | "Was hat sich durch das Schneller-Bauen-Gesetz am Genehmigungsverfahren geändert?" / "Wann findet eine Bauantragskonferenz statt?" |
| Baugenehmigungsverfahren | "Ein Bürger möchte ein Einfamilienhaus bauen — welches Verfahren ist das richtige?" |
| Genehmigungsfreistellung | "Welche Vorhaben sind in Berlin genehmigungsfrei?" |
| Vorbescheid | "Was kostet ein Vorbescheid und wie lange ist er gültig?" |
| Bauantrag Schritt für Schritt | "Ich will eine Garage bauen — was muss ich tun?" |
| Digitaler Bauantrag | "Wie reiche ich einen Bauantrag elektronisch ein?" |

### 4.3 HR & Internal Administration

| Document | Demo Questions |
|----------|---------------|
| BRKG | "Wie hoch ist das Tagegeld bei einer dreitägigen Dienstreise?" / "Bis wann muss ich meine Reisekostenabrechnung einreichen?" |
| LRKG Berlin | "Gibt es Unterschiede zwischen BRKG und Berliner LRKG?" / "Welche Übernachtungspauschale gilt in Berlin?" |
| TV-L 2025 | "Welche Entgeltgruppe habe ich als Verwaltungsfachwirt?" / "Wann steige ich von Stufe 3 in Stufe 4 auf?" |
| Urlaubsverordnung | "Kann ich meinen Resturlaub ins nächste Jahr übertragen?" / "Wie viele Urlaubstage stehen mir nach TV-L zu?" |
| Arbeitszeitverordnung | "Wie sind die Kernarbeitszeiten in der Berliner Verwaltung?" / "Darf ich Gleitzeitüberstunden mit ins nächste Jahr nehmen?" |
| Mobile Arbeit | "An wie vielen Tagen pro Woche darf ich im Homeoffice arbeiten?" / "Wer trägt die Kosten für die Homeoffice-Ausstattung?" |
| IT-Sicherheit | "Darf ich meinen privaten Laptop für die Arbeit nutzen?" / "An wen muss ich einen IT-Sicherheitsvorfall melden?" |
| Beschaffungsordnung intern | "Ab welchem Betrag brauche ich drei Vergleichsangebote?" / "Wer darf Beschaffungen bis 500 € freigeben?" |
| Nebentätigkeit | "Muss ich eine Nebentätigkeit genehmigen lassen?" / "Welche Nebentätigkeiten sind anzeigepflichtig?" |
| Eingruppierung | "Nach welchen Kriterien erfolgt die Eingruppierung in die Entgeltgruppen?" |

---

## 5. Twenty SCCON Demonstration Scenarios

### Scenario 1: "Der Bauantrag" (The Building Application)
**Domain:** Building | **Complexity:** Medium
```
Citizen Ms. Müller wants to build a single-family house in Berlin-Pankow.
She visits the Bürgeramt and asks: "How do I apply for a building permit?"

→ Employee queries AI: "Welches Baugenehmigungsverfahren gilt für ein Einfamilienhaus in Berlin?"

→ AI retrieves: BauO Bln § 64, BauVorlV §§ 1-13

→ AI explains: Full building permit procedure, lists required documents (Bauvorlagen),
  identifies the responsible Bauaufsichtsbehörde at Bezirksamt Pankow.

→ AI provides: Forms checklist, fee information, estimated processing time (4 Wochen
  Vollständigkeitsprüfung + 1 Monat nach Vollständigkeit per Schneller-Bauen-Gesetz).

→ Employee prints information for citizen, confident in the accuracy.
```

### Scenario 2: "Die freihändige Vergabe" (The Negotiated Award)
**Domain:** Procurement | **Complexity:** Medium
```
A Sachbearbeiter at Bezirksamt Lichtenberg needs to commission a specialized IT service
valued at approximately €18,000.

→ Employee asks: "Kann ich diesen IT-Auftrag freihändig vergeben?"

→ AI retrieves: AV zu § 55 LHO, Wertgrenzen Berlin, UVgO § 14

→ AI finds: Freihändige Vergabe / Verhandlungsvergabe zulässig bis 100.000 € für
  Lieferungen/Dienstleistungen (beschränkte Ausschreibung erforderlich ab 100.000 €).

→ AI warns: Auch bei freihändiger Vergabe muss ein Vergabevermerk dokumentiert werden;
  Ex-post-Veröffentlichung auf Vergabeplattform ab 25.000 € erforderlich.

→ AI provides: Angebotsschreiben Muster, Verhandlungsprotokoll Muster.
```

### Scenario 3: "Dienstreise nach Brüssel" (Business Trip to Brussels)
**Domain:** HR | **Complexity:** Low
```
An employee from Senatsverwaltung is traveling to Brussels for a 3-day EU working group.

→ Employee asks: "Wie rechne ich meine Dienstreise nach Brüssel ab? Welche Sätze gelten?"

→ AI retrieves: BRKG, LRKG Berlin, Reisekostensätze 2025

→ AI returns: Tagegeld Brüssel (Ausland) = €47/Tag (24h), Übernachtung mit Beleg bis
  €142/Nacht, Fahrtkosten DB 2. Klasse erstattungsfähig, Antragsfrist 6 Monate.

→ AI provides: Reisekostenformular, Dienstreisegenehmigung Vorlage.

→ AI adds: Für Brüssel gelten die Auslandstagegelder nach BRKG — nicht LRKG.
```

### Scenario 4: "Die Bauantragskonferenz" (The Building Application Conference — NEW)
**Domain:** Building | **Complexity:** High
```
A developer plans a residential complex with 80 units in Berlin-Treptow.

→ Employee asks: "Muss für dieses Projekt eine Bauantragskonferenz durchgeführt werden?"

→ AI retrieves: BauO Bln § 58 Abs. 1a, Schneller-Bauen-Gesetz Art. 1

→ AI finds: Ja — Bauantragskonferenz ist verpflichtend für Wohnvorhaben ab 50 WE,
  Schulen, Kitas, und gewerbliche Vorhaben >3.000 m² Geschossfläche.

→ AI explains: Ablauf der Bauantragskonferenz, Teilnehmerkreis (Bauherr, Entwurfsverfasser,
  Bauaufsicht, betroffene Träger öffentlicher Belange), Termin innerhalb von 4 Wochen.

→ AI provides: Checkliste für Bauantragskonferenz, relevante BauGB-Bestimmungen.
```

### Scenario 5: "Nachhaltige Beschaffung" (Sustainable Procurement)
**Domain:** Procurement | **Complexity:** Medium
```
The procurement office needs to purchase 5 new service vehicles.

→ Employee asks: "Welche Umweltkriterien muss ich bei der Fahrzeugbeschaffung beachten?"

→ AI retrieves: VwVBU, BerlAVG § 7, Leitfaden Nachhaltige Beschaffung

→ AI returns: Verbindliche Umweltkriterien: CO2-Grenzwert ≤ 95 g/km (bzw. E-Fahrzeuge
  bevorzugt), Lebenszykluskosten müssen betrachtet werden, Nachweisführung über EEE.

→ AI provides: Leistungsblatt LB-04 Fahrzeuge (VwVBU Anhang 1).
```

### Scenario 6: "Homeoffice-Antrag" (Home Office Application)
**Domain:** HR | **Complexity:** Low
```
A Verwaltungsangestellte wants to work from home 2 days per week.

→ Employee asks: "Wie beantrage ich mobiles Arbeiten? Wie viele Tage sind erlaubt?"

→ AI retrieves: Mobile Arbeit Rahmenvereinbarung Berlin, Dienstvereinbarung Telearbeit

→ AI responds: Bis zu 3 Tage/Woche mobiles Arbeiten möglich nach aktueller
  Rahmenvereinbarung; schriftlicher Antrag erforderlich; Voraussetzung: geeignete
  Tätigkeit, dienstliche Interessen nicht beeinträchtigt.

→ AI provides: Homeoffice-Antrag Formular, IT-Sicherheit Merkblatt.

→ AI notes: Arbeitsschutzbestimmungen gelten auch im Homeoffice.
```

### Scenario 7: "Bayern oder Berlin?" (Bavaria or Berlin?)
**Domain:** Cross-domain | **Complexity:** High
```
An employee previously worked in Bavaria and thinks Bavarian rules apply.

→ Employee asks: "In Bayern durften wir Bauleistungen bis 50.000 € direkt vergeben. Gilt das in Berlin auch?"

→ AI retrieves: Berlin AV zu § 55 LHO, comparison with Bavarian rules

→ AI finds: Nein — in Berlin gelten andere Wertgrenzen! Direktauftrag im Hochbau nur
  bis 20.000 € (nicht 50.000 € wie in Bayern). Vorsicht bei Annahme länderübergreifender
  Einheitlichkeit — Vergaberecht ist Landessache unterhalb der EU-Schwellenwerte.

→ AI provides: Wertgrenzen Berlin Tabelle, Verweis auf AV zu § 55 LHO.
```

### Scenario 8: "Das vergessene Formular" (The Forgotten Form)
**Domain:** Building | **Complexity:** Medium
```
A citizen's building application was returned as incomplete.

→ Employee asks: "Welche Bauvorlagen fehlen in diesem Bauantrag für einen Dachgeschossausbau?"

→ AI retrieves: BauVorlV § 1, Bauvorlagenliste

→ AI lists required documents: Lageplan, Bauzeichnungen (Grundrisse, Schnitte, Ansichten),
  Baubeschreibung, Standsicherheitsnachweis, Brandschutznachweis (bei DG-Ausbau besonders
  relevant: zweiter Rettungsweg), statistischer Erhebungsbogen.

→ AI identifies: Brandschutznachweis fehlt — nach BauO Bln § 14 besonders wichtig beim
  Dachgeschossausbau.
```

### Scenario 9: "Urlaubstage übertragen" (Carrying Over Vacation Days)
**Domain:** HR | **Complexity:** Low
```
An employee still has 12 vacation days remaining in November.

→ Employee asks: "Kann ich meinen Resturlaub ins nächste Jahr übertragen?"

→ AI retrieves: Urlaubsverordnung Berlin, TV-L § 26

→ AI answers: Ja — Übertragung bis 31.03. des Folgejahres möglich. Bei Krankheit oder
  dringenden dienstlichen Gründen auch darüber hinaus. Verfall droht ohne rechtzeitigen
  Antrag — Übertragungsantrag vor dem 15.12. stellen!

→ AI also notes: Erholungsurlaub beträgt 30 Tage/Jahr bei 5-Tage-Woche (TV-L).
```

### Scenario 10: "Die Typengenehmigung" (The Type Approval — NEU 2025)
**Domain:** Building | **Complexity:** High
```
A housing association wants to build identical modular homes at 5 locations.

→ Employee asks: "Können wir eine Typengenehmigung für unsere Serienhäuser beantragen?"

→ AI retrieves: BauO Bln § 72a, BauVorlV §§ 14–18

→ AI answers: Ja — die Typengenehmigung ist neu seit dem 6. Änderungsgesetz 2023 und
  jetzt in der BauVorlV 2025 verfahrensrechtlich ausgestaltet. Sie ermöglicht die
  einheitliche Prüfung eines Gebäudetyps, der dann an mehreren Standorten ohne erneute
  vollständige Prüfung errichtet werden kann.

→ AI provides: Antragsverfahren, erforderliche Unterlagen, Gültigkeitsdauer 5 Jahre,
  zuständig: Senatsverwaltung für Bauen (nicht Bezirksamt).
```

### Scenario 11: "IT-Sicherheitsvorfall" (IT Security Incident)
**Domain:** HR / Internal | **Complexity:** Medium
```
An employee received a suspicious email and clicked a link.

→ Employee asks: "Ich habe auf einen Phishing-Link geklickt. Was muss ich jetzt tun?"

→ AI retrieves: IT-Sicherheitsleitlinie Berlin, Dienstanweisung IT-Nutzung

→ AI answers: Sofortmaßnahmen: 1) Computer vom Netzwerk trennen, 2) IT-Sicherheitsbeauftragten
  informieren (Telefon-Hotline ITDZ: ...), 3) Passwörter ändern, 4) Vorfall dokumentieren.
  Meldepflicht innerhalb von 2 Stunden!

→ AI provides: Meldeformular IT-Sicherheitsvorfall, Kontaktdaten IT-Notfallteam.
```

### Scenario 12: "Unterschwellenvergabe — Das Dilemma" (Sub-Threshold — The Dilemma)
**Domain:** Procurement | **Complexity:** High
```
A Fachbereich needs to procure specialized planning services worth €45,000.

→ Employee asks: "Wir brauchen ein spezielles Planungsbüro — nur drei Büros in Berlin
  haben die nötige Expertise. Müssen wir trotzdem EU-weit ausschreiben?"

→ AI retrieves: VgV, UVgO, GWB § 108

→ AI finds: 45.000 € liegt UNTER dem EU-Schwellenwert für Dienstleistungen (derzeit
  ca. 221.000 €). Daher gilt UVgO, nicht VgV. Beschränkte Ausschreibung mit
  Teilnahmewettbewerb zulässig. ABER: Berliner Wertgrenzen beachten! Beschränkte
  Ausschreibung erst ab 100.000 € — darunter ist Verhandlungsvergabe mit
  Teilnahmewettbewerb möglich.

→ AI warns: Die Begründung "nur drei Büros haben die Expertise" muss objektiv
  dokumentiert werden (Vergabevermerk!). Markterkundung durchführen.
```

### Scenario 13: "Beschaffung ohne Genehmigung" (Procurement Without Approval)
**Domain:** HR / Cross-domain | **Complexity:** Medium
```
A team leader bought office equipment for €800 without approval.

→ Employee asks (from audit): "Ist eine Beschaffung über 800 € ohne vorherige Genehmigung zulässig?"

→ AI retrieves: Beschaffungsordnung Berlin, AV zu § 55 LHO, Wertgrenzen intern

→ AI answers: Nein — nach interner Beschaffungsordnung liegt die Genehmigungsgrenze für
  Einzelbeschaffungen bei 500 € (Bezirksamt). Beträge über 500 € benötigen vorherige
  schriftliche Genehmigung durch Vorgesetzte. Ab 1.000 € ist ein Vergabevermerk Pflicht.

→ AI flags: Haushaltsrechtlicher Verstoß — Rückabwicklung prüfen, ggf. nachträgliche
  Genehmigung durch Amtsleiter einholen.
```

### Scenario 14: "Grenzbebauung" (Boundary Development)
**Domain:** Building | **Complexity:** High
```
A property owner wants to build directly on the property line.

→ Employee asks: "Unter welchen Voraussetzungen darf an die Grundstücksgrenze gebaut werden?"

→ AI retrieves: BauO Bln § 6 (Abstandsflächen), BauNVO, relevante Bebauungspläne

→ AI answers: Grenzbebauung grundsätzlich nur zulässig wenn: 1) Bebauungsplan dies
  festsetzt (geschlossene Bauweise), 2) Nachbar zustimmt (Baulast), 3) Gebäude
  bestimmte Maximalmaße nicht überschreitet (≤ 9 m Länge, ≤ 3,20 m Höhe je nach
  BauO Bln § 6 Abs. 7), 4) öffentlich-rechtlich gesichert.

→ AI adds: Ohne Bebauungsplan gilt die offene Bauweise — Abstandsfläche 0,4 H,
  mindestens 3 m nach BauO Bln § 6.
```

### Scenario 15: "Sonderurlaub für Pflegefall" (Special Leave for Care Case)
**Domain:** HR | **Complexity:** Medium
```
An employee's mother had a stroke and needs acute care.

→ Employee asks: "Kann ich Sonderurlaub für die Pflege meiner Mutter bekommen?"

→ AI retrieves: Sonderurlaubsverordnung (SUrlV), TV-L § 29, PflegeZG, FPfZG

→ AI answers: Mehrere Optionen: 1) Kurzzeitige Arbeitsverhinderung nach PflegeZG:
  bis zu 10 Tage Freistellung mit Lohnersatz (Pflegeunterstützungsgeld), 2) Sonderurlaub
  nach SUrlV: bis zu 4 Tage unter Fortzahlung der Bezüge bei akutem Pflegefall eines
  nahen Angehörigen, 3) Pflegezeit nach PflegeZG: bis zu 6 Monate (unbezahlt).

→ AI provides: Antragsformular Sonderurlaub, Merkblatt Pflegezeit.
```

### Scenario 16: "Der Ärger mit dem Nachbarn" (The Trouble With the Neighbor)
**Domain:** Building | **Complexity:** Medium
```
A citizen complains that the neighbor's new shed blocks their light.

→ Employee asks: "Mein Nachbar hat einen Schuppen direkt an der Grenze gebaut — ist das erlaubt?"

→ AI retrieves: BauO Bln § 6, § 61 (Beseitigung von Anlagen)

→ AI answers: Abhängig von der Größe: Verfahrensfreie Vorhaben bis 30 m³ Brutto-Rauminhalt
  im Innenbereich (§ 61 BauO Bln) dürfen ohne Genehmigung gebaut werden, müssen aber
  trotzdem die Abstandsflächenvorschriften einhalten. Wenn der Schuppen größer ist oder
  Abstandsflächen verletzt: Nachbar kann sich an die Bauaufsicht wenden.

→ AI provides: Kontakt Bauaufsicht Bezirksamt, Hinweis auf Nachbarschaftsrecht Berlin.
```

### Scenario 17: "Neue Entgelttabellen 2025" (New Pay Tables 2025)
**Domain:** HR | **Complexity:** Low
```
An HR officer needs to update all salary calculations for the new year.

→ Employee asks: "Was sind die neuen TV-L Entgelte ab Februar 2025 für EG 9 bis EG 12?"

→ AI retrieves: TV-L Entgelttabellen 2025

→ AI returns: Complete pay table with three columns (until 31.10.2024 / 01.11.2024–31.01.2025 /
  ab 01.02.2025). EG 9 Stufe 2: 3.117,96 € → 3.317,96 € → 3.500,45 €. EG 11 Stufe 3:
  3.614,58 € → 3.814,58 € → 4.024,38 €.

→ AI notes: Sockelbetrag von +200 € ab 1.11.2024, +5,5% (mindestens +340 €) ab 1.2.2025.
```

### Scenario 18: "Verfahrensfrei, aber..." (Permit-Free, But...)
**Domain:** Building | **Complexity:** Medium
```
A homeowner thinks they don't need any permission for a carport.

→ Employee asks: "Mein Bürger will einen Carport bauen — ist das genehmigungsfrei?"

→ AI retrieves: BauO Bln § 61 (Genehmigungsfreie Vorhaben), § 62 (Genehmigungsfreistellung)

→ AI answers: Carport bis 30 m² Grundfläche grundsätzlich verfahrensfrei nach § 61 BauO Bln,
  ABER: 1) Abstandsflächen müssen eingehalten werden (§ 6), 2) Bei Lage im Vorgarten
  möglicherweise unzulässig (ortsübliche Eigenart), 3) Stellplatzsatzung des Bezirks beachten,
  4) Bebauungsplanfestsetzungen können Carports ausschließen.

→ AI advises: Empfehlung einer kurzen Bauvoranfrage (§ 75 BauO Bln) zur Klärung.
```

### Scenario 19: "EU-Bekanntmachung vergessen" (EU Notice Forgotten)
**Domain:** Procurement | **Complexity:** High
```
A Vergabestelle awarded a €230,000 service contract without EU-wide publication.

→ Employee asks (from Rechtsamt): "Wir haben einen Dienstleistungsauftrag über 230.000 €
  ohne EU-Bekanntmachung vergeben. Welche Konsequenzen drohen?"

→ AI retrieves: GWB § 135 (Unwirksamkeit), § 134 (Informations- und Wartepflicht)

→ AI finds: SCHWERWIEGENDER VERSTOSS! EU-Schwellenwert Dienstleistungen liegt bei ca.
  221.000 € — der Auftrag ist EU-weit ausschreibungspflichtig. Ohne EU-Bekanntmachung:
  Vertrag schwebend unwirksam (§ 135 GWB). Frist zur Rüge: 30 Tage ab Kenntnis des
  Verstoßes, Klagefrist: 6 Monate ab Vertragsschluss.

→ AI warns: Unverzüglich Rechtsamt einschalten. Möglichkeit der Heilung nur innerhalb
  der 30-Tage-Frist und wenn keine Rüge eines potenziellen Bieters vorliegt.
```

### Scenario 20: "Die neue Mitarbeiterin" (The New Employee — Onboarding)
**Domain:** HR / Cross-domain | **Complexity:** Medium
```
A new employee starts at Bezirksamt Mitte and needs to understand all relevant rules.

→ New employee asks: "Ich bin neu in der Berliner Verwaltung. Was muss ich über Arbeitszeit,
  Urlaub, IT-Nutzung und Dienstreisen wissen?"

→ AI retrieves: Arbeitszeitverordnung, Urlaubsverordnung, IT-Dienstanweisung,
  LRKG Berlin, TV-L Grundlagen

→ AI compiles a structured onboarding overview:
  - Arbeitszeit: 40 Std./Woche (39 Std. 50 min. für Beamte), Gleitzeit mit Kernzeit 9:30–15:00
  - Urlaub: 30 Tage/Jahr (5-Tage-Woche), Übertragung bis 31.03. möglich
  - IT: Keine private Software installieren, Passwort alle 90 Tage ändern, Phishing-Prävention
  - Dienstreise: Genehmigung vorher einholen, Abrechnung innerhalb 6 Monate
  - TV-L: 3.000 € Inflationsausgleich erhalten, reguläre Gehaltserhöhung ab 1.2.2025

→ AI provides: Alle relevanten Formulare und Merkblätter als Download.
```

---

## 6. Recommended Indexing Order

The documents should be indexed in the following order to maximize demo quality:

### Phase 1: Foundation (Index first — 15 documents)
```
1.  BLD-REG-001  BauO Bln                           (most-referenced Berlin regulation)
2.  BLD-REG-002  BauGB                              (federal foundation)
3.  BLD-REG-003  BauNVO                             (zoning backbone)
4.  PROC-REG-001 GWB Teil 4                         (procurement backbone)
5.  PROC-REG-002 VgV                                (procurement core)
6.  PROC-REG-003 UVgO                               (sub-threshold common case)
7.  PROC-REG-008 AV zu § 55 LHO                     (Berlin-specific thresholds)
8.  HR-EMP-001   TV-L 2025                          (most-referenced HR document)
9.  HR-TRV-001   BRKG                               (travel core)
10. HR-VAC-001   Urlaubsverordnung Berlin            (vacation core)
11. HR-WKT-001   Arbeitszeitverordnung Berlin         (working time core)
12. BLD-REG-004  BauVorlV 2025                       (procedural core, NEW)
13. BLD-REG-006  Schneller-Bauen-Gesetz               (recent reform, NEW)
14. CRS-001      VwVfG                               (cross-cutting administrative law)
15. PROC-REG-007 BerlAVG                             (Berlin-specific procurement)
```

### Phase 2: Depth (25 documents)
```
16-40: All procedures (PRO), forms (FRM), manuals (MAN), and key secondary regulations
from all three domains.
```

### Phase 3: Richness (20 documents)
```
41-60: All remaining documents — FAQs, checklists, citizen information, templates,
cross-domain resources.
```

---

## 7. Format & Conversion Notes

### Source Format Conversion

| Source Format | Target Format | Notes |
|---------------|---------------|-------|
| HTML (gesetze-im-internet.de) | Markdown | Preserve § references and structure |
| PDF (berlin.de) | Markdown + extract tables | Tables need manual verification |
| HTML (service.berlin.de) | Markdown | Citizen information pages |
| HTML (oeffentlicher-dienst.info) | Markdown | Pay tables need careful extraction |
| PDF (vergabe.bund.de) | Markdown | VOB documents |
| EU Directives (eur-lex) | Markdown | Multi-lingual, use DE version |

### Quality Rules
1. Always preserve original paragraph/section numbering (§ references)
2. Tables must be exact — verify against source
3. Include publication date and source URL in every document
4. Do not summarize or paraphrase legal texts
5. Mark direct quotes from legal sources clearly
6. Add "Stand:" (Last updated) date at top of each document

---

## 8. Comprehensive Document Summary

**Total documents in corpus:** 60+
- Procurement: 27 documents (11 regulations, 8 procedures, 5 forms, 4 manuals, 4 FAQs, 3 checklists)
- Building: 30 documents (10 regulations, 5 zoning, 7 permits, 6 procedures, 5 citizen-info, 5 forms, 3 checklists)
- HR: 35 documents (6 travel, 5 vacation, 5 home-office, 5 working-time, 4 procurement-approval, 5 IT-security, 5 employment, 3 remuneration, 4 internal-procedures)
- Cross-domain: 5 documents

**Authority distribution:**
- Land Berlin (Senatsverwaltungen, Bezirksämter): ~45 documents
- Bund (Bundesministerien, Bundestag): ~10 documents
- EU: ~2 documents
- Tarifgemeinschaft Länder (TdL): ~3 documents
```
