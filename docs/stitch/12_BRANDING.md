# Branding & Visual Identity

## Design Ethos

The Municipal Decision Platform is **enterprise software for German public administration.** It must convey reliability, precision, and trustworthiness. It should feel like a professional tool that municipal employees can depend on for their daily legal and administrative work.

The visual identity draws from:
- **Microsoft 365** — clean, flat, professional, task-oriented
- **SAP Fiori** — information-dense, role-based, accessible
- **German government design systems** — clear hierarchy, conservative colors, high readability

It explicitly avoids:
- Startup aesthetics (gradients, illustrations, oversized typography)
- Consumer app patterns (glassmorphism, floating elements, dark mode as default)
- Marketing landing page design (hero images, animated counters, social proof)
- AI hype aesthetics (purple gradients, sparkle icons, "magic" language)

---

## Color Palette

```
PRIMARY
──────────────────────────────────────────────
Blue-900:  #1A365D    Primary headings, logo
Blue-700:  #2B6CB0    Primary buttons, links, active states
Blue-500:  #3182CE    Interactive elements, focus rings
Blue-100:  #EBF8FF    Selected row background, info callout
Blue-50:   #F7FAFC    Table hover, subtle highlight

NEUTRAL
──────────────────────────────────────────────
Gray-900:  #1A1A2E    Primary text
Gray-700:  #4A5568    Secondary text, body
Gray-600:  #718096    Muted text, placeholders
Gray-500:  #A0AEC0    Disabled text, icons
Gray-400:  #CBD5E0    Borders, dividers
Gray-300:  #E2E8F0    Input borders, card borders
Gray-200:  #EDF2F7    Skeleton loading, disabled backgrounds
Gray-100:  #F7FAFC    Table header, sidebar background
Gray-50:   #FAFBFC    Page background, alternating rows

SEMANTIC
──────────────────────────────────────────────
Green-700: #276749    Success text
Green-100: #F0FFF4    Success badge background
Green-50:  #E6FFED    Success subtle background

Amber-700: #975A16    Warning text
Amber-100: #FFFFF0    Warning badge background
Amber-50:  #FFFBEB    Warning subtle background

Red-700:   #9B2C2C    Error text, danger buttons
Red-100:   #FFF5F5    Error badge background
Red-50:    #FED7D7    Error subtle background

Blue-700:  #2B6CB0    Info text
Blue-100:  #EBF8FF    Info badge background
Blue-50:   #E3F2FD    Info subtle background

BACKGROUND
──────────────────────────────────────────────
White:     #FFFFFF    Cards, dialogs, inputs
Gray-50:   #FAFBFC    Page background
```

---

## Typography

```
PRIMARY FONT: Inter
──────────────────────────────────────────────
A workhorse sans-serif designed for screens.
Clean, neutral, highly readable at small sizes.
Used for: everything except code.

Weights used:
  Regular (400)  — body text, table content, labels
  Medium (500)   — navigation, button text, table headers
  Semibold (600) — headings, card titles
  Bold (700)     — stat numbers, emphasis

MONOSPACE FONT: JetBrains Mono
──────────────────────────────────────────────
Used for: document references, case numbers, code blocks,
          technical identifiers, file names, chunk IDs

TYPE SCALE
──────────────────────────────────────────────
  Heading 1:  24px / 32px  / Semibold
  Heading 2:  20px / 28px  / Semibold
  Heading 3:  16px / 24px  / Semibold
  Body:       14px / 20px  / Regular
  Body Small: 13px / 18px  / Regular
  Caption:    12px / 16px  / Regular
  Stat:       28px / 36px  / Bold
  Code:       13px / 20px  / Regular (JetBrains Mono)

TEXT COLOR HIERARCHY
──────────────────────────────────────────────
  Primary:   #1A1A2E  (headings, body, table content)
  Secondary: #4A5568  (descriptions, metadata, secondary info)
  Muted:     #A0AEC0  (placeholders, disabled, empty states)
  Link:      #2B6CB0  (links, interactive text)
  Inverse:   #FFFFFF  (text on dark backgrounds, primary buttons)
```

---

## Language & Tone

All interface text is in **German.** The platform supports a DE/EN toggle in the user menu, but the default and primary language is German.

**Tone principles:**
- Professional, not bureaucratic
- Clear, not clever
- Concise, not curt
- Helpful, not enthusiastic

**Examples:**

| ❌ Don't | ✓ Do |
|---|---|
| "Oops! Something went wrong." | "Ein Fehler ist aufgetreten." |
| "Awesome! Your document is ready!" | "Dokument wurde verarbeitet." |
| "Let's get started!" | "Willkommen." |
| "Magic AI Insights" | "Entscheidungsunterstützung" |
| "Ask the AI..." | "Frage zu Vorschriften oder Verfahren?" |
| "AI Assistant" | "Entscheidungsunterstützung" |
| "Click here!" | "Öffnen" |

**AI-specific language:**
- Never say "AI" or "Artificial Intelligence" in user-facing labels
- Use "KI" (Künstliche Intelligenz) consistently
- Never use "magic", "smart", "intelligent" as adjectives
- The AI "analysiert", "schlägt vor", "findet" — not "versteht", "weiß", "denkt"

---

## Application Name

```
Kommunale Entscheidungsplattform
```

Short form in navigation: "Entscheidungsplattform"

The name emphasizes "platform" (a tool) not "assistant" (a personality). It's software that municipal employees use, not an entity they converse with.

---

## Logo & Municipality Branding

The platform supports per-municipality branding:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Municipality Coat of Arms / Logo]  Entscheidungsplattform                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Logo placeholder: 36px height, left-aligned in navigation
- Municipality name sourced from user profile or configuration
- Login screen: larger logo (64px), centered above the form
- Color accent can be overridden per municipality (default: blue-700)

---

## Desktop-First

The platform is designed for desktop workstations in municipal offices.

```
Minimum supported width:  1280px  (standard office monitor)
Optimal width:             1920px  (Full HD)
Maximum content width:     1400px  (centered)

Tablet:   Not a target device for v1.0. Read-only case status acceptable.
Mobile:   Not supported in v1.0. Municipal employees use desktop workstations.
```

No responsive breakpoints below 1280px are defined for v1.0. Future versions may add read-only tablet views.

---

## Information Density

German public administration deals with complex, text-heavy information. The interface must present it efficiently.

**Rules:**
- Tables default to 50 rows (not 10 or 20)
- Cards use 3-5 columns at 1920px (not 2-3)
- Form labels are concise — one line maximum
- Section headers are compact — no extra vertical space
- White space is functional (separating sections), not decorative
- Content padding: 32px horizontal (efficient use of screen width)
- Never use "hero" layouts with oversized typography
- Never use single-column layouts wider than 720px

---

## Accessibility (WCAG 2.1 AA)

```
CONTRAST
──────────────────────────────────────────────
All text meets WCAG AA minimum contrast ratios:
  Normal text (< 18px):  4.5:1 minimum
  Large text (≥ 18px):   3:1 minimum

  Primary text (#1A1A2E) on white:      14.2:1  ✓
  Secondary text (#4A5568) on white:      7.5:1  ✓
  Blue-700 (#2B6CB0) on white:           5.1:1  ✓
  White on Blue-700 (#2B6CB0):           5.1:1  ✓
  Red-700 (#9B2C2C) on white:            7.3:1  ✓
  Gray-500 (#A0AEC0) on white:           2.5:1  ✗ (use only for decorative)

KEYBOARD NAVIGATION
──────────────────────────────────────────────
  All interactive elements: keyboard accessible
  Focus order: logical (left-to-right, top-to-bottom)
  Focus indicator: 3px blue-500 outline, 2px offset
  Skip link: "Zum Hauptinhalt springen" (hidden, visible on focus)
  Tab traps: dialogs trap focus; modal closes on Escape

SCREEN READER
──────────────────────────────────────────────
  All images: descriptive alt text
  All icons: aria-label or hidden (aria-hidden="true") with adjacent text
  Tables: proper <thead>, <tbody>, <th scope> markup
  Forms: labels programmatically associated with inputs
  Dynamic content: aria-live="polite" for toast notifications
  Page titles: unique, descriptive <title> per page
  Language: <html lang="de">

ADDITIONAL
──────────────────────────────────────────────
  Minimum touch target: 36×36px (all interactive elements)
  Color is never the only differentiator (icons + text accompany status colors)
  Text can be resized to 200% without loss of content or functionality
  Motion: no auto-playing animations; prefers-reduced-motion respected
```
