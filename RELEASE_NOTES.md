# Release Notes — v1.0.0-RC1

**Release Candidate 1 | 2026-07-23**

The first public release candidate of the Municipal Decision Assistant — an AI-powered decision support platform for German municipal administrations.

---

## Highlights

### Hybrid Search
Semantic + keyword + graph retrieval with relevance ranking, citations, and pagination. Searches across all indexed municipal document corpora.

### Evidence-Grounded AI
Dual-path AI reasoning: structured rule engine for deterministic decisions (procurement thresholds, salary tables, travel allowances) and hybrid retrieval for evidence-based reasoning over document corpora.

### Rule Engine
Deterministic evaluation of procurement procedures, salary grades, travel allowances, and administrative fees. Pre-loaded with Berlin procurement thresholds (AV §55 LHO), TV-L 2025 salary tables, and BRKG travel regulations.

### Document Ingestion
Full document lifecycle: upload, chunking, embedding generation, Qdrant vector indexing. Supports PDF, DOCX, TXT, HTML. Versioning and archival.

### Knowledge Search
Search and browse the municipal knowledge base. Backed by the production hybrid retrieval pipeline with document metadata enrichment.

### Audit
All platform operations (search, document, authentication, AI inference) are persisted to an audit log. Queryable via admin interface with role-based access control.

### Workspace
Case workspace management with workflow phases, document attachment, checklist, timeline, notes, and AI decision support tab.

### Administration
System health monitoring, ingestion job tracking, corpus health dashboard, audit log viewer. All administrative endpoints require ADMIN role.

---

## Known Limitations

| Limitation | Impact | Target |
|-----------|--------|--------|
| **Dashboard** | Home page shows "Dashboard nicht verfügbar" error state. Real aggregation service deferred. | Future release |
| **Search Sorting** | Results ordered by retrieval ranking. No user-configurable sort by date, title, or relevance. | Future release |
| **Document Type Semantics** | Knowledge page uses file-based labels ("Dokument (PDF)") rather than semantic types ("Vorschrift", "Gesetz"). Document model lacks semantic classification. | Future release |
| **Workspace Draft/Send Tabs** | Placeholder content ("wird in einer späteren Phase implementiert"). | Future release |
| **CPU/Session Metrics** | Admin health endpoint reports hardcoded `cpuUsage: 0` and `activeSessions: 1`. JVM does not expose these natively. | Future release (via external monitoring) |

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Java | JDK 21 | JDK 21 |
| Maven | 3.9+ | 3.9+ |
| Node.js | 18+ | 22+ |
| PostgreSQL | 16 with pgvector | 16 with pgvector |
| Qdrant | Latest | Latest |
| Ollama | Latest (optional) | Latest with embedding + chat models |
| Neo4j | 5 Community | 5 Community (optional, for graph search) |

---

## Installation

### Docker (Recommended for Production)
```bash
cp .env.example .env
# Edit .env with your credentials
docker compose -f docker-compose-prod.yml build
docker compose -f docker-compose-prod.yml up -d
```

### Local Development
```bash
# Windows
start-dev.bat

# The application will be available at http://localhost:5173
# Backend API at http://localhost:8080
```

### Production Demo (Single Server)
```bash
start-prod.bat
# Opens http://localhost:8080
# React frontend served from the Spring Boot JAR
```

---

## Configuration

All secrets are externalized via environment variables. See `.env.example` for the complete list.

Production deployment requires the `prod` Spring profile, which enables:
- Flyway database migrations
- `ddl-auto: validate` (no automatic schema changes)
- SSL/TLS (requires keystore)
- Restricted health endpoint details
- INFO-level logging

The Docker Compose production file activates this profile automatically. The `start-prod.bat` script passes `--spring.profiles.active=prod`.

---

## Documentation

- [Architecture Handbook](docs/Architecture-Handbook.md)
- [Developer Guide](docs/Developer-Guide.md)
- [API Reference](docs/API_REFERENCE.md)
- [Operations Manual](docs/OPERATIONS_MANUAL.md)
- [Incident Playbook](docs/INCIDENT_PLAYBOOK.md)

---

## Support

This is a Release Candidate. For issues, bug reports, or feedback, contact the development team.
