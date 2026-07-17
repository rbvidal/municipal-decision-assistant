# Page Map

Every page in the application. Each page is a top-level route rendered inside the AppShell layout.

## Authentication

| Page | Route | Directory | Type |
|---|---|---|---|
| Login | `/login` | `pages/login/` | Global |
| Forgot Password | `/login/forgot` | `pages/login/` | Global |
| Reset Password | `/login/reset` | `pages/login/` | Global |

## Global Modules

| Page | Route | Directory | Type |
|---|---|---|---|
| Startseite | `/home` | `pages/home/` | Global | Implemented |
| Meine Arbeit — Posteingang | `/work/inbox` | `pages/my-work/` | Global | — |
| Meine Arbeit — Offene Vorgänge | `/work/active` | `pages/my-work/` | Global |
| Meine Arbeit — Warten | `/work/waiting` | `pages/my-work/` | Global |
| Meine Arbeit — Genehmigung | `/work/approvals` | `pages/my-work/` | Global (Supervisor) |
| Meine Arbeit — Archiv | `/work/archive` | `pages/my-work/` | Global |
| Wissen — Alles | `/knowledge` | `pages/knowledge/` | Global | Implemented |
| Wissen — Vorschriften | `/knowledge/regulations` | `pages/knowledge/` | Global |
| Wissen — Verfahren | `/knowledge/procedures` | `pages/knowledge/` | Global |
| Wissen — Vorlagen | `/knowledge/templates` | `pages/knowledge/` | Global |
| Wissen — FAQs | `/knowledge/faqs` | `pages/knowledge/` | Global |
| Dokumentenverwaltung — Alle | `/documents` | `pages/documents/` | Global | Implemented |
| Dokumentenverwaltung — Hochladen | `/documents/upload` | `pages/documents/` | Global |
| Dokumentenverwaltung — Index-Status | `/documents/index-status` | `pages/documents/` | Global |
| Dokumentenverwaltung — Detail | `/documents/:id` | `pages/documents/` | Global |
| Neuer Vorgang | `/work/new` | `pages/new-case/` | Global | Implemented |

## Case Workspace (Contextual)

| Page | Route | Directory | Type |
|---|---|---|---|
| Case — Übersicht | `/work/:caseId` | `pages/case-workspace/` | Contextual | Implemented |
| Case — Checkliste | `/work/:caseId/checklist` | `pages/case-workspace/` | Contextual | Implemented |
| Case — Dokumente | `/work/:caseId/documents` | `pages/case-workspace/` | Contextual | Implemented |
| Case — Interne Notizen | `/work/:caseId/notes` | `pages/case-workspace/` | Contextual | Implemented |
| Case — Aktivität | `/work/:caseId/activity` | `pages/case-workspace/` | Contextual | Implemented |
| Case — Entscheidungsunterstützung | `/work/:caseId/decision-support` | `pages/case-workspace/` | Contextual | Implemented |
| Case — Entwurf | `/work/:caseId/draft` | `pages/case-workspace/` | Contextual | Implemented |
| Case — Versand | `/work/:caseId/send` | `pages/case-workspace/` | Contextual | Implemented |

## Supervisor

| Page | Route | Directory | Type |
|---|---|---|---|
| Genehmigung Workspace | `/work/:caseId/approval` | `pages/supervisor/` | Contextual | Implemented |

## Administration (ADMIN only)

| Page | Route | Directory | Type |
|---|---|---|---|
| Verwaltung — Übersicht | `/admin` | `pages/administration/` | Global | Implemented |
| Verwaltung — Korpus-Status | `/admin/corpus-health` | `pages/corpus/` | Global | Implemented |
| Verwaltung — Audit | `/admin/audit` | `pages/administration/` | Global |
| Verwaltung — Aufträge | `/admin/jobs` | `pages/administration/` | Global |
| Verwaltung — Benchmarks | `/admin/benchmarks` | `pages/administration/` | Global |
| Verwaltung — Entwickler | `/admin/dev` | `pages/administration/` | Global |
| Verwaltung — Benutzer | `/admin/users` | `pages/users/` | Global | Implemented |

## Error Pages

| Page | Route | Directory | Type |
|---|---|---|---|
| 401 Unauthorized | (any, on 401) | `pages/login/` | Global |
| 403 Forbidden | (any, on 403) | `pages/login/` | Global |
| 404 Not Found | `*` | (shared) | Global |
| 500 Internal Error | (any, on 500) | (shared) | Global |

## Page Type Definitions

- **Global:** Operates across the entire municipality. No active case context.
- **Contextual:** Operates on a specific Vorgang. Persistent case header visible. Tabs switch views within the same case.

## Page Origins

Each page is generated from a Stitch export. The origin documents which import version produced the current implementation.

| Page | Generated From | Later Refined By |
|---|---|---|
| Login | `login/v1` | — |
| Startseite | `home/v1` | Implemented 2026-07-16 |
| Meine Arbeit | `case-workspace/v1` (list views) | — |
| Case Workspace | `case-workspace/v1` | Implemented 2026-07-16 |
| Wissen | `knowledge/v1` | Implemented 2026-07-16 |
| Dokumentenverwaltung | `documents/v1` | Implemented 2026-07-16 |
| Neuer Vorgang | `new-case/v1` | — |
| Genehmigung | `supervisor/v1` | Implemented 2026-07-16 |
| Verwaltung | `administration/v1` | — |
| Korpus-Status | `corpus/v1` | Implemented 2026-07-16 |
| Benutzerverwaltung | `users/v1` | — |
| (all rows) | To be filled after first Stitch merge | — |

When a page is redesigned, append the new version: `home/v1, home/v2`. The page in `src/` represents the latest merged version. Previous versions remain archived in `imports/`.
