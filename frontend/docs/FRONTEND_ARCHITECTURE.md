# Frontend Architecture — Kommunale Entscheidungsplattform

**Version:** 1.0
**Status:** Architectural Blueprint
**Date:** 15 July 2026

This document is the authoritative frontend architecture for the project. It is derived from analysis of all 10 Google Stitch imports in `frontend/imports/`. No implementation decisions have been made — this is a pure architectural plan.

---

## 1. Import Analysis — Duplicated Elements

### 1.1 Top Navigation Bar

**Appears in:** home (TopNavBar.tsx, 55 lines), case-workspace (Header.tsx, 76 lines), documents (TopNavBar.tsx, 48 lines), administration (Header.tsx, 221 lines), corpus (Header.tsx), new-case (Header.tsx), supervisor (Header.tsx)

**Similarity:** All implement a persistent top bar with logo, navigation links, notification bell, and user menu. Structural similarity is high (~80%). Implementation divergence: different prop interfaces, different icon imports, different export styles (named vs. default), different notification handling. Administration's Header is 221 lines because it inlines notification panel + audit actions.

**Recommendation:** Extract into one shared `TopNavigation` component. Props: `userName`, `userInitials`, `unreadCount`, `onNotificationClick`, `activeModule`. The component renders the 5 global module links, notification bell with dropdown, and user menu. Administration's inline audit actions should be moved to the page, not the header.

### 1.2 Footer

**Appears in:** login (Footer.tsx), home (Footer.tsx), case-workspace (Footer.tsx), documents (Footer.tsx), new-case (Footer.tsx), supervisor (Footer.tsx)

**Similarity:** All render a bottom bar with copyright, version number, and legal links. Nearly identical (~95%). Trivial to unify.

**Recommendation:** One shared `Footer` component. Props: `version`. No other props needed.

### 1.3 Sidebar / Right Panel

**Appears in:** home (SuggestionsSidebar.tsx), case-workspace (MetadataSidebar.tsx), documents (Sidebar.tsx), administration (Sidebar.tsx), corpus (Sidebar.tsx, StatusSidebar.tsx), supervisor (SidebarLeft.tsx, SidebarRight.tsx), new-case (SidebarHelp.tsx)

**Similarity:** Moderate (~50%). All are 280-320px collapsible panels. Divergence: different content, different collapse behavior, some are left-positioned, some right.

**Recommendation:** One shared `Sidebar` component with position prop (`left` | `right`) and width prop. Content is slotted as children. Variants (DecisionSupportSidebar, MetadataSidebar, FavoritesSidebar) compose Sidebar with specific content components.

### 1.4 Sub-Navigation Tabs

**Appears in:** case-workspace (SubNav.tsx), documents (SubNavBar.tsx)

**Similarity:** High (~85%). Both render horizontal tabs with count badges below the main navigation.

**Recommendation:** One shared `SubNavigation` component. Props: `tabs: { label, count, active }[]`, `onTabChange`.

### 1.5 Tables

**Appears in:** home (CaseTable.tsx), documents (DocumentTable.tsx), corpus (KnowledgeTable.tsx), administration (AuditLogsCard.tsx — contains a table)

**Similarity:** Moderate (~60%). All are dense data tables with sticky headers. Divergence: different column definitions, different row actions, different sorting/pagination approaches.

**Recommendation:** One shared `DataTable` component with generic column definition, sortable headers, pagination, and row action slots. Each page defines its own column config.

### 1.6 Buttons

**Appears in:** login (Button.tsx), home (used inline in multiple components), case-workspace (inline), documents (inline)

**Similarity:** High (~70%). Primary/secondary/danger/ghost variants used across all imports but only login extracts a dedicated Button component.

**Recommendation:** One shared `Button` component with variants (`primary`, `secondary`, `danger`, `ghost`), sizes (`sm`, `md`, `lg`), and loading state.

### 1.7 Dialogs / Modals

**Appears in:** home (InteractiveDialogs.tsx), administration (Modals.tsx), corpus (UploadModal.tsx, DetailDrawer.tsx)

**Similarity:** Moderate (~55%). Overlay + centered card pattern is consistent. Divergence: different close behaviors, different sizes, some use Framer Motion, some use plain CSS.

**Recommendation:** One shared `Dialog` component and one `ConfirmDialog` variant. Corpus's DetailDrawer is a slide-out panel, not a dialog — treat as a separate `Drawer` component.

### 1.8 Forms / Inputs

**Appears in:** login (InputField.tsx), new-case (DocumentForm.tsx, inline forms), documents (inline in upload)

**Similarity:** Moderate (~50%). Label-above-field pattern is consistent. Divergence: different validation approaches, different error display.

**Recommendation:** Shared `FormField`, `TextInput`, `SelectInput`, `TextArea`, `DatePicker`, `FileUpload` components as specified in the component map.

### 1.9 Cards

**Appears in:** home (StatsGrid — stat cards), case-workspace (ChecklistCard, DocumentsCard, TimelineNotesCard), administration (CorpusStatusCard, AuditLogsCard, SystemStatusCard, BackgroundJobsCard), corpus (OverviewDashboard — stat cards)

**Similarity:** Moderate (~45%). White background, 1px border, 8px radius pattern is partially consistent. Divergence: some use Tailwind classes, some use CSS modules, some use inline styles.

**Recommendation:** Two shared card variants: `StatCard` (number + label) and `InfoCard` (icon + title + description + action). All page-specific cards compose these.

### 1.10 CSS / Design Tokens

**Critical finding: Each import defines its own color palette, spacing, and typography.** No two imports use identical design tokens. The UX specification (`docs/DESIGN.md`) defines the authoritative design system. All imports must be normalized to one set of CSS custom properties.

**Color inconsistency examples:** home uses `#1A1A2E` as primary text, case-workspace uses `#212529`, documents uses `#002045`, corpus uses `#001c38`. All should be `#1A1A2E` (from DESIGN.md).

**CSS approach inconsistency:** 5 imports use Tailwind (home, login, administration, supervisor, knowledge, users). 3 imports use vanilla CSS variables (case-workspace, new-case, corpus). 1 import uses CSS Modules (documents). Need to choose one approach.

**Recommendation:** Adopt Tailwind CSS with design token configuration matching DESIGN.md. All CSS custom properties from DESIGN.md map to Tailwind theme extensions. CSS Modules are permitted for complex component-specific styles but must reference design tokens.

### 1.11 Icons

**Consistent:** All imports use Lucide React. One import (corpus) also pulls Material Symbols — remove this. Phosphor Icons was specified in UX baseline but Lucide is functionally equivalent and already adopted across all imports. Decision: standardize on Lucide React.

### 1.12 Fonts

**Consistent:** All imports use Inter (body) + JetBrains Mono (code). Font weights vary slightly (some import 300, 800, 900 which are unused). Standardize on 400, 500, 600, 700 for Inter and 400, 500 for JetBrains Mono.

### 1.13 Types

**Appears in:** home (types.ts), case-workspace (types.ts), documents (types.ts), corpus (types.ts), supervisor (types.ts), new-case (types.ts), administration (types.ts), knowledge (types.ts), users (types.ts)

**Duplication:** Case, Document, User, Citizen types are defined independently in multiple imports with slightly different shapes.

**Recommendation:** One unified `src/types/` directory. `Case.ts`, `Document.ts`, `User.ts`, `Citizen.ts`, `Knowledge.ts`, `Notification.ts`, `Audit.ts`. Each type is defined once and imported everywhere.

### 1.14 Mock Data

**Appears in:** home (data.ts), case-workspace (mockData.ts), knowledge (mockData.ts), documents (mockData.ts), corpus (data.ts), supervisor (data.ts)

**Duplication:** Employee names, case numbers, document titles, citizen names appear across multiple mock files.

**Recommendation:** One unified `src/mocks/` directory with MSW (Mock Service Worker) handlers. A single `data.ts` exports all mock entities. Each page imports only what it needs.

---

## 2. Proposed Application Structure

```
src/
├── components/
│   ├── common/          Shared primitives — Button, Badge, Spinner, Skeleton, EmptyState
│   ├── layout/          Structural components — AppShell, AuthLayout, CaseWorkspaceLayout
│   ├── navigation/      Navigation components — TopNavigation, SubNavigation, Breadcrumb, TabBar, Sidebar
│   ├── tables/          Data display — DataTable, TablePagination, TableSkeleton
│   ├── forms/           Form primitives — FormField, TextInput, SelectInput, TextArea, DatePicker, FileUpload, SearchBar
│   ├── dialogs/         Overlays — Dialog, ConfirmDialog, Drawer, Toast
│   ├── workflow/        Case workflow — WorkflowStepper, Checklist, Wizard, AssignmentPanel
│   ├── knowledge/       Knowledge components — KnowledgeCard, RegulationBrowser, ProcedureTable, TemplateCard, FAQAccordion
│   ├── documents/       Document components — DocumentPreview, VersionComparison, DocumentUploader, IndexStatusCard
│   └── decision-support/ Decision support — DecisionSupportPanel, RegulationCitation, MissingInfoFlag
│
├── pages/
│   ├── login/           LoginPage, ForgotPasswordPage, ResetPasswordPage
│   ├── home/            HomePage (Sachbearbeiter + Supervisor variants)
│   ├── my-work/         InboxPage, ActiveCasesPage, WaitingPage, ArchivePage
│   ├── case-workspace/  CaseOverviewPage, CaseChecklistPage, CaseDocumentsPage, CaseNotesPage,
│   │                    CaseActivityPage, CaseDecisionSupportPage, CaseDraftPage, CaseSendPage
│   ├── knowledge/       KnowledgeSearchPage, RegulationsPage, ProceduresPage, TemplatesPage, FAQsPage
│   ├── documents/       DocumentListPage, DocumentUploadPage, DocumentDetailPage, IndexStatusPage
│   ├── new-case/        NewCaseWizardPage
│   ├── supervisor/      ApprovalQueuePage, ApprovalWorkspacePage
│   ├── administration/  AdminOverviewPage, AuditPage, JobsPage, BenchmarksPage, DevPage
│   ├── corpus/          CorpusHealthPage, CorpusInventoryPage
│   └── users/           UserListPage, UserDetailPage
│
├── layouts/
│   ├── AuthLayout.tsx           Centered card layout for login/forgot/reset
│   ├── AppLayout.tsx            Main application shell (TopNav + SubNav + Breadcrumb + Content + Sidebar)
│   ├── CaseWorkspaceLayout.tsx  AppLayout + persistent CaseHeader + contextual TabBar
│   └── AdminLayout.tsx          AppLayout with Admin-only navigation restrictions
│
├── hooks/
│   ├── useAuth.ts               Authentication state + token management
│   ├── useCase.ts               Current case context
│   ├── useDecisionSupport.ts    Decision support analysis state machine
│   ├── useDebounce.ts           Debounced value for search inputs
│   ├── useAutosave.ts           Autosave timer for draft decisions
│   └── useKeyboardShortcuts.ts  Global keyboard shortcut registry
│
├── services/
│   ├── authService.ts           Login, logout, refresh, current user
│   ├── caseService.ts           Workspace CRUD, phase advance, timeline
│   ├── documentService.ts       Document CRUD, upload, reindex
│   ├── searchService.ts         Unified search
│   ├── decisionService.ts       Decision support analysis
│   ├── auditService.ts          Audit event queries
│   └── providerService.ts       AI provider status + models
│
├── api/
│   ├── client.ts                Axios/fetch instance with JWT interceptor + token refresh
│   └── endpoints.ts             Endpoint URL constants
│
├── router/
│   ├── index.tsx                Route definitions
│   ├── ProtectedRoute.tsx       Auth guard wrapper
│   └── AdminRoute.tsx           Admin role guard wrapper
│
├── types/
│   ├── Case.ts                  Vorgang type + states
│   ├── Document.ts              Dokument type + status
│   ├── User.ts                  Benutzer type + roles
│   ├── Citizen.ts               Bürger type
│   ├── Knowledge.ts             Vorschrift, Verfahren, Vorlage, FAQ types
│   ├── Notification.ts          Notification type
│   ├── Audit.ts                 Audit event type
│   └── Api.ts                   API request/response DTOs
│
├── utils/
│   ├── formatters.ts            Date, currency, case number formatters
│   ├── validators.ts            Form validation functions
│   ├── riskCalculator.ts        Risk indicator computation
│   └── breadcrumbs.ts           Breadcrumb path builder
│
├── constants/
│   ├── routes.ts                Route path constants
│   ├── roles.ts                 Role constants
│   ├── statuses.ts              Status label maps
│   └── config.ts                App configuration (API base URL, refresh interval, etc.)
│
├── mocks/
│   ├── handlers.ts              MSW request handlers
│   ├── data.ts                  Mock entities (employees, citizens, cases, documents)
│   └── server.ts                MSW server setup (development only)
│
├── styles/
│   ├── tokens.css               CSS custom properties (from DESIGN.md)
│   ├── global.css               Global resets + Tailwind imports
│   └── tailwind.config.ts       Tailwind theme mapping design tokens
│
├── assets/
│   ├── images/                  Static images
│   ├── icons/                   Custom SVG icons (if any — prefer Lucide)
│   └── fonts/                   Self-hosted font files (optional — prefer Google Fonts CDN)
│
├── App.tsx                      Root component — providers, router
└── main.tsx                     Entry point
```

### Directory Responsibilities

| Directory | Must Contain | Must Never Contain |
|---|---|---|
| `components/common/` | Reusable primitives used by 3+ pages | Page-specific business logic |
| `components/layout/` | Structural wrappers (AppShell, layouts) | Content, data fetching |
| `components/navigation/` | Nav bars, tabs, breadcrumbs, sidebars | Page content |
| `pages/` | One directory per screen, index.tsx entry | Reusable components (extract to components/) |
| `layouts/` | Page layout wrappers | Reusable UI primitives |
| `hooks/` | Custom React hooks | JSX rendering |
| `services/` | API call functions, data transformation | React components or hooks |
| `api/` | HTTP client config, endpoint constants | Business logic |
| `types/` | TypeScript interfaces and types | Runtime code |
| `utils/` | Pure utility functions | React code, API calls |
| `constants/` | Static configuration values | Computed values |
| `mocks/` | MSW handlers, mock data | Production code |
| `styles/` | CSS, design tokens, Tailwind config | Component logic |

---

## 3. Layout Architecture

### 3.1 AuthLayout

**Used by:** Login, ForgotPassword, ResetPassword, FirstLogin

**Structure:**
```
┌──────────────────────────────────────────┐
│  Centered card (max-width: 420px)        │
│  ┌──────────────────────────────────────┐│
│  │  Municipality Logo (64px)            ││
│  │  Application Name                    ││
│  │  Content (form)                      ││
│  │  Footer (version, language selector) ││
│  └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

**Responsibility:** Centered card layout. No navigation. No sidebar. Gray-50 background.

### 3.2 AppLayout

**Used by:** Startseite, Meine Arbeit (list views), Wissen, Dokumentenverwaltung, Verwaltung

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  TopNavigation (56px)                                            │
├──────────────────────────────────────────────────────────────────┤
│  SubNavigation (44px, conditional — shown when page has sub-tabs) │
├──────────────────────────────────────────────────────────────────┤
│  Breadcrumb (28px)                                               │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬────────────────────────────────┐│
│  │  Main Content (flex: 1)     │  Sidebar (280-320px, optional) ││
│  └─────────────────────────────┴────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│  Toast Container (fixed, bottom-right)                           │
│  Dialog Overlay (fixed, conditional)                             │
└──────────────────────────────────────────────────────────────────┘
```

**Responsibility:** Global application shell. Renders TopNavigation, optional SubNavigation, Breadcrumb, main content area with optional right sidebar. Provides Toast and Dialog portals.

### 3.3 CaseWorkspaceLayout

**Used by:** All case workspace contextual tabs (Übersicht, Checkliste, Dokumente, Interne Notizen, Aktivität, Entscheidungsunterstützung, Entwurf, Versand, Genehmigung)

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  TopNavigation (56px)                                            │
├──────────────────────────────────────────────────────────────────┤
│  Breadcrumb (28px)                                               │
├──────────────────────────────────────────────────────────────────┤
│  CaseHeader — number, subject, citizen, assignee, status, due, risk│
├──────────────────────────────────────────────────────────────────┤
│  TabBar — Übersicht | Checkliste | Dokumente | Notizen | ...     │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬────────────────────────────────┐│
│  │  Tab Content (flex: 1)      │  DecisionSupportPanel (320px)  ││
│  │                             │  (on Übersicht + Entsch.unt.)   ││
│  └─────────────────────────────┴────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

**Responsibility:** Extends AppLayout. Adds persistent CaseHeader and TabBar. Manages which tab is active. Shows DecisionSupportPanel on Übersicht and Entscheidungsunterstützung tabs. The case header never disappears while in this layout.

### 3.4 AdminLayout

**Used by:** All Verwaltung sub-pages

**Structure:** Identical to AppLayout but restricts navigation — Verwaltung link is active, and the layout verifies ADMIN role on mount (redirects to 403 if unauthorized).

---

## 4. Page Inventory

### Authentication

| Page | Route | Layout | Key Components | Backend Endpoints |
|---|---|---|---|---|
| LoginPage | `/login` | AuthLayout | TextInput, Button, LanguageSelector | POST /api/auth/login |
| ForgotPasswordPage | `/login/forgot` | AuthLayout | TextInput, Button | (client-side email) |
| ResetPasswordPage | `/login/reset` | AuthLayout | TextInput (×2), Button, PasswordRules | (client-side) |

### Global Modules

| Page | Route | Layout | Key Components | Backend Endpoints |
|---|---|---|---|---|
| HomePage | `/home` | AppLayout + Sidebar | StatCard (×6), DataTable (×5), NextTask, DecisionSupportPanel | GET /api/workspaces, POST /api/decision, GET /api/audit/events |
| InboxPage | `/work/inbox` | AppLayout + SubNav | DataTable, StatusBadge, RiskIndicator | GET /api/workspaces |
| ActiveCasesPage | `/work/active` | AppLayout + SubNav | DataTable, StatusBadge, RiskIndicator | GET /api/workspaces |
| WaitingPage | `/work/waiting` | AppLayout + SubNav | DataTable, StatusBadge, WaitingDaysCounter | GET /api/workspaces |
| ApprovalQueuePage | `/work/approvals` | AppLayout + SubNav | DataTable, StatusBadge | GET /api/workspaces |
| ArchivePage | `/work/archive` | AppLayout + SubNav | DataTable, SearchBar | GET /api/workspaces, GET /api/audit/events |
| KnowledgeSearchPage | `/knowledge` | AppLayout + SubNav + Sidebar | SearchBar, KnowledgeCard, CategoryDivider, FavoritesSidebar | POST /api/search |
| RegulationsPage | `/knowledge/regulations` | AppLayout + SubNav + Sidebar | RegulationBrowser, FavoritesSidebar | GET /api/documents |
| ProceduresPage | `/knowledge/procedures` | AppLayout + SubNav | ProcedureTable | (client-side composition) |
| TemplatesPage | `/knowledge/templates` | AppLayout + SubNav | TemplateCard | (client-side composition) |
| FAQsPage | `/knowledge/faqs` | AppLayout + SubNav | FAQAccordion | (client-side composition) |
| DocumentListPage | `/documents` | AppLayout + SubNav | DataTable, StatusBadge | GET /api/documents |
| DocumentUploadPage | `/documents/upload` | AppLayout + SubNav | FileUpload, MetadataForm, ProgressIndicator | POST /documents/upload |
| DocumentDetailPage | `/documents/:id` | AppLayout + SubNav | DocumentPreview, VersionComparison, MetadataForm | GET /api/documents/{id}, GET /api/documents/{id}/content |
| IndexStatusPage | `/documents/index-status` | AppLayout + SubNav | StatCard, DataTable, ProgressIndicator | GET /api/documents |
| NewCaseWizardPage | `/work/new` | AppLayout | Wizard, DocumentForm, CitizenSearch | POST /api/workspaces |

### Case Workspace (Contextual)

| Page | Route | Layout | Key Components | Backend Endpoints |
|---|---|---|---|---|
| CaseOverviewPage | `/work/:caseId` | CaseWorkspaceLayout | WorkflowStepper, RiskIndicator, DecisionSupportPanel | GET /api/workspaces/{id} |
| CaseChecklistPage | `/work/:caseId/checklist` | CaseWorkspaceLayout | Checklist | GET /api/workspaces/{id} |
| CaseDocumentsPage | `/work/:caseId/documents` | CaseWorkspaceLayout | DataTable, FileUpload (case-only) | GET /api/workspaces/{id}/documents |
| CaseNotesPage | `/work/:caseId/notes` | CaseWorkspaceLayout | TextArea, NoteList | GET /api/workspaces/{id} |
| CaseActivityPage | `/work/:caseId/activity` | CaseWorkspaceLayout | Timeline | GET /api/workspaces/{id}/timeline |
| CaseDecisionSupportPage | `/work/:caseId/decision-support` | CaseWorkspaceLayout | DecisionSupportPanel | POST /api/decision |
| CaseDraftPage | `/work/:caseId/draft` | CaseWorkspaceLayout | TemplateSelector, RichTextEditor | (client-side + POST advance) |
| CaseSendPage | `/work/:caseId/send` | CaseWorkspaceLayout | DocumentPreview, CoverLetterEditor | (client-side) |

### Supervisor

| Page | Route | Layout | Key Components | Backend Endpoints |
|---|---|---|---|---|
| ApprovalWorkspacePage | `/work/:caseId/approval` | CaseWorkspaceLayout | ComparisonWorkspace, AutoVerification, ConfirmDialog | GET /api/workspaces/{id}, POST advance |

### Administration (ADMIN only)

| Page | Route | Layout | Key Components | Backend Endpoints |
|---|---|---|---|---|
| AdminOverviewPage | `/admin` | AdminLayout | InfoCard (×8) | — |
| AuditPage | `/admin/audit` | AdminLayout + SubNav | DataTable, SearchBar, DateRangePicker | GET /api/audit/events |
| JobsPage | `/admin/jobs` | AdminLayout + SubNav | DataTable, StatusBadge | GET /api/document-ingestion-jobs |
| BenchmarksPage | `/admin/benchmarks` | AdminLayout + SubNav | StatCard, DataTable | (CLI-only today) |
| DevPage | `/admin/dev` | AdminLayout + SubNav | DataTable, CodeBlock | GET /dev/perf, GET /dev/knowledge/* |
| CorpusHealthPage | `/admin/corpus-health` | AdminLayout + SubNav | StatCard (×10), DataTable, StatusBadge | GET /admin/corpus-health |
| CorpusInventoryPage | `/admin/corpus-inventory` | AdminLayout + SubNav | DataTable, InfoCard | GET /admin/corpus-inventory |
| UserListPage | `/admin/users` | AdminLayout + SubNav | DataTable, StatusBadge | (needs endpoint) |
| UserDetailPage | `/admin/users/:id` | AdminLayout | Form, RoleSelector | (needs endpoint) |

### Error Pages

| Page | Route | Layout | Key Components |
|---|---|---|---|
| NotFoundPage | `*` | AppLayout | ErrorIllustration, Button (Zur Startseite, Suche) |
| UnauthorizedPage | (on 401) | AuthLayout | ErrorIllustration, Button (Zur Anmeldung) |
| ForbiddenPage | (on 403) | AppLayout | ErrorIllustration, Button (Zur Startseite) |
| ServerErrorPage | (on 500) | AppLayout | ErrorIllustration, ErrorId, Button (Neu laden, Zur Startseite) |

---

## 5. Component Inventory

### P1 — Foundation (must exist before any page)

| Component | Origin Imports | Props | State | Pages Using |
|---|---|---|---|---|
| Button | login/v1 | variant, size, loading, disabled, onClick, children | loading | All |
| TextInput | login/v1 | label, value, onChange, error, required, disabled, type, placeholder | value, error | Login, Forms, SearchBar |
| SelectInput | new-case/v1 | label, value, onChange, options, error, required | value, error | Forms, Filters |
| DataTable | home/v1, documents/v1 | columns, data, sortable, pagination, onRowClick, emptyState | sort, page, loading | 18 pages |
| Badge | case-workspace/v1 | variant (success/warning/error/info/neutral), children | — | All |
| StatusDot | case-workspace/v1 | status (green/amber/red/gray) | — | Tables, Headers |
| Spinner | login/v1 | size (sm/md/lg) | — | Buttons, Pages |
| Skeleton | home/v1 | variant (table-row/text/card), count | — | All data pages |
| TopNavigation | home/v1, documents/v1, case-workspace/v1 | userName, userInitials, unreadCount | activeModule | All app pages |
| SubNavigation | case-workspace/v1, documents/v1 | tabs, activeTab, onTabChange | — | Meine Arbeit, Wissen, Dokumente, Verwaltung, Case Workspace |
| Breadcrumb | new-case/v1 | path: {label, href}[] | — | All app pages |
| Sidebar | home/v1, documents/v1, case-workspace/v1 | position, width, collapsible, children | collapsed | Home, Wissen, Case Workspace |
| AppLayout | (new) | children | — | All app pages |
| AuthLayout | (new) | children | — | Login, Forgot, Reset |

### P2 — Core Workflow (needed for case processing)

| Component | Origin Imports | Props | State | Pages Using |
|---|---|---|---|---|
| StatCard | home/v1, corpus/v1 | label, value, linkLabel, onLinkClick | — | Home, Corpus, Admin |
| InfoCard | administration/v1 | icon, title, description, actionLabel, onAction | — | Admin Overview |
| CaseHeader | case-workspace/v1 | caseNumber, subject, citizen, assignee, status, dueDate, risk | — | All case workspace pages |
| TabBar | case-workspace/v1 | tabs, activeTab, onTabChange | — | Case workspace |
| WorkflowStepper | case-workspace/v1 | phases, currentPhase | — | Case overview |
| Checklist | case-workspace/v1 | items, onToggle, onAdd, onRemove, readOnly | items | Case checklist |
| Timeline | case-workspace/v1 | events, showFull | — | Case activity, Audit |
| RiskIndicator | case-workspace/v1 | level (gering/mittel/hoch) | — | Case header, Case lists, Home |
| Dialog | home/v1, administration/v1 | open, onClose, title, children, actions | open | Confirmations, Modals |
| ConfirmDialog | home/v1, administration/v1 | open, onClose, onConfirm, title, message, variant | open | Delete, Archive, Submit |
| Toast | (new) | type, message, action, onDismiss | visible | All |
| NotificationBell | home/v1, administration/v1, case-workspace/v1 | notifications, onNotificationClick | unreadCount | TopNavigation |
| SearchBar | case-workspace/v1, knowledge/v1 | value, onChange, onSubmit, filters, placeholder | value, filters | Wissen, Documents, Archive |
| FormField | login/v1, new-case/v1 | label, required, helpText, error, children | — | All forms |
| FileUpload | new-case/v1, documents/v1 | onUpload, acceptedTypes, maxSize, multiple | uploading, progress | Upload, Case Documents |
| DatePicker | new-case/v1 | label, value, onChange, error, min, max | value | Forms |
| TextArea | case-workspace/v1 | label, value, onChange, rows, error | value | Notes, Forms |

### P3 — Specialized (domain-specific components)

| Component | Origin Imports | Props | State | Pages Using |
|---|---|---|---|---|
| DecisionSupportPanel | case-workspace/v1 | caseId, question | analyzing, result, error | Case Overview, Home (sidebar) |
| RegulationCitation | case-workspace/v1 | regulation, relevance, excerpt, documentId | — | Decision Support, Knowledge |
| MissingInfoFlag | case-workspace/v1 | label, onRequestDocument | — | Decision Support, Case Overview |
| DocumentPreview | documents/v1 | documentId, version | — | Document Detail, Case Documents |
| VersionComparison | documents/v1 | versionA, versionB, changes | — | Document Detail |
| KnowledgeCard | knowledge/v1 | type, title, excerpt, relevance, source, onOpen | — | Knowledge Search |
| RegulationBrowser | knowledge/v1 | departments, onSelect | selectedDepartment, selectedRegulation | Regulations |
| ProcedureTable | knowledge/v1 | procedure, steps | — | Procedures |
| TemplateCard | knowledge/v1 | template, onPreview, onUse | — | Templates |
| FAQAccordion | knowledge/v1 | faqs, department | expandedIndex | FAQs |
| Wizard | new-case/v1 | steps, currentStep, onNext, onBack, onFinish | currentStep | New Case |
| WizardStepper | new-case/v1 | steps, currentStep | — | New Case Wizard |
| ComparisonWorkspace | supervisor/v1 | application, draft, changes, verifications | — | Approval Workspace |
| AssignmentPanel | (new) | assignee, onReassign, reasons | reassigning | Case Overview |
| FavoritesSidebar | knowledge/v1 | favorites, recentlyUsed, onToggle | — | Knowledge |
| IndexStatusCard | corpus/v1, documents/v1 | stats | — | Index Status, Corpus |
| ProgressIndicator | documents/v1 | value, label | — | Upload, Decision Support, Ingestion |
| EmptyState | (new) | icon, title, description, action | — | All pages |
| ErrorScreen | (new) | code, title, message, actions | — | Error pages |

---

## 6. Design System — Unification Required

### Critical Inconsistencies

| Issue | Current State | Resolution |
|---|---|---|
| **Color palettes** | 10 different palettes across imports | Adopt one palette from `docs/DESIGN.md`. Map all components to `--color-*` custom properties. |
| **CSS approach** | Tailwind (5), vanilla CSS variables (3), CSS Modules (1), mixed (1) | Adopt Tailwind with `tailwind.config.ts` extending theme from DESIGN.md tokens. CSS Modules permitted for complex component internals. |
| **Primary blue** | `#0D6EFD` (case-workspace), `#002045` (documents), `#1A365D` (corpus), `#2B6CB0` (home), `#2563eb` (new-case, login), `#1e3a8a` (administration) | Standardize on `#2B6CB0` (blue-700) as primary. `#1A365D` (blue-900) for headings. `#3182CE` (blue-500) for focus rings. |
| **Gray scale** | Each import defines a different gray set | Use DESIGN.md gray scale: #1A1A2E, #4A5568, #718096, #A0AEC0, #CBD5E0, #E2E8F0, #EDF2F7, #F7FAFC, #FAFBFC |
| **Icon library** | Lucide (all) + Material Symbols (corpus only) | Standardize on Lucide React. Remove Material Symbols dependency. |
| **Font weights** | Varying — some import 300, 800, 900 | Standardize: Inter 400, 500, 600, 700. JetBrains Mono 400, 500. |
| **Animation library** | Framer Motion (administration, corpus), plain CSS (others) | Adopt Framer Motion for complex animations (dialogs, toasts). Use CSS transitions for simple hover/focus. |
| **Spacing scale** | Inconsistent — some use Tailwind defaults, some custom | Adopt DESIGN.md spacing: 4, 8, 12, 16, 20, 24, 32, 40, 56px. Map to Tailwind `theme.extend.spacing`. |

### Unified Design Token Configuration

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#1A365D',
          700: '#2B6CB0',
          500: '#3182CE',
          100: '#EBF8FF',
          50: '#F7FAFC',
        },
        gray: {
          900: '#1A1A2E',
          700: '#4A5568',
          600: '#718096',
          500: '#A0AEC0',
          400: '#CBD5E0',
          300: '#E2E8F0',
          200: '#EDF2F7',
          100: '#F7FAFC',
          50: '#FAFBFC',
        },
        success: { 700: '#276749', 100: '#F0FFF4' },
        warning: { 700: '#975A16', 100: '#FFFFF0' },
        error: { 700: '#9B2C2C', 100: '#FFF5F5' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        h1: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        small: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        stat: ['28px', { lineHeight: '36px', fontWeight: '700' }],
      },
      spacing: {
        1: '4px', 2: '8px', 3: '12px', 4: '16px',
        5: '20px', 6: '24px', 8: '32px', 10: '40px', 14: '56px',
      },
      borderRadius: {
        sm: '4px', md: '6px', lg: '8px',
      },
    },
  },
};
```

---

## 7. Routing

```
/login                                          → LoginPage
/login/forgot                                   → ForgotPasswordPage
/login/reset                                    → ResetPasswordPage

/home                                           → HomePage (ProtectedRoute)

/work                                            → redirect to /work/inbox
/work/inbox                                      → InboxPage (ProtectedRoute)
/work/active                                     → ActiveCasesPage (ProtectedRoute)
/work/waiting                                    → WaitingPage (ProtectedRoute)
/work/approvals                                  → ApprovalQueuePage (ProtectedRoute, Supervisor only)
/work/archive                                    → ArchivePage (ProtectedRoute)
/work/new                                        → NewCaseWizardPage (ProtectedRoute)
/work/:caseId                                    → CaseOverviewPage (ProtectedRoute)
/work/:caseId/checklist                          → CaseChecklistPage (ProtectedRoute)
/work/:caseId/documents                          → CaseDocumentsPage (ProtectedRoute)
/work/:caseId/notes                              → CaseNotesPage (ProtectedRoute)
/work/:caseId/activity                           → CaseActivityPage (ProtectedRoute)
/work/:caseId/decision-support                   → CaseDecisionSupportPage (ProtectedRoute)
/work/:caseId/draft                              → CaseDraftPage (ProtectedRoute)
/work/:caseId/send                               → CaseSendPage (ProtectedRoute)
/work/:caseId/approval                           → ApprovalWorkspacePage (ProtectedRoute, Supervisor only)

/knowledge                                       → KnowledgeSearchPage (ProtectedRoute)
/knowledge/regulations                           → RegulationsPage (ProtectedRoute)
/knowledge/procedures                            → ProceduresPage (ProtectedRoute)
/knowledge/templates                             → TemplatesPage (ProtectedRoute)
/knowledge/faqs                                  → FAQsPage (ProtectedRoute)

/documents                                       → DocumentListPage (ProtectedRoute)
/documents/upload                                → DocumentUploadPage (ProtectedRoute)
/documents/index-status                          → IndexStatusPage (ProtectedRoute)
/documents/:id                                   → DocumentDetailPage (ProtectedRoute)

/admin                                           → AdminOverviewPage (AdminRoute)
/admin/corpus-health                             → CorpusHealthPage (AdminRoute)
/admin/corpus-inventory                          → CorpusInventoryPage (AdminRoute)
/admin/audit                                     → AuditPage (AdminRoute)
/admin/jobs                                      → JobsPage (AdminRoute)
/admin/benchmarks                                → BenchmarksPage (AdminRoute)
/admin/dev                                       → DevPage (AdminRoute)
/admin/users                                     → UserListPage (AdminRoute)
/admin/users/:id                                 → UserDetailPage (AdminRoute)

*                                                → NotFoundPage
```

**Route guards:**
- `ProtectedRoute`: Redirects to `/login` if no valid JWT token. Shows session expired modal on 401.
- `AdminRoute`: Extends ProtectedRoute. Redirects to `/home` with 403 toast if user lacks ADMIN role.

**Deep links:** All case workspace routes (`/work/:caseId/*`) are directly linkable. The case is fetched by ID on mount. Breadcrumbs reflect the navigation path.

---

## 8. State Management

### Global State (React Context)

| Context | Values | Used By |
|---|---|---|
| `AuthContext` | user, accessToken, refreshToken, isAuthenticated, login, logout | All pages (via ProtectedRoute) |
| `NotificationContext` | notifications, unreadCount, markRead, markAllRead | TopNavigation, NotificationBell |
| `ToastContext` | toasts, addToast, removeToast | All pages (via AppLayout) |

### Server State (TanStack Query)

| Query Key | Data | Used By |
|---|---|---|
| `['workspaces', filters]` | Paginated case list | Home, Inbox, Active, Waiting, Archive |
| `['workspace', caseId]` | Single case detail | Case workspace (all tabs) |
| `['workspace', caseId, 'documents']` | Case documents | Case documents tab |
| `['workspace', caseId, 'timeline']` | Case activity | Case activity tab |
| `['documents', filters]` | Paginated document list | Document list |
| `['document', id]` | Single document | Document detail |
| `['search', query]` | Search results | Knowledge search |
| `['decision', caseId]` | Decision support result | Decision support panel |
| `['audit', filters]` | Audit events | Audit page |
| `['jobs', filters]` | Ingestion jobs | Jobs page |
| `['corpus-health']` | Corpus health data | Corpus health page |
| `['users']` | User list | User management |

### Local State (useState/useReducer)

| State | Location |
|---|---|
| Form field values | Individual form components |
| Active tab | Page component (SubNavigation/TabBar) |
| Dialog open/close | Page component |
| Sidebar collapsed | AppLayout (persisted to localStorage) |
| Search input value | SearchBar component (debounced) |
| Checklist items | CaseChecklistPage (optimistic updates) |
| Draft editor content | CaseDraftPage (autosave every 30s) |
| Wizard step | NewCaseWizardPage |

### State That Must Never Be Global

- Current scroll position
- Transient form state (resets on navigation)
- Component animation state
- Decision support intermediate loading state (resets per analysis)

---

## 9. API Boundaries

### Loading Strategy

| Data Type | Strategy |
|---|---|
| Case lists | TanStack Query with 30s stale time, background refetch on window focus |
| Case detail | TanStack Query with 10s stale time, refetch on tab change |
| Document lists | TanStack Query with 60s stale time (documents change infrequently) |
| Search results | TanStack Query with 0s stale time (always fetch fresh) |
| Decision support | TanStack Query mutation — POST, no caching, show progress during analysis |
| Audit events | TanStack Query with 30s stale time, paginated |
| Corpus health | TanStack Query with 120s stale time, manual refetch button |
| File upload | Fetch with progress events, no caching |

### Optimistic Updates

| Action | Strategy |
|---|---|
| Toggle checklist item | Optimistic — revert on error with toast |
| Add/remove checklist item | Optimistic — revert on error |
| Save internal note | Optimistic — append to list, revert on error |
| Change assignment | Optimistic — update header, revert on error |
| Archive case | Confirmation dialog → mutation → invalidate list queries |
| Delete document | Confirmation dialog → mutation → invalidate list queries |
| Submit for approval | Confirmation dialog → mutation → invalidate case query |
| Upload document | No optimistic — show progress, update list on complete |

### Caching Opportunities

- Document content (rarely changes after indexing): cache 5 minutes
- Regulation metadata (static): cache indefinitely, invalidate on reindex
- User profile: cache until logout
- Provider status: cache 60 seconds
- Knowledge tables (salary, travel, thresholds): cache until next deployment

---

## 10. Merge Strategy

### Phase 1 — Extract Shared Styles (Day 1)

1. Create `src/styles/tokens.css` with CSS custom properties from DESIGN.md.
2. Create `tailwind.config.ts` mapping all design tokens.
3. Create `src/styles/global.css` importing Inter + JetBrains Mono, Tailwind directives, and base resets.
4. Verify the token set against all 10 imports to ensure every used color/spacing/font has a corresponding token.

### Phase 2 — Extract Layouts (Day 2)

1. Build `AuthLayout` using the login import as reference.
2. Build `AppLayout` using the home and documents imports as reference — extract TopNavigation, SubNavigation, Breadcrumb, Sidebar.
3. Build `CaseWorkspaceLayout` using the case-workspace import — extract CaseHeader and TabBar.
4. Build `AdminLayout` as AppLayout + ADMIN role guard.

### Phase 3 — Extract Common Components (Days 3-5)

In priority order:
1. Button, TextInput, SelectInput, FormField (P1 foundation)
2. DataTable, Badge, StatusDot, Spinner, Skeleton (P1 display)
3. Dialog, ConfirmDialog, Toast, NotificationBell (P1 feedback)
4. StatCard, InfoCard, SearchBar, DatePicker, TextArea, FileUpload (P2 forms/display)
5. Checklist, Timeline, WorkflowStepper, RiskIndicator (P2 workflow)
6. DecisionSupportPanel, RegulationCitation, KnowledgeCard, DocumentPreview (P3 domain)

Each component is extracted by: reading the best implementation across all imports, adapting to TypeScript with proper interfaces, mapping styles to design tokens, and adding accessibility attributes.

### Phase 4 — Unify Types (Day 3, parallel)

1. Extract all type definitions from `types.ts` files across imports.
2. Identify the union of all fields for each entity.
3. Define canonical TypeScript interfaces in `src/types/`.
4. Remove duplicate type definitions from all future extracted components.

### Phase 5 — Unify Mock Data (Day 4, parallel)

1. Extract all mock data from `data.ts` / `mockData.ts` files.
2. Consolidate into `src/mocks/data.ts` with canonical entities.
3. Set up MSW handlers in `src/mocks/handlers.ts`.
4. Configure MSW server for development mode.

### Phase 6 — Rebuild Pages (Days 6-10)

Each page is rebuilt by composing extracted components. The Stitch import serves as the visual reference — the rebuilt page must render identically.

Priority order: Login → Home → Case Workspace → Wissen → Dokumente → New Case → Supervisor → Administration → Corpus → Users.

### Phase 7 — Introduce Routing (Day 5, parallel)

1. Set up React Router with all routes from Section 7.
2. Implement ProtectedRoute and AdminRoute guards.
3. Wire up TanStack Query provider and AuthContext provider in App.tsx.
4. Test navigation flow: Login → Home → Case → Tab → Back.

### Phase 8 — Backend Integration (Days 11-14)

1. Create `src/api/client.ts` with JWT interceptor and silent refresh.
2. Create service functions in `src/services/` for each endpoint group.
3. Replace mock data with real API calls, page by page.
4. Implement error handling, loading states, and empty states.
5. Verify against the 3 P1 missing JSON endpoints — flag if still needed.

---

## Appendix — Import Quality Assessment

| Import | Files | Components | Completeness | CSS Quality | Notes |
|---|---|---|---|---|---|
| login/v1 | 21 | 4 (Button, InputField, SecurityNotice, Footer) | Full flow | Good — Tailwind, tokens close to spec | Best Button + InputField implementation |
| home/v1 | 22 | 8 (TopNavBar, CaseTable, StatsGrid, NextTask, SuggestionsSidebar, Header, Footer, InteractiveDialogs) | Full dashboard | Good — Tailwind, closest to DESIGN.md colors | Best TopNavigation + DataTable + StatCard |
| case-workspace/v1 | 24 | 9 (Header, SubNav, MetadataSidebar, PhaseStepper, ChecklistCard, DocumentsCard, TimelineNotesCard, DecisionSupport, WarningBanner) | Full workspace | Fair — vanilla CSS, wrong primary blue | Best workflow components, needs token mapping |
| knowledge/v1 | 13 | 0 (no extracted components) | Skeleton only | Minimal — Tailwind, no custom styles | Needs full component extraction |
| documents/v1 | 28 | 6 (TopNavBar, SubNavBar, DocumentTable, DetailPreview, Sidebar, Footer) | Full CRUD | Best — CSS Modules, well-structured | Best CSS architecture, best table implementation |
| new-case/v1 | 19 | 6 (Header, Breadcrumb, WizardStepper, DocumentForm, SidebarHelp, Footer) | Full wizard | Fair — vanilla CSS, 888 lines | Best Wizard + Breadcrumb implementation |
| supervisor/v1 | 19 | 5 (Header, ComparisonWorkspace, SidebarLeft, SidebarRight, Footer) | Full approval | Good — Tailwind, colors close to spec | Best side-by-side comparison layout |
| administration/v1 | 20 | 6 (Header, Sidebar, CorpusStatusCard, AuditLogsCard, BackgroundJobsCard, SystemStatusCard, Modals) | Full tool grid | Good — Tailwind, slightly wrong palette | Best admin card grid + modal patterns |
| corpus/v1 | 23 | 9 (Header, Sidebar, OverviewDashboard, KnowledgeTable, DetailDrawer, UploadModal, AuditLogsView, BackgroundJobsView, UsersView, StatusSidebar) | Full management | Good — Tailwind, closest to DESIGN.md colors | Best admin dashboard, extraneous Material Symbols dependency |
| users/v1 | 12 | 0 (no extracted components) | Skeleton only | Minimal — Tailwind only | Needs full component extraction |
