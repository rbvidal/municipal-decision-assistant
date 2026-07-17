# Technical Debt Register

**Date:** 2026-07-17

## Critical

| ID | Issue | Impact | Solution | Effort |
|---|---|---|---|---|
| TD-01 | Lucide React icons not initialized | All icons are invisible. Every page is affected. | Install lucide-react, call createIcons() in main.tsx | 30 min |
| TD-02 | Token stored in localStorage | XSS vulnerability — any script can read auth_token | Move to httpOnly cookie or use BFF pattern | 4h |

## High

| ID | Issue | Impact | Solution | Effort |
|---|---|---|---|---|
| TD-03 | Pages still import from mocks/ directly | Service layer abstraction is bypassed. Pages must change when mocks change. | Complete migration — all pages use hooks | 8h |
| TD-04 | No mutation hooks (useMutation) | All CRUD operations use placeholder callbacks. No optimistic updates. | Add useCreateCase, useUpdateCase, useDeleteDocument, etc. | 6h |
| TD-05 | No test infrastructure | Zero test coverage. No Jest, no React Testing Library, no Playwright. | Set up Vitest + React Testing Library. Write smoke tests for all pages. | 16h |
| TD-06 | No protected route guards | Any user can access any route. Auth context exists but unused by router. | Implement ProtectedRoute, AdminRoute components. Wire to useAuth(). | 3h |
| TD-07 | Hardcoded user data in pages | User name, email, department repeated in every page's TopNavigation props. | Read from useAuth() context instead of hardcoding | 2h |

## Medium

| ID | Issue | Impact | Solution | Effort |
|---|---|---|---|---|
| TD-08 | No debounced search | Every keystroke triggers filter recalculation. Performance issue with large datasets. | Add useDebouncedValue hook. Wire to SearchBar onChange. | 1h |
| TD-09 | No skip-to-content link | Keyboard users must tab through entire navigation. WCAG AA violation. | Add skip-to-content link as first focusable element in AppShell | 30 min |
| TD-10 | Fonts loaded from Google CDN | External dependency. Slows initial render. Privacy concern. | Bundle Inter + JetBrains Mono via @fontsource packages | 1h |
| TD-11 | No error logging/reporting | Errors silently fail. No Sentry/Datadog/console aggregation. | Add error boundary logging. Integrate error reporting service. | 4h |
| TD-12 | Generic type workarounds in interaction components | cloneElement uses type assertions. Popover/DropdownMenu/Tooltip have `as` casts. | Refactor to use generic component types properly | 3h |
| TD-13 | No responsive testing | Responsive breakpoints exist but never tested across device sizes. | Test all pages at 1920/1280/1024/640 widths | 4h |
| TD-14 | DocumentListWidget generic constraint | Uses `Record<string, any>` workaround for DataTable | Refactor DataTable to remove generic constraint | 2h |

## Low

| ID | Issue | Impact | Solution | Effort |
|---|---|---|---|---|
| TD-15 | Inline styles in ErrorBoundary | Uses `style={{}}` objects. Breaks CSS Modules convention. | Move to ErrorBoundary.module.css | 30 min |
| TD-16 | No dark mode | Dark mode tokens exist but feature flag is off. | Enable and test dark mode theme | 4h |
| TD-17 | No ContextMenu component | Right-click menus referenced in architecture but not implemented. | Implement ContextMenu in components/interaction/ | 3h |
| TD-18 | No NotificationCenter | NotificationDropdown exists in TopNavigation but NotificationCenter not implemented. | Implement NotificationCenter in components/interaction/ | 3h |
| TD-19 | No internationalization (i18n) | All text is hardcoded German. No translation key infrastructure. | Add react-intl or i18next. Extract all UI strings. | 24h |
| TD-20 | No PWA/manifest | No offline support, no install prompt, no service worker. | Add vite-plugin-pwa. Configure manifest and service worker. | 4h |
