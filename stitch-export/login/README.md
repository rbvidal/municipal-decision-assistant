# Login

## Screen Name

Login (`/login`)

## Purpose

Authenticate municipal employees. First screen users see. Includes login form, forgot password flow, reset password flow, and first-login password change.

## Screens Included

- Login form (email + password + "Angemeldet bleiben")
- Forgot password (email input → link sent confirmation)
- Reset password (new password + confirm)
- First login password change
- Session expired modal
- Logout confirmation dialog
- Access denied (403)

## States

- Normal (empty fields)
- Loading ("Anmeldung läuft..." spinner)
- Error (invalid credentials banner)
- Locked (account temporarily locked, timer)
- Backend unavailable (retry)

## Related Backend Module(s)

- `platform-api` — AuthController

## Related REST Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/register` | POST | Register new user |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/auth/logout` | POST | Invalidate refresh token |
| `/api/auth/me` | GET | Get current user |

## Export Information

- **Export Date:** (to be filled)
- **Stitch Version:** (to be filled)
- **Notes:** (to be filled)
