# Design System

## Overview

The Municipal Decision Platform design system defines every visual and interaction pattern. It exists so that AI Studio can generate consistent, professional screens without guessing at spacing, colors, or component behavior.

This document is prescriptive, not descriptive. It tells the generator what to build, not what exists.

---

## Typography

```
Font Family
──────────────────────────────────────────────
UI Text:    Inter (Google Fonts, weight 400/500/600/700)
Code:       JetBrains Mono (Google Fonts, weight 400)

Import:
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');

Type Scale
──────────────────────────────────────────────
  .text-h1      24px / 32px  / font-weight: 600   (page titles)
  .text-h2      20px / 28px  / font-weight: 600   (section headers)
  .text-h3      16px / 24px  / font-weight: 600   (card titles, dialog titles)
  .text-body    14px / 20px  / font-weight: 400   (paragraphs, descriptions, labels)
  .text-small   13px / 18px  / font-weight: 400   (table content, metadata)
  .text-caption 12px / 16px  / font-weight: 400   (badges, timestamps, help text)
  .text-stat    28px / 36px  / font-weight: 700   (stat card numbers)
  .text-code    13px / 20px  / font-weight: 400   (JetBrains Mono — IDs, refs)
```

---

## Colors

```
CSS Custom Properties
──────────────────────────────────────────────
  --color-primary-900: #1A365D;
  --color-primary-700: #2B6CB0;
  --color-primary-500: #3182CE;
  --color-primary-100: #EBF8FF;
  --color-primary-50:  #F7FAFC;

  --color-gray-900: #1A1A2E;
  --color-gray-700: #4A5568;
  --color-gray-600: #718096;
  --color-gray-500: #A0AEC0;
  --color-gray-400: #CBD5E0;
  --color-gray-300: #E2E8F0;
  --color-gray-200: #EDF2F7;
  --color-gray-100: #F7FAFC;
  --color-gray-50:  #FAFBFC;

  --color-success-700: #276749;
  --color-success-100: #F0FFF4;
  --color-success-50:  #E6FFED;

  --color-warning-700: #975A16;
  --color-warning-100: #FFFFF0;
  --color-warning-50:  #FFFBEB;

  --color-error-700: #9B2C2C;
  --color-error-100: #FFF5F5;
  --color-error-50:  #FED7D7;

  --color-info-700: #2B6CB0;
  --color-info-100: #EBF8FF;
  --color-info-50:  #E3F2FD;

  --color-white:    #FFFFFF;
  --color-bg-page:  #FAFBFC;

Semantic Usage
──────────────────────────────────────────────
  Page background:     var(--color-bg-page)
  Card background:     var(--color-white)
  Primary text:        var(--color-gray-900)
  Secondary text:      var(--color-gray-700)
  Muted text:          var(--color-gray-500)
  Primary button bg:   var(--color-primary-700)
  Primary button text: var(--color-white)
  Border default:      var(--color-gray-300)
  Border light:        var(--color-gray-200)
  Focus ring:          3px solid var(--color-primary-100)
  Focus outline:       2px solid var(--color-primary-500)
  Table header bg:     var(--color-gray-100)
  Selected row bg:     var(--color-primary-50)
  Hover row bg:        var(--color-gray-50)
```

---

## Spacing

```
Spacing Scale (4px base)
──────────────────────────────────────────────
  --space-1:  4px;    icon-to-text, badge inner padding
  --space-2:  8px;    inline gap, button inner vertical
  --space-3:  12px;   form field vertical gap
  --space-4:  16px;   section gap, button horizontal padding
  --space-5:  20px;   card inner padding
  --space-6:  24px;   content area vertical padding
  --space-8:  32px;   content area horizontal padding
  --space-10: 40px;   page top spacing
  --space-14: 56px;   navigation height
```

---

## Grid

```
Content Layout
──────────────────────────────────────────────
  Max content width:  1400px
  Content padding:    32px (horizontal), 24px (vertical)
  Content centered:   margin: 0 auto

Card Grid
──────────────────────────────────────────────
  4 columns at 1920px:  grid-template-columns: repeat(4, 1fr); gap: 16px;
  3 columns at 1366px:  grid-template-columns: repeat(3, 1fr); gap: 16px;

Two-Column (Main + Sidebar)
──────────────────────────────────────────────
  Main:    flex: 1; min-width: 0;
  Sidebar: width: 280px; flex-shrink: 0;
  Gap:     24px;
  Sidebar background: var(--color-gray-100);
  Sidebar padding: 16px;
```

---

## Cards

```
.card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  padding: 20px;
}

.card--stat {
  text-align: left;
}

.card--stat .stat-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  color: var(--color-gray-900);
}

.card--stat .stat-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-gray-500);
  margin-top: 4px;
}

.card--stat .stat-link {
  font-size: 13px;
  color: var(--color-primary-700);
  margin-top: 8px;
}

.card--action {
  /* Same as .card, plus: */
  cursor: pointer;
}

.card--action:hover {
  border-color: var(--color-primary-300);
}

.card--action .card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.card--action .card-description {
  font-size: 14px;
  color: var(--color-gray-600);
  margin-top: 4px;
}

/* NO SHADOWS on any card variant */
```

---

## Tables

```
.table-container {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  line-height: 18px;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

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

.table tbody tr:nth-child(even) {
  background: var(--color-gray-50);
}

.table tbody tr:hover {
  background: var(--color-primary-50);
}

.table tbody tr.selected {
  background: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-500);
}

.table td.actions {
  text-align: right;
  white-space: nowrap;
}

.table td.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
```

---

## Buttons

```
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  white-space: nowrap;
  min-height: 36px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-primary-700);
  color: var(--color-white);
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-900);
}

.btn--secondary {
  background: var(--color-white);
  color: var(--color-gray-700);
  border-color: var(--color-gray-400);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--color-gray-50);
}

.btn--danger {
  background: var(--color-error-700);
  color: var(--color-white);
}
.btn--danger:hover:not(:disabled) {
  background: #822727;
}

.btn--ghost {
  background: transparent;
  color: var(--color-primary-700);
  border: none;
}
.btn--ghost:hover:not(:disabled) {
  text-decoration: underline;
  background: var(--color-primary-50);
}

.btn--sm {
  font-size: 13px;
  padding: 4px 10px;
  min-height: 32px;
  border-radius: 6px;
}

.btn--lg {
  font-size: 14px;
  padding: 12px 24px;
  min-height: 44px;
}

.btn--icon {
  width: 36px;
  height: 36px;
  padding: 0;
  min-height: auto;
  border-radius: 6px;
}

.btn--loading {
  /* Replace text with spinner while keeping width */
  color: transparent;
  position: relative;
}
.btn--loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

---

## Form Elements

```
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-900);
  margin-bottom: 4px;
}

.form-label .required::after {
  content: ' *';
  color: var(--color-error-700);
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-gray-900);
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-input.error {
  border-color: var(--color-error-700);
  background: var(--color-error-50);
}

.form-input:disabled {
  background: var(--color-gray-100);
  color: var(--color-gray-500);
}

.form-input::placeholder {
  color: var(--color-gray-500);
}

.form-select {
  /* Same as .form-input, plus: */
  appearance: none;
  background-image: url("data:image/svg+xml,...");  /* chevron */
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.form-textarea {
  /* Same as .form-input, plus: */
  min-height: 80px;
  resize: vertical;
  line-height: 20px;
}

.form-help {
  font-size: 12px;
  color: var(--color-gray-500);
  margin-top: 4px;
}

.form-error {
  font-size: 12px;
  color: var(--color-error-700);
  margin-top: 4px;
}

.form-hint {
  font-size: 12px;
  color: var(--color-gray-500);
  margin-top: 4px;
}
```

---

## Badges

```
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  border-radius: 4px;
  white-space: nowrap;
}

.badge--success { background: var(--color-success-100); color: var(--color-success-700); }
.badge--warning { background: var(--color-warning-100); color: var(--color-warning-700); }
.badge--error   { background: var(--color-error-100);   color: var(--color-error-700);   }
.badge--info    { background: var(--color-info-100);    color: var(--color-info-700);    }
.badge--neutral { background: var(--color-gray-100);    color: var(--color-gray-700);    }

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot--green  { background: #38A169; }
.status-dot--amber  { background: #D69E2E; }
.status-dot--red    { background: #E53E3E; }
.status-dot--gray   { background: #A0AEC0; }
```

---

## Toast Notifications

```
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
  border-radius: 8px;
  border: 1px solid var(--color-gray-300);
  background: var(--color-white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  animation: slideInRight 0.2s ease-out;
}

.toast--success { border-left: 4px solid var(--color-success-700); }
.toast--warning { border-left: 4px solid var(--color-warning-700); }
.toast--error   { border-left: 4px solid var(--color-error-700);   }
.toast--info    { border-left: 4px solid var(--color-info-700);    }

.toast-fade-out {
  animation: fadeOut 0.3s ease-out forwards;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

---

## Dialogs

```
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
  border-radius: 8px;
  max-width: 520px;
  width: calc(100vw - 64px);
  padding: 24px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 8px;
}

.dialog-content {
  font-size: 14px;
  color: var(--color-gray-700);
  margin-bottom: 24px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

---

## Icons

Use **Phosphor Icons** (https://phosphoricons.com), 24px, weight: regular.

Key icons and their component names:

| Usage | Icon | Phosphor Name |
|---|---|---|
| Search | 🔍 | `MagnifyingGlass` |
| Document | 📄 | `FileText` |
| Upload | ⬆ | `Upload` |
| Download | ⬇ | `Download` |
| Settings | ⚙ | `Gear` |
| User | 👤 | `User` |
| Notification | 🔔 | `Bell` |
| Check/Complete | ✓ | `Check` |
| Warning | ⚠ | `Warning` |
| Error/Close | ✗ | `XCircle` |
| Info | ℹ | `Info` |
| Arrow right | → | `ArrowRight` |
| Arrow left | ← | `ArrowLeft` |
| Expand/Chevron | ▾ | `CaretDown` |
| Collapse | ▴ | `CaretUp` |
| Star (empty) | ☆ | `Star` |
| Star (filled) | ★ | `StarFill` |
| Clock | 🕐 | `Clock` |
| Calendar | 📅 | `Calendar` |
| Filter | 🔍 | `Funnel` |
| More options | ... | `DotsThree` |
| External link | ↗ | `ArrowSquareOut` |
| Copy | 📋 | `Copy` |
| Refresh | ↻ | `ArrowClockwise` |
| Delete | 🗑 | `Trash` |
| Edit | ✏ | `Pencil` |
| Plus | + | `Plus` |
| Home | ⌂ | `House` |
| Folder | 📁 | `Folder` |
| Lock | 🔒 | `Lock` |
| Eye | 👁 | `Eye` |
| Eye off | 👁⃞ | `EyeSlash` |

---

## Animations & Transitions

The interface should feel responsive, not animated. No decorative motion.

```
Duration tokens:
  --duration-instant: 0ms;
  --duration-fast:    150ms;   /* hover, focus, button press */
  --duration-normal:  200ms;   /* page transitions, panel open/close */
  --duration-slow:    300ms;   /* toast dismiss, dialog close */

Easing:
  --ease-default:  ease;
  --ease-out:      ease-out;

Usage:
  transition: background-color var(--duration-fast) var(--ease-default);
  transition: opacity var(--duration-normal) var(--ease-out);

Prefers reduced motion:
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
```

---

## Dark Mode

Not implemented in v1.0. The design system reserves the right to add dark mode in a future version. Color tokens should be defined as CSS custom properties that could be swapped with a `[data-theme="dark"]` selector. No action required for the initial Stitch generation.

---

## Accessibility Checklist

```
✓ All interactive elements are keyboard accessible (Tab, Enter, Space, Escape)
✓ Focus order is logical (DOM order matches visual order)
✓ Focus indicator is visible (3px blue-500 outline, 2px offset)
✓ Skip-to-content link at top of page
✓ All images have alt text (or aria-hidden if decorative)
✓ All icons have aria-label or adjacent visible text
✓ Tables use proper <thead>/<tbody>/<th scope> markup
✓ Form labels are programmatically associated with inputs
✓ Error messages are announced to screen readers (aria-live="polite")
✓ Color is never the only differentiator (icons + text accompany color)
✓ Text meets WCAG AA contrast ratios
✓ Page has unique, descriptive <title>
✓ <html lang="de"> is set
✓ Minimum touch target: 36×36px
✓ Dialogs trap focus and close on Escape
✓ Toast notifications use aria-live="polite"
```
