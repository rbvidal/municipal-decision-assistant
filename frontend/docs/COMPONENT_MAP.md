# Component Map

Every reusable UI component in the application. Components are implemented once in `src/components/` and imported wherever needed. Never duplicate a component.

## Layout Components

| Component | Directory | Purpose |
|---|---|---|
| AppShell | `components/layout/` | Persistent application shell — top bar, sub-nav, breadcrumb, main content, sidebar, toast layer, dialog layer |
| AuthLayout | `components/layout/` | Centered card layout for authentication screens |
| Workspace | `components/layout/` | Tab content container — vertical flex column with consistent gap |
| WorkspaceSection | `components/layout/` | Section within a workspace — optional heading, vertical content gap |
| SplitPane | `components/search/` | Two-pane horizontal layout — configurable column widths via CSS Grid |

## Search Components

| Component | Directory | Purpose |
|---|---|---|
| SearchBar | `components/search/` | Search input with icon, clear button, Enter-to-submit, controlled value |
| FilterPanel | `components/search/` | Collapsible filter sidebar — radiogroup options, active state, counts |
| ResultCard | `components/search/` | Search result card — title, snippet with highlighting, metadata, relevance, favorite |
| HighlightedText | `components/search/` | Text with `<mark>` highlighting for matched query terms |
| PreviewPane | `components/search/` | Document preview — metadata grid, TOC, full text, related procedures, downloads, law references |
| TagList | `components/search/` | Inline list of mono-font Badge tags |
| ReferenceList | `components/search/` | Linked references — icon + title + description per item |
| SearchSummary | `components/search/` | "X von Y Ergebnissen" summary with optional query display |

## Navigation Components

| Component | Directory | Purpose |
|---|---|---|
| TopNavigation | `components/navigation/` | Main navigation bar — 5 global module links, logo, notification bell, user menu |
| SubNavigation | `components/navigation/` | Second-level tab bar with count badges |
| Breadcrumb | `components/navigation/` | Page breadcrumb trail |
| Sidebar | `components/navigation/` | Right sidebar (280-320px, collapsible) for Decision Support or Favorites |
| NotificationBell | `components/navigation/` | Bell icon with unread badge + dropdown panel |
| UserMenu | `components/navigation/` | Avatar/name dropdown — profile, password, language, logout |
| TabBar | `components/navigation/` | Horizontal tab bar for case workspace contextual tabs |

## Data Display Components

| Component | Directory | Purpose |
|---|---|---|
| DataTable | `components/data/` | Generic typed data table — sortable columns, striped rows, loading state, empty state, keyboard-navigable rows |
| StatCard | `components/common/` | Stat display — large value, label, color-coded progress bar, optional click handler |
| Panel | `components/common/` | Card container with optional header (icon + title + action), default/subtle variants |
| InformationCard | `components/common/` | Icon + title + description + action button |
| PageHeader | `components/common/` | Screen title + optional action buttons |
| CaseHeader | `components/common/` | Persistent case identifier bar — case ID, title, applicant, assignee, status pills, priority, risk, deadline |
| ActivityTimeline | `components/common/` | Vertical timeline with entry nodes — edit/system types, connector lines, content boxes |
| PropertyGrid | `components/common/` | Key-value metadata grid using semantic dl/dt/dd elements |
| CitationCard | `components/common/` | Regulation citation — bold code + grey title, optional click handler |
| Alert | `components/common/` | Colored banner — warning/error/info/success, icon + title + description + action button |
| ActionToolbar | `components/common/` | Horizontal action button bar — primary/secondary variants with icons |
| StatusBadge | `components/common/` | Inline badge — green/amber/red/blue/gray |
| StatusDot | `components/common/` | 8px colored circle for status indication |
| RiskIndicator | `components/common/` | Colored dot + text label (Gering/Mittel/Hoch) |
| PriorityIndicator | `components/common/` | Colored dot + text label (Hoch/Mittel/Niedrig) |
| ConfidenceBar | `components/common/` | 6px segmented fill bar for decision support confidence |
| ProgressIndicator | `components/common/` | 6px blue fill bar with percentage label |
| Skeleton | `components/common/` | Gray-200 animated pulse placeholder |
| Spinner | `components/common/` | Animated spinner (16px/20px/32px) |

## Form Components

| Component | Directory | Purpose |
|---|---|---|
| FormField | `components/forms/` | Label + input + help text + error text wrapper |
| TextInput | `components/forms/` | Standard text input |
| SelectInput | `components/forms/` | Dropdown select with custom chevron |
| TextArea | `components/forms/` | Resizable textarea |
| DatePicker | `components/forms/` | Date input with calendar trigger |
| FileUpload | `components/forms/` | Drag-and-drop file upload zone with progress |
| SearchBar | `components/forms/` | Full-width search input with filters |

## Interaction Components

| Component | Directory | Purpose |
|---|---|---|
| Dialog | `components/interaction/` | Modal dialog — portal-rendered, focus trap, escape, scroll lock, sm/md/lg/fullscreen sizes |
| Drawer | `components/interaction/` | Slide-in panel — left/right/bottom, overlay, animation |
| ConfirmDialog | `components/interaction/` | Confirmation dialog — danger/warning/info modes, confirm/cancel actions |
| DropdownMenu | `components/interaction/` | Dropdown menu — items, icons, shortcuts, groups, danger items, click-outside |
| Tooltip | `components/interaction/` | Hover tooltip — top/bottom/left/right, configurable delay, keyboard accessible |
| Popover | `components/interaction/` | Click-triggered content panel — configurable position, click-outside dismiss |
| Wizard | `components/interaction/` | Multi-step wizard — step indicator, validation, next/back/finish/cancel |
| ToastContainer | `components/interaction/` | Fixed toast stack — success/warning/error/info, dismiss, animated |
| LoadingOverlay | `components/interaction/` | Loading overlay — blocking (portal) or non-blocking, spinner + message |

## Workflow Components

| Component | Directory | Purpose |
|---|---|---|
| WorkflowStepper | `components/workflow/` | Horizontal phase indicator — completed/active/inactive states with numbered nodes and connectors |
| ChecklistWidget | `components/workflow/` | Widget wrapping Panel + ChecklistItems + add form + progress bar |
| ChecklistItem | `components/workflow/` | Individual checklist row — custom checkbox, title, description, status badge |
| DocumentListWidget | `components/workflow/` | Widget wrapping Panel + DataTable + upload form for case documents |
| NotesWidget | `components/workflow/` | Widget wrapping Panel + note cards + inline add-note form |
| Wizard | `components/workflow/` | Multi-step form with progress indicator and Back/Next/Finish |
| AssignmentPanel | `components/workflow/` | Current assignee display + reassign with reason dropdown |

## Knowledge Components

| Component | Directory | Purpose |
|---|---|---|
| KnowledgeCard | `components/knowledge/` | Search result card with relevance bar, excerpt, source link |
| RegulationBrowser | `components/knowledge/` | Left sidebar (Fachbereich tree) + right detail panel |
| ProcedureTable | `components/knowledge/` | Structured procedure description table |
| TemplateCard | `components/knowledge/` | Template preview card with "In Vorgang verwenden" action |
| FAQAccordion | `components/knowledge/` | Expandable Q&A grouped by department |
| FavoritesSidebar | `components/knowledge/` | Favorites + recently used (280px, collapsible) |

## Document Components

| Component | Directory | Purpose |
|---|---|---|
| DocumentPreview | `components/documents/` | Metadata header + version tabs + full text with anchors |
| VersionComparison | `components/documents/` | Side-by-side diff with auto-detected changes |
| DocumentUploader | `components/documents/` | Upload drop zone + metadata form + progress |
| IndexStatusCard | `components/documents/` | Summary stat cards for indexing health |
| DocumentVersionHistory | `components/documents/` | Version list — current/non-current states, green checkmark indicator, Diff buttons |

## Approval Components

| Component | Directory | Purpose |
|---|---|---|
| ApprovalTimeline | `components/approval/` | Protocol step display — completed/pending/failed states, connector lines, icon indicators |
| ApprovalRecommendation | `components/approval/` | AI recommendation card — icon + emphasized text, info-styled container |
| ApprovalComments | `components/approval/` | Comments textarea — label, placeholder, controlled value |
| ApprovalRiskCard | `components/approval/` | Risk assessment display — GERING/MITTEL/HOCH with color-coded body |
| PrecedentCard | `components/approval/` | Precedent case reference — case ID, date, title, description, relevance badge, clickable |

## Decision Support Components

| Component | Directory | Purpose |
|---|---|---|
| DecisionSupportPanel | `components/decision-support/` | 320px sidebar — question, summary, regulations, missing info, checklist, next action, Erweitert |
| SuggestionCard | `components/common/` | AI suggestion item — case ID, type badge (Vorschlag/Zusammenfassung), title, description, optional action button |
| CitationCard | `components/common/` | Regulation citation — bold code + grey title, optional click handler |
| RegulationCitation | `components/decision-support/` | Regulation reference with excerpt + document link |
| MissingInfoFlag | `components/decision-support/` | Flag for missing information with request action |

## Button Components

| Component | Directory | Purpose |
|---|---|---|
| Button | `components/common/` | Primary, Secondary, Danger, Ghost variants. Sizes: sm, default, lg. Loading state. |
| IconButton | `components/common/` | 36×36px icon-only button with aria-label |

## Component Origins

Components may originate from multiple Stitch export versions. Each merged component must reference the version(s) from which it was extracted.

| Component | Origin |
|---|---|
| ActionToolbar | `case-workspace/v1` |
| ActivityTimeline | `case-workspace/v1` |
| Alert | `case-workspace/v1` |
| Badge | `home/v1` |
| Button | `login/v1`, `home/v1` |
| CaseHeader | `case-workspace/v1` |
| ChecklistItem | `case-workspace/v1` |
| ChecklistWidget | `case-workspace/v1` |
| CitationCard | `case-workspace/v1` |
| DataTable | `home/v1` |
| DocumentListWidget | `case-workspace/v1` |
| EmptyState | `home/v1` |
| Icon | `home/v1` |
| NotesWidget | `case-workspace/v1` |
| Panel | `home/v1` |
| PageTitleBar | `home/v1` |
| ProgressIndicator | `home/v1` |
| PropertyGrid | `case-workspace/v1` |
| Skeleton | `home/v1` |
| SuggestionCard | `home/v1` |
| StatCard | `home/v1` |
| StatusDot | `home/v1` |
| TabBar | `home/v1` |
| WorkflowStepper | `case-workspace/v1` |
| Workspace | `case-workspace/v1` |
| WorkspaceSection | `case-workspace/v1` |
| FilterPanel | `knowledge/v1` |
| HighlightedText | `knowledge/v1` |
| PreviewPane | `knowledge/v1` |
| ReferenceList | `knowledge/v1` |
| ResultCard | `knowledge/v1` |
| SearchBar | `knowledge/v1` |
| SearchSummary | `knowledge/v1` |
| SplitPane | `knowledge/v1` |
| TagList | `knowledge/v1` |
| ApprovalTimeline | `supervisor/v1` |
| ApprovalRecommendation | `supervisor/v1` |
| ApprovalComments | `supervisor/v1` |
| ApprovalRiskCard | `supervisor/v1` |
| PrecedentCard | `supervisor/v1` |
| DocumentVersionHistory | `documents/v1` |
| Dialog | `interaction/v1` |
| Drawer | `interaction/v1` |
| ConfirmDialog | `interaction/v1` |
| DropdownMenu | `interaction/v1` |
| Tooltip | `interaction/v1` |
| Popover | `interaction/v1` |
| Wizard | `interaction/v1` |
| ToastContainer | `interaction/v1` |
| LoadingOverlay | `interaction/v1` |

When a component is redesigned in a later export version, append the new origin: `login/v1, login/v2`. The component in `src/` represents the latest merged version. Previous versions remain archived in `imports/`.
