# Engineering Execution Backlog — Version 1.0

**Status:** Architecture FROZEN (v1.0-architecture-complete)
**Date:** 2026-07-17
**Audience:** Engineering team executing Version 1.0 delivery

---

## Overview

This backlog implements the frozen architecture. Every task derives from existing interfaces, DTOs, and components already in the codebase. No task invents new architecture.

**Total tasks:** 94
**Total estimated effort:** 680–880 engineering hours
**Module count:** 10 backend + 1 frontend
**Existing source files:** 352 Java + 339 frontend files

---

## Epic 1 — Platform Foundation

### T-001: Local Development Environment Bootstrapping

**Description:** Ensure every engineer can run `docker-compose up && mvn install && npm run dev` and have a working local environment. Create a `DEVELOPER_SETUP.md` with exact commands, required versions, and troubleshooting.

**Affected modules:** All
**Dependencies:** None
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Fresh clone → `docker-compose up` → all services healthy
- `mvn clean install` passes with all tests
- `npm install && npm run dev` serves frontend on localhost:5173
- Backend API reachable at localhost:8080
- Document commands in DEVELOPER_SETUP.md
**Definition of Done:**
- ✓ All infra services start via docker-compose
- ✓ Maven build compiles all 9 modules
- ✓ Frontend dev server starts with HMR
- ✓ README updated with setup instructions
**Required tests:** Manual verification (no automated tests — environment validation)
**Expected deliverables:** `DEVELOPER_SETUP.md`, updated `README.md`, verified docker-compose.yml

---

### T-002: Maven Dependency Audit & Version Alignment

**Description:** Audit all Maven dependencies across 9 POMs. Align versions in parent POM `<dependencyManagement>`. Remove unused dependencies. Update Spring Boot 3.3.5 → 3.3.x latest patch. Verify no CVEs in dependency tree.

**Affected modules:** All (parent POM)
**Dependencies:** T-001
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- `mvn dependency:analyze` reports no unused declared dependencies
- All module POMs inherit versions from parent
- `mvn versions:display-dependency-updates` reviewed and addressed
- OWASP dependency-check passes (0 critical/high CVEs)
**Definition of Done:**
- ✓ Parent POM `<dependencyManagement>` complete
- ✓ Module POMs cleaned
- ✓ Security scan passes
**Required tests:** `mvn verify` passes
**Expected deliverables:** Updated parent POM, updated module POMs, dependency audit report

---

### T-003: Frontend Dependency Audit & Version Lock

**Description:** Lock all frontend dependencies to exact versions. Remove unused packages. Verify React 19, Vite, TanStack Query, React Router v7 compatibility. Add `npm audit` to CI.

**Affected modules:** frontend/
**Dependencies:** T-001
**Estimated effort:** 4h
**Risk:** Low
**Acceptance criteria:**
- `package.json` uses exact versions (no `^` or `~`)
- `npm audit` returns 0 critical/high
- `npm run build` produces production bundle without warnings
**Definition of Done:**
- ✓ package.json pinned
- ✓ npm audit clean
- ✓ Production build succeeds
**Required tests:** `npm run build` passes
**Expected deliverables:** Updated `package.json`, `package-lock.json`

---

### T-004: Cleanup Empty Directory Stubs

**Description:** Remove the 6 empty directory stubs identified in the project status review. Verify no imports reference removed paths. Each stub is a directory with only `.gitkeep` — delete them and verify compilation.

**Affected modules:** frontend/
**Dependencies:** T-001
**Estimated effort:** 2h
**Risk:** Low
**Acceptance criteria:**
- 6 empty stubs removed
- `npm run build` succeeds
- `tsc --noEmit` passes
**Definition of Done:**
- ✓ Stubs deleted
- ✓ Build passes
**Required tests:** `npm run build`, `tsc --noEmit`
**Expected deliverables:** Cleaned directory tree

---

### T-005: Git Pre-Commit Hooks (lint-staged + prettier)

**Description:** Configure husky + lint-staged to run Prettier and ESLint on staged files before commit. Add `.prettierrc` and `.eslintrc.cjs` with project conventions. Fail commit on lint errors.

**Affected modules:** frontend/
**Dependencies:** T-003
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- `git commit` triggers lint-staged
- Prettier formats staged files automatically
- ESLint blocks commit on errors
- Configuration committed to repo
**Definition of Done:**
- ✓ husky installed and configured
- ✓ lint-staged runs Prettier + ESLint
- ✓ Documentation in README
**Required tests:** Manual verification of pre-commit hook
**Expected deliverables:** `.husky/pre-commit`, `.prettierrc`, `.eslintrc.cjs`, updated `package.json`

---

### T-006: Backend Static Analysis (SpotBugs + Checkstyle)

**Description:** Integrate SpotBugs and Checkstyle into Maven build. Configure rule sets matching project conventions. Fix existing violations or suppress with documented rationale. Add to CI pipeline.

**Affected modules:** All backend modules
**Dependencies:** T-002
**Estimated effort:** 8h
**Risk:** Medium — may surface hidden bugs
**Acceptance criteria:**
- `mvn verify` runs SpotBugs and Checkstyle
- 0 high-priority SpotBugs warnings
- Checkstyle passes with configured rules
**Definition of Done:**
- ✓ SpotBugs plugin in parent POM
- ✓ Checkstyle plugin in parent POM
- ✓ Violations fixed or suppressed with comments
**Required tests:** `mvn verify` passes including static analysis
**Expected deliverables:** Updated parent POM, `checkstyle.xml`, SpotBugs exclude file

---

## Epic 2 — Authentication

### T-007: Backend Authentication Audit & Edge Case Hardening

**Description:** Review JWT auth flow end-to-end. Test edge cases: expired tokens, malformed tokens, concurrent refresh, token revocation on logout, refresh token rotation. Fix any issues found.

**Affected modules:** platform-auth, platform-api
**Dependencies:** T-002
**Estimated effort:** 8h
**Risk:** Medium — security-critical path
**Acceptance criteria:**
- Expired access token returns 401 with clear error
- Malformed token returns 401 (not 500)
- Refresh token rotation: old refresh token invalidated after rotation
- Logout invalidates refresh token
- Concurrent refresh requests handled safely
**Definition of Done:**
- ✓ Auth edge cases tested and passing
- ✓ Error responses follow standard format
- ✓ Token rotation verified
**Required tests:**
- Unit tests: `JwtTokenService` edge cases
- Integration tests: Auth flow with Testcontainers
**Expected deliverables:** Updated `AuthService.java`, `JwtTokenService.java`, new test files

---

### T-008: Implement Login Page (Real API Integration)

**Description:** The frontend has `AuthContext.tsx` but no Login page in the router. Build the `/login` route with email/password form, POST to `/api/auth/login`, store JWT in memory, redirect to `/home`. Adapt from Stitch export in `frontend/imports/`.

**Affected modules:** frontend/
**Dependencies:** T-003, T-007
**Estimated effort:** 12h
**Risk:** Medium — first real API integration
**Acceptance criteria:**
- `/login` route renders login form
- Form validates email format and password presence
- POST to `/api/auth/login` with credentials
- On success: stores access + refresh tokens in memory, redirects to `/home`
- On failure: displays error message from API
- Loading state during request
- "Zur Registrierung" link to `/register`
**Definition of Done:**
- ✓ LoginPage component implemented
- ✓ API client configured with base URL from env var
- ✓ AuthContext wired to real tokens
- ✓ Error handling covers network failure and 401
**Required tests:**
- Unit: LoginPage renders, form validation, error display
- Integration: Mock API, simulate success/failure responses
**Expected deliverables:** `src/pages/login/LoginPage.tsx`, `src/api/auth.ts`, updated `AppRouter.tsx`

---

### T-009: Implement Register Page

**Description:** Build the `/register` route with email, display name, password fields. POST to `/api/auth/register`. On success: auto-login or redirect to `/login`.

**Affected modules:** frontend/
**Dependencies:** T-003, T-007
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- `/register` route renders registration form
- Password strength indicator
- POST to `/api/auth/register`
- On success: redirect to `/login` with success message
- On failure: display API error
**Definition of Done:**
- ✓ RegisterPage component implemented
- ✓ PasswordRules component shows requirements
- ✓ API error handling complete
**Required tests:**
- Unit: RegisterPage form validation, password rules display
- Integration: Mock API responses
**Expected deliverables:** `src/pages/register/RegisterPage.tsx`, updated `AppRouter.tsx`

---

### T-010: Implement Protected Route Guards

**Description:** Create `ProtectedRoute` component that checks auth state. Unauthenticated users redirect to `/login`. Handle token refresh transparently. Handle 401 responses globally with automatic redirect.

**Affected modules:** frontend/
**Dependencies:** T-008
**Estimated effort:** 10h
**Risk:** Medium — affects all routes
**Acceptance criteria:**
- Routes wrapped with `ProtectedRoute` redirect to `/login` when unauthenticated
- Expired access token triggers silent refresh via refresh token
- 401 from any API call redirects to `/login`
- Token stored in memory only (never localStorage)
- Auth state persists across page refresh (via refresh token)
**Definition of Done:**
- ✓ ProtectedRoute component
- ✓ Axios/fetch interceptor for 401 handling
- ✓ All routes except /login and /register are protected
- ✓ Token refresh is transparent to user
**Required tests:**
- Unit: ProtectedRoute redirect logic
- Integration: Token refresh flow with mock API
**Expected deliverables:** `src/auth/ProtectedRoute.tsx`, `src/api/interceptors.ts`, updated `AppRouter.tsx`

---

### T-011: Implement Logout & Session Management

**Description:** Add logout button to navigation. POST to `/api/auth/logout` with refresh token. Clear in-memory tokens. Redirect to `/login`. Handle session expiry UX.

**Affected modules:** frontend/
**Dependencies:** T-008, T-010
**Estimated effort:** 4h
**Risk:** Low
**Acceptance criteria:**
- Logout button visible when authenticated
- Click triggers POST to `/api/auth/logout`
- Tokens cleared from memory
- Redirect to `/login`
**Definition of Done:**
- ✓ Logout button in UserMenu component
- ✓ API call to logout endpoint
- ✓ Token cleanup
**Required tests:**
- Unit: Logout triggers API call and cleanup
**Expected deliverables:** Updated `UserMenu.tsx`, `AuthContext.tsx`

---

## Epic 3 — Frontend-Backend Integration

### T-012: API Client Layer — Foundation

**Description:** Build the production API client layer. Replace mock `serviceFactory.ts` pattern with real fetch/axios calls. Configure base URL from `VITE_API_BASE_URL` env var. Add request/response interceptors for auth headers and error normalization.

**Affected modules:** frontend/
**Dependencies:** T-003, T-007
**Estimated effort:** 8h
**Risk:** Medium — foundation for all API communication
**Acceptance criteria:**
- API client configured with env-based base URL
- Auth header automatically attached from in-memory token
- 401 responses trigger auth redirect
- All responses normalized to typed interfaces
- Request timeout handling
**Definition of Done:**
- ✓ `src/api/client.ts` with interceptors
- ✓ Type-safe request/response types for all endpoints
- ✓ Error normalization to `ErrorResponse` type
**Required tests:**
- Unit: Interceptor logic
- Unit: Error normalization
**Expected deliverables:** `src/api/client.ts`, `src/api/types.ts`, `src/api/errors.ts`

---

### T-013: Decision Service — Real API Wiring

**Description:** Replace `src/services/DecisionService.ts` mock implementation with real API calls. Wire the `DecisionSupportTab` to POST questions to `/api/ai/decision` and display the structured `DecisionPackage` response. Handle SSE streaming for long-running queries.

**Affected modules:** frontend/, platform-api
**Dependencies:** T-012
**Estimated effort:** 16h
**Risk:** High — core user-facing feature, SSE complexity
**Acceptance criteria:**
- Question submitted via DecisionWorkspace → POST to `/api/ai/decision`
- SSE stream parsed for progressive results
- DecisionPackage fields displayed: `decision`, `reason`, `source`, `confidence`, `strategy`
- RULE_ENGINE decisions show structured values (salary, travel, procurement)
- HYBRID_RETRIEVAL decisions show evidence items and citations
- Error state for timeout or API failure
- Loading state during inference (5-60s)
**Definition of Done:**
- ✓ `DecisionService.ts` calls real API
- ✓ SSE streaming parsed client-side
- ✓ DecisionSupportTab renders structured response
- ✓ CitationCard links to source documents
- ✓ ConfidenceBar reflects API confidence value
- ✓ Error and loading states handled
**Required tests:**
- Unit: DecisionService parsing
- Unit: DecisionSupportTab state transitions
- Integration: Mock SSE stream to verify progressive rendering
**Expected deliverables:** Updated `DecisionService.ts`, `DecisionSupportTab.tsx`, `DecisionWorkspace.tsx`

---

### T-014: Document Service — Real API Wiring

**Description:** Replace mock document service with real API calls. Wire DocumentsPage listing, document upload, document viewer. Implement file upload with progress. Handle document status lifecycle.

**Affected modules:** frontend/, platform-api, platform-document
**Dependencies:** T-012
**Estimated effort:** 16h
**Risk:** Medium — file upload complexity
**Acceptance criteria:**
- DocumentsPage fetches from `/api/documents` with pagination
- Filter dropdowns call real API with query params
- Document upload POSTs multipart to `/api/documents/upload`
- Upload progress bar shown for large files
- Document viewer fetches content from `/api/documents/{id}`
- Ingestion status reflected in document table
**Definition of Done:**
- ✓ `RestDocumentService.ts` calls real API
- ✓ DocumentsPage with pagination, filtering, sorting
- ✓ Upload form with progress indicator
- ✓ Document viewer with metadata + content
- ✓ Error states for failed uploads
**Required tests:**
- Unit: RestDocumentService methods
- Unit: DocumentsPage state management
- Integration: Mock file upload flow
**Expected deliverables:** Updated `RestDocumentService.ts`, `DocumentsPage.tsx`, new `DocumentUploadPage.tsx`, `DocumentViewerPage.tsx`

---

### T-015: Search Service — Real API Wiring

**Description:** Wire SearchBar, ResultCard, FilterPanel to real search API. Implement hybrid search query construction, result display with highlighting, relevance scores.

**Affected modules:** frontend/, platform-search
**Dependencies:** T-012
**Estimated effort:** 12h
**Risk:** Medium
**Acceptance criteria:**
- SearchBar submits query to `/api/search`
- Results rendered as ResultCard list with scores
- FilterPanel filters by document type, domain, date
- SearchSummary shows hit count and query time
- Clicking result opens document viewer
- Empty state when no results
**Definition of Done:**
- ✓ Search service calls real API
- ✓ Result cards with highlighting
- ✓ Filter panel with API-driven options
- ✓ Pagination for large result sets
**Required tests:**
- Unit: Search service query construction
- Unit: ResultCard rendering
- Integration: Mock search API responses
**Expected deliverables:** Updated `SearchService.ts`, `SearchBar.tsx`, `ResultCard.tsx`, `FilterPanel.tsx`

---

### T-016: Workspace Service — Real API Wiring

**Description:** Wire workspace CRUD to real API. Workspace list, create workspace wizard, workspace detail with timeline. This replaces the current minimal Thymeleaf templates.

**Affected modules:** frontend/, platform-workspace
**Dependencies:** T-012
**Estimated effort:** 14h
**Risk:** Medium
**Acceptance criteria:**
- Workspace list fetches from `/api/workspaces`
- Create workspace wizard POSTs to `/api/workspaces`
- Workspace detail shows timeline from API
- Document attachment to workspace
- Error handling for duplicate names
**Definition of Done:**
- ✓ `RestCaseService.ts` (or WorkspaceService) calls real API
- ✓ Workspace list page with filtering
- ✓ Create workspace wizard with validation
- ✓ Workspace detail with timeline events
**Required tests:**
- Unit: Workspace service methods
- Integration: Workspace creation flow
**Expected deliverables:** Updated workspace service, workspace pages

---

### T-017: Corpus Health Dashboard — Real API Wiring

**Description:** Wire the CorpusPage and admin health dashboard to real API. Display live metrics from PostgreSQL + Qdrant. Health status indicators, warning cards, document health table.

**Affected modules:** frontend/, platform-api
**Dependencies:** T-012
**Estimated effort:** 12h
**Risk:** Low
**Acceptance criteria:**
- CorpusPage fetches from `/api/admin/corpus-health`
- Summary stat cards show live values
- Warnings displayed per document
- Health table with 15 columns populated from API
- Refresh button updates data
**Definition of Done:**
- ✓ `RestCorpusService.ts` calls real API
- ✓ CorpusPage renders live metrics
- ✓ StatCard components show correct values
- ✓ Warning alerts for unhealthy documents
**Required tests:**
- Unit: Corpus health data parsing
- Unit: Warning threshold logic
**Expected deliverables:** Updated `RestCorpusService.ts`, `CorpusPage.tsx`

---

### T-018: Knowledge Base — Real API Wiring

**Description:** Wire KnowledgePage to real API. Display regulations grouped by domain. Filter by document type and legal domain. Link to full document viewer.

**Affected modules:** frontend/, platform-api
**Dependencies:** T-012
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- KnowledgePage fetches regulation documents from API
- Grouped by legal domain (building, procurement, HR)
- Filter by document type, status, authority
- Click navigates to document viewer
**Definition of Done:**
- ✓ `RestKnowledgeService.ts` calls real API
- ✓ KnowledgePage with domain grouping
- ✓ Filtering and search within knowledge
**Required tests:**
- Unit: Knowledge service methods
- Unit: Grouping logic
**Expected deliverables:** Updated `RestKnowledgeService.ts`, `KnowledgePage.tsx`

---

### T-019: Audit Log — Real API Wiring

**Description:** Wire audit log display to real API. Paginated audit event table with filtering by event type, user, date range. Detail view for individual audit events.

**Affected modules:** frontend/, platform-audit
**Dependencies:** T-012
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Audit page fetches from `/api/audit`
- Paginated table with event type, user, timestamp, details
- Filter by event type, user, date range
- Detail view for individual events
**Definition of Done:**
- ✓ Audit service calls real API
- ✓ Paginated audit table
- ✓ Filter controls
**Required tests:**
- Unit: Audit event parsing
- Unit: Pagination logic
**Expected deliverables:** Updated audit service, audit page component

---

### T-020: Administration Pages — Real API Wiring

**Description:** Wire AdministrationPage, UsersPage to real admin API endpoints. User management table, system configuration display, ingestion job management.

**Affected modules:** frontend/, platform-api
**Dependencies:** T-012
**Estimated effort:** 10h
**Risk:** Low
**Acceptance criteria:**
- AdministrationPage shows admin tool grid with live status
- UsersPage lists users from `/api/admin/users`
- Ingestion jobs table from `/api/admin/jobs`
- Admin-only access enforced
**Definition of Done:**
- ✓ `RestAdminService.ts` calls real API
- ✓ AdministrationPage with tool links
- ✓ UsersPage with user management
**Required tests:**
- Unit: Admin service methods
- Unit: Access control logic
**Expected deliverables:** Updated `RestAdminService.ts`, `AdministrationPage.tsx`, `UsersPage.tsx`

---

## Epic 4 — Decision Engine Hardening

### T-021: RuleEngine — Procurement Category Normalization Completion

**Description:** The RuleEngine already maps IT categories to Lieferung/Dienstleistung. Complete the normalization for all edge cases: Dienstleistungen, freiberufliche Leistungen, Bauleistungen including subtypes. Add comprehensive test coverage for all category mappings.

**Affected modules:** platform-ai
**Dependencies:** T-002
**Estimated effort:** 8h
**Risk:** Medium — incorrect normalization produces wrong legal thresholds
**Acceptance criteria:**
- All VgV/DVO categories map to correct parent category
- IT-Dienstleistung → Lieferung/Dienstleistung (already done, verify)
- Bauleistung subtypes all resolve correctly
- Unknown categories default to Lieferung/Dienstleistung with warning log
- 100% branch coverage on `ThresholdTable.normalizeCategory()`
**Definition of Done:**
- ✓ Category normalization handles all known types
- ✓ Tests cover every mapping + unknown fallback
- ✓ Logging for unmapped categories
**Required tests:**
- Unit: Every category input → expected output
- Unit: Unknown category → safe default
**Expected deliverables:** Updated `ThresholdTable.java`, `ThresholdTableTest.java`

---

### T-022: DecisionRouter — Edge Case Coverage

**Description:** The DecisionRouter routes questions to RULE_ENGINE or HYBRID_RETRIEVAL based on keyword detection. Add tests for boundary cases: empty questions, very long questions, questions matching multiple categories, German special characters (ß, ü, ö, ä), mixed language input.

**Affected modules:** platform-ai
**Dependencies:** T-021
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Empty question → graceful error, not NPE
- Question > 5000 chars → truncated with warning
- "EG 10 Gehalt und Beschaffung 5000€" → routes to salary (first match) or returns ambiguity signal
- German umlauts handled correctly in regex patterns
- Null question → IllegalArgumentException
**Definition of Done:**
- ✓ All edge cases have defined behavior
- ✓ Tests cover each edge case
- ✓ Logging for ambiguous/unusual inputs
**Required tests:**
- Unit: Each edge case with expected routing result
**Expected deliverables:** Updated `DecisionRouter.java`, `DecisionRouterTest.java`

---

### T-023: NumericExtractor — Robustness Improvements

**Description:** The NumericExtractor parses Euro amounts and numeric values from free-text German input. Improve extraction for: comma decimals (1.234,56), Swiss/German number formats, amounts without currency symbol, ranges ("5.000-10.000 €").

**Affected modules:** platform-ai
**Dependencies:** T-002
**Estimated effort:** 6h
**Risk:** Medium — extraction failures break procurement lookups
**Acceptance criteria:**
- `1.234,56 €` → 1234.56
- `5.000 - 10.000 Euro` → [5000.0, 10000.0]
- `5000` (no currency) → extracted when context has "Euro" nearby
- `null` input → empty result, not NPE
**Definition of Done:**
- ✓ All German number formats supported
- ✓ Tests for each format variant
**Required tests:**
- Unit: Each number format → expected double
**Expected deliverables:** Updated `NumericExtractor.java`, `NumericExtractorTest.java`

---

### T-024: EvidencePackage — Validation Completeness

**Description:** Ensure the EvidencePackage builder validates all required fields before construction. Add validation for empty items list, null documentsUsed, negative counts.

**Affected modules:** platform-ai
**Dependencies:** T-002
**Estimated effort:** 4h
**Risk:** Low
**Acceptance criteria:**
- EvidencePackage with null items → defensive copy to empty list
- Negative `documentsUsed` → clamped to 0
- `hasInsufficientEvidence` flag consistent with `coverageStatus`
- All record components validated in compact constructor
**Definition of Done:**
- ✓ Defensive validation in compact constructor
- ✓ Consistency between flags
**Required tests:**
- Unit: Constructor validation for each field
**Expected deliverables:** Updated `EvidencePackage.java`, `EvidencePackageBuilderTest.java`

---

### T-025: DecisionPackage DTO — JSON Serialization Round-Trip Tests

**Description:** Write comprehensive JSON round-trip tests for all 10 DecisionPackage DTOs. Verify Jackson serialization/deserialization preserves all fields. Test with missing optional fields, null collections, enum values.

**Affected modules:** platform-ai, platform-api
**Dependencies:** T-024
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- All DTOs serialize → deserialize without data loss
- Missing optional fields handled correctly
- Enum values case-insensitive on deserialization
- Unknown JSON fields ignored (not error)
**Definition of Done:**
- ✓ Round-trip tests for all 10 DTOs
- ✓ Edge case coverage for null/missing fields
**Required tests:**
- Unit: Each DTO → JSON string → deserialize → equals original
**Expected deliverables:** New test class `DecisionPackageSerializationTest.java`

---

### T-026: KnowledgeRegistry — Runtime Reload Capability

**Description:** The KnowledgeRegistry loads structured tables (TV-L salary, BRKG travel, AV §55 thresholds) at startup. Add a reload endpoint for runtime updates without restart — useful when regulations change.

**Affected modules:** platform-ai
**Dependencies:** T-021
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- `POST /api/admin/knowledge/reload` triggers registry reload
- Reload is atomic (no partial updates visible to inflight requests)
- Reload failure leaves existing data intact
- Admin-only access
**Definition of Done:**
- ✓ Reload endpoint
- ✓ Atomic swap of registry data
- ✓ Failure rollback
**Required tests:**
- Unit: Reload with valid data
- Unit: Reload with invalid data → old data preserved
- Integration: Concurrent requests during reload
**Expected deliverables:** Updated `KnowledgeRegistry.java`, new admin endpoint

---

## Epic 5 — Document Pipeline

### T-027: Document Upload — Chunked Upload for Large Files

**Description:** The current upload uses standard multipart. Add chunked upload support for files > 100MB. Frontend splits file, backend reassembles. This prevents timeout and memory issues with large PDFs.

**Affected modules:** platform-api, platform-document, frontend/
**Dependencies:** T-014
**Estimated effort:** 14h
**Risk:** Medium — large file handling has many edge cases
**Acceptance criteria:**
- Files > 100MB split into 10MB chunks client-side
- Chunks uploaded sequentially with progress
- Backend reassembles and verifies checksum
- Failed chunk retried (max 3 attempts)
- Reassembly verified with file hash
**Definition of Done:**
- ✓ Chunked upload client component
- ✓ Backend chunk reassembly endpoint
- ✓ Checksum verification
- ✓ Resume support for interrupted uploads
**Required tests:**
- Unit: Chunk splitting logic
- Unit: Backend reassembly
- Integration: End-to-end chunked upload of 200MB test file
**Expected deliverables:** Updated upload page, new `/api/documents/upload/chunk` endpoint, `ChunkedUploadService.java`

---

### T-028: Document Ingestion Pipeline — Observability

**Description:** Add detailed logging and metrics to the document ingestion pipeline. Track: extraction time, chunk count, embedding time, indexing time per document. Expose as Micrometer metrics.

**Affected modules:** platform-document, platform-search, platform-observability
**Dependencies:** T-002
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Each ingestion phase emits Micrometer timer metric
- Document-level metrics: extraction_ms, chunk_count, embedding_ms, index_ms
- Pipeline-level metrics: documents_ingested_total, ingestion_errors_total
- Metrics exposed via `/actuator/metrics`
**Definition of Done:**
- ✓ Micrometer timers for each phase
- ✓ Counter metrics for success/failure
- ✓ Logging at DEBUG for phase transitions
**Required tests:**
- Unit: Metrics emission (Micrometer test registry)
**Expected deliverables:** Updated `DocumentService.java`, `IndexingOrchestrationService.java`

---

### T-029: Text Extraction — Fallback Chain Hardening

**Description:** The DefaultTextExtractionService should try multiple extraction strategies. PDF → Apache PDFBox → Tika fallback. DOCX → Apache POI → Tika fallback. Add OCR fallback for image-based PDFs (optional, requires Tesseract).

**Affected modules:** platform-document
**Dependencies:** T-002
**Estimated effort:** 12h
**Risk:** Medium — extraction failures block the pipeline
**Acceptance criteria:**
- PDF extraction tries PDFBox → Tika → logs warning
- DOCX extraction tries POI → Tika → logs warning
- Extraction failure returns partial text with error metadata
- Extraction metrics tracked
**Definition of Done:**
- ✓ Fallback chain for each file type
- ✓ Partial extraction when full fails
- ✓ Error metadata in document status
**Required tests:**
- Unit: Each fallback path triggered
- Unit: Corrupt file → partial result
**Expected deliverables:** Updated `DefaultTextExtractionService.java`

---

### T-030: Chunking Strategy — Configurable Parameters

**Description:** Make chunking parameters configurable: chunk size, overlap, split strategy (sentence boundary vs. fixed size). Different document types may need different chunking strategies.

**Affected modules:** platform-search
**Dependencies:** T-028
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Configurable `platform.search.chunking.max-chunk-size` (default 500)
- Configurable `platform.search.chunking.overlap` (default 50)
- Configurable `platform.search.chunking.strategy` (SENTENCE or FIXED)
- Changes take effect on next ingestion (not retroactive)
**Definition of Done:**
- ✓ Configuration properties
- ✓ Strategy pattern for chunking
- ✓ Defaults documented
**Required tests:**
- Unit: Each strategy with sample text
- Unit: Configuration binding
**Expected deliverables:** Updated `application.yml`, chunking strategy classes

---

## Epic 6 — Search & Retrieval

### T-031: Hybrid Retrieval — Keyword + Vector Fusion

**Description:** The DefaultHybridRetrievalService exists. Verify and harden: keyword search via PostgreSQL full-text, vector search via Qdrant, fusion with configurable weights. Add result deduplication across sources.

**Affected modules:** platform-search
**Dependencies:** T-002
**Estimated effort:** 10h
**Risk:** High — core retrieval quality
**Acceptance criteria:**
- Keyword search returns results ranked by ts_rank
- Vector search returns results ranked by cosine similarity
- Fusion combines results with configurable weight (default 0.5 each)
- Duplicate documents deduplicated (keep highest score)
- Empty query → graceful error
**Definition of Done:**
- ✓ Fusion algorithm tested with known weights
- ✓ Deduplication logic
- ✓ Performance under 500ms for 10K documents
**Required tests:**
- Unit: Fusion with mocked keyword + vector results
- Unit: Deduplication with overlapping results
- Integration: Qdrant Testcontainers, real PostgreSQL
**Expected deliverables:** Updated `DefaultHybridRetrievalService.java`

---

### T-032: Reranking Service — Cross-Encoder Integration

**Description:** The DefaultRerankingService exists as a stub. Implement cross-encoder reranking using a lightweight model or API. Re-rank top-20 results to top-10. Measure latency impact.

**Affected modules:** platform-search
**Dependencies:** T-031
**Estimated effort:** 14h
**Risk:** High — latency vs. quality tradeoff
**Acceptance criteria:**
- Reranker re-orders top-N results based on query-document relevance
- Configurable `platform.search.reranking.top-n` and `platform.search.reranking.final-n`
- Latency < 2s for 20-result rerank
- Graceful degradation: if reranker unavailable, return original order
**Definition of Done:**
- ✓ Reranker implementation (Ollama-based or heuristic)
- ✓ Configuration properties
- ✓ Fallback behavior
**Required tests:**
- Unit: Reranking with known query-document pairs
- Integration: End-to-end search → rerank → results
**Expected deliverables:** Updated `DefaultRerankingService.java`

---

### T-033: Citation Service — Reference Formatting

**Description:** The DefaultCitationService generates citations for search results. Ensure citations follow German legal citation standards: document title, paragraph number, date, authority.

**Affected modules:** platform-search
**Dependencies:** T-002
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- Citation format: "§ [number] [title], [authority], [date]"
- Multiple citations from same document grouped
- Citation links to document viewer with chunk anchor
**Definition of Done:**
- ✓ German legal citation format
- ✓ Citation grouping logic
- ✓ Chunk anchor links
**Required tests:**
- Unit: Citation formatting for each document type
**Expected deliverables:** Updated `DefaultCitationService.java`

---

### T-034: Search Frontend — Advanced Query Builder

**Description:** Build advanced search UI: Boolean operators (AND, OR, NOT), field-specific search (title:, authority:, domain:), date range filter, document type filter. Translates to backend SearchRequest DTO.

**Affected modules:** frontend/
**Dependencies:** T-015
**Estimated effort:** 12h
**Risk:** Low
**Acceptance criteria:**
- Query builder with field selectors
- Date range picker
- Document type multi-select
- Boolean operator toggle
- Query preview showing constructed search
**Definition of Done:**
- ✓ Advanced query builder component
- ✓ Query construction logic
- ✓ Filter state synced with URL params
**Required tests:**
- Unit: Query builder → SearchRequest translation
- Unit: URL param sync
**Expected deliverables:** New `AdvancedSearch.tsx`, updated `SearchBar.tsx`

---

## Epic 7 — Knowledge Graph

### T-035: Neo4j Connection — Health Check & Resilience

**Description:** Verify Neo4j connection health. Add circuit breaker for graph queries. Implement graceful degradation: graph unavailable → search works without graph enrichment. Add connection pooling configuration.

**Affected modules:** platform-neo4j
**Dependencies:** T-002
**Estimated effort:** 8h
**Risk:** Medium — Neo4j is optional per architecture
**Acceptance criteria:**
- Neo4j health indicator in `/actuator/health`
- Circuit breaker opens after 3 consecutive failures
- Graph enrichment skipped when circuit is open
- Search results not degraded by graph unavailability
**Definition of Done:**
- ✓ Health indicator
- ✓ Circuit breaker configuration
- ✓ Graceful degradation verified
**Required tests:**
- Integration: Graph unavailable → search still works
- Integration: Circuit breaker behavior
**Expected deliverables:** Updated Neo4j configuration, health indicator

---

### T-036: Graph Visualization — Frontend Component

**Description:** Build a graph visualization component for the Knowledge Graph page. Display nodes (documents, concepts, entities) and edges (relationships). Use a lightweight graph library (vis-network or cytoscape). Fetch graph data from Neo4j API.

**Affected modules:** frontend/, platform-neo4j
**Dependencies:** T-035, T-012
**Estimated effort:** 16h
**Risk:** Medium — graph visualization UX is complex
**Acceptance criteria:**
- Graph page fetches nodes and edges from `/api/graph`
- Nodes rendered as labeled circles (color-coded by type)
- Edges show relationship type on hover
- Click node → show detail panel
- Zoom, pan, and layout controls
- Performance: 500 nodes rendered without lag
**Definition of Done:**
- ✓ Graph component with force-directed layout
- ✓ Node detail panel
- ✓ Interactive (zoom, pan, click)
- ✓ Responsive to container size
**Required tests:**
- Unit: Graph data transformation
- Unit: Node/edge rendering logic
**Expected deliverables:** New `GraphVisualization.tsx`, graph API endpoint

---

## Epic 8 — Workspace & Case Management

### T-037: Case Workspace — Full CRUD Operations

**Description:** The CaseWorkspacePage currently uses mock data. Implement full create/read/update/delete for cases via API. Case header, case list, case creation wizard with workspace type selection.

**Affected modules:** frontend/, platform-workspace, platform-api
**Dependencies:** T-016
**Estimated effort:** 16h
**Risk:** Medium — complex UI with many tabs
**Acceptance criteria:**
- Create case: select workspace, enter metadata → POST `/api/workspaces/{id}/cases`
- Case list: paginated, filterable by status, assignee, priority
- Case header: case number, title, citizen, assignee, status, deadline, priority
- Case tabs switch without page navigation
- Breadcrumb: Startseite > Meine Arbeit > CASE-ID > Tab
**Definition of Done:**
- ✓ Case creation wizard
- ✓ Case list with filters
- ✓ Case header component populated from API
- ✓ Tab routing within case workspace
**Required tests:**
- Unit: Case CRUD service methods
- Unit: Case header rendering
- Integration: Case creation → list → open → edit flow
**Expected deliverables:** Updated `CaseWorkspacePage.tsx`, `CaseHeader.tsx`, case service

---

### T-038: Case Checklist — Dynamic Template Rendering

**Description:** Each workspace type has a checklist template. Render checklist dynamically based on case type. Items can be checked off, items can have sub-tasks, progress shown as percentage. Checklist data from API.

**Affected modules:** frontend/, platform-workspace
**Dependencies:** T-037
**Estimated effort:** 10h
**Risk:** Low
**Acceptance criteria:**
- ChecklistTab fetches checklist from API for case type
- Items rendered with checkbox, title, description
- Check triggers PUT to update item status
- Progress bar shows completion %
- Nested sub-items supported
**Definition of Done:**
- ✓ ChecklistTab renders dynamic checklist
- ✓ Check/uncheck persists via API
- ✓ Progress indicator
**Required tests:**
- Unit: Checklist rendering
- Unit: Progress calculation
- Integration: Check → API call → state update
**Expected deliverables:** Updated `ChecklistTab.tsx`, `ChecklistWidget.tsx`, `ChecklistItem.tsx`

---

### T-039: Case Documents Tab — Scoped Document View

**Description:** Each case has its own documents. The DocumentsTab shows only documents attached to the current case. Upload, preview, download, compare versions. Distinct from global Document Management.

**Affected modules:** frontend/, platform-api, platform-document
**Dependencies:** T-037
**Estimated effort:** 12h
**Risk:** Low
**Acceptance criteria:**
- DocumentsTab shows only case-scoped documents
- Upload attaches document to case
- Preview opens document viewer
- Version history for case documents
- "Dokumente" tab clearly distinct from global "Dokumentenverwaltung"
**Definition of Done:**
- ✓ DocumentsTab filters by case ID
- ✓ Upload with case association
- ✓ Version comparison
**Required tests:**
- Unit: Case document filtering
- Integration: Upload → attach → view flow
**Expected deliverables:** Updated `DocumentsTab.tsx`, `DocumentListWidget.tsx`

---

### T-040: Internal Notes Tab

**Description:** Case-specific internal notes. Create, edit, delete notes. Rich text or plain text. Timestamped, attributed to user. Notes are internal — never visible externally.

**Affected modules:** frontend/, platform-workspace
**Dependencies:** T-037
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- InternalNotesTab shows notes list with timestamps
- Add note with text input → POST to API
- Edit/delete own notes
- Notes sorted by most recent first
**Definition of Done:**
- ✓ NotesTab implemented
- ✓ CRUD operations via API
- ✓ User attribution and timestamps
**Required tests:**
- Unit: Notes CRUD logic
- Integration: Note creation → display → edit flow
**Expected deliverables:** Updated `InternalNotesTab.tsx`, `NotesWidget.tsx`

---

### T-041: Activity Timeline Tab

**Description:** Case activity feed showing all events: status changes, document attachments, notes added, decisions made. Real-time updates via polling or SSE.

**Affected modules:** frontend/, platform-workspace, platform-audit
**Dependencies:** T-037
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- ActivityTab shows chronological event list
- Events grouped by date
- Event types distinguished by icon
- Auto-refresh every 30s or via SSE
- Click event → navigate to related entity
**Definition of Done:**
- ✓ ActivityTab with event list
- ✓ Auto-refresh mechanism
- ✓ Event type icons and formatting
**Required tests:**
- Unit: Activity event rendering
- Unit: Auto-refresh logic
**Expected deliverables:** Updated `ActivityTab.tsx`, `ActivityTimeline.tsx`

---

### T-042: My Work — Case List & Inbox

**Description:** Build the "Meine Arbeit" page (`/work`). Shows all cases assigned to current user. Table with: case number, title, citizen, status, priority, deadline, last activity. Quick filters: open, overdue, high priority. Click opens case workspace.

**Affected modules:** frontend/, platform-workspace
**Dependencies:** T-037
**Estimated effort:** 10h
**Risk:** Low
**Acceptance criteria:**
- `/work` shows assigned cases in paginated table
- Status filter: open, in progress, completed
- Priority filter: high, medium, low
- Overdue cases highlighted in red
- Click case → navigate to `/work/{caseId}`
- Empty state when no cases
**Definition of Done:**
- ✓ MyWork page with case table
- ✓ Filters and sorting
- ✓ Priority/deadline visual indicators
**Required tests:**
- Unit: Case filtering logic
- Unit: Overdue detection
**Expected deliverables:** New `MyWorkPage.tsx`, updated router

---

## Epic 9 — Corpus Administration

### T-043: Corpus Inventory — Manifest-Based Import

**Description:** The `knowledge/MANIFEST.yaml` defines 22+ documents. Build a batch import tool that reads the manifest and imports all documents into the system. Track progress, handle partial failures.

**Affected modules:** platform-api, platform-document, platform-search
**Dependencies:** T-028
**Estimated effort:** 12h
**Risk:** Medium — batch operations are error-prone
**Acceptance criteria:**
- Import reads MANIFEST.yaml entries
- Each document: create → extract text → chunk → embed → index
- Progress tracked and reported per document
- Failed documents don't block the batch
- Summary report after completion
**Definition of Done:**
- ✓ Manifest parser
- ✓ Batch import with progress tracking
- ✓ Failure isolation
- ✓ Summary report
**Required tests:**
- Unit: Manifest parsing
- Integration: Batch import with small manifest
**Expected deliverables:** `ManifestImportService.java`, updated `BatchImportService.java`

---

### T-044: Corpus Health — Automated Alerts

**Description:** Add alerting to corpus health dashboard. When embedding coverage drops below threshold or Qdrant vectors are missing, surface a warning with actionable recommendation. Add periodic health check background job.

**Affected modules:** platform-api
**Dependencies:** T-017, T-028
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Background job runs corpus health check every hour
- Alert when embedding coverage < 90%
- Alert when chunks missing Qdrant vectors
- Alert when documents failed ingestion
- Alerts visible in corpus health dashboard
**Definition of Done:**
- ✓ Scheduled health check job
- ✓ Threshold-based alerting
- ✓ Alert display in dashboard
**Required tests:**
- Unit: Alert threshold logic
- Integration: Health check job execution
**Expected deliverables:** Updated `CorpusHealthService.java`, scheduled job

---

### T-045: Corpus Versioning — Snapshot & Rollback

**Description:** Implement corpus versioning: take a snapshot of the current corpus state (document list + chunk map + index state). Support rollback to previous snapshot. Store snapshot metadata in PostgreSQL.

**Affected modules:** platform-api, platform-search
**Dependencies:** T-043
**Estimated effort:** 12h
**Risk:** Medium
**Acceptance criteria:**
- `POST /api/admin/corpus/snapshot` creates named snapshot
- `GET /api/admin/corpus/snapshots` lists available snapshots
- `POST /api/admin/corpus/rollback/{snapshotId}` reverts to snapshot
- Snapshot captures: document list, chunk IDs, Qdrant collection state
**Definition of Done:**
- ✓ Snapshot creation endpoint
- ✓ Snapshot listing endpoint
- ✓ Rollback with confirmation
**Required tests:**
- Unit: Snapshot data model
- Integration: Snapshot → modify → rollback → verify
**Expected deliverables:** New `CorpusSnapshotService.java`, snapshot DTOs, REST endpoints

---

## Epic 10 — Testing

### T-046: Backend Unit Test Coverage — platform-ai

**Description:** The platform-ai module has 17 test files but coverage is incomplete. Add unit tests for all business logic: RuleEngine, DomainClassifier, EvidencePackageBuilder, NumericExtractor, PromptRegistry, ModelCapabilityRegistry. Target: 80%+ line coverage.

**Affected modules:** platform-ai
**Dependencies:** T-021 through T-026
**Estimated effort:** 16h
**Risk:** Low
**Acceptance criteria:**
- RuleEngine: 100% coverage of all lookup paths
- DomainClassifier: all domain combinations
- EvidencePackageBuilder: all fields populated correctly
- PromptRegistry: template rendering with all variable combinations
- JaCoCo report shows ≥ 80% line coverage for platform-ai
**Definition of Done:**
- ✓ Tests pass with `mvn test -pl platform-ai`
- ✓ JaCoCo report meets threshold
- ✓ Tests readable as specifications
**Required tests:** Unit tests (JUnit 5 + AssertJ + Mockito)
**Expected deliverables:** New test files in `platform-ai/src/test/`

---

### T-047: Backend Unit Test Coverage — platform-search

**Description:** Add unit tests for search module: HybridRetrievalService, RerankingService, CitationService, ChunkManagementService. Mock Qdrant and database dependencies.

**Affected modules:** platform-search
**Dependencies:** T-031, T-032, T-033
**Estimated effort:** 14h
**Risk:** Low
**Acceptance criteria:**
- HybridRetrievalService: fusion logic, deduplication, edge cases
- RerankingService: score-based reordering
- CitationService: all citation formats
- JaCoCo ≥ 80% for platform-search
**Definition of Done:**
- ✓ Tests pass
- ✓ JaCoCo threshold met
**Required tests:** Unit tests (JUnit 5 + Mockito)
**Expected deliverables:** New test files in `platform-search/src/test/`

---

### T-048: Backend Integration Tests — API Layer

**Description:** Write integration tests for all REST endpoints using Testcontainers (PostgreSQL, Qdrant). Test auth flow, document CRUD, search, workspace operations, decision queries.

**Affected modules:** platform-api
**Dependencies:** T-007 through T-019 (all API wiring tasks)
**Estimated effort:** 16h
**Risk:** Medium — Testcontainers setup complexity
**Acceptance criteria:**
- Auth: register → login → refresh → logout flow
- Documents: upload → list → view → update → delete
- Search: index → search → retrieve chunks
- Workspace: create → list → update → delete
- Decision: rule-based query → structured response
- All tests use Testcontainers, no mocked database
**Definition of Done:**
- ✓ Integration test suite with Testcontainers
- ✓ Each endpoint group tested
- ✓ Error responses tested (400, 401, 404, 500)
**Required tests:** Integration tests (Spring Boot Test + Testcontainers + REST Assured)
**Expected deliverables:** New integration test files in `platform-api/src/test/`

---

### T-049: Frontend Unit Tests — Component Coverage

**Description:** Write unit tests for all 84 React components using Vitest + React Testing Library. Target: 80%+ line coverage. Start with common components (Button, Badge, TextInput, DataTable), then pages.

**Affected modules:** frontend/
**Dependencies:** T-005, T-008 through T-020 (all component implementation tasks)
**Estimated effort:** 40h
**Risk:** Medium — large task, affects all components
**Acceptance criteria:**
- Every reusable component has at least one test
- Page components have tests for key states (loading, empty, error, populated)
- Vitest coverage report shows ≥ 80% line coverage
- Tests run in CI pipeline
**Definition of Done:**
- ✓ Vitest configured with coverage thresholds
- ✓ Component tests for all common components
- ✓ Page tests for key states
- ✓ CI integration
**Required tests:** Unit tests (Vitest + React Testing Library)
**Expected deliverables:** `*.test.tsx` files alongside each component, `vitest.config.ts`

---

### T-050: Frontend Integration Tests — User Flows

**Description:** Write integration tests for critical user flows: login → view home → open case → view decision support. Use MSW to mock API but test real component composition and routing.

**Affected modules:** frontend/
**Dependencies:** T-049
**Estimated effort:** 16h
**Risk:** Low
**Acceptance criteria:**
- Login flow: render login → enter credentials → redirect to home
- Case flow: home → click case → case workspace with header
- Decision flow: case → decision tab → enter question → see results
- Error flow: API error → error boundary or error state rendered
**Definition of Done:**
- ✓ Integration tests for 5 critical user flows
- ✓ MSW handlers for all mocked endpoints
- ✓ Tests pass in CI
**Required tests:** Integration tests (Vitest + React Testing Library + MSW)
**Expected deliverables:** Integration test files in `frontend/src/__tests__/`

---

### T-051: Playwright E2E Tests — Critical Paths

**Description:** Expand the existing Playwright test suite in `e2e-tests/playwright/`. Cover full critical paths with a running backend. Tests should run against real services (Testcontainers or docker-compose).

**Affected modules:** e2e-tests/
**Dependencies:** T-048, T-050
**Estimated effort:** 20h
**Risk:** Medium — E2E tests are flaky by nature
**Acceptance criteria:**
- Login → register → login flow
- Upload document → verify in list → open viewer
- Submit decision query → verify structured response
- Create case → add note → verify in timeline
- Admin: corpus health dashboard loads with data
- All tests pass against docker-compose environment
**Definition of Done:**
- ✓ 10 E2E test scenarios
- ✓ CI integration (GitHub Actions)
- ✓ Test data setup/teardown scripts
**Required tests:** E2E tests (Playwright)
**Expected deliverables:** New test files in `e2e-tests/playwright/tests/`

---

### T-052: Performance Baseline Tests

**Description:** Write JMeter or k6 performance test scripts. Establish baseline metrics: API response times, search latency, decision query latency. Tests must pass before deployment.

**Affected modules:** All
**Dependencies:** T-048
**Estimated effort:** 12h
**Risk:** Low — measuring, not optimizing
**Acceptance criteria:**
- k6 script for: home page load, search query, document upload, decision query
- Baseline metrics captured and documented
- Performance test runs in CI (informational only, not blocking)
**Definition of Done:**
- ✓ k6 test scripts for 5 scenarios
- ✓ Baseline metrics documented
- ✓ CI integration (non-blocking)
**Required tests:** Performance tests (k6 scripts)
**Expected deliverables:** `tests/performance/` directory with k6 scripts, `PERFORMANCE_BASELINE.md`

---

## Epic 11 — Security Hardening

### T-053: Content Security Policy (CSP) Headers

**Description:** Implement strict CSP headers. Allow only known script sources, style sources, connect sources. Block inline scripts. Test with frontend to ensure no violations.

**Affected modules:** platform-api
**Dependencies:** T-020 (all frontend pages integrated)
**Estimated effort:** 8h
**Risk:** Medium — over-restrictive CSP breaks frontend
**Acceptance criteria:**
- CSP header present on all responses
- `script-src 'self'` only (no 'unsafe-inline')
- `connect-src 'self'` for API calls
- `style-src 'self' 'unsafe-inline'` (CSS modules need it)
- CSP violation reports sent to `/api/csp-report`
- Report-only mode during testing
**Definition of Done:**
- ✓ CSP filter configured
- ✓ Report-only → enforced migration plan
- ✓ Zero CSP violations in production build
**Required tests:**
- Unit: CSP header presence on responses
- Integration: Frontend loads without CSP violations
**Expected deliverables:** `CspFilter.java`, `SecurityConfig.java` update

---

### T-054: Rate Limiting

**Description:** Implement rate limiting on critical endpoints: login (prevent brute force), decision queries (prevent abuse), document upload (prevent DoS). Use token bucket algorithm. Configure limits via properties.

**Affected modules:** platform-api
**Dependencies:** T-007, T-013, T-014
**Estimated effort:** 10h
**Risk:** Low
**Acceptance criteria:**
- Login: 5 attempts per minute per IP
- Decision query: 10 per minute per user
- Document upload: 20 per hour per user
- Rate limit exceeded → 429 with Retry-After header
- Limits configurable via application.yml
**Definition of Done:**
- ✓ Rate limit filter/interceptor
- ✓ Configuration properties
- ✓ 429 response with Retry-After
**Required tests:**
- Unit: Rate limiter logic
- Integration: Rate limit → 429 → reset after window
**Expected deliverables:** `RateLimitFilter.java`, updated `application.yml`

---

### T-055: Input Validation & Sanitization

**Description:** Audit all user input entry points. Ensure all endpoints validate: string length limits, allowed characters, SQL injection prevention (JPA already helps), XSS prevention. Add @Valid annotations with proper constraint messages.

**Affected modules:** All backend modules
**Dependencies:** T-002
**Estimated effort:** 10h
**Risk:** Medium — security-critical
**Acceptance criteria:**
- All request DTOs have `@NotBlank`, `@Size`, `@Email` where appropriate
- All string inputs validated for max length
- Error messages in German
- XSS filter on all text inputs
- SQL injection test suite passes
**Definition of Done:**
- ✓ DTO validation annotations complete
- ✓ XSS filter configured
- ✓ Error messages internationalized
**Required tests:**
- Unit: Validation constraint violations
- Unit: XSS filter with known attack vectors
**Expected deliverables:** Updated DTOs, `XssFilter.java`

---

### T-056: Secrets Management

**Description:** Remove hardcoded secrets from application.yml. Move JWT secret, database password, API keys to environment variables or Vault. Document required env vars in DEPLOYMENT.md.

**Affected modules:** platform-api, platform-auth
**Dependencies:** T-002
**Estimated effort:** 6h
**Risk:** High — misconfiguration blocks deployment
**Acceptance criteria:**
- Zero secrets in committed files
- All secrets loaded from environment variables
- Development defaults only work locally (documented)
- `.env.example` file with placeholder values
**Definition of Done:**
- ✓ application.yml references env vars only
- ✓ `.env.example` committed
- ✓ `.env` in `.gitignore`
**Required tests:** Manual verification — no automated test
**Expected deliverables:** Updated `application.yml`, `.env.example`

---

### T-057: HTTPS/TLS Configuration

**Description:** Configure Spring Boot for HTTPS in production. Generate self-signed cert for staging, document LetsEncrypt setup for production. HSTS header configuration.

**Affected modules:** platform-api
**Dependencies:** T-053
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- HTTPS listener on port 8443 (configurable)
- HTTP → HTTPS redirect
- HSTS header with max-age=31536000
- Self-signed cert for development
**Definition of Done:**
- ✓ HTTPS configured
- ✓ HTTP redirect
- ✓ HSTS header
**Required tests:** Manual SSL verification
**Expected deliverables:** Updated `application.yml`, TLS configuration

---

## Epic 12 — Observability

### T-058: OpenTelemetry — Tracing

**Description:** Instrument the application with OpenTelemetry Java agent. Trace requests across module boundaries: API → Service → Repository. Export traces to Jaeger or Zipkin. Add trace ID to log output.

**Affected modules:** All
**Dependencies:** T-002
**Estimated effort:** 12h
**Risk:** Medium — instrumentation overhead can affect performance
**Acceptance criteria:**
- All HTTP requests traced with span
- Database queries traced
- External calls (Qdrant, Neo4j, Ollama) traced
- Trace ID in log pattern
- Traces exportable to Jaeger
**Definition of Done:**
- ✓ OpenTelemetry agent configured
- ✓ Custom spans for key operations
- ✓ Trace ID in logs
- ✓ Jaeger integration
**Required tests:**
- Integration: Verify traces in Jaeger after request
**Expected deliverables:** Updated `application.yml`, `docker-compose.yml` (add Jaeger), `logback-spring.xml`

---

### T-059: Application Metrics Dashboard

**Description:** Build a Grafana dashboard for application metrics. Panels: request rate, error rate, latency percentiles, decision query volume, document ingestion rate, search latency, DB connection pool, JVM memory.

**Affected modules:** platform-observability
**Dependencies:** T-058
**Estimated effort:** 12h
**Risk:** Low
**Acceptance criteria:**
- Grafana datasource configured for Prometheus
- Dashboard JSON committed to repo
- Panels for all key metrics
- Alert thresholds configured
**Definition of Done:**
- ✓ Grafana dashboard JSON
- ✓ Prometheus scrape config
- ✓ Alerts for critical metrics
**Required tests:** Manual dashboard validation
**Expected deliverables:** `grafana/dashboards/application.json`, updated `docker-compose.yml`

---

### T-060: Structured Logging

**Description:** Configure JSON-format logging for production. Include: timestamp, level, logger, message, trace ID, span ID, user ID (when authenticated). Console output for local dev, JSON for production.

**Affected modules:** All
**Dependencies:** T-058
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- Logback configured with JSON encoder for production profile
- Trace ID and span ID in every log line
- User ID in logs when authenticated
- Local dev uses human-readable format
**Definition of Done:**
- ✓ `logback-spring.xml` with profiles
- ✓ JSON logs in production
- ✓ Trace ID propagation
**Required tests:** Manual log format verification
**Expected deliverables:** `logback-spring.xml`

---

### T-061: Health Check Aggregation

**Description:** Enhance `/actuator/health` with aggregated health status. Include: database, Qdrant, Neo4j, Ollama, disk space. Each component reports UP/DOWN/DEGRADED.

**Affected modules:** platform-api, platform-observability
**Dependencies:** T-035
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- Health endpoint shows all components
- DEGRADED when optional service is down (Neo4j, Ollama)
- UP only when all critical services (DB, Qdrant) are up
- Health check used by Docker/K8s for readiness probe
**Definition of Done:**
- ✓ Health indicators for all services
- ✓ Aggregated status logic
- ✓ Docker healthcheck integration
**Required tests:**
- Unit: Health aggregation logic
**Expected deliverables:** Health indicator classes, updated `application.yml`

---

## Epic 13 — CI/CD Pipeline

### T-062: CI Pipeline — Build & Test Matrix

**Description:** Enhance the GitHub Actions CI pipeline. Add: build matrix (JDK 21), frontend build job, backend test job with Testcontainers, frontend test job, coverage reporting, artifact upload.

**Affected modules:** CI (.github/workflows)
**Dependencies:** T-046, T-047, T-049
**Estimated effort:** 10h
**Risk:** Low
**Acceptance criteria:**
- Pipeline runs on every push and PR
- Jobs: backend-build, backend-test, frontend-build, frontend-test, e2e-tests
- Coverage reports uploaded as artifacts
- Failed tests block merge
- Pipeline completes in < 15 minutes
**Definition of Done:**
- ✓ Enhanced `ci.yml`
- ✓ Coverage reports
- ✓ Branch protection rules documented
**Required tests:** Pipeline runs on push (self-validating)
**Expected deliverables:** Updated `.github/workflows/ci.yml`

---

### T-063: CD Pipeline — Staging Deploy

**Description:** Create a CD pipeline that deploys to a staging environment on merge to master. Build Docker image, push to registry, deploy via docker-compose or K8s. Smoke tests after deploy.

**Affected modules:** CI/CD
**Dependencies:** T-062, T-067
**Estimated effort:** 14h
**Risk:** Medium — deployment automation has many integration points
**Acceptance criteria:**
- Merge to master → build Docker image → push to registry
- Deploy to staging server
- Run smoke tests against staging
- Rollback on smoke test failure
- Slack notification on deploy
**Definition of Done:**
- ✓ `deploy.yml` workflow
- ✓ Docker image build and push
- ✓ Smoke test integration
- ✓ Notifications
**Required tests:** Smoke tests pass in pipeline
**Expected deliverables:** `.github/workflows/deploy.yml`

---

### T-064: Quality Gates — SonarQube Integration

**Description:** Integrate SonarQube (or SonarCloud) for code quality analysis. Quality gates: no bugs, 0 vulnerabilities, < 3% code smells, ≥ 80% coverage on new code, no duplicated blocks > 5%.

**Affected modules:** All
**Dependencies:** T-062
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- SonarQube analysis runs in CI
- Quality gate status reported on PR
- Failure blocks merge
**Definition of Done:**
- ✓ SonarQube configuration
- ✓ Quality gate definition
- ✓ CI integration
**Required tests:** Quality gate enforced in CI
**Expected deliverables:** `sonar-project.properties`, updated `ci.yml`

---

## Epic 14 — Production Deployment

### T-065: Production Dockerfile — Multi-Stage Build

**Description:** Create a production-grade multi-stage Dockerfile. Stage 1: Maven build with dependency caching. Stage 2: JRE 21 slim image with application JAR. Non-root user, health check, graceful shutdown.

**Affected modules:** All
**Dependencies:** T-002
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Multi-stage build: build → runtime
- Runtime image: `eclipse-temurin:21-jre-alpine`
- Non-root user `appuser`
- HEALTHCHECK instruction
- JVM flags for containers: `-XX:+UseContainerSupport`
- Build time < 10 minutes (cached), < 30 minutes (fresh)
**Definition of Done:**
- ✓ `Dockerfile` in project root
- ✓ `.dockerignore`
- ✓ Image size < 400MB
- ✓ Security scan on image
**Required tests:** `docker build && docker run` smoke test
**Expected deliverables:** `Dockerfile`, `.dockerignore`

---

### T-066: Docker Compose — Production Profile

**Description:** Create `docker-compose.prod.yml` for production-like local testing. Differences from dev: no exposed ports except app, no pgAdmin, resource limits, restart policy, health checks.

**Affected modules:** Infrastructure
**Dependencies:** T-065
**Estimated effort:** 6h
**Risk:** Low
**Acceptance criteria:**
- Production compose starts all services
- App port 8080 only exposed port
- Memory limits on each service
- Restart: unless-stopped
- Health checks on all services
**Definition of Done:**
- ✓ `docker-compose.prod.yml`
- ✓ Tested with `docker compose -f docker-compose.prod.yml up`
**Required tests:** Smoke test with production compose
**Expected deliverables:** `docker-compose.prod.yml`

---

### T-067: Kubernetes Manifests — Base Deployment

**Description:** Create K8s manifests for deployment: Deployment, Service, ConfigMap, Secret (placeholder), Ingress. Target: single-node cluster (k3s or minikube) for Version 1.0.

**Affected modules:** Infrastructure
**Dependencies:** T-065
**Estimated effort:** 16h
**Risk:** Medium — K8s complexity
**Acceptance criteria:**
- Deployment: 2 replicas, resource requests/limits
- Service: ClusterIP on port 8080
- ConfigMap: non-sensitive configuration
- Secret: placeholder for sensitive values
- Ingress: TLS termination
- Readiness and liveness probes
- Works on k3s single-node
**Definition of Done:**
- ✓ `k8s/` directory with all manifests
- ✓ Deployed and verified on k3s
- ✓ Pod starts and passes health check
**Required tests:** Deployment on k3s, health check verification
**Expected deliverables:** `k8s/deployment.yaml`, `k8s/service.yaml`, `k8s/configmap.yaml`, `k8s/secret.yaml`, `k8s/ingress.yaml`

---

### T-068: Database Migration — Flyway Baseline

**Description:** Current `ddl-auto: update` is not production-safe. Create Flyway baseline migration from current schema. Switch to `ddl-auto: validate`. All future schema changes via Flyway migrations.

**Affected modules:** platform-api
**Dependencies:** T-002
**Estimated effort:** 10h
**Risk:** Medium — schema migration is irreversible
**Acceptance criteria:**
- `V1__baseline.sql` captures current schema
- Flyway enabled in application.yml
- `ddl-auto: validate` (not update)
- Migration tested on fresh database
- Rollback procedure documented
**Definition of Done:**
- ✓ Baseline migration
- ✓ Flyway enabled
- ✓ `ddl-auto: validate`
- ✓ Migration test on clean DB
**Required tests:**
- Integration: Flyway migration on Testcontainers
**Expected deliverables:** `V1__baseline.sql`, updated `application.yml`

---

### T-069: Backup & Restore — PostgreSQL

**Description:** Implement automated PostgreSQL backup. Script for full backup, WAL archiving for PITR. Restore procedure documented and tested. Backup to S3-compatible storage or local volume.

**Affected modules:** Infrastructure
**Dependencies:** T-065
**Estimated effort:** 10h
**Risk:** Medium — backup integrity is critical
**Acceptance criteria:**
- `pg_dump` scheduled daily via cron
- WAL archiving configured
- Backup script handles errors and logs
- Restore procedure tested: backup → restore → verify
- Backup retention: 7 daily, 4 weekly
**Definition of Done:**
- ✓ Backup script
- ✓ Restore procedure documented
- ✓ Restore tested on fresh instance
- ✓ Backup monitoring (alert on failure)
**Required tests:** Full backup → restore → data verification cycle
**Expected deliverables:** `scripts/backup.sh`, `scripts/restore.sh`, `docs/BACKUP_RESTORE.md`

---

### T-070: Backup & Restore — Qdrant

**Description:** Qdrant snapshots for vector index backup. Snapshot creation, storage, and restore procedure.

**Affected modules:** Infrastructure
**Dependencies:** T-065
**Estimated effort:** 6h
**Risk:** Medium
**Acceptance criteria:**
- Qdrant snapshot creation via API
- Snapshot stored alongside PostgreSQL backup
- Restore procedure documented and tested
**Definition of Done:**
- ✓ Qdrant snapshot script
- ✓ Restore procedure
- ✓ Tested restore verification
**Required tests:** Snapshot → delete collection → restore → verify vectors
**Expected deliverables:** Updated `scripts/backup.sh`, `docs/BACKUP_RESTORE.md`

---

### T-071: Incident Playbook

**Description:** Write an incident response playbook. Cover: service down, database corruption, Qdrant unavailable, Neo4j unavailable, Ollama timeout, disk full, memory leak, security incident. Each scenario: symptoms, diagnosis, mitigation, resolution.

**Affected modules:** Documentation
**Dependencies:** T-069, T-070
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- Playbook covers 8 incident scenarios
- Each scenario: symptoms → diagnosis → mitigation → resolution
- Contact information placeholders
- Escalation path documented
**Definition of Done:**
- ✓ `docs/INCIDENT_PLAYBOOK.md`
- ✓ 8 scenarios covered
- ✓ Runbook commands verified
**Required tests:** No automated tests — manual review
**Expected deliverables:** `docs/INCIDENT_PLAYBOOK.md`

---

## Epic 15 — Production Readiness

### T-072: LLM Evaluation Framework

**Description:** Build a lightweight LLM evaluation framework. Define evaluation dimensions: grounding (is answer supported by sources?), faithfulness (does answer contradict sources?), relevance (does answer address the question?). Implement automated scoring using a judge LLM.

**Affected modules:** platform-ai
**Dependencies:** T-025
**Estimated effort:** 16h
**Risk:** Medium — eval design is complex
**Acceptance criteria:**
- Evaluation dimensions: grounding, faithfulness, relevance, completeness
- Judge LLM scores each dimension 1-5
- Eval runner takes test dataset → runs queries → scores responses
- Results stored and comparable across prompt/model versions
- Eval dataset: 20 curated German municipal questions with expected answers
**Definition of Done:**
- ✓ Eval framework classes
- ✓ Judge LLM prompt templates
- ✓ Eval dataset (20 questions)
- ✓ Eval runner
**Required tests:**
- Unit: Eval scoring logic
- Unit: Eval dataset loading
**Expected deliverables:** `EvaluationRunner.java`, eval dataset, eval prompt templates

---

### T-073: Load Testing — Stress & Soak

**Description:** Use k6 to run load tests: smoke (1 user), average load (10 concurrent), stress (50 concurrent ramping to 100), soak (20 concurrent for 1 hour). Measure: throughput, latency p50/p95/p99, error rate, resource usage.

**Affected modules:** All
**Dependencies:** T-052, T-066
**Estimated effort:** 14h
**Risk:** Low — measuring, not optimizing
**Acceptance criteria:**
- Smoke test: all endpoints respond under 1 concurrent user
- Average load: p95 < 5s for decision queries
- Stress test: no crashes at 100 concurrent, graceful degradation
- Soak test: no memory leaks over 1 hour
- Results documented in LOAD_TEST_REPORT.md
**Definition of Done:**
- ✓ k6 scripts for 4 load profiles
- ✓ Test execution against prod-like environment
- ✓ Performance report with findings
**Required tests:** Load test execution (manual, not CI)
**Expected deliverables:** `tests/performance/` k6 scripts, `LOAD_TEST_REPORT.md`

---

### T-074: Chaos Engineering — Dependency Failure

**Description:** Test graceful degradation under dependency failure. Kill Qdrant → search still works (keyword only). Kill Neo4j → graph enrichment skipped, decisions still work. Kill Ollama → fallback responses. Verify the architecture's degradation guarantees.

**Affected modules:** All
**Dependencies:** T-066
**Estimated effort:** 10h
**Risk:** Low — testing existing architecture guarantees
**Acceptance criteria:**
- Qdrant down: keyword search works, vector search returns empty with warning
- Neo4j down: graph page shows "nicht verfügbar", decisions use retrieval only
- Ollama down: enrichment falls back, no 500 errors
- All failures logged with clear messages
- Recovery automatic when service returns
**Definition of Done:**
- ✓ Chaos test scripts
- ✓ All degradation paths verified
- ✓ Recovery verified
- ✓ `CHAOS_TEST_REPORT.md`
**Required tests:** Manual chaos testing (not automated)
**Expected deliverables:** `tests/chaos/` scripts, `CHAOS_TEST_REPORT.md`

---

### T-075: Production Readiness Checklist — Verification

**Description:** Create and execute the final production readiness checklist. Cover: security, performance, reliability, observability, documentation, operations. Every item must be verified before Version 1.0 ships.

**Affected modules:** All
**Dependencies:** ALL previous tasks
**Estimated effort:** 8h
**Risk:** Low — verification, not implementation
**Acceptance criteria:**
- All 50+ checklist items verified
- Any gaps documented with remediation plan
- Sign-off criteria defined
**Definition of Done:**
- ✓ `PRODUCTION_READINESS_CHECKLIST.md` filled out
- ✓ All items verified or remediated
- ✓ Sign-off by technical lead
**Required tests:** No automated tests — verification checklist
**Expected deliverables:** `PRODUCTION_READINESS_CHECKLIST.md`

---

### T-076: Documentation — Operations Manual

**Description:** Write the operations manual covering: system architecture overview, infrastructure diagram, service dependencies, startup/shutdown procedures, monitoring, alerting, backup/restore, troubleshooting common issues.

**Affected modules:** Documentation
**Dependencies:** T-069, T-070, T-071
**Estimated effort:** 12h
**Risk:** Low
**Acceptance criteria:**
- Architecture diagram with all services
- Startup procedure (ordered)
- Shutdown procedure
- Monitoring dashboard locations
- Alert definitions and response
- Troubleshooting guide for 10 common issues
**Definition of Done:**
- ✓ `docs/OPERATIONS_MANUAL.md`
- ✓ Diagrams included (or linked)
- ✓ Procedures verified
**Required tests:** Manual procedure verification
**Expected deliverables:** `docs/OPERATIONS_MANUAL.md`

---

### T-077: Documentation — API Reference

**Description:** Generate or write complete API reference documentation. All REST endpoints with request/response examples. Authentication requirements. Error codes. Rate limits.

**Affected modules:** platform-api
**Dependencies:** T-048 (integration tests verify endpoints)
**Estimated effort:** 8h
**Risk:** Low
**Acceptance criteria:**
- All endpoints documented with method, path, auth, request body, response body
- Example requests and responses in JSON
- Error response format documented
- Rate limit information included
**Definition of Done:**
- ✓ `docs/API_REFERENCE.md`
- ✓ Covers all REST controllers
- ✓ Example curl commands for each endpoint
**Required tests:** Manual verification against running API
**Expected deliverables:** `docs/API_REFERENCE.md`

---

### T-078: Final Integration Verification

**Description:** End-to-end verification of the complete system. Deploy production-like environment. Run through all user workflows. Verify all acceptance criteria. Fix any issues found.

**Affected modules:** All
**Dependencies:** ALL previous tasks
**Estimated effort:** 16h
**Risk:** Medium — may find integration issues
**Acceptance criteria:**
- Production-like environment running
- All user workflows pass: login, decision query, document upload, search, case management
- All admin workflows pass: corpus health, user management, audit
- Zero critical or high bugs
- Performance within baseline
**Definition of Done:**
- ✓ Integration verification report
- ✓ All workflows pass
- ✓ Bug list (if any) documented and triaged
**Required tests:** Manual workflow verification, automated E2E test suite
**Expected deliverables:** `INTEGRATION_VERIFICATION_REPORT.md`

---

## Task Summary by Epic

| Epic | Tasks | Effort (h) | Critical Tasks |
|---|---|---|---|
| 1. Platform Foundation | T-001 – T-006 | 34 | T-001, T-002 |
| 2. Authentication | T-007 – T-011 | 42 | T-007, T-008, T-010 |
| 3. Frontend-Backend Integration | T-012 – T-020 | 104 | T-012, T-013, T-014 |
| 4. Decision Engine Hardening | T-021 – T-026 | 40 | T-021 |
| 5. Document Pipeline | T-027 – T-030 | 42 | T-028 |
| 6. Search & Retrieval | T-031 – T-034 | 42 | T-031 |
| 7. Knowledge Graph | T-035 – T-036 | 24 | T-035 |
| 8. Workspace & Case Management | T-037 – T-042 | 64 | T-037 |
| 9. Corpus Administration | T-043 – T-045 | 32 | — |
| 10. Testing | T-046 – T-052 | 134 | T-046, T-049 |
| 11. Security Hardening | T-053 – T-057 | 40 | T-053 |
| 12. Observability | T-058 – T-061 | 36 | — |
| 13. CI/CD Pipeline | T-062 – T-064 | 32 | T-062 |
| 14. Production Deployment | T-065 – T-071 | 64 | T-065, T-068 |
| 15. Production Readiness | T-072 – T-078 | 84 | — |
| **Total** | **78 tasks** | **814** | |

---

## Task Order (Topologically Sorted)

```
Phase 1: Foundation
  T-001 → T-002 → T-003 → T-004 → T-005 → T-006

Phase 2: Backend Hardening
  T-021 → T-022 → T-023 → T-024 → T-025 → T-026
  T-028 → T-029 → T-030

Phase 3: Auth + API Foundation
  T-007 → T-012
  T-008 → T-009 → T-010 → T-011 (parallel with T-007/T-012)

Phase 4: Core API Integration
  T-013, T-014, T-015, T-016 (parallel)
  T-017, T-018, T-019, T-020 (parallel, depend on T-012)

Phase 5: Search + Graph
  T-031 → T-032 → T-033 → T-034 (parallel with T-035 → T-036)

Phase 6: Case Management
  T-037 → T-038, T-039, T-040, T-041 (parallel)
  T-042 (depends on T-037)

Phase 7: Corpus Admin
  T-043 → T-044, T-045

Phase 8: Testing
  T-046 (depends on Phase 2) → T-047 (depends on Phase 5)
  T-048 (depends on Phase 4)
  T-049 (depends on Phase 4) → T-050 (depends on T-049)
  T-051 (depends on T-048, T-050)
  T-052 (depends on T-048)

Phase 9: Security + Observability
  T-053 → T-054 → T-055
  T-056, T-057 (parallel)
  T-058 → T-059 → T-060 → T-061 (parallel with security)

Phase 10: Production
  T-065 → T-066 → T-067
  T-068 → T-069 → T-070 → T-071
  T-062 → T-063 → T-064

Phase 11: Production Readiness
  T-072 → T-073 → T-074 → T-075
  T-076, T-077 (parallel)
  T-078 (depends on ALL)
```

## Parallelization Matrix

Tasks that can run concurrently (no shared dependencies):

| Group | Tasks | Team |
|---|---|---|
| A | T-001 through T-006 | DevOps + 1 Engineer |
| B | T-021 through T-026 | Backend Engineer 1 |
| C | T-028, T-029, T-030 | Backend Engineer 2 |
| D | T-007, T-008, T-009, T-010, T-011 | Frontend Engineer 1 |
| E | T-012 (must complete before E1-E8) | Frontend Lead |
| F | T-013, T-014, T-015, T-016 | Frontend Engineers (4 parallel) |
| G | T-017, T-018, T-019, T-020 | Frontend Engineers (4 parallel) |
| H | T-031 through T-036 | Backend Engineer 1 + Frontend Engineer |
| I | T-037 through T-042 | Frontend Engineers |
| J | T-046, T-047, T-048, T-049 | QA + Engineers |
