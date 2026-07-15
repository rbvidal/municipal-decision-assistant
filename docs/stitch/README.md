# Google Stitch Design Pack — Municipal Decision Platform

## What This Is

A complete design specification for Google AI Studio (Stitch) to generate a case-management enterprise application for German municipal employees. The platform replaces the existing Thymeleaf UI with a professional workspace that feels like **Microsoft Outlook meets Jira meets SAP Fiori.**

Decision support tools quietly assist in the background. The AI is never the center of attention.

## Files

| File | Purpose | Audience |
|---|---|---|
| `00_USER_JOURNEY.md` | Complete end-to-end user journey from login to logout, including all error states, empty states, and notifications | Stitch (context) |
| `01_APPLICATION.md` | What the platform is, who uses it, and the design philosophy | Stitch (context) |
| `02_PERSONAS.md` | Four user personas with responsibilities, frustrations, and expectations | Stitch (context) |
| `03_AUTHENTICATION.md` | Login, forgot password, reset password, first login, session expired, logout, access denied screens with wireframes | Stitch (screens) |
| `04_NAVIGATION.md` | Navigation structure: Startseite, Meine Arbeit, Wissen, Dokumente, Verwaltung | Stitch (structure) |
| `05_HOME.md` | **Operational dashboard.** Caseload cards, overdue items, waiting states, completed today, watched cases, suggested next task. Decision support sidebar. | Stitch (primary screen) |
| `06_CASE_WORKFLOW.md` | **Complete case workspace.** Inbox → Review → Decision Support → Draft → Approval → Send → Archive. Includes: checklists, internal notes, audit timeline, assignment/reassignment, waiting states, missing documents, risk indicators | Stitch (core workflow) |
| `07_KNOWLEDGE.md` | **Unified search** across regulations, procedures, templates, FAQs, cases, citizens, and documents. Results grouped by category. | Stitch (screens) |
| `08_DOCUMENTS.md` | Document management with version comparison, related documents, referenced/citing regulations. Technical details hidden behind Advanced. | Stitch (screens) |
| `09_AI_ASSISTANT.md` | **Decision Support** (not "AI"). Summary, applicable regulations, missing information, suggested checklist, suggested next action, supporting documents. Confidence and execution trace hidden behind Advanced. | Stitch (component) |
| `10_ADMIN.md` | Administration screens: corpus health, audit log, jobs, benchmarks, developer tools. Admin-only. | Stitch (admin screens) |
| `11_COMPONENTS.md` | Complete component library: cards, tables, forms, dialogs, buttons, navigation, badges, icons, empty states, loading states, toasts | Stitch (design system) |
| `12_BRANDING.md` | Visual identity: colors, typography, language/tone, desktop-first, information density, WCAG AA | Stitch (brand) |
| `13_API_SUMMARY.md` | Every user-visible action mapped to its API endpoint. UI actions only. | Stitch (data binding) |
| `14_DESIGN_SYSTEM.md` | CSS custom properties, spacing scale, grid, component CSS, animation tokens, accessibility checklist | Stitch (implementation) |
| `15_STITCH_PROMPT.md` | **The main prompt.** Paste directly into Google AI Studio. Emphasizes case management, workflow, task completion, enterprise desktop software. | Stitch (primary input) |
| `16_SAMPLE_DATA.md` | **Realistic German municipal data.** Employees, citizens, cases, addresses, documents, deadlines, internal notes, approval comments, templates. No Lorem Ipsum. | Stitch (mockup content) |

## How to Use

### Step 1: Paste the Main Prompt

Open Google AI Studio. Paste the **entire contents of `15_STITCH_PROMPT.md`** as your prompt. This is self-contained at ~4 pages and tells Stitch everything it needs.

### Step 2: Supplement with Detail Files

If Stitch needs more detail on a specific screen:

- Home dashboard → `05_HOME.md`
- Case workspace → `06_CASE_WORKFLOW.md`
- Knowledge search → `07_KNOWLEDGE.md`
- Document management → `08_DOCUMENTS.md`
- Decision support → `09_AI_ASSISTANT.md`
- Authentication → `03_AUTHENTICATION.md`
- Administration → `10_ADMIN.md`
- Visual style → `12_BRANDING.md` + `14_DESIGN_SYSTEM.md`
- Components → `11_COMPONENTS.md`
- API endpoints → `13_API_SUMMARY.md`
- Realistic content → `16_SAMPLE_DATA.md`

### Step 3: Iterate

Review each generated screen against:
1. Does it match the wireframe in the spec?
2. Is information density correct (50-row tables, 3-panel case layout)?
3. Is all text in German with professional municipal tone?
4. Is decision support a quiet sidebar, never the centerpiece?
5. Are technical details (confidence, execution trace, chunks, embeddings) behind "Erweitert"?
6. Does the color palette match `12_BRANDING.md`?

### Step 4: Wire Up to Backend

The 46 existing REST endpoints integrate directly. Three P1 endpoints need JSON wrappers:
- `POST /api/decision` → JSON
- `GET /api/corpus/health` → JSON
- `GET /api/corpus/inventory` → JSON

Backend service methods already exist. Only the controller response format changes.

## Design Principles (Reminder)

1. **Work first.** The home screen is an operational dashboard, not an AI prompt.
2. **Desktop-first, high density.** 50-row tables. 3-panel case layout. No mobile-first patterns.
3. **German language.** All labels, buttons, errors in German. Professional municipal tone.
4. **Decision support, not "AI".** The system supports decisions. It does not make them. The word "KI" never appears in user-facing labels.
5. **Progressive disclosure.** Technical details (confidence, execution trace, chunks, embeddings, vectors) always behind "Erweitert."
6. **Enterprise, not startup.** No gradients, no glassmorphism, no sparkle icons, no "magic" language.
7. **Microsoft 365 + Jira + SAP Fiori.** The target aesthetic. A professional work tool for public administration.
