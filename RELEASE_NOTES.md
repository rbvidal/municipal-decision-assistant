# Municipal Decision Assistant — SCCON Demonstration Edition

**Version 1.1.0** · July 2026

---

## What's New in the Demonstration Edition

This release transforms the Municipal Decision Assistant into a polished, ready-to-present demonstration application for Smart Country Convention (SCCON) 2026.

### Redesigned Landing Page
The landing page now immediately communicates the application's purpose: an AI-powered knowledge assistant for public administration. Three domain cards — Building & Urban Planning, Public Procurement, and Human Resources — provide one-click entry into each demonstration workspace.

### Three Pre-Loaded Demo Workspaces
The application starts with three fully indexed workspaces:
- **Building & Urban Planning** — 8 documents covering BauO Bln, BauGB, BauNVO, BauVorlV 2025, Schneller-Bauen-Gesetz
- **Public Procurement** — 6 documents covering GWB, VgV, UVgO, BerlAVG, AV §55 LHO, eVergabe
- **Human Resources** — 10 documents covering TV-L 2025, BRKG, LRKG, Urlaubsverordnung, mobile work, IT security, working time

### Example Questions — "Try These Questions"
Each workspace provides 10 ready-to-click example questions. Visitors never need to think about what to ask — one click executes the query and displays a fully grounded answer. Questions range from simple lookups to complex cross-domain legal reasoning.

### Enhanced Answer Presentation
Every answer now displays:
- **Answer** — The AI-generated response with proper paragraph formatting
- **Confidence score** — Color-coded (green/yellow/red) with percentage
- **Retrieval strategy** — How the system found the answer (keyword, semantic, hybrid)
- **Source count** — How many documents were searched and used
- **Processing time** — In milliseconds, showing real-time performance
- **Retrieved sources** — Click any source to open the original document with highlighted passage

### Document Preview with Highlighting
Clicking a source citation opens the original document viewer. The relevant passage is highlighted and scrolled into view. Document metadata (type, authority, version, status) is displayed alongside the text.

### Related Documents
The sidebar displays related regulations, procedures, forms, and manuals that complement the current answer — providing a complete picture of the administrative context.

### Visual Polish
Complete CSS redesign with professional typography (Inter), Berlin-inspired color palette, card-based layouts, animated loading states, empty-state screens, and responsive design. The application looks like enterprise software.

### Five-Minute Demo Script
A complete demonstration guide (`DEMO_GUIDE.md`) provides a timed, minute-by-minute script for presenters, including backup demos and troubleshooting.

### Self-Contained Demo Data
Demo data seeds automatically on first startup — no manual upload or indexing required. Three workspaces with 20 documents and pre-computed search chunks. Idempotent: subsequent startups detect existing data and skip seeding.

---

## Architecture (Unchanged)

The underlying Enterprise AI Platform architecture is preserved:
- 9 Maven modules with compile-time dependency boundaries
- Multi-provider AI orchestration (Ollama + OpenAI-compatible)
- Hybrid retrieval: keyword + vector (Qdrant) + graph (Neo4j)
- GraphRAG with relationship-aware discovery
- Automated evaluation on every answer
- Immutable audit log
- Graceful degradation — every external dependency optional

---

## Build & Run

```bash
git clone https://github.com/cognitera/municipal-decision-assistant
cd municipal-decision-assistant

docker compose up -d
docker compose --profile graph up -d

mvn spring-boot:run -pl platform-api
```

Open `http://localhost:8080`. Demo data seeds automatically on first startup.

**Requirements:** Java 21, Maven 3.x, Docker, Ollama (optional for semantic search)

---

## What Was NOT Changed

- All 9 Maven modules remain structurally unchanged
- All SPI interfaces unchanged
- All REST API endpoints unchanged  
- Database schema unchanged
- Prompt Registry preserved
- Workflow Engine preserved
- GraphRAG implementation preserved
- Retrieval pipeline preserved

---

## Demo-Only Features (Not for Production)

- Demo data is seeded in-memory via JPA repositories (bypasses the ingestion pipeline)
- Example questions are hardcoded in `AiPageController.java` (should come from a configuration file or database in production)
- Workspace domain metadata uses a static map (should use a workspace metadata service)
- Document chunks are created without vector embeddings (keyword-only search). For full semantic search, run Ollama and use the standard upload + ingestion flow.

---

## Files Changed

| File | Change |
|------|--------|
| `platform.css` | Complete redesign — enterprise visual language |
| `dashboard.html` | Redesigned as municipal landing page with domain cards |
| `fragments/layout.html` | Updated navigation with simplified links |
| `ai/index.html` | Major redesign — example questions panel, enhanced answer display, explainability bar |
| `AiPageController.java` | Enhanced with workspace context, example questions, enhanced answer formatting, related documents |
| `DashboardController.java` | Added workspace count to dashboard |
| `DemoDataInitializer.java` | **NEW** — Seeds 3 workspaces with 20 pre-indexed documents on first startup |
| `DEMO_GUIDE.md` | **NEW** — Complete 5-minute SCCON presentation script |
| `RELEASE_NOTES.md` | Updated for SCCON Demonstration Edition |

---

**Municipal Decision Assistant v1.1.0** — SCCON Demonstration Edition
