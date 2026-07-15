# Corpus Acquisition Workbook — 300 Documents

**Version:** 1.1 Production Corpus  
**Format:** Importable tables with metadata for every document  
**Usage:** Each batch table can be converted to JSON sidecars for `POST /api/documents/batch-import`

---

## Acquisition Batches (in import order)

| Batch | Documents | Category | Priority | Cumulative Benchmark |
|---|---|---|---|---|
| **A** | 50 | Daily Tools — Checklists, Templates, FAQs, Fee Schedules | P1 | 85% |
| **B** | 50 | Weekly References — Manuals, Circulars, Decision Trees | P1 | 90% |
| **C** | 50 | Core Laws — BauO Bln, AV §55, TV-L, BRKG, VgV, UrlVO, BerlAVG | P1 | 93% |
| **D** | 50 | Supplementary Laws + Administrative Regulations | P2 | 95% |
| **E** | 50 | Court Decisions + Guidance Documents | P2 | 96% |
| **F** | 50 | Forms, Historical Versions, Specialized Documents | P3 | 97% |

---

## Batch A — Daily Tools (Documents 1-50)

### A1 — Checklists (Documents 1-15)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| A001 | Checkliste Direktauftrag (Lieferung/Dienstleistung) | berlin.de/sen/finanzen | PROCEDURAL | procurement-direct-award | 2 | 2 | — | PROC-001, PROC-005, PROC-006 | Low | Public |
| A002 | Checkliste Beschränkte Ausschreibung | berlin.de/sen/finanzen | PROCEDURAL | procurement-restricted-tender | 2 | 2 | — | PROC-002, PROC-003 | Low | Public |
| A003 | Checkliste Öffentliche Ausschreibung | berlin.de/sen/finanzen | PROCEDURAL | procurement-open-tender | 2 | 2 | — | PROC-010 | Low | Public |
| A004 | Checkliste EU-weite Ausschreibung | berlin.de/sen/finanzen | PROCEDURAL | procurement-eu-tender | 2 | 2 | — | PROC-010 depth | Low | Public |
| A005 | Checkliste Vergabevermerk | berlin.de/sen/finanzen | PROCEDURAL | procurement-documentation | 2 | 2 | — | RETR-002 | Low | Public |
| A006 | Checkliste Bauantrag Einfamilienhaus | berlin.de/sen/sbw | PROCEDURAL | building-permit | 2 | 2 | — | BUILD-001 | Low | Public |
| A007 | Checkliste Bauantrag Mehrfamilienhaus | berlin.de/sen/sbw | PROCEDURAL | building-permit | 2 | 2 | — | BUILD-001 | Low | Public |
| A008 | Checkliste Bauantrag Gewerbe | berlin.de/sen/sbw | PROCEDURAL | building-permit | 2 | 2 | — | BUILD-001 | Low | Public |
| A009 | Checkliste Vorbescheid | berlin.de/sen/sbw | PROCEDURAL | building-preliminary-inquiry | 2 | 2 | — | BUILD-001 | Low | Public |
| A010 | Checkliste Nutzungsänderung | berlin.de/sen/sbw | PROCEDURAL | building-change-of-use | 2 | 2 | — | BUILD-005 | Low | Public |
| A011 | Checkliste Einstellung neuer Mitarbeiter | berlin.de/sen/inneres | PROCEDURAL | personnel-hiring | 2 | 2 | — | HR | Low | Public |
| A012 | Checkliste Austritt Mitarbeiter | berlin.de/sen/inneres | PROCEDURAL | personnel-exit | 2 | 2 | — | HR | Low | Public |
| A013 | Checkliste Dienstreise (vor der Reise) | berlin.de/sen/inneres | PROCEDURAL | travel-expenses-domestic | 2 | 2 | — | TRAV-001-010 | Low | Public |
| A014 | Checkliste Dienstreise (nach der Reise) | berlin.de/sen/inneres | PROCEDURAL | travel-expenses-domestic | 2 | 2 | — | TRAV-001-010 | Low | Public |
| A015 | Checkliste Beschaffungsantrag (intern) | berlin.de/sen/finanzen | PROCEDURAL | procurement-request | 2 | 2 | — | PROC | Low | Public |

### A2 — Templates / Muster (Documents 16-30)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| A016 | Vergabevermerk-Vorlage Direktauftrag | berlin.de/sen/finanzen | PROCEDURAL | procurement-direct-award | 3 | 2 | — | RETR-002 | Low | Public |
| A017 | Vergabevermerk-Vorlage Beschränkte Ausschreibung | berlin.de/sen/finanzen | PROCEDURAL | procurement-restricted-tender | 3 | 3 | — | RETR-002 | Low | Public |
| A018 | Vergabevermerk-Vorlage Öffentliche Ausschreibung | berlin.de/sen/finanzen | PROCEDURAL | procurement-open-tender | 3 | 3 | — | RETR-002 | Low | Public |
| A019 | Angebotsaufforderung (Muster) | berlin.de/sen/finanzen | PROCEDURAL | procurement-restricted-tender | 2 | 2 | — | PROC | Low | Public |
| A020 | Bewertungsmatrix (Muster) | berlin.de/sen/finanzen | PROCEDURAL | procurement-evaluation | 2 | 2 | — | PROC | Low | Public |
| A021 | Absageschreiben (Muster) | berlin.de/sen/finanzen | PROCEDURAL | procurement-communication | 1 | 1 | — | PROC | Low | Public |
| A022 | Zuschlagsschreiben (Muster) | berlin.de/sen/finanzen | PROCEDURAL | procurement-communication | 1 | 1 | — | PROC | Low | Public |
| A023 | Standardbescheid Baugenehmigung (Muster) | berlin.de/sen/sbw | PROCEDURAL | building-permit | 3 | 3 | §64 | BUILD-001 | Low | Public |
| A024 | Standardbescheid Vorbescheid (Muster) | berlin.de/sen/sbw | PROCEDURAL | building-preliminary-inquiry | 2 | 2 | — | BUILD-001 | Low | Public |
| A025 | Standardbescheid Ablehnung Bauantrag (Muster) | berlin.de/sen/sbw | PROCEDURAL | building-permit | 2 | 2 | — | BUILD-001 | Low | Public |
| A026 | Standardantwort fehlende Bauunterlagen (Muster) | berlin.de/sen/sbw | PROCEDURAL | building-permit | 1 | 1 | — | BUILD-004 | Low | Public |
| A027 | Arbeitsvertrag TV-L (Muster) | berlin.de/sen/inneres | PROCEDURAL | personnel-hiring | 5 | 5 | §15-25 | HR | Low | Public |
| A028 | Änderungsvertrag TV-L (Muster) | berlin.de/sen/inneres | PROCEDURAL | personnel-change | 2 | 2 | — | HR | Low | Public |
| A029 | Teilzeitantrag (Muster) | berlin.de/sen/inneres | PROCEDURAL | personnel-part-time | 1 | 1 | — | HR | Low | Public |
| A030 | Urlaubsantrag (Muster) | berlin.de/sen/inneres | PROCEDURAL | personnel-leave | 1 | 1 | — | RETR-004 | Low | Public |

### A3 — FAQs (Documents 31-40)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| A031 | FAQ — Häufige Fragen zur Vergabe Berlin | berlin.de/sen/finanzen | PROCEDURAL | procurement-all | 10 | 8 | AV §55 | PROC-001-012 | Low | Public |
| A032 | FAQ — Häufige Fragen zum Bauantrag | berlin.de/sen/sbw | PROCEDURAL | building-permit | 8 | 6 | §61-64 | BUILD-001-006 | Low | Public |
| A033 | FAQ — Häufige Fragen zu Urlaub und Sonderurlaub | berlin.de/sen/inneres | PROCEDURAL | personnel-leave | 5 | 4 | §26 TV-L | RETR-004 | Low | Public |
| A034 | FAQ — Häufige Fragen zu Dienstreisen | berlin.de/sen/inneres | PROCEDURAL | travel-expenses-domestic | 5 | 4 | §5-7 BRKG | TRAV-001-010 | Low | Public |
| A035 | FAQ — Häufige Fragen zu TV-L und Gehalt | berlin.de/sen/inneres | PROCEDURAL | personnel-salary | 8 | 6 | TV-L | SAL-001-008 | Low | Public |
| A036 | FAQ — Personalausweis und Reisepass | berlin.de/buergeramt | PROCEDURAL | citizen-id | 5 | 4 | — | Citizen services | Low | Public |
| A037 | FAQ — Anmeldung und Ummeldung | berlin.de/buergeramt | PROCEDURAL | citizen-registration | 5 | 4 | — | Citizen services | Low | Public |
| A038 | FAQ — Beschaffungsanträge (intern) | berlin.de/sen/finanzen | PROCEDURAL | procurement-request | 5 | 4 | AV §55 | PROC | Low | Public |
| A039 | FAQ — Datenschutz in der Verwaltung | berlin.de/datenschutz | PROCEDURAL | data-protection | 8 | 6 | BDSG, DSGVO | Data protection | Low | Public |
| A040 | FAQ — Gewerbe an- und abmelden | berlin.de/buergeramt | PROCEDURAL | business-registration | 5 | 4 | — | Citizen services | Low | Public |

### A4 — Fee Schedules + Decision Trees (Documents 41-50)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| A041 | Gebührenverzeichnis Bürgeramt (alle Dienstleistungen) | berlin.de/sen/finanzen | PROCEDURAL | citizen-all | 10 | 8 | — | Citizen services | Low | Public |
| A042 | Baugebührenordnung Berlin | gesetze.berlin.de | LEGAL | building-permit | 8 | 6 | — | BUILD | Low | Public |
| A043 | Gebührenverzeichnis Beglaubigungen | berlin.de/buergeramt | PROCEDURAL | citizen-certification | 2 | 2 | — | Citizen services | Low | Public |
| A044 | Prüfschema: Welches Vergabeverfahren? | berlin.de/sen/finanzen | PROCEDURAL | procurement-all | 3 | 2 | AV §55 | PROC-001-012 | Low | Public |
| A045 | Prüfschema: Welches Baugenehmigungsverfahren? | berlin.de/sen/sbw | PROCEDURAL | building-permit | 3 | 2 | §62-64 | BUILD-001 | Low | Public |
| A046 | Prüfschema: Genehmigungsfrei oder genehmigungspflichtig? | berlin.de/sen/sbw | PROCEDURAL | building-permit | 2 | 2 | §61 | BUILD-003 | Low | Public |
| A047 | Prüfschema: Eingruppierung TV-L | berlin.de/sen/inneres | PROCEDURAL | personnel-salary | 3 | 2 | TV-L EntgeltO | SAL-008 | Low | Public |
| A048 | Prüfschema: Urlaubsübertragung zulässig? | berlin.de/sen/inneres | PROCEDURAL | personnel-leave | 2 | 2 | §26 TV-L | RETR-004 | Low | Public |
| A049 | Prüfschema: Datenschutz-Folgenabschätzung erforderlich? | berlin.de/datenschutz | PROCEDURAL | data-protection | 2 | 2 | DSGVO Art.35 | Data protection | Low | Public |
| A050 | Zuständigkeitskatalog Berliner Verwaltung | berlin.de/sen/inneres | PROCEDURAL | all | 15 | 12 | — | All (routing) | Medium | Public |

---

## Batch B — Weekly References (Documents 51-100)

### B1 — Manuals / Handbücher (Documents 51-65)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| B051 | Vergabehandbuch Berlin — Kapitel 1: Grundlagen | berlin.de/sen/finanzen | PROCEDURAL | procurement-all | 15 | 12 | GWB, VgV | PROC-001-012 | Medium | Public |
| B052 | Vergabehandbuch Berlin — Kapitel 2: Vergabeverfahren im Detail | berlin.de/sen/finanzen | PROCEDURAL | procurement-all | 20 | 16 | AV §55, UVgO | PROC-001-012 | Medium | Public |
| B053 | Vergabehandbuch Berlin — Kapitel 3: Fristen und Bekanntmachungen | berlin.de/sen/finanzen | PROCEDURAL | procurement-all | 15 | 12 | VgV §14-17 | RETR-003 | Medium | Public |
| B054 | Vergabehandbuch Berlin — Kapitel 4: Dokumentation und Vergabevermerk | berlin.de/sen/finanzen | PROCEDURAL | procurement-documentation | 15 | 12 | AV §55 | RETR-002 | Medium | Public |
| B055 | Vergabehandbuch Berlin — Kapitel 5: Vertragsmanagement | berlin.de/sen/finanzen | PROCEDURAL | procurement-contract | 15 | 12 | — | PROC | Medium | Public |
| B056 | Personalhandbuch Berlin — Kapitel 1: Einstellung | berlin.de/sen/inneres | PROCEDURAL | personnel-hiring | 10 | 8 | TV-L §15-25 | HR | Medium | Public |
| B057 | Personalhandbuch Berlin — Kapitel 2: Arbeitszeit und Urlaub | berlin.de/sen/inneres | PROCEDURAL | personnel-leave | 10 | 8 | AZVO, UrlVO | RETR-004 | Medium | Public |
| B058 | Personalhandbuch Berlin — Kapitel 3: Eingruppierung und Vergütung | berlin.de/sen/inneres | PROCEDURAL | personnel-salary | 15 | 12 | TV-L EntgeltO | SAL-008 | Medium | Public |
| B059 | Personalhandbuch Berlin — Kapitel 4: Beendigung und Kündigung | berlin.de/sen/inneres | PROCEDURAL | personnel-exit | 8 | 6 | TV-L §34 | HR | Medium | Public |
| B060 | Bauleitfaden Berlin — Teil 1: Verfahrensarten | berlin.de/sen/sbw | PROCEDURAL | building-permit | 12 | 10 | BauO §62-64 | BUILD-001 | Medium | Public |
| B061 | Bauleitfaden Berlin — Teil 2: Bauvorlagen und Dokumente | berlin.de/sen/sbw | PROCEDURAL | building-permit | 10 | 8 | BauVorlV | BUILD-004 | Medium | Public |
| B062 | Bauleitfaden Berlin — Teil 3: Abstandsflächen und Grenzbebauung | berlin.de/sen/sbw | PROCEDURAL | building-setbacks | 8 | 6 | BauO §6 | BUILD-002 | Medium | Public |
| B063 | Bauleitfaden Berlin — Teil 4: Brandschutz | berlin.de/sen/sbw | PROCEDURAL | building-fire-safety | 10 | 8 | BauO §27-36 | BUILD-006 | Medium | Public |
| B064 | Dienstreise-Handbuch Berlin (Inland + Ausland) | berlin.de/sen/inneres | PROCEDURAL | travel-expenses-all | 15 | 12 | BRKG, LRKG | TRAV-001-010 | Medium | Public |
| B065 | Bürgeramt-Handbuch — Teil 1: Melde- und Passwesen | berlin.de/buergeramt | PROCEDURAL | citizen-all | 20 | 16 | — | Citizen services | High | Public |

### B2 — Circulars / Rundschreiben (Documents 66-85)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| B066 | Rundschreiben Direktaufträge — aktuelle Auslegung 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-direct-award | 5 | 4 | AV §55 | PROC-001-008 | Low | Public |
| B067 | Rundschreiben Beschränkte Ausschreibung — Praxis 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-restricted-tender | 5 | 4 | AV §55 | PROC-002-003 | Low | Public |
| B068 | Rundschreiben Vergabevermerk — Dokumentation 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-documentation | 8 | 6 | AV §55 | RETR-002 | Low | Public |
| B069 | Rundschreiben eVergabe-Pflicht Berlin 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-e-tender | 5 | 4 | — | PROC | Low | Public |
| B070 | Rundschreiben Ex-Post-Bekanntmachung 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-documentation | 3 | 2 | AV §55 | PROC | Low | Public |
| B071 | Rundschreiben Brandschutz im Wohnungsbau 2025 | berlin.de/sen/sbw | PROCEDURAL | building-fire-safety | 8 | 6 | BauO §27-36 | BUILD-006 | Low | Public |
| B072 | Rundschreiben Abstandsflächen — aktuelle Auslegung 2025 | berlin.de/sen/sbw | PROCEDURAL | building-setbacks | 5 | 4 | BauO §6 | BUILD-002 | Low | Public |
| B073 | Rundschreiben Stellplatzpflicht Berlin 2025 | berlin.de/sen/sbw | PROCEDURAL | building-parking | 5 | 4 | BauO §49 | BUILD | Low | Public |
| B074 | Rundschreiben Barrierefreies Bauen 2025 | berlin.de/sen/sbw | PROCEDURAL | building-accessibility | 5 | 4 | BauO §51 | BUILD | Low | Public |
| B075 | Rundschreiben Fahrradabstellplätze 2025 | berlin.de/sen/sbw | PROCEDURAL | building-bicycle-parking | 3 | 2 | BauO §49 | BUILD | Low | Public |
| B076 | Rundschreiben Dienstreise — elektronische Abrechnung 2025 | berlin.de/sen/inneres | PROCEDURAL | travel-expenses-domestic | 5 | 4 | BRKG | TRAV | Low | Public |
| B077 | Rundschreiben Homeoffice-Erstattung 2025 | berlin.de/sen/inneres | PROCEDURAL | personnel-remote-work | 3 | 2 | — | HR | Low | Public |
| B078 | Rundschreiben Datenschutz bei Homeoffice 2025 | berlin.de/datenschutz | PROCEDURAL | data-protection | 5 | 4 | DSGVO | Data protection | Low | Public |
| B079 | Rundschreiben Umgang mit Bürgerdaten 2025 | berlin.de/datenschutz | PROCEDURAL | data-protection | 5 | 4 | BDSG, BlnDSG | Data protection | Low | Public |
| B080 | Rundschreiben Nachhaltige Beschaffung 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-sustainable | 8 | 6 | BerlAVG §7 | RETR-001 | Low | Public |
| B081 | Rundschreiben Soziale Kriterien Vergabe 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-social | 5 | 4 | BerlAVG §8 | RETR | Low | Public |
| B082 | Rundschreiben Tariftreue und Mindestlohn 2025 | berlin.de/sen/finanzen | PROCEDURAL | procurement-compliance | 5 | 4 | BerlAVG §3 | RETR | Low | Public |
| B083 | Rundschreiben Korruptionsprävention 2025 | berlin.de/sen/inneres | PROCEDURAL | compliance-anti-corruption | 5 | 4 | — | Compliance | Low | Public |
| B084 | Rundschreiben IT-Sicherheit — aktuelle Bedrohungen 2025 | berlin.de/itdz | PROCEDURAL | it-security | 5 | 4 | — | IT Security | Low | Public |
| B085 | Rundschreiben E-Akte — Nutzungspflicht 2025 | berlin.de/sen/inneres | PROCEDURAL | admin-e-file | 3 | 2 | EGovG Bln | Admin | Low | Public |

### B3 — Sample Completed Forms (Documents 86-95)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| B086 | Ausgefüllter Vergabevermerk Direktauftrag (Musterbeispiel) | berlin.de/sen/finanzen | PROCEDURAL | procurement-direct-award | 5 | 4 | AV §55 | RETR-002 | Low | Public |
| B087 | Ausgefüllter Bauantrag Einfamilienhaus (Musterbeispiel) | berlin.de/sen/sbw | PROCEDURAL | building-permit | 10 | 8 | — | BUILD-001 | Low | Public |
| B088 | Ausgefüllte Dienstreise-Abrechnung Inland (Musterbeispiel) | berlin.de/sen/inneres | PROCEDURAL | travel-expenses-domestic | 3 | 2 | BRKG | TRAV | Low | Public |
| B089 | Ausgefüllter Arbeitsvertrag TV-L EG 9b (Musterbeispiel) | berlin.de/sen/inneres | PROCEDURAL | personnel-hiring | 5 | 4 | TV-L | SAL, HR | Low | Public |
| B090 | Ausgefüllter Personalausweis-Antrag (Musterbeispiel) | berlin.de/buergeramt | PROCEDURAL | citizen-id | 2 | 2 | — | Citizen services | Low | Public |
| B091 | Ausgefüllte Gewerbeanmeldung (Musterbeispiel) | berlin.de/buergeramt | PROCEDURAL | business-registration | 2 | 2 | — | Citizen services | Low | Public |
| B092 | Ausgefüllter Wohngeld-Antrag (Musterbeispiel) | berlin.de/buergeramt | PROCEDURAL | citizen-housing-benefit | 8 | 6 | — | Citizen services | Low | Public |
| B093 | Ausgefüllte Urlaubsübertragung (Musterbeispiel) | berlin.de/sen/inneres | PROCEDURAL | personnel-leave | 2 | 2 | §26 TV-L | RETR-004 | Low | Public |
| B094 | Ausgefüllter Beschaffungsantrag (Musterbeispiel) | berlin.de/sen/finanzen | PROCEDURAL | procurement-request | 3 | 2 | — | PROC | Low | Public |
| B095 | Ausgefüllter Aktenvermerk (Musterbeispiel) | berlin.de/sen/inneres | PROCEDURAL | admin-general | 2 | 2 | — | Admin | Low | Public |

### B4 — Process Descriptions (Documents 96-100)

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| B096 | Schritt-für-Schritt: Direktauftrag durchführen | berlin.de/sen/finanzen | PROCEDURAL | procurement-direct-award | 5 | 4 | AV §55 | PROC-001-008 | Medium | Public |
| B097 | Schritt-für-Schritt: Beschränkte Ausschreibung durchführen | berlin.de/sen/finanzen | PROCEDURAL | procurement-restricted-tender | 8 | 6 | AV §55 | PROC-002-003 | Medium | Public |
| B098 | Schritt-für-Schritt: Bauantrag bearbeiten (Bauaufsicht) | berlin.de/sen/sbw | PROCEDURAL | building-permit | 10 | 8 | BauO §62-64 | BUILD-001-006 | Medium | Public |
| B099 | Schritt-für-Schritt: Einstellung durchführen (Personalstelle) | berlin.de/sen/inneres | PROCEDURAL | personnel-hiring | 8 | 6 | TV-L | HR | Medium | Public |
| B100 | Schritt-für-Schritt: Dienstreise beantragen und abrechnen | berlin.de/sen/inneres | PROCEDURAL | travel-expenses-domestic | 5 | 4 | BRKG | TRAV-001-010 | Medium | Public |

---

## Batch C — Core Laws (Documents 101-150)

### C1 — BauO Bln (Complete, German Full Text) — Documents 101-110

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| C101 | BauO Bln §§ 1-5 — Allgemeine Vorschriften, Begriffe | gesetze.berlin.de/baubln | LEGAL | building-all | 5 | 12 | §1-5 | BUILD context | Low | Public |
| C102 | BauO Bln §6 — Abstandsflächen (vollständig) | gesetze.berlin.de/baubln | LEGAL | building-setbacks | 5 | 12 | §6 | **BUILD-002** | Low | Public |
| C103 | BauO Bln §§ 7-26 — Grundstücksbebauung | gesetze.berlin.de/baubln | LEGAL | building-all | 15 | 35 | §7-26 | BUILD context | Low | Public |
| C104 | BauO Bln §§ 27-36 — Brandschutz (vollständig) | gesetze.berlin.de/baubln | LEGAL | building-fire-safety | 15 | 35 | §27-36 | **BUILD-006** | Low | Public |
| C105 | BauO Bln §§ 37-50 — Bauliche Anlagen, Haustechnik | gesetze.berlin.de/baubln | LEGAL | building-all | 12 | 28 | §37-50 | BUILD context | Low | Public |
| C106 | BauO Bln §61 — Genehmigungsfreie Vorhaben (vollständig) | gesetze.berlin.de/baubln | LEGAL | building-permit, building-exempt | 3 | 7 | §61 | **BUILD-003** | Low | Public |
| C107 | BauO Bln §62 — Genehmigungsfreistellung (vollständig) | gesetze.berlin.de/baubln | LEGAL | building-permit | 3 | 7 | §62 | **BUILD-001** | Low | Public |
| C108 | BauO Bln §63 — Vereinfachtes Verfahren (vollständig) | gesetze.berlin.de/baubln | LEGAL | building-permit, building-change-of-use | 5 | 12 | §63 | **BUILD-001, BUILD-005** | Low | Public |
| C109 | BauO Bln §64 — Volles Baugenehmigungsverfahren (vollständig) | gesetze.berlin.de/baubln | LEGAL | building-permit | 5 | 12 | §64 | **BUILD-001** | Low | Public |
| C110 | BauO Bln §§ 65-89 — Bauaufsicht, Schlussvorschriften | gesetze.berlin.de/baubln | LEGAL | building-all | 15 | 35 | §65-89 | BUILD context | Low | Public |

### C2 — BauvorlV 2025 + BauGB + BauNVO — Documents 111-115

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| C111 | Bauvorlagenverordnung 2025 (BauVorlV) — vollständig | gesetze.berlin.de/bauvorlv | LEGAL | building-permit | 15 | 35 | §1-15 | **BUILD-004** | Low | Public |
| C112 | Baugesetzbuch (BauGB) §§ 1-13 — Bauleitplanung | gesetze-im-internet.de/baugb | LEGAL | building-planning | 15 | 35 | §1-13 | BUILD context | Low | Public |
| C113 | Baugesetzbuch (BauGB) §§ 29-38 — Zulässigkeit von Vorhaben | gesetze-im-internet.de/baugb | LEGAL | building-permit | 12 | 28 | §29-38 | BUILD context | Low | Public |
| C114 | Baunutzungsverordnung (BauNVO) §§ 1-15 — Art und Maß der Nutzung | gesetze-im-internet.de/baunvo | LEGAL | building-planning | 10 | 23 | §1-15 | BUILD context | Low | Public |
| C115 | Schneller-Bauen-Gesetz Berlin 2024 (vollständig) | gesetze.berlin.de | LEGAL | building-permit | 12 | 28 | — | BUILD-001 depth | Low | Public |

### C3 — Procurement Laws — Documents 116-130

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| C116 | GWB Teil 4 §§ 97-101 — Vergaberecht Grundsätze | gesetze-im-internet.de/gwb | LEGAL | procurement-all | 8 | 18 | §97-101 | PROC depth | Low | Public |
| C117 | GWB §§ 102-114 — Vergabe oberhalb EU-Schwellenwerte | gesetze-im-internet.de/gwb | LEGAL | procurement-eu-tender | 12 | 28 | §102-114 | PROC-010 | Low | Public |
| C118 | VgV §§ 1-13 — Allgemeine Bestimmungen | gesetze-im-internet.de/vgv | LEGAL | procurement-all | 8 | 18 | §1-13 | PROC context | Low | Public |
| C119 | VgV §§ 14-17 — Fristen, elektronische Einreichung | gesetze-im-internet.de/vgv | LEGAL | procurement-deadlines | 5 | 12 | §14-17 | **RETR-003** | Low | Public |
| C120 | VgV §§ 18-30 — Vergabeverfahren, Eignung | gesetze-im-internet.de/vgv | LEGAL | procurement-all | 10 | 23 | §18-30 | PROC context | Low | Public |
| C121 | UVgO §§ 1-13 — Allgemeine Bestimmungen Unterschwelle | gesetze-im-internet.de/uvgo | LEGAL | procurement-sub-threshold | 8 | 18 | §1-13 | PROC context | Low | Public |
| C122 | UVgO §§ 14-28 — Vergabeverfahren Unterschwelle | gesetze-im-internet.de/uvgo | LEGAL | procurement-sub-threshold | 10 | 23 | §14-28 | PROC-001-008 | Low | Public |
| C123 | VOB/A §1-§3a — Allgemeine Bestimmungen Bauvergabe | gesetze-im-internet.de/vob-a | LEGAL | procurement-construction | 18 | 42 | §1-3a | PROC-004, PROC-011 | Low | Public |
| C124 | BerlAVG §§ 1-6 — Allgemeine Bestimmungen | gesetze.berlin.de/berlavg | LEGAL | procurement-all | 5 | 12 | §1-6 | PROC context | Low | Public |
| C125 | BerlAVG §7 — Umweltkriterien (vollständig) | gesetze.berlin.de/berlavg | LEGAL | procurement-sustainable | 3 | 7 | §7 | **RETR-001** | Low | Public |
| C126 | BerlAVG §§ 8-16 — Soziale Kriterien, Berichtspflichten | gesetze.berlin.de/berlavg | LEGAL | procurement-social | 8 | 18 | §8-16 | RETR context | Low | Public |
| C127 | AV zu §55 LHO Berlin — vollständig mit Anlagen | berlin.de/sen/finanzen | LEGAL | procurement-all | 20 | 46 | §1-4 | **PROC-001-012** | Low | Public |
| C128 | AV Umwelt — Nachhaltige Beschaffung (vollständig) | berlin.de/sen/finanzen | LEGAL | procurement-sustainable | 10 | 23 | — | **RETR-001 depth** | Low | Public |
| C129 | Beschaffungsordnung Berlin (vollständig) | berlin.de/sen/finanzen | LEGAL | procurement-documentation | 20 | 46 | — | **RETR-002** | Low | Public |
| C130 | EU-Schwellenwerte 2024/2026 — Mitteilung der Kommission | eur-lex.europa.eu | LEGAL | procurement-eu-tender | 2 | 5 | — | PROC-010 | Low | Public |

### C4 — HR and Travel Laws — Documents 131-145

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| C131 | TV-L §§ 1-14 — Allgemeine Vorschriften, Arbeitsvertrag | tdl-online.de | LEGAL | personnel-all | 10 | 23 | §1-14 | HR context | Medium | Public |
| C132 | TV-L §§ 15-25 — Arbeitszeit, Überstunden, Teilzeit | tdl-online.de | LEGAL | personnel-part-time | 12 | 28 | §15-25 | HR context | Medium | Public |
| C133 | TV-L §26 — Erholungsurlaub (vollständig) | tdl-online.de | LEGAL | personnel-leave | 5 | 12 | §26 | **RETR-004** | Medium | Public |
| C134 | TV-L §§ 27-33 — Entgeltfortzahlung, Krankheit | tdl-online.de | LEGAL | personnel-sick-leave | 10 | 23 | §27-33 | HR context | Medium | Public |
| C135 | TV-L §34 — Kündigungsfristen (vollständige Tabelle) | tdl-online.de | LEGAL | personnel-exit | 3 | 7 | §34 | HR context | Medium | Public |
| C136 | TV-L Entgeltordnung — Eingruppierungskatalog (vollständig) | tdl-online.de | LEGAL | personnel-salary | 50 | 115 | §1-30 | **SAL-008** | High | Public |
| C137 | TV-L Entgelttabellen 2025 (vollständig, alle EG 1-15) | tdl-online.de | LEGAL | personnel-salary | 15 | 35 | — | SAL-001-007 | Medium | Public |
| C138 | BRKG §§ 1-7 — Allgemeine Vorschriften, Tagegeld Inland | gesetze-im-internet.de/brkg | LEGAL | travel-expenses-domestic | 8 | 18 | §1-7 | TRAV-001-005 | Low | Public |
| C139 | BRKG §§ 8-15 — Übernachtung, Fahrkosten, Ausland | gesetze-im-internet.de/brkg | LEGAL | travel-expenses-all | 10 | 23 | §8-15 | TRAV-004-010 | Low | Public |
| C140 | BRKG §§ 16-23 — Abrechnung, Fristen, Schluss | gesetze-im-internet.de/brkg | LEGAL | travel-expenses-domestic | 8 | 18 | §16-23 | TRAV context | Low | Public |
| C141 | BRKG Auslandsreisekostentabelle (Tagegeld International) | gesetze-im-internet.de/brkg | LEGAL | travel-expenses-international | 5 | 12 | — | **TRAV-006** | Low | Public |
| C142 | UrlVO Bln — vollständig §§ 1-28 | gesetze.berlin.de/urlvo | LEGAL | personnel-leave | 20 | 46 | §1-28 | **RETR-004 depth** | Low | Public |
| C143 | AZVO Bln — Arbeitszeitverordnung (vollständig) | gesetze.berlin.de/azvo | LEGAL | personnel-working-time | 16 | 37 | §1-28 | HR context | Low | Public |
| C144 | LRKG Berlin — Landesreisekostengesetz (vollständig) | gesetze.berlin.de/lrkg | LEGAL | travel-expenses-berlin | 15 | 35 | §1-23 | TRAV Berlin | Low | Public |
| C145 | Mobile Arbeit Rahmenvereinbarung Berlin (vollständig) | berlin.de/sen/inneres | LEGAL | personnel-remote-work | 8 | 18 | — | HR | Low | Public |

### C5 — Administrative and Data Protection — Documents 146-150

| # | Title | Official Source | Corpus | Package(s) | Pages | Est. Chunks | § Refs | Improves | Effort | License |
|---|---|---|---|---|---|---|---|---|---|---|
| C146 | VwVfG — Verwaltungsverfahrensgesetz (Auszug §§ 1-53) | gesetze-im-internet.de/vwvfg | LEGAL | admin-general | 30 | 69 | §1-53 | Admin context | Medium | Public |
| C147 | BDSG — Bundesdatenschutzgesetz (vollständig) | gesetze-im-internet.de/bdsg | LEGAL | data-protection | 25 | 58 | §1-85 | Data protection | Medium | Public |
| C148 | Berliner Datenschutzgesetz (BlnDSG) — vollständig | gesetze.berlin.de/blndsg | LEGAL | data-protection | 15 | 35 | §1-50 | Data protection | Low | Public |
| C149 | IT-Sicherheitsleitlinie Berlin (vollständig) | berlin.de/itdz | LEGAL | it-security | 10 | 23 | — | IT Security | Low | Public |
| C150 | Landeshaushaltsordnung Berlin (LHO) — Auszug §§ 1-55 | gesetze.berlin.de/lho | LEGAL | finance-budget | 30 | 69 | §1-55 | Finance context | Medium | Public |

---

## Batch D — Supplementary Laws (Documents 151-200)

### D1 — Additional Building Regulations (151-160)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | § Refs | Effort |
|---|---|---|---|---|---|---|---|
| D151 | BauGB §§ 1-13 — Bauleitplanung (vollständig) | gesetze-im-internet.de/baugb | LEGAL | 15 | 35 | §1-13 | Low |
| D152 | BauNVO §§ 1-26a — Baunutzungsverordnung (vollständig) | gesetze-im-internet.de/baunvo | LEGAL | 15 | 35 | §1-26a | Low |
| D153 | MBO — Musterbauordnung Gebäudeklassen GK 1-5 | is-argebau.de | LEGAL | 5 | 12 | — | Low |
| D154 | Garagenverordnung Berlin | gesetze.berlin.de | LEGAL | 5 | 12 | §1-10 | Low |
| D155 | Feuerungsverordnung Berlin | gesetze.berlin.de | LEGAL | 8 | 18 | §1-15 | Low |
| D156 | Versammlungsstättenverordnung Berlin (VStättVO) | gesetze.berlin.de | LEGAL | 15 | 35 | §1-50 | Medium |
| D157 | Denkmalschutzgesetz Berlin (Auszug baulicher Teil) | gesetze.berlin.de | LEGAL | 8 | 18 | §1-20 | Low |
| D158 | Baumschutzverordnung Berlin | gesetze.berlin.de | LEGAL | 5 | 12 | §1-10 | Low |
| D159 | Energieeinsparverordnung (GEG) — Auszug baulicher Teil | gesetze-im-internet.de/geg | LEGAL | 10 | 23 | §1-30 | Low |
| D160 | Spielplatzgesetz Berlin | gesetze.berlin.de | LEGAL | 5 | 12 | §1-10 | Low |

### D2 — Additional HR/Travel (161-170)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | § Refs | Effort |
|---|---|---|---|---|---|---|---|
| D161 | TVöD — Auszug für Vergleich mit TV-L | gesetze-im-internet.de/tvoed | LEGAL | 10 | 23 | §1-40 | Medium |
| D162 | Arbeitszeitgesetz (ArbZG) — vollständig | gesetze-im-internet.de/arbzg | LEGAL | 8 | 18 | §1-25 | Low |
| D163 | Teilzeit- und Befristungsgesetz (TzBfG) — vollständig | gesetze-im-internet.de/tzbfg | LEGAL | 8 | 18 | §1-23 | Low |
| D164 | Mutterschutzgesetz (MuSchG) — Auszug | gesetze-im-internet.de/muschg | LEGAL | 10 | 23 | §1-30 | Low |
| D165 | Bundeselterngeld- und Elternzeitgesetz (BEEG) — Auszug | gesetze-im-internet.de/beeg | LEGAL | 10 | 23 | §1-30 | Low |
| D166 | Pflegezeitgesetz (PflegeZG) — Auszug | gesetze-im-internet.de/pflegezg | LEGAL | 5 | 12 | §1-10 | Low |
| D167 | SGB IX — Schwerbehindertenrecht (Auszug Arbeit) | gesetze-im-internet.de/sgb-9 | LEGAL | 8 | 18 | §1-50 | Low |
| D168 | Personalvertretungsgesetz Berlin (PersVG) | gesetze.berlin.de | LEGAL | 20 | 46 | §1-90 | Medium |
| D169 | Gleichstellungsgesetz Berlin (LGG) | gesetze.berlin.de | LEGAL | 8 | 18 | §1-20 | Low |
| D170 | Nebentätigkeitsverordnung Berlin | gesetze.berlin.de | LEGAL | 5 | 12 | §1-10 | Low |

### D3 — Additional Procurement (171-180)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | § Refs | Effort |
|---|---|---|---|---|---|---|---|
| D171 | GWB §§ 115-129 — Nachprüfungsverfahren | gesetze-im-internet.de/gwb | LEGAL | 10 | 23 | §115-129 | Low |
| D172 | GWB §§ 130-184 — Vergabekammer, Rechtsweg | gesetze-im-internet.de/gwb | LEGAL | 15 | 35 | §130-184 | Low |
| D173 | VgV §§ 31-48 — Zuschlag, Aufhebung | gesetze-im-internet.de/vgv | LEGAL | 12 | 28 | §31-48 | Low |
| D174 | VOB/A §4-§22 — Vergabeverfahren Bau (vollständig) | gesetze-im-internet.de/vob-a | LEGAL | 20 | 46 | §4-22 | Medium |
| D175 | Konzessionsvergabeverordnung (KonzVgV) — Auszug | gesetze-im-internet.de/konzvgv | LEGAL | 8 | 18 | §1-30 | Low |
| D176 | Sektorenverordnung (SektVO) — Auszug | gesetze-im-internet.de/sektvo | LEGAL | 8 | 18 | §1-30 | Low |
| D177 | Vergabestatistikverordnung (VergStatVO) | gesetze-im-internet.de/vergstatvo | LEGAL | 5 | 12 | §1-10 | Low |
| D178 | VOL/A — Auszug Lieferleistungen | gesetze-im-internet.de/vol-a | LEGAL | 10 | 23 | §1-30 | Low |
| D179 | HOAI — Honorarordnung (Auszug für Vergabe) | gesetze-im-internet.de/hoai | LEGAL | 8 | 18 | §1-20 | Low |
| D180 | EU-Vergaberichtlinie 2014/24/EU — Auszug | eur-lex.europa.eu | LEGAL | 10 | 23 | Art.1-90 | Low |

### D4 — Citizen Services + Environment (181-190)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | § Refs | Effort |
|---|---|---|---|---|---|---|---|
| D181 | Meldegesetz Berlin (vollständig) | gesetze.berlin.de | LEGAL | 15 | 35 | §1-30 | Medium |
| D182 | Personalausweisgesetz (PAuswG) — Auszug | gesetze-im-internet.de/pauswg | LEGAL | 8 | 18 | §1-30 | Low |
| D183 | Passgesetz (PassG) — Auszug | gesetze-im-internet.de/passg | LEGAL | 8 | 18 | §1-30 | Low |
| D184 | Gewerbeordnung (GewO) — Auszug Anzeigepflicht | gesetze-im-internet.de/gewo | LEGAL | 10 | 23 | §14-15 | Low |
| D185 | Wohngeldgesetz (WoGG) — Auszug | gesetze-im-internet.de/wogg | LEGAL | 15 | 35 | §1-40 | Medium |
| D186 | Bundes-Immissionsschutzgesetz (BImSchG) — Auszug | gesetze-im-internet.de/bimschg | LEGAL | 10 | 23 | §1-30 | Low |
| D187 | Kreislaufwirtschaftsgesetz (KrWG) — Auszug | gesetze-im-internet.de/krwg | LEGAL | 10 | 23 | §1-30 | Low |
| D188 | Berliner Klimaschutzgesetz | gesetze.berlin.de | LEGAL | 8 | 18 | §1-15 | Low |
| D189 | Berliner Naturschutzgesetz (NatSchGBln) | gesetze.berlin.de | LEGAL | 10 | 23 | §1-30 | Low |
| D190 | Berliner Wassergesetz (BWG) — Auszug | gesetze.berlin.de | LEGAL | 8 | 18 | §1-20 | Low |

### D5 — IT, E-Government + Compliance (191-200)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | § Refs | Effort |
|---|---|---|---|---|---|---|---|
| D191 | E-Government-Gesetz Berlin (EGovG Bln) — vollständig | gesetze.berlin.de | LEGAL | 8 | 18 | §1-15 | Low |
| D192 | Onlinezugangsgesetz (OZG) — Auszug | gesetze-im-internet.de/ozg | LEGAL | 8 | 18 | §1-10 | Low |
| D193 | E-Rechnung-Verordnung Berlin | gesetze.berlin.de | LEGAL | 5 | 12 | §1-10 | Low |
| D194 | IT-Grundschutz BSI — Baustein "Kommune" (Auszug) | bsi.bund.de | LEGAL | 10 | 23 | — | Medium |
| D195 | Hinweisgeberschutzgesetz (HinSchG) — Auszug | gesetze-im-internet.de/hinschg | LEGAL | 8 | 18 | §1-40 | Low |
| D196 | Antikorruptionsrichtlinie Berlin | berlin.de/sen/inneres | LEGAL | 8 | 18 | — | Low |
| D197 | Verhaltenskodex öffentlicher Dienst Berlin | berlin.de/sen/inneres | LEGAL | 5 | 12 | — | Low |
| D198 | Bezirksverwaltungsgesetz Berlin (BezVG) | gesetze.berlin.de | LEGAL | 15 | 35 | §1-40 | Medium |
| D199 | Zuständigkeitskatalog Ordnungsaufgaben Berlin | berlin.de/sen/inneres | PROCEDURAL | 10 | 23 | — | High |
| D200 | Organigramm Berliner Verwaltung (mit Funktionsbezeichnungen) | berlin.de/sen/inneres | PROCEDURAL | 3 | 3 | — | Low |

---

## Batch E — Court Decisions + Guidance (Documents 201-250)

### E1 — Vergabekammer Berlin — Leitsatzentscheidungen (201-220)

Twenty key decisions, ~5 pages each. All from berlin.de/vergabekammer. LEGAL corpus.

| # | Topic | Pages | Est. Chunks | Improves |
|---|---|---|---|---|
| E201 | Direktauftrag — fehlende Vergleichsangebote | 5 | 12 | PROC-001 |
| E202 | Beschränkte Ausschreibung — Auswahl der Bieter | 5 | 12 | PROC-002 |
| E203 | Vergabevermerk — unzureichende Dokumentation | 5 | 12 | RETR-002 |
| E204 | Angebotswertung — intransparente Kriterien | 5 | 12 | PROC |
| E205 | Rüge — Fristversäumnis | 5 | 12 | PROC |
| E206 | De-facto-Vergabe — unterlassene Ausschreibung | 5 | 12 | PROC-010 |
| E207 | Rahmenvereinbarung — unzulässige Direktvergabe | 5 | 12 | PROC |
| E208 | Eignungsleihe — Nachweis der Leistungsfähigkeit | 5 | 12 | PROC |
| E209 | Produktvorgabe — unzulässige Spezifikation | 5 | 12 | PROC |
| E210 | Nachforderung von Unterlagen — Ermessen | 5 | 12 | PROC |
| E211 | Ausschlussgründe — ungewöhnlich niedriges Angebot | 5 | 12 | PROC |
| E212 | Losaufteilung — Pflicht zur Fachlosbildung | 5 | 12 | PROC |
| E213 | Interimsvergabe — Dringlichkeit | 5 | 12 | PROC |
| E214 | Ex-Post-Bekanntmachung — unterlassene Veröffentlichung | 5 | 12 | PROC |
| E215 | Vorbefassung — Bieter als Berater | 5 | 12 | PROC |
| E216 | Wertung — unzulässige Zuschlagskriterien | 5 | 12 | PROC |
| E217 | Tariftreue — Nachweis unzureichend | 5 | 12 | RETR |
| E218 | Aufhebung — rechtmäßige Gründe | 5 | 12 | PROC |
| E219 | Akteneinsicht — Umfang im Nachprüfungsverfahren | 5 | 12 | PROC |
| E220 | Kostenentscheidung — Gebühren Nachprüfungsverfahren | 5 | 12 | PROC |

### E2 — OVG Berlin-Brandenburg — Baurecht (221-240)

Twenty key decisions, ~5 pages each. From berlin.de/gerichte/ovg. LEGAL corpus.

| # | Topic | Pages | Est. Chunks | Improves |
|---|---|---|---|---|
| E221 | Abstandsflächen — Berechnung bei Staffelgeschoss | 5 | 12 | BUILD-002 |
| E222 | Genehmigungsfreiheit — Carport im Außenbereich | 5 | 12 | BUILD-003 |
| E223 | Nutzungsänderung — Büro zu Wohnen | 5 | 12 | BUILD-005 |
| E224 | Brandschutz — Zweiter Rettungsweg | 5 | 12 | BUILD-006 |
| E225 | Nachbarschutz — Drittwiderspruch Abstandsfläche | 5 | 12 | BUILD-002 |
| E226 | Befreiung — Überschreitung Baugrenze | 5 | 12 | BUILD |
| E227 | Vorbescheid — Bindungswirkung | 5 | 12 | BUILD-001 |
| E228 | Baulast — Sicherung Stellplatz | 5 | 12 | BUILD |
| E229 | Einstellung — formelle Illegalität | 5 | 12 | BUILD |
| E230 | Gebietsverträglichkeit — Wohnen im Gewerbegebiet | 5 | 12 | BUILD |
| E231-240 | (10 weitere OVG-Entscheidungen zu Bauplanungs- und Bauordnungsrecht) | 50 | 115 | BUILD context |

### E3 — Guidance Documents (241-250)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | Effort |
|---|---|---|---|---|---|---|
| E241 | Leitfaden Nachhaltige Beschaffung Berlin | berlin.de/sen/finanzen | PROCEDURAL | 15 | 35 | Medium |
| E242 | Leitfaden Energieeffiziente Beschaffung | berlin.de/sen/finanzen | PROCEDURAL | 10 | 23 | Medium |
| E243 | Leitfaden Faire Beschaffung (ILO-Kernarbeitsnormen) | berlin.de/sen/finanzen | PROCEDURAL | 8 | 18 | Low |
| E244 | Merkblatt Genehmigungsfreie Vorhaben (Bürgerinformation) | berlin.de/sen/sbw | PROCEDURAL | 3 | 7 | Low |
| E245 | Merkblatt Bauen im Bestand | berlin.de/sen/sbw | PROCEDURAL | 5 | 12 | Low |
| E246 | Leitfaden Barrierefreies Bauen Berlin | berlin.de/sen/sbw | PROCEDURAL | 8 | 18 | Low |
| E247 | Merkblatt Solaranlagen auf Dächern | berlin.de/sen/sbw | PROCEDURAL | 3 | 7 | Low |
| E248 | Leitfaden Dachgeschossausbau | berlin.de/sen/sbw | PROCEDURAL | 5 | 12 | Low |
| E249 | Bürgerinformation Bauantrag — Schritt für Schritt | berlin.de/sen/sbw | PROCEDURAL | 5 | 12 | Low |
| E250 | Leitfaden Widerspruchsverfahren (für Sachbearbeiter) | berlin.de/sen/inneres | PROCEDURAL | 8 | 18 | Low |

---

## Batch F — Forms, Historical, Specialized (Documents 251-300)

### F1 — Official Forms (251-265)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | Effort |
|---|---|---|---|---|---|---|
| F251 | Bauantragsformular (vollständig, alle Abschnitte) | berlin.de/sen/sbw | PROCEDURAL | 5 | 5 | Low |
| F252 | Bauvorbescheid-Antrag | berlin.de/sen/sbw | PROCEDURAL | 3 | 3 | Low |
| F253 | Nutzungsänderung-Antrag | berlin.de/sen/sbw | PROCEDURAL | 3 | 3 | Low |
| F254 | Abbruchantrag | berlin.de/sen/sbw | PROCEDURAL | 2 | 2 | Low |
| F255 | Teilbaugenehmigung-Antrag | berlin.de/sen/sbw | PROCEDURAL | 3 | 3 | Low |
| F256 | Abgeschlossenheitsbescheinigung-Antrag | berlin.de/sen/sbw | PROCEDURAL | 2 | 2 | Low |
| F257 | Baulast-Erklärung | berlin.de/sen/sbw | PROCEDURAL | 2 | 2 | Low |
| F258 | Werbeanlage-Antrag | berlin.de/sen/sbw | PROCEDURAL | 2 | 2 | Low |
| F259 | Anmeldung Wohnsitz (Formular) | berlin.de/buergeramt | PROCEDURAL | 2 | 2 | Low |
| F260 | Gewerbeanmeldung (Formular) | berlin.de/buergeramt | PROCEDURAL | 3 | 3 | Low |
| F261 | Wohngeld-Antrag (Formular, vollständig) | berlin.de/buergeramt | PROCEDURAL | 8 | 8 | Low |
| F262 | Personalausweis-Antrag (Formular) | berlin.de/buergeramt | PROCEDURAL | 2 | 2 | Low |
| F263 | Führungszeugnis-Antrag (Formular) | berlin.de/buergeramt | PROCEDURAL | 2 | 2 | Low |
| F264 | Beglaubigung-Antrag (Formular) | berlin.de/buergeramt | PROCEDURAL | 1 | 1 | Low |
| F265 | Sondernutzungserlaubnis-Antrag (Straßenland) | berlin.de/buergeramt | PROCEDURAL | 2 | 2 | Low |

### F2 — Historical Versions (266-280)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | Effort |
|---|---|---|---|---|---|---|
| F266 | AV zu §55 LHO Berlin — Fassung 2021 | berlin.de/sen/finanzen | LEGAL | 20 | 46 | Low |
| F267 | AV zu §55 LHO Berlin — Fassung 2018 | berlin.de/sen/finanzen | LEGAL | 18 | 41 | Low |
| F268 | BauO Bln — Fassung 2023 | gesetze.berlin.de | LEGAL | 40 | 92 | Medium |
| F269 | BauO Bln — Fassung 2018 | gesetze.berlin.de | LEGAL | 38 | 87 | Medium |
| F270 | BauVorlV 2017 (BauVerfV) | gesetze.berlin.de | LEGAL | 15 | 35 | Low |
| F271 | TV-L — Fassung 2023 | tdl-online.de | LEGAL | 40 | 92 | Medium |
| F272 | TV-L Entgelttabellen 2024 | tdl-online.de | LEGAL | 15 | 35 | Low |
| F273 | TV-L Entgelttabellen 2023 | tdl-online.de | LEGAL | 15 | 35 | Low |
| F274 | BRKG — Fassung 2020 | gesetze-im-internet.de | LEGAL | 20 | 46 | Low |
| F275 | VgV — Fassung 2019 | gesetze-im-internet.de | LEGAL | 25 | 58 | Low |
| F276 | Berliner Klimaschutzgesetz — Fassung 2020 | gesetze.berlin.de | LEGAL | 8 | 18 | Low |
| F277 | Beschaffungsordnung Berlin — Fassung 2020 | berlin.de/sen/finanzen | LEGAL | 20 | 46 | Low |
| F278 | UrlVO Bln — Fassung 2015 | gesetze.berlin.de | LEGAL | 18 | 41 | Low |
| F279 | LRKG Berlin — Fassung 2018 | gesetze.berlin.de | LEGAL | 15 | 35 | Low |
| F280 | EU-Schwellenwerte 2020-2021 | eur-lex.europa.eu | LEGAL | 2 | 5 | Low |

### F3 — Specialized Documents (281-300)

| # | Title | Official Source | Corpus | Pages | Est. Chunks | Effort |
|---|---|---|---|---|---|---|
| F281 | Onboarding-Handbuch für neue Mitarbeiter | berlin.de/sen/inneres | PROCEDURAL | 15 | 35 | Medium |
| F282 | Datenschutz-Handbuch für die Berliner Verwaltung | berlin.de/datenschutz | PROCEDURAL | 20 | 46 | High |
| F283 | Compliance-Handbuch (Antikorruption, Sponsoring, Nebentätigkeit) | berlin.de/sen/inneres | PROCEDURAL | 15 | 35 | Medium |
| F284 | eVergabe-Plattform — Benutzerhandbuch (vollständig) | vergabe-plattform.berlin.de | PROCEDURAL | 20 | 46 | High |
| F285 | eVergabe-Plattform — Bieterleitfaden | vergabe-plattform.berlin.de | PROCEDURAL | 10 | 23 | Medium |
| F286 | Reisekosten-Handbuch International (ergänzend) | berlin.de/sen/inneres | PROCEDURAL | 10 | 23 | Medium |
| F287 | Antwortvorlagen Bürgeranfragen — Bauamt (Sammlung) | berlin.de/sen/sbw | PROCEDURAL | 15 | 35 | High |
| F288 | Antwortvorlagen Bürgeranfragen — Bürgeramt (Sammlung) | berlin.de/buergeramt | PROCEDURAL | 15 | 35 | High |
| F289 | Standardbescheide-Sammlung Bauamt (alle Varianten) | berlin.de/sen/sbw | PROCEDURAL | 20 | 46 | High |
| F290 | Standardverträge-Sammlung (Vergabe, Personal, Miete) | berlin.de/sen/finanzen | PROCEDURAL | 15 | 35 | Medium |
| F291 | Checklisten-Sammlung Bürgeramt (alle Dienstleistungen) | berlin.de/buergeramt | PROCEDURAL | 20 | 20 | High |
| F292 | Geschäftsverteilungsplan Bezirksamt (Muster) | berlin.de/sen/inneres | PROCEDURAL | 5 | 5 | Low |
| F293 | Ausbildungshandbuch Verwaltungsfachangestellte | berlin.de/sen/inneres | PROCEDURAL | 20 | 46 | Medium |
| F294 | Brandschutz-Prüfschema für Bauanträge (ausführlich) | berlin.de/sen/sbw | PROCEDURAL | 10 | 23 | Medium |
| F295 | Stellplatzsatzung Berlin — mit Berechnungstabelle | berlin.de/sen/sbw | PROCEDURAL | 5 | 12 | Low |
| F296 | Entwässerungsplan-Merkblatt (Bauantrag) | berlin.de/sen/sbw | PROCEDURAL | 3 | 7 | Low |
| F297 | Barrierefreiheit-Checkliste (DIN 18040) | berlin.de/sen/sbw | PROCEDURAL | 5 | 5 | Low |
| F298 | Gefährdungsbeurteilung Büroarbeitsplatz (Muster) | berlin.de/sen/inneres | PROCEDURAL | 5 | 5 | Low |
| F299 | Datenschutz-Folgenabschätzung (Muster, ausgefüllt) | berlin.de/datenschutz | PROCEDURAL | 8 | 8 | Low |
| F300 | Zuständigkeitskatalog — erweiterte Fassung mit Telefonverzeichnis | berlin.de/sen/inneres | PROCEDURAL | 20 | 20 | High |

---

## Summary Statistics

### Corpus Composition

| Corpus | Documents | Pages | Est. Chunks | Est. Vectors |
|---|---|---|---|---|
| **LEGAL** | 120 | ~2,200 | ~5,000 | ~5,000 |
| **PROCEDURAL** | 180 | ~1,500 | ~3,000 | ~3,000 |
| **Total** | **300** | **~3,700** | **~8,000** | **~8,000** |

### Category Distribution

| Category | Documents | % |
|---|---|---|
| Checklists | 20 | 7% |
| Templates / Muster | 20 | 7% |
| FAQs | 10 | 3% |
| Fee Schedules | 5 | 2% |
| Decision Trees / Prüfschemata | 7 | 2% |
| Manuals / Handbücher | 15 | 5% |
| Circulars / Rundschreiben | 20 | 7% |
| Process Descriptions | 5 | 2% |
| Sample Completed Forms | 10 | 3% |
| Core Laws & Regulations | 85 | 28% |
| Supplementary Laws | 48 | 16% |
| Court Decisions | 40 | 13% |
| Guidance Documents | 10 | 3% |
| Official Forms | 15 | 5% |
| Historical Versions | 15 | 5% |
| Specialized Documents | 20 | 7% |
| **Daily operational (checklists, templates, FAQs, fees, processes)** | **67** | **22%** |
| **Weekly references (manuals, circulars, decision trees, samples)** | **52** | **17%** |
| **Laws and regulations** | **133** | **44%** |
| **Court decisions** | **40** | **13%** |
| **Other (forms, historical, specialized)** | **50** | **17%** |

---

## Import Commands

```bash
# Login
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@berlin.de","password":"..."}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Batch A — Daily Tools (50 docs)
curl -X POST "http://localhost:8080/api/documents/batch-import?sourceDir=/corpus-inbox/batch-a&tags=v1.1,batch-a,production" \
  -H "Authorization: Bearer $TOKEN"

# Batch B — Weekly References (50 docs)
curl -X POST ".../batch-import?sourceDir=/corpus-inbox/batch-b&tags=v1.1,batch-b,production" \
  -H "Authorization: Bearer $TOKEN"

# Batch C — Core Laws (50 docs)
curl -X POST ".../batch-import?sourceDir=/corpus-inbox/batch-c&tags=v1.1,batch-c,production" \
  -H "Authorization: Bearer $TOKEN"

# Batches D-F similarly...
```

### Validation After Each Batch

```bash
# 1. Check ingestion status
curl "http://localhost:8080/api/documents?tag=batch-a&size=100" -H "Authorization: Bearer $TOKEN"

# 2. Check embedding coverage
curl "http://localhost:8080/admin/corpus-health" -H "Authorization: Bearer $TOKEN"

# 3. Run benchmark
mvn test -pl platform-api -Dtest="BenchmarkTest" -Dsurefire.failIfNoSpecifiedTests=false

# 4. Generate reports
curl -X POST "http://localhost:8080/admin/corpus-inventory/generate" -H "Authorization: Bearer $TOKEN"
```

---

## Acquisition Effort Estimate

| Batch | Documents | Manual Download | Metadata JSON | Validation | Total Hours |
|---|---|---|---|---|---|
| A | 50 daily tools | 10 h | 5 h | 2 h | **17 h** |
| B | 50 weekly references | 15 h | 8 h | 3 h | **26 h** |
| C | 50 core laws | 8 h | 5 h | 3 h | **16 h** |
| D | 50 supplementary laws | 12 h | 8 h | 3 h | **23 h** |
| E | 50 court decisions + guidance | 15 h | 10 h | 3 h | **28 h** |
| F | 50 forms + historical + specialized | 12 h | 8 h | 3 h | **23 h** |
| **Total** | **300** | **72 h** | **44 h** | **17 h** | **133 h (~17 days)** |

**With 2 people:** ~8 working days for acquisition + 3 days for ingestion + 2 days for validation = **~13 working days total.**
