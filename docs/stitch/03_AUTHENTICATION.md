# Authentication Experience

## Overview

The platform uses JWT Bearer token authentication. The backend provides `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, and `/api/auth/me`. The frontend manages tokens in memory (never localStorage) with silent refresh before expiry.

## Login Screen

**Purpose:** Authenticate municipal employees. First screen users see.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    [Stadtwappen / Logo der Gemeinde]                  │
│                                                                      │
│              Kommunale Entscheidungsplattform                         │
│                                                                      │
│    ┌──────────────────────────────────────────────────────────┐     │
│    │  E-Mail-Adresse                                          │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │ name@stadt-essen.de                              │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    │  Passwort                                                │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │ ●●●●●●●●●●                               [👁]    │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    │  [ ] Angemeldet bleiben                                  │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │                 Anmelden                          │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    │  Passwort vergessen?                                     │     │
│    └──────────────────────────────────────────────────────────┘     │
│                                                                      │
│    DE  |  English                             Version 2.4.1          │
└──────────────────────────────────────────────────────────────────────┘
```

### States

**Loading:** After clicking "Anmelden", the button shows a spinner and reads "Anmeldung läuft...". Both input fields are disabled.

**Error — Invalid credentials:** Red banner "Ungültige Anmeldedaten. E-Mail-Adresse oder Passwort ist falsch."

**Error — Account locked:** Red banner "Konto vorübergehend gesperrt. Zu viele fehlgeschlagene Versuche. Bitte warten Sie 15 Minuten." Button disabled, timer shown.

**Error — Backend unavailable:** Red banner "Dienst nicht erreichbar. Der Anmeldedienst ist derzeit nicht verfügbar." Retry button shown.

### Validation
- Email: Must be valid email format. Error: "Bitte geben Sie eine gültige E-Mail-Adresse ein."
- Password: Cannot be empty. Error: "Bitte geben Sie Ihr Passwort ein."

### API
`POST /api/auth/login` — Request: `{email, password}` — Response: `{accessToken, refreshToken, tokenType, userId, email, roles}`

---

## Forgot Password

```
┌──────────────────────────────────────────────────────────────────────┐
│                    [Stadtwappen / Logo der Gemeinde]                  │
│                      Passwort vergessen                              │
│    Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen          │
│    Link zum Zurücksetzen des Passworts.                              │
│    ┌──────────────────────────────────────────────────────────┐     │
│    │  E-Mail-Adresse                                          │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │ name@stadt-essen.de                              │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │              Link senden                          │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    │  ← Zurück zur Anmeldung                                  │     │
│    └──────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

### Success state
"Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts versendet." (Security: does not confirm whether email exists.)

---

## Reset Password

```
┌──────────────────────────────────────────────────────────────────────┐
│                    [Stadtwappen / Logo der Gemeinde]                  │
│                    Neues Passwort festlegen                           │
│    ┌──────────────────────────────────────────────────────────┐     │
│    │  Neues Passwort                            [👁]          │     │
│    │  Passwort bestätigen                        [👁]          │     │
│    │  Anforderungen:                                            │     │
│    │  · Mindestens 8 Zeichen  · 1 Großbuchstabe                 │     │
│    │  · 1 Zahl  · 1 Sonderzeichen                               │     │
│    │  ┌──────────────────────────────────────────────────┐    │     │
│    │  │           Passwort speichern                      │    │     │
│    │  └──────────────────────────────────────────────────┘    │     │
│    └──────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## First Login

Same wireframe as Reset Password. Heading: "Erste Anmeldung — Passwort festlegen". Triggered automatically after first login with temporary password. Once set, proceeds to home dashboard.

---

## Change Password

```
┌──────────────────────────────────────────────────────────┐
│  Passwort ändern                                         │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Aktuelles Passwort                                │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Neues Passwort                                    │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Neues Passwort bestätigen                         │    │
│  └──────────────────────────────────────────────────┘    │
│  [ Abbrechen ]    [ Passwort ändern ]                   │
└──────────────────────────────────────────────────────────┘
```

---

## Session Expired

Modal overlay when any API call returns 401 due to expired/revoked refresh token:

```
┌──────────────────────────────────────────────────────────┐
│  🔒  Sitzung abgelaufen                                  │
│  Ihre Sitzung ist aus Sicherheitsgründen abgelaufen.     │
│  Bitte melden Sie sich erneut an.                        │
│  ┌──────────────────────────────────────────────────┐    │
│  │            Zur Anmeldung                          │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

After re-login, redirect to the page the user was on.

---

## Access Denied (403)

```
┌──────────────────────────────────────────────────────────┐
│  🚫  Zugriff verweigert                                  │
│  Sie haben keine Berechtigung für diese Seite.           │
│  Erforderliche Rolle: ADMIN                              │
│  [ Zurück zur Startseite ]                               │
└──────────────────────────────────────────────────────────┘
```

---

## Logout Confirmation

```
┌──────────────────────────────────────────────────────────┐
│  Abmelden                                                │
│  Möchten Sie sich wirklich abmelden?                     │
│  [ Abbrechen ]  [ Abmelden ]                             │
└──────────────────────────────────────────────────────────┘
```

API: `POST /api/auth/logout` with `{refreshToken}` → 204 No Content.
Tokens cleared from memory. Redirect to `/login`.
