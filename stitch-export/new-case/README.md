# New Case Wizard

## Screen Name

Neuer Vorgang (`/work/new`)

## Purpose

Step-by-step wizard for creating a new municipal case. Guides the Sachbearbeiter through case type selection, citizen lookup or creation, document attachment, metadata entry, deadline setting, and assignment. Auto-populates the initial checklist based on case type.

## Screens Included

- Step 1: Case type selection (Fachbereich + Vorgangstyp)
- Step 2: Citizen (search existing or create new)
- Step 3: Documents (attach files to the case)
- Step 4: Metadata (subject, description, priority, deadline)
- Step 5: Assignment (assign to self or colleague)
- Step 6: Review & Submit (summary of all entered data)
- Confirmation (case created with number, redirect to case workspace)

## States

- Each step: normal, validation error (inline), loading (Next button)
- Citizen search: idle, searching, results, no results, error
- Document upload: idle, uploading, complete, error
- Final submission: loading, success (redirect), error (stay on review step)

## Related Backend Module(s)

- `platform-api` — WorkspaceController
- `platform-api` — DocumentController

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/workspaces` | POST | Create new workspace/case |
| `/api/workspaces/{id}/documents` | POST | Attach document to case |
| `/api/documents` | POST | Create document record |
| `/documents/upload` | POST | Upload document file |
| `/api/search` | POST | Search for existing citizen |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
