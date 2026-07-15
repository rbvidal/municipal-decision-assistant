# Decision Support (Entscheidungsunterstützung)

## Design Principle

Decision support is a quiet tool embedded in the case workspace. It is never called "AI" in user-facing labels. It is called **Entscheidungsunterstützung** (Decision Support). The system suggests; the human decides.

The panel appears in the right column of the case workspace. It is collapsible. It provides: summary, applicable regulations, missing information, suggested checklist, suggested next action, and supporting documents. Technical details — confidence scores, execution traces, model names — are hidden behind "▶ Erweitert" (Advanced).

## Embedded Decision Support: Case Workspace (Primary Use)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ENTSCHEIDUNGSUNTERSTÜTZUNG                                          [ − ]   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Ist der Carport nach BauO NRW §65 genehmigungsfrei?                      ││
│  │ Sind die Abstandsflächen nach §6 eingehalten?                            ││
│  └──────────────────────────────────────────────────────────────────────────┘││
│                                                                              ││
│  [ Analyse starten ]                                                          ││
│                                                                              ││
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Zusammenfassung                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Der Carport (18 m², 2,5m Wandhöhe) ist nach §65 BauO NRW 2024           ││
│  │ verfahrensfrei (Gebäude ohne Aufenthaltsräume bis 30 m²). Die            ││
│  │ Abstandsfläche beträgt 0,4 × 2,5m = 1,0m. Der tatsächliche Abstand      ││
│  │ von 3m genügt dieser Anforderung.                                         ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Anwendbare Vorschriften (3)                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ┌────────────────────────────────────────────────────────────────────┐   ││
│  │ │ 📄 BauO NRW 2024 §65 — Verfahrensfreie Vorhaben           ☆       │   ││
│  │ │ "Verfahrensfrei sind: 1. Gebäude ohne Aufenthaltsräume             │   ││
│  │ │  bis 30 m² Grundfläche..."                                          │   ││
│  │ │ [ Im Dokument öffnen ]                                              │   ││
│  │ └────────────────────────────────────────────────────────────────────┘   ││
│  │ ┌────────────────────────────────────────────────────────────────────┐   ││
│  │ │ 📄 BauO NRW 2024 §6 — Abstandsflächen                      ☆       │   ││
│  │ │ "Die Tiefe der Abstandsfläche beträgt 0,4 der Wandhöhe..."         │   ││
│  │ │ [ Im Dokument öffnen ]                                              │   ││
│  │ └────────────────────────────────────────────────────────────────────┘   ││
│  │ ┌────────────────────────────────────────────────────────────────────┐   ││
│  │ │ 📄 BauGB §34 — Zulässigkeit im unbeplanten Innenbereich    ☆       │   ││
│  │ │ [ Im Dokument öffnen ]                                              │   ││
│  │ └────────────────────────────────────────────────────────────────────┘   ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Fehlende Informationen                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Keine fehlenden Informationen erkannt. Alle erforderlichen Angaben        ││
│  │ liegen vor.                                                              ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Vorgeschlagene Checkliste                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ☐ Abstandsfläche rechnerisch dokumentieren (0,4 × 2,5m = 1,0m)          ││
│  │ ☐ Schriftliche Bestätigung der Verfahrensfreiheit an Bürger              ││
│  │ ☐ Aktenvermerk mit Prüfergebnis anlegen                                  ││
│  │ ☐ Ggf. Nachbar informieren (freiwillig, empfehlenswert)                  ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Vorgeschlagene nächste Aktion                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Entscheidungsentwurf erstellen: Informationsschreiben an Herrn Becker     ││
│  │ über die Verfahrensfreiheit des Carports. Dokumentation der Prüfung       ││
│  │ der Abstandsflächen in den Aktenvermerk aufnehmen.                       ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Unterstützende Dokumente (2)                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ 📄 Merkblatt Abstandsflächen NRW (4 Seiten, Informationsblatt)           ││
│  │ 📄 §2025-0892 Bauantrag Carport Wagner (archiviert, ähnlicher Fall)      ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ▶ Erweitert                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Verlässlichkeit:  ████████████░░░░  82%  Hoch                            ││
│  │ Strategie:        RULE_ENGINE → HYBRID_RETRIEVAL (Fallback)              ││
│  │ Retrieval:        3 Dokumente, 7 Chunks                                   ││
│  │ Reranking:        Ollama Reranker                                         ││
│  │ Modell:           qwen2.5:14b (explain-only)                              ││
│  │ Latenz:           4,2 s                                                    ││
│  │ Token:            1.247 Eingabe / 312 Ausgabe                              ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────┐  ┌──────────────────────────┐                 ││
│  │ Analyse übernehmen        │  │ Erneut analysieren        │                 ││
│  └──────────────────────────┘  └──────────────────────────┘                 ││
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Support: Quick Question (Home Sidebar)

The compact panel on the Startseite. See 05_HOME.md for placement in the home layout.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ENTSCHEIDUNGSUNTERSTÜTZUNG                                          [ − ]     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Frage zu Vorschriften oder Verfahren...                           [ → ]  ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Vorschläge für Ihre Vorgänge:                                               │
│                                                                              │
│  💡 BAU-2026-0147 Bauantrag Carport                                                  │
│     §65 BauO NRW — Verfahrensfreiheit prüfen                                 │
│                                                                              │
│  💡 VERG-2026-0152 IT-Beschaffung 4.200 EUR                                           │
│     AV §55 LHO — Direktauftrag unter 5.000 EUR                               │
│                                                                              │
│  💡 BÜRG-2026-0119 Widerspruch Abgabenbescheid                                        │
│     §70 VwGO — Widerspruchsfrist 1 Monat                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Support: Loading State

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ENTSCHEIDUNGSUNTERSTÜTZUNG                                                  │
│                                                                              │
│  Analysiere...                                                    [ Abbrechen ]│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ││
│  │                                                                          ││
│  │ Relevante Vorschriften werden durchsucht...                              ││
│  │ · 3 Dokumente gefunden                                                    ││
│  │ · 7 Abschnitte extrahiert                                                 ││
│  │ · Ergebnis wird formuliert...                                             ││
│  │                                                                          ││
│  │ Dauer: 0:04                                                              ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Support: Low Confidence

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ENTSCHEIDUNGSUNTERSTÜTZUNG                                                  │
│                                                                              │
│  ⚠️  Eingeschränkte Aussagekraft                                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Die Suche konnte keine ausreichend relevanten Vorschriften finden.        ││
│  │ Die folgenden Informationen basieren auf unvollständiger Grundlage.       ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Empfehlungen:                                                                │
│  · Formulieren Sie die Frage präziser                                        │
│  · Geben Sie den genauen Paragrafen an, falls bekannt                        │
│  · Wählen Sie einen spezifischen Fachbereich aus                              │
│  · Konsultieren Sie die Originaldokumente manuell                             │
│                                                                              │
│  [ Frage umformulieren ]  [ Fachbereich wechseln ]                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Support: No Results

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Keine relevanten Vorschriften gefunden                                       │
│  ───────────────────────────────────────────────────────────────────────────  │
│  Für Ihre Anfrage konnten keine passenden Vorschriften im Dokumentenbestand   │
│  gefunden werden.                                                              │
│                                                                              │
│  Mögliche Gründe:                                                             │
│  · Das Thema ist nicht im aktuellen Bestand abgedeckt                         │
│  · Die Suchbegriffe weichen von der Rechtssprache ab                          │
│  · Das entsprechende Dokument wurde noch nicht hochgeladen                    │
│                                                                              │
│  [ Frage umformulieren ]  [ Fachbereich wechseln ]  [ Dokument vorschlagen ]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Support: Service Unavailable

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Entscheidungsunterstützung nicht verfügbar                                    │
│  ───────────────────────────────────────────────────────────────────────────  │
│  Der Dienst ist derzeit nicht erreichbar.                                      │
│                                                                              │
│  Sie können weiterhin:                                                        │
│  · Dokumente über die Stichwortsuche durchsuchen                             │
│  · Vorschriften manuell konsultieren                                          │
│  · Vorgänge ohne automatisierte Unterstützung bearbeiten                      │
│                                                                              │
│  [ Erneut versuchen ]                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Naming Convention

| Never Use | Always Use | Reason |
|---|---|---|
| KI-Assistent | Entscheidungsunterstützung | The system supports decisions; it does not make them |
| KI-Analyse | (integrated into case workspace) | Analysis is part of the workflow, not a standalone page |
| KI-Zusammenfassung | Zusammenfassung | The source of the summary is irrelevant to the user |
| KI-Vorschläge | Vorschläge | Suggestions come from the system, not "the AI" |
| Verlässlichkeit (visible) | (only in ▶ Erweitert) | Normal users don't need confidence scores |
| Ausführungsprotokoll (visible) | (only in ▶ Erweitert) | Technical trace is for debugging, not daily work |

**Rules for all decision support text:**
- Never use the words "KI", "AI", "künstliche Intelligenz" in user-facing labels
- Never say "die KI schlägt vor" — say "das System schlägt vor" or use passive voice
- Never use "magic", "intelligent", "smart" as descriptors
- The system "analysiert", "findet", "schlägt vor" — it does not "versteht", "weiß", or "entscheidet"
- Every output that references a regulation must include a link to the source document
