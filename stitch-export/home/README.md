# Startseite (Home)

## Screen Name

Startseite (`/home`)

## Purpose

Operational workbench. Shows the employee's workload immediately — task queue, deadlines, waiting items, completed today, watched cases, and suggested next task. Decision Support is available as a sidebar panel. Adapts for supervisor role (shows approval queue, team workload, department KPIs).

## Screens Included

- Employee home (6 stat cards, case lists, decision support sidebar, suggested next task)
- Supervisor home (approval queue, team workload, department KPIs)
- First login empty state
- All-completed empty state
- Heavy workload state (amber/red indicators)

## States

- Normal (with cases)
- Empty (no cases — welcome message)
- All completed (checkmark)
- Heavy workload (10+ due today — banner)
- Multiple overdue (red indicators)
- Supervisor variant

## Related Backend Module(s)

- `platform-api` — WorkspaceController, AiPageController
- `platform-api` — AuditController

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/workspaces` | GET | List cases (filtered by status, assignee) |
| `/api/decision` | POST | Decision support suggestions |
| `/api/audit/events` | GET | Recent activity feed |
| `/api/providers/status` | GET | Provider health check |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
