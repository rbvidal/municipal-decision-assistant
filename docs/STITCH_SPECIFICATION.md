# Kommunale Entscheidungsplattform — UI Generation Specification

**Version:** 1.0
**Target:** Google AI Studio (Stitch)
**Language:** German (all user-facing text)
**Framework:** React with Next.js App Router (recommended)

---

## Design Principles

These principles govern every UI decision. Generate all screens accordingly.

1. **The application assists municipal employees in completing administrative work.** It is a productivity tool, not a chatbot. Every screen should help the user decide what to do next.

2. **The primary object is the Vorgang (case), not the document.** The user thinks in terms of cases — building permits, procurement requests, citizen inquiries. Documents support cases, not the other way around.

3. **Decision Support is an assistant, never the focus of the UI.** The system suggests; the human decides. The panel is a sidebar tool. The word "KI" never appears in user-facing labels.

4. **Information density is preferred over large empty spaces.** Tables show 50 rows. Cards use 3-5 columns at 1920px. White space is functional, not decorative. This is a professional work tool.

5. **Users are trained professionals, not consumers.** Municipal employees are domain experts in public administration law. They don't need onboarding wizards or simplified views. They need efficiency.

6. **Every screen should help the user decide what to do next.** The home screen shows the next task. The case screen shows the next phase. The decision support panel shows the next action.

7. **Technical implementation details are hidden from normal users.** Chunk counts, embedding dimensions, Qdrant vector status, execution traces, confidence scores — all behind "Erweitert" (Advanced) toggles visible only to administrators.

8. **Accessibility and keyboard navigation are first-class requirements.** WCAG 2.1 AA minimum. All interactive elements keyboard-accessible. Focus indicators visible. Screen reader support. Color never the only differentiator.

9. **German public administration, not Silicon Valley.** The visual language conveys reliability, precision, and trust. No gradients, no glassmorphism, no shadows on cards, no purple AI aesthetics, no sparkle icons. The platform should feel like a well-designed government form — digital, but familiar.

---

## 1. Application Overview

### Purpose

The Kommunale Entscheidungsplattform (Municipal Decision Platform) is an enterprise case-management application for German municipal employees. It helps Sachbearbeiter process administrative cases — building permits, procurement requests, personnel actions, citizen inquiries — from inbox to archive. Decision support tools quietly assist in the background.

### Target Users

| Role | Description | Daily Usage |
|---|---|---|
| Sachbearbeiter (Case Worker) | Processes 10-30 cases per day. Domain expert in public administration. | 80% of day in Meine Arbeit |
| Supervisor (Sachgebietsleiter) | Reviews and approves decisions. Manages team workload. | Approval queue, team dashboard |
| Department Administrator (Fachbereichsadministrator) | Uploads and maintains document collections. Monitors indexing. | Document management, index status |
| System Administrator (IT-Administrator) | Monitors infrastructure. Investigates failures. Runs benchmarks. | Verwaltung screens |

All users work on desktop workstations (1280-1920px) in municipal offices.

### Platform Capabilities

1. **Fallbearbeitung (Case Processing):** Guides Sachbearbeiter through the case lifecycle — Posteingang, Prüfung, Entscheidungsunterstützung, Entwurf, Genehmigung, Versand, Archiv.
2. **Dokumentenverwaltung (Document Management):** Upload, metadata, versioning, indexing, and full-text search of regulations, laws, decrees, and circulars.
3. **Entscheidungsunterstützung (Decision Support):** Analyzes case documents, identifies applicable regulations, flags missing information, suggests checklist items and next actions.
4. **Wissenssuche (Knowledge Search):** Unified search across regulations, procedures, templates, FAQs, archived cases, citizens, and documents.
5. **Bestandsüberwachung (Corpus Monitoring):** Administrators see document indexing health, embedding coverage, and Qdrant vector status.

### Desktop-First Approach

- Minimum supported width: 1280px (standard office monitor)
- Optimal width: 1920px (Full HD)
- Maximum content width: 1400px (centered)
- Laptop (1024-1279px): Full navigation, reduced tables, read-only forms
- Tablet (<1024px): Hamburger menu, view-only case status
- Phone: Not supported in v1.0

### Role of Decision Support

Decision Support (Entscheidungsunterstützung) is embedded as a sidebar panel in the case workspace and as a compact panel on the home screen. It provides: summary of case documents, applicable regulations with citations, missing information flags, suggested checklist items, suggested next action, and links to supporting documents. All technical metrics (confidence scores, execution traces, model names) are hidden behind the "Erweitert" (Advanced) toggle.

The system never uses the words "KI", "AI", or "künstliche Intelligenz" in user-facing labels. It says "Zusammenfassung", not "KI-Zusammenfassung". It says "Vorschläge", not "KI-Vorschläge". It says "Analysiere...", not "KI analysiert...".

---

## 2. Core Business Objects

The application's domain model from the user's perspective. These are the concepts municipal employees work with daily.

### Vorgang (Case)

The primary object of the application. A Vorgang represents one administrative procedure — a building permit application, a procurement request, a citizen inquiry, a personnel action.

**Lifecycle:** Posteingang → Prüfung → Entscheidungsunterstützung → Entwurf → Genehmigung → Versand → Archiv

**At any point, a Vorgang can enter a waiting state:** Wartet auf Bürger, Wartet auf Behörde, Wartet auf Kollegen.

**Relationships:**
- Owned by one Sachbearbeiter (assignee)
- Belongs to one Fachbereich (Bauamt, Vergabestelle, Personal, Bürgeramt, Allgemein)
- Has one Antragsteller (citizen or internal requester)
- Contains zero or more Dokumente (attached files)
- Has one Checkliste (dynamic, per case type)
- Has zero or more Interne Notizen (internal notes, never sent to citizens)
- Has one Entscheidungsentwurf (draft decision, in later phases)
- Has one Aktivitätsverlauf (audit timeline of all actions)
- Has one Risikobewertung (risk indicator: Gering / Mittel / Hoch)

**Typical actions:** Öffnen, Prüfen, Dokumente hinzufügen, Interne Notiz hinzufügen, Checkliste abhaken, Analyse starten, Entwurf erstellen, Zur Genehmigung einreichen, Genehmigen/Ablehnen, Versenden, Archivieren, Zuweisen, Warten-Status setzen.

**Identification:** Case numbers follow `FACH-YYYY-NNNN` format (e.g., BAU-2026-0147).

### Bürger (Citizen)

A person or organization interacting with the municipality.

**Relationships:** Has one or more Vorgänge. Has contact information (address, phone, email).

### Sachbearbeiter (Employee)

A municipal employee who processes cases.

**Relationships:** Assigned to zero or more Vorgänge. Belongs to one Fachbereich. Reports to one Supervisor (if not a supervisor themselves). Has a role (Sachbearbeiter, Supervisor, Fachbereichsadministrator, Systemadministrator).

### Dokument (Document)

A file uploaded to the platform — typically a PDF of a law, regulation, decree, circular, or citizen submission.

**Relationships:** Attached to zero or more Vorgänge. Belongs to one Fachbereich. Has one Dokumenttyp (Gesetz, Verordnung, Erlass, Richtlinie, Rundschreiben, Informationsblatt, Antrag). Has metadata (title, date, language, tags). Has one or more Versionen. Is indexed into Chunks for semantic search.

**Typical actions:** Hochladen, Metadaten bearbeiten, Neue Version hochladen, Versionen vergleichen, Volltext anzeigen, Archivieren, Löschen, Neu indizieren.

### Vorschrift (Regulation)

A specific type of Dokument — a law, ordinance, decree, or directive with legal authority. Regulations are the primary source for decision support.

**Relationships:** Is a Dokument. Referenced by Entscheidungsentwürfe. Cited by other Vorschriften. Contains Paragrafen that are individually searchable.

### Wissenseintrag (Knowledge Article)

A non-regulation resource: Verfahren (procedure description), Vorlage (template), FAQ, or Checkliste.

**Relationships:** Belongs to one Fachbereich. May reference Vorschriften. May be used in Vorgänge (templates applied to cases).

### Checkliste (Checklist)

A dynamic list of items to complete for a specific case type. Auto-populated based on the Vorgang type, editable by the Sachbearbeiter.

**Relationships:** Belongs to one Vorgang. Contains zero or more Checklistenpunkte. Items can be mandatory or optional.

### Vorlage (Template)

A pre-written document skeleton (Bescheid, Vermerk, Schreiben) that the Sachbearbeiter fills with case-specific data.

**Relationships:** Belongs to one Kategorie (Baubescheid, Vergabebescheid, Widerspruchsbescheid). Used in Vorgänge during the Entwurf phase.

### Aufgabe (Task)

A Task is a first-class business object representing one unit of work. A Vorgang (Case) generates many Aufgaben as it moves through its lifecycle. Tasks are how the Sachbearbeiter experiences their daily work — the Home screen is fundamentally a task queue, not merely a list of cases.

**A Vorgang generates these typical Aufgaben:**

| Task | Generated When | Owner |
|---|---|---|
| Antrag prüfen (Review application) | Vorgang enters Posteingang | Sachbearbeiter |
| Unterlagen anfordern (Request additional documents) | Required documents missing | Sachbearbeiter → Bürger |
| Auf Bürgerantwort warten (Wait for citizen reply) | Document request sent | System (waiting state) |
| Auf Behörde warten (Wait for other authority) | External input required | System (waiting state) |
| Rechtliche Prüfung (Perform legal review) | Vorgang enters Prüfung | Sachbearbeiter |
| Entscheidungsentwurf erstellen (Prepare draft decision) | Vorgang enters Entwurf | Sachbearbeiter |
| Genehmigung einholen (Obtain supervisor approval) | Draft submitted | Supervisor |
| Antwort versenden (Send final response) | Decision approved | Sachbearbeiter |
| Vorgang archivieren (Archive case) | Response sent | Sachbearbeiter |

**Every Aufgabe has:**
- **Owner** — the Sachbearbeiter (or Supervisor, or System) responsible
- **Fälligkeitsdatum (due date)** — when the task must be completed
- **Status** — Offen, In Bearbeitung, Erledigt, Überfällig
- **Priorität** — Hoch, Mittel, Niedrig (derived from the Vorgang priority and deadline proximity)
- **Zugehöriger Vorgang (related case)** — the Vorgang this task belongs to

**Relationships:** Belongs to one Vorgang. May belong to one Checkliste. Assigned to one Sachbearbeiter. May generate a notification when approaching its deadline.

**How Tasks relate to the Home screen:** The Home screen displays the employee's task queue aggregated across all their Vorgänge. The stat cards (Meine Vorgänge, Heute fällig, Überfällig) are task counts, not case counts. "Vorgeschlagene nächste Aufgabe" is the system recommending the single most important task across all cases.

### Entscheidungsunterstützung-Ergebnis (Decision Support Result)

The output of the decision support analysis for a specific Vorgang.

**Contains:** Zusammenfassung, Anwendbare Vorschriften (with citations), Fehlende Informationen, Vorgeschlagene Checkliste, Vorgeschlagene nächste Aktion, Unterstützende Dokumente, Vertraulichkeit (in Erweitert), Ausführungsprotokoll (in Erweitert).

**Relationships:** Generated for one Vorgang. References one or more Vorschriften. May reference archived Vorgänge as similar cases.

### Wissen vs. Dokumente (Knowledge vs. Documents)

These are two fundamentally different concepts in the application. Stitch must understand the distinction to generate the correct UI for each area.

**Wissen (Knowledge)** means information employees consult while working. It is reference material — read, searched, bookmarked, cited. The Wissen navigation area and its unified search are designed for consultation. Examples: Vorschriften (regulations), Verfahren (procedures), Vorlagen (templates), FAQs, Checklisten, archived Fälle used as precedent.

**Dokumente (Documents)** means managed files. They are uploaded, versioned, indexed, archived, compared. The Dokumente navigation area is designed for document lifecycle management. Examples: uploaded PDFs of laws, citizen submissions (Bauantrag.pdf), scanned documents, generated decisions (Bescheide), attachments to Vorgänge.

**Key distinction:** Wissen is consulted. Dokumente are managed. A Vorschrift is a type of Wissen — it happens to originate from a Dokument (the uploaded PDF of the law), but once indexed it is accessed through Wissen, not through Dokumente. A citizen's Bauantrag.pdf is a Dokument attached to a Vorgang — it is managed through Dokumente and the case workspace.

**In the UI:** The Wissen search results prioritize readability, citation, and quick reference. The Dokumente list prioritizes metadata, status, version history, and management actions. They serve different user needs and must feel like different areas of the application.

---

## 3. Information Architecture

### Navigation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Municipality Logo]  Entscheidungsplattform           [🔔 Benachrichtigungen] [👤 Name] │
├──────────────────────────────────────────────────────────────────────────────┤
│  ● Startseite    ○ Meine Arbeit    ○ Wissen    ○ Dokumentenverwaltung    ○ Verwaltung    │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Label | Route | Purpose | Visible To |
|---|---|---|---|
| Startseite | `/home` | Operational dashboard. Caseload, deadlines, waiting items. | All users |
| Meine Arbeit | `/work` | Case workspace. Inbox, active cases, approval queue, archive. | All users |
| Wissen | `/knowledge` | Unified search across all content types. | All users |
| Dokumentenverwaltung | `/documents` | Municipality-wide document management, upload, versioning, indexing, archive. | All users |
| Verwaltung | `/admin` | Corpus health, audit, jobs, benchmarks, developer tools. | ADMIN only |

### Page Hierarchy

```
/login
  ├── /forgot-password
  └── /reset-password
/home
/work
  ├── Posteingang
  ├── Offene Vorgänge
  ├── Warten
  ├── Genehmigung (supervisor only)
  └── Archiv
/knowledge
  ├── Alles (unified search)
  ├── Vorschriften
  ├── Verfahren
  ├── Vorlagen
  ├── FAQs
  ├── Fälle
  ├── Bürger
  └── Dokumente
/documents (Dokumentenverwaltung)
  ├── Alle Dokumente
  ├── Hochladen
  └── Index-Status
/work/{caseId} (Case Workspace — contextual tabs, NOT pages)
  ├── Übersicht
  ├── Checkliste
  ├── Dokumente (case documents only)
  ├── Interne Notizen
  ├── Aktivität
  └── Entscheidungsunterstützung
/admin (ADMIN only)
  ├── Übersicht
  ├── Korpus-Status
  ├── Audit
  ├── Aufträge
  ├── Benchmarks
  └── Entwickler
```

### Sub-Navigation Tabs

**Meine Arbeit:**
```
[ Posteingang (3) ]  [ Offene Vorgänge (12) ]  [ Warten (5) ]  [ Genehmigung (2) ]  [ Archiv (47) ]
```

**Wissen:**
```
[ Alles ]  [ Vorschriften ]  [ Verfahren ]  [ Vorlagen ]  [ FAQs ]  [ Fälle ]  [ Bürger ]  [ Dokumente ]
```

**Dokumentenverwaltung:**
```
[ Alle Dokumente ]  [ Hochladen ]  [ Index-Status ]
```

**Verwaltung:**
```
[ Übersicht ]  [ Korpus-Status ]  [ Audit ]  [ Aufträge ]  [ Benchmarks ]  [ Entwickler ]
```

Systemkonfiguration, Analytik, and Wissensgraph are accessed as cards from the Verwaltung Übersicht tool grid.

**Case Workspace (contextual tabs — NOT application pages):**
```
[ Übersicht ]  [ Checkliste ]  [ Dokumente ]  [ Interne Notizen ]  [ Aktivität ]  [ Entscheidungsunterstützung ]
```
These tabs are contextual views of the current Vorgang. Switching tabs never leaves the case. The case header (case number, subject, citizen, assignee, status, deadline, risk) remains visible at all times.

### Global Modules vs. Case Workspace

The application has two fundamental interface modes:

**Global Modules** (Startseite, Meine Arbeit, Wissen, Dokumentenverwaltung, Verwaltung) — operate across the entire municipality. Show repositories, searches, filters, statistics. No active case unless navigated from one.

**Case Workspace** — opens when a Vorgang is selected from Meine Arbeit. The current case is always visible via a persistent header. All content is contextual to this case. Decision Support only operates on this case. The case Dokumente tab shows only this case's documents — no municipality-wide search, no documents from other cases.

The user must instantly understand which mode they are in.

### Breadcrumbs

Breadcrumbs always show the case as a child of Meine Arbeit:
```
Startseite > Meine Arbeit > BAU-2026-0147 > Dokumente
Startseite > Meine Arbeit > BAU-2026-0147 > Interne Notizen
Startseite > Meine Arbeit > BAU-2026-0147 > Entscheidungsunterstützung
```

Global Wissen accessed directly:
```
Startseite > Wissen > Vorschriften
```

Wissen accessed from within a case (case header remains visible):
```
Startseite > Meine Arbeit > BAU-2026-0147 > Wissen > §65 BauO NRW
```

### Notification Bell
320px wide dropdown, max-height 480px, scrollable. Unread: ● filled dot, bold. Read: ○ empty dot. Badge: red (approvals/overdue), blue (info). Client-side only in v1.0.

### Responsive Behavior

| Device | Width | Navigation | Tables | Forms | Upload | Decision Support |
|---|---|---|---|---|---|---|
| Desktop (FHD) | 1920px | Full, persistent | 50 rows, all columns | Full | Full | Sidebar, always visible |
| Desktop (standard) | 1280-1919px | Full, persistent | 50 rows, all columns | Full | Full | Collapsible sidebar |
| Laptop | 1024-1279px | Full, reduced padding | 25 rows, essential columns | Read-only | No | Hidden |
| Tablet | <1024px | Hamburger menu | View only, 10 rows | No | No | Not available |
| Phone | <768px | Not supported | Not supported | No | No | Not available |

---

## 4. Global Application Shell

Every screen follows this layout. The shell is persistent; only the main content area changes.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TOP BAR (56px, white, bottom border gray-200)                               │
│  [Logo 36px]  Entscheidungsplattform         [🔔 Benachrichtigungen] [👤 Name]│
├──────────────────────────────────────────────────────────────────────────────┤
│  SUB-NAVIGATION (44px, gray-50 bg, only on screens with sub-tabs)            │
│  [ Tab 1 (N) ]  [ Tab 2 (N) ]  [ Tab 3 (N) ]  ...                           │
├──────────────────────────────────────────────────────────────────────────────┤
│  BREADCRUMB (28px, 12px text, gray-500)                                      │
│  Startseite > Meine Arbeit > Vorgang BAU-2026-0147                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MAIN CONTENT AREA                                                           │
│  ┌─────────────────────────────────────────┬────────────────────────────┐    │
│  │                                         │                            │    │
│  │  PRIMARY CONTENT                        │  RIGHT SIDEBAR             │    │
│  │  (flexible width)                       │  (280-320px, optional)     │    │
│  │                                         │  Gray-100 bg               │    │
│  │  Max width: 1400px (total)              │  Collapsible               │    │
│  │  Padding: 32px horizontal, 24px vertical│                            │    │
│  └─────────────────────────────────────────┴────────────────────────────┘    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  TOAST LAYER (fixed, bottom-right, z-index 1000)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│  DIALOG LAYER (fixed overlay, black 50%, z-index 500)                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Shell Components

**Top Bar:** Always visible. Logo (links to Startseite), primary navigation (5 items, active item highlighted with blue-700 text + 3px bottom border), notification bell with badge, user menu dropdown.

**Sub-Navigation:** Second row (44px, gray-50 bg). Only on screens with sub-pages. Tabs with count badges.

**Breadcrumb:** Above content. 12px, gray-500. Chevron separators.

**Main Content Area:** Max 1400px centered. Padding 32px horizontal, 24px vertical. Optional right sidebar (280-320px, collapsible, gray-100 bg) for Decision Support or Favorites.

**Toast Notifications:** Fixed bottom-right (24px from edges). 380px max width. Stack upward with 8px gap. Left-colored border. Auto-dismiss: 5s (success/info), 10s (warning/error).

**Dialog Layer:** Fixed overlay (black 50%). Dialogs centered, white, 8px radius, max 520px. Close via X, Escape, or overlay click. Focus trapped.

**User Menu:** Dropdown: user name + email + department. Items: Profil, Passwort ändern, Sprache (DE/EN), Erscheinungsbild (zukünftig), Über, Abmelden.

### Shell Rules
- Top bar and breadcrumb never hidden
- Right sidebar collapsible, state persisted per user
- Bell badge updates in real time (client-side)
- Dialogs and toasts in portal layers
- No screen breaks out of the shell — error pages use same top bar and breadcrumb

---

## 5. Screen Specifications

### 5.1 Login (`/login`)

**Purpose:** Authenticate municipal employees. First screen users see.

**Layout:** Centered card (max-width 420px) on gray-50 background. Municipality coat of arms/logo at top (64px). Application name below.

```
┌──────────────────────────────────────────────────────────────────────┐
│                    [Stadtwappen / Logo der Gemeinde]                  │
│              Kommunale Entscheidungsplattform                         │
│    ┌──────────────────────────────────────────────────────────┐     │
│    │  E-Mail-Adresse                                          │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │ sabine.mueller@stadt-essen.de                    │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    │  Passwort                                   [👁]        │     │
│    │  [ ] Angemeldet bleiben                                  │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │                 Anmelden                          │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    │  Passwort vergessen?                                     │     │
│    └──────────────────────────────────────────────────────────┘     │
│    DE  |  English                             Version 2.4.1          │
└──────────────────────────────────────────────────────────────────────┘
```

**Actions:** Anmelden → POST /api/auth/login → /home.

**States:** Loading (spinner "Anmeldung läuft..."), Error (red banner "Ungültige Anmeldedaten"), Locked ("Konto vorübergehend gesperrt"), Backend unavailable ("Dienst nicht erreichbar").

**Backend:** POST /api/auth/login — `{email, password}` → `{accessToken, refreshToken, tokenType, userId, email, roles}`.

### 5.2 Authentication Flows (Forgot Password, Reset, First Login, Session)

- **Forgot Password:** Email → "Link senden". Success message (does not confirm email existence).
- **Reset Password:** New password + confirm. Min 8 chars, 1 uppercase, 1 number, 1 special. → /login.
- **First Login:** Same form. Force password change after temporary password.
- **Change Password:** From user menu. Current + new + confirm.
- **Session Expired:** Modal on 401. → "Zur Anmeldung". Preserves URL.
- **Logout:** Confirmation dialog. POST /api/auth/logout → 204 → /login.
- **403:** "Keine Berechtigung. Erforderliche Rolle: [ROLE]." → "Zurück zur Startseite".

### 5.3 Startseite (Home — `/home`)

**Purpose:** The Home page is not a dashboard — it is an Operational Workbench. Its purpose is to allow an employee to immediately continue working. The first information visible must always answer the question: "What should I work on next?"

Work queues, deadlines, and waiting items have the highest visual importance. The Decision Support sidebar, activity feed, and suggestions are secondary. Statistics (completed today, department KPIs) are tertiary — they provide context but never distract from the primary purpose of continuing work.

The employee opens this page and within seconds knows: what is overdue, what is due today, what is blocked waiting for someone else, and what the single most important next task is.

**Layout:** Six stat cards row + two-column (70/30).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Startseite                                                                  │
│  Guten Morgen, Frau Müller.                           Dienstag, 15. Juli 2026 │
│                                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐        │
│  │Meine     │Heute     │Überfällig│Wartet    │Wartet    │Heute     │        │
│  │Vorgänge  │fällig    │          │Bürger    │Behörde   │erledigt  │        │
│  │   12     │    3     │    2     │    4     │    1     │    5     │        │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘        │
│                                                                              │
│  ┌──────────────────────────────────────┬───────────────────────────────────┐│
│  │ MEINE VORGÄNGE (70%)                 │ ENTSCHEIDUNGSUNTERSTÜTZUNG (30%)  ││
│  │ Überfällig (2)                       │ Frage zu Vorschriften oder        ││
│  │ Heute fällig (3)                     │ Verfahren?                   [→]  ││
│  │ Wartet auf Bürger (4)                │ Vorschläge für Ihre Vorgänge:     ││
│  │ Wartet auf Behörde (1)               │ 💡 BAU-2026-0147 → §65 BauO NRW   ││
│  │ Heute erledigt (5)                   │ 💡 VERG-2026-0152 → AV §55 LHO    ││
│  │ Von mir beobachtet (3)               │                                   ││
│  └──────────────────────────────────────┴───────────────────────────────────┘│
│                                                                              │
│  Vorgeschlagene nächste Aufgabe                                              │
│  BAU-2026-0147 Bauantrag Carport  Fällig: heute, 12:00  Risiko: 🟢 Gering   │
│  [ Vorgang öffnen ]                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Supervisor variant:** Stat cards change to: Zur Genehmigung, Heute fällig, Überfällig (Abteilung), Wartet Bürger, Wartet Behörde, Abteilung erledigt. Left column: Genehmigungsqueue, Team-Arbeitsbelastung table, Dept KPIs.

**States:** First login (zero stats + welcome), All completed (checkmark), Heavy workload (amber/red + banner).

**Backend:** GET /api/workspaces, POST /api/decision, GET /api/audit/events.

### 5.4 Meine Arbeit — Case Workspace

**Sub-tabs:** Posteingang (new cases), Offene Vorgänge (active), Warten (waiting), Genehmigung (approval queue, supervisor), Archiv (archive).

**Posteingang:** Filterable table. Columns: #, Betreff, Eingegangen, Fachbereich, Risiko, Aktion.

**Case Workspace:** When a Vorgang is opened, a contextual workspace replaces the global module view. A persistent case header is always visible:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BAU-2026-0147  Neubau Carport  Thomas Becker                               │
│  Bearbeiter: Sabine Müller  |  Status: Prüfung  |  Fällig: Heute  |  🔴 Hoch │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Case tabs** (contextual views, not application pages): Übersicht | Checkliste | Dokumente | Interne Notizen | Aktivität | Entscheidungsunterstützung. Switching tabs never leaves the current case.

- **Übersicht:** Case summary, key metadata, current phase, risk indicator, next action.
- **Checkliste:** Dynamic checklist auto-populated by case type. User can add/remove items.
- **Dokumente:** ONLY documents belonging to this case. Upload, preview, download, compare versions. No municipality-wide search. No documents from other cases.
- **Interne Notizen:** Author + timestamp, newest first. Never sent to citizens.
- **Aktivität:** Timeline of all actions on this case. Bürger/Sachbearbeiter/Supervisor/System.
- **Entscheidungsunterstützung:** Decision support panel contextual to this case (see Section 5.9).

**Case Detail (three-panel within tabs):** When on Übersicht or Entscheidungsunterstützung tabs: Left (240px): case metadata, assignment, priority, deadline. Center (flex): tab content. Right (320px): Decision Support panel on Übersicht tab (see Section 5.9).

**Case lifecycle:** Posteingang → Prüfung → Entscheidungsunterstützung → Entwurf → Genehmigung → Versand → Archiv. Waiting states: Wartet auf Bürger | Behörde | Kollegen.

**Key features:** Dynamic checklist (auto-populated by case type), Internal notes (author + timestamp, never sent to citizens), Risk indicator (computed: deadline + complexity + missing docs + waiting days → Gering/Mittel/Hoch), Missing documents warning, Assignment/reassignment with reason, Activity timeline with full audit trail.

**Entwurf:** Full-width document editor. Template selector. Save, preview, submit for approval.

**Genehmigung (Supervisor):** Side-by-side comparison. Auto-verification: citations current, fees correct, deadlines met, four-eyes principle. [Genehmigen] [Zurück zur Überarbeitung] [Ablehnen].

**Versand:** Generated reply + cover letter. Mark sent, print, archive.

**Archiv:** Filterable table. Wiedervorlage section.

**Backend:** GET /api/workspaces/{id}, GET /api/workspaces/{id}/documents, GET /api/workspaces/{id}/timeline, POST /api/decision.

### 5.5 Wissen — Unified Search (`/knowledge`)

**Purpose:** Search across all content types.

**Sub-tabs:** Alles | Vorschriften | Verfahren | Vorlagen | FAQs | Fälle | Bürger | Dokumente

**Layout:** Search bar + Fachbereich filter + sort. Results grouped by category with dividers and relevance bars. Top 5 per category. Favorites sidebar (280px, collapsible). Vorschriften browser: left sidebar (Fachbereich tree) + right detail panel. Verfahren: structured procedure descriptions with tables. Vorlagen: library by category with "In Vorgang verwenden" action. FAQs: expandable Q&A by department.

**Backend:** POST /api/search, GET /api/documents, GET /api/workspaces.

### 5.6 Dokumentenverwaltung — Municipality-Wide Document Management (`/documents`)

**Sub-tabs:** Alle Dokumente | Hochladen | Index-Status

**Document List:** Dense table (50 rows). Columns: Titel, Fachbereich, Status, Datum, Aktionen. Row actions: Anzeigen, Metadaten, Neue Version, Versionen vergleichen, Verwandte Dokumente, Referenzierte Vorschriften, Neu indizieren, Archivieren, Löschen.

**Document Detail:** Metadata (editable), Related documents, Version history with comparison, Referenced/citing regulations, Full text (expandable), Erweitert: Index-Details (ADMIN only).

**Version Comparison:** Side-by-side diff. Auto-detected changes. Export as PDF.

**Upload:** Drag-and-drop (PDF/DOCX/TXT/HTML, max 50 MB). Metadata form. Progress bar. Processing status.

**Index Status:** Summary stat cards + warnings + action buttons.

**Backend:** GET/PATCH/POST/DELETE /api/documents, GET /api/documents/{id}/content, POST /documents/upload.

### 5.7 Decision Support Panel (Embedded)

**Appears in:** Case workspace (right column, 320px), Home screen (sidebar, 30%).

**Sections:** Question input, Zusammenfassung, Anwendbare Vorschriften (with citation excerpts + doc links), Fehlende Informationen, Vorgeschlagene Checkliste, Vorgeschlagene nächste Aktion, Unterstützende Dokumente, Erweitert (confidence, strategy, model, latency).

**States:** Loading (progress bar + status text + elapsed), Low confidence (warning banner), No results (suggestions), Service unavailable (fallback options).

**Naming:** Never "KI", "AI" in labels. "Zusammenfassung" not "KI-Zusammenfassung". "Vorschläge" not "KI-Vorschläge".

**Backend:** POST /api/decision — `{question, workspace}` → `{answer, confidence, sources, trace}`.

### 5.8 Verwaltung — Administration (`/admin`)

**Visible to:** ADMIN only. **Sub-tabs:** Übersicht | Korpus-Status | Audit | Aufträge | Benchmarks | Entwickler

**Übersicht:** 8-card tool grid. Systemkonfiguration, Analytik, Wissensgraph are inline panels.

**Korpus-Status:** Status badge + stat cards + warnings + document health table. Actions: Inventar generieren, Report generieren.

**Audit:** Filterable event log. **Aufträge:** Ingestion job monitoring. **Benchmarks:** Retrieval quality metrics. **Entwickler:** Performance dashboard + knowledge tables.

**Backend:** GET /admin/corpus-health, GET /api/audit/events, GET /api/document-ingestion-jobs, GET /dev/perf, GET /dev/knowledge/*.

### 5.9 Error Screens & Empty States

**Errors:** 401 (Zur Anmeldung), 403 (Zur Startseite), 404 (Zur Startseite + Suche), 500 (Fehler-ID + Neu laden), Backend unavailable (Erneut versuchen), Decision Support unavailable (Stichwortsuche), Qdrant unavailable (Stichwortsuche only).

**Empty states:** No documents → [Dokument hochladen], No cases → "Alle Vorgänge bearbeitet", No search results → suggestions, No decision support → [Frage umformulieren], No benchmarks → "Führen Sie den ersten Benchmark aus".

---

## 6. Components

### Cards
White, 1px gray-300 border, 8px radius. NO shadows. Padding: 20px. Stat cards: 28px bold number + 12px uppercase label. 4 columns at 1920px.

### Tables
Primary UI pattern. 40px row height (dense). Sticky header (gray-100). Alternating rows (white/gray-50). 50 rows default. 13px text. Sortable columns. Pagination.

### Forms
Labels above fields (14px semibold, never placeholder-only). Required: red *. Input: 40px height, 1px gray-300 border, 8px radius. Focus: blue-500 border + 3px blue-100 ring. Error: red-500 border + red-50 bg.

### Buttons
36px height (32px small, 44px large). Types: Primary (blue-700), Secondary (white + border), Danger (red-700), Ghost (transparent). Loading: spinner replaces text.

### Dialogs
Overlay black 50%. Centered, white, max 520px, 8px radius. Focus trap. Escape closes. X button.

### Badges & Status
Inline-flex, 4px radius, 12px text. Green (success), Amber (warning), Red (error/danger), Blue (info), Gray (neutral). Risk: always with text label (Gering/Mittel/Hoch).

### Notifications
Toast: bottom-right, 380px, auto-dismiss 5-10s. Bell dropdown: 320px, scrollable. Unread ●, Read ○.

### Icons
Phosphor Icons, 24px, regular weight. Always with text labels (except dense tables).

### Loading
Skeleton (gray-200 pulse, 5 rows). Spinner (20px buttons, 32px pages). Progress bar (blue-500, 6px).

### Decision Support Panel
Collapsible sidebar (320px). Sections: question, summary, regulations, missing info, checklist, next action, supporting docs, Erweitert.

### Checklist
Ordered items. Auto-populated by case type. Mandatory marked *. Completed shows timestamp + user.

### Activity Timeline
Vertical: timestamp + actor (Bürger/Sachbearbeiter/Supervisor/System) + action + comment.

### Keyboard Focus Order (Three-Column Workspace)
1. Back button 2. Case number + Watch 3. LEFT column top-to-bottom 4. CENTER column top-to-bottom 5. RIGHT column top-to-bottom. Dialogs trap focus. Escape closes overlays. Skip link: "Zum Hauptinhalt springen".

---

## 7. Workflows

### Authentication Flow
Browser → /login → email + password → POST /api/auth/login → tokens in memory → /home. Forgot password → email → link → reset → login. First login → force password change. Session expired → modal → re-login → redirect back. Logout → confirmation → POST /api/auth/logout → /login.

### Case Processing Flow
Posteingang → open case → Prüfung (review docs, checklist) → Entscheidungsunterstützung (analyze) → Entwurf (draft) → Genehmigung (supervisor approve/return/reject) → Versand (send reply) → Archiv. Missing docs → Wartet auf Bürger → reminder → resume. External authority → Wartet auf Behörde → response → resume.

### Document Upload Flow
Dokumente → Hochladen → drop PDF → metadata → upload → progress → processing (extract → chunk → embed) → complete → searchable.

### Knowledge Search Flow
Wissen → query → scope → results grouped by category → click to open document/case/citizen.

### Decision Support Flow
Open case → question → [Analyse starten] → loading → results (summary, regulations, missing info, checklist, next action) → [Analyse übernehmen] or [Erneut analysieren].

### Administration Flow
Verwaltung → Übersicht → Korpus-Status (review health, fix warnings) / Audit (search events) / Aufträge (monitor jobs) / Benchmarks (run, review) / Entwickler (debug).

---

## 8. State Models

### Vorgang (Case) States

```
  NEW → IN_REVIEW → DECISION_SUPPORT → DRAFTING → PENDING_APPROVAL → READY_TO_SEND → ARCHIVED
           │              │                │            │
           └──────────────┴────────────────┴────────────┘
                  (WARTET_AUF_BÜRGER | WARTET_AUF_BEHÖRDE | WARTET_INTERN)
```

| State | Description | Valid Transitions |
|---|---|---|
| NEW | Just arrived in Posteingang | → IN_REVIEW |
| IN_REVIEW | Assigned, documents being checked | → DECISION_SUPPORT, → WARTET_AUF_BÜRGER, → WARTET_AUF_BEHÖRDE |
| DECISION_SUPPORT | Analysis completed | → DRAFTING, → IN_REVIEW (re-analyze) |
| DRAFTING | Entscheidungsentwurf being written | → PENDING_APPROVAL, → IN_REVIEW |
| PENDING_APPROVAL | Submitted to supervisor | → READY_TO_SEND (approved), → DRAFTING (returned), → ARCHIVED (rejected) |
| READY_TO_SEND | Decision approved | → ARCHIVED |
| ARCHIVED | Case closed, searchable | Terminal |
| WARTET_AUF_BÜRGER | Waiting for citizen documents | → IN_REVIEW (received), → ARCHIVED (withdrawn) |
| WARTET_AUF_BEHÖRDE | Waiting for external authority | → IN_REVIEW (response received) |
| WARTET_INTERN | Reassigned to colleague | → IN_REVIEW (completed or re-assigned back) |

### Dokument (Document) States

```
  UPLOADED → INDEXING → READY
                │
                └──→ FAILED (retry → INDEXING)
```

| State | UI |
|---|---|
| UPLOADED | "Wird verarbeitet..." spinner |
| INDEXING | Progress indicator |
| READY | ✓ Aktiv, searchable |
| FAILED | ⚠ Fehler, [Neu indizieren] |

### Knowledge Search States

```
  IDLE → SEARCHING → RESULTS
                ├──→ NO_RESULTS
                └──→ ERROR
```

### Decision Support States

```
  IDLE → ANALYZING → ANSWER_READY
                ├──→ LOW_CONFIDENCE
                └──→ FAILED
```

### Notification States

```
  UNREAD → READ → ARCHIVED
```

---

## 9. Visual Design

### Colors
Primary: Blue-900 #1A365D (headings), Blue-700 #2B6CB0 (buttons, links, active), Blue-500 #3182CE (focus rings). Neutral: Gray-900 #1A1A2E (text), Gray-700 #4A5568 (secondary), Gray-300 #E2E8F0 (borders). Semantic: Green-700 #276749, Amber-700 #975A16, Red-700 #9B2C2C. Background: White #FFFFFF (cards), Gray-50 #FAFBFC (page).

### Typography
Inter (body, 400/500/600/700), JetBrains Mono (code/IDs). Scale: H1 24px/32px semibold, H2 20px/28px, H3 16px/24px, Body 14px/20px, Small 13px/18px, Caption 12px/16px, Stat 28px/36px bold, Code 13px/20px.

### Spacing
4px base: 4px (icon-to-text), 8px (inline gap), 12px (form gap), 16px (section gap), 20px (card padding), 24px (content vertical), 32px (content horizontal), 56px (nav height).

### Grid
Max content 1400px centered. Padding 32px h, 24px v. Card grid: 4 columns (1920px), 3 columns (1366px), gap 16px. Two-column: main flex + sidebar 280px, gap 24px.

### Icons
Phosphor Icons, 24px, regular weight. Always with text labels.

### Accessibility (WCAG 2.1 AA)
Contrast 4.5:1 (normal), 3:1 (large). Keyboard all elements. Focus 3px blue-500 + 2px offset. Screen reader: aria-labels, aria-live, proper semantics, lang="de". Color never sole differentiator. Touch 36×36px. prefers-reduced-motion. Skip link. Dialog focus trap.

### Visual Priority

Generated layouts must follow this visual emphasis hierarchy. Elements higher in the list should be visually dominant — larger, closer to the top-left, with stronger color contrast. Elements lower in the list should be visually recessive — smaller, lower on the page, with muted treatment.

| Priority | Element | Visual Treatment |
|---|---|---|
| **P1** | Current work — the task the user is actively working on or should work on next | Most prominent. Full-width, top of page. Strongest visual weight. |
| **P2** | Urgent deadlines — overdue cases, items due today | Red/amber visual indicators. Listed directly below current work. |
| **P3** | Waiting items — cases blocked on citizen or authority response | Neutral treatment with days-waiting counter. Listed after urgent items. |
| **P4** | Approvals — supervisor approval queue | Prominent for supervisor role. Same visual weight as P2. |
| **P5** | Decision Support recommendations — context-aware suggestions | Sidebar position (right column, 30% width). Secondary visual weight. |
| **P6** | Statistics — completed count, department KPIs, activity feed | Compact cards at page bottom. Small text. Muted colors. |
| **P7** | Administration — corpus health, audit, jobs, benchmarks | Hidden behind Verwaltung navigation. Never visible to normal users. |

**Application rule:** On every screen, ensure the user can identify the P1 element within 500ms of the page loading. If a P6 element (statistic) is competing visually with a P2 element (deadline), the statistic is wrong.

---

## 10. Interaction Principles

These principles govern every interaction. They are not visual design rules — they describe how the application should behave.

**Primary Object:** The Vorgang is the center of the application. Every feature exists to help the Sachbearbeiter move the Vorgang forward through its lifecycle.

**Decision Support:** Assists but never dominates. Sidebar tool, invoked by the user, providing suggestions not commands. The human reviews, edits, and decides.

**Professional Users:** Sachbearbeiter are trained domain experts. No onboarding wizards, no tutorial overlays, no simplified views. Efficiency over education.

**Information Density:** 50-row tables, 3-5 column cards, compact headers. White space is functional, not decorative. No hero layouts.

**Context Preservation:** Breadcrumbs, browser back button support, deep-linking. Opening a document from a case preserves the case context.

**Unsaved Work:** Auto-save drafts every 30s and on blur. "Gespeichert" indicator. Form data persists until submitted or discarded. Session expiry warns before redirect.

**Modal Dialogs:** Minimized. Use only for destructive actions, submission for approval, logout. Inline editing and expandable panels for everything else.

**Inline Editing:** Document metadata, case priority, assignment, checklist items editable in display context. Click to edit, Enter/blur to save, Escape to cancel.

**Next Action:** Always visible. Home screen shows suggested next task. Case workspace shows next phase button. Decision support shows next step.

**Keyboard:** Tab through all elements. Keyboard shortcuts for power users (accessible via ?). Routine cases processable without mouse.

**Accessibility:** WCAG 2.1 AA mandatory. Keyboard accessible, focus visible, screen reader support, color not sole differentiator, motion respectful.

**Progressive Disclosure:** Technical details (chunks, embeddings, vectors, confidence, execution traces) behind "Erweitert" toggles, ADMIN only.

**Feedback:** Every action produces feedback. Loading states, save confirmations, clear error messages with recovery actions. Success is subtle — no celebrations.

**Undo:** Where possible, support undo for last action within 10 seconds via undo toast. Destructive actions show confirmation dialogs.

---

## 11. Interaction Design

### Hover & Focus
Buttons darken 10% on hover. Ghost underlines. Table rows gray-50. Inputs blue-500 border + 3px blue-100 ring. Links underline on hover. Focus: 3px blue-500 outline + 2px offset.

### Keyboard Navigation
Tab/Shift+Tab, Enter/Space activate, Escape close, Arrow keys navigate selects. Focus order: logical (DOM = visual), left-to-right, top-to-bottom.

### Dialogs
Open: overlay fade in 150ms, content slide up 150ms ease-out. Close: X, Escape, overlay click. Focus trapped. Returns to trigger on close.

### Toasts
Slide in from right 200ms. Stack bottom-right, newest at bottom, 8px gap. Dismiss auto (5s/10s) or manual X. Fade out 300ms.

### Animations
150ms (fast: hover, focus), 200ms (normal: transitions), 300ms (slow: dismiss). Ease-out for entry. No auto-playing animations. prefers-reduced-motion: disable all.

### Loading
Page: 32px spinner <1s, skeleton >1s. Table: 5-row skeleton. Button: spinner replaces text. Upload: progress bar + %. Decision Support: progress bar + status + elapsed.

### Validation
Inline on blur: red border + error message. Submit: all fields, first error focused. Success: border returns, error removed. Disabled: gray-100 bg.

### Confirmations
Logout, delete, archive, reassign, submit, purge. Title + description + [Abbrechen] + [Bestätigen]. Danger actions use red button.

---

## 12. Sample Data

### Municipality
Stadt Essen, Rathaus Porscheplatz 1, 45127 Essen, Nordrhein-Westfalen.

### Employees

| Name | Email | Role | Department |
|---|---|---|---|
| Sabine Müller | sabine.mueller@stadt-essen.de | Sachbearbeiterin | Bauamt |
| Petra Wagner | petra.wagner@stadt-essen.de | Sachbearbeiterin | Vergabestelle |
| Michael Hoffmann | michael.hoffmann@stadt-essen.de | Sachbearbeiter | Personal |
| Claudia Bergmann | claudia.bergmann@stadt-essen.de | Sachbearbeiterin | Bauamt |
| Thomas Krüger | thomas.krueger@stadt-essen.de | Sachbearbeiter | Bürgeramt |
| Dr. Andreas Schmidt | andreas.schmidt@stadt-essen.de | Supervisor | Bauamt + Vergabe |
| Karin Schuster | karin.schuster@stadt-essen.de | Supervisorin | Personal + Bürgeramt |
| Markus Weber | markus.weber@stadt-essen.de | Fachbereichsadministrator | — |

### Citizens

| Name | Address | Cases |
|---|---|---|
| Thomas Becker | Musterstraße 12, 45127 Essen | BAU-2026-0147 |
| Familie Yilmaz | Lindenallee 78, 45133 Essen | BAU-2026-0143 |
| Anna Schreiber | Gartenstraße 7, 45128 Essen | BÜRG-2026-0146 |
| Karl-Heinz Bäumer | Bahnhofstraße 15, 45127 Essen | BÜRG-2026-0150 |
| Sarah Mertens | Rosenweg 4, 45134 Essen | BÜRG-2026-0145 |

### Cases

| # | Subject | Dept | Assignee | Status | Priority | Risk | Due |
|---|---|---|---|---|---|---|---|
| BAU-2026-0147 | Bauantrag Carport | Bauamt | S. Müller | Prüfung | 🔴 Hoch | 🟢 Gering | 22.07. |
| VERG-2026-0152 | IT-Hardware 4.200€ | Vergabe | P. Wagner | Prüfung | 🟡 Mittel | 🟢 Gering | 21.07. |
| BÜRG-2026-0119 | Widerspruch Abgaben | Bürgeramt | T. Krüger | Entsch.unt. | 🔴 Hoch | 🟡 Mittel | 24.07. |
| BAU-2026-0148 | Bauantrag Garage | Bauamt | C. Bergmann | Prüfung | 🟡 Mittel | 🟡 Mittel | 28.07. |
| PERS-2026-0151 | Reisekosten Schmidt | Personal | M. Hoffmann | Prüfung | 🟢 Niedrig | 🟢 Gering | 25.07. |

**Waiting cases:** BAU-2026-0143 (Bürger, 7d), BÜRG-2026-0150 (Bürger, 12d ⚠), BAU-2026-0141 (Behörde, 14d).

### Documents
BauO NRW 2024, AV zu §55 LHO, TVöD Entgelttabelle 2025, VOB/A 2024, BauGB 2024, LRKG NRW (⚠ Keine Embeddings), VwVfG NRW, Merkblatt Abstandsflächen NRW.

### Templates
Baugenehmigung, Verfahrensfreiheit, Vergabebescheid Direktauftrag, Vergabevermerk, Widerspruchsbescheid, Ablehnungsbescheid, Aktenvermerk.

### Case Numbering
Format: `FACH-YYYY-NNNN`. Prefixes: BAU, VERG, PERS, BÜRG, ALLG. Sequence zero-padded, resets annually.

---

## 13. Backend Integration

### Authentication
POST /api/auth/login, /register, /refresh, /logout; GET /api/auth/me. Token in memory. Silent refresh 5min before expiry.

### Workspaces
GET /api/workspaces, GET /api/workspaces/{id}, POST /api/workspaces, POST /api/workspaces/{id}/advance, GET /api/workspaces/{id}/documents, POST /api/workspaces/{id}/documents, GET /api/workspaces/{id}/timeline, POST /api/workspaces/{id}/timeline, GET /api/workspaces/{id}/steps.

### Decision Support
POST /api/decision (needs JSON wrapper — currently returns HTML). Request: `{question, workspace}`. Response: `{answer, confidence, sources, executionTrace}`.

### Search
POST /api/search (query, mode, page, size). GET /api/search/chunks.

### Documents
GET /api/documents, GET /api/documents/{id}, GET /api/documents/{id}/content, POST /api/documents, PATCH /api/documents/{id}/metadata, POST /api/documents/{id}/versions, POST /api/documents/{id}/archive, DELETE /api/documents/{id}, POST /api/documents/{id}/reindex, DELETE /api/documents/{id}/purge, POST /api/documents/batch-import.

### Upload
POST /documents/upload (multipart), POST /documents/batch (multipart).

### Ingestion
POST /api/document-ingestion-jobs/documents/{id}, GET /api/document-ingestion-jobs, POST /api/ingestion/preview-metadata.

### Corpus
GET /admin/corpus-health (needs JSON), GET /admin/corpus-inventory (needs JSON), POST /admin/corpus-inventory/generate, POST /admin/corpus-release-report/generate.

### Audit & Providers
GET /api/audit/events, GET /api/providers/status, GET /api/providers/models.

### Developer
GET /dev/perf, GET /dev/knowledge/salary, /travel, /thresholds, /stats.

### Error Format
All /api/** errors: `{timestamp, status, error, message, stacktrace}`. Auth header: `Authorization: Bearer <token>`.

### P1 Missing JSON Endpoints
POST /api/decision, GET /api/corpus/health, GET /api/corpus/inventory — backend logic exists, only controller response format needs changing.

---

## 14. UI Generation Guidance

### What to Generate
A complete React application (Next.js App Router recommended) for German municipal case management. Backend is Spring Boot REST API with JWT authentication — all endpoints return JSON.

### Application Character
Professional enterprise software. High information density. Desktop-first (1280-1920px). German language throughout. Government visual style — conservative blue-gray, no gradients, no glassmorphism, no shadows on cards. SAP Fiori quality, Microsoft Outlook usability.

### Visual Targets
Microsoft 365 + SAP Fiori + Jira Service Management. NOT: ChatGPT, Notion, marketing landing page, startup dashboard, mobile-first consumer app.

### Key Design Rules
- Decision Support is a sidebar tool, never the centerpiece
- Home screen opens with workload, not a prompt
- "KI" never appears in user-facing labels
- Technical details behind "Erweitert"
- Tables are primary UI pattern
- Cards have NO shadows
- No hero sections, decorative whitespace, or oversized typography
- WCAG 2.1 AA throughout

### Generation Order
1. Login 2. Home Dashboard 3. Case Workspace 4. Wissen 5. Dokumente 6. Verwaltung 7. Error Screens 8. Empty States

### Expected Result
A production-ready enterprise UI that a German municipal employee could use for their daily work. Reliability, precision, efficiency — like a well-designed government form, but digital.

---

## 15. Design Constraints

These constraints override any default design choices made by the UI generator. If a constraint conflicts with a default Stitch behavior, the constraint wins.

### Enterprise Software

This application is enterprise productivity software. It is NOT: a chatbot, a consumer application, a mobile app, a marketing website, a SaaS landing page, or an analytics dashboard.

### Information Density

Prefer dense layouts. Show many items simultaneously. Tables are preferred over large cards. Avoid unnecessary whitespace. Do not create oversized headers. Do not create oversized buttons. The user should never have to scroll to see information that fits on one screen.

### Desktop First

Assume permanent desktop usage at 1280-1920px. Use available horizontal space. Three-column layouts are encouraged where appropriate (case workspace). Avoid mobile-first design patterns such as hamburger menus as the primary navigation, single-column layouts on desktop, touch-optimized spacing, or hidden navigation that requires a tap to reveal.

### Professional Government Software

The application should resemble software used daily by professional municipal employees. Visual inspiration: SAP Fiori, Microsoft Outlook, Jira Service Management, Atlassian Administration. Avoid inspiration from: ChatGPT, Notion, Linear, Slack, Discord, or startup dashboards.

### Decision Support Positioning

Decision Support is secondary. The employee's work queue is always the primary visual focus. The Decision Support panel occupies approximately 25-30% of the available width when visible (right column in case workspace, sidebar on home screen). It never expands to full width. It never appears as a modal overlay.

### Search Positioning

Search is a work tool accessed through the Wissen navigation item. Search is not the application's home screen. There is no persistent global search bar in the top navigation.

### Performance Assumptions

Assume thousands of cases, thousands of documents, and hundreds of concurrent users. Design components for scalability: virtualized tables for large lists, paginated API calls (never load all records), debounced search inputs, optimistic UI updates where safe, and skeleton loading states for all data-dependent components.

### Visual Style — Prohibitions

Do not use: glassmorphism, neumorphism, floating cards with box-shadows, decorative gradients, decorative illustrations, mascot graphics, animated backgrounds, AI sparkle icons, or any visual treatment associated with consumer AI products. Cards have 1px solid borders and no shadows. The aesthetic is flat, clean, and professional — like a well-designed government form.

### Final Goal

Generate software that a German municipality could realistically deploy to hundreds of employees with minimal retraining. A Sachbearbeiter with 20 years of experience in public administration should recognize this as a professional tool within seconds of seeing it.
