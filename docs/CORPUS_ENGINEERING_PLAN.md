# Corpus Engineering Plan — Berlin Municipal Administration

**Role:** Knowledge Engineer  
**Date:** 2026-07-14  
**Platform:** Municipal Decision Assistant  
**Scope:** Berlin state administration (Bezirksämter + Senatsverwaltungen)

---

## 1. Corpus Blueprint

### Document Categories — What Municipal Employees Actually Use

A Berlin municipal employee's daily work relies on a hierarchy of documents. The law is the foundation, but most daily decisions are made using administrative regulations, internal manuals, templates, and checklists — not by reading the GWB directly.

---

### Tier 1 — Primary Law (Gesetze & Rechtsverordnungen)

**What it is:** The binding legal framework. These documents define what is allowed, required, and prohibited.

**Who uses it:** Everyone, but primarily legal departments, procurement officers, and Bauaufsicht.

**How it's used:** Looked up when a question of legal compliance arises. Not read cover-to-cover daily.

#### 1A — Federal Law (Bundesrecht)

| # | Document | Abbreviation | Pages | Update Frequency | Daily Use Frequency |
|---|---|---|---|---|---|
| 1 | Gesetz gegen Wettbewerbsbeschränkungen (Teil 4, §§ 97-184) | GWB | ~35 | Jährlich (Reformen) | Weekly (Vergabestelle) |
| 2 | Vergabeverordnung | VgV | ~25 | Alle 2-3 Jahre | Weekly (Vergabestelle) |
| 3 | Unterschwellenvergabeordnung | UVgO | ~15 | Alle 2-3 Jahre | Daily (Vergabestelle) |
| 4 | VOB/A (Vergabe- und Vertragsordnung für Bauleistungen) | VOB/A | ~20 | Alle 2-3 Jahre | Weekly (Bauvergabe) |
| 5 | Bundesreisekostengesetz | BRKG | ~20 | Alle 2-3 Jahre | Weekly (alle Abteilungen) |
| 6 | Arbeitszeitgesetz | ArbZG | ~10 | Selten | Occasionally (HR) |
| 7 | Teilzeit- und Befristungsgesetz | TzBfG | ~8 | Selten | Occasionally (HR) |
| 8 | Bundesdatenschutzgesetz | BDSG | ~25 | Alle 2-3 Jahre | Monthly (Datenschutzbeauftragter) |
| 9 | Bundeselterngeld- und Elternzeitgesetz | BEEG | ~10 | Selten | Monthly (HR) |
| 10 | Mutterschutzgesetz | MuSchG | ~10 | Selten | Monthly (HR) |
| 11 | Verwaltungsverfahrensgesetz | VwVfG | ~30 | Selten | Weekly (Rechtsamt) |
| 12 | Verwaltungsgerichtsordnung (Auszug) | VwGO | ~15 | Selten | Monthly (Rechtsamt) |
| 13 | Baugesetzbuch | BauGB | ~40 | Jährlich | Weekly (Bauaufsicht) |
| 14 | Baunutzungsverordnung | BauNVO | ~15 | Selten | Weekly (Bauaufsicht) |
| 15 | Bundes-Immissionsschutzgesetz (Auszug) | BImSchG | ~15 | Selten | Monthly (Umweltamt) |
| 16 | Kreislaufwirtschaftsgesetz (Auszug) | KrWG | ~10 | Selten | Monthly (Umweltamt) |
| 17 | Gesetz gegen Korruption im Gesundheitswesen (Auszug für Vergabe) | §§ 299a-299b StGB | ~3 | Selten | Occasionally (Compliance) |
| 18 | Hinweisgeberschutzgesetz | HinSchG | ~8 | Neu (2023) | Occasionally (Compliance) |

#### 1B — Berlin State Law (Landesrecht)

| # | Document | Abbreviation | Pages | Update Frequency | Daily Use Frequency |
|---|---|---|---|---|---|
| 19 | Bauordnung für Berlin | BauO Bln | ~40 | Alle 2-3 Jahre | **Daily (Bauaufsicht)** |
| 20 | Berliner Ausschreibungs- und Vergabegesetz | BerlAVG | ~10 | Alle 2-3 Jahre | **Daily (Vergabestelle)** |
| 21 | Urlaubsverordnung Berlin | UrlVO Bln | ~20 | Selten | Weekly (HR) |
| 22 | Arbeitszeitverordnung Berlin | AZVO Bln | ~16 | Selten | Weekly (HR) |
| 23 | Landesreisekostengesetz Berlin | LRKG | ~15 | Alle 2-3 Jahre | Weekly (alle Abteilungen) |
| 24 | Landeshaushaltsordnung Berlin | LHO | ~30 | Jährlich | Weekly (Haushalt) |
| 25 | Bezirksverwaltungsgesetz | BezVG | ~15 | Selten | Monthly (Verwaltungsleitung) |
| 26 | Berliner Datenschutzgesetz | BlnDSG | ~15 | Alle 2-3 Jahre | Monthly (Datenschutzbeauftragter) |
| 27 | E-Government-Gesetz Berlin | EGovG Bln | ~8 | Selten | Occasionally (IT) |
| 28 | Schneller-Bauen-Gesetz Berlin 2024 | — | ~12 | Einmalig (aktuell) | Weekly (Bauaufsicht) |

#### 1C — EU Law (Relevant Excerpts)

| # | Document | Pages | Update Frequency |
|---|---|---|---|
| 29 | EU-Vergaberichtlinie 2014/24/EU (relevante Auszüge) | ~10 | Selten |
| 30 | EU-Schwellenwerte 2024/2026 (Mitteilung der Kommission) | ~2 | Alle 2 Jahre |
| 31 | DSGVO (relevante Auszüge für öffentliche Verwaltung) | ~10 | Selten |

**Tier 1 total: ~31 documents, ~530 pages**

---

### Tier 2 — Administrative Regulations (Verwaltungsvorschriften & Rundschreiben)

**What it is:** Binding internal rules that translate laws into concrete procedures. These are the documents municipal employees actually consult daily.

#### 2A — Ausführungsvorschriften (AVs)

| # | Document | Pages | Domain | Update |
|---|---|---|---|---|
| 32 | AV zu §55 LHO (Vergabe) — complete with all appendices | 20 | Procurement | Jährlich |
| 33 | AV zu §7 LHO (Wirtschaftlichkeit und Sparsamkeit) | 8 | Finance | Alle 3 Jahre |
| 34 | AV zu §9 LHO (Haushaltsvermerke) | 5 | Finance | Alle 3 Jahre |
| 35 | AV zu §34 LHO (Verpflichtungsermächtigungen) | 5 | Finance | Alle 3 Jahre |
| 36 | AV zu §63 LHO (Zuwendungen) | 15 | Finance | Alle 3 Jahre |
| 37 | AV Umwelt — Nachhaltige Beschaffung Berlin | 10 | Procurement | Alle 3 Jahre |
| 38 | AV Soziale Kriterien — Tariftreue, Mindestlohn, ILO | 8 | Procurement | Alle 3 Jahre |

#### 2B — Internal Administrative Regulations

| # | Document | Pages | Domain | Update |
|---|---|---|---|---|
| 39 | Beschaffungsordnung Berlin | 20 | Procurement | Jährlich |
| 40 | Vergabehandbuch Berlin (alle Kapitel) | 50 | Procurement | Alle 3 Jahre |
| 41 | Personalhandbuch Berlin (ausgewählte Kapitel) | 30 | HR | Jährlich |
| 42 | IT-Sicherheitsleitlinie Berlin | 10 | IT | Alle 2 Jahre |
| 43 | Passwort-Richtlinie Berlin | 3 | IT | Jährlich |
| 44 | Mobile-Device-Richtlinie | 5 | IT | Alle 2 Jahre |
| 45 | E-Mail- und Internet-Nutzungsrichtlinie | 5 | IT | Alle 2 Jahre |
| 46 | Dienstvereinbarung Mobile Arbeit | 8 | HR | Alle 3 Jahre |
| 47 | Dienstvereinbarung Gleitzeit | 5 | HR | Selten |
| 48 | Antikorruptionsrichtlinie Berlin | 8 | Compliance | Alle 3 Jahre |
| 49 | Verhaltenskodex öffentlicher Dienst Berlin | 5 | Compliance | Selten |
| 50 | Sponsoring-Richtlinie Berlin | 3 | Compliance | Selten |

#### 2C — Rundschreiben (Circulars — Current Guidance)

Circulars are the most operationally important documents. They translate law into current practice.

| # | Document | Pages | Domain | Update |
|---|---|---|---|---|
| 51 | Rundschreiben Direktaufträge — aktuelle Auslegung AV §55 | 5 | Procurement | Ad-hoc (jährlich erwartet) |
| 52 | Rundschreiben Beschränkte Ausschreibung — Praxis | 5 | Procurement | Ad-hoc |
| 53 | Rundschreiben Vergabevermerk — Dokumentation | 8 | Procurement | Ad-hoc |
| 54 | Rundschreiben eVergabe-Pflicht Berlin | 5 | Procurement | Ad-hoc |
| 55 | Rundschreiben Ex-Post-Bekanntmachung | 3 | Procurement | Ad-hoc |
| 56 | Rundschreiben Brandschutz im Wohnungsbau | 8 | Building | Ad-hoc |
| 57 | Rundschreiben Abstandsflächen — aktuelle Auslegung | 5 | Building | Ad-hoc |
| 58 | Rundschreiben Stellplatzpflicht Berlin | 5 | Building | Ad-hoc |
| 59 | Rundschreiben Fahrradabstellplätze | 3 | Building | Ad-hoc |
| 60 | Rundschreiben Barrierefreies Bauen | 5 | Building | Ad-hoc |
| 61 | Rundschreiben Dienstreise — elektronische Abrechnung | 5 | HR | Ad-hoc |
| 62 | Rundschreiben Homeoffice-Erstattung | 3 | HR | Ad-hoc |
| 63 | Rundschreiben Datenschutz bei Homeoffice | 5 | IT | Ad-hoc |
| 64 | Rundschreiben Umgang mit Bürgerdaten | 5 | Data | Ad-hoc |

**Tier 2 total: ~33 documents, ~300 pages**

---

### Tier 3 — Operational Documents (Handbücher, Prozesse, Leitfäden)

#### 3A — Manuals and Process Descriptions

| # | Document | Pages | Domain |
|---|---|---|---|
| 65 | Leitfaden Direktauftrag — Schritt für Schritt | 8 | Procurement |
| 66 | Leitfaden Beschränkte Ausschreibung — Schritt für Schritt | 10 | Procurement |
| 67 | Leitfaden Öffentliche Ausschreibung — Schritt für Schritt | 12 | Procurement |
| 68 | Leitfaden EU-weite Ausschreibung | 15 | Procurement |
| 69 | Leitfaden Verhandlungsvergabe | 8 | Procurement |
| 70 | Leitfaden Rahmenverträge verwalten | 8 | Procurement |
| 71 | Leitfaden Vergabevermerk schreiben | 10 | Procurement |
| 72 | Leitfaden Angebotswertung | 8 | Procurement |
| 73 | Leitfaden Eignungsprüfung | 8 | Procurement |
| 74 | eVergabe-Plattform Berlin — Benutzerhandbuch | 20 | Procurement |
| 75 | Leitfaden Bauantragstellung für Bauherren | 10 | Building |
| 76 | Leitfaden Genehmigungsfreie Vorhaben | 8 | Building |
| 77 | Leitfaden Brandschutznachweis | 10 | Building |
| 78 | Leitfaden Bauen im Bestand | 8 | Building |
| 79 | Leitfaden Denkmalschutz und Bauen | 8 | Building |
| 80 | Leitfaden Dienstreise beantragen und abrechnen | 8 | HR |
| 81 | Leitfaden Urlaubsantrag — Fristen und Verfahren | 5 | HR |
| 82 | Leitfaden Stellenausschreibung | 10 | HR |
| 83 | Leitfaden Vorstellungsgespräch führen | 8 | HR |
| 84 | Leitfaden Onboarding neuer Mitarbeiter | 10 | HR |
| 85 | Leitfaden Beschaffungsantrag stellen | 5 | Finance |
| 86 | Leitfaden Rechnung prüfen und anweisen | 5 | Finance |
| 87 | Leitfaden Haushaltsmittel bewirtschaften | 10 | Finance |
| 88 | Leitfaden Zuwendungsbescheid erstellen | 8 | Finance |
| 89 | Leitfaden Datenschutz-Folgenabschätzung | 10 | Data |
| 90 | Leitfaden Akteneinsichtsantrag bearbeiten | 5 | Admin |
| 91 | Leitfaden Widerspruchsverfahren | 8 | Admin |
| 92 | Leitfaden Bescheid erstellen | 8 | Admin |

**Tier 3A total: ~28 documents, ~250 pages**

#### 3B — Checklists

| # | Document | Pages | Domain |
|---|---|---|---|
| 93 | Checkliste Direktauftrag (Lieferung/Dienstleistung) | 2 | Procurement |
| 94 | Checkliste Beschränkte Ausschreibung | 2 | Procurement |
| 95 | Checkliste Öffentliche Ausschreibung | 2 | Procurement |
| 96 | Checkliste EU-weite Ausschreibung | 2 | Procurement |
| 97 | Checkliste Vergabevermerk | 2 | Procurement |
| 98 | Checkliste Angebotswertung | 2 | Procurement |
| 99 | Checkliste Bauantrag Einfamilienhaus | 2 | Building |
| 100 | Checkliste Bauantrag Mehrfamilienhaus | 2 | Building |
| 101 | Checkliste Bauantrag Gewerbe | 2 | Building |
| 102 | Checkliste Vorbescheid | 2 | Building |
| 103 | Checkliste Nutzungsänderung | 2 | Building |
| 104 | Checkliste Brandschutznachweis | 2 | Building |
| 105 | Checkliste Einstellung neuer Mitarbeiter | 2 | HR |
| 106 | Checkliste Austritt Mitarbeiter | 2 | HR |
| 107 | Checkliste Dienstreise — vor der Reise | 2 | HR |
| 108 | Checkliste Dienstreise — nach der Reise | 2 | HR |
| 109 | Checkliste Beschaffungsantrag | 2 | Finance |
| 110 | Checkliste Datenschutz neues Verfahren | 2 | Data |
| 111 | Checkliste Widerspruchsbescheid | 2 | Admin |

**Tier 3B total: ~19 documents, ~38 pages**

---

### Tier 4 — Templates and Forms

#### 4A — Templates (Vorlagen — to be filled in)

| # | Document | Pages | Domain |
|---|---|---|---|
| 112 | Vergabevermerk-Vorlage Direktauftrag | 2 | Procurement |
| 113 | Vergabevermerk-Vorlage Beschränkte Ausschreibung | 3 | Procurement |
| 114 | Vergabevermerk-Vorlage Öffentliche Ausschreibung | 3 | Procurement |
| 115 | Angebotsaufforderung (Muster) | 2 | Procurement |
| 116 | Leistungsbeschreibung (Muster) | 5 | Procurement |
| 117 | Bewertungsmatrix (Muster) | 2 | Procurement |
| 118 | Absageschreiben (Muster) | 1 | Procurement |
| 119 | Zuschlagsschreiben (Muster) | 1 | Procurement |
| 120 | Ex-Post-Bekanntmachung (Muster) | 2 | Procurement |
| 121 | Bieterfragen-Protokoll (Muster) | 1 | Procurement |
| 122 | Aufklärungsgespräch-Protokoll (Muster) | 1 | Procurement |
| 123 | Angebotsvergleich-Vorlage | 2 | Procurement |
| 124 | Arbeitsvertrag TV-L (Muster) | 5 | HR |
| 125 | Änderungsvertrag TV-L (Muster) | 2 | HR |
| 126 | Teilzeit-Antrag (Muster) | 1 | HR |
| 127 | Urlaubsantrag (Muster) | 1 | HR |
| 128 | Dienstreise-Antrag (Muster) | 1 | HR |
| 129 | Dienstreise-Abrechnung (Muster) | 2 | HR |
| 130 | Homeoffice-Vereinbarung (Muster) | 2 | HR |
| 131 | Fortbildungsantrag (Muster) | 1 | HR |
| 132 | Stellenbeschreibung (Muster) | 2 | HR |
| 133 | Ausschreibungstext (Muster) | 2 | HR |
| 134 | Aktenvermerk (Muster) | 1 | Admin |
| 135 | Besprechungsprotokoll (Muster) | 1 | Admin |
| 136 | Entscheidungsvorlage (Muster) | 2 | Admin |
| 137 | Sachstandsbericht (Muster) | 1 | Admin |
| 138 | Beschaffungsantrag (Muster) | 1 | Finance |

**Tier 4A total: ~27 documents, ~50 pages**

#### 4B — Official Forms (Formulare)

| # | Document | Pages | Domain |
|---|---|---|---|
| 139 | Bauantrag (official form, all sections) | 5 | Building |
| 140 | Bauvorbescheid-Antrag | 3 | Building |
| 141 | Teilbaugenehmigung-Antrag | 3 | Building |
| 142 | Nutzungsänderung-Antrag | 3 | Building |
| 143 | Abbruchantrag | 2 | Building |
| 144 | Abgeschlossenheitsbescheinigung | 2 | Building |
| 145 | Baulast-Erklärung | 2 | Building |
| 146 | Werbeanlage-Antrag | 2 | Building |
| 147 | Befreiung-Antrag | 2 | Building |
| 148 | Abweichung-Antrag | 2 | Building |
| 149 | Stellplatz-Ablösevereinbarung | 2 | Building |
| 150 | Verlängerung-Baugenehmigung-Antrag | 1 | Building |
| 151 | Baugenehmigung (Bescheid-Muster) | 3 | Building |
| 152 | Widerspruchsbescheid Bau (Muster) | 2 | Building |
| 153 | Sondernutzungserlaubnis (Straßenland) | 2 | Building |
| 154 | Gaststättenerlaubnis-Antrag | 3 | Admin |
| 155 | Gewerbeanmeldung / -ummeldung | 2 | Admin |

**Tier 4B total: ~17 documents, ~40 pages**

---

### Tier 5 — Reference Materials (Rechtsprechung, FAQ, Guidance)

#### 5A — Court Decisions (Leitsatzentscheidungen)

| # | Source | Count | Pages | Domain |
|---|---|---|---|---|
| 156-185 | Vergabekammer Berlin — Leitsatzentscheidungen (2018-2025) | 30 | ~5 each | Procurement |
| 186-195 | Vergabekammer des Bundes — ausgewählte Leitsätze | 10 | ~5 each | Procurement |
| 196-220 | OVG Berlin-Brandenburg — Baurecht Leitsatzentscheidungen | 25 | ~5 each | Building |
| 221-230 | VG Berlin — Verwaltungsrecht (Personal, Datenschutz) | 10 | ~5 each | Admin |
| 231-235 | BVerwG — Bauplanungsrecht Leitsätze (ausgewählt) | 5 | ~5 each | Building |

**Tier 5A total: ~80 documents, ~400 pages**

#### 5B — Official Guidance (Leitfäden, Merkblätter, Bürgerinformationen)

| # | Document | Pages | Domain |
|---|---|---|---|
| 236 | Nachhaltige Beschaffung — Leitfaden für Vergabestellen | 15 | Procurement |
| 237 | Umweltkriterien IT-Beschaffung — Leitfaden | 8 | Procurement |
| 238 | Faire Beschaffung — Leitfaden | 8 | Procurement |
| 239 | Bauen in Berlin — Leitfaden für Bauherren | 10 | Building |
| 240 | Abstandsflächen — Merkblatt | 3 | Building |
| 241 | Genehmigungsfreie Vorhaben — Merkblatt | 3 | Building |
| 242 | Carport und Garage — Bürgerinformation | 2 | Building |
| 243 | Wintergarten — baurechtliche Grundlagen | 2 | Building |
| 244 | Solaranlagen auf dem Dach — Merkblatt | 3 | Building |
| 245 | Wärmepumpe im Garten — Merkblatt | 2 | Building |
| 246 | Dachgeschossausbau — Leitfaden | 5 | Building |
| 247 | Regenwassermanagement — Leitfaden | 5 | Building |
| 248 | Denkmalschutz und Bauen — Merkblatt | 3 | Building |
| 249 | Barrierefreies Bauen — Leitfaden | 8 | Building |
| 250 | Stellplatzsatzung Berlin — Merkblatt | 3 | Building |

**Tier 5B total: ~15 documents, ~80 pages**

#### 5C — Official FAQs

| # | Document | Pages | Domain |
|---|---|---|---|
| 251 | FAQ — Häufige Fragen zur Vergabe in Berlin | 10 | Procurement |
| 252 | FAQ — Häufige Fragen zum Bauantrag | 8 | Building |
| 253 | FAQ — Häufige Fragen zu Dienstreisen | 5 | HR |
| 254 | FAQ — Häufige Fragen zu Urlaub und Sonderurlaub | 5 | HR |
| 255 | FAQ — Häufige Fragen zu TV-L Eingruppierung | 8 | HR |
| 256 | FAQ — Häufige Fragen zum Datenschutz in der Verwaltung | 8 | Data |

**Tier 5C total: ~6 documents, ~44 pages**

---

### Corpus Summary

| Tier | Category | Documents | Pages | % of Corpus |
|---|---|---|---|---|
| **Tier 1** | Primary Law | 31 | 530 | 12% |
| **Tier 2** | Admin Regulations & Circulars | 33 | 300 | 13% |
| **Tier 3** | Operational Documents (Manuals + Checklists) | 47 | 288 | 18% |
| **Tier 4** | Templates & Forms | 44 | 90 | 17% |
| **Tier 5** | Reference (Court Decisions + Guidance + FAQs) | 101 | 524 | 40% |
| **Total** | | **256** | **~1,732** | 100% |

**Estimated chunks:** ~70,000 (average 40 chunks per document, varying by page count)  
**Estimated vectors:** ~70,000  
**Estimated Qdrant storage:** ~200 MB  
**Estimated ingestion time:** ~12 hours (parallel embedding)

---

## 2. Prioritization

### P1 — Essential for v1.1 (Minimum Production Corpus)

**Criteria:** Required to answer all 40 benchmark questions + support the 10 most common daily administrative tasks.

| # | Document | Pages | Category | Why Essential |
|---|---|---|---|---|
| P1.1 | BauO Bln (complete, all sections) | 40 | State Law | BUILD-001-006. Most-used building law in Berlin. |
| P1.2 | AV zu §55 LHO Berlin (complete with appendices) | 20 | Admin Regulation | PROC-001-012. The daily procurement reference. |
| P1.3 | BerlAVG (complete) | 10 | State Law | RETR-001. Berlin-specific procurement rules. |
| P1.4 | Beschaffungsordnung Berlin (complete) | 20 | Admin Regulation | RETR-002. How to document procurement. |
| P1.5 | TV-L Entgeltordnung (Eingruppierungskatalog) | 50 | Collective Agreement | SAL-008. Job title → pay grade. |
| P1.6 | TV-L Entgelttabellen 2025 | 15 | Collective Agreement | SAL-001-007. Salary reference. |
| P1.7 | TV-L §26 (Urlaub) | 5 | Collective Agreement | RETR-004. Leave carryover rules. |
| P1.8 | UrlVO Bln (complete) | 20 | State Law | RETR-004 depth. Berlin leave regulation. |
| P1.9 | VgV §§ 14-17 (Fristen) | 5 | Federal Regulation | RETR-003. Procurement deadlines. |
| P1.10 | BRKG §§ 1-15 | 18 | Federal Law | TRAV-001-010 context. Travel allowances. |
| P1.11 | UVgO §§ 14-28 | 10 | Federal Regulation | PROC context. Sub-threshold procedure. |
| P1.12 | GWB §§ 97-101 | 8 | Federal Law | PROC depth. Procurement principles. |
| P1.13 | VOB/A §1-§3a | 18 | Federal Regulation | PROC-004, PROC-011. Construction procurement. |
| P1.14 | BauVorlV 2025 (complete) | 15 | State Regulation | BUILD-004. Required building documents. |
| P1.15 | Schneller-Bauen-Gesetz 2024 | 12 | State Law | BUILD-001 depth. Current reform. |
| P1.16 | Checkliste Direktauftrag | 2 | Checklist | PROC-001. Daily procurement task. |
| P1.17 | Checkliste Beschränkte Ausschreibung | 2 | Checklist | PROC-002. Daily procurement task. |
| P1.18 | Vergabevermerk-Vorlage Direktauftrag | 2 | Template | RETR-002. Required documentation. |
| P1.19 | Vergabevermerk-Vorlage Beschränkte Ausschreibung | 3 | Template | RETR-002. Required documentation. |
| P1.20 | Leitfaden Direktauftrag | 8 | Manual | PROC-001-008. Step-by-step. |
| P1.21 | Leitfaden Beschränkte Ausschreibung | 10 | Manual | PROC-002-003. Step-by-step. |
| P1.22 | Rundschreiben Direktaufträge | 5 | Circular | PROC-001-008 current practice. |
| P1.23 | Rundschreiben Vergabevermerk | 8 | Circular | RETR-002 documentation practice. |
| P1.24 | Leitfaden Bauantragstellung | 10 | Manual | BUILD daily task. |
| P1.25 | Checkliste Bauantrag Einfamilienhaus | 2 | Checklist | BUILD-001. Most common building task. |
| P1.26 | Leitfaden Dienstreise beantragen | 8 | Manual | TRAV daily task. |
| P1.27 | Checkliste Dienstreise vor der Reise | 2 | Checklist | TRAV daily task. |
| P1.28 | FAQ Vergabe Berlin | 10 | FAQ | PROC quick reference. |
| P1.29 | FAQ Bauantrag Berlin | 8 | FAQ | BUILD quick reference. |
| P1.30 | FAQ Dienstreisen | 5 | FAQ | TRAV quick reference. |

**P1 total: 30 documents, ~350 pages → ~14,000 chunks → ~5 hours ingestion**  
**Expected benchmark after P1: 90% (36/40)**

### P2 — Important for Department Readiness (v2.0)

**Criteria:** Supports complete departmental workflows beyond the benchmark. Enables autonomous work within one department.

| Category | Count | Examples |
|---|---|---|
| Additional federal laws | 10 | BDSG, ArbZG, TzBfG, VwVfG, BauGB, BauNVO |
| Additional state laws | 8 | AZVO Bln, LRKG, LHO, BezVG, BlnDSG |
| Additional admin regulations | 15 | AV Umwelt, AV Soziale Kriterien, Personalhandbuch, IT-Sicherheitsleitlinie |
| Additional circulars | 10 | Brandschutz, Abstandsflächen, Stellplätze, Datenschutz Homeoffice |
| Additional manuals | 15 | EU-weite Ausschreibung, Brandschutznachweis, Stellenausschreibung, Onboarding |
| Additional checklists | 8 | EU-weite Ausschreibung, Vorbescheid, Nutzungsänderung, Einstellung, Austritt |
| Additional templates | 12 | EU-Vergabevermerk, Arbeitsvertrag, Homeoffice-Vereinbarung, Aktenvermerk |
| Additional forms | 10 | Bauvorbescheid, Nutzungsänderung, Abgeschlossenheitsbescheinigung |
| Additional court decisions | 40 | Key Vergabekammer + OVG decisions |
| Additional guidance | 8 | Nachhaltige Beschaffung, Genehmigungsfreie Vorhaben, Solaranlagen |

**P2 total: ~136 documents, ~800 pages**

### P3 — Completeness (v2.1+)

**Criteria:** Comprehensive coverage. Historical versions, all court decisions, all forms, all templates.

| Category | Count |
|---|---|
| Remaining federal laws | 8 |
| Remaining state laws | 5 |
| All circulars (complete archive 2018-2025) | 30 |
| All court decisions (complete archive) | 40 |
| All forms (every procedure type) | 15 |
| All templates (every procedure type) | 20 |
| Historical versions (key regulations, last 2 versions each) | 25 |
| Explanatory memoranda (selected) | 10 |
| EU law (additional excerpts) | 5 |

**P3 total: ~158 documents, ~1,200 pages**

---

## 3. Acquisition Strategy

### Source Catalog

| Source | URL | Format | Machine-Readable? | Licensing | Auto-Sync Feasible? |
|---|---|---|---|---|---|
| **gesetze-im-internet.de** (BMJ) | gesetze-im-internet.de | HTML + PDF | Yes (clean HTML, § anchors) | Public domain | **Yes** — HTML structure is consistent, version history linked |
| **gesetze.berlin.de** (Berlin Legal Portal) | gesetze.berlin.de | HTML + PDF | Mixed (newer: HTML, older: scanned PDF) | Public domain | **Partial** — some documents have machine-readable HTML |
| **berlin.de/sen/finanzen** (Finance Senate) | berlin.de/sen/finanzen | PDF | Mixed (text PDF + scanned) | Public — official | **No** — format varies, manual review needed |
| **berlin.de/sen/sbw** (Building Senate) | berlin.de/sen/sbw | PDF | Mixed | Public — official | **No** |
| **berlin.de/sen/inneres** (Interior Senate) | berlin.de/sen/inneres | PDF | Mixed | Public — official | **No** |
| **tdl-online.de** (TdL) | tdl-online.de | PDF | Yes (text PDF) | Official — check redistribution | **No** — login may be required |
| **eur-lex.europa.eu** (EU) | eur-lex.europa.eu | HTML + PDF | Yes | Public domain | **Yes** — structured data, APIs available |
| **gesetze.berlin.de/vergabekammer** | gesetze.berlin.de | HTML | Yes (clean text) | Public domain | **Partial** |
| **berlin.de/gerichte/ovg** | berlin.de/gerichte/ovg | HTML + PDF | Yes | Public domain | **Partial** |

### Download Method Per Source

| Source | Method | Frequency |
|---|---|---|
| gesetze-im-internet.de | Manual download HTML + PDF for Phase A; script for Phase B | Initial: manual. Ongoing: script checks RSS for amendments |
| gesetze.berlin.de | Manual download for Phase A; manual check for amendments | Initial: manual. Ongoing: monthly manual check |
| Senate PDFs | Manual download only | Initial: manual. Ongoing: ad-hoc when new circular issued |
| TdL | Manual download after collective agreement round | Only when new TV-L version published (every 1-2 years) |
| EUR-Lex | Manual download | Every 2 years (threshold update) |
| Court decisions | Manual selection of key decisions | Initial: manual. Ongoing: quarterly review |

### PDF Validation Checklist

Before ingestion, each PDF must pass:

```
□ File is not corrupt (opens in PDF reader)
□ Text layer is present (selectable text, not scanned image)
□ Text extraction produces ≥ 500 characters
□ First page contains document title or can be identified
□ No password protection
□ No two-column layout that garbles extraction order
□ Encoding is correct (no mojibake characters)
□ File size is reasonable (<50 MB)

If any check fails: flag as OCR_REQUIRED or MANUAL_REVIEW
Do NOT ingest documents that fail validation.
```

---

## 4. Metadata Model

### Per-Document Metadata (first-class)

These are populated during acquisition and stored in `corpus_manifest` and `documents` tables.

| Field | Required? | Example | Retrieval Use |
|---|---|---|---|
| `title` | **Yes** | "Bauordnung für Berlin (BauO Bln)" | Display, search |
| `short_name` | **Yes** | "BauO Bln" | Citation, shortened display |
| `legal_domain` | **Yes** | "Baurecht" | Domain filtering, routing |
| `jurisdiction` | **Yes** | "Berlin" | Scope filtering |
| `authority` | **Yes** | "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen" | Authority grounding |
| `doc_type` | **Yes** | "Gesetz" | Type filtering, retrieval weighting |
| `document_category` | **Yes** | "primary_law" | Corpus organization |
| `language` | **Yes** | "DE" | Language filtering |
| `publication_date` | **Yes** | 2025-06-30 | Temporal filtering |
| `effective_date` | If applicable | 2025-06-30 | Temporal filtering |
| `expiry_date` | If applicable | null | Temporal filtering |
| `version_state` | **Yes** | "current" | Default retrieval filter |
| `source_url` | Recommended | "https://gesetze.berlin.de/baubln" | Traceability |
| `official_citation` | Recommended | "GVBl. 2025, S. 234" | Legal citation |
| `priority` | **Yes** | "P1" | Acquisition tracking |
| `update_frequency` | Recommended | "Alle 2-3 Jahre" | Maintenance planning |
| `tags` | Recommended | ["baurecht", "brandschutz", "gebäudeklasse"] | Keyword filtering |

### Per-Chunk Metadata (EAV attributes)

Extracted automatically during indexing. Stored in `search_document_chunk_metadata`.

| Key | Example Value | Extraction Method | Retrieval Use |
|---|---|---|---|
| `section_ref` | "61" | Regex: `§\s*(\d+[a-z]?)` | §-level citation, §-filtered search |
| `clause_ref` | "(2)" | Regex: `\((\d+[a-z]?)\)` | Sub-§ citation |
| `paragraph_type` | "heading" / "clause" / "definition" | Heuristic: position in § | Display formatting |
| `page_number` | "24" | PDF text extraction metadata | Source location |

### Metadata That Should NOT Be Added (v1.1)

| Field | Why Not |
|---|---|
| `amendment_history` | Stored as document tags (`amended_by:...`, `supersedes:...`). Separate field adds complexity without retrieval benefit. |
| `full_text_sha256` | Already exists as `checksumSha256` on DocumentVersionEntity. |
| `department_scope` | Per-department filtering is handled by workspace links. |
| `complexity_level` | Subjective. Not needed for retrieval. |
| `related_documents` | Knowledge graph handles this. Manual curation is expensive. |

---

## 5. Chunking Recommendation

### Verdict: Keep SentenceAwareChunkingStrategy for v1.1

**The current chunker is sufficient for the proposed corpus.** Here is the evidence:

### What the chunker does correctly for this corpus:

1. **Laws and regulations (Tier 1, ~530 pages):** These documents have clear sentence structure with periods and paragraph breaks. The sentence-boundary regex correctly identifies legal sentence endings. The 1200-char target produces chunks of 1-2 complete paragraphs, which is appropriate for retrieval — a query for "Abstandsfläche" retrieves the paragraph about setbacks, not the entire §6.

2. **Administrative regulations (Tier 2, ~300 pages):** These are prose documents similar to laws. Same reasoning applies.

3. **Manuals and guides (Tier 3, ~250 pages):** These have natural section breaks (headings, numbered steps). The chunker's `\n\n` split handles section breaks. Step-by-step guides chunk well at 1200 chars.

4. **Courts decisions (Tier 5, ~400 pages):** These have a standard structure (Tenor, Tatbestand, Entscheidungsgründe) with clear paragraph breaks. Sentence-aware chunking works well.

5. **Checklists and templates (Tier 3-4, ~130 pages):** Short documents (1-3 pages). Each is 1-3 chunks. Chunking strategy barely matters for these.

6. **FAQs (Tier 5, ~44 pages):** Question-answer pairs. Short. Chunking strategy barely matters.

### What would LegalChunkingStrategy actually improve?

Only **citation precision** for Tier 1 documents (laws, regulations, collective agreements). These are ~530 pages out of ~1,732 total (31%).

The improvement is: "gemäß §61 Abs. 2 BauO Bln" instead of "gemäß BauO Bln."

This matters for administrative acceptance — a Sachbearbeiter wants to see the exact § reference. But it does NOT improve retrieval quality. The chunk text already contains "§ 61" and "Abs. 2" regardless of whether the chunker knows it's a § boundary.

### Measurable trigger for LegalChunkingStrategy:

After ingesting P1 (30 documents, ~14,000 chunks), run the benchmark. If ≥ 70% of HYBRID_RETRIEVAL answers cite the correct § number (manually verified), SentenceAwareChunkingStrategy is sufficient.

If < 70% correctly cite § numbers, implement LegalChunkingStrategy for v2.0.

### What to implement NOW instead:

Add § reference extraction to chunk metadata (50 lines of code, Week 1 of v1.1). This gives you §-level citation without changing the chunker. The regex `§\s*(\d+[a-z]?)` extracts the § number from each chunk's text and stores it as a `section_ref` attribute. The `SourceCitation` in the answer can then display "BauO Bln §61" instead of just "BauO Bln."

---

## 6. Corpus Quality Metrics

### KPI Dashboard — Measured After Each Ingestion Batch

| # | KPI | Measurement Method | P1 Target (30 docs) | v2.0 Target (166 docs) | v3.0 Target (256 docs) |
|---|---|---|---|---|---|
| **K1** | Retrieval Precision | % of top-10 chunks from correct domain | ≥ 85% | ≥ 90% | ≥ 95% |
| **K2** | Citation Precision | % of answers citing correct § number (manual spot-check of 20 answers) | ≥ 70% | ≥ 85% | ≥ 95% |
| **K3** | Benchmark Coverage | % of 40 questions passing | ≥ 90% (36/40) | ≥ 95% (38/40) | ≥ 97% (39/40) |
| **K4** | Document Freshness | % of documents where `publication_date` ≤ 2 years | ≥ 80% | ≥ 90% | ≥ 95% |
| **K5** | Metadata Completeness | % of required metadata fields present (average per doc) | ≥ 90% | ≥ 95% | ≥ 98% |
| **K6** | Duplicate Rate | % of documents with duplicate SHA-256 or duplicate title+version | 0% | 0% | 0% |
| **K7** | Chunk Coherence | % of chunks starting/ending at sentence boundaries (sample 100 chunks) | ≥ 95% | ≥ 95% | ≥ 95% |
| **K8** | Embedding Coverage | % of chunks with non-null `embedding_reference` | ≥ 98% | ≥ 98% | ≥ 98% |
| **K9** | Ingestion Success Rate | % of uploaded documents reaching READY status on first attempt | ≥ 90% | ≥ 95% | ≥ 95% |
| **K10** | Answer Grounding Rate | % of HYBRID_RETRIEVAL answers with `grounded == true` | ≥ 90% | ≥ 95% | ≥ 98% |
| **K11** | Domain Purity | % of chunks in legal corpus tagged with correct `legal_domain` | ≥ 95% | ≥ 98% | ≥ 99% |
| **K12** | Version Currency | % of documents where `version_state == "current"` actually IS the latest version | 100% | 100% | 100% |

### Measurement Cadence

| Cadence | Metrics |
|---|---|
| **Per batch** (after every 10-30 document ingestion) | K6 (Duplicates), K8 (Embeddings), K9 (Success Rate), K11 (Domain Purity) |
| **Weekly** | K1 (Retrieval Precision), K4 (Freshness), K5 (Metadata), K7 (Chunk Coherence) |
| **Per release** | K2 (Citation Precision), K3 (Benchmark Coverage), K10 (Grounding), K12 (Version Currency) |

---

## 7. Corpus Maturity Model

### Level 1 — Demo Corpus (Current State)

| Metric | Value |
|---|---|
| **Documents** | 23 English demo summaries |
| **Pages** | ~23 (one page equivalent per doc) |
| **Chunks** | 23 (single chunk per doc, SentenceAwareChunking collapsed them) |
| **Vectors** | 0 (Ollama not running in dev) |
| **Benchmark** | ~70% (28/28 RULE_ENGINE pass with correct structured knowledge; 0/12 HYBRID_RETRIEVAL pass with meaningful retrieval) |
| **Answer Quality** | RULE_ENGINE: correct. HYBRID_RETRIEVAL: generic or wrong. |
| **Domains Covered** | 3 (Vergaberecht, Baurecht, Personalrecht) — English summaries only |
| **Maintenance Effort** | None (static demo data) |
| **Suitable For** | Architecture validation. Pipeline testing. NOT suitable for any real administrative use. |

### Level 2 — Minimum Production Corpus (v1.1 Target)

| Metric | Value |
|---|---|
| **Documents** | 30 P1 documents (German legal text from official sources) |
| **Pages** | ~350 |
| **Chunks** | ~14,000 |
| **Vectors** | ~14,000 |
| **Benchmark** | **90% (36/40)** — all 12 HYBRID_RETRIEVAL pass, 27/28 RULE_ENGINE pass |
| **Answer Quality** | RULE_ENGINE: correct with citations. HYBRID_RETRIEVAL: correct with document-level citations. |
| **Domains Covered** | 3 primary (Vergaberecht, Baurecht, Personalrecht) — German, current versions |
| **Maintenance Effort** | Low — 30 documents, quarterly check for amendments |
| **Suitable For** | Answering the 40 benchmark questions. Supporting the 10 most common daily administrative tasks (Direktauftrag, Beschränkte Ausschreibung, Bauantrag Einfamilienhaus, Dienstreise Inland). **Minimum for any real use.** |

### Level 3 — Department-Ready (v2.0 Target)

| Metric | Value |
|---|---|
| **Documents** | 166 P1+P2 documents |
| **Pages** | ~1,150 |
| **Chunks** | ~46,000 |
| **Vectors** | ~46,000 |
| **Benchmark** | **95% (38/40)** |
| **Answer Quality** | Correct with §-level citations. Answers include forms, checklists, and templates. |
| **Domains Covered** | 3 primary + Data Protection + Finance + Admin Procedure |
| **Maintenance Effort** | Medium — 166 documents, monthly amendment check, semi-automated source monitoring |
| **Suitable For** | Autonomous daily work within one department. A Sachbearbeiter in the Vergabestelle or Bauaufsicht can use the platform as their primary decision support tool. |

### Level 4 — Municipality-Ready (v2.1 Target)

| Metric | Value |
|---|---|
| **Documents** | 256 P1+P2+P3 documents (complete corpus) |
| **Pages** | ~1,732 |
| **Chunks** | ~70,000 |
| **Vectors** | ~70,000 |
| **Benchmark** | **97% (39/40)** |
| **Answer Quality** | Correct with precise §, Abs., and Satz citations. Answers include procedures, forms, deadlines, checklists, and relevant court decisions. |
| **Domains Covered** | All 8 domains with full operational depth. Historical versions available for temporal queries. |
| **Maintenance Effort** | High — 256 documents, automated source monitoring, quarterly re-validation |
| **Suitable For** | All departments in one Bezirksamt. Platform is the primary decision support system for procurement, building, HR, finance, and general administration. |

### Level 5 — State-Wide Knowledge Base (v3.0 Target)

| Metric | Value |
|---|---|
| **Documents** | 500-800 (all Berlin municipalities + expanded domains) |
| **Pages** | ~5,000+ |
| **Chunks** | ~200,000+ |
| **Vectors** | ~200,000+ |
| **Benchmark** | **98%+ (39-40/40)** |
| **Answer Quality** | Authoritative. Answers cite not only the regulation but also the specific court decisions interpreting it, the relevant circular, and the applicable template. Temporal queries return the law as it stood at the relevant date. |
| **Domains Covered** | All 9 domains (adds Umweltrecht, Kommunalrecht full depth). Multi-jurisdiction (Berlin + Brandenburg + federal). |
| **Maintenance Effort** | Dedicated corpus engineer (part-time). Automated ingestion pipeline with human review. |
| **Suitable For** | All Berlin Bezirksämter + Senatsverwaltungen. Platform is the authoritative knowledge base for Berlin municipal administration. |

### Maturity Progression

```
Level 1 (Today)          Level 2 (v1.1)            Level 3 (v2.0)          Level 4 (v2.1)          Level 5 (v3.0)
──────┼───────────────────────┼───────────────────────────┼──────────────────────────┼───────────────────────┼──────────
      │                       │                           │                          │                       │
  23 docs                  30 docs                    166 docs                  256 docs               500-800 docs
  23 chunks             14,000 chunks               46,000 chunks             70,000 chunks          200,000+ chunks
  0 vectors             14,000 vectors              46,000 vectors            70,000 vectors         200,000+ vectors
  70% benchmark         90% benchmark               95% benchmark             97% benchmark          98%+ benchmark
  Demo only             Minimum production          Department-ready          Municipality-ready      State-wide
```

---

## 8. Recommended Document Counts

### Version 1.1: 30 documents

These 30 P1 documents fix all benchmark gaps and support the 10 most common municipal tasks. They are the minimum to demonstrate that the platform works for real administrative work.

**Timeline:** 1 week to acquire + 1 week to ingest + 1 week to validate = 3 weeks.

### Version 2.0: 166 documents

P1 (30 docs) + P2 (136 docs). This covers full departmental workflows for procurement, building, and HR — the three primary domains. Includes court decisions, circulars, and operational documents.

**Timeline:** 4 weeks to acquire + 2 weeks to ingest + 2 weeks to validate = 8 weeks.

### Version 2.1: 256 documents

P1 (30) + P2 (136) + P3 (90). Complete corpus. Historical versions, all court decisions, all templates. Full municipality coverage.

**Timeline:** 6 weeks to acquire + 3 weeks to ingest + 3 weeks to validate = 12 weeks.
