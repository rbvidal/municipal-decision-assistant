# Stitch Design Pack — Final QA Report

**Date:** 15 July 2026  
**Scope:** 18 Markdown files, 4,741 lines  
**Method:** 8-dimension documentation audit

---

## 1. Cross-Reference Validation

All cross-file references resolve correctly:

| Source File | Reference | Target | Status |
|---|---|---|---|
| `00_USER_JOURNEY.md:110` | `06_CASE_WORKFLOW.md` | Complete case flow | ✓ |
| `06_CASE_WORKFLOW.md:360` | `09_AI_ASSISTANT.md` | Decision support component | ✓ |
| `09_AI_ASSISTANT.md:99` | `05_HOME.md` | Home sidebar placement | ✓ |
| `16_SAMPLE_DATA.md:592` | `06_CASE_WORKFLOW.md` | Risk indicator values | ✓ |

No broken references found.

---

## 2. Navigation Consistency

### Main Navigation (consistent across all files)

```
Startseite | Meine Arbeit | Wissen | Dokumente | Verwaltung
```
Present in: `04_NAVIGATION.md`, `05_HOME.md`, `06_CASE_WORKFLOW.md`, `07_KNOWLEDGE.md`, `08_DOCUMENTS.md`, `10_ADMIN.md`, `15_STITCH_PROMPT.md`.

### Meine Arbeit Sub-Navigation (consistent)

```
[ Posteingang (3) ] [ Offene Vorgänge (12) ] [ Warten (5) ] [ Genehmigung (2) ] [ Archiv (47) ]
```
Matches in: `04_NAVIGATION.md:69`, `06_CASE_WORKFLOW.md:45`.

### Wissen Sub-Navigation — CONTRADICTION FOUND

| File | Tabs Shown |
|---|---|
| `04_NAVIGATION.md:75` | `[ Alles ] [ Vorschriften ] [ Verfahren ] [ Vorlagen ] [ FAQs ] [ Checklisten ]` |
| `07_KNOWLEDGE.md:15` | `[ Alles ] Vorschriften Verfahren Vorlagen FAQs Fälle Bürger Dokumente` |
| `15_STITCH_PROMPT.md:109` | `[ Alles ] Vorschriften Verfahren Vorlagen FAQs Fälle Bürger Dokumente` |

**Issue:** `07_KNOWLEDGE.md` and `15_STITCH_PROMPT.md` match each other, showing 8 tabs including `Fälle`, `Bürger`, `Dokumente`. `04_NAVIGATION.md` shows 6 tabs including `Checklisten` instead of `Fälle`/`Bürger`/`Dokumente`.

**Recommended correction:** Align `04_NAVIGATION.md` with `07_KNOWLEDGE.md`. The Wissen screen is a unified search across all content types. The tabs should be: `[ Alles ] [ Vorschriften ] [ Verfahren ] [ Vorlagen ] [ FAQs ] [ Fälle ] [ Bürger ] [ Dokumente ]`. Move `Checklisten` to appear as a resource within the `Verfahren` or `Vorlagen` section rather than a top-level tab, or add it as a 9th tab.

**Severity:** MEDIUM — Stitch will generate different tabs depending on which file it reads.

### Dokumente Sub-Navigation (consistent)

```
[ Alle Dokumente ] [ Hochladen ] [ Index-Status ]
```
Matches in: `04_NAVIGATION.md:81`, `08_DOCUMENTS.md:13`.

### Verwaltung Sub-Navigation — MINOR GAP

```
[ Übersicht ] [ Korpus-Status ] [ Audit ] [ Aufträge ] [ Benchmarks ] [ Entwickler ]
```
`04_NAVIGATION.md:87` shows 6 tabs.

**Issue:** `10_ADMIN.md` tool grid includes a "Systemkonfiguration" card (line 53) with no corresponding sub-navigation tab.

**Recommended correction:** Either add `Systemkonfiguration` to the Verwaltung sub-nav, or clarify that Systemkonfiguration is accessed from the Übersicht card (inline panel), not a separate sub-page.

**Severity:** LOW.

---

## 3. Screen Inventory

| Screen | Purpose | Primary User | Defined In | Navigation Path | Main Endpoint(s) |
|---|---|---|---|---|---|
| Startseite | Operational dashboard | Sachbearbeiter, Supervisor | `05_HOME.md` | `/home` | GET /api/workspaces, POST /api/decision |
| Meine Arbeit — Posteingang | New case inbox | Sachbearbeiter | `06_CASE_WORKFLOW.md` | `/work` → Posteingang | GET /api/workspaces |
| Meine Arbeit — Offene Vorgänge | Active cases | Sachbearbeiter | `06_CASE_WORKFLOW.md` | `/work` → Offene Vorgänge | GET /api/workspaces |
| Meine Arbeit — Warten | Waiting cases | Sachbearbeiter | `06_CASE_WORKFLOW.md` | `/work` → Warten | GET /api/workspaces |
| Meine Arbeit — Genehmigung | Approval queue | Supervisor | `06_CASE_WORKFLOW.md` | `/work` → Genehmigung | GET /api/workspaces/{id}/timeline |
| Meine Arbeit — Archiv | Archived cases | Sachbearbeiter | `06_CASE_WORKFLOW.md` | `/work` → Archiv | GET /api/audit/events |
| Meine Arbeit — Case Detail | Three-panel workspace | Sachbearbeiter | `06_CASE_WORKFLOW.md` | `/work` → case click | GET /api/documents/{id}, POST /api/decision |
| Meine Arbeit — Entscheidungsentwurf | Draft decision | Sachbearbeiter | `06_CASE_WORKFLOW.md` | `/work` → case → Entwurf phase | (client-side composition) |
| Meine Arbeit — Versand | Send reply | Sachbearbeiter | `06_CASE_WORKFLOW.md` | `/work` → case → Versand phase | (client-side composition) |
| Wissen — Suche | Unified search | All users | `07_KNOWLEDGE.md` | `/knowledge` → Alles | POST /api/search |
| Wissen — Vorschriften | Regulation browser | All users | `07_KNOWLEDGE.md` | `/knowledge` → Vorschriften | GET /api/documents |
| Wissen — Verfahren | Procedure descriptions | All users | `07_KNOWLEDGE.md` | `/knowledge` → Verfahren | (client-side composition) |
| Wissen — Vorlagen | Template library | All users | `07_KNOWLEDGE.md` | `/knowledge` → Vorlagen | (client-side composition) |
| Wissen — FAQs | FAQ browser | All users | `07_KNOWLEDGE.md` | `/knowledge` → FAQs | (client-side composition) |
| Dokumente — Alle Dokumente | Document list | All users | `08_DOCUMENTS.md` | `/documents` | GET /api/documents |
| Dokumente — Hochladen | Document upload | Dept Admin | `08_DOCUMENTS.md` | `/documents` → Hochladen | POST /documents/upload |
| Dokumente — Index-Status | Index health | Dept Admin | `08_DOCUMENTS.md` | `/documents` → Index-Status | GET /api/documents |
| Dokumente — Document Detail | Metadata, versions, content | All users | `08_DOCUMENTS.md` | `/documents/{id}` | GET /api/documents/{id}, GET /api/documents/{id}/content |
| Dokumente — Version Comparison | Side-by-side diff | Dept Admin | `08_DOCUMENTS.md` | `/documents/{id}` → Versionen → Vergleichen | (client-side composition) |
| Verwaltung — Übersicht | Admin tool grid | Admin | `10_ADMIN.md` | `/admin` | (static page) |
| Verwaltung — Korpus-Status | Corpus health | Admin | `10_ADMIN.md` | `/admin` → Korpus-Status | GET /admin/corpus-health (needs JSON) |
| Verwaltung — Audit | Audit log | Admin | `10_ADMIN.md` | `/admin` → Audit | GET /api/audit/events |
| Verwaltung — Aufträge | Ingestion jobs | Admin | `10_ADMIN.md` | `/admin` → Aufträge | GET /api/document-ingestion-jobs |
| Verwaltung — Benchmarks | Retrieval quality | Admin | `10_ADMIN.md` | `/admin` → Benchmarks | (CLI-only today) |
| Verwaltung — Entwickler | Dev dashboard | Dev/Admin | `10_ADMIN.md` | `/admin` → Entwickler | GET /dev/perf, GET /dev/knowledge/* |
| Login | Authentication | Unauthenticated | `03_AUTHENTICATION.md` | `/login` | POST /api/auth/login |
| Forgot Password | Password reset request | Unauthenticated | `03_AUTHENTICATION.md` | `/login` → Passwort vergessen | (client-side) |
| Reset Password | New password form | Unauthenticated | `03_AUTHENTICATION.md` | (email link) | (client-side) |

**No duplicate screens found.** No screen exists under multiple names.

---

## 4. API Consistency

### Endpoints referenced in screen files that appear in API summary

All endpoints referenced in `05_HOME.md`, `06_CASE_WORKFLOW.md`, `09_AI_ASSISTANT.md`, `10_ADMIN.md`, and `15_STITCH_PROMPT.md` are documented in `13_API_SUMMARY.md`.

### P1 Missing JSON Endpoints (correctly documented)

| Endpoint | Status |
|---|---|
| `POST /api/decision` | Documented as "needs JSON endpoint" in `13_API_SUMMARY.md:126` |
| `GET /api/corpus/health` | Documented as "needs JSON endpoint" in `13_API_SUMMARY.md:127` |
| `GET /api/corpus/inventory` | Documented as "needs JSON endpoint" in `13_API_SUMMARY.md:128` |

### User actions without mapped endpoints

| Action | Screen | Status |
|---|---|---|
| Batch assign/archive/export | Meine Arbeit lists | Intentionally deferred — not in v1.0 scope |
| Notification persistence | Bell dropdown | Intentionally deferred — client-side only in v1.0 |
| Print-formatted PDF | Versand | Not documented — acknowledge as gap or defer |
| User preferences (Einstellungen) | User menu | Intentionally deferred — "(zukünftig)" |

**No contradictory mappings found.** Every user action that has a backend endpoint is correctly mapped.

---

## 5. Terminology Audit

### User-Facing Text — Search for Prohibited Terms

Terms searched: `KI`, `AI`, `Assistant`, `Chat`, `Analysis` in user-facing labels and wireframes.

| Term | File | Context | Verdict |
|---|---|---|---|
| "KI-Provider" | `10_ADMIN.md:55` | Admin configuration card label | ACCEPTABLE — technical admin term |
| "KI-Assistent" | `09_AI_ASSISTANT.md:215` | "Never Use" column in naming convention table | ACCEPTABLE — showing what NOT to use |
| "KI-Analyse" | `09_AI_ASSISTANT.md:216` | "Never Use" column in naming convention table | ACCEPTABLE — showing what NOT to use |
| "AI Assistant" | `12_BRANDING.md:130` | "Don't" column in tone examples table | ACCEPTABLE — showing what NOT to use |

**No prohibited terms found in user-facing labels, wireframes, button text, navigation items, or screen headings.**

All explanatory text that mentions "AI" (e.g., "The AI does not dominate") is in English documentation prose, not in generated UI labels.

---

## 6. Wireframe Consistency

### 05_HOME.md — Written description vs. wireframe

- Description: "Six stat cards" → Wireframe: 6-column table with 6 cards ✓
- Description: "Two-column layout (70/30)" → Wireframe: Shows left/right split ✓

### 06_CASE_WORKFLOW.md — Lifecycle diagram vs. phase screens

- Lifecycle: Posteingang → Prüfung → Entscheidungsunterstützung → Entwurf → Genehmigung → Versand → Archiv
- Individual screen wireframes: Match the lifecycle phases ✓

### 07_KNOWLEDGE.md — Search tabs vs. search scope table

- Tabs in wireframe: `[ Alles ] Vorschriften Verfahren Vorlagen FAQs Fälle Bürger Dokumente`
- Search scope table below: Lists 7 categories (Vorschriften, Verfahren, Vorlagen, FAQs, Fälle, Bürger, Dokumente) ✓
- **BUT:** The tabs include "Alles" which is not in the scope table. This is intentional (Alles = search all categories). ✓

### 00_USER_JOURNEY.md — Home dashboard wireframe

- Wireframe shows 6-column stat cards ✓ (matches 05_HOME.md)
- Wireframe shows 70/30 split layout ✓ (matches 05_HOME.md)

### 03_AUTHENTICATION.md — Login wireframe

- Wireframe shows municipality logo, email, password, "Angemeldet bleiben", login button, forgot password, language selector, version ✓

**No wireframe/description contradictions found.**

---

## 7. Sample Data Consistency

### Cross-file name consistency

| Name | 16_SAMPLE_DATA.md | 05_HOME.md | 06_CASE_WORKFLOW.md | 07_KNOWLEDGE.md | 09_AI_ASSISTANT.md |
|---|---|---|---|---|---|
| Sabine Müller | ✓ (primary) | — | ✓ (9 refs) | — | — |
| Thomas Becker | ✓ | ✓ | ✓ | ✓ (2 refs) | — |
| Dr. Andreas Schmidt | ✓ | — | ✓ (1 ref) | — | — |
| Petra Wagner | ✓ | — | — | — | — |
| Thomas Krüger | ✓ | — | — | — | — |

### Login screen demo user — ISSUE FOUND

`00_USER_JOURNEY.md:26` uses `max.mustermann@stadt-essen.de`. This user does not exist in `16_SAMPLE_DATA.md`. All sample data users have real names (sabine.mueller, petra.wagner, etc.).

**Recommended correction:** Change `max.mustermann@stadt-essen.de` to `sabine.mueller@stadt-essen.de` in `00_USER_JOURNEY.md` (lines 26, 387).

**Severity:** LOW.

### Case numbers

All case numbers across wireframe files (`05_HOME.md`, `06_CASE_WORKFLOW.md`, `07_KNOWLEDGE.md`, `09_AI_ASSISTANT.md`) match the `FACH-YYYY-NNNN` convention documented in `06_CASE_WORKFLOW.md:30-38` and populated in `16_SAMPLE_DATA.md`.

19 unique case numbers verified: BAU-2026 (7), VERG-2026 (2), PERS-2026 (1), BÜRG-2026 (5), ALLG-2026 (1), BAU-2025 (1), BAU-2024 (1), BÜRG-2025 (1). All consistent.

### Document titles

Documents referenced in wireframes (BauO NRW 2024, AV zu §55 LHO, BauGB 2024, etc.) match the documents defined in `16_SAMPLE_DATA.md`. Verified. ✓

---

## 8. Google Stitch Readiness

### What Stitch Has Sufficient Information For

| Element | Files | Status |
|---|---|---|
| Navigation structure | `04_NAVIGATION.md`, `15_STITCH_PROMPT.md` | SUFFICIENT |
| Screen layouts (all major screens) | `05_HOME.md` through `10_ADMIN.md`, `03_AUTHENTICATION.md` | SUFFICIENT |
| Component library | `11_COMPONENTS.md` | SUFFICIENT |
| Color palette | `12_BRANDING.md`, `14_DESIGN_SYSTEM.md` | SUFFICIENT |
| Typography | `12_BRANDING.md`, `14_DESIGN_SYSTEM.md` | SUFFICIENT |
| Spacing scale | `11_COMPONENTS.md`, `14_DESIGN_SYSTEM.md` | SUFFICIENT |
| Button styles | `11_COMPONENTS.md`, `14_DESIGN_SYSTEM.md` | SUFFICIENT |
| Form elements | `11_COMPONENTS.md`, `14_DESIGN_SYSTEM.md` | SUFFICIENT |
| Table styles | `11_COMPONENTS.md`, `14_DESIGN_SYSTEM.md` | SUFFICIENT |
| Badges and status indicators | `11_COMPONENTS.md` | SUFFICIENT |
| Icons | `11_COMPONENTS.md` (Phosphor Icons, 24px) | SUFFICIENT |
| Toast notifications | `11_COMPONENTS.md`, `14_DESIGN_SYSTEM.md` | SUFFICIENT |
| Dialogs | `11_COMPONENTS.md` | SUFFICIENT |
| Loading states (skeleton, spinner, progress) | `11_COMPONENTS.md` | SUFFICIENT |
| Empty states | `00_USER_JOURNEY.md`, individual screen files | SUFFICIENT |
| Error states (401, 403, 404, 500, unavailable) | `00_USER_JOURNEY.md`, `09_AI_ASSISTANT.md` | SUFFICIENT |
| Sample data (realistic German content) | `16_SAMPLE_DATA.md` | SUFFICIENT |
| API endpoint mappings | `13_API_SUMMARY.md` | SUFFICIENT |
| Accessibility requirements | `12_BRANDING.md`, `14_DESIGN_SYSTEM.md`, `11_COMPONENTS.md` | SUFFICIENT |
| Keyboard focus order | `11_COMPONENTS.md` | SUFFICIENT |
| Responsive breakpoints | `04_NAVIGATION.md` | SUFFICIENT |
| Notification bell dropdown | `04_NAVIGATION.md`, `11_COMPONENTS.md` | SUFFICIENT |
| Case numbering convention | `06_CASE_WORKFLOW.md` | SUFFICIENT |
| Supervisor view | `05_HOME.md` | SUFFICIENT |

### What Stitch May Need Clarification On

| Gap | Severity | Mitigation |
|---|---|---|
| Wissen sub-tab mismatch (see Section 2) | MEDIUM | Stitch might generate different tabs depending on which file it reads. Fix `04_NAVIGATION.md:75` to match `07_KNOWLEDGE.md:15`. |
| Demo login user doesn't match sample data | LOW | `max.mustermann` is orphaned. Minor cosmetic issue for mockup consistency. |
| Systemkonfiguration card has no sub-nav tab | LOW | Stitch might not know where to navigate from the Systemkonfiguration card. |

**No genuinely missing information that would prevent Stitch from generating a complete, consistent UI.**

---

## Summary

| Dimension | Issues Found | Severity |
|---|---|---|
| Cross-reference validation | 0 | — |
| Navigation consistency | 2 | 1 MEDIUM, 1 LOW |
| Screen inventory | 0 | — |
| API consistency | 0 | — |
| Terminology audit | 0 user-facing issues | — |
| Wireframe consistency | 0 | — |
| Sample data consistency | 1 | LOW |
| Stitch readiness | 0 blockers | — |

**Total: 3 issues (0 HIGH, 1 MEDIUM, 2 LOW)**

---

## Recommended Corrections

| # | Issue | Files | Severity |
|---|---|---|---|
| 1 | Wissen sub-tabs mismatch: `04_NAVIGATION.md` shows `Checklisten`; `07_KNOWLEDGE.md` and `15_STITCH_PROMPT.md` show `Fälle Bürger Dokumente`. Sync to `07_KNOWLEDGE.md` version. | `04_NAVIGATION.md:75` | MEDIUM |
| 2 | Login demo user `max.mustermann@stadt-essen.de` does not exist in sample data. Replace with `sabine.mueller@stadt-essen.de`. | `00_USER_JOURNEY.md:26,387` | LOW |
| 3 | `Systemkonfiguration` card in `10_ADMIN.md` tool grid has no corresponding sub-navigation tab. Add to sub-nav or clarify as inline panel. | `04_NAVIGATION.md:87` or `10_ADMIN.md:53` | LOW |

---

## Final Verdict

The Design Pack is internally consistent and ready for Google Stitch, with 3 minor documentation inconsistencies that can be corrected in under 30 minutes. No blocking issues. No missing screens. No broken references. No contradictory API mappings. Terminology is clean in all user-facing text. Sample data is realistic and consistent. The Stitch prompt is self-contained and complete.
