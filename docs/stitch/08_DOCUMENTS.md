# Dokumente (Documents)

## Design Principle

Document management is a separate workspace from case processing and knowledge browsing. Normal Sachbearbeiter see document metadata, versions, and content. Technical indexing details (chunks, embeddings, Qdrant vectors) are always behind the "Erweitert" (Advanced) toggle — never visible by default.

## Main Screen: Document List

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Dokumente > Alle Dokumente                                                    │
│                                                                              │
│  [ Alle Dokumente ]  Hochladen  Index-Status                                  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Filter:                                                                  ││
│  │ Status: [ Alle ▾ ]  Typ: [ Alle ▾ ]  Fachbereich: [ Alle ▾ ]             ││
│  │ Sprache: [ Alle ▾ ]  🔍 Titel, Tags, Referenz...                          ││
│  │                                                                          ││
│  │ 23 Dokumente gefunden                                        [ Filter... ]││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────┬──────────────────────────┬────────────┬──────────┬────────┬──────┐ │
│  │      │ Titel                    │ Fachbereich│ Status   │ Datum   │      │ │
│  ├──────┼──────────────────────────┼────────────┼──────────┼────────┼──────┤ │
│  │ 📄   │ BauO NRW 2024            │ Bauamt     │ ✓ Aktiv  │01.01.24│ ...  │ │
│  │ 📄   │ AV zu §55 LHO            │ Vergabe    │ ✓ Aktiv  │15.03.24│ ...  │ │
│  │ 📄   │ TVöD Entgelttabelle 2025 │ Personal   │ ✓ Aktiv  │01.01.25│ ...  │ │
│  │ 📄   │ VOB/A 2024               │ Vergabe    │ ✓ Aktiv  │01.02.24│ ...  │ │
│  │ 📄   │ GemHVO 2024              │ Allgemein  │ ⚠ Index  │10.06.24│ ...  │ │
│  │ 📄   │ BauGB 2024               │ Bauamt     │ ✓ Aktiv  │01.01.24│ ...  │ │
│  └──────┴──────────────────────────┴────────────┴──────────┴────────┴──────┘ │
│                                                                              │
│  Seite 1 von 4              [ ←  Zurück ]  [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ Weiter → ]│
│  Zeilen pro Seite: [ 50 ▾ ]                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Row Actions (right-click or "..." menu)

```
┌──────────────────────────────┐
│  Anzeigen                    │
│  Metadaten bearbeiten        │
│  Neue Version hochladen      │
│  ─────────────────────────  │
│  Versionen vergleichen       │
│  Verwandte Dokumente         │
│  Referenzierte Vorschriften  │
│  ─────────────────────────  │
│  Neu indizieren              │
│  ─────────────────────────  │
│  Archivieren                 │
│  Löschen                     │
└──────────────────────────────┘
```

---

## Screen: Document Detail

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Zurück zur Liste            BauO NRW 2024                                  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Metadaten                                          [ Bearbeiten ]         ││
│  │ ─────────────────────────────────────────────────────────────────────────││
│  │ Titel:        BauO NRW 2024                                              ││
│  │ Vollständig:  Landesbauordnung Nordrhein-Westfalen 2024                   ││
│  │ Typ:          Gesetz                                                     ││
│  │ Fachbereich:  Bauamt                                                     ││
│  │ Herausgeber:  Land Nordrhein-Westfalen                                    ││
│  │ Datum:        01.01.2024                                                 ││
│  │ Sprache:      Deutsch                                                    ││
│  │ Seiten:       84                                                         ││
│  │ Tags:         bauordnung, brandschutz, abstandsflächen                    ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Verwandte Dokumente                                                       ││
│  │ ┌──────────────────────────────────────────────────────────────────────┐ ││
│  │ · BauO NRW 2018 (Vorgänger) — archiviert                                │ ││
│  │ · BauGB 2024 — wird referenziert in §34, §35                            │ ││
│  │ · BauVorlVO NRW 2024 — ergänzende Verordnung                             │ ││
│  │ · BauPrüfVO NRW 2024 — technische Prüfverordnung                         │ ││
│  └──────────────────────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Versionen                                                                 ││
│  │ ┌──────┬──────────────┬──────────┬────────┬────────────────────────────┐ ││
│  │ │ v2   │ 01.01.2024   │ 2,1 MB   │ Aktiv  │ Anzeigen | Herunterladen   │ ││
│  │ │ v1   │ 15.06.2023   │ 1,8 MB   │ Archiv │ Anzeigen | Herunterladen   │ ││
│  │ └──────┴──────────────┴──────────┴────────┴────────────────────────────┘ ││
│  │                                                                          ││
│  │ [ Neue Version hochladen ]  [ v1 ↔ v2 vergleichen ]                      ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Referenzierte Vorschriften                                                ││
│  │ ┌──────────────────────────────────────────────────────────────────────┐ ││
│  │ Dieses Dokument wird in folgenden Vorschriften zitiert:                 │ ││
│  │ · VOB/A 2024 — §3a Verweis auf BauO NRW                                 │ ││
│  │ · GemHVO 2024 — §45 Bezug auf baurechtliche Vorschriften                │ ││
│  │                                                                         │ ││
│  │ Dieses Dokument zitiert:                                                │ ││
│  │ · BauGB 2024 — §34, §35 (Zulässigkeit von Vorhaben)                     │ ││
│  │ · BImSchG 2024 — §22 (Emissionen bei Bauvorhaben)                       │ ││
│  └──────────────────────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Volltext (erste 200 Zeilen)                                               ││
│  │ ─────────────────────────────────────────────────────────────────────────││
│  │ §1 Allgemeines                                                            ││
│  │ (1) Dieses Gesetz gilt für alle baulichen Anlagen und Bauprodukte...      ││
│  │                                                                          ││
│  │ [ Gesamten Volltext anzeigen (84 Seiten) ]                                ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ▶ Erweitert: Index-Details                                                ││
│  │ ┌──────────────────────────────────────────────────────────────────────┐ ││
│  │ │ Chunks:           127                                                 │ ││
│  │ │ Mit Embeddings:   127 (100%)                                          │ ││
│  │ │ Qdrant Vektoren:  127                                                 │ ││
│  │ │ Vektor-Dimension: 768                                                 │ ││
│  │ │ Letzte Indizierung: 15.07.2026 09:15                                  │ ││
│  │ │ Durchschn. Score: 0.82                                                │ ││
│  │ │                                                                       │ ││
│  │ │ [ Chunks anzeigen ]  [ Neu indizieren ]  [ Aus Qdrant löschen ]      │ ││
│  │ └──────────────────────────────────────────────────────────────────────┘ ││
│  │ ⚠️ Diese Informationen sind nur für Administratoren sichtbar.             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Version Comparison

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BauO NRW 2024 — Versionen vergleichen                                        │
│                                                                              │
│  Vergleich:  [ v1 (15.06.2023) ▾ ]  ↔  [ v2 (01.01.2024) ▾ ]                │
│                                                                              │
│  ┌────────────────────────────────┐  ┌────────────────────────────────────┐  │
│  │ v1 — BauO NRW 2018            │  │ v2 — BauO NRW 2024                 │  │
│  │ ────────────────────────────── │  │ ──────────────────────────────────  │  │
│  │                                │  │                                    │  │
│  │ §6 Abstandsflächen             │  │ §6 Abstandsflächen                 │  │
│  │ (1) Vor den Außenwänden...     │  │ (1) Vor den Außenwänden...         │  │
│  │ (2) Die Abstandsfläche muss... │  │ (2) Die Abstandsfläche muss...     │  │
│  │ (3) Die Tiefe beträgt 0,5 H...│  │ (3) Die Tiefe beträgt 0,4 H...  ← │  │
│  │                                │  │                                    │  │
│  │ §65 Verfahrensfreie Vorhaben   │  │ §65 Verfahrensfreie Vorhaben       │  │
│  │ 1. Gebäude bis 30 m²...        │  │ 1. Gebäude bis 30 m²...            │  │
│  │ 2. Garagen bis 50 m²...        │  │ 2. Garagen bis 50 m²...            │  │
│  │                                │  │ 3. Carports bis 30 m²...        ← │  │
│  │                                │  │    (NEU in v2)                     │  │
│  └────────────────────────────────┘  └────────────────────────────────────┘  │
│                                                                              │
│  Zusammenfassung der Änderungen (automatisch erkannt):                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ · §6(3): Abstandsfläche von 0,5 H auf 0,4 H reduziert                    ││
│  │ · §65: Carports explizit als verfahrensfrei aufgenommen (neu)             ││
│  │ · §7: Neue Regelung zu überbaubaren Grundstücksflächen                    ││
│  │ · 3 weitere Änderungen — [ Alle anzeigen ]                                ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  [ Änderungen als PDF exportieren ]                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Document Upload

Unchanged from the original specification. Drag-and-drop zone, metadata form, progress indication.

---

## Screen: Index Status

Unchanged from the original specification. Summary cards + warnings table for department administrators.
