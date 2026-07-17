# Supervisor Approval Workspace

## Screen Name

Genehmigung (`/work/{caseId}?tab=genehmigung`)

## Purpose

Supervisor review and approval workspace. Side-by-side comparison of the original application and the draft decision. Auto-detected changes are highlighted. Automated verification checks run against the decision (citations current, fees correct, deadlines met, four-eyes principle). Supervisor adds approval comment and approves, returns for revision, or rejects.

## Screens Included

- Genehmigung queue (list of cases awaiting approval)
- Approval workspace (side-by-side comparison)
- Auto-verification panel (checklist of automated checks)
- Approval comment input
- Confirmation dialogs (approve, return, reject)

## States

- Queue: normal, empty (no pending approvals)
- Workspace: loading, ready (both sides populated), error
- Auto-verification: all pass (green), warnings (amber), failures (red)
- Submit: loading, success (redirect to queue), error

## Related Backend Module(s)

- `platform-api` — WorkspaceController
- `platform-ai` — AiService

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/workspaces` | GET | List cases pending approval |
| `/api/workspaces/{id}` | GET | Case data with documents, timeline |
| `/api/workspaces/{id}/timeline` | POST | Add approval event to timeline |
| `/api/workspaces/{id}/advance` | POST | Advance phase (approve → ready to send) |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
