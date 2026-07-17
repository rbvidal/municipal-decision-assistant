# Phase 1 Implementation — Design System & Primitives

**Date:** 16 July 2026
**Status:** Complete

---

## Implemented Files

### Types (5 files)

| File | Purpose |
|---|---|
| `src/types/common.ts` | Shared enums: Size, Variant, Status, Priority, Risk, Position, Alignment, Orientation |
| `src/types/ui.ts` | Component prop interfaces: Button, IconButton, Badge, StatusDot, Spinner, Skeleton, Divider, ProgressIndicator, ConfidenceBar, EmptyState, Toast, PasswordRules |
| `src/types/forms.ts` | Form interfaces: TextInput, TextArea, SelectInput, SelectOption, Checkbox, DatePicker, FormField |
| `src/types/status.ts` | Domain status types: VorgangStatus, DocumentStatus, DecisionSupportState, NotificationState, WorkflowPhase with German label maps |
| `src/types/theme.ts` | Theme interfaces: ColorTokens, TypographyTokens, SpacingTokens, BreakpointTokens, ZIndexLayer |
| `src/types/index.ts` | Barrel export |

### Constants (6 files)

| File | Purpose |
|---|---|
| `src/constants/colors.ts` | All color values matching DESIGN.md |
| `src/constants/spacing.ts` | Spacing scale, breakpoints, z-index layers, border radii, animation durations |
| `src/constants/typography.ts` | Font families, font weights, type scale |
| `src/constants/icons.ts` | Icon name constants (35 icons), icon sizes |
| `src/constants/routes.ts` | All 37 route paths, module label map |
| `src/constants/index.ts` | Barrel export |

### Utilities (5 files)

| File | Purpose |
|---|---|
| `src/utils/classnames.ts` | `cn()` — conditional className joiner |
| `src/utils/accessibility.ts` | `generateId()`, focus ring constant |
| `src/utils/formatting.ts` | `formatPercentage()`, `formatCaseNumber()`, `formatDate()`, `formatDateTime()`, `formatFileSize()`, `truncate()` |
| `src/utils/validation.ts` | `isValidEmail()`, `isValidPassword()`, `hasUppercase()`, `hasNumber()`, `hasSpecialChar()`, `isNotEmpty()`, `isWithinRange()` |
| `src/utils/index.ts` | Barrel export |

### Styles (10 files)

| File | Purpose |
|---|---|
| `src/styles/tokens.css` | 150+ CSS custom properties — colors, typography, spacing, sizing, radii, borders, transitions, z-index, shadows, focus ring, keyframes |
| `src/styles/theme.css` | Theme selector — light mode default, dark mode placeholder |
| `src/styles/colors.css` | Text, background, and border utility classes |
| `src/styles/typography.css` | Body defaults, heading classes, font weight classes, mono font |
| `src/styles/spacing.css` | Gap, padding, margin utility classes |
| `src/styles/layout.css` | App shell, content area, sidebar, three-column, card grid |
| `src/styles/forms.css` | Label, input, select, textarea, checkbox, help/error text |
| `src/styles/tables.css` | Data table, header, row, pagination, sort indicators |
| `src/styles/utilities.css` | sr-only, focus-ring, truncate, flex-center, w-full |
| `src/styles/animations.css` | fadeIn, fadeOut, slideInRight, slideInUp + prefers-reduced-motion |
| `src/styles/globals.css` | CSS reset, font imports, all imports cascaded |
| `src/styles/index.ts` | Barrel export |

### Components (19 components, 19 .tsx + 14 .module.css files)

#### Common Components (14)

| Component | Props | States | Accessibility |
|---|---|---|---|
| **Button** | variant, size, loading, disabled, fullWidth, type, onClick | idle, hover, focus, disabled, loading | aria-label, aria-busy, focus-visible |
| **IconButton** | icon, ariaLabel, size, variant, disabled, loading | idle, hover, focus, disabled, loading | aria-label (required), aria-busy, focus-visible |
| **Badge** | status, priority, risk, variant (dot/pill), children | — | role="status", aria-label |
| **StatusDot** | status (success/warning/error/info/neutral), size | — | role="status", aria-label (auto-generated) |
| **Spinner** | size (sm/md/lg) | spinning | role="status", aria-label |
| **Skeleton** | variant (text/card/table-row/circle), width, height, count | pulsing | role="status", aria-hidden |
| **Divider** | orientation (horizontal/vertical), label | — | role="separator", aria-orientation |
| **ProgressIndicator** | value, max, label, showPercentage, size, status | filling | role="progressbar", aria-valuenow/min/max |
| **ConfidenceBar** | value, max | high/medium/low | role="progressbar", aria-label (auto-generated) |
| **EmptyState** | icon, title, description, action | — | — |
| **Toast** | id, type, message, action, duration | visible, dismissing | role="alert", aria-live="polite" |
| **Logo** | size (sm/md/lg) | — | role="img", aria-label |
| **Icon** | name, size | — | aria-label, aria-hidden |
| **PasswordRules** | password, minLength, requireUppercase, requireNumber, requireSpecial | pass/fail per rule | aria-label on list |

#### Form Components (5)

| Component | Props | States | Accessibility |
|---|---|---|---|
| **TextInput** | label, value, onChange, type, placeholder, error, helpText, required, disabled, readOnly, maxLength, autoComplete | idle, focus, error, disabled, readOnly | label association, aria-invalid, aria-describedby, error role="alert" |
| **TextArea** | label, value, onChange, placeholder, error, helpText, required, disabled, readOnly, rows, maxLength, resize | idle, focus, error, disabled | label association, aria-invalid, aria-describedby |
| **SelectInput** | label, value, onChange, options, placeholder, error, helpText, required, disabled | idle, focus, error, disabled | label association, aria-invalid, aria-describedby |
| **Checkbox** | label, checked, onChange, disabled, required, indeterminate, error | checked, unchecked, indeterminate, disabled | label association, aria-invalid, indeterminate ref |
| **DatePicker** | label, value, onChange, min, max, error, helpText, required, disabled | idle, focus, error, disabled | label association, aria-invalid, aria-describedby |

---

## Design Decisions

1. **CSS Modules over Tailwind in components.** Each component has a co-located `.module.css` file. Global utility classes (`form-input`, `form-label`) are used from `forms.css` for shared form styling. This avoids Tailwind class pollution while keeping shared styles centralized.

2. **All visual properties reference CSS custom properties.** No hardcoded colors, spacing, or typography values in component code. This enables future dark mode via `[data-theme="dark"]` selector.

3. **TypeScript strict throughout.** Every component has an explicit props interface in `src/types/`. No `any` types. No implicit returns.

4. **React.memo on all display components.** Pure components (Badge, StatusDot, Spinner, Skeleton, Divider, ProgressIndicator, ConfidenceBar, EmptyState, PasswordRules, SelectInput, Checkbox, DatePicker, TextArea, Icon, Logo) use React.memo for render optimization.

5. **forwardRef on interactive components.** Button, IconButton, TextInput use forwardRef for parent component ref access.

6. **Auto-generated IDs.** Form components auto-generate unique IDs via `generateId()` when no `id` prop is provided. This ensures label-input association works without manual ID management.

7. **Auto-generated aria labels.** StatusDot and ConfidenceBar generate German aria labels from their props when no explicit `ariaLabel` is provided.

---

## Remaining Work

### Not Yet Implemented (Phase 2+)

- **Navigation components:** TopNavigation, SubNavigation, Breadcrumb, Sidebar, TabBar, NotificationBell, UserMenu
- **Data components:** DataTable, TableHeader, TableRow, TablePagination, TableSkeleton
- **Overlay components:** Dialog, ConfirmDialog, Drawer, ToastContainer
- **Layout components:** AuthLayout, AppLayout, CaseWorkspaceLayout, AdminLayout, CaseHeader
- **Feature components:** DecisionSupportPanel, Checklist, Timeline, WorkflowStepper, Wizard, SearchBar, FilterBar, FileUpload, KnowledgeCard, RegulationBrowser, DocumentPreview, VersionComparison, ComparisonWorkspace, AssignmentPanel, FavoritesSidebar
- **Pages:** All 41 pages
- **Routing:** React Router setup, ProtectedRoute, AdminRoute
- **API integration:** API client, service functions, TanStack Query hooks
- **State management:** AuthContext, CaseContext, ToastContext, NotificationContext

### Known Assumptions

1. **Lucide React will be the icon library.** The `Icon` component wraps Lucide's `data-lucide` attribute pattern. `lucide-react` must be added to `package.json` dependencies.
2. **CSS Modules require Vite.** The `.module.css` pattern is natively supported by Vite. No additional configuration needed.
3. **Fonts are loaded from Google Fonts CDN.** `globals.css` imports Inter and JetBrains Mono. Self-hosting fonts is a future optimization.
4. **Form components delegate to global CSS classes.** `form-input`, `form-label`, `form-help`, `form-error` classes in `forms.css` are used by TextInput, TextArea, SelectInput, and DatePicker. This is intentional — it ensures consistent form styling without CSS Module duplication.
5. **Toast container not yet implemented.** Individual `Toast` components exist but the container that manages stacking and positioning is deferred to Phase 2.

---

## File Count Summary

| Category | Files |
|---|---|
| Types | 6 |
| Constants | 6 |
| Utilities | 5 |
| Styles (.css) | 11 |
| Styles (.ts) | 1 |
| Components (.tsx) | 19 |
| Components (.module.css) | 16 |
| Barrel exports (index.ts) | 2 |
| **Total** | **66** |
