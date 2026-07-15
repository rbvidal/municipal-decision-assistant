# Stitch Design Pack — Final Review

**Reviewer:** UX Quality Audit  
**Date:** 15 July 2026  
**Scope:** 18 Markdown files, 4,579 lines  
**Methodology:** 12-dimension systematic audit against production-readiness criteria

---

## Executive Summary

The Stitch Design Pack is **strong and substantially complete.** The navigation structure, case workflow, and visual design system are well-conceived. The sample data is excellent. The core design philosophy — work-first, AI-as-sidebar, German professional tone — is correctly articulated across most files.

However, the pack has **terminology drift** from earlier iterations that was never cleaned up. The `00_USER_JOURNEY.md` file in particular retains outdated "KI-Assistent" / "AI Analysis" language that directly contradicts the terminology decisions made in `09_AI_ASSISTANT.md`. There are also meaningful gaps: no notification center design, no batch operations, no supervisor-specific dashboard, and inconsistent case numbering.

The fixes are surgical, not architectural. Estimated effort: **4-6 hours** to reach production-ready.

---

## Overall Score: 78 / 100

**Category scores:**

| Dimension | Score | Status |
|---|---|---|
| Terminology Consistency | 62/100 | Needs cleanup |
| Navigation | 82/100 | Minor gaps |
| Audit Timeline | 78/100 | Good structure, missing actor categorization |
| Notifications | 55/100 | Toast-only; no notification center |
| Batch Operations | 20/100 | Completely absent |
| Supervisor Dashboard | 60/100 | Implicit, not explicit |
| Case Numbering | 50/100 | Inconsistent formats across files |
| Responsive Strategy | 70/100 | Mentioned, not detailed |
| Accessibility | 80/100 | Solid spec, minor gaps |
| Design Consistency | 72/100 | Several cross-file conflicts |
| Realism | 85/100 | Strong; minor issues only |
| Stitch Readiness | 82/100 | Good prompt; missing notification + batch designs |

---

## Strengths

1. **Case workflow (06_CASE_WORKFLOW.md) is excellent.** Checklists, internal notes, waiting states, risk indicators, and audit timeline are all well-specified with realistic wireframes.

2. **Sample data (16_SAMPLE_DATA.md) is outstanding.** 9 employees with emails/roles, 8 citizens with addresses, 12 active cases with full context, realistic approval comments and internal notes. This is exactly what Stitch needs.

3. **Design system (14_DESIGN_SYSTEM.md) is production-ready.** Complete CSS custom properties, spacing scale, component CSS, animation tokens. Stitch can generate directly from this.

4. **Decision support renaming (09_AI_ASSISTANT.md) is correct.** The naming convention table (old → new) is clear and justified. The "KI" ban from user-facing labels is the right decision.

5. **Navigation structure (04_NAVIGATION.md) is well-reasoned.** The "why this structure" section justifies every choice. The "what changed from old" table provides migration context.

6. **Branding (12_BRANDING.md) is specific and actionable.** Color hex codes, typography imports, language tone examples (with do/don't table), information density rules. Stitch can execute this directly.

---

## Remaining Issues

### Issue 1 — Terminology Drift in 00_USER_JOURNEY.md (HIGH)

`00_USER_JOURNEY.md` was written before the "KI → Entscheidungsunterstützung" rename and was never updated. It still contains:

| Line | Current Text | Problem |
|---|---|---|
| 101 | `KI-Assistent [−]` | Should be `Entscheidungsunterstützung` |
| 118 | `Inbox → Review → AI Analysis → Draft → Approve` | Should be `Posteingang → Prüfung → Entscheidungsunterstützung → Entwurf → Genehmigung` |
| 266 | `🤖 KI-Dienst nicht verfügbar` | Should be `Entscheidungsunterstützung nicht verfügbar` |
| 268 | `Die KI-Funktion ist derzeit nicht verfügbar` | Should be `Die Entscheidungsunterstützung ist derzeit nicht verfügbar` |
| 331 | `NO AI ANSWER` heading | Should be `KEINE ENTSCHEIDUNGSUNTERSTÜTZUNG` |
| 336 | `Keine ausreichenden Informationen` (mentions KI nowhere but context is "AI Answer") | Heading mismatch |

Additionally, the home dashboard wireframe in `00_USER_JOURNEY.md` (lines 77-111) still shows the old 4-stat-card layout ("12 offene Vorgänge | 3 heute fällig | 2 dringend | 5 E-Mails") rather than the updated 6-stat-card operational layout from `05_HOME.md`. These two files describe different home screens.

**Fix:** Rewrite sections 4 and 5 of `00_USER_JOURNEY.md` to match the current `05_HOME.md` and `06_CASE_WORKFLOW.md`. Update all "KI-*" references to "Entscheidungsunterstützung" or remove them. Remove the obsolete "NO AI ANSWER" empty state (superseded by Decision Support states in `09_AI_ASSISTANT.md`).

**Effort:** 1 hour

---

### Issue 2 — Missing Notification Center Design (HIGH)

The navigation bar shows a bell icon `[🔔3]` in every wireframe. But nowhere in the Design Pack is there a specification for what happens when the user clicks it.

The only notification mechanism documented is toast notifications (bottom-right, auto-dismiss). A notification center needs:

- **Bell dropdown panel** (click opens, shows list, click again closes)
- **Notification types**: Genehmigung erforderlich, Neu zugewiesen, Bürger hat Dokument hochgeladen, Frist nähert sich, Vorgang überfällig, Neue Vorschrift verfügbar, Indizierung abgeschlossen
- **Unread/read state**: Bold for unread, normal for read
- **Actions per notification**: "Vorgang öffnen", "Dokument anzeigen", "Ausblenden"
- **"Alle als gelesen markieren"** button
- **Persistence**: Notifications survive page refresh (client-side store)

**Fix:** Add a "Notification Center" section to `11_COMPONENTS.md` with wireframe and behavior spec. Add cross-reference in `04_NAVIGATION.md` top bar section. Add notification examples to `16_SAMPLE_DATA.md`.

**Effort:** 1.5 hours

---

### Issue 3 — Batch Operations Completely Absent (HIGH)

No file in the Design Pack documents batch operations. A Sachbearbeiter with 12 open cases needs to be able to:

| Operation | Screen | Backend Support | Priority |
|---|---|---|---|
| Mehrere zuweisen (bulk assign) | Meine Arbeit list | Unknown — mark as future | P2 |
| Mehrere archivieren | Meine Arbeit list | Unknown — mark as future | P2 |
| Als CSV exportieren | Meine Arbeit, Dokumente | Already shown in wireframes but not spec'd | P1 |
| Serienbrief generieren | Meine Arbeit list | No backend endpoint — mark as future | P3 |
| Dokumente anfordern (batch) | Meine Arbeit, Warten tab | No backend — mark as future | P3 |
| Mehrere als erledigt markieren | Meine Arbeit | Unknown — mark as future | P2 |

At minimum, the Design Pack should document which batch operations are supported today vs. planned. Currently none are documented at all.

**Fix:** Add a "Batch Operations" subsection to `06_CASE_WORKFLOW.md` and `08_DOCUMENTS.md`. Use a simple table with Status column (Verfügbar / Geplant / Nicht unterstützt). Add batch action checkboxes to list wireframes.

**Effort:** 1 hour

---

### Issue 4 — Supervisor Dashboard Not Explicit (MEDIUM)

The supervisor persona (`02_PERSONAS.md`) is well-defined. The approval screen in `06_CASE_WORKFLOW.md` is good. But there is no supervisor-specific dashboard.

A supervisor logging in sees the same Startseite as a Sachbearbeiter. They need:

- **Genehmigungsqueue** (approval queue) — prominent, not buried in sub-nav
- **Team-Arbeitsbelastung** (team workload) — cases per employee, overdue per employee
- **Abteilungsstatistik** — cases opened/closed this week, avg processing time
- **Eskalationen** — cases flagged for supervisor attention

This data is derivable from existing APIs (workspace list + audit events + case statuses). No new endpoints needed for the dashboard — client-side composition from existing data.

**Fix:** Add a "Supervisor View" subsection to `05_HOME.md` describing how the home screen adapts when the user has supervisor role. The stat cards change to show approval queue + team metrics. Add a "Zur Genehmigung" stat card that is always visible for supervisors.

**Effort:** 1 hour

---

### Issue 5 — Case Numbering Inconsistency (MEDIUM)

Case numbers appear in **four different formats** across the Design Pack:

| Format | Where Used | Example |
|---|---|---|
| `#0147` | `05_HOME.md`, `06_CASE_WORKFLOW.md` wireframes | `#0147` |
| `#2026-0147` | `05_HOME.md` suggestions, `06_CASE_WORKFLOW.md` detail | `#2026-0147` |
| `BAU-2026-001247` | Not used anywhere yet (proposed in spec but never adopted) | — |
| `0147` (bare number) | `00_USER_JOURNEY.md` | `#0147` / `Vorgang #0147` |

The `05_HOME.md` wireframe uses shorthand `#0147` while `06_CASE_WORKFLOW.md` uses `#2026-0147` in the detail view. These are both valid but need a clear convention.

**Recommended format:**

```
BAU-2026-0147    (Bauamt case, year 2026, sequence 0147)
VERG-2026-0152   (Vergabestelle case)
PERS-2026-0151   (Personal case)
BÜRG-2026-0154   (Bürgeramt case)
ALLG-2026-0150   (Allgemein case)
```

Prefixes: `BAU` = Bauamt, `VERG` = Vergabestelle, `PERS` = Personal, `BÜRG` = Bürgeramt, `ALLG` = Allgemeine Verwaltung.

The sequence number is zero-padded to 4 digits and resets per year. The year prefix enables archive search across years.

**Fix:** Add a "Case Numbering Convention" section to `06_CASE_WORKFLOW.md` (or `11_COMPONENTS.md`). Update all wireframes to use the new format. Update `16_SAMPLE_DATA.md` case IDs. This is a find-and-replace across ~4 files.

**Effort:** 30 minutes

---

### Issue 6 — Navigation Sub-Tab Mismatch (MEDIUM)

`04_NAVIGATION.md` lists the Meine Arbeit sub-navigation as:

```
[ Posteingang (3) ]  [ Offene Vorgänge (12) ]  [ Genehmigung (2) ]  [ Archiv ]
```

But `06_CASE_WORKFLOW.md` lists:

```
[ Posteingang (3) ]  [ Offene Vorgänge (12) ]  [ Warten (5) ]  [ Genehmigung (2) ]  [ Archiv (47) ]
```

The "Warten" tab is missing from `04_NAVIGATION.md`. It must be added — waiting states are a first-class category in the case workflow.

Also, the Wissen sub-navigation in `04_NAVIGATION.md` is:

```
[ Suche ]  [ Vorschriften ]  [ Verfahren ]  [ Vorlagen ]  [ FAQs ]
```

But `07_KNOWLEDGE.md` has a "Checklisten" tab that is absent from `04_NAVIGATION.md`.

**Fix:** Sync `04_NAVIGATION.md` sub-navigation tabs with the actual tabs shown in `06_CASE_WORKFLOW.md` and `07_KNOWLEDGE.md`.

**Effort:** 15 minutes

---

### Issue 7 — Notification Bell Specification (LOW)

The bell icon `[🔔3]` appears in navigation wireframes but its behavior is never defined. `00_USER_JOURNEY.md` mentions "System notifications, job completions, alerts. Badge with count" in the navigation section but provides no interaction design.

This is related to Issue 2 (Missing Notification Center) but specifically about the trigger element.

**Fix:** Add to `11_COMPONENTS.md`: bell icon states (no notifications, unread count 1-9, unread count 10+, unread count 99+). Click behavior. Badge color (red for approvals/overdue, blue for info). Connected to Issue 2 fix.

**Effort:** Included in Issue 2

---

### Issue 8 — Responsive Strategy Underspecified (LOW)

`04_NAVIGATION.md` says:

- "Tablet: Not a target platform. Navigation collapses to hamburger. Read-only view of case status. No document editing."
- "Mobile: Not supported in v1.0."

This is too vague for Stitch. "Read-only view of case status" could mean anything from a full case viewer to a single status badge.

**Fix:** Add a short "Responsive Behavior" section to `12_BRANDING.md` or `14_DESIGN_SYSTEM.md` specifying exactly what each breakpoint supports:

| Device | Width | Navigation | Tables | Forms | Upload | Decision Support |
|---|---|---|---|---|---|---|
| Desktop (FHD) | 1920px | Full | 50 rows, all cols | Full | Full | Sidebar |
| Desktop (standard) | 1280-1919px | Full | 50 rows, essential cols | Full | Full | Collapsible sidebar |
| Laptop | 1024-1279px | Full, reduced padding | 25 rows, minimal cols | Read-only | No | Hidden |
| Tablet | <1024px | Hamburger menu | View only, 10 rows | No | No | No |
| Phone | <768px | Not supported | Not supported | No | No | No |

**Effort:** 15 minutes

---

### Issue 9 — 00_USER_JOURNEY.md Empty States Out of Sync (LOW)

The empty state for "NO TASKS" says "Alle Vorgänge bearbeitet" which is correct. But there is no empty state for:
- No waiting cases
- No watched cases
- No completed today
- No search results in Wissen (the one in `00_USER_JOURNEY.md` is for document search only)

These are defined in their respective screen files but missing from the journey document.

**Fix:** Add the missing empty states to `00_USER_JOURNEY.md` or add a cross-reference: "See 05_HOME.md, 07_KNOWLEDGE.md for additional empty states."

**Effort:** 15 minutes

---

### Issue 10 — 01_APPLICATION.md Language Drift (LOW)

`01_APPLICATION.md` line 23 says: "intake, review, AI analysis, draft decision, supervisor approval, reply generation, archival"

This uses the old "AI analysis" term. It should say "decision support" to match the terminology in `09_AI_ASSISTANT.md` and `06_CASE_WORKFLOW.md`.

Line 19 says "Answers regulatory questions. An employee types..." — this is the old ChatGPT framing. Should be reframed around the case workflow: "The decision support panel within each case analyzes documents and suggests applicable regulations."

**Fix:** Rewrite line 23 and line 19 in `01_APPLICATION.md` to match current terminology and workflow framing.

**Effort:** 10 minutes

---

### Issue 11 — 12_BRANDING.md Tone Table Outdated (LOW)

`12_BRANDING.md` line 128 shows:

```
| "Magic AI Insights" | "KI-Analyse" |
```

`"KI-Analyse"` is itself a deprecated term. The preferred term is `"Entscheidungsunterstützung"`. The do/don't table should use current terminology.

**Fix:** Update the tone examples table in `12_BRANDING.md` to use current terms.

**Effort:** 5 minutes

---

### Issue 12 — Missing "Einstellungen" in Navigation (LOW)

The user menu has "Profil", "Passwort ändern", "Sprache", "Erscheinungsbild", "Über", "Abmelden". But there is no "Einstellungen" (Settings) entry in the main navigation or user menu for configuring user preferences — default workspace, notification preferences, table row density preference, default language.

These are client-side preferences, not backend settings. They need a place in the UI.

**Fix:** Add "Einstellungen" to the user menu in `04_NAVIGATION.md` and `00_USER_JOURNEY.md`. Note it as a client-side preferences panel (no backend endpoint required). Or, if deemed out of scope for v1.0, explicitly mark it "(zukünftig)" like Erscheinungsbild.

**Effort:** 5 minutes

---

## Terminology Table

| Current Term | File(s) | Recommended Term | Reason |
|---|---|---|---|
| KI-Assistent | `00_USER_JOURNEY.md` (L101) | Entscheidungsunterstützung | "KI" banned from user-facing labels per 09_AI_ASSISTANT.md |
| AI Analysis | `00_USER_JOURNEY.md` (L118), `01_APPLICATION.md` (L23) | Entscheidungsunterstützung | Same as above |
| KI-Dienst | `00_USER_JOURNEY.md` (L266) | Entscheidungsunterstützung (oder "Der Dienst") | User-facing error message |
| KI-Funktion | `00_USER_JOURNEY.md` (L268) | Entscheidungsunterstützung | Same |
| NO AI ANSWER | `00_USER_JOURNEY.md` (L331) | KEINE UNTERSTÜTZUNG or remove (covered by 09_AI_ASSISTANT.md) | Superseded |
| KI-Analyse (as "do" example) | `12_BRANDING.md` (L128) | Entscheidungsunterstützung | The "do" example uses a deprecated term |
| Case / cases | `01_APPLICATION.md`, `02_PERSONAS.md` (English context) | Vorgang / Vorgänge | German throughout. "Case" acceptable only in English explanatory text, never in wireframes |
| Inbox | `00_USER_JOURNEY.md` (L118), `04_NAVIGATION.md` (L33, L42) | Posteingang | German term already used in wireframes; English leaks into explanatory text |
| AI Analysis | `01_APPLICATION.md` (L23) | Entscheidungsunterstützung | Consistency |
| "Answers regulatory questions" | `01_APPLICATION.md` (L19) | "Unterstützt bei der Fallbearbeitung durch Dokumentenanalyse und Vorschriftenabgleich" | Reframe from ChatGPT-pattern to workflow-pattern |
| Fachbereich | `06_CASE_WORKFLOW.md`, `07_KNOWLEDGE.md`, `08_DOCUMENTS.md`, `16_SAMPLE_DATA.md` | Fachbereich (consistent, keep) | Already correct |
| Bereich | `07_KNOWLEDGE.md` (search filter: "Bereich: [Alles ▾]") | Fachbereich | Inconsistency — same concept, different label |
| E-Mails / unread emails | `00_USER_JOURNEY.md` (L86), `05_HOME.md` (old version) | No longer relevant | Removed in updated 05_HOME.md but still in 00_USER_JOURNEY.md old wireframe |
| task / Task / Aufgaben | `00_USER_JOURNEY.md` (NO TASKS), `05_HOME.md` (Vorgeschlagene nächste Aufgabe) | Vorgang for cases, Aufgabe only for checklist items | "Task" ambiguous between "case" and "checklist item" |
| Job / Jobs / Aufträge | `10_ADMIN.md`, `02_PERSONAS.md` | Auftrag (processing job) vs. Vorgang (case) | Clear distinction: Auftrag = ingestion/processing job, Vorgang = citizen case. Currently mixed. |

---

## Consistency Findings

### Cross-File Conflicts

| Conflict | Files | Resolution |
|---|---|---|
| Home screen wireframe | `00_USER_JOURNEY.md` shows 4-stat-card old layout; `05_HOME.md` shows 6-stat-card operational layout | Update 00_USER_JOURNEY.md to match 05_HOME.md |
| Meine Arbeit sub-tabs | `04_NAVIGATION.md` missing "Warten" tab; `06_CASE_WORKFLOW.md` includes it | Add "Warten" to 04_NAVIGATION.md |
| Wissen sub-tabs | `04_NAVIGATION.md` missing "Checklisten"; `07_KNOWLEDGE.md` has "Checklisten" in main nav | Add "Checklisten" to 04_NAVIGATION.md or confirm it's been removed |
| "Wissen > Suche" tab label | `07_KNOWLEDGE.md` line 11 shows "[ Alles ]" as first tab; `04_NAVIGATION.md` shows "[ Suche ]" | Align on "Alles" (search everything) or "Suche" (search). Recommend "Alles" for the unified tab, "Suche" as the sub-nav label |
| Case number format | `#0147` in 05_HOME.md wireframes, `#2026-0147` in 06_CASE_WORKFLOW.md detail | Adopt `FACH-YYYY-NNNN` format everywhere |
| "KI-Analyse" reference | `12_BRANDING.md` L128 uses deprecated term in "do" example | Replace with "Entscheidungsunterstützung" |
| Color: blue-700 value | `12_BRANDING.md` uses `#2B6CB0`; `14_DESIGN_SYSTEM.md` uses `#2B6CB0` | Consistent — no issue |
| Spacing: content horizontal | `11_COMPONENTS.md` says 32px; `14_DESIGN_SYSTEM.md` says 32px | Consistent — no issue |
| Button height | `11_COMPONENTS.md` says 36px default; `14_DESIGN_SYSTEM.md` says min-height 36px | Consistent — no issue |

### Within-File Inconsistencies

| File | Issue |
|---|---|
| `07_KNOWLEDGE.md` | Search filter says "Bereich: [Alles ▾]" but document table headers say "Fachbereich". Same concept, different label. |
| `05_HOME.md` | Wireframe uses `#0147` (short) but description text below uses `#2026-0147` (long). |
| `06_CASE_WORKFLOW.md` | Phase labels in lifecycle diagram use "ENTSCHEIDUNGS-UNTERSTÜTZUNG" but screen heading says "Entscheidungsunterstützung (Decision Support, formerly 'KI-Analyse')". The "formerly" note should be removed — Stitch doesn't need migration context. |
| `00_USER_JOURNEY.md` | Login page shows "max.mustermann@stadt-essen.de" but `16_SAMPLE_DATA.md` has "sabine.mueller@stadt-essen.de" as primary user. Pick one demo user and use consistently. |

---

## Accessibility Findings

| Check | Status | Notes |
|---|---|---|
| Contrast ratios specified | PASS | `12_BRANDING.md` has complete contrast table |
| Keyboard navigation | PASS | Specified in `14_DESIGN_SYSTEM.md` |
| Focus indicators | PASS | 3px blue-500 outline, 2px offset |
| Screen reader support | PASS | `aria-live`, `aria-label`, `lang="de"` all specified |
| Color not sole differentiator | PASS | Icons + text always accompany status colors |
| Touch target minimum | PASS | 36×36px |
| `prefers-reduced-motion` | PASS | Specified in `14_DESIGN_SYSTEM.md` |
| Skip-to-content link | PASS | "Zum Hauptinhalt springen" in `12_BRANDING.md` |
| Table markup | PASS | `<thead>`, `<tbody>`, `<th scope>` in `14_DESIGN_SYSTEM.md` |
| Form label association | PASS | Labels above fields, programmatically associated |
| Dialog focus trap | PASS | Specified in `11_COMPONENTS.md` |
| Toast `aria-live` | PASS | `aria-live="polite"` in `14_DESIGN_SYSTEM.md` |

**Gaps identified:**

1. **Notification bell has no `aria-label`.** The bell icon needs `aria-label="Benachrichtigungen (3 ungelesen)"` for screen readers.
2. **Risk indicators are color-only in wireframes** (🟢🟡🔴). The spec correctly says "Color is never the only differentiator" but the wireframes don't show the text labels. Add text labels: "Geringes Risiko", "Mittleres Risiko", "Hohes Risiko" alongside the colored dots.
3. **Decision support confidence bar** — the progress bar visual needs a screen-reader text alternative showing the percentage.
4. **No focus order documented for the 3-panel case layout.** The left-to-right, top-to-bottom assumption should be explicit.

---

## Realism Audit

Walking through a Sachbearbeiter's day:

**Morning login (PASS):** Opens platform → Startseite shows 12 open, 3 due today, 2 overdue, 4 waiting on citizen, 5 completed yesterday. The suggested next task is correct. This feels realistic.

**Open a case (PASS):** Three-panel layout is correct. Left: case metadata. Center: checklist + documents + notes + activity. Right: decision support. The information architecture matches how people actually work.

**Missing document scenario (PASS):** "Fehlende Unterlagen" warning with "Vom Bürger anfordern" button is exactly right. The waiting state tracking is realistic.

**Supervisor approval (PASS):** Side-by-side comparison with auto-detected changes is good. The auto-verification checks (citations current, fees correct, deadlines met, four-eyes principle) are realistic.

**Minor realism issues:**

1. **No "Vertretung" (deputy) concept.** When Sabine Müller is on vacation, her cases should automatically appear in her deputy's Arbeitskorb. This is standard in German public administration. Mark as v2 feature.

2. **No "Fristverlängerung" (deadline extension) workflow.** Sometimes a citizen requests more time, or an external authority is slow. The employee needs to formally extend the internal deadline with a reason. Currently the deadline is just a date field.

3. **No "Vertagung" (deferral) concept.** Some cases get deferred to a specific date (e.g., "wiedervorlage in 3 Monaten"). The Wiedervorlage section exists in the archive screen but there's no action to set a deferral on an active case.

4. **No printing workflow.** German administration still prints and files paper copies. A "Drucken" button on the decision draft should generate a print-formatted PDF with official letterhead.

5. **The decision support "Fehlende Informationen" section always says "Keine fehlenden Informationen erkannt."** For a realistic mockup, at least one case should show actual missing information.

---

## Google Stitch Readiness

### What Stitch Has

| Element | Quality | Notes |
|---|---|---|
| Complete prompt | GOOD | `15_STITCH_PROMPT.md` is well-structured, ~4 pages |
| Visual style | GOOD | Colors, typography, spacing, component CSS all specified |
| Navigation | GOOD | Structure clear, sub-tabs mostly correct |
| Wireframes (ASCII) | GOOD | Every major screen has wireframes |
| Sample data | EXCELLENT | Realistic names, cases, documents, notes |
| Design system | GOOD | CSS custom properties, component specs |
| API mapping | GOOD | Every user action mapped to endpoint |
| Error states | GOOD | 401, 403, 404, 500, backend unavailable, decision support unavailable |
| Empty states | GOOD | Documents, tasks, search, decision support |
| Loading states | GOOD | Skeleton, spinner, progress bar |

### What Stitch Is Missing

1. **Notification center design** (HIGH) — Bell icon exists but no dropdown panel specified. Stitch will either skip it or invent something inconsistent.

2. **Batch operation UI** (MEDIUM) — No checkboxes in list wireframes. No batch action toolbar. Stitch won't generate these unless told.

3. **Supervisor home screen variant** (MEDIUM) — The home screen is designed for Sachbearbeiter only. Stitch won't generate a supervisor-specific view.

4. **Consistent case numbering** (LOW) — If Stitch generates screens from different files, the case IDs won't match across screens.

5. **Resolution of "Bereich" vs "Fachbereich"** (LOW) — Stitch may generate both labels for the same filter, creating confusion.

### Verdict

**Stitch can generate a consistent, professional UI from the current Design Pack.** The `15_STITCH_PROMPT.md` is strong enough to produce the core screens. The sample data is excellent and will produce realistic mockups. The design system is specific enough for consistent visual output.

The missing notification center and batch operations will be gaps in the generated UI, but they are not blockers for the initial generation. They can be added in a second pass.

---

## Required Changes (Priority Order)

| # | Change | Files | Effort |
|---|---|---|---|
| 1 | Fix terminology drift in 00_USER_JOURNEY.md (KI→Entscheidungsunterstützung, update home wireframe) | `00_USER_JOURNEY.md` | 1 hr |
| 2 | Add notification center design | `11_COMPONENTS.md`, `04_NAVIGATION.md`, `16_SAMPLE_DATA.md` | 1.5 hr |
| 3 | Sync navigation sub-tabs (add Warten to 04_NAVIGATION.md) | `04_NAVIGATION.md` | 15 min |
| 4 | Add supervisor dashboard section to 05_HOME.md | `05_HOME.md` | 1 hr |
| 5 | Add batch operations documentation (table with availability status) | `06_CASE_WORKFLOW.md`, `08_DOCUMENTS.md` | 1 hr |
| 6 | Adopt consistent case numbering (BAU-2026-0147) across all files | `05_HOME.md`, `06_CASE_WORKFLOW.md`, `16_SAMPLE_DATA.md`, `00_USER_JOURNEY.md` | 30 min |
| 7 | Fix 01_APPLICATION.md outdated language (L19, L23) | `01_APPLICATION.md` | 10 min |
| 8 | Fix 12_BRANDING.md tone table (KI-Analyse → Entscheidungsunterstützung) | `12_BRANDING.md` | 5 min |
| 9 | Add responsive behavior table | `12_BRANDING.md` or `14_DESIGN_SYSTEM.md` | 15 min |
| 10 | Fix "Bereich" → "Fachbereich" in 07_KNOWLEDGE.md search filter | `07_KNOWLEDGE.md` | 5 min |
| 11 | Remove "formerly KI-Analyse" migration notes (Stitch doesn't need them) | `06_CASE_WORKFLOW.md` | 5 min |
| 12 | Add accessibility notes (bell aria-label, risk text labels, confidence text alternative) | `11_COMPONENTS.md` | 15 min |

**Total estimated effort: ~6 hours**

---

## Nice-to-Have Changes (Future Iterations)

| Change | Reason |
|---|---|
| Deputy (Vertretung) concept | Standard in German administration. Cases auto-reassign during absence. |
| Deadline extension (Fristverlängerung) workflow | Common real-world scenario. |
| Deferral (Vertagung/Wiedervorlage) on active cases | Currently only in archive. Active cases need it too. |
| Print-formatted PDF generation | German administration still prints paper files. |
| Einstellungen panel (user preferences) | Default workspace, row density, notification preferences. |
| More realistic decision support "Fehlende Informationen" examples in sample data | Current mockups always show "Keine fehlenden Informationen" — add a case that actually has missing info. |
| Citizen portal / self-service status checking | v2 feature. Citizen checks case status without calling. |

---

## Final Recommendation

**READY AFTER MINOR CHANGES**

The Design Pack is at **78/100.** The 12 required changes above are surgical — terminology cleanup, one new component (notification center), one new subsection (supervisor dashboard), batch operations documentation, and case numbering consistency. No architectural changes. No new backend endpoints. No redesign of any screen.

The core assets — workflow design, sample data, design system, branding, API mapping — are production-ready. After 6 hours of targeted edits, the pack will be at **90+/100** and fully ready for Google Stitch generation.

---

## Verdict

| Criteria | Assessment |
|---|---|
| Can Stitch generate a consistent UI today? | Yes, with gaps in notifications and batch operations |
| Are the core workflows correct? | Yes |
| Is the visual design specific enough? | Yes |
| Is the sample data realistic? | Yes, excellent |
| Are there blocking issues? | No |
| Recommended action | Apply the 12 required changes (6 hours), then paste into Google Stitch |
