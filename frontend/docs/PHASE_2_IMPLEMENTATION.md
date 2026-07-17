# Phase 2 Implementation — Application Shell & Navigation

**Date:** 16 July 2026
**Status:** Complete

---

## Implemented Files

### Providers (6 files)

| File | Purpose |
|---|---|
| `src/providers/ThemeProvider.tsx` | Theme context — light/dark toggle, persists to localStorage, sets `data-theme` attribute |
| `src/providers/ToastProvider.tsx` | Toast queue management — add/remove toasts, auto-dismiss, fixed container, aria-live region |
| `src/providers/ModalProvider.tsx` | Central dialog management — open/close modals, focus trapping placeholder, overlay click to dismiss |
| `src/providers/AppProviders.tsx` | Composes ThemeProvider → ToastProvider → ModalProvider in correct nesting order |
| `src/providers/ToastProvider.module.css` | Fixed bottom-right toast container |
| `src/providers/index.ts` | Barrel export for all providers + hooks |

### Config (5 files)

| File | Purpose |
|---|---|
| `src/config/app.ts` | Application metadata — name, version, locale, supported languages |
| `src/config/environment.ts` | Environment variables — API base URL, dev/prod flags, mock toggle |
| `src/config/featureFlags.ts` | Feature toggles — dark mode, notifications, decision support, supervisor, admin, wizard, corpus, users, benchmarks |
| `src/config/api.ts` | All API endpoint URL constants in one place — auth, workspaces, documents, search, decision, audit, ingestion, providers, corpus, dev, upload |
| `src/config/index.ts` | Barrel export |

### Layouts (12 files)

| Layout | Purpose | Shell Features |
|---|---|---|
| `AuthLayout` | Centered card for login/forgot/reset | Logo, title, content slot, footer with language + version |
| `AppShell` | Main application shell — used by all authenticated pages | TopNavigation slot, SubNavigation slot, Breadcrumb slot, main content area, collapsible right sidebar, wraps AppProviders |
| `CaseWorkspaceLayout` | Case workspace with persistent case header + tabs | Extends AppShell, adds CaseHeader slot, TabBar slot, 320px sidebar |
| `AdminLayout` | Administration pages with admin-only nav | Extends AppShell, passes through subNavigation for admin tabs |

### Navigation Components (16 files)

| Component | Purpose | Key Props |
|---|---|---|
| **TopNavigation** | Main application navigation bar — 56px, white | modules, activeModule, onNavigate, userName, userEmail, userInitials, userActions, notifications |
| **SubNavigation** | Second-level tab bar — 44px, gray-100 bg | tabs, activeTab, onTabChange (delegates to TabBar) |
| **Breadcrumb** | Page breadcrumb trail — 28px | items: {label, href?, icon?}[], onNavigate |
| **Sidebar** | Right sidebar — collapsible, mode-aware | children, mode (favorites/decision-support/admin/default), collapsed, onToggleCollapse, width, title |
| **TabBar** | Horizontal tab component — used by SubNavigation and CaseWorkspace tabs | tabs: {id, label, count?, icon?}[], activeTab, onTabChange |
| **NotificationBell** | Bell icon + unread badge + dropdown panel | notifications, onNotificationClick, onMarkAllRead, onViewAll |
| **UserMenu** | Avatar + name trigger + dropdown menu | userName, userEmail, userDepartment, userInitials, actions |
| **PageTitleBar** | Page title with optional subtitle + actions + back button | title, subtitle?, actions?, backAction? |

---

## Directory Structure

```
src/
├── providers/              NEW — 6 files
│   ├── ThemeProvider.tsx
│   ├── ToastProvider.tsx
│   ├── ToastProvider.module.css
│   ├── ModalProvider.tsx
│   ├── AppProviders.tsx
│   └── index.ts
├── config/                 NEW — 5 files
│   ├── app.ts
│   ├── environment.ts
│   ├── featureFlags.ts
│   ├── api.ts
│   └── index.ts
├── layouts/                NEW — 12 files
│   ├── AppShell/
│   │   ├── AppShell.tsx
│   │   ├── AppShell.module.css
│   │   └── index.ts
│   ├── AuthLayout/
│   │   ├── AuthLayout.tsx
│   │   ├── AuthLayout.module.css
│   │   └── index.ts
│   ├── CaseWorkspaceLayout/
│   │   ├── CaseWorkspaceLayout.tsx
│   │   ├── CaseWorkspaceLayout.module.css
│   │   └── index.ts
│   ├── AdminLayout/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminLayout.module.css
│   │   └── index.ts
│   └── index.ts
├── components/
│   └── navigation/         NEW — 16 files
│       ├── TopNavigation.tsx
│       ├── TopNavigation.module.css
│       ├── SubNavigation.tsx
│       ├── SubNavigation.module.css
│       ├── Breadcrumb.tsx
│       ├── Breadcrumb.module.css
│       ├── Sidebar.tsx
│       ├── Sidebar.module.css
│       ├── TabBar.tsx
│       ├── TabBar.module.css
│       ├── NotificationBell.tsx
│       ├── NotificationBell.module.css
│       ├── UserMenu.tsx
│       ├── UserMenu.module.css
│       ├── PageTitleBar.tsx
│       ├── PageTitleBar.module.css
│       └── index.ts
```

---

## Extension Points

Each component exposes props for future integration without modification:

| Component | Extension Point | Future Use |
|---|---|---|
| TopNavigation | `modules: NavModule[]` | Pass route config, add language selector |
| TopNavigation | `userActions: UserMenuAction[]` | Add profile, settings, admin links |
| NotificationBell | `notifications: Notification[]` | Wire to API/WebSocket/SSE |
| NotificationBell | `onNotificationClick` | Navigate to case/document on click |
| Breadcrumb | `onNavigate` | Integrate with router |
| Sidebar | `mode` | Switch between favorites, decision support, admin |
| Sidebar | `onToggleCollapse` | Persist collapse state to localStorage |
| TabBar | `tabs`, `onTabChange` | Wire to router for tab-based navigation |
| CaseWorkspaceLayout | `caseHeader` | Inject CaseHeader component |
| CaseWorkspaceLayout | `tabBar` | Inject contextual case tabs |
| AppShell | `sidebar`, `sidebarCollapsed` | Toggle sidebar from any page |

---

## Known Assumptions

1. **Routing is not implemented.** Navigation callbacks (`onNavigate`, `onTabChange`) are prop-driven. When React Router is added in Phase 7, these callbacks will use `useNavigate()`.
2. **Notification data is prop-driven.** No API integration. The parent page/app manages notification state.
3. **ModalProvider uses a placeholder dialog.** The Phase 3 Dialog component will replace the inline `dialog` div.
4. **ThemeProvider supports dark mode but it's disabled** via `FEATURES.enableDarkMode = false`. The infrastructure exists — flip the flag and add `[data-theme="dark"]` CSS to enable.
5. **All components consume Phase 1 design tokens.** No hardcoded colors or spacing anywhere.
6. **Lucide React icons are referenced but not yet installed.** The Icon component and TabBar/NotificationBell use text placeholders. Install `lucide-react` to enable proper icons.

---

## Future Phase 3 Dependencies

Phase 3 (Data Display & Overlays) will build on:
- `AppShell` — all pages render inside it
- `CaseWorkspaceLayout` — all case tabs render inside it
- `TopNavigation` — needs DataTable for notification list (optional)
- `ModalProvider` — needs Dialog component from Phase 3
- `Sidebar` — will host DecisionSupportPanel and FavoritesSidebar
- `TabBar` — used by case workspace tabs and global sub-navigation

Phase 3 should NOT modify any Phase 2 component. It should only consume them via props and children.

---

## File Count Summary

| Category | Files |
|---|---|
| Providers | 6 |
| Config | 5 |
| Layouts (4 × 3) | 12 |
| Navigation (8 × 2 + 1 barrel) | 17 |
| **Phase 2 Total** | **40** |
| Phase 1 Total | 76 |
| **Cumulative Total** | **116** |
