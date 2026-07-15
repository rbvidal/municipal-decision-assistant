# Case Workflow — "Meine Arbeit"

## Design Principle

This is the heart of the product. The Sachbearbeiter spends 80% of their day here. The workflow follows the natural lifecycle of a municipal case — from citizen application to archival — with full operational support: checklists, notes, waiting states, risk tracking, and audit trail.

The interface is a single-page workspace that changes context based on the selected case and phase. Every phase shows what is done, what is current, and what is next. The AI suggests; the human decides.

## Complete Case Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CASE LIFECYCLE                                      │
│                                                                              │
│  POSTEINGANG  →  PRÜFUNG  →  ENTSCHEIDUNGS-  →  ENTWURF  →  GENEHMIGUNG     │
│                                 UNTERSTÜTZUNG                                 │
│                                                                      │       │
│                                                                      ▼       │
│                          ARCHIV  ←  VERSAND                                   │
│                                                                              │
│  At any point, a Vorgang can enter a WARTEN state:                           │
│    · WARTET AUF BÜRGER      — fehlende Unterlagen oder Informationen         │
│    · WARTET AUF BEHÖRDE     — wartet auf externe Stellungnahme               │
│    · WARTET AUF KOLLEGEN    — neu zugewiesen oder delegiert                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Case Numbering Convention

All Vorgang numbers follow the format `FACH-YYYY-NNNN`:

| Prefix | Fachbereich | Example |
|---|---|---|
| `BAU` | Bauamt | BAU-2026-0147 |
| `VERG` | Vergabestelle | VERG-2026-0152 |
| `PERS` | Personal | PERS-2026-0151 |
| `BÜRG` | Bürgeramt | BÜRG-2026-0119 |
| `ALLG` | Allgemeine Verwaltung | ALLG-2026-0154 |

The sequence number is zero-padded to 4 digits and resets annually. The year prefix enables cross-year archive search.

## Sub-Navigation

```
[ Posteingang (3) ]  [ Offene Vorgänge (12) ]  [ Warten (5) ]  [ Genehmigung (2) ]  [ Archiv (47) ]
```

---

## Screen: Posteingang (Inbox)

The inbox shows all new applications and citizen inquiries assigned to the user or department. Each row shows the case number, subject, date received, department, and a risk indicator.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Meine Arbeit > Posteingang                                                   │
│                                                                              │
│  [ Posteingang (3) ]  Offene Vorgänge (12)  Warten (5)  Genehmigung (2)  Archiv │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Filter: [ Alle Fachbereiche ▾ ]  [ Alle Prioritäten ▾ ]  🔍 Suche...     ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────┬──────────────────────┬──────────────┬────────────┬──────┬────────┐ │
│  │  #   │ Betreff              │ Eingegangen  │ Fachbereich│Risk  │Aktion  │ │
│  ├──────┼──────────────────────┼──────────────┼────────────┼──────┼────────┤ │
│  │ 0153 │ Bauantrag Wohnhaus    │ Heute, 08:15 │ Bauamt     │ 🟡   │ Öffnen │ │
│  │ 0154 │ Gewerbeanmeldung      │ Heute, 09:30 │ Allgemein  │ 🟢   │ Öffnen │ │
│  │ 0155 │ Anfrage Bauvorbescheid│ Heute, 11:00 │ Bauamt     │ 🔴   │ Öffnen │ │
│  └──────┴──────────────────────┴──────────────┴────────────┴──────┴────────┘ │
│                                                                              │
│  3 neue Vorgänge                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Vorgang öffnen (Open Case)

Clicking a case opens a three-panel workspace:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Zurück     Vorgang #2026-0147     Bauantrag Carport    [ ⭐ Beobachten ]   │
│                                                                              │
│  ┌──────────┬──────────────────────────────┬────────────────────────────────┐│
│  │          │                              │                                ││
│  │ CASE     │  WORKSPACE                   │  ENTSCHEIDUNGSUNTERSTÜTZUNG     ││
│  │ DETAILS  │                              │                                ││
│  │          │  Phase:  ●○ Prüfung           │  Zusammenfassung               ││
│  │ Betreff  │          ○○ Entsch.unt.      │  ┌────────────────────────┐    ││
│  │ Carport  │          ○○ Entwurf           │  │ 18 m² Carport an      │    ││
│  │          │          ○○ Genehmigung       │  │ südlicher Grundstücks-│    ││
│  │ Antragst.│          ○○ Versand           │  │ grenze. 3m Abstand.   │    ││
│  │ T. Becker│          ○○ Archiv            │  │ §65 BauO NRW prüfen.  │    ││
│  │ Musterstr│                              │  └────────────────────────┘    ││
│  │ 12       │  ────────────────────────     │                                ││
│  │ 45127    │                              │  Risiko                        ││
│  │ Essen    │  CHECKLISTE                   │  🟢 Gering                     ││
│  │          │  ┌────────────────────────┐   │  Verfahrensfreies Vorhaben     ││
│  │ Eingang  │  │ ☑ Antrag vollständig   │   │                                ││
│  │ 15.07.26 │  │ ☑ Zuständigkeit prüfen │   │  Fehlende Informationen       ││
│  │          │  │ ☑ Dokumente gesichtet  │   │  · Keine (vollständig)         ││
│  │ Fällig   │  │ ☐ Ortstermin prüfen    │   │                                ││
│  │ 22.07.26 │  │ ☐ Nachbar anhören      │   │  Nächste Aktion               ││
│  │          │  │ ☐ Entsch. erstellen    │   │  Entscheidungsentwurf          ││
│  │ Priorität│  └────────────────────────┘   │  auf Basis §65 BauO NRW        ││
│  │ 🔴 Hoch  │                              │                                ││
│  │          │  ────────────────────────     │  ┌──────────────────────┐      ││
│  │ Zugewiesen│                              │  │ Entsch. unterstützung│      ││
│  │ S. Müller│  DOKUMENTE (4)               │  │       starten        │      ││
│  │          │  📄 Bauantrag.pdf             │  └──────────────────────┘      ││
│  │          │  📄 Lageplan.pdf              │                                ││
│  │          │  📄 Baubeschreibung.pdf       │  ▶ Erweitert                  ││
│  │          │  📄 Statik_Carport.pdf        │                                ││
│  │          │                              │                                ││
│  │          │  ────────────────────────     │                                ││
│  │          │                              │                                ││
│  │          │  INTERNE NOTIZEN (2)         │                                ││
│  │          │  ┌────────────────────────┐   │                                ││
│  │          │  │ S. Müller, 15.07. 10:30│   │                                ││
│  │          │  │ Abstand 3m zur Grenze  │   │                                ││
│  │          │  │ reicht aus. §6 geprüft.│   │                                ││
│  │          │  │                        │   │                                ││
│  │          │  │ S. Müller, 15.07. 08:45│   │                                ││
│  │          │  │ Carport 18 m² → §65    │   │                                ││
│  │          │  │ BauO NRW. Keine Genehm.│   │                                ││
│  │          │  └────────────────────────┘   │                                ││
│  │          │  ┌────────────────────────┐   │                                ││
│  │          │  │ Neue Notiz...          │   │                                ││
│  │          │  └────────────────────────┘   │                                ││
│  │          │                              │                                ││
│  │          │  ────────────────────────     │                                ││
│  │          │                              │                                ││
│  │          │  AKTIVITÄT (6 Einträge)     │                                ││
│  │          │  ┌────────────────────────┐   │                                ││
│  │          │  │ 15.07. 10:30  Müller   │   │                                ││
│  │          │  │ → Interne Notiz        │   │                                ││
│  │          │  │ 15.07. 10:23  Müller   │   │                                ││
│  │          │  │ → Dokumente geprüft    │   │                                ││
│  │          │  │ 15.07. 08:45  Müller   │   │                                ││
│  │          │  │ → Interne Notiz        │   │                                ││
│  │          │  │ 15.07. 08:30  System   │   │                                ││
│  │          │  │ → Zugewiesen an Müller │   │                                ││
│  │          │  │ 15.07. 08:15  System   │   │                                ││
│  │          │  │ → Eingegangen          │   │                                ││
│  │          │  │ 15.07. 08:15  Bürger   │   │                                ││
│  │          │  │ → Antrag eingereicht   │   │                                ││
│  │          │  └────────────────────────┘   │                                ││
│  │          │  [ Vollständigen Verlauf ]    │                                ││
│  │          │                              │                                ││
│  └──────────┴──────────────────────────────┴────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Checklist System

Each case has a dynamic checklist that adapts to case type. Items can be mandatory or recommended.

**Bauantrag checklist:**
```
☑ Antrag auf Vollständigkeit prüfen
☑ Zuständigkeit bestätigt
☑ Dokumente gesichtet
☐ Ortstermin erforderlich?
☐ Nachbar anhören (§13 BauO NRW)
☐ Abstandsflächen prüfen (§6 BauO NRW)
☐ Erschließung prüfen
☐ Entscheidungsentwurf erstellen
☐ Vier-Augen-Prinzip: Genehmigung einholen
☐ Bescheid versenden
☐ Vorgang archivieren
```

**Beschaffung checklist:**
```
☑ Bedarfsmeldung liegt vor
☑ Haushaltsmittel verfügbar?
☐ Auftragswert ermitteln
☐ Vergabeverfahren bestimmen (Direktauftrag / Beschränkt / Öffentlich)
☐ Angebote einholen (3 bei beschränkter Ausschreibung)
☐ Angebote prüfen und bewerten
☐ Vergabevermerk erstellen
☐ Auftrag erteilen
☐ Leistung abnehmen
☐ Rechnung prüfen und anweisen
☐ Vorgang archivieren
```

**Checklist behavior:**
- Items auto-populate based on case type (Bauantrag, Beschaffung, Widerspruch, etc.)
- User can add/remove custom items
- Completed items show timestamp and user
- Incomplete items show in the "Nächste Aktion" suggestion
- Mandatory items (marked with *) block phase advancement

---

## Internal Notes

Internal notes are a core collaboration feature. They are never sent to citizens.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  INTERNE NOTIZEN (2)                                          [ + Neue Notiz ]│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Sabine Müller  ·  15.07.2026 10:30                                       ││
│  │ ─────────────────────────────────────────────────────────────────────────││
│  │ Abstand von 3m zur südlichen Grundstücksgrenze reicht aus.                ││
│  │ Wandhöhe 2,5m × 0,4 = 1,0m erforderliche Abstandsfläche.                 ││
│  │ §6 BauO NRW 2024 ist eingehalten. Keine Abweichung nötig.                ││
│  │                                                                          ││
│  │ [ Bearbeiten ]  [ Löschen ]                                              ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Sabine Müller  ·  15.07.2026 08:45                                       ││
│  │ ─────────────────────────────────────────────────────────────────────────││
│  │ Carport 18 m² Grundfläche → fällt unter §65 BauO NRW.                    ││
│  │ Keine Baugenehmigung erforderlich. Nur Abstandsflächen prüfen.           ││
│  │ Bitte vor Ortstermin klären: Sichtschutz zum Nachbarn gewünscht?         ││
│  │                                                                          ││
│  │ [ Bearbeiten ]  [ Löschen ]                                              ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

**Rules for internal notes:**
- Always visible in the case detail panel
- Show author, timestamp, and full text
- Newest note at top
- Editable and deletable by author (and supervisor)
- Never included in citizen-facing output
- Searchable from Wissen

---

## Assignment / Reassignment

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Zugewiesen an                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Sabine Müller                                    [ Zuweisung ändern ]    ││
│  │ Sachbearbeiterin Bauamt                                                 ││
│  │ Seit: 15.07.2026 08:30                                                  ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Neuzuweisung:                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Zuweisen an: [ Kollegen auswählen ▾ ]                                    ││
│  │ Grund:       [ Vertretung (Urlaub) ▾ ]                                   ││
│  │              ○ Vertretung (Urlaub)                                        ││
│  │              ○ Vertretung (Krankheit)                                     ││
│  │              ○ Fachliche Zuständigkeit                                    ││
│  │              ○ Überlastung                                                ││
│  │              ○ Eskalation an Vorgesetzten                                 ││
│  │                                                                          ││
│  │ ┌──────────────────────┐                                                 ││
│  │ │  Zuweisung speichern  │                                                 ││
│  │ └──────────────────────┘                                                 ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

**Assignment rules:**
- Shows current assignee, role, department, and assignment date
- Reassignment requires a reason (dropdown)
- Reassignment creates an audit event and activity entry
- Case appears in new assignee's inbox with "Neu zugewiesen" badge
- Previous assignee can still view (unless explicitly removed)
- Supervisor can always reassign

---

## Waiting States

Cases don't always move forward. Three explicit waiting states prevent cases from being forgotten:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  WARTEN (5)                                                                   │
│                                                                              │
│  ┌──────┬──────────────────┬────────────┬──────────┬──────────┬────────────┐ │
│  │  #   │ Betreff          │ Wartet auf │ Seit     │ Fällig   │ Aktion     │ │
│  ├──────┼──────────────────┼────────────┼──────────┼──────────┼────────────┤ │
│  │ 0143 │ Bauantrag Müller  │ 👤 Bürger  │ 7 Tagen  │ 22.07.   │ Öffnen     │ │
│  │ 0145 │ Gewerbeanmeldung  │ 👤 Bürger  │ 3 Tagen  │ 25.07.   │ Öffnen     │ │
│  │ 0146 │ Wohngeldantrag    │ 👤 Bürger  │ 1 Tag    │ 30.07.   │ Öffnen     │ │
│  │ 0150 │ Hundesteuer       │ 👤 Bürger  │ 12 Tagen │ 18.07.⚠ │ Erinnern    │ │
│  │ 0141 │ Bauvorbescheid    │ 🏛 Behörde │ 14 Tagen │ 05.08.   │ Nachfassen  │ │
│  └──────┴──────────────────┴────────────┴──────────┴──────────┴────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Waiting state behavior:**
- Cases in waiting state are excluded from "Offene Vorgänge" count
- Each waiting case shows who/what it's waiting on and for how long
- If deadline passes while waiting, case appears in "Überfällig" with warning
- "Erinnern" button sends automatic reminder to citizen (if email on file)
- "Nachfassen" button for external authorities (manual action)
- After 14 days waiting on citizen without response: auto-escalation flag

---

## Missing Documents

When required documents are missing, the case shows a prominent warning:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚠️  Fehlende Unterlagen (2)                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Für diesen Vorgang fehlen folgende erforderliche Unterlagen:              ││
│  │                                                                          ││
│  │ ✗ Lageplan (Maßstab 1:500)                          [ Vom Bürger anfordern ]││
│  │ ✗ Baubeschreibung (nach §11 BauVorlVO)              [ Vom Bürger anfordern ]││
│  │                                                                          ││
│  │ Der Vorgang kann erst nach Eingang aller Unterlagen vollständig           ││
│  │ bearbeitet werden.                                                       ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Risk Indicators

Every case shows a risk level derived from multiple signals:

```
RISK CALCULATION
──────────────────────────────────────────────
Risk is computed automatically from:

  · Deadline proximity       (overdue = +30pts, due today = +20pts, within 3 days = +10pts)
  · Case complexity          (Bauantrag = +10pts, Beschaffung >100k = +15pts, Widerspruch = +5pts)
  · Missing documents         (+8pts per missing required document)
  · Waiting duration          (>7 days = +10pts, >14 days = +20pts)
  · Citizen complaint history (+5pts if prior complaints)
  · Political sensitivity     (+10pts if flagged by supervisor)

  🟢 Gering   (0-19 pts)  — Routine case, standard processing
  🟡 Mittel   (20-39 pts) — Requires attention, check deadlines
  🔴 Hoch     (40+ pts)   — Urgent action needed, escalate if necessary
```

Risk is displayed as:
- Badge in case list (🟢🟡🔴)
- Banner at top of case detail for 🔴 cases: "Dieser Vorgang erfordert dringende Bearbeitung."
- Filter in inbox: "Nur hohes Risiko"

---

## Screen: Entscheidungsunterstützung

The decision support panel is integrated into the right column of the case workspace. See 09_AI_ASSISTANT.md for the full component specification.

- Heading is "Entscheidungsunterstützung"
- The human is the decision-maker; the system supports
- Primary outputs: Zusammenfassung, Anwendbare Vorschriften, Fehlende Informationen, Checkliste, Nächste Aktion
- Technical details (confidence, execution trace) are in "▶ Erweitert"

---

## Screen: Entscheidungsentwurf (Draft Decision)

The employee drafts the decision based on the decision support output.

Additional elements:
- **Vorlage auswählen** dropdown at top: pre-select the template based on case type
- **Vorschau** button: preview the final document as citizen will see it
- **Rechtsgrundlagen prüfen** side panel: shows all cited regulations side-by-side with the draft

---

## Screen: Genehmigung (Approval)

The supervisor view. Enhanced with audit comparison:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Genehmigung > Vorgang #2026-0147                                             │
│                                                                              │
│  Sachbearbeiter: Sabine Müller  |  Eingereicht: 15.07.2026 15:30              │
│  Risiko: 🟢 Gering  |  Fällig: 22.07.2026                                    │
│                                                                              │
│  ┌────────────────────────────────┐  ┌────────────────────────────────────┐  │
│  │ ANTRAG (Original)             │  │ ENTWURF (zur Genehmigung)          │  │
│  └────────────────────────────────┘  └────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Änderungen zum Antrag                                         [ Details ]││
│  │ · Bescheidtyp:  Genehmigung → Verfahrensfreiheit                         ││
│  │ · Gebühren:     150 EUR → 75 EUR (Verfahrensfreiheit)                    ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  PRÜFPUNKTE (automatisch)                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ☑ Alle zitierten Vorschriften sind aktuell (3/3 geprüft)                 ││
│  │ ☑ Rechtsbehelfsbelehrung ist korrekt                                     ││
│  │ ☑ Gebührenberechnung entspricht Kostensatzung                            ││
│  │ ☑ Vier-Augen-Prinzip eingehalten                                         ││
│  │ ☑ Fristen eingehalten (22.07.2026)                                       ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Genehmigungskommentar                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Kurz geprüft — Verfahrensfreiheit nach §65 korrekt. Abstandsflächen      ││
│  │ eingehalten. Bitte beim nächsten Mal die Baubeschreibung vollständig     ││
│  │ einfordern (siehe fehlende Angaben zur Gründung). Ansonsten i.O.         ││
│  │ — Dr. Schmidt, 15.07.2026 16:45                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐   ││
│  │  Genehmigen       │  │  Zurück zur Überarb.  │  │  Ablehnen            │   ││
│  └──────────────────┘  └──────────────────────┘  └──────────────────────┘   ││
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Versand (Send)

Unchanged core. Added: tracking for "Antwort muss bis [Datum] beim Bürger sein."

---

## Screen: Archiv (Archive)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Meine Arbeit > Archiv                                                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Filter: [ Alle Fachbereiche ▾ ]  [ 2026 ▾ ]  🔍 Suche...                 ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────┬─────────────────────────┬────────────┬────────────┬──────────────┐ │
│  │  #   │ Betreff                 │ Abgeschl.   │ Ergebnis    │              │ │
│  ├──────┼─────────────────────────┼────────────┼────────────┼──────────────┤ │
│  │ 0138 │ Bauantrag Dachgaube      │ 14.07.2026 │ Genehmigt   │ [ Anzeigen ] │ │
│  │ 0137 │ Beschaffung Drucker      │ 13.07.2026 │ Direktauftr.│ [ Anzeigen ] │ │
│  │ 0136 │ Widerspruch Hundesteuer  │ 12.07.2026 │ Abgelehnt   │ [ Anzeigen ] │ │
│  └──────┴─────────────────────────┴────────────┴────────────┴──────────────┘ │
│                                                                              │
│  47 archivierte Vorgänge                                      [ CSV Export ] │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  WIEDERVORLAGE (3)                                                            │
│  ┌──────┬─────────────────────────┬────────────┬──────────────────────────┐  │
│  │  #   │ Betreff                 │ Wiedervorl.│ Grund                    │  │
│  ├──────┼─────────────────────────┼────────────┼──────────────────────────┤  │
│  │ 0101 │ Bauantrag Solaranlage    │ 01.08.2026 │ Frist für Nachbarklage   │  │
│  │ 0098 │ Lärmbeschwerde Gaststätte│ 15.09.2026 │ Kontrolle nach 6 Monaten │  │
│  └──────┴─────────────────────────┴────────────┴──────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Audit Timeline

Every action on a case is recorded in the audit timeline. This is visible to supervisors and administrators. The Sachbearbeiter sees a simplified activity log.

**Full audit entry:**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  AUDIT-ZEITSTRAHL (vollständig)                                               │
│                                                                              │
│  15.07.2026 16:45  Dr. Andreas Schmidt (Supervisor)                          │
│  → Genehmigt: Entscheidungsentwurf BAU-2026-0147                                     │
│  → Kommentar: "Verfahrensfreiheit nach §65 korrekt..."                       │
│                                                                              │
│  15.07.2026 15:30  Sabine Müller (Sachbearbeiterin)                          │
│  → Zur Genehmigung eingereicht: Entscheidungsentwurf BAU-2026-0147                   │
│                                                                              │
│  15.07.2026 10:30  Sabine Müller (Sachbearbeiterin)                          │
│  → Interne Notiz hinzugefügt: "Abstand 3m..."                                │
│                                                                              │
│  15.07.2026 10:23  Sabine Müller (Sachbearbeiterin)                          │
│  → Dokumente geprüft (4/4)                                                   │
│                                                                              │
│  15.07.2026 08:45  Sabine Müller (Sachbearbeiterin)                          │
│  → Interne Notiz hinzugefügt: "Carport 18 m²..."                             │
│                                                                              │
│  15.07.2026 08:30  System (automatisch)                                      │
│  → Zugewiesen an: Sabine Müller (von: Posteingang Bauamt)                    │
│                                                                              │
│  15.07.2026 08:15  System (automatisch)                                      │
│  → Eingegangen: Antrag #2026-0147 (Bürger: Thomas Becker)                    │
│                                                                              │
│  [ Exportieren als PDF ]  [ Exportieren als CSV ]                            │
└──────────────────────────────────────────────────────────────────────────────┘
```
