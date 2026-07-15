# Wissen (Knowledge)

## Design Principle

Wissen is where users go to find anything. It searches across every category in the platform — regulations, procedures, templates, FAQs, cases, citizens, and documents — and groups results by type so the user can navigate directly to what they need.

The separation from "Meine Arbeit" is intentional: researching and processing cases are different mental modes.

## Main Screen: Unified Search

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Wissen                                                                       │
│                                                                              │
│  [ Alles ]  Vorschriften  Verfahren  Vorlagen  FAQs  Fälle  Bürger  Dokumente │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │  🔍  ┌──────────────────────────────────────────────────────────────┐    ││
│  │      │ Abstandsflächen Carport BauO NRW                              │    ││
│  │      └──────────────────────────────────────────────────────────────┘    ││
│  │                                                                  [ → ]  ││
│  │                                                                          ││
│  │  Fachbereich: [ Alle ▾ ]  Sortierung: [ Relevanz ▾ ]                       ││
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── VORSCHRIFTEN (3) ────────────────────────────────────────────────────    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ████████████████ 92%  📄 BauO NRW 2024 — §6 Abstandsflächen              ││
│  │ (1) Vor den Außenwänden von Gebäuden sind Abstandsflächen freizuhalten... ││
│  │ BauO NRW 2024 | §6 | Bauamt | Gültig seit 01.01.2024                     ││
│  │ [ Volltext öffnen ]                             [ ☆ Merken ]             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ████████████░░░░ 78%  📄 BauO NRW 2024 — §65 Verfahrensfreie Vorhaben    ││
│  │ BauO NRW 2024 | §65 | Bauamt | Gültig seit 01.01.2024                    ││
│  │ [ Volltext öffnen ]                             [ ☆ Merken ]             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── VERFAHREN (1) ───────────────────────────────────────────────────────    ││
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ 📋 Bauantrag: Verfahrensablauf                                            ││
│  │ Schritt 1: Antragseingang → 2: Vollständigkeitsprüfung → 3: Nachbarn...  ││
│  │ Bauamt | 7 Schritte | Letzte Aktualisierung: 01.01.2024                   ││
│  │ [ Verfahren öffnen ]                            [ ☆ Merken ]             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── FAQs (2) ────────────────────────────────────────────────────────────    ││
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ❓ Wann ist ein Carport genehmigungsfrei?                                  ││
│  │ Bauamt | FAQ | Letzte Aktualisierung: 15.03.2024                          ││
│  │ [ Antwort anzeigen ]                            [ ☆ Merken ]             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ❓ Wie berechne ich die Abstandsfläche?                                    ││
│  │ Bauamt | FAQ | Letzte Aktualisierung: 15.03.2024                          ││
│  │ [ Antwort anzeigen ]                            [ ☆ Merken ]             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── VORLAGEN (1) ────────────────────────────────────────────────────────    ││
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ 📝 Baugenehmigung (Standardbescheid)                                       ││
│  │ Felder: Antragsteller, Vorhaben, Flurstück, Rechtsgrundlage, Auflagen...  ││
│  │ Bauamt | Vorlage | Verwendet in 12 Vorgängen                              ││
│  │ [ Vorschau ]  [ In Vorgang verwenden ]          [ ☆ Merken ]             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── FÄLLE (4) ───────────────────────────────────────────────────────────    ││
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ 📁 #2026-0147  Bauantrag Carport — Thomas Becker                          ││
│  │ Status: In Bearbeitung (Müller) | Eingegangen: 15.07.2026                 ││
│  │ [ Vorgang öffnen ]                                                       ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ 📁 #2025-0892  Bauantrag Carport — Heinrich Wagner (archiviert)           ││
│  │ Status: Archiviert | Abgeschlossen: 03.09.2025 | Ergebnis: Genehmigt      ││
│  │ [ Vorgang öffnen ]                         [ Als Referenz verwenden ]    ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── BÜRGER (1) ──────────────────────────────────────────────────────────    ││
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ 👤 Thomas Becker, Musterstraße 12, 45127 Essen                            ││
│  │ 3 Vorgänge: BAU-2026-0147 (offen), BAU-2024-0092 (archiviert), BÜRG-2024-0067 (archiviert)        ││
│  │ [ Bürgerakte öffnen ]                                                    ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ── DOKUMENTE (1) ───────────────────────────────────────────────────────    ││
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ 📄 Merkblatt Abstandsflächen NRW (PDF, 4 Seiten)                          ││
│  │ Bauamt | Informationsblatt | Hochgeladen: 01.03.2024                      ││
│  │ [ Dokument öffnen ]                                                       ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  13 Ergebnisse in 6 Kategorien                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Search Scope

The unified search covers:

| Category | Searches | Result Display |
|---|---|---|
| **Vorschriften** | Regulation text, section titles, document metadata | Excerpt with relevance %, section reference, document link |
| **Verfahren** | Procedure steps, titles, legal references | Procedure title, step count, department |
| **Vorlagen** | Template names, fields, categories | Template name, fields, usage count |
| **FAQs** | Questions, answers, categories | Question text, department, answer preview |
| **Fälle** | Case numbers, subjects, citizen names, status, internal notes | Case #, subject, status, citizen, date |
| **Bürger** | Names, addresses, case history | Name, address, case count, link to citizen file |
| **Dokumente** | Document titles, metadata, full text (non-regulation docs) | Title, type, pages, department |

**Search behavior:**
- Default scope: "Alles" (everything). User can narrow to a single category via tabs.
- Archived cases are included in search (marked "archiviert")
- Internal notes are searchable but only visible to the note author and supervisors
- Results grouped by category with dividers
- Each category shows top 5 results. "Mehr anzeigen" link for full list per category.
- Recent searches saved and shown as suggestions in empty search state
- Search history is per-user, not shared

## Vorschriften (Regulations Browser)

Unchanged from the original specification. Browse by department with document detail panel.

## Verfahren (Procedures)

Unchanged from the original specification. Structured procedure descriptions with threshold tables.

## Vorlagen (Templates)

Unchanged from the original specification. Template library with preview and "In Vorgang verwenden" action.

## FAQs

Unchanged from the original specification. Expandable Q&A grouped by department.

## Favoriten & Zuletzt verwendet

Right sidebar (collapsible, 280px). Unchanged from the original specification.
