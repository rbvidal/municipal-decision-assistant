# Application Architecture

**Version:** 0.1.0
**Date:** 2026-07-17

## Architecture Overview

```
main.tsx
  └── AppRouter (BrowserRouter)
        ├── QueryClientProvider (TanStack Query)
        │     └── AuthProvider (AuthContext)
        │           └── ErrorBoundary
        │                 └── Suspense (lazy loading)
        │                       └── Routes
        │                             ├── / → Navigate /home
        │                             ├── /home → HomePage
        │                             ├── /work/:caseId → CaseWorkspacePage
        │                             ├── /knowledge → KnowledgePage
        │                             ├── /documents → DocumentsPage
        │                             ├── /supervisor → SupervisorPage
        │                             ├── /admin → AdministrationPage
        │                             ├── /admin/corpus → CorpusPage
        │                             ├── /admin/users → UsersPage
        │                             ├── /work/new → NewCasePage
        │                             └── * → NotFoundPage
```

## Dependency Diagram

```
Pages (pages/)
  ↓ import from
Hooks (hooks/)
  ↓ call
Services (services/)
  ↓ use
Mock Data (mocks/)    [current]
  ↓ will become
REST API (backend)    [future]
```

### Forbidden Dependencies

- Pages MUST NOT import from `mocks/` directly
- Pages MUST NOT call `fetch()` directly
- Pages MUST NOT import from `services/` directly
- Hooks MUST NOT import from `mocks/` directly (they use services)
- Services MUST be the only layer that imports from `mocks/` (mock implementations only)

## Routing

| Route | Page | Layout |
|---|---|---|
| `/` | Redirect → `/home` | — |
| `/home` | HomePage (lazy) | AppShell |
| `/work/:caseId` | CaseWorkspacePage (lazy) | CaseWorkspaceLayout |
| `/knowledge` | KnowledgePage (lazy) | AppShell |
| `/documents` | DocumentsPage (lazy) | AppShell |
| `/supervisor` | SupervisorPage (lazy) | AppShell |
| `/admin` | AdministrationPage (lazy) | AppShell |
| `/admin/corpus` | CorpusPage (lazy) | AppShell |
| `/admin/users` | UsersPage (lazy) | AppShell |
| `/work/new` | NewCasePage (lazy) | AppShell |
| `*` | NotFoundPage (lazy) | AppShell |

All pages use React.lazy() with Suspense fallback.

## Authentication

- **AuthProvider** wraps the application
- **useAuth()** hook provides `{ user, isAuthenticated, isLoading, login, logout }`
- Mock user: Sabine Müller (Sachbearbeiter, Bauaufsicht)
- Token stored in localStorage (`auth_token`)
- No JWT/OAuth — mock only
- ApiClient reads token from localStorage for Authorization header

## API Client

- **ApiClient** class with `get`, `post`, `put`, `delete` methods
- Base URL from `VITE_API_BASE_URL` env var (default: `http://localhost:8080`)
- Bearer token authentication
- Error handling via `ApiError` class
- Singleton instance exported as `apiClient`

## Service Layer

### Service Interfaces + Mock Implementations

| Service | Interface | Mock |
|---|---|---|
| CaseService | `getCase`, `getWorkflowSteps`, `getChecklistItems`, `getDocuments`, `getTimeline`, `getNotes` | Static mock data |
| KnowledgeService | `search`, `getAll`, `getById` | In-memory filtering |
| DocumentService | `getAll`, `getById`, `search` | Static mock data |
| UserService | `getAll`, `toggleStatus` | Static mock data |
| SupervisorService | `getAll`, `getById` | Static mock data |
| CorpusService | `getPackages`, `getMetrics`, `getJobs`, `getAuditLogs` | Static mock data |
| AdminService | `getSystemHealth`, `getJobs`, `getAuditLogs`, `getDepartments` | Static mock data |

### Future REST Migration

To switch from mock to REST:
1. Create `RestCaseService implements CaseService`
2. Change service export from `mockCaseService` to `restCaseService`
3. No page or hook changes needed

## Hooks Layer (TanStack Query)

| Hook | Query Key | Service Method |
|---|---|---|
| `useCase(id)` | `['case', id]` | `caseService.getCase` |
| `useCaseWorkflowSteps(caseId)` | `['case', caseId, 'workflow-steps']` | `caseService.getWorkflowSteps` |
| `useCaseChecklist(caseId)` | `['case', caseId, 'checklist']` | `caseService.getChecklistItems` |
| `useCaseDocuments(caseId)` | `['case', caseId, 'documents']` | `caseService.getDocuments` |
| `useCaseTimeline(caseId)` | `['case', caseId, 'timeline']` | `caseService.getTimeline` |
| `useCaseNotes(caseId)` | `['case', caseId, 'notes']` | `caseService.getNotes` |
| `useKnowledgeSearch(query, filters)` | `['knowledge', 'search', query, filters]` | `knowledgeService.search` |
| `useKnowledgeDocument(id)` | `['knowledge', 'document', id]` | `knowledgeService.getById` |
| `useDocuments()` | `['documents']` | `documentService.getAll` |
| `useUsers()` | `['users']` | `userService.getAll` |
| `useSupervisorCases()` | `['supervisor', 'cases']` | `supervisorService.getAll` |
| `useSupervisorCase(id)` | `['supervisor', 'case', id]` | `supervisorService.getById` |
| `useCorpusPackages()` | `['corpus', 'packages']` | `corpusService.getPackages` |
| `useCorpusMetrics()` | `['corpus', 'metrics']` | `corpusService.getMetrics` |
| `useCorpusJobs()` | `['corpus', 'jobs']` | `corpusService.getJobs` |
| `useCorpusAuditLogs()` | `['corpus', 'audit']` | `corpusService.getAuditLogs` |
| `useAdminHealth()` | `['admin', 'health']` | `adminService.getSystemHealth` |
| `useAdminJobs()` | `['admin', 'jobs']` | `adminService.getJobs` |
| `useAdminAuditLogs()` | `['admin', 'audit']` | `adminService.getAuditLogs` |
| `useAdminDepartments()` | `['admin', 'departments']` | `adminService.getDepartments` |
| `useHomeDashboard()` | `['home', 'dashboard']` | (inline mock) |

### Query Client Configuration

- `retry: 1` — single retry on failure
- `refetchOnWindowFocus: false` — no background refetch
- Stale times: 15s (metrics), 30s (standard), 60s (static data)

## Environment Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

## Application Bootstrap Sequence

1. `main.tsx` renders `<AppRouter />`
2. `AppRouter` creates `BrowserRouter` + `QueryClientProvider` + `AuthProvider` + `ErrorBoundary` + `Suspense`
3. Routes lazy-load page components
4. Pages render inside `AppShell` or `CaseWorkspaceLayout`
5. Pages call hooks for data
6. Hooks call services through TanStack Query
7. Services return mock data (or REST data in future)

## Deployment

- **Development:** `npm run dev` (Vite dev server, port 5173)
- **Production build:** `npm run build` (TypeScript check + Vite bundle)
- **Preview:** `npm run preview` (Vite preview server)
- **Spring Boot integration:** Production build output served from `src/main/resources/static/`
