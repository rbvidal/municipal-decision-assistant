# Wissen (Knowledge)

## Screen Name

Wissen (`/knowledge`)

## Purpose

Global knowledge repository. Unified search across all content types — regulations, procedures, templates, FAQs, archived cases, citizens, and documents. Results grouped by category with dividers. When opened from inside a case, preserves case context with visible "← Zurück zum Vorgang" action.

## Screens Included

- Alles (unified search with grouped results)
- Vorschriften (regulation browser — Fachbereich tree + detail panel)
- Verfahren (structured procedure descriptions)
- Vorlagen (template library by category, preview, apply to case)
- FAQs (expandable Q&A by department)
- Favoriten sidebar (favorites + recently used)

## States

- Idle (empty search bar, suggested searches)
- Searching (skeleton results)
- Results (grouped by category with dividers)
- No results (suggestions for refinement)
- Error (search unavailable)
- Opened from case (case header visible, "Zurück zum Vorgang" action)

## Related Backend Module(s)

- `platform-search` — SearchService
- `platform-api` — DocumentController, WorkspaceController

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/search` | POST | Unified search across all content |
| `/api/search/chunks` | GET | Document chunk search |
| `/api/documents` | GET | Regulation/document listing |
| `/api/workspaces` | GET | Case search (archived cases) |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
