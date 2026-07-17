# Municipal Decision Assistant — Frontend

## Purpose

This module contains the React frontend for the Kommunale Entscheidungsplattform. It is a single-page application (SPA) that communicates exclusively with the Spring Boot REST API.

## Architecture

This frontend is generated incrementally from Google AI Studio (Stitch). The workflow is:

1. Each screen is generated independently by Google Stitch as a standalone project.
2. Those generated projects are NOT committed directly to this repository.
3. Instead, they are reviewed, extracted, and merged into this directory structure.
4. The `docs/MERGE_LOG.md` tracks every import and merge.

## Technology Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **State Management:** React Query (TanStack Query) for server state, React Context for UI state
- **Styling:** CSS Modules or Tailwind CSS (to be decided during first merge)
- **Icons:** Phosphor Icons
- **Fonts:** Inter (body), JetBrains Mono (code/IDs)

## Backend Communication

This frontend communicates only with the Spring Boot REST API. All endpoints are documented in `docs/API_MAPPING.md`.

- Authentication: JWT Bearer tokens
- Token storage: In-memory (never localStorage)
- Silent token refresh before expiry
- Base URL configured via environment variable

## Directory Structure

```
frontend/
├── public/                  Static assets (favicon, robots.txt)
├── src/
│   ├── assets/              Images, icons, fonts
│   ├── components/          Reusable UI components (see docs/COMPONENT_MAP.md)
│   ├── pages/               Page-level components (see docs/PAGE_MAP.md)
│   ├── layouts/             Layout components (AppShell, AuthLayout, etc.)
│   ├── hooks/               Custom React hooks
│   ├── services/            Business logic services
│   ├── api/                 API client and endpoint definitions
│   ├── types/               TypeScript type definitions
│   ├── utils/               Utility functions
│   ├── constants/           Application constants, routes, configuration
│   ├── mocks/               MSW handlers for development
│   ├── styles/              Global styles, design tokens, CSS variables
│   ├── router/              Route definitions
│   ├── App.tsx              Root application component
│   └── main.tsx             Application entry point
└── docs/                    Frontend documentation
```

## Development

```bash
npm install
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
```

## Constraints

- No backend logic exists in this module.
- All business rules are enforced by the backend API.
- The UX baseline is defined in `docs/UX_BASELINE.md` (project root).
- The visual baseline is stored in `stitch-export/` (project root).
- Generated Stitch exports are never committed directly — they are merged into this structure.

## UI Development Workflow

This frontend follows an **import-and-refactor architecture.** Google AI Studio is the UI generator, not the production codebase. The production frontend is developed by incrementally merging generated screens.

1. **Generate:** A screen is generated in Google Stitch from the UX specification.
2. **Export:** The generated Vite project is downloaded from Google AI Studio.
3. **Import:** The entire export is copied unchanged into `imports/<screen>/v1/`.
4. **Preserve:** The import is never edited. It is immutable design source material.
5. **Analyse:** Reusable components and patterns are identified in the import.
6. **Extract:** Components are adapted and placed into `src/components/`.
7. **Merge:** Page code is adapted and placed into `src/pages/`.
8. **Document:** Every merge is logged in `docs/MERGE_LOG.md`.

Previous exports remain archived in `imports/` for comparison. Future redesigns create `v2`, `v3`, etc. The imports directory is treated as immutable source material — a permanent record of what Stitch generated at each version.
