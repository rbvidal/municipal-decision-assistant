# DESIGN.md — Kommunale Entscheidungsplattform

**For:** Google AI Studio (Stitch)
**Version:** 1.2
**Language:** German (all user-facing text)

---

## Overall Design Philosophy

This application is an **operational workbench** used by municipal employees for their entire workday. It is NOT: an analytics dashboard, a chatbot, an AI application, a search engine, a consumer web application, or a startup SaaS product.

Every screen must answer one question: **"What should I work on next?"**

The user opens the application to continue their administrative work — process cases, review documents, draft decisions. All other features (search, analytics, administration) support this primary purpose. Decision Support exists only to help the employee perform work faster. It never becomes the center of the interface. The employee's task queue is always the primary visual focus.

---

## Enterprise Maturity

The application should feel like software that has evolved over many years inside a German municipality. It is: predictable, stable, conservative, familiar, productivity-focused, professional, and trusted.

Avoid experimental UI. Avoid trendy UI. Avoid decorative UI. Favor familiarity over novelty. A Sachbearbeiter with 20 years of experience should recognize this as a professional tool within seconds. They should never wonder "what does this button do?" or "is this a new feature?"

---

## Component Consistency

Every screen must reuse the same components: navigation, tables, cards, dialogs, forms, buttons, badges, notifications, typography, spacing, and colors. Never redesign components between screens. Never introduce a new variant of an existing component unless it serves a genuinely different purpose. The application must feel like one coherent product — as if built by a single team following a single design system.

---

## Information Density

Users are trained professionals. Visible information is more valuable than empty whitespace.

Prefer: tables over cards, compact layouts, multiple visible rows (50 default), inline editing, split panes, and keyboard workflows.

Avoid: oversized headers, excessive padding, decorative spacing, hero layouts, single-column layouts wider than 720px, and content that requires scrolling when it could fit on one screen.

Every pixel of whitespace must justify its existence by improving readability or separating distinct functional areas. Whitespace is never decorative.

---

## Visual References

These references describe interaction quality and productivity patterns. Do NOT copy their visual appearance or branding. The application has its own identity (see Design Tokens and Brand Summary).

| Quality | Reference | What to Learn |
|---|---|---|
| Navigation | Microsoft Outlook | Persistent left nav, clear folder hierarchy, unread counts |
| Case management | Jira Service Management | Issue view layout, workflow status, activity timeline, side panels |
| Tables | SAP Fiori | Dense data tables, inline filtering, responsive column management |
| Forms | Microsoft Dynamics | Label placement, inline validation, section grouping, read-only vs edit modes |
| Administration | Azure Portal | Tool grid, resource monitoring, filterable logs, configuration panels |

---

## Global Screen Hierarchy

Every generated screen follows this hierarchy. Higher levels receive greater visual emphasis — larger, closer to the top-left, with stronger color contrast.

1. **Application Navigation** — Top bar, sub-navigation tabs, breadcrumb
2. **Context Navigation** — Screen-specific filters, sort controls, view toggles
3. **Current Work** — The P1 element: the task/case the user should work on right now
4. **Primary Workspace** — Tables, forms, document viewers, editors
5. **Decision Support** — Sidebar panel, 25-30% width, secondary visual weight
6. **Secondary Information** — Activity feeds, statistics, KPIs, suggestions
7. **Administration** — Hidden behind Verwaltung navigation, never visible to normal users

On every screen, the user must be able to identify the "Current Work" element (level 3) within 500ms of the page loading.

---

## Information Architecture Philosophy

The application distinguishes between two fundamental interface modes. This distinction is a permanent UX principle.

### Global Application Modules

These modules operate across the entire municipality. They are entered directly from the main navigation bar. They have no active case selected unless explicitly entered from one.

**Main navigation:**

| Label | Route | Type |
|---|---|---|
| 🏠 Startseite | `/home` | Global — Operational workbench |
| 📋 Meine Arbeit | `/work` | Global — Case list, inbox, approvals, archive |
| 📚 Wissen | `/knowledge` | Global — Knowledge repository (regulations, procedures, templates, FAQs) |
| 📁 Dokumentenverwaltung | `/documents` | Global — Municipality-wide document management |
| ⚙️ Verwaltung | `/admin` | Global — Administration (ADMIN only) |

**Global module characteristics:**
- Show repositories, searches, filters, statistics, administration
- No active case context (unless navigated from one)
- Wissen opened directly from navigation behaves as a global knowledge browser
- Dokumentenverwaltung manages ALL municipal documents — not the documents of a single case

### Contextual Case Workspace

Selecting a case from Meine Arbeit opens a contextual workspace. The current case remains visible at all times via a persistent case header.

**Case header (always visible inside a workspace):**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BAU-2026-0147  Neubau Carport  Thomas Becker                               │
│  Bearbeiter: Sabine Müller  |  Status: Prüfung  |  Fällig: Heute  |  🔴 Hoch │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Case tabs (contextual views, NOT application pages):**

| Tab | Content |
|---|---|
| Übersicht | Case summary, key metadata, current phase, risk indicator |
| Checkliste | Dynamic checklist for this case type |
| Dokumente | Documents belonging ONLY to this case |
| Interne Notizen | Internal notes for this case |
| Aktivität | Activity timeline for this case |
| Entscheidungsunterstützung | Decision support for this case |

Switching tabs never leaves the current case. These are NOT application pages — they are views into the same Vorgang.

### Case Documents vs. Global Document Management

These are completely different concepts that must never be confused.

**Case Dokumente tab:** Only documents belonging to the current case. Actions: Upload, Preview, Download, Compare Versions. No municipality-wide search. No global archive. No documents from other cases.

**Dokumentenverwaltung (global):** ALL municipal documents across all cases. Functions: Upload, search, versioning, OCR, indexing, archive, retention, document administration. Searches citizen files, building permits, contracts, incoming mail, generated decisions, templates, forms, archive.

### Knowledge Inside a Case

Knowledge is global. However, when opened from inside a case, the application keeps the current case visible. The user can consult regulations and immediately return to the case via a clear "← Zurück zum Vorgang" action. The case header remains visible above the knowledge content.

### Breadcrumbs

Breadcrumbs reflect the navigation path, not the content hierarchy. They always show the case as a child of Meine Arbeit:

```
Startseite > Meine Arbeit > BAU-2026-0147 > Dokumente
Startseite > Meine Arbeit > BAU-2026-0147 > Interne Notizen
Startseite > Meine Arbeit > BAU-2026-0147 > Entscheidungsunterstützung
```

Never:
```
Startseite > Dokumente > BAU-2026-0147  ← WRONG
```

When Wissen is accessed globally (without a case):
```
Startseite > Wissen > Vorschriften
```

When Wissen is accessed from within a case:
```
Startseite > Meine Arbeit > BAU-2026-0147 > Wissen > §65 BauO NRW
```

### Decision Support is Always Contextual

Decision Support always works on the current case. It never appears as a global assistant. Its recommendations are generated only from: the current case, selected documents, retrieved regulations, and structured knowledge. There is no "general purpose AI chat."

### Visual Distinction

The user must instantly understand whether they are working on ONE case or managing municipality-wide information. Contextual workspaces always show: current case number, assigned employee, deadline, phase, workflow status, risk indicator, and citizen name. Global modules show: repositories, searches, filters, statistics, and administration.

---

## Design Tokens

### Colors

```css
:root {
  /* Primary */
  --color-primary-900: #1A365D;
  --color-primary-700: #2B6CB0;
  --color-primary-500: #3182CE;
  --color-primary-100: #EBF8FF;
  --color-primary-50: #F7FAFC;

  /* Neutral */
  --color-gray-900: #1A1A2E;
  --color-gray-700: #4A5568;
  --color-gray-600: #718096;
  --color-gray-500: #A0AEC0;
  --color-gray-400: #CBD5E0;
  --color-gray-300: #E2E8F0;
  --color-gray-200: #EDF2F7;
  --color-gray-100: #F7FAFC;
  --color-gray-50: #FAFBFC;

  /* Semantic */
  --color-success-700: #276749;
  --color-success-100: #F0FFF4;
  --color-warning-700: #975A16;
  --color-warning-100: #FFFFF0;
  --color-error-700: #9B2C2C;
  --color-error-100: #FFF5F5;

  /* Background */
  --color-white: #FFFFFF;
  --color-bg-page: #FAFBFC;
}
```

**Usage:**
- Page background: `--color-bg-page`
- Card background: `--color-white`
- Primary text: `--color-gray-900`
- Secondary text: `--color-gray-700`
- Muted/placeholder text: `--color-gray-500`
- Primary button: `--color-primary-700` bg, `--color-white` text
- Default border: `--color-gray-300`
- Focus ring: `3px solid var(--color-primary-100)`
- Focus outline: `2px solid var(--color-primary-500)`
- Error border: `--color-error-700`
- Table header: `--color-gray-100` bg
- Selected row: `--color-primary-50` bg
- Hover row: `--color-gray-50` bg

### Typography

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;
}
```

| Token | Size/Height | Weight | Use |
|---|---|---|---|
| `--text-h1` | 24px / 32px | 600 (Semibold) | Page titles |
| `--text-h2` | 20px / 28px | 600 | Section headers |
| `--text-h3` | 16px / 24px | 600 | Card titles, dialog titles |
| `--text-body` | 14px / 20px | 400 (Regular) | Paragraphs, descriptions, form labels |
| `--text-small` | 13px / 18px | 400 | Table content, metadata |
| `--text-caption` | 12px / 16px | 400 | Badges, timestamps, help text |
| `--text-stat` | 28px / 36px | 700 (Bold) | Stat card numbers |
| `--text-code` | 13px / 20px | 400 | IDs, references (JetBrains Mono) |

**Font import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');
```

### Spacing

```css
:root {
  --space-1: 4px;   /* icon-to-text, badge inner padding */
  --space-2: 8px;   /* inline gap, button vertical padding */
  --space-3: 12px;  /* form field gap */
  --space-4: 16px;  /* section gap, button horizontal padding */
  --space-5: 20px;  /* card inner padding */
  --space-6: 24px;  /* content area vertical padding */
  --space-8: 32px;  /* content area horizontal padding */
  --space-10: 40px; /* page top spacing */
  --space-14: 56px; /* navigation bar height */
}
```

### Radii & Shadows

```css
:root {
  --radius-sm: 4px;   /* badges */
  --radius-md: 6px;   /* small buttons, input groups */
  --radius-lg: 8px;   /* cards, inputs, buttons, dialogs */

  /* NO SHADOWS on any element.
     Cards use 1px solid borders, not box-shadow.
     Dialogs are the only exception — subtle shadow permitted for elevation. */
  --shadow-dialog: 0 4px 24px rgba(0, 0, 0, 0.12);
}
```

---

## Layout System

### Page Shell

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP BAR         56px height, white, border-bottom gray-200      │
├──────────────────────────────────────────────────────────────────┤
│  SUB-NAV         44px height, gray-50 bg (conditional)           │
├──────────────────────────────────────────────────────────────────┤
│  BREADCRUMB      28px height, 12px text, gray-500                │
├──────────────────────────────────────────────────────────────────┤
│  MAIN CONTENT    max-width: 1400px; margin: 0 auto;              │
│                  padding: 24px var(--space-8);                    │
│  ┌─────────────────────────────────┬────────────────────────┐    │
│  │  PRIMARY (flex: 1)              │  SIDEBAR (280-320px)    │    │
│  │                                 │  optional, collapsible  │    │
│  └─────────────────────────────────┴────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│  TOAST LAYER    position: fixed; bottom: 24px; right: 24px;      │
│                 z-index: 1000;                                    │
├──────────────────────────────────────────────────────────────────┤
│  DIALOG LAYER   position: fixed; inset: 0;                        │
│                 background: rgba(0,0,0,0.5); z-index: 500;       │
└──────────────────────────────────────────────────────────────────┘
```

### Grid

- **Max content width:** 1400px centered
- **Card grid:** `grid-template-columns: repeat(4, 1fr)` at 1920px, `repeat(3, 1fr)` at 1366px, `gap: 16px`
- **Two-column:** `display: flex;` main (flex: 1) + sidebar (width: 280px; flex-shrink: 0), `gap: 24px`
- **Three-column (case workspace):** Left 240px (case details) + Center flex (workspace) + Right 320px (decision support)

### Breakpoints

| Name | Width | Behavior |
|---|---|---|
| Desktop FHD | 1920px+ | Full layout, 50-row tables, all columns |
| Desktop | 1280-1919px | Full layout, 50-row tables, all columns |
| Laptop | 1024-1279px | Full nav, reduced tables (25 rows), read-only forms, no upload |
| Tablet | <1024px | Hamburger nav, view-only tables (10 rows), no forms |
| Phone | <768px | Not supported |

---

## Component Library

### Navigation Bar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Logo 36px]  Startseite  Meine Arbeit  Wissen  Dokumente  Verwaltung  [🔔] [👤] │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Height: 56px
- Background: white
- Border-bottom: 1px solid var(--color-gray-200)
- Active item: color var(--color-primary-700), 3px bottom border var(--color-primary-700)
- Inactive item: color var(--color-gray-600)
- Item padding: 0 16px
- Item font: 14px, weight 500
- Logo: 36px height, left, links to `/home`
- Verwaltung tab: hidden when user lacks ADMIN role

### Sub-Navigation Tabs

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [ Posteingang (3) ]  [ Offene Vorgänge (12) ]  [ Warten (5) ]  ...         │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Height: 44px
- Background: var(--color-gray-100)
- Active tab: color var(--color-gray-900), 3px bottom border var(--color-primary-700)
- Inactive tab: color var(--color-gray-600)
- Count badge: inline, 12px text, gray-500
- Font: 13px, weight 500

### Breadcrumb

```
Startseite > Meine Arbeit > Vorgang BAU-2026-0147
```

- Height: 28px
- Font: 12px, color var(--color-gray-500)
- Separator: `>` chevron
- Last item: color var(--color-gray-700), not linked
- Parent items: links, color var(--color-gray-500)

### Cards

```css
.card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  /* NO box-shadow */
}
```

**Variants:**
- **Stat card:** Large number (var(--text-stat)), small label (var(--text-caption), uppercase, color var(--color-gray-500)), optional link below
- **Action card:** Icon + title (var(--text-h3)) + description (var(--text-body), color var(--color-gray-600)) + action button
- **Hover:** border-color changes to var(--color-primary-300)

### Tables

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  line-height: 18px;
}
.table thead { position: sticky; top: 0; z-index: 1; }
.table th {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-weight: 500;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-gray-300);
  white-space: nowrap;
}
.table td {
  padding: 8px 12px;
  color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-gray-100);
}
.table tbody tr:nth-child(even) { background: var(--color-gray-50); }
.table tbody tr:hover { background: var(--color-primary-50); }
.table tbody tr.selected {
  background: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-500);
}
```

- Row height: 40px (dense, default)
- Rows per page: 50 (default), 25 (laptop)
- Sortable columns: click header toggles ▲/▼
- Pagination: bottom-right, "1-50 von 247" + prev/next
- Empty state: centered icon + heading + description + CTA button
- Loading state: 5-row skeleton (gray-200 pulse animation)

### Forms

```css
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-900);
  margin-bottom: 4px;
}
.form-label.required::after { content: ' *'; color: var(--color-error-700); }
.form-input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-gray-900);
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
.form-input.error {
  border-color: var(--color-error-700);
  background: #FED7D7;
}
.form-input:disabled { background: var(--color-gray-100); color: var(--color-gray-500); }
```

- Labels: always above fields, never placeholder-only
- Required fields: red asterisk after label
- Select: same styling + custom chevron icon, `appearance: none`
- Textarea: min-height 80px, `resize: vertical`
- Date picker: calendar icon trigger on right
- File upload: dashed border drop zone, 120px tall
- Help text: 12px, color var(--color-gray-500), below field
- Error text: 12px, color var(--color-error-700), below field
- Submit button: full width in forms

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  cursor: pointer;
  min-height: 36px;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn--primary   { background: var(--color-primary-700); color: white; }
.btn--primary:hover:not(:disabled) { background: var(--color-primary-900); }

.btn--secondary { background: white; color: var(--color-gray-700); border-color: var(--color-gray-400); }
.btn--secondary:hover:not(:disabled) { background: var(--color-gray-50); }

.btn--danger    { background: var(--color-error-700); color: white; }
.btn--danger:hover:not(:disabled) { background: #822727; }

.btn--ghost     { background: transparent; color: var(--color-primary-700); border: none; }
.btn--ghost:hover:not(:disabled) { text-decoration: underline; background: var(--color-primary-50); }
```

- **Sizes:** Default (36px), Small (--sm: 32px, 13px text, tables), Large (--lg: 44px, primary CTAs)
- **Loading:** Replace text with 16px spinner, maintain width, button disabled
- **Icon button:** 36x36px, padding 0, icon only (with aria-label)

### Badges & Status Indicators

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.badge--success { background: var(--color-success-100); color: var(--color-success-700); }
.badge--warning { background: var(--color-warning-100); color: var(--color-warning-700); }
.badge--error   { background: var(--color-error-100); color: var(--color-error-700); }
.badge--info    { background: var(--color-primary-100); color: var(--color-primary-700); }
.badge--neutral { background: var(--color-gray-100); color: var(--color-gray-700); }
```

**Status dots:** 8px circles, inline-block.
- Green: #38A169 (active, healthy)
- Amber: #D69E2E (warning)
- Red: #E53E3E (error, overdue)
- Gray: #A0AEC0 (inactive, neutral)

**Risk indicators:** Always paired with text label.
- 🟢 Gering (green) — aria-label: "Geringes Risiko"
- 🟡 Mittel (amber) — aria-label: "Mittleres Risiko"
- 🔴 Hoch (red) — aria-label: "Hohes Risiko"

**Priority indicators:** Always paired with text label.
- 🔴 Hoch (red)
- 🟡 Mittel (amber)
- 🟢 Niedrig (green)

**Confidence bar:** 6px height, 120px width, segmented fill. Screen-reader text: "Verlässlichkeit: 82 Prozent".

### Dialogs

```css
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  max-width: 520px;
  width: calc(100vw - 64px);
  padding: 24px;
  box-shadow: var(--shadow-dialog);
}
```

**Rules:**
- Focus trapped inside while open
- Close: X button (top-right), Escape key, or overlay click (if no unsaved changes)
- On close: focus returns to trigger element
- Title: var(--text-h3)
- Content: var(--text-body), color var(--color-gray-700)
- Actions: right-aligned flex, gap 8px
- Used only for: destructive confirmations, submission for approval, logout, session expiry

### Toast Notifications

```css
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  width: 380px;
  max-width: calc(100vw - 48px);
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  background: white;
  border: 1px solid var(--color-gray-300);
  border-left: 4px solid transparent;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.toast--success { border-left-color: var(--color-success-700); }
.toast--warning { border-left-color: var(--color-warning-700); }
.toast--error   { border-left-color: var(--color-error-700); }
.toast--info    { border-left-color: var(--color-primary-700); }
```

- Animation: slide in from right 200ms ease-out, fade out 300ms
- Auto-dismiss: 5s (success, info), 10s (warning, error)
- Manual dismiss: X button
- aria-live="polite" on container

### Notification Bell & Dropdown

- Bell icon: 24px, Phosphor Icons `Bell`
- Badge: positioned top-right of bell, red bg for approvals/overdue, blue bg for info
- Badge count: number 1-99, or "99+"
- No badge when count is 0
- aria-label: "Benachrichtigungen" (+ unread count)
- Dropdown: 320px wide, max-height 480px, scrollable, white bg, border, 8px radius
- Unread items: bold text, ● filled dot
- Read items: normal weight, ○ empty dot
- Timestamp: right-aligned, 12px, gray-500
- Action link: below description, 13px, primary color
- "Alle lesen" button: top-right, 12px text, marks all read (client-side only)
- Footer link: "Alle Benachrichtigungen anzeigen"

### Icons

**Library:** Phosphor Icons, 24px, `weight="regular"`

**Usage rules:**
- Always accompanied by visible text labels (except in dense table action columns)
- Icon + text gap: 4px
- Size: 20px inline with text, 24px standalone, 16px in badges
- Color: matches surrounding text context

**Key icon mapping (Phosphor name → Usage):**

| Icon | Usage |
|---|---|
| `House` | Home / Startseite |
| `Briefcase` | My Work / Meine Arbeit |
| `BookOpen` | Knowledge / Wissen |
| `FileText` | Documents / Dokumente |
| `Gear` | Administration / Verwaltung |
| `Bell` | Notifications |
| `User` | User menu |
| `MagnifyingGlass` | Search |
| `Funnel` | Filter |
| `Upload` | Upload |
| `Download` | Download |
| `Check` | Complete, success |
| `Warning` | Warning |
| `XCircle` | Error, close |
| `Info` | Information |
| `CaretDown` | Expand / dropdown |
| `CaretUp` | Collapse |
| `ArrowRight` | Navigate forward |
| `ArrowLeft` | Navigate back |
| `Star` | Favorite (empty) |
| `StarFill` | Favorited |
| `Clock` | Time, pending |
| `Calendar` | Date picker |
| `DotsThree` | More actions menu |
| `ArrowSquareOut` | External link |
| `Copy` | Copy to clipboard |
| `ArrowClockwise` | Refresh, reindex |
| `Trash` | Delete |
| `Pencil` | Edit |
| `Plus` | Add, create |
| `Lock` | Authentication |
| `Eye` / `EyeSlash` | Show/hide password |
| `Folder` | Folder |

### Loading States

**Skeleton:** Gray-200 background, animated pulse (`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`).

- Table skeleton: 5 rows matching column widths
- Card skeleton: gray-200 blocks matching card content shape
- Text skeleton: gray-200 bars matching line lengths

**Spinner:** 16px (buttons), 20px (inline), 32px (page center). Border: 2px solid var(--color-gray-200), border-top-color: var(--color-primary-500). Animation: `spin 0.6s linear infinite`.

**Progress bar:** 6px height, full width, gray-200 track, blue-500 fill, 8px radius. Label: percentage or status text above or beside.

### Decision Support Panel

```css
.decision-support {
  width: 320px;
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  overflow-y: auto;
}
```

**Sections (in order):**
1. Question input (textarea, 2-3 lines, with submit button)
2. Zusammenfassung (summary paragraph)
3. Anwendbare Vorschriften (regulation list with citation excerpts + document links)
4. Fehlende Informationen (missing info flags)
5. Vorgeschlagene Checkliste (suggested checklist items)
6. Vorgeschlagene nächste Aktion (suggested next action)
7. Unterstützende Dokumente (supporting document links)
8. ▶ Erweitert (collapsible — confidence bar, strategy, model, latency, token count)

**States:**
- **Idle:** Question input visible, placeholder text
- **Analysing:** Progress bar + status text + elapsed counter + [Abbrechen] button
- **Answer Ready:** Full output visible, [Analyse übernehmen] + [Erneut analysieren]
- **Low Confidence:** Warning banner above results, recommendation text
- **Error:** Error message + [Erneut versuchen] + fallback suggestions

**Width constraints:** 320px in case workspace (right column). ~30% width on home screen. Never full-width. Never a modal.

### Checklist Component

- Ordered list of items with checkboxes
- Auto-populated based on Vorgang type
- User can add items (button at bottom: "+ Aufgabe hinzufügen")
- User can remove non-mandatory items (trash icon on hover)
- Mandatory items marked with * and lock icon
- Completed items: checkbox filled, text gray-500 with strikethrough, shows timestamp + user on right
- Incomplete mandatory items block phase advancement
- Checkbox toggle saves immediately (optimistic update)

### Activity Timeline

- Vertical list with left border (gray-200)
- Each entry: colored dot on the border line + content
- Colors: blue (Sachbearbeiter action), purple (Supervisor action), green (Bürger action), gray (System action)
- Content: timestamp (12px, gray-500) + actor name + action description + optional comment
- Simplified view: last 10 entries
- Full audit trail: "Vollständigen Verlauf" link opens complete list in expandable panel

---

## Interaction Patterns

### Hover & Focus

| Element | Hover | Focus |
|---|---|---|
| Button (primary) | background darkens 10% | outline: 2px solid var(--color-primary-500); outline-offset: 2px |
| Button (secondary) | background becomes var(--color-gray-50) | same as primary |
| Button (ghost) | underline appears, background var(--color-primary-50) | same as primary |
| Table row | background var(--color-primary-50) | same outline as buttons |
| Input | border var(--color-gray-400) | border var(--color-primary-500); box-shadow: 0 0 0 3px var(--color-primary-100) |
| Link | underline appears, color darkens | same outline as buttons |
| Card (action) | border-color var(--color-primary-300) | same outline as buttons |

### Keyboard Navigation

- **Tab:** Forward through interactive elements
- **Shift+Tab:** Backward
- **Enter / Space:** Activate focused button or link
- **Escape:** Close dialog, close dropdown, cancel operation
- **Arrow keys:** Navigate within select menus, tab lists, date pickers
- **? key:** Open keyboard shortcuts help panel

**Focus order (three-column case workspace):**
1. Back button (← Zurück)
2. Case number + Watch toggle
3. LEFT column top-to-bottom: assignment → priority → deadline → documents → notes → activity
4. CENTER column top-to-bottom: phase indicator → checklist items → new note input
5. RIGHT column top-to-bottom: question input → regulation links → Advanced toggle

### Animation Tokens

```css
:root {
  --duration-fast: 150ms;    /* hover, focus, button press */
  --duration-normal: 200ms;  /* page transitions, panel open/close */
  --duration-slow: 300ms;    /* toast dismiss, dialog close */
  --ease-default: ease;
  --ease-out: ease-out;
}
```

**Apply to:**
- `transition: background-color var(--duration-fast) var(--ease-default);`
- `transition: opacity var(--duration-normal) var(--ease-out);`
- `transition: transform var(--duration-normal) var(--ease-out);`

**Reduce motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

No auto-playing animations. No decorative motion. No parallax. No scroll-jacking.

### Validation

- **On blur:** Validate field, show inline error below field
- **On submit:** Validate all fields, focus first field with error, scroll to it
- **Error format:** Red border (var(--color-error-700)), error text below in 12px red
- **Success:** Border returns to gray-300, error text removed
- **Disabled fields:** gray-100 background, no validation, not submitted

### Confirmation Dialogs

**Use for:** Logout, delete document, archive case, reassign, submit for approval, purge document.

**Format:** Title (var(--text-h3)) + description (var(--text-body)) + [Abbrechen] (secondary) + [Bestätigen] (primary or danger).

**Danger actions (delete, purge):** Confirm button is `.btn--danger`.

### Autosave

- Draft decisions: save every 30 seconds and on blur
- Indicator: small text "Gespeichert" (saved) or "Speichern..." (saving) near the save button
- Internal notes: save on Enter or blur
- Checklist items: save immediately on toggle
- Form data in create/edit: persists in browser until explicitly submitted or discarded

### Undo

- Deleting a note, removing a checklist item, changing metadata: show undo toast for 10 seconds
- Toast: "Notiz gelöscht. [Rückgängig]"
- Destructive actions (purge, archive, submit): confirmation dialog instead (no undo)

---

## Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|---|---|
| Contrast (normal text) | 4.5:1 minimum — primary text (#1A1A2E) on white = 14.2:1 |
| Contrast (large text) | 3:1 minimum |
| Keyboard | All interactive elements focusable and operable via keyboard |
| Focus indicator | 2px solid var(--color-primary-500), 2px offset, always visible |
| Skip link | "Zum Hauptinhalt springen" — visually hidden, visible on focus |
| Screen reader | Proper heading hierarchy, form label associations, aria-labels on icon-only buttons, aria-live="polite" on toasts |
| Language | `<html lang="de">` |
| Touch target | Minimum 36×36px for all interactive elements |
| Color | Never the only differentiator — icons + text always accompany status colors |
| Motion | prefers-reduced-motion respected |
| Dialogs | Focus trapped, Escape closes, focus returns to trigger |
| Tables | Proper `<thead>`, `<tbody>`, `<th scope>` markup |
| Forms | Labels programmatically associated with inputs via `for`/`id` |
| Dynamic content | aria-live regions for toast notifications, loading state announcements |

---

## Visual Priority Hierarchy

Layouts must follow this emphasis order. Generate screens so that the P1 element is visually dominant and identifiable within 500ms.

| Priority | Element | Visual Treatment |
|---|---|---|
| **P1** | Current work — next task or active case | Most prominent, top of page, strongest visual weight |
| **P2** | Urgent deadlines — overdue, due today | Red/amber indicators, directly below current work |
| **P3** | Waiting items — blocked on citizen or authority | Neutral treatment, days-waiting counter |
| **P4** | Approvals (supervisor view) | Same weight as P2 |
| **P5** | Decision Support recommendations | Sidebar position, secondary weight |
| **P6** | Statistics — KPIs, activity feed | Compact, page bottom, muted |
| **P7** | Administration | Hidden behind Verwaltung nav |

---

## Design Constraints (Anti-Patterns)

**Never use:**
- Glassmorphism (frosted glass effects)
- Neumorphism (soft 3D)
- Box-shadows on cards (cards use 1px solid borders)
- Decorative gradients
- Decorative illustrations or mascot graphics
- Animated backgrounds
- AI sparkle icons or purple AI aesthetics
- Hero layouts with oversized typography
- Single-column layouts wider than 720px
- Mobile-first patterns (hamburger menu as primary nav, touch-optimized spacing, hidden navigation)
- "KI", "AI", or "künstliche Intelligenz" in any user-facing label

**Application identity:**
- This is enterprise productivity software for German public administration
- Visual inspiration: SAP Fiori, Microsoft Outlook, Jira Service Management
- NOT: ChatGPT, Notion, Linear, Slack, Discord, consumer apps, marketing sites

---

## Brand Summary

- **Name:** Kommunale Entscheidungsplattform
- **Short form:** Entscheidungsplattform
- **Tone:** Professional, precise, German public administration. Never "magic", "smart", "intelligent", or "AI" as product descriptors.
- **Users:** Trained professionals, not consumers. No onboarding wizards or tutorial overlays.
- **Desktop-first:** 1280-1920px, high information density.
- **Aesthetic:** Flat, clean, conservative — a well-designed government form, digital.

---

## Generation Rules for Google Stitch

These rules are binding for the UI generator. They override any default Stitch behaviors that contradict them.

1. **Generate one coherent enterprise application.** Every screen belongs to the same software product. There is one design language, one component library, one spacing philosophy, one typography system.

2. **Never redesign components between screens.** A table on the Document List screen is the same table component as on the Case Inbox screen. A dialog on the Login screen uses the same component as a dialog on the Administration screen. Consistency is more important than per-screen optimization.

3. **Never change spacing philosophy.** If cards use 20px padding on one screen, they use 20px padding on every screen. If the content area uses 32px horizontal padding on the Home screen, it uses the same on every screen.

4. **Never change typography.** Body text is always 14px/20px Inter Regular. Table text is always 13px/18px. Headings always follow the type scale. Do not introduce new font sizes or weights.

5. **Never switch design language.** Do not use flat design on one screen and material design on another. Do not use rounded buttons on one screen and square buttons on another. One language throughout.

6. **Never introduce consumer-style UI.** No gradient buttons, no floating action buttons, no pull-to-refresh, no swipe gestures, no infinite scroll with "loading more" spinners, no emoji reactions, no chat bubbles, no voice input. This is enterprise software for desktop workstations.

7. **Every screen must appear to belong to the same software product.** If a user navigates from Home to Case Workspace to Documents, the transition should feel seamless — as if moving between rooms in the same building, not visiting different buildings.
