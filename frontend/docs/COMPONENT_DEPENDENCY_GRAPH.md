# Component Dependency Graph — Kommunale Entscheidungsplattform

**Version:** 1.0
**Derived from:** Analysis of 10 Stitch imports + FRONTEND_ARCHITECTURE.md
**Date:** 15 July 2026

This document maps every component dependency in the frontend. It describes how each page is assembled from layouts and reusable components, identifies hub components, leaf components, coupling risks, and recommends an extraction order.

---

## 1. Page Dependency Trees

### 1.1 Login

```
LoginPage
└── AuthLayout
    ├── MunicipalityLogo          (static image)
    ├── LanguageSelector          (DE/EN toggle, bottom)
    ├── LoginForm
    │   ├── FormField             (email)
    │   │   └── TextInput
    │   ├── FormField             (password)
    │   │   └── TextInput         (type=password, with EyeToggle)
    │   ├── Checkbox              ("Angemeldet bleiben")
    │   ├── Button                (primary, "Anmelden")
    │   └── LinkButton            (ghost, "Passwort vergessen?")
    ├── SecurityNotice            (info banner, conditional)
    └── Footer                    (version, legal)
```

```
ForgotPasswordPage
└── AuthLayout
    ├── MunicipalityLogo
    ├── LanguageSelector
    ├── ForgotPasswordForm
    │   ├── FormField
    │   │   └── TextInput         (email)
    │   ├── Button                (primary, "Link senden")
    │   └── LinkButton            (ghost, "← Zurück zur Anmeldung")
    └── Footer
```

```
ResetPasswordPage / FirstLoginPage
└── AuthLayout
    ├── MunicipalityLogo
    ├── LanguageSelector
    ├── ResetPasswordForm
    │   ├── FormField
    │   │   └── TextInput         (new password, with EyeToggle)
    │   ├── FormField
    │   │   └── TextInput         (confirm password, with EyeToggle)
    │   ├── PasswordRules         (min 8, 1 upper, 1 number, 1 special)
    │   └── Button                (primary, "Passwort speichern")
    └── Footer
```

### 1.2 Home (Startseite)

```
HomePage
└── AppLayout
    ├── TopNavigation
    │   ├── Logo
    │   ├── NavLink (×5: Startseite, Meine Arbeit, Wissen, Dokumentenverwaltung, Verwaltung)
    │   ├── NotificationBell
    │   │   └── NotificationDropdown
    │   │       ├── NotificationItem (×N)
    │   │       └── Button (ghost, "Alle lesen")
    │   └── UserMenu
    │       ├── UserAvatar
    │       └── UserMenuDropdown
    ├── Breadcrumb
    ├── DashboardHeader           (greeting + date)
    ├── KPIGrid
    │   └── StatCard (×6)
    ├── CaseListSection
    │   ├── CaseListHeader        (title + count badge + "Alle" link)
    │   ├── DataTable             (overdue cases)
    │   │   ├── TableHeader
    │   │   ├── TableRow (×N)
    │   │   │   ├── StatusBadge
    │   │   │   ├── RiskIndicator
    │   │   │   └── Button (ghost, "Öffnen")
    │   │   └── TablePagination
    │   ├── DataTable             (due today)
    │   │   └── ... (same structure)
    │   ├── DataTable             (waiting on citizen)
    │   │   └── ... (same structure)
    │   ├── DataTable             (waiting on authority)
    │   │   └── ... (same structure)
    │   └── DataTable             (completed today)
    │       └── ... (same structure)
    ├── WatchedCasesSection
    │   └── DataTable
    │       └── ...
    ├── NextTaskSection
    │   └── NextTaskCard
    │       ├── RiskIndicator
    │       ├── DeadlineBadge
    │       └── Button (primary, "Vorgang öffnen")
    ├── Sidebar                  (right, 30% width, collapsible)
    │   └── DecisionSupportPanel
    │       ├── TextArea          (question input)
    │       ├── Button            (submit)
    │       ├── SummarySection
    │       ├── RegulationCitation (×N)
    │       ├── MissingInfoFlag (×N)
    │       ├── ChecklistPreview
    │       ├── NextActionSection
    │       └── ExpandableSection ("Erweitert")
    │           └── ConfidenceBar
    └── ToastContainer
```

**Supervisor variant** — same structure, different widgets:
```
HomePage (Supervisor)
└── AppLayout
    ├── ... (same shell)
    ├── KPIGrid
    │   └── StatCard (×6, different metrics)
    ├── ApprovalQueueSection      (replaces CaseListSection)
    │   └── DataTable
    ├── TeamWorkloadSection
    │   └── DataTable
    └── DepartmentKPISection
        └── StatCard (×5)
```

### 1.3 Meine Arbeit (My Work — List Views)

```
InboxPage / ActiveCasesPage / WaitingPage / ArchivePage
└── AppLayout
    ├── TopNavigation
    │   └── ... (same as Home)
    ├── SubNavigation
    │   └── TabItem (×5: Posteingang, Offene Vorgänge, Warten, Genehmigung, Archiv)
    ├── Breadcrumb
    ├── FilterBar
    │   ├── SelectInput           (Fachbereich filter)
    │   ├── SelectInput           (Priority filter)
    │   └── SearchBar
    │       ├── TextInput
    │       └── Button            (submit)
    ├── DataTable
    │   ├── TableHeader
    │   ├── TableRow (×N)
    │   │   ├── StatusBadge
    │   │   ├── RiskIndicator
    │   │   ├── PriorityIndicator
    │   │   └── Button (ghost, "Öffnen")
    │   ├── TablePagination
    │   └── TableSkeleton         (loading state)
    └── EmptyState                (when no cases)
```

### 1.4 Case Workspace (Contextual)

```
CaseWorkspaceShell               (renders all tabs)
└── CaseWorkspaceLayout
    ├── TopNavigation
    │   └── ...
    ├── Breadcrumb
    ├── CaseHeader                (PERSISTENT, never hidden)
    │   ├── CaseNumber
    │   ├── CaseSubject
    │   ├── CitizenName
    │   ├── AssigneeBadge
    │   ├── StatusBadge
    │   ├── DeadlineBadge
    │   ├── RiskIndicator
    │   └── WatchToggle           (⭐)
    ├── TabBar                    (contextual tabs)
    │   └── TabItem (×6: Übersicht, Checkliste, Dokumente, Notizen, Aktivität, Entscheidungsunterstützung)
    └── TabContent                (conditional — renders active tab)

        ── Übersicht Tab ──
        CaseOverviewPage
        ├── MetadataPanel         (left, 240px)
        │   ├── WorkflowStepper
        │   ├── AssignmentPanel
        │   │   └── Button (ghost, "Zuweisung ändern")
        │   ├── DocumentList      (case documents, compact)
        │   │   └── FileLink (×N)
        │   ├── NotePreview       (last 2 notes)
        │   └── ActivityPreview   (last 5 events)
        ├── MainContent           (center, flex)
        │   ├── WarningBanner     (conditional — missing docs, overdue, high risk)
        │   ├── NextActionSection
        │   │   └── Button (primary)
        │   └── PhaseDescription
        └── DecisionSupportPanel  (right, 320px)
            ├── TextArea          (question input)
            ├── Button            ("Analyse starten")
            ├── SummarySection
            ├── RegulationCitation (×N)
            ├── MissingInfoFlag (×N)
            ├── ChecklistPreview
            ├── NextActionSection
            └── ExpandableSection ("Erweitert")
                └── ConfidenceBar

        ── Checkliste Tab ──
        CaseChecklistPage
        ├── MetadataPanel         (left, 240px, collapsed — mini view)
        └── MainContent           (center, full width)
            └── Checklist
                ├── ChecklistItem (×N)
                │   ├── Checkbox
                │   ├── ItemLabel
                │   ├── MandatoryBadge   (conditional)
                │   ├── CompletionInfo   (timestamp + user, conditional)
                │   └── Button (ghost, "Entfernen")
                └── Button (ghost, "+ Aufgabe hinzufügen")

        ── Dokumente Tab ──
        CaseDocumentsPage
        └── MainContent           (center, full width)
            ├── CaseDocumentList
            │   ├── DataTable
            │   │   └── TableRow (×N)
            │   │       ├── FileIcon
            │   │       ├── FileName
            │   │       ├── StatusBadge
            │   │       └── ActionButtons (Preview, Download, Compare)
            │   └── EmptyState    (when no documents)
            └── CaseDocumentUpload
                ├── FileUpload    (drop zone)
                └── Button (primary, "Hochladen")

        ── Interne Notizen Tab ──
        CaseNotesPage
        └── MainContent
            ├── NoteList
            │   └── NoteItem (×N)
            │       ├── AuthorBadge
            │       ├── Timestamp
            │       ├── NoteContent
            │       └── ActionButtons (Edit, Delete)
            ├── NewNoteInput
            │   ├── TextArea
            │   └── Button (primary, "Speichern")
            └── EmptyState

        ── Aktivität Tab ──
        CaseActivityPage
        └── MainContent
            ├── Timeline
            │   └── TimelineEvent (×N)
            │       ├── ActorDot    (colored: blue/purple/green/gray)
            │       ├── Timestamp
            │       ├── ActorName
            │       ├── ActionDescription
            │       └── Comment     (conditional)
            └── ExpandableSection ("Vollständigen Verlauf")
                └── Timeline (full audit)

        ── Entscheidungsunterstützung Tab ──
        CaseDecisionSupportPage
        └── MainContent           (center, full width)
            └── DecisionSupportPanel (full panel, not sidebar)
                ├── TextArea
                ├── Button
                ├── SummarySection
                ├── RegulationCitation (×N)
                ├── MissingInfoFlag (×N)
                ├── ChecklistPreview
                ├── NextActionSection
                ├── SupportingDocsList
                └── ExpandableSection ("Erweitert")
                    └── ConfidenceBar

        ── Entwurf Tab ──
        CaseDraftPage
        ├── TemplateSelector
        │   └── SelectInput       (template dropdown)
        └── MainContent
            ├── DraftEditor        (rich text)
            ├── RegulationReferencePanel (cited regulations)
            └── ActionBar
                ├── Button (secondary, "Entwurf speichern")
                ├── Button (secondary, "Vorschau")
                ├── Button (primary, "Zur Genehmigung")
                └── Button (ghost, "Verwerfen")

        ── Versand Tab ──
        CaseSendPage
        └── MainContent
            ├── ReplyPreview
            │   └── DocumentPreview
            ├── CoverLetterEditor
            │   └── TextArea
            └── ActionBar
                ├── Button (primary, "Als gesendet markieren")
                ├── Button (secondary, "Antwort drucken")
                └── Button (secondary, "Archivieren")
```

### 1.5 Wissen (Knowledge)

```
KnowledgeSearchPage              (Alles tab)
└── AppLayout
    ├── TopNavigation
    │   └── ...
    ├── SubNavigation
    │   └── TabItem (×8: Alles, Vorschriften, Verfahren, Vorlagen, FAQs, Fälle, Bürger, Dokumente)
    ├── Breadcrumb
    ├── SearchSection
    │   ├── SearchBar
    │   │   ├── TextInput
    │   │   └── Button (submit)
    │   ├── SelectInput           (Fachbereich filter)
    │   └── SelectInput           (Sortierung)
    ├── ResultsContainer
    │   ├── CategoryDivider       (×N)
    │   │   └── KnowledgeCard (×N, up to 5 per category)
    │   │       ├── RelevanceBar
    │   │       ├── Excerpt
    │   │       ├── SourceLink
    │   │       └── Button (ghost, "☆ Merken")
    │   ├── Skeleton              (loading — 5 KnowledgeCard skeletons)
    │   └── EmptyState            (no results)
    ├── Sidebar                   (right, 280px)
    │   └── FavoritesSidebar
    │       ├── FavoriteList
    │       │   └── FavoriteItem (×N)
    │       └── RecentList
    │           └── RecentItem (×N)
    └── ToastContainer
```

```
RegulationsPage                  (Vorschriften tab)
└── AppLayout
    ├── ... (same shell)
    └── TwoColumnLayout
        ├── RegulationBrowser     (left sidebar)
        │   ├── DepartmentTree
        │   │   └── TreeNode (×N)
        │   └── DocumentTypeFilter
        └── RegulationDetailPanel (right)
            ├── DocumentMetadata
            ├── SectionList
            │   └── SectionLink (×N)
            └── Button (primary, "Volltext öffnen")

ProceduresPage / TemplatesPage / FAQsPage follow similar patterns
with ProcedureTable, TemplateCard, FAQAccordion as primary components.
```

### 1.6 Dokumentenverwaltung (Documents)

```
DocumentListPage
└── AppLayout
    ├── TopNavigation
    │   └── ...
    ├── SubNavigation
    │   └── TabItem (×3: Alle Dokumente, Hochladen, Index-Status)
    ├── Breadcrumb
    ├── FilterBar
    │   ├── SelectInput (×3)     (Status, Typ, Fachbereich)
    │   └── SearchBar
    ├── DataTable
    │   ├── TableHeader
    │   ├── TableRow (×N)
    │   │   ├── FileIcon
    │   │   ├── StatusBadge
    │   │   └── ActionMenu (⋯)
    │   │       └── MenuItem (×10: Anzeigen, Metadaten, Neue Version, ...)
    │   ├── TablePagination
    │   └── TableSkeleton
    └── EmptyState

DocumentUploadPage
└── AppLayout
    ├── ... (same shell)
    └── UploadSection
        ├── FileUpload            (drop zone, drag-and-drop)
        │   └── ProgressIndicator
        ├── MetadataForm
        │   ├── FormField (×7)    (Titel, Typ, Fachbereich, Herausgeber, Datum, Sprache, Tags)
        │   │   └── TextInput / SelectInput / DatePicker
        │   └── Button (primary, "Dokument hochladen")
        └── ProcessingStatus      (conditional — during ingestion)

DocumentDetailPage
└── AppLayout
    ├── ... (same shell)
    └── DocumentDetail
        ├── MetadataHeader        (editable)
        │   └── Button (ghost, "Bearbeiten")
        ├── RelatedDocumentsList
        ├── VersionHistory
        │   ├── VersionItem (×N)
        │   └── Button (secondary, "Versionen vergleichen")
        ├── ReferencedRegulations
        ├── FullTextPreview       (200 lines + expand)
        │   └── Button (primary, "Gesamten Volltext anzeigen")
        └── ExpandableSection ("Erweitert: Index-Details")
            ├── StatCard (×5)     (Chunks, Embeddings, Qdrant, Dimension, Score)
            └── Button (secondary, "Neu indizieren")
```

### 1.7 New Case Wizard

```
NewCaseWizardPage
└── AppLayout
    ├── TopNavigation
    │   └── ...
    ├── Breadcrumb
    └── Wizard
        ├── WizardStepper
        │   └── WizardStep (×6: Typ, Bürger, Dokumente, Metadaten, Zuweisung, Prüfen)
        └── WizardContent         (conditional — renders current step)

            ── Step 1: Case Type ──
            ├── SelectInput       (Fachbereich)
            └── SelectInput       (Vorgangstyp)

            ── Step 2: Citizen ──
            ├── SearchBar         (citizen search)
            ├── DataTable         (search results)
            └── CitizenForm       (new citizen)
                ├── FormField (×3)
                └── Button

            ── Step 3: Documents ──
            └── FileUpload (×N)

            ── Step 4: Metadata ──
            ├── FormField         (Betreff)
            ├── FormField         (Beschreibung)
            ├── SelectInput       (Priorität)
            └── DatePicker        (Fällig)

            ── Step 5: Assignment ──
            ├── AssigneeSelector
            └── SelectInput       (Grund)

            ── Step 6: Review ──
            └── SummaryCard       (all entered data)

        └── WizardActions
            ├── Button (secondary, "Zurück")
            ├── Button (primary, "Weiter")
            └── Button (primary, "Vorgang erstellen")  (last step only)
```

### 1.8 Supervisor Approval

```
ApprovalQueuePage
└── AppLayout
    ├── ... (same shell as Meine Arbeit)
    └── DataTable                 (cases awaiting approval)

ApprovalWorkspacePage
└── CaseWorkspaceLayout
    ├── ... (same case header + tabs)
    └── ComparisonWorkspace
        ├── SidebarLeft           (original application)
        │   └── DocumentPreview
        ├── SidebarRight          (draft decision)
        │   └── DocumentPreview
        ├── ChangesList           (auto-detected)
        │   └── ChangeItem (×N)
        ├── AutoVerification
        │   └── VerificationItem (×5)
        │       └── StatusBadge
        ├── ApprovalCommentInput
        │   └── TextArea
        └── ActionBar
            ├── Button (primary, "Genehmigen")
            ├── Button (secondary, "Zurück zur Überarbeitung")
            └── Button (danger, "Ablehnen")
```

### 1.9 Administration

```
AdminOverviewPage
└── AdminLayout
    ├── TopNavigation
    │   └── ...
    ├── SubNavigation
    │   └── TabItem (×6: Übersicht, Korpus-Status, Audit, Aufträge, Benchmarks, Entwickler)
    ├── Breadcrumb
    └── ToolGrid
        └── InfoCard (×8)        (Korpus-Status, Audit, Aufträge, Benchmarks,
                                   Wissensgraph, Entwickler, Analytik, Systemkonfiguration)

AuditPage
└── AdminLayout
    ├── ... (same shell)
    ├── FilterBar
    │   ├── SelectInput           (Ereignistyp)
    │   ├── TextInput             (Akteur)
    │   ├── TextInput             (Korrelation)
    │   ├── DatePicker (×2)       (Von, Bis)
    │   └── Button (primary, "Filtern")
    └── DataTable
        └── TableRow (×N)
            ├── Timestamp
            ├── EventTypeBadge
            ├── ActorName
            └── DetailsLink
```

### 1.10 Corpus

```
CorpusHealthPage
└── AdminLayout
    ├── ... (same shell)
    ├── StatusBanner              (Gesund / Warnungen / Kritisch)
    ├── KPIGrid
    │   └── StatCard (×10)
    ├── WarningsSection
    │   └── WarningCard (×N)
    │       └── Button (secondary, "Neu indizieren")
    └── DataTable                 (document health — 15 columns)
        └── TableRow (×N)
            ├── StatusDot
            └── Button (ghost, "Details")
```

### 1.11 Users

```
UserListPage
└── AdminLayout
    ├── ... (same shell)
    ├── ActionBar
    │   └── Button (primary, "Neuer Benutzer")
    └── DataTable
        └── TableRow (×N)
            ├── UserAvatar
            ├── StatusBadge
            └── ActionMenu

UserDetailPage
└── AdminLayout
    ├── ... (same shell)
    └── UserForm
        ├── FormField (×N)
        │   └── TextInput / SelectInput
        ├── RoleSelector
        └── ActionBar
            ├── Button (primary, "Speichern")
            └── Button (secondary, "Passwort zurücksetzen")
```

---

## 2. Complete Dependency Map

### Hub Components — Ranked by Reuse Count

| Component | Used By | Count |
|---|---|---|
| **Button** | Login, Home, MyWork, CaseWorkspace, Knowledge, Documents, NewCase, Supervisor, Admin, Corpus, Users | 11 |
| **TextInput** | Login, Home, MyWork, CaseWorkspace, Knowledge, Documents, NewCase, Admin, Corpus, Users | 10 |
| **DataTable** | Home, MyWork, CaseWorkspace, Documents, NewCase, Supervisor, Admin, Corpus, Users | 9 |
| **StatusBadge** | Home, MyWork, CaseWorkspace, Documents, Admin, Corpus, Supervisor, Users | 8 |
| **TopNavigation** | Home, MyWork, CaseWorkspace, Knowledge, Documents, NewCase, Supervisor, Admin, Corpus | 9 |
| **Breadcrumb** | Home, MyWork, CaseWorkspace, Knowledge, Documents, NewCase, Admin, Corpus | 8 |
| **FormField** | Login, CaseWorkspace, Documents, NewCase, Admin, Users | 6 |
| **SelectInput** | MyWork, Knowledge, Documents, NewCase, Admin | 5 |
| **Sidebar** | Home, CaseWorkspace, Knowledge | 3 |
| **SubNavigation** | MyWork, Knowledge, Documents, Admin, Corpus | 5 |
| **SearchBar** | MyWork, Knowledge, Documents, NewCase | 4 |
| **Toast** | ALL pages (via AppLayout) | 11 |
| **Dialog** | Home, CaseWorkspace, Documents, Admin, Supervisor | 5 |
| **ConfirmDialog** | CaseWorkspace, Documents, Admin, Supervisor | 4 |
| **Spinner** | ALL pages (via Button, DataTable, Page loads) | 11 |
| **Skeleton** | Home, MyWork, Knowledge, Documents, Admin, Corpus | 6 |
| **StatCard** | Home, Corpus, Admin | 3 |
| **RiskIndicator** | Home, MyWork, CaseWorkspace | 3 |
| **DecisionSupportPanel** | Home, CaseWorkspace | 2 |
| **Checklist** | CaseWorkspace | 1 |
| **Timeline** | CaseWorkspace, Admin (Audit) | 2 |
| **WorkflowStepper** | CaseWorkspace | 1 |
| **Wizard** | NewCase | 1 |
| **FileUpload** | Documents, CaseWorkspace, NewCase | 3 |
| **DatePicker** | Documents, NewCase, Admin | 3 |
| **ProgressIndicator** | Documents, CaseWorkspace | 2 |
| **TabBar** | CaseWorkspace | 1 |
| **CaseHeader** | CaseWorkspace, Supervisor | 2 |
| **EmptyState** | Home, MyWork, Knowledge, Documents, CaseWorkspace, Admin | 6 |
| **Footer** | Login | 1 |

### Leaf Components

Components that render no other components:

| Component | Children | Notes |
|---|---|---|
| TextInput | 0 | Pure input element |
| SelectInput | 0 | Pure select element |
| DatePicker | 0 | Input + calendar popup (internal only) |
| TextArea | 0 | Pure textarea element |
| Checkbox | 0 | Pure checkbox input |
| Spinner | 0 | Pure CSS animation |
| StatusDot | 0 | 8px colored circle |
| Badge (all variants) | 0 | Inline text span |
| Icon | 0 | SVG wrapper |
| Logo | 0 | Static image |
| ConfidenceBar | 0 | Colored div bar |
| Skeleton | 0 | Animated gray div |
| ProgressIndicator | 0 | Colored div bar + label |
| Divider | 0 | Horizontal rule |
| EmptyState | 0 | Icon + text + button (uses Button but as slot) |
| Toast | 0 | Single notification item |
| PasswordRules | 0 | Static rules list |

---

## 3. Component Dependency Levels

```
Level 0 — Application
│
│  App.tsx
│  ├── QueryClientProvider
│  ├── AuthProvider
│  ├── ToastProvider
│  └── RouterProvider
│
├── Level 1 — Layouts
│   │
│   ├── AuthLayout
│   ├── AppLayout
│   ├── CaseWorkspaceLayout
│   └── AdminLayout
│
├── Level 2 — Pages
│   │
│   ├── LoginPage
│   ├── HomePage
│   ├── InboxPage
│   ├── CaseOverviewPage
│   ├── KnowledgeSearchPage
│   ├── DocumentListPage
│   ├── NewCaseWizardPage
│   ├── ApprovalWorkspacePage
│   ├── AdminOverviewPage
│   ├── CorpusHealthPage
│   └── UserListPage
│   │   ... (all 41 pages)
│   │
├── Level 3 — Feature Components
│   │
│   ├── TopNavigation
│   ├── SubNavigation
│   ├── Sidebar
│   ├── Breadcrumb
│   ├── CaseHeader
│   ├── TabBar
│   ├── DecisionSupportPanel
│   ├── Checklist
│   ├── Timeline
│   ├── WorkflowStepper
│   ├── Wizard
│   ├── ComparisonWorkspace
│   ├── DocumentPreview
│   ├── VersionComparison
│   ├── RegulationBrowser
│   ├── KnowledgeCard
│   ├── SearchBar
│   ├── FilterBar
│   └── FavoritesSidebar
│
├── Level 4 — Reusable Components
│   │
│   ├── DataTable
│   ├── FormField
│   ├── StatCard
│   ├── InfoCard
│   ├── Dialog
│   ├── ConfirmDialog
│   ├── NotificationBell
│   ├── NotificationDropdown
│   ├── UserMenu
│   ├── FileUpload
│   ├── RiskIndicator
│   ├── PriorityIndicator
│   ├── StatusBadge
│   ├── RegulationCitation
│   ├── MissingInfoFlag
│   ├── ActivityTimeline (reused in Audit)
│   └── ExpandableSection
│
└── Level 5 — Primitives
    │
    ├── Button
    ├── TextInput
    ├── SelectInput
    ├── DatePicker
    ├── TextArea
    ├── Checkbox
    ├── Badge
    ├── StatusDot
    ├── Spinner
    ├── Skeleton
    ├── ProgressIndicator
    ├── ConfidenceBar
    ├── EmptyState
    ├── Toast
    ├── Divider
    ├── Icon (Lucide wrapper)
    └── Logo
```

---

## 4. Coupling Risks

### High Risk — Tightly Coupled to Case Context

| Component | Risk | Mitigation |
|---|---|---|
| **CaseHeader** | Currently receives individual props (caseNumber, subject, citizen, etc.). Tightly coupled to the Vorgang data shape. Any Case type change breaks this component and all 8 case workspace pages. | Define a `CaseHeaderProps` interface with only the fields the header displays. Accept a `case: CaseSummary` prop. Pages select fields before passing. |
| **DecisionSupportPanel** | Expects `caseId` and `question`. Internally manages analysis state machine (idle → analyzing → ready → low-confidence → error). Difficult to test in isolation. | Extract the state machine into `useDecisionSupport` hook. Panel becomes a pure render component. Test the hook independently. |
| **Checklist** | Expects case-type-specific items. Auto-population logic is embedded. Adding a new case type requires Checklist changes. | Move auto-population to a `useChecklist(caseType)` hook that returns items. Checklist component only renders items + handles toggle/add/remove. |
| **WorkflowStepper** | Hardcoded phases for the case lifecycle. If phases change, the stepper breaks. | Accept `phases: Phase[]` as prop. Define `CASE_PHASES` constant in `constants/`. Pages import the constant and pass to stepper. |

### Medium Risk — Multiple Context Dependencies

| Component | Risk | Mitigation |
|---|---|---|
| **TopNavigation** | Depends on `AuthContext` (user name, role) and `NotificationContext` (unread count). If either context shape changes, navigation breaks. | Define explicit prop interfaces. Context values are mapped to props at the AppLayout level, not consumed inside TopNavigation. |
| **DataTable** | Used by 9 pages with different column configs, sorting needs, and row actions. Risk of becoming a god component with too many conditional branches. | Keep generic: `columns: ColumnDef[]`, `data: T[]`, `onRowClick`. Sorting, pagination, and row actions are controlled via props. No page-specific logic. |
| **Sidebar** | Used for DecisionSupport (Home), Favorites (Knowledge), and Metadata (CaseWorkspace). Different content, same shell. Risk of sidebar knowing about its content. | Sidebar only provides the shell (position, width, collapse). Content is `children`. Each page composes its own sidebar content. |

### Low Risk — Stable Primitives

| Component | Risk | Notes |
|---|---|---|
| Button | Very low | Props are well-defined (variant, size, loading, disabled). Unlikely to change. |
| TextInput | Very low | Standard controlled input. Only risk is if design system changes the input height/border. |
| Badge | Very low | Simple variant-based styling. |
| Spinner | Very low | Standard CSS animation. No logic. |
| Toast | Low | Toast content is dynamic but the component API (type, message, duration) is stable. |

### Cross-Cutting Concerns — Context Boundaries

| Context | Risk | Recommendation |
|---|---|---|
| **AuthContext** | All pages depend on it. Shape change breaks everything. | Define `AuthContextType` interface in `types/`. Treat as contract. |
| **CurrentCaseContext** | All case workspace pages + CaseHeader + DecisionSupport. Must be available inside CaseWorkspaceLayout, unavailable outside. | Create `CaseContext` provided by `CaseWorkspaceLayout`. Pages consume via `useCase()` hook. Throws if used outside CaseWorkspaceLayout. |
| **ToastContext** | All pages (via AppLayout). Shape change breaks all feedback. | Simple API: `addToast(type, message, action?)`. Unlikely to change. |

---

## 5. Recommended Extraction Order

Extraction proceeds from safest (no dependencies, no context coupling) to most difficult (many dependencies, tight context coupling).

### Phase A — Primitives (No Dependencies)

```
 1. Design Tokens (CSS custom properties + Tailwind config)
 2. Icon (Lucide wrapper)
 3. Logo (static asset)
 4. Spinner
 5. Skeleton
 6. StatusDot
 7. Badge
 8. Divider
 9. ProgressIndicator
10. ConfidenceBar
11. PasswordRules
```

### Phase B — Basic Interactive Components (No Context)

```
12. Button
13. TextInput
14. SelectInput
15. DatePicker
16. TextArea
17. Checkbox
18. FormField            (depends on TextInput/SelectInput/DatePicker/TextArea + children)
19. EmptyState           (depends on Icon + Button)
20. Toast                (depends on Icon + Badge)
```

### Phase C — Display Components (Data-Driven, No Context)

```
21. StatCard             (depends on Badge)
22. InfoCard             (depends on Icon + Button)
23. StatusBadge          (depends on Badge)
24. RiskIndicator        (depends on StatusDot + Badge)
25. PriorityIndicator    (depends on StatusDot)
26. TableHeader          (depends on Icon)
27. TableRow             (depends on StatusBadge, Button)
28. TablePagination      (depends on Button, SelectInput)
29. TableSkeleton        (depends on Skeleton)
30. DataTable            (depends on TableHeader, TableRow, TablePagination, TableSkeleton, EmptyState)
```

### Phase D — Feedback & Overlays (Portal-Based)

```
31. Dialog               (depends on Button, Icon)
32. ConfirmDialog        (depends on Dialog, Button)
33. NotificationItem     (depends on Badge, Icon)
34. NotificationDropdown (depends on NotificationItem, Button)
35. UserMenuDropdown     (depends on Button, Icon)
36. ActionMenu           (depends on Button)
```

### Phase E — Navigation (Context-Aware, Prop-Driven)

```
37. ToastContainer       (depends on Toast, ToastContext)
38. NotificationBell     (depends on NotificationDropdown, NotificationContext)
39. UserMenu             (depends on UserMenuDropdown, AuthContext)
40. Breadcrumb           (depends on Link)
41. NavLink
42. TabItem              (depends on Badge)
43. SubNavigation        (depends on TabItem)
44. TopNavigation        (depends on Logo, NavLink, NotificationBell, UserMenu)
45. Sidebar              (depends on Icon — collapse toggle)
```

### Phase F — Layouts (Compose Navigation + Content Slots)

```
46. AuthLayout
47. AppLayout            (depends on TopNavigation, SubNavigation, Breadcrumb, Sidebar, ToastContainer)
48. CaseHeader           (depends on StatusBadge, RiskIndicator, Badge, Icon)
49. TabBar               (depends on TabItem)
50. CaseWorkspaceLayout  (depends on AppLayout, CaseHeader, TabBar, Sidebar)
51. AdminLayout          (depends on AppLayout)
```

### Phase G — Feature Components (Domain-Specific)

```
52. SearchBar            (depends on TextInput, Button, SelectInput)
53. FilterBar            (depends on SelectInput, DatePicker, SearchBar, Button)
54. FileUpload           (depends on ProgressIndicator, Button)
55. RegulationCitation   (depends on Icon, Button)
56. MissingInfoFlag      (depends on Badge, Button)
57. ExpandableSection    (depends on Icon)
58. KnowledgeCard        (depends on RelevanceBar, Icon, Button)
59. Timeline             (depends on TimelineEvent — internal only)
60. Checklist            (depends on Checkbox, TextInput, Button, Badge)
61. WorkflowStepper      (depends on StatusDot, Badge)
62. ConfidenceBar        (already extracted in Phase A)
63. DecisionSupportPanel (depends on TextArea, Button, RegulationCitation, MissingInfoFlag, Checklist, ExpandableSection, ConfidenceBar, ProgressIndicator, Spinner)
64. AssignmentPanel      (depends on SelectInput, Button, Badge)
65. Wizard               (depends on WizardStepper, Button)
66. WizardStepper        (depends on StatusDot, Badge)
67. DocumentPreview      (depends on Button, ExpandableSection)
68. VersionComparison    (depends on DocumentPreview)
69. FavoritesSidebar     (depends on Icon, Button)
70. ComparisonWorkspace  (depends on DocumentPreview, Badge, Button, TextArea)
```

### Phase H — Pages (Compose Everything)

```
71. LoginPage            (depends on AuthLayout, TextInput, Button, Checkbox)
72. HomePage             (depends on AppLayout, StatCard, DataTable, DecisionSupportPanel, RiskIndicator, NextTaskCard)
73. CaseWorkspace pages  (depends on CaseWorkspaceLayout, Checklist, DecisionSupportPanel, Timeline, DataTable, FileUpload, WorkflowStepper)
74. Knowledge pages      (depends on AppLayout, SearchBar, KnowledgeCard, RegulationBrowser, FavoritesSidebar)
75. Document pages       (depends on AppLayout, DataTable, FileUpload, DocumentPreview, VersionComparison)
76. NewCaseWizardPage    (depends on AppLayout, Wizard, FileUpload, SearchBar, DataTable)
77. ApprovalWorkspace    (depends on CaseWorkspaceLayout, ComparisonWorkspace, ConfirmDialog)
78. Admin pages          (depends on AdminLayout, DataTable, StatCard, InfoCard, FilterBar)
79. Corpus pages         (depends on AdminLayout, StatCard, DataTable, ProgressIndicator)
80. User pages           (depends on AdminLayout, DataTable, FormField)
```

### Phase I — Routing & State (Application Wiring)

```
81. Router               (depends on all pages, ProtectedRoute, AdminRoute)
82. AuthContext           (depends on authService)
83. ToastContext          (no dependencies)
84. NotificationContext   (no dependencies)
85. CaseContext           (depends on caseService)
86. API Client            (depends on AuthContext — JWT interceptor)
87. Query Client          (depends on API Client)
88. App.tsx               (depends on Router, AuthContext, ToastContext, QueryClient)
```

---

## 6. Summary Statistics

| Metric | Count |
|---|---|
| Total components (all levels) | 88 |
| Pages | 41 |
| Layouts | 4 |
| Feature components | 19 |
| Reusable components | 24 |
| Primitives | 17 |
| Contexts / Providers | 5 |
| Leaf components (render no children) | 19 |
| Hub components (used by 5+ pages) | 12 |
| Components with context dependencies | 8 |
| Recommended extraction phases | 9 (A through I) |
