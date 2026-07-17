# Case Workspace

## Screen Name

Vorgang BAU-2026-0147 (`/work/{caseId}`)

## Purpose

Contextual workspace for processing a single Vorgang through its lifecycle. Persistent case header shows case number, subject, citizen, assignee, status, deadline, and risk. Six contextual tabs provide views into the case. Switching tabs never leaves the current case.

## Screens Included

- Übersicht (case summary, metadata, phase, risk, decision support panel)
- Checkliste (dynamic checklist, auto-populated, user-editable)
- Dokumente (case documents only — upload, preview, download, compare)
- Interne Notizen (author + timestamp, newest first)
- Aktivität (activity timeline — Bürger/Sachbearbeiter/Supervisor/System)
- Entscheidungsunterstützung (decision support panel contextual to this case)
- Entwurf (draft decision editor with template selector)
- Versand (generated reply + cover letter)
- Genehmigung (supervisor side-by-side comparison view)

## States

- Each tab has its own loading, empty, and error states
- Case not found (404)
- Case header always visible; tab content changes

## Related Backend Module(s)

- `platform-api` — WorkspaceController
- `platform-ai` — AiService, DecisionRouter
- `platform-search` — SearchService

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/workspaces/{id}` | GET | Case data with documents, timeline |
| `/api/workspaces/{id}/documents` | GET | Case documents |
| `/api/workspaces/{id}/timeline` | GET | Case activity timeline |
| `/api/workspaces/{id}/advance` | POST | Advance to next phase |
| `/api/workspaces/{id}/timeline` | POST | Add timeline event |
| `/api/decision` | POST | Decision support analysis |
| `/api/documents/{id}` | GET | Document detail |
| `/api/documents/{id}/content` | GET | Document full text |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
