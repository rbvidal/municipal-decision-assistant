# Component Library

Every screen in the platform is built from the same set of components. Consistency is more important than creativity. Municipal employees should learn the interface once and apply that knowledge everywhere.

## Cards

Cards group related information. They are secondary to tables.

```
┌──────────────────────────────────────┐
│                                      │
│  LABEL                               │
│  42                                  │
│  Beschreibung                        │
│                                      │
│  [ Aktion ]                          │
│                                      │
└──────────────────────────────────────┘
```

**Rules:**
- Cards have a 1px border (gray-300), 8px border-radius, white background
- Card padding: 20px
- Stat cards: large number (28px, bold), small label (12px, uppercase, gray-500)
- Action cards: title (16px, semibold), description (14px, gray-600), action link
- Cards never have shadows (flat design, enterprise aesthetic)
- Cards stack in grid: 4 columns at 1920px, 3 at 1366px
- Never use cards for primary data display — tables are for data

## Tables

Tables are the primary UI pattern. Every list is a table.

```
┌──────────┬──────────────────┬────────────┬──────────┬──────────┐
│  Spalte  │  Spalte          │  Spalte    │  Spalte  │  Aktionen │
├──────────┼──────────────────┼────────────┼──────────┼──────────┤
│  Wert    │  Wert            │  Wert      │  Wert    │  ...     │
│  Wert    │  Wert            │  Wert      │  Wert    │  ...     │
│  Wert    │  Wert            │  Wert      │  Wert    │  ...     │
└──────────┴──────────────────┴────────────┴──────────┴──────────┘
```

**Rules:**
- Sticky header with gray-100 background
- Row height: 40px (dense) or 48px (comfortable) — default is dense
- Alternating row background: white / gray-50 (very subtle, #FAFAFA)
- Column borders: none (use alignment and spacing, not grid lines)
- Text: 13px, left-aligned
- Numbers: 13px, right-aligned, tabular-nums
- Status badges: inline in cells
- Action column: right-aligned, minimum width needed for buttons
- Sortable columns: click header to sort, show ▲/▼ indicator
- Pagination: bottom-right. Shows "1-50 von 247" with prev/next buttons
- Hover: row gets gray-50 background if not already highlighted
- Selected row: blue-50 background, blue-500 left border (3px)
- Empty table: centered message with optional CTA

## Forms

```
LABEL *
┌──────────────────────────────────────────┐
│ Wert                                      │
└──────────────────────────────────────────┘
Hilfetext unter dem Feld
```

**Rules:**
- Label: 14px, semibold, above the field (never placeholder-only)
- Required fields: label followed by red asterisk (*)
- Input: 40px height, 1px border (gray-300), 8px border-radius, 14px text
- Focus: blue-500 border, 3px blue-100 box-shadow ring
- Error: red-500 border, red-50 background, error message below in red-600 12px
- Disabled: gray-100 background, gray-400 text
- Read-only: no border, same text styling
- Select: same styling as input, custom chevron icon
- Textarea: same styling, min-height 80px, resizable vertical
- Date picker: input with calendar icon trigger
- File upload: drop zone with dashed border (gray-300), 120px tall
- Submit button: full width in forms, right-aligned in toolbars

## Buttons

```
Primary:    ┌──────────────────┐
            │  Vorgang öffnen   │
            └──────────────────┘

Secondary:  ┌──────────────────┐
            │  Abbrechen        │
            └──────────────────┘

Danger:     ┌──────────────────┐
            │  Löschen          │
            └──────────────────┘

Ghost:      [ Nur Text ]

Icon:       [ → ]
```

**Rules:**
- Primary: blue-700 background, white text, 8px radius, 14px semibold
- Secondary: white background, gray-400 border, gray-700 text
- Danger: red-600 background, white text
- Ghost: no border, no background, blue-600 text, underline on hover
- Icon button: 36px × 36px, gray-500 icon, blue-500 on hover
- Button height: 36px (default), 32px (small, in tables), 44px (large, primary CTAs)
- Button padding: 16px horizontal, 8px vertical
- Hover: darken background by 10%
- Disabled: gray-200 background, gray-400 text, no interaction
- Loading: replace text with spinner, maintain width
- Button text: never wraps, truncate with "..." if needed

## Dialogs

```
┌──────────────────────────────────────────────┐
│                                              │
│  Titel                                       │
│  ─────────────────────────────────────────── │
│                                              │
│  Inhaltstext oder Formular.                  │
│  Beschreibt, was passiert oder was der       │
│  Benutzer tun soll.                          │
│                                              │
│  ─────────────────────────────────────────── │
│                                              │
│               [ Abbrechen ]  [ Bestätigen ]  │
│                                              │
└──────────────────────────────────────────────┘
```

**Rules:**
- Modal overlay: black at 50% opacity
- Dialog: white background, 8px radius, max-width 520px, centered
- Title: 18px, semibold
- Content: 14px, gray-700
- Actions: right-aligned, primary action first (left of secondary in button order)
- Close: X button top-right, or click overlay to dismiss (if no unsaved changes)
- Focus trap: tab cycles within dialog only
- Escape key: dismisses dialog

## Navigation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  ● Startseite  ○ Meine Arbeit  ○ Wissen  ○ Dokumente  ○ Verwaltung  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Rules:**
- Top navigation bar: 56px height, white background, bottom border (gray-200)
- Active item: blue-700 text, 3px blue-700 bottom border indicator
- Inactive item: gray-600 text, no border
- Hover: gray-100 background, gray-900 text
- Item padding: 16px horizontal, full height vertical
- Item text: 14px, medium weight
- Logo: left, 36px height, links to Startseite
- Right side: notification bell + user menu
- Sub-navigation: second row, 44px height, gray-50 background, smaller text (13px)
- Breadcrumb: above content, 12px, gray-500, with chevron separators
- Notification bell: `aria-label="Benachrichtigungen"` with `aria-describedby` for unread count

### Notification Bell Dropdown

```
┌──────────────────────────────────────────────────┐
│  Benachrichtigungen                   [ Alle lesen ]│
├──────────────────────────────────────────────────┤
│  ● Unread notification (bold, 13px)              │
│    Description text (13px, gray-600)              │
│    [ Action link ]                  Timestamp     │
│                                                  │
│  ○ Read notification (normal weight)             │
│    Description text                              │
│    [ Action link ]                  Timestamp     │
├──────────────────────────────────────────────────┤
│  Alle Benachrichtigungen anzeigen                 │
└──────────────────────────────────────────────────┘
```

**Rules:**
- 320px wide, max-height 480px, scrollable
- Unread: bold text, ● filled dot. Read: normal weight, ○ empty dot
- Badge on bell: red for approval/overdue, blue for assignments/info
- Badge count: number (1-99) or "99+"
- No badge when count is 0
- "Alle lesen" marks all as read (client-side only in v1.0)
- Clicking a notification navigates to the related item

## Badges & Status

```
Status:
  ✓ Aktiv      (green-100 bg, green-700 text)
  ⚠ Warnung    (amber-100 bg, amber-700 text)
  ✗ Fehler     (red-100 bg, red-700 text)
  ○ Inaktiv    (gray-100 bg, gray-600 text)
  ⏳ Laufend   (blue-100 bg, blue-700 text)

Priority:
  🔴 Hoch      (red-100 bg, red-700 text, bold) — aria-label: "Hohe Priorität"
  🟡 Mittel    (amber-100 bg, amber-700 text) — aria-label: "Mittlere Priorität"
  🟢 Niedrig   (green-100 bg, green-700 text) — aria-label: "Niedrige Priorität"

Risk:
  🔴 Hoch      (red-100 bg, red-700 text) — aria-label: "Hohes Risiko"
  🟡 Mittel    (amber-100 bg, amber-700 text) — aria-label: "Mittleres Risiko"
  🟢 Gering    (green-100 bg, green-700 text) — aria-label: "Geringes Risiko"

Confidence:
  ████████████░░░░  82%  Hoch
  (green for >80%, amber for 50-80%, red for <50%)
```

**Rules:**
- Badges: inline-flex, 6px horizontal padding, 4px border-radius, 12px text
- Status dots: 8px circles, with color coding
- Confidence bar: 6px height, 120px width, segmented fill. Screen-reader text: "Verlässlichkeit: 82 Prozent"
- Always show text label alongside color indicators (never color-only)
- Risk and priority indicators always include visible text label (Hoch/Mittel/Gering) plus the colored dot

## Icons

Use a consistent icon set (recommended: Phosphor Icons, 24px, weight: regular).

Common icons:
- Search: 🔍 (MagnifyingGlass)
- Document: 📄 (FileText)
- Upload: ⬆ (Upload)
- Download: ⬇ (Download)
- Settings: ⚙ (Gear)
- User: 👤 (User)
- Bell: 🔔 (Bell)
- Check: ✓ (Check)
- Warning: ⚠ (Warning)
- Error: ✗ (XCircle)
- Info: ℹ (Info)
- Arrow right: → (ArrowRight)
- Arrow left: ← (ArrowLeft)
- Chevron down: ▾ (CaretDown)
- Chevron up: ▴ (CaretUp)
- Star: ☆ (Star)
- Star filled: ★ (StarFill)
- Clock: 🕐 (Clock)
- Calendar: 📅 (Calendar)
- Filter: 🔍 (Funnel)
- More: ... (DotsThree)
- External link: ↗ (ArrowSquareOut)
- Copy: 📋 (Copy)
- Refresh: ↻ (ArrowClockwise)
- Trash: 🗑 (Trash)
- Edit: ✏ (Pencil)
- Plus: + (Plus)
- Minus: - (Minus)

**Rules:**
- Icons always have text labels (no icon-only buttons except in tables)
- Icon size: 20px inline with text, 24px standalone
- Icon color: matches text color (gray-600 default, blue-600 interactive)

### Keyboard Focus Order (Three-Column Workspace)

The case detail view uses a three-column layout. Tab order is left-to-right, top-to-bottom within each column:

```
1. Back button (← Zurück)
2. Case number + Watch toggle
3. LEFT COLUMN (Case Details): assignment → priority → deadline → documents → internal notes → activity
4. CENTER COLUMN (Workspace): phase indicator → checklist items → document previews → new note input
5. RIGHT COLUMN (Decision Support): question input → analyze button → regulation links → checklist actions → Advanced toggle
```

Dialogs trap focus. Escape closes overlays. Skip link at top: "Zum Hauptinhalt springen".
- Never use emoji in production — use the icon library

## Empty States

Empty states are centered in the content area. They explain what should be there and provide a clear action.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                         (icon, 48px, gray-400)                           │
│                                                                          │
│                   Überschrift (18px, gray-700, semibold)                  │
│                                                                          │
│     Beschreibung (14px, gray-500). Was fehlt und warum. Max 2 Zeilen.    │
│                                                                          │
│                    ┌──────────────────────────┐                          │
│                    │  Aktion (primärer Button) │                          │
│                    └──────────────────────────┘                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Loading States

### Skeleton (tables and cards)

```
┌──────────────────────────┬────────────┬──────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░ │ ░░░░░░░░░░ │ ░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░ │ ░░░░░░░░░░ │ ░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░ │ ░░░░░░░░░░ │ ░░░░░░░░ │
└──────────────────────────┴────────────┴──────────┘
```

Gray-200 animated pulse, matching the shape of the expected content.

### Spinner (buttons and inline)

A 20px animated spinner for buttons. A 32px spinner centered for page loads.

### Progress bar

```
████████████████░░░░░░░░░░░░░░░░░░░░  48%
```

6px height, blue-500 fill, gray-200 track, 8px radius. Label: "48%" or "Wird verarbeitet..."

## Toast Notifications

```
┌──────────────────────────────────────────┐
│ ✓  Dokument erfolgreich hochgeladen       │
│    "BauO-NRW-2024.pdf"                   │
└──────────────────────────────────────────┘
```

**Rules:**
- Position: bottom-right, 24px from edges
- Width: 380px, max
- Auto-dismiss: 5 seconds (success, info), 10 seconds (warning, error)
- Stack: multiple toasts stack upward with 8px gap
- Colors: green (success), amber (warning), red (error), blue (info)
- Icon: left-aligned, 20px
- Close: X button top-right
- Animation: slide in from right, fade out

## Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVIGATION (56px)                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  SUB NAVIGATION (44px, optional)                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  BREADCRUMB (28px)                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CONTENT AREA                                                                │
│  ┌───────────────────────────────────────────┬────────────────────────────┐  │
│  │                                           │                            │  │
│  │  MAIN CONTENT                             │  SIDEBAR (optional)        │  │
│  │                                           │  280px width               │  │
│  │  Fluid width                              │  Gray-50 background        │  │
│  │                                           │  Collapsible               │  │
│  │                                           │                            │  │
│  └───────────────────────────────────────────┴────────────────────────────┘  │
│                                                                              │
│  Max content width: 1400px (centered at 1920px)                              │
│  Min content width: 960px (at 1280px viewport)                               │
│  Content padding: 32px (horizontal), 24px (vertical)                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Typography

```
Family:    Inter (headings + body)
           JetBrains Mono (code, IDs, references)

Scale:
  H1: 24px / 32px line-height / semibold (700)
  H2: 20px / 28px / semibold
  H3: 16px / 24px / semibold
  Body: 14px / 20px / regular (400)
  Small: 13px / 18px / regular
  Caption: 12px / 16px / regular
  Code: 13px / 20px / regular, tabular-nums

Colors:
  Text primary:   #1A1A2E  (gray-900)
  Text secondary: #4A5568  (gray-600)
  Text muted:     #A0AEC0  (gray-400)
  Text link:      #2B6CB0  (blue-600)
  Text inverse:   #FFFFFF  (white)
```

## Spacing Scale

```
4px   — icon-to-label gap, badge padding
8px   — inline element gap, card padding (vertical inner)
12px  — form field gap
16px  — section gap, button padding (horizontal)
20px  — card padding
24px  — content padding (vertical)
32px  — content padding (horizontal), section separator
40px  — page top padding
56px  — navigation height
```
