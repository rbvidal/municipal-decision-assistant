# User Journey — End-to-End

## Complete Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MUNICIPAL DECISION PLATFORM                        │
│                           END-TO-END USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. BROWSER OPEN
   │
   │  User navigates to https://entscheidung.meine-stadt.de
   │  System detects: no valid JWT token → redirect to /login
   │
   ▼
2. LOGIN SCREEN
   │
   │  ┌──────────────────────────────────────────┐
   │  │        [Municipality Coat of Arms]        │
   │  │                                          │
   │  │  Kommunale Entscheidungsplattform         │
   │  │                                          │
   │  │  ┌──────────────────────────────────┐    │
   │  │  │ E-Mail                            │    │
   │  │  │ sabine.mueller@stadt-essen.de     │    │
   │  │  └──────────────────────────────────┘    │
   │  │  ┌──────────────────────────────────┐    │
   │  │  │ Passwort                    [👁]  │    │
   │  │  │ ●●●●●●●●●●                       │    │
   │  │  └──────────────────────────────────┘    │
   │  │                                          │
   │  │  [✓] Angemeldet bleiben                  │
   │  │                                          │
   │  │  [       Anmelden       ]                │
   │  │                                          │
   │  │  Passwort vergessen?                     │
   │  │                                          │
   │  │  ─────────────────────────────           │
   │  │  DE | EN              v2.4.1             │
   │  └──────────────────────────────────────────┘
   │
   │  States:
   │  - Normal: Fields empty, button active
   │  - Loading: Button shows spinner, fields disabled
   │  - Error: Red banner "Ungültige Anmeldedaten"
   │  - Locked: After 5 failed attempts "Konto vorübergehend gesperrt. Bitte
   │    warten Sie 15 Minuten oder kontaktieren Sie Ihren Administrator."
   │
   ▼
3. AUTHENTICATION
   │
   │  POST /api/auth/login → { accessToken, refreshToken, user }
   │  Token stored in memory (not localStorage)
   │  Silent refresh via /api/auth/refresh before token expiry
   │
   │  FIRST LOGIN (new account, temporary password):
   │  ┌──────────────────────────────────────────┐
   │  │  Erste Anmeldung                          │
   │  │                                          │
   │  │  Bitte legen Sie ein neues Passwort fest. │
   │  │                                          │
   │  │  ┌──────────────────────────────────┐    │
   │  │  │ Neues Passwort                    │    │
   │  │  └──────────────────────────────────┘    │
   │  │  ┌──────────────────────────────────┐    │
   │  │  │ Passwort bestätigen               │    │
   │  │  └──────────────────────────────────┘    │
   │  │                                          │
   │  │  Mindestens 8 Zeichen, 1 Großbuchstabe,  │
   │  │  1 Zahl, 1 Sonderzeichen                 │
   │  │                                          │
   │  │  [       Passwort setzen       ]         │
   │  └──────────────────────────────────────────┘
   │
   ▼
4. HOME DASHBOARD
   │
   │  ┌──────────────────────────────────────────────────────────────────┐
   │  │  Startseite                                                      │
   │  │                                                                  │
   │  │  Guten Morgen, Frau Müller.           Dienstag, 15. Juli 2026   │
   │  │                                                                  │
   │  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────┐│
   │  │  │Meine     │Heute     │Überfällig│Wartet    │Wartet    │Heute ││
   │  │  │Vorgänge  │fällig    │          │Bürger    │Behörde   │erled.││
   │  │  │   12     │   3      │   2      │   4      │   1      │  5   ││
   │  │  └──────────┴──────────┴──────────┴──────────┴──────────┴──────┘│
   │  │                                                                  │
   │  │  ───────────────────────────────────────────────────────────     │
   │  │                                                                  │
   │  │  Meine Vorgänge (linke Spalte, 70%)                              │
   │  │  · Überfällig (2): BAU-2026-0142, VERG-2026-0139                │
   │  │  · Heute fällig (3): nach Priorität sortiert                     │
   │  │  · Wartet auf Bürger (4): mit Tagen seit Warten                  │
   │  │  · Wartet auf Behörde (1): BAU-2026-0141 (14 Tage)              │
   │  │  · Heute erledigt (5): mit Ergebnis und Bearbeiter               │
   │  │  · Vorgeschlagene nächste Aufgabe: BAU-2026-0147 (Risiko: Gering)│
   │  │                                                                  │
   │  │  Entscheidungsunterstützung (rechte Spalte, 30%)        [−]     │
   │  │  ┌──────────────────────────────────────────────────────────┐   │
   │  │  │ Frage zu Vorschriften oder Verfahren...           [ → ]  │   │
   │  │  └──────────────────────────────────────────────────────────┘   │
   │  │  Vorschläge basierend auf Ihren Vorgängen...                    │
   │  └──────────────────────────────────────────────────────────────────┘
   │
   ▼
5. DAILY WORK — CASE PROCESSING
   │
   │  (Full specification: 06_CASE_WORKFLOW.md)
   │
   │  User navigates to "Meine Arbeit" → processes cases.
   │  Lifecycle: Posteingang → Prüfung → Entscheidungsunterstützung →
   │             Entwurf → Genehmigung → Versand → Archiv
   │
   │  Sub-tabs: Posteingang | Offene Vorgänge | Warten | Genehmigung | Archiv
   │
   │  Each case: three-panel workspace (Case Details | Workspace + Checklist |
   │  Decision Support), internal notes, activity timeline, risk indicator.
   │
   ▼
6. FORGOT PASSWORD
   │
   │  ┌──────────────────────────────────────────┐
   │  │  Passwort vergessen                       │
   │  │                                          │
   │  │  Geben Sie Ihre E-Mail-Adresse ein.       │
   │  │  Wir senden Ihnen einen Link zum          │
   │  │  Zurücksetzen des Passworts.             │
   │  │                                          │
   │  │  ┌──────────────────────────────────┐    │
   │  │  │ E-Mail                            │    │
   │  │  └──────────────────────────────────┘    │
   │  │                                          │
   │  │  [       Link senden       ]             │
   │  │                                          │
   │  │  ← Zurück zur Anmeldung                  │
   │  └──────────────────────────────────────────┘
   │
   │  Success: "Falls ein Konto mit dieser E-Mail existiert, wurde ein
   │            Link versendet."
   │
   ▼
7. PASSWORD RESET
   │
   │  ┌──────────────────────────────────────────┐
   │  │  Neues Passwort festlegen                 │
   │  │                                          │
   │  │  ┌──────────────────────────────────┐    │
   │  │  │ Neues Passwort                    │    │
   │  │  └──────────────────────────────────┘    │
   │  │  ┌──────────────────────────────────┐    │
   │  │  │ Passwort bestätigen               │    │
   │  │  └──────────────────────────────────┘    │
   │  │                                          │
   │  │  [       Passwort speichern       ]      │
   │  │                                          │
   │  │  Success → redirect to login             │
   │  └──────────────────────────────────────────┘
   │
   ▼
8. SESSION EXPIRED
   │
   │  ┌──────────────────────────────────────────┐
   │  │  Sitzung abgelaufen                       │
   │  │                                          │
   │  │  Ihre Sitzung ist aus Sicherheitsgründen  │
   │  │  abgelaufen. Bitte melden Sie sich erneut │
   │  │  an.                                     │
   │  │                                          │
   │  │  [       Zur Anmeldung       ]           │
   │  └──────────────────────────────────────────┘
   │
   │  Trigger: Refresh token expired or 401 from any API call
   │  Behavior: Preserve the URL the user was on, redirect back after login
   │
   ▼
9. LOGOUT
   │
   │  ┌──────────────────────────────────────────┐
   │  │  Abmelden                                 │
   │  │                                          │
   │  │  Möchten Sie sich wirklich abmelden?      │
   │  │                                          │
   │  │  [ Abbrechen ]    [ Abmelden ]           │
   │  └──────────────────────────────────────────┘
   │
   │  POST /api/auth/logout → 204
   │  Tokens cleared from memory
   │  Redirect to /login
   │
   ▼
10. SESSION CONTINUITY
   │
   │  - JWT access token: 1 hour expiry
   │  - Refresh token: 30 days expiry
   │  - Silent refresh: 5 minutes before access token expiry, call /api/auth/refresh
   │  - If refresh fails: show session expired dialog
   │  - If user closes browser: tokens cleared (in-memory storage)
   │  - "Angemeldet bleiben": stores refresh token in secure httpOnly cookie
```

## Error Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ERROR HANDLING                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  401 UNAUTHORIZED                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  🔒 Nicht autorisiert                                                 │   │
│  │                                                                       │   │
│  │  Sie sind nicht angemeldet oder Ihre Sitzung ist abgelaufen.          │   │
│  │                                                                       │   │
│  │  [ Zur Anmeldung ]                                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  403 FORBIDDEN                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  🚫 Zugriff verweigert                                                │   │
│  │                                                                       │   │
│  │  Sie haben keine Berechtigung für diese Seite.                        │   │
│  │  Erforderliche Rolle: ADMIN                                           │   │
│  │                                                                       │   │
│  │  Wenn Sie Zugang benötigen, wenden Sie sich an Ihren Administrator.   │   │
│  │                                                                       │   │
│  │  [ Zurück zur Startseite ]                                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  404 NOT FOUND                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  📄 Seite nicht gefunden                                              │   │
│  │                                                                       │   │
│  │  Die angeforderte Seite existiert nicht.                              │   │
│  │  Sie wurde möglicherweise verschoben oder archiviert.                 │   │
│  │                                                                       │   │
│  │  [ Zurück zur Startseite ]   [ Suche ]                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  500 INTERNAL ERROR                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Interner Fehler                                                    │   │
│  │                                                                       │   │
│  │  Ein unerwarteter Fehler ist aufgetreten.                             │   │
│  │  Der Vorfall wurde protokolliert.                                     │   │
│  │                                                                       │   │
│  │  Fehler-ID: ERR-2026-07-15-0042                                       │   │
│  │                                                                       │   │
│  │  [ Seite neu laden ]   [ Zur Startseite ]                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  BACKEND UNAVAILABLE                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  🔌 Dienst nicht erreichbar                                           │   │
│  │                                                                       │   │
│  │  Die Anwendung kann den Server nicht erreichen.                       │   │
│  │  Bitte überprüfen Sie Ihre Netzwerkverbindung.                        │   │
│  │                                                                       │   │
│  │  [ Erneut versuchen ]                                                 │   │
│  │                                                                       │   │
│  │  Wenn das Problem bestehen bleibt, kontaktieren Sie die IT-Abteilung. │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  DECISION SUPPORT UNAVAILABLE                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Entscheidungsunterstützung nicht verfügbar                           │   │
│  │                                                                       │   │
│  │  Die Entscheidungsunterstützung ist derzeit nicht erreichbar.         │   │
│  │  Sie können weiterhin Dokumente suchen und Vorgänge bearbeiten.       │   │
│  │                                                                       │   │
│  │  Automatische Zusammenfassungen sind deaktiviert.                     │   │
│  │                                                                       │   │
│  │  [ Erneut versuchen ]                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  QDRANT UNAVAILABLE                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  🔍 Semantische Suche eingeschränkt                                   │   │
│  │                                                                       │   │
│  │  Die Vektorsuche ist derzeit nicht verfügbar.                         │   │
│  │  Die Stichwortsuche funktioniert weiterhin.                           │   │
│  │                                                                       │   │
│  │  [ Erneut versuchen ]                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Empty States

```
NO DOCUMENTS
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                         📄                                               │
│                                                                          │
│                   Keine Dokumente vorhanden                               │
│                                                                          │
│     Laden Sie Ihr erstes Dokument hoch, um die Wissensdatenbank           │
│     aufzubauen.                                                           │
│                                                                          │
│                    [ Dokument hochladen ]                                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

KEINE VORGÄNGE
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                         ✓                                                │
│                                                                          │
│                   Alle Vorgänge bearbeitet                                │
│                                                                          │
│     Es liegen keine offenen Vorgänge vor.                                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

NO SEARCH RESULTS
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                         🔍                                               │
│                                                                          │
│                   Keine Ergebnisse für "bauvorschrift garage"             │
│                                                                          │
│     Vorschläge:                                                           │
│     · Überprüfen Sie die Schreibweise                                     │
│     · Verwenden Sie allgemeinere Begriffe                                 │
│     · Suchen Sie in allen Fachbereichen                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

NO DECISION SUPPORT
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                         📋                                               │
│                                                                          │
│              Keine Entscheidungsunterstützung verfügbar                   │
│                                                                          │
│     Für Ihre Frage konnten keine relevanten Vorschriften gefunden         │
│     werden.                                                               │
│                                                                          │
│     [ Frage umformulieren ]   [ Fachbereich wechseln ]                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Notifications

```
Toast notifications appear in the bottom-right corner. They auto-dismiss after
5 seconds (error: 10 seconds, persistent: manual dismiss only).

SUCCESS (green):
┌──────────────────────────────────────────┐
│ ✓ Dokument erfolgreich hochgeladen        │
│   "AV-zu-55-LHO-2024.pdf"                │
└──────────────────────────────────────────┘

WARNING (amber):
┌──────────────────────────────────────────┐
│ ⚠ Indizierung verzögert                  │
│   3 Dokumente warten auf Verarbeitung.    │
│   [ Details anzeigen ]                   │
└──────────────────────────────────────────┘

ERROR (red):
┌──────────────────────────────────────────┐
│ ✗ Upload fehlgeschlagen                  │
│   Die Datei ist größer als 50 MB.        │
│   [ Erneut versuchen ]                   │
└──────────────────────────────────────────┘

INFORMATION (blue):
┌──────────────────────────────────────────┐
│ ℹ Korpus-Inventar wurde aktualisiert.     │
│   23 Dokumente, 157 Chunks indexiert.    │
└──────────────────────────────────────────┘
```

## User Menu

```
Top-right avatar/name click:

┌──────────────────────────────┐
│  Max Mustermann              │
│  sabine.mueller@stadt-essen.de│
│  Bauamt                      │
├──────────────────────────────┤
│  Profil                      │
│  Passwort ändern             │
│  Sprache            DE | EN  │
│  Erscheinungsbild  (zukünftig)│
├──────────────────────────────┤
│  Über                        │
├──────────────────────────────┤
│  Abmelden                    │
└──────────────────────────────┘
```
