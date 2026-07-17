# User & Role Management

## Screen Name

Benutzerverwaltung (`/admin/users`)

## Purpose

User administration, role assignment, and permission management for system administrators. Create, edit, deactivate, and delete user accounts. Assign roles (Sachbearbeiter, Supervisor, Fachbereichsadministrator, Systemadministrator). Manage department assignments. Accessible from Verwaltung > Übersicht > Systemkonfiguration or as a dedicated card.

## Screens Included

- User list (filterable table — name, email, role, department, status, last login)
- User detail / edit (profile, role assignment, department, password reset trigger)
- New user form (email, display name, role, department, temporary password)
- Role management (role list, permission matrix)
- Deactivation confirmation dialog

## States

- User list: normal, empty (no users — impossible in production), loading (skeleton)
- User edit: normal, saving (spinner), saved (toast), validation error (inline)
- New user: normal, creating (spinner), created (toast + redirect), validation error
- Deactivation: confirmation dialog, processing, complete (toast)

## Related Backend Module(s)

- `platform-api` — AuthController
- Platform security configuration (Spring Security, JWT)

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/me` | GET | Get current user profile |
| (User management endpoints — to be confirmed) | | |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** User management backend endpoints may require extension. The current backend supports registration and profile retrieval. Administrative user listing, role management, and deactivation may need new endpoints. Verify against the backend before implementing.
