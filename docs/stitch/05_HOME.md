# Startseite (Home)

## Design Principle

The home screen is an **operational command center**, not an AI prompt. The user sees their caseload immediately — what needs attention, what is overdue, what is waiting on someone else, what was completed. The AI is a quiet assistant in the sidebar, not the centerpiece.

This is Microsoft Outlook meets Jira. The Sachbearbeiter opens the platform and immediately knows what to do next.

## Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Startseite  Meine Arbeit  Wissen  Dokumente  Verwaltung  [🔔3] [👤] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Startseite                                                                  │
│                                                                              │
│  Guten Morgen, Frau Müller.                           Dienstag, 15. Juli 2026 │
│                                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐        │
│  │ Meine    │ Heute    │ Überfällig│ Wartet   │ Wartet   │ Heute    │        │
│  │ Vorgänge │ fällig   │          │ Bürger   │ Behörde  │ erledigt │        │
│  │          │          │          │          │          │          │        │
│  │   12     │    3     │    2     │    4     │    1     │    5     │        │
│  │  Offen   │  Fällig  │  ⚠️      │  ⏳      │  ⏳      │  ✓       │        │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘        │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ┌──────────────────────────────────────┬───────────────────────────────────┐│
│  │                                      │                                   ││
│  │  MEINE VORGÄNGE                      │  ENTSCHEIDUNGSUNTERSTÜTZUNG       ││
│  │                                      │                                   ││
│  │  [ Alle (12) ] Überfällig (2)       │  Frage zu Vorschriften oder       ││
│  │  [ Warten (5) ] Heute (3)           │  Verfahren?                       ││
│  │                                      │                                   ││
│  │  Überfällig                          │  ┌───────────────────────────┐    ││
│  │  ┌──────┬──────────────────┬───────┐ │  │ Abstandsflächen Carport.. │    ││
│  │  │ #    │ Betreff          │ Seit  │ │  └───────────────────────────┘    ││
│  │  ├──────┼──────────────────┼───────┤ │                              [ → ] ││
│  │  │ 0142 │ Bauantrag Garage │ 2 Tg. │ │                                   ││
│  │  │ 0139 │ Beschaffung IT   │ 5 Tg. │ │  ─────────────────────────────    ││
│  │  └──────┴──────────────────┴───────┘ │                                   ││
│  │                                      │  Vorschläge für Ihre Vorgänge     ││
│  │  Heute fällig                        │                                   ││
│  │  ┌──────┬──────────────────┬───────┐ │  💡 BAU-2026-0147 Bauantrag Carport       ││
│  │  │ #    │ Betreff          │ Zeit  │ │  → §65 BauO NRW prüfen            ││
│  │  ├──────┼──────────────────┼───────┤ │                                   ││
│  │  │ BAU-2026-0147 │ Carport Becker   │ 12:00 │ │  💡 VERG-2026-0152 IT-Beschaffung          ││
│  │  │ 0152 │ IT-Hardware      │ 16:00 │ │  → AV §55 LHO Direktauftrag      ││
│  │  │ 0119 │ Widerspruch Abg. │ 23:59 │ │                                   ││
│  │  └──────┴──────────────────┴───────┘ │                                   ││
│  │                                      │                                   ││
│  │  Wartet auf Bürger                   │                                   ││
│  │  ┌──────┬──────────────────┬───────┐ │                                   ││
│  │  │ #    │ Betreff          │ Seit  │ │                                   ││
│  │  ├──────┼──────────────────┼───────┤ │                                   ││
│  │  │ 0143 │ Bauantrag Müller │ 7 Tg. │ │                                   ││
│  │  │ 0145 │ Gewerbeanmeldung │ 3 Tg. │ │                                   ││
│  │  │ 0146 │ Wohngeldantrag   │ 1 Tg. │ │                                   ││
│  │  │ 0150 │ Hundesteuer      │12 Tg. │ │                                   ││
│  │  └──────┴──────────────────┴───────┘ │                                   ││
│  │                                      │                                   ││
│  │  Wartet auf andere Behörde           │                                   ││
│  │  ┌──────┬──────────────────┬───────┐ │                                   ││
│  │  │ #    │ Betreff          │ Seit  │ │                                   ││
│  │  ├──────┼──────────────────┼───────┤ │                                   ││
│  │  │ 0141 │ Bauvorbescheid   │14 Tg. │ │                                   ││
│  │  └──────┴──────────────────┴───────┘ │                                   ││
│  │                                      │                                   ││
│  └──────────────────────────────────────┴───────────────────────────────────┘│
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Heute erledigt (5)                                               [ Alle anzeigen ]│
│                                                                              │
│  ┌──────┬─────────────────────────┬──────────────┬──────────────────────────┐│
│  │  #   │ Betreff                 │ Ergebnis     │ Abgeschlossen             ││
│  ├──────┼─────────────────────────┼──────────────┼──────────────────────────┤│
│  │ 0138 │ Bauantrag Dachgaube      │ Genehmigt    │ Heute, 09:45 (Müller)    ││
│  │ 0137 │ Beschaffung Drucker      │ Direktauftr. │ Heute, 08:30 (Schmidt)   ││
│  │ 0135 │ Reisekosten Schmidt      │ Ausgezahlt   │ Heute, 08:00 (System)    ││
│  │ 0134 │ Anfrage Bürgerbüro       │ Beantwortet  │ Heute, 07:45 (Wagner)    ││
│  │ 0133 │ Aktenvermerk Bespr.      │ Abgelegt     │ Heute, 07:30 (Müller)    ││
│  └──────┴─────────────────────────┴──────────────┴──────────────────────────┘│
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Von mir beobachtet                                                [ Alle (3) ]│
│                                                                              │
│  ┌──────┬─────────────────────────┬──────────────────┬──────────────────────┐│
│  │  #   │ Betreff                 │ Status           │ Letzte Änderung       ││
│  ├──────┼─────────────────────────┼──────────────────┼──────────────────────┤│
│  │ 0127 │ Bauantrag Mehrfamilienh.│ In Genehmigung   │ Gestern, 16:30        ││
│  │ 0156 │ Vergabe Reinigung       │ Angebotsprüfung  │ Gestern, 14:00        ││
│  │ 0160 │ B-Plan Änderung         │ Anhörung         │ Vorgestern, 11:00     ││
│  └──────┴─────────────────────────┴──────────────────┴──────────────────────┘│
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Vorgeschlagene nächste Aufgabe                                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │  Bauantrag #2026-0147                            Fällig: heute, 12:00    ││
│  │  ──────────────────────────────────────────────────────────────────────  ││
│  │  Antragsteller:  Thomas Becker, Musterstraße 12, 45127 Essen             ││
│  │  Vorhaben:        Carport (2 Stellplätze), 6m × 3m, Flachdach           ││
│  │  Status:          Dokumente geprüft, wartet auf Entscheidungsentwurf     ││
│  │  Risiko:          🟢 Gering — verfahrensfreies Vorhaben                   ││
│  │  Verbleibend:     3 Stunden 45 Minuten                                   ││
│  │                                                                          ││
│  │  ┌──────────────────────────────┐                                       ││
│  │  │       Vorgang öffnen         │                                       ││
│  │  └──────────────────────────────┘                                       ││
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

**Six stat cards, not four.** The operational categories match how Sachbearbeiter think about their workload: my cases (total open), due today, overdue, waiting for citizen, waiting for other authority, completed today. This segmentation lets the user triage their day.

**Two-column layout with sidebar decision support.** The left (70%) is the case list — the primary workspace. The right (30%) is a compact decision support panel with a question input and context-aware suggestions. The AI does not dominate. It is a reference tool, like a pinned colleague.

**Overdue items first.** Overdue cases appear at the top of the case list with a red highlight and days-overdue counter. This is the most important signal on the screen.

**Waiting states tracked explicitly.** "Wartet auf Bürger" and "Wartet auf andere Behörde" are first-class categories. They prevent cases from being forgotten when the ball is in someone else's court. Each shows how long the case has been waiting.

**Completed today.** Shows what got done. Builds momentum and team awareness. Each entry shows who completed it.

**Suggested next task.** A single, prominent recommendation at the bottom. Includes risk indicator (green/yellow/red) so the user can quickly assess whether to dive in or skip to something simpler.

**Watched cases.** Cases the user has bookmarked but isn't directly responsible for — perhaps awaiting a supervisor decision or a colleague's action. Keeps them informed without cluttering their active list.

## State Variations

**First login (no cases yet):**
- Stat cards show zero
- Case lists replaced by: "Willkommen auf der Kommunalen Entscheidungsplattform. Ihre Vorgänge erscheinen hier, sobald sie Ihnen zugewiesen werden."
- Decision support panel still active (research is always available)
- Watched cases hidden

**All cases completed:**
- Stat cards show zero for active categories
- "Heute erledigt" shows the day's completions
- Suggested next task section: "Alle Vorgänge bearbeitet. Keine fälligen Aufgaben." with checkmark
- Decision support panel suggests: "Möchten Sie ein Dokument durchsuchen oder eine neue Frage stellen?"

**Heavy workload (10+ due today):**
- "Überfällig" and "Heute fällig" cards shown in red/amber
- Banner above case list: "Sie haben 10 heute fällige Vorgänge. Priorisieren Sie nach Dringlichkeit."
- Suggested next task selects the most overdue + highest priority combination

**Multiple overdue cases (>3):**
- Overdue section shows all items with red left-border
- Summary line: "3 Vorgänge überfällig — der älteste seit 5 Tagen."
- Risk indicator in suggested task automatically elevated

## Supervisor View

When the user has the supervisor role, the Startseite adapts — same layout, different widgets. The decision support sidebar remains unchanged.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Startseite (Supervisor: Dr. Schmidt)                                         │
│                                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐        │
│  │Zur       │Heute     │Überfällig│Wartet    │Wartet    │Abteilung │        │
│  │Genehmigung│fällig   │(Abteilung│Bürger    │Behörde   │Heute     │        │
│  │   4      │   3     │   2      │   3      │   1      │erledigt 8│        │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘        │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ┌──────────────────────────────────────┬───────────────────────────────────┐│
│  │                                      │                                   ││
│  │  ZUR GENEHMIGUNG (4)                │  TEAM-ARBEITSBELASTUNG             ││
│  │                                      │                                   ││
│  │  ┌──────┬──────────────────┬───────┐ │  ┌────────────┬──────┬──────────┐ ││
│  │  │ Vorg.│ Betreff          │ Von   │ │  │ Mitarbeiter│Offen │Überfällig│ ││
│  │  ├──────┼──────────────────┼───────┤ │  ├────────────┼──────┼──────────┤ ││
│  │  │ BAU-2026-0147 │ Carport Becker   │Müller │ │  │ S. Müller  │  4   │    1     │ ││
│  │  │ 0156 │ Reinigung        │Wagner │ │  │ C. Bergmann│  2   │    0     │ ││
│  │  │ 0139 │ IT-Beschaffung   │Wagner │ │  │ P. Wagner  │  3   │    1     │ ││
│  │  │ 0119 │ Widerspruch Abg. │Krüger │ │  └────────────┴──────┴──────────┘ ││
│  │  └──────┴──────────────────┴───────┘ │                                   ││
│  │                                      │                                   ││
│  │  ABTEILUNG – ÜBERFÄLLIG (2)         │  ABTEILUNG – HEUTE (3)            ││
│  │  · BÜRG-2026-0150 (12 Tage)         │  · BAU-2026-0147 (12:00)          ││
│  │  · VERG-2026-0139 (5 Tage)          │  · VERG-2026-0152 (16:00)         ││
│  │                                      │  · BÜRG-2026-0119 (23:59)         ││
│  └──────────────────────────────────────┴───────────────────────────────────┘│
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│  Abteilungs-KPIs (diese Woche)                                               │
│  ┌──────────┬──────────┬──────────┬──────────────────┬──────────────────┐   │
│  │Eingegangen│Erledigt  │Ø Laufzeit│Genehmigungsquote │Rückläufer (Überarb)│  │
│  │   14      │   11     │ 4,2 Tage │      94%         │       6%          │   │
│  └──────────┴──────────┴──────────┴──────────────────┴──────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Supervisor stat cards:**
- "Zur Genehmigung" replaces "Meine Vorgänge" — shows cases waiting for approval
- "Abteilung Heute erledigt" replaces "Heute erledigt" — shows team completions
- Other cards (Heute fällig, Überfällig, Warten) show department-wide data, not just assigned to the supervisor

**Team workload table:** Each team member with open cases and overdue count. Colored: red if >2 overdue, amber if >5 open.

**Department KPIs:** Computed from workspace/case API + audit events. Client-side composition. No new endpoints needed.

## Data Sources

| Element | Data Source |
|---|---|
| Stat cards | Aggregated from workspace/case API filtered by status + deadline (scoped to user or department based on role) |
| Overdue / Due today / Waiting | Cases filtered by status + deadline + waiting state |
| Completed today | Cases with status=ARCHIVED and completionDate=today |
| Watched cases | Cases with user-specific watch flag |
| Suggested next task | Sorted by (overdue days × 2) + priority weight + deadline proximity |
| Decision support suggestions | POST /api/decision with active case contexts |
| Risk indicator | Derived from case type, deadline pressure, missing documents |
| Approval queue (supervisor) | Cases with status=PENDING_APPROVAL in user's department |
| Team workload (supervisor) | Aggregated from workspace API grouped by assignee |
| Department KPIs (supervisor) | Computed from audit events + case statuses within date range |
