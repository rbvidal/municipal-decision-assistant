# UX Baseline — Kommunale Entscheidungsplattform

**Version:** 1.0
**Status:** Approved & Frozen
**Date:** 15 July 2026

This document is the single source of truth for the user experience of the Kommunale Entscheidungsplattform. It freezes all UX architecture decisions. Every future frontend implementation — React, HTML/CSS, mobile web, or any other technology — must conform to this specification. No deviations are permitted without a formal UX change request.

---

## 1. Product Identity

### What the Product Is

The Kommunale Entscheidungsplattform (Municipal Decision Platform) is enterprise case-management software for German public administration. It helps Sachbearbeiter (case workers) process administrative cases — building permits, procurement requests, personnel actions, citizen inquiries — from inbox to archive.

### Who Uses It

| Role | Description |
|---|---|
| Sachbearbeiter | Case worker. Processes 10-30 cases per day. Primary user. |
| Supervisor (Sachgebietsleiter) | Reviews and approves decisions. Manages team workload. |
| Fachbereichsadministrator | Uploads and maintains document collections. Monitors indexing. |
| Systemadministrator | Manages infrastructure, users, roles, and system configuration. |

All users work on desktop workstations (1280-1920px) in municipal offices. They are domain experts in public administration, not software engineers.

### What Problem It Solves

Today, municipal employees work with paper binders of regulations, shared network drives of PDFs, email threads asking colleagues which rule applies, Word templates copied and pasted, and mental checklists of procedure steps. The platform digitizes all of this into a single, searchable workspace where the employee can find regulations, process cases, draft decisions, and consult decision support — all without leaving the application.

### Operational Workbench Philosophy

The application is an operational workbench, not a dashboard and not a chatbot. The employee opens it to continue their work. Every screen must answer the question: "What should I work on next?" Work queues, deadlines, and waiting items have the highest visual priority. Statistics and analytics are secondary. Decision support is an assistant, never the focus.

### Desktop-First Philosophy

The application targets 1280-1920px desktop screens with high information density. Tables display 50 rows by default. Cards use 3-5 columns. White space is functional, not decorative. Phone and tablet are not supported in v1.0. Laptop (1024-1279px) supports reduced-density read-only views.

### Enterprise Software Philosophy

The application should feel like software that has evolved over many years inside a German municipality. It is predictable, stable, conservative, and familiar. It avoids experimental UI, trendy UI, and decorative UI. Visual inspiration: SAP Fiori, Microsoft Outlook, Jira Service Management. Explicitly not: ChatGPT, Notion, Linear, consumer apps, marketing sites.

### Decision Support Is Secondary

Decision Support (Entscheidungsunterstützung) is a sidebar tool occupying approximately 25-30% of the available width. It is invoked by the user, provides suggestions not commands, and always operates on the current case context. It never appears as a global assistant or a full-screen page. The word "KI" never appears in any user-facing label.

### Case-Centric Work

The Vorgang (case) is the primary object of the application. Every feature — document viewing, regulation search, decision support — exists to help the Sachbearbeiter move the Vorgang forward through its lifecycle. The user always knows which case they are working on because the case header is persistently visible inside the case workspace.

---

## 2. Navigation Hierarchy

### Level 1 — Application Modules (Global)

These modules operate across the entire municipality. They are entered from the persistent top navigation bar. They have no active case unless navigated from one.

| Module | Route | Purpose |
|---|---|---|
| Startseite | `/home` | Operational workbench. Task queue, deadlines, waiting items, suggested next task. |
| Meine Arbeit | `/work` | Case list. Inbox, active cases, waiting, approvals, archive. |
| Wissen | `/knowledge` | Global knowledge repository. Regulations, procedures, templates, FAQs, search. |
| Dokumentenverwaltung | `/documents` | Municipality-wide document management. Upload, versioning, indexing, archive. |
| Verwaltung | `/admin` | Administration. Corpus health, audit, jobs, benchmarks, users, roles, settings. ADMIN only. |

### Level 2 — Workspace Context

When a Vorgang is opened from Meine Arbeit, the user enters a **Contextual Case Workspace.** The global module navigation remains visible, but a persistent case header is added below the breadcrumb.

**Case header (always visible inside a workspace):**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BAU-2026-0147  Neubau Carport  Thomas Becker                               │
│  Bearbeiter: Sabine Müller  |  Status: Prüfung  |  Fällig: Heute  |  🔴 Hoch │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Level 3 — Context Tabs (Case Workspace Only)

Inside the case workspace, tabs provide contextual views of the current Vorgang. These are NOT application pages — switching tabs never leaves the current case.

| Tab | Content |
|---|---|
| Übersicht | Case summary, metadata, current phase, risk indicator, next action, decision support panel |
| Checkliste | Dynamic checklist auto-populated by case type. User-editable. |
| Dokumente | Documents belonging ONLY to this case. Upload, preview, download, compare versions. |
| Interne Notizen | Internal notes for this case. Author + timestamp. Never sent to citizens. |
| Aktivität | Activity timeline for this case. All actions by Bürger, Sachbearbeiter, Supervisor, System. |
| Entscheidungsunterstützung | Decision support panel contextual to this case. |

### Global vs. Contextual — Permanent Distinction

| Global Modules | Contextual Case Workspace |
|---|---|
| Operate across entire municipality | Operate on one specific Vorgang |
| Show repositories, searches, filters, statistics | Show case metadata, documents, notes, activity |
| No persistent case header | Persistent case header always visible |
| Wissen is a global knowledge browser | Wissen opened from a case preserves case context |
| Dokumentenverwaltung manages ALL documents | Case Dokumente tab shows only this case's documents |

The user must instantly understand which mode they are in. This distinction is a permanent UX principle.

---

## 3. Information Architecture

### Core Business Objects

**Vorgang (Case):** The primary object. Represents one administrative procedure. Has a lifecycle (Posteingang → Prüfung → Entscheidungsunterstützung → Entwurf → Genehmigung → Versand → Archiv), an assignee, a citizen, documents, a checklist, internal notes, an activity timeline, and a risk indicator. Identified by `FACH-YYYY-NNNN` (e.g., BAU-2026-0147). Can enter waiting states: Wartet auf Bürger, Wartet auf Behörde, Wartet auf Kollegen.

**Aufgabe (Task):** A unit of work generated by a Vorgang. Every Vorgang produces multiple Aufgaben through its lifecycle (Antrag prüfen, Unterlagen anfordern, Rechtliche Prüfung, Entwurf erstellen, Genehmigung einholen, etc.). Each Aufgabe has an owner, due date, status, priority, and related Vorgang. The Startseite is fundamentally a task queue, not a case list.

**Dokument (Document):** A managed file — uploaded PDF, citizen submission, scanned document, generated decision, attachment. Has metadata, versions, indexing status. Belongs to zero or more Vorgänge and one Fachbereich. Managed through Dokumentenverwaltung (global) or the case Dokumente tab (contextual).

**Bürger (Citizen):** A person or organization interacting with the municipality. Has contact information and one or more Vorgänge.

**Benutzer (User/Employee):** A municipal employee. Has a role (Sachbearbeiter, Supervisor, Fachbereichsadministrator, Systemadministrator), belongs to a Fachbereich, and is assigned to Vorgänge.

**Vorschrift (Regulation):** A type of Wissen — a law, ordinance, decree, or directive with legal authority. The primary source for decision support. Referenced by decisions and cited by other regulations. Contains individually searchable sections.

**Vorlage (Template):** A pre-written document skeleton (Bescheid, Vermerk, Schreiben) used during the Entwurf phase. Belongs to a category (Baubescheid, Vergabebescheid, Widerspruchsbescheid, etc.).

**Checkliste (Checklist):** A dynamic list of items for a specific case type. Auto-populated, user-editable. Items can be mandatory or optional. Completed items record timestamp and user.

**Knowledge Package:** A non-regulation Wissenseintrag — Verfahren (procedure description), FAQ, or manual. Belongs to a Fachbereich. May reference Vorschriften.

**Decision Support Result:** The output of analysis for a specific Vorgang. Contains: Zusammenfassung, Anwendbare Vorschriften (with citations), Fehlende Informationen, Vorgeschlagene Checkliste, Vorgeschlagene nächste Aktion, Unterstützende Dokumente. Technical details (confidence, execution trace) are in Erweitert.

### Key Distinction: Wissen ≠ Dokumente

Wissen (Knowledge) is consulted — regulations, procedures, templates, FAQs, checklists. It is reference material accessed through the Wissen module. Dokumente (Documents) are managed — uploaded files, submissions, generated decisions. They are managed through Dokumentenverwaltung or the case Dokumente tab. A Vorschrift originates from a Dokument (the uploaded PDF of the law) but once indexed it is accessed through Wissen. These are different application areas with different UI patterns.

---

## 4. Screen Inventory

| Screen | Purpose | Primary User | Type |
|---|---|---|---|
| Login | Authenticate users. Email + password + "Angemeldet bleiben". | Unauthenticated | Global |
| Startseite | Operational workbench. Task queue, deadlines, waiting items, suggested next task, decision support sidebar. | Sachbearbeiter, Supervisor | Global |
| Meine Arbeit — Posteingang | New unassigned cases. Assign and open. | Sachbearbeiter | Global |
| Meine Arbeit — Offene Vorgänge | Active cases assigned to the user. | Sachbearbeiter | Global |
| Meine Arbeit — Warten | Cases waiting on citizen, authority, or colleague. | Sachbearbeiter | Global |
| Meine Arbeit — Genehmigung | Cases awaiting supervisor approval. | Supervisor | Global |
| Meine Arbeit — Archiv | Closed and archived cases. Searchable. Wiedervorlage. | All users | Global |
| Case Workspace — Übersicht | Case summary, metadata, phase, risk, next action, decision support panel. | Sachbearbeiter | Contextual |
| Case Workspace — Checkliste | Dynamic checklist for this case. | Sachbearbeiter | Contextual |
| Case Workspace — Dokumente | Documents belonging only to this case. Upload, preview, download. | Sachbearbeiter | Contextual |
| Case Workspace — Interne Notizen | Internal notes for this case. | Sachbearbeiter, Supervisor | Contextual |
| Case Workspace — Aktivität | Activity timeline for this case. | Sachbearbeiter, Supervisor | Contextual |
| Case Workspace — Entscheidungsunterstützung | Decision support panel contextual to this case. | Sachbearbeiter | Contextual |
| Case Workspace — Entwurf | Draft decision editor. Template selector. Save, preview, submit. | Sachbearbeiter | Contextual |
| Case Workspace — Versand | Generated reply + cover letter. Mark sent, print, archive. | Sachbearbeiter | Contextual |
| Wissen — Alles | Unified search across all content types. Results grouped by category. | All users | Global |
| Wissen — Vorschriften | Regulation browser. Fachbereich tree + detail panel. | All users | Global |
| Wissen — Verfahren | Structured procedure descriptions. | All users | Global |
| Wissen — Vorlagen | Template library by category. Preview and apply to case. | All users | Global |
| Wissen — FAQs | Expandable Q&A by department. | All users | Global |
| Dokumentenverwaltung — Alle Dokumente | Municipality-wide document list. Filterable, sortable table. | All users | Global |
| Dokumentenverwaltung — Hochladen | Document upload with metadata form. Progress indication. | Fachbereichsadministrator | Global |
| Dokumentenverwaltung — Index-Status | Indexing health summary. Warnings and actions. | Fachbereichsadministrator | Global |
| Dokumentenverwaltung — Detail | Document metadata, versions, content, comparison. | All users | Global |
| Verwaltung — Übersicht | Admin tool grid. Links to all administration functions. | Admin | Global |
| Verwaltung — Korpus-Status | Corpus health dashboard. Stat cards, warnings, document table. | Admin | Global |
| Verwaltung — Audit | Filterable audit event log. | Admin | Global |
| Verwaltung — Aufträge | Ingestion job monitoring. | Admin | Global |
| Verwaltung — Benchmarks | Retrieval quality metrics. | Admin | Global |
| Verwaltung — Entwickler | Performance dashboard and knowledge tables. | Admin | Global |
| New Case Wizard | Step-by-step case creation with document attachment. | Sachbearbeiter | Global |
| Supervisor Approval Workspace | Side-by-side comparison. Auto-verification. Approve, return, reject. | Supervisor | Contextual |
| User & Role Management | User administration, role assignment, permissions. | Admin | Global |
| Error Screens (401, 403, 404, 500) | Error display with recovery actions. | All users | Global |

---

## 5. Component Inventory

Each component is used consistently across all screens. Never redesign a component between screens.

| Component | Purpose | Used In |
|---|---|---|
| Application Shell | Persistent top bar, sub-nav, breadcrumb, main content area, toast layer, dialog layer | Every screen |
| Navigation Bar | 5 global module links (56px, white). Active item: blue-700 + 3px bottom border. | Every screen |
| Sub-Navigation Tabs | Second row (44px, gray-50). Tabs with count badges. | Meine Arbeit, Wissen, Dokumentenverwaltung, Verwaltung, Case Workspace |
| Case Header | Persistent bar showing case number, subject, citizen, assignee, status, deadline, risk. | All Case Workspace tabs |
| Breadcrumb | 12px, gray-500. Chevron separators. Path: Startseite > Meine Arbeit > BAU-2026-0147 > Tab. | Every screen except top-level |
| Stat Card | Large number (28px bold) + small label (12px uppercase). White, 1px gray-300 border, 8px radius, no shadow. | Startseite, Korpus-Status |
| Information Card | Icon + title + description + action link. | Verwaltung Übersicht |
| Action Card | Clickable card. Hover: border-color blue-300. | Verwaltung Übersicht |
| Data Table | 40px row height, sticky header, alternating rows, 50 rows default, sortable columns, pagination. | Meine Arbeit, Dokumentenverwaltung, Wissen results, Audit, Aufträge, Archiv |
| Form | Labels above fields (14px semibold), inputs 40px height, 8px radius, focus ring blue-500. | Login, Upload, Metadata edit, New Case Wizard |
| Button | 36px height default (32px small, 44px large). Primary (blue-700), Secondary (white+border), Danger (red-700), Ghost (transparent). | Every screen |
| Dialog | Overlay black 50%, white card centered, max 520px, focus trap, Escape closes. | Confirmations, logout, session expiry |
| Toast | Bottom-right, 380px, auto-dismiss 5-10s, slide-in animation. | Success, warning, error, info feedback |
| Notification Bell | 24px icon with badge. Dropdown 320px, unread ●, read ○. | Top bar (every screen) |
| Badge | Inline-flex, 12px text, 4px radius. Green/Amber/Red/Blue/Gray. | Status, priority, risk, counts |
| Status Dot | 8px circle. Green (active), Amber (warning), Red (error), Gray (inactive). | Tables, case header |
| Risk Indicator | Colored dot + text label (Gering/Mittel/Hoch). Computed from deadline, complexity, missing docs, waiting duration. | Case header, case lists, Startseite |
| Priority Indicator | Colored dot + text label (Hoch/Mittel/Niedrig). | Case lists, Startseite |
| Confidence Bar | 6px height, 120px width, segmented fill. Screen-reader text alternative. | Decision Support Panel (Erweitert) |
| Progress Indicator | 6px height, blue-500 fill, gray-200 track, percentage label. | Upload, decision support analysis, ingestion |
| Skeleton Loading | Gray-200 animated pulse. 5 rows for tables, blocks for cards. | All data-dependent components |
| Spinner | 16px (buttons), 20px (inline), 32px (page). Border spinner animation. | Buttons, page loads |
| Decision Support Panel | 320px sidebar. 8 sections: question, summary, regulations, missing info, checklist, next action, supporting docs, Erweitert. | Case Workspace (Übersicht tab), Startseite (sidebar) |
| Search Bar | Full-width input with submit button. Filters below. | Wissen, Dokumentenverwaltung |
| Checklist Component | Ordered items with checkboxes. Auto-populated, user-editable. Mandatory items marked *. | Case Workspace (Checkliste tab) |
| Activity Timeline | Vertical list with left border. Colored dots: blue (Sachbearbeiter), purple (Supervisor), green (Bürger), gray (System). | Case Workspace (Aktivität tab) |
| Document Viewer | Metadata header + version tabs + full text with section anchors. Collapsible Erweitert section. | Dokumentenverwaltung Detail |
| Version Comparison | Side-by-side diff. Auto-detected change summary. | Dokumentenverwaltung Detail |
| Workflow Stepper | Horizontal phase indicator with ●○○ dots. Current phase highlighted. | Case Workspace (Übersicht tab) |
| Wizard | Step-by-step form with progress indicator, Back/Next/Finish buttons. | New Case Wizard |
| Tab Bar | Horizontal tabs with active indicator. Case Workspace uses these for contextual views. | Case Workspace, Meine Arbeit, Wissen, Dokumentenverwaltung, Verwaltung |

---

## 6. Interaction Principles

### Context Preservation

Never lose the current case context. The case header remains visible at all times inside the case workspace. When Wissen or a document is opened from a case, a "← Zurück zum Vorgang" action is always available. The breadcrumb shows the full path back.

### Decision Support Is Always Contextual

Decision Support operates only on the current case. It never appears as a global assistant. Its recommendations are generated from: the current case, its documents, retrieved regulations, and structured knowledge. There is no general-purpose chat interface.

### Documents Inside a Case

The case Dokumente tab shows ONLY documents belonging to the current case. It never opens the global Dokumentenverwaltung. Actions: Upload, Preview, Download, Compare Versions. No municipality-wide search. No documents from other cases.

### Knowledge Opened from a Case

Knowledge (Wissen) is global but preserves context when opened from a case. The case header remains visible. The user consults regulations and returns via "← Zurück zum Vorgang."

### Progressive Disclosure

Technical details are hidden behind "Erweitert" (Advanced) toggles: chunk counts, embedding dimensions, Qdrant vector status, confidence scores, execution traces, model names. These toggles are only visible to ADMIN users or on Verwaltung screens.

### Optimistic Updates

Use optimistic UI updates for: checklist item toggles, internal note saves, metadata field changes, and assignment changes. Revert on server error with a toast notification. Do not use optimistic updates for: document upload, decision submission, approval actions, or deletion.

### Autosave

Draft decisions auto-save every 30 seconds and on blur. Indicator: "Gespeichert" / "Speichern...". Internal notes save on Enter or blur. Checklist state saves immediately on toggle. Form data persists in browser until submitted or discarded.

### Keyboard Accessibility

All interactive elements are keyboard-accessible. Tab order follows visual order (left-to-right, top-to-bottom). Common actions have keyboard shortcuts (accessible via ? key). Power users should be able to process routine cases without a mouse.

### Breadcrumb Behavior

Breadcrumbs show the navigation path, not content hierarchy. Cases are always children of Meine Arbeit: `Startseite > Meine Arbeit > BAU-2026-0147 > Dokumente`. Never: `Startseite > Dokumente > BAU-2026-0147`. Each segment is a clickable link except the last.

### Loading States

Page loads: 32px centered spinner for <1 second, skeleton for longer loads. Table loads: 5-row skeleton matching column layout. Button loads: spinner replaces text, width preserved. Upload: progress bar with percentage. Decision Support: progress bar + status text + elapsed counter + Abbrechen button.

### Error States

401: "Nicht autorisiert" → Zur Anmeldung. 403: "Zugriff verweigert" → Zurück zur Startseite. 404: "Seite nicht gefunden" → Zurück + Suche. 500: "Interner Fehler" with error ID → Neu laden + Zur Startseite. Backend unavailable: "Dienst nicht erreichbar" → Erneut versuchen. Decision Support unavailable: fallback to manual search.

### Confirmation Dialogs

Required for: logout, delete document, archive case, reassign, submit for approval, purge document. Format: title + description + [Abbrechen] + [Bestätigen]. Danger actions use red confirm button. No confirmation for: saving drafts, adding notes, toggling checklist items.

### Undo

Supported for: deleting a note, removing a checklist item, changing metadata. Toast with "Rückgängig" link shown for 10 seconds. Destructive actions (purge, archive, submit) use confirmation dialogs instead.

---

## 7. Visual Principles

### Desktop First

Target 1280-1920px. Maximum content width 1400px centered. Three-column layouts where appropriate. No mobile-first patterns. Phone not supported in v1.0.

### Information Density

Tables show 50 rows default. Cards use 3-5 columns at 1920px. Compact headers. Inline editing preferred. White space is functional, not decorative. No hero layouts. No oversized typography. No single-column layouts wider than 720px.

### Professional Government Software

The application should look like software used daily by professional municipal employees. Visual inspiration: SAP Fiori, Microsoft Outlook, Jira Service Management. Conservative blue-gray palette. No gradients, no glassmorphism, no decorative illustrations, no mascot graphics, no animated backgrounds.

### Design Prohibitions

Never use: glassmorphism, neumorphism, box-shadows on cards (cards use 1px solid borders), decorative gradients, AI sparkle icons, purple AI aesthetics, floating action buttons, pull-to-refresh, swipe gestures, infinite scroll, emoji reactions, chat bubbles, voice input, or oversized consumer-app typography.

### Component Consistency

Every screen uses the same component library. Never redesign a component between screens. A table on Dokumentenverwaltung is the same table component as on Meine Arbeit. One design language throughout the entire application.

### Visual Hierarchy

P1 (Current Work) receives strongest visual weight — top of page, largest, most prominent. P2 (Urgent Deadlines) next. P3-P7 progressively smaller, lower, more muted. P1 must be identifiable within 500ms of page load.

### Accessibility

WCAG 2.1 AA mandatory. All text meets contrast ratios. Keyboard navigation for all elements. Focus indicators always visible (2px blue-500 outline, 2px offset). Screen reader support (aria-labels, aria-live, proper semantics). Color never the sole differentiator. Minimum 36×36px touch targets.

---

## 8. Terminology

This terminology is binding. All user-facing text, labels, buttons, errors, and documentation must comply.

| Always Use | Never Use | Context |
|---|---|---|
| Entscheidungsunterstützung | KI-Assistent, AI Assistant, Chatbot | The decision support feature |
| Vorgang | Case, Ticket, Request, Task (when referring to the case) | The primary case object |
| Aufgabe | Task, To-do | A unit of work within a Vorgang |
| Startseite | Dashboard, Homepage | The operational workbench |
| Meine Arbeit | My Work, Inbox, Queue | The case workspace entry point |
| Wissen | Knowledge Base, Library, Search | The knowledge repository |
| Dokumentenverwaltung | Dokumente, Files, Repository | The global document management module |
| Verwaltung | Administration, Admin, Settings | The administration area |
| Posteingang | Inbox | New case queue |
| Sachbearbeiter | Case Worker, Agent, Operator | Primary user role |
| Fachbereich | Department, Team, Group | Organizational unit |
| Bürger | Citizen, Customer, Client | Person interacting with municipality |
| Antragsteller | Applicant, Requester | Person who submitted an application |
| Bescheid | Decision, Notice, Ruling | Official decision document |
| Vorschrift | Regulation, Rule, Law | Legal text with authority |
| Vorlage | Template, Boilerplate | Pre-written document skeleton |
| Aktenzeichen | Reference Number, ID | Official file reference |
| Wiedervorlage | Follow-up, Reminder | Case scheduled for future review |
| Genehmigung | Approval, Sign-off | Supervisor review and approval |
| Stellungnahme | Opinion, Statement, Response | Formal response from authority |
| Frist | Deadline, Due Date | When something must be completed |
| Erweitert | Advanced, Technical Details | Expandable section for admin info |
| Verfügbarkeit | Uptime, Status | Service health |
| Zusammenfassung | Summary, TL;DR | AI-generated case summary |
| Verlässlichkeit | Confidence, Accuracy | Trustworthiness indicator (in Erweitert) |
| Auftrag | Job, Task (system) | Ingestion/processing job |
| Korpus | Corpus, Collection | Document collection |
| Benutzer | User, Account | System user |
| Rolle | Role, Permission | Access control role |
| Fachbereichsadministrator | Department Admin | Document manager role |

---

## 9. Naming Conventions

### Case IDs

Format: `FACH-YYYY-NNNN`

| Prefix | Fachbereich | Example |
|---|---|---|
| BAU | Bauamt | BAU-2026-0147 |
| VERG | Vergabestelle | VERG-2026-0152 |
| PERS | Personal | PERS-2026-0151 |
| BÜRG | Bürgeramt | BÜRG-2026-0119 |
| ALLG | Allgemeine Verwaltung | ALLG-2026-0154 |

Sequence number is zero-padded to 4 digits and resets annually.

### Document Titles

Format: `[Name] [Year]` or `[Abbreviation] [Year]`. Examples: "BauO NRW 2024", "AV zu §55 LHO", "TVöD Entgelttabelle 2025".

### Module Names

Always German, always substantive: "Startseite" not "Home", "Meine Arbeit" not "My Work", "Dokumentenverwaltung" not "Dokumente" (when referring to the global module).

### Screen Names

Match the navigation label. The Wissen search screen is "Wissen > Alles", not "Search Page". The case detail is "Vorgang BAU-2026-0147", not "Case Detail".

### Button Labels

Action-oriented, concise, German. "Vorgang öffnen" not "Open". "Zur Genehmigung einreichen" not "Submit". "Entwurf speichern" not "Save Draft". Use verbs. Avoid generic labels.

### Dialog Titles

Describe the action being confirmed. "Vorgang archivieren?" not "Sind Sie sicher?". "Dokument löschen?" not "Bestätigen".

### Status Names

Use adjectives: "Offen", "In Bearbeitung", "Abgeschlossen", "Überfällig", "Archiviert". Not nouns: "Open", "Processing", "Done".

### Badge Names

Match the status terminology. A badge showing "Aktiv" uses the same word as the status filter "Aktiv".

### Workflow Phases

Posteingang, Prüfung, Entscheidungsunterstützung, Entwurf, Genehmigung, Versand, Archiv. Always this sequence. Always these exact terms.

---

## 10. UX Constraints

These are binding implementation rules. No frontend may ship without complying.

1. Every page uses the same Application Shell (top bar, breadcrumb, main content area, toast layer, dialog layer).
2. Never redesign components between screens. One component library, one design language.
3. Never invent new spacing. Use the defined spacing scale (4px base: 4, 8, 12, 16, 20, 24, 32, 40, 56px).
4. Never create a second design language. No dark mode, no alternate themes, no per-department branding.
5. Never change typography. Inter for UI, JetBrains Mono for code/IDs. Defined type scale only.
6. Never introduce another navigation hierarchy. The 3-level hierarchy (Module → Workspace → Tab) is fixed.
7. Decision Support always occupies approximately 25-30% of the workspace width. Never full-width. Never a modal. Never a standalone page.
8. Current work always receives the highest visual priority (P1). The user must identify the next task within 500ms.
9. The case header is always visible inside a case workspace. Never hide it. Never collapse it.
10. Case documents never open the global Dokumentenverwaltung. They are separate components with separate data sources.
11. Knowledge opened from a case always preserves the case context with a visible "← Zurück zum Vorgang" action.
12. Never use "KI", "AI", or "künstliche Intelligenz" in any user-facing label, button, error message, or notification.
13. Technical implementation details are always behind "Erweitert" toggles, visible only to ADMIN users.
14. All text is German. The only exception is the DE/EN language toggle in the user menu.
15. WCAG 2.1 AA compliance is mandatory for every screen.

---

## 11. Frontend Implementation Guidance

### Recommended Technology

React with Next.js App Router. The backend is a Spring Boot REST API with JWT authentication. All endpoints return JSON. Three endpoints (POST /api/decision, GET /api/corpus/health, GET /api/corpus/inventory) need JSON wrappers — the backend service logic already exists.

### Component Hierarchy

```
<AppShell>
  <NavigationBar />            {/* Persistent, 56px */}
  <SubNavigation />            {/* Conditional, 44px */}
  <Breadcrumb />               {/* Persistent, 28px */}
  <CaseHeader />               {/* Conditional — only in Case Workspace */}
  <MainContent>
    <PrimaryContent />         {/* Flexible width */}
    <Sidebar />                {/* Optional, 280-320px, collapsible */}
  </MainContent>
  <ToastContainer />           {/* Fixed, bottom-right */}
  <DialogOverlay />            {/* Conditional, portal */}
</AppShell>
```

### Layout Hierarchy

Every page follows: AppShell → MainContent → PageComponent → SectionComponent → AtomicComponents (Table, Card, Form, Button).

### State Management

- Server state: React Query or SWR for all API data with caching and refetch
- UI state: React Context for current case, current user, navigation state, sidebar visibility
- Form state: React Hook Form for complex forms, local state for simple inputs
- Notification state: Client-side store, no persistence needed in v1.0

### Responsive Behavior

Desktop (1280-1920px): Full layout. Desktop FHD (1920px+): Full layout, maximum density. Laptop (1024-1279px): Full navigation, reduced tables (25 rows), read-only forms. Tablet (<1024px): Hamburger menu, view-only. Phone: Not supported.

### Accessibility Implementation

Use semantic HTML (`<nav>`, `<main>`, `<table>`, `<form>`, `<dialog>`). Associate labels with inputs via `htmlFor`/`id`. Add `aria-label` to icon-only buttons. Use `aria-live="polite"` for dynamic content. Set `lang="de"` on `<html>`. Implement a skip-link as the first focusable element. Test with keyboard navigation and screen readers.

### Component Reuse

Every component in the Component Inventory (Section 5) must be implemented exactly once and imported wherever used. Never create a local variant of a global component. If a screen needs different behavior, extend the component via props — never copy-paste and modify.

---

## 12. Definition of Done

A frontend implementation complies with this UX baseline when:

1. The navigation hierarchy is preserved — 5 global modules, case workspace with 6 contextual tabs.
2. The design system is preserved — all colors, typography, spacing, and component styles match the specification.
3. The terminology is preserved — all labels, buttons, and messages use the official dictionary (Section 8).
4. The component library is reused — no duplicated or locally modified components.
5. No visual redesign has occurred — the application looks like the approved Stitch-generated screens.
6. Context is preserved — the case header is always visible in the case workspace, breadcrumbs reflect navigation paths.
7. The application is desktop-first — dense tables, compact layouts, no mobile patterns.
8. Information density is maintained — 50-row tables, 3-5 column cards, no hero layouts.
9. Decision Support occupies 25-30% width, never dominates, never appears as a global assistant.
10. "KI" never appears in any user-facing label.
11. WCAG 2.1 AA compliance is verified.
12. All German text is reviewed by a native speaker for professional municipal tone.

---

**END OF UX BASELINE.** This document supersedes all previous UX documentation. Any future change to the information architecture, navigation hierarchy, terminology, visual principles, or interaction rules requires a formal amendment to this document.
