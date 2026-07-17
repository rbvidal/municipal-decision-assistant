# Merge Log

Tracks every Google Stitch import and every merge into the frontend codebase.

## Format

Each entry records: date, source (Stitch export directory), screens merged, components extracted, and notes.

---

## Log

| Date | Source | Screens | Components | Notes |
|---|---|---|---|---|
| 2026-07-16 | `home/v1` | Startseite (Home) | Panel, StatCard, DataTable, SuggestionCard | Phase 3 — first Stitch merge. Home page implemented as reference page. 4 new reusable components extracted, 10 existing components reused. |
| 2026-07-16 | `case-workspace/v1` | Case Workspace (8 tabs) | CaseHeader, WorkflowStepper, Alert, ActivityTimeline, PropertyGrid, CitationCard, ActionToolbar, ChecklistItem, ChecklistWidget, DocumentListWidget, NotesWidget, Workspace, WorkspaceSection | Phase 4 — case workspace with widget architecture. 13 new components extracted, 8 tabs implemented. |
| 2026-07-16 | `knowledge/v1` | Wissen (Knowledge) | SearchBar, FilterPanel, ResultCard, HighlightedText, PreviewPane, SplitPane, TagList, ReferenceList, SearchSummary | Phase 5 — reusable search subsystem. 10 new search components. |
| 2026-07-16 | `supervisor/v1` | Supervisor (Genehmigung) | ApprovalTimeline, ApprovalRecommendation, ApprovalComments, ApprovalRiskCard, PrecedentCard | Phase 6 — reusable approval subsystem. 5 new approval components. 3-panel layout. |
| 2026-07-16 | `documents/v1` | Dokumentenverwaltung | DocumentVersionHistory, DataTable (enhanced with selection) | Phase 7 — architecture validation. 1 new component. ~96% reuse. DataTable enhanced. |
| 2026-07-16 | `corpus/v1` | Korpus-Verwaltung | (none) | Phase 8 — pure composition. 0 new components. 100% reuse. 6 sub-views. |
| 2026-07-16 | `interaction/v1` | Interaction Infrastructure | Dialog, Drawer, ConfirmDialog, DropdownMenu, Tooltip, Popover, Wizard, ToastContainer, LoadingOverlay | Phase 9 — final reusable subsystem. 9 interaction components. |
| 2026-07-16 | `administration/v1, users/v1, new-case/v1` | Administration, Users, New Case Wizard | (none) | Phase 10 — remaining business modules. 0 new components. Pure composition. |
| 2026-07-17 | (infrastructure) | Application Runtime | Router, AuthContext, ApiClient, Service Layer, TanStack Query Hooks, ErrorBoundary, NotFoundPage | Phase 11 — application infrastructure. |
| 2026-07-17 | (backend integration) | REST Backend Integration | 7 REST services, Service Factory, ApiClient (interceptors/timeout/upload/error mapping), lucide-react | Phase 12 — backend integration. |
| 2026-07-17 | (decision intelligence) | Intelligent Decision Workspace | DecisionWorkspace, DecisionService, DecisionPackage DTOs, streaming hooks | Phase 13 — core differentiator. Structured JSON contract. Frontend renders, backend reasons. SSE streaming. |

---

## Merge Procedure

1. Export screen from Google Stitch into `stitch-export/{screen}/html/`.
2. Review generated HTML/CSS for compliance with UX baseline.
3. Extract reusable components into `src/components/`.
4. Adapt page structure into `src/pages/{screen}/`.
5. Map Stitch-generated styles to design tokens in `src/styles/`.
6. Update API calls to match `docs/API_MAPPING.md`.
7. Log the merge in this file with date, source, and notes.
8. Never commit raw Stitch output directly — always merge.

---

## Stitch Import Pipeline

```
Google Stitch
      ↓
Google AI Studio (generate screen from UX spec + DESIGN.md)
      ↓
Download Vite project (complete, self-contained)
      ↓
Copy into imports/<screen>/vX (preserve unchanged, never edit)
      ↓
Compare with previous versions (if v2, v3 — identify what changed)
      ↓
Extract reusable components → adapt → place in src/components/<category>/
      ↓
Merge page code → adapt → place in src/pages/<screen>/
      ↓
Document merge decisions in this log
```

### Pipeline Rules

- **Imports are immutable.** Nothing in `imports/` is ever edited.
- **One import per screen per version.** `imports/home/v1/` contains the complete first Stitch export of the home screen.
- **Versions accumulate.** v1, v2, v3 are all preserved. None are deleted.
- **Extraction is selective.** Not every line of Stitch output becomes production code. Only patterns that match the design system and component library are extracted.
- **Adaptation is required.** Stitch-generated code is adapted for TypeScript strictness, design token mapping, API client integration, and accessibility before entering `src/`.
- **Visual fidelity is the goal.** The production code must render identically to the Stitch export.
