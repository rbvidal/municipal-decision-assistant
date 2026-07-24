# Municipal Decision Assistant

**AI-powered decision support for German municipal administrations.**

Semantic search, deterministic rule evaluation, and evidence-based reasoning over municipal document corpora — procurement, building regulations, administrative directives, and more.

**Java 21 · Spring Boot 3.3 · React 19 · PostgreSQL/pgvector · Qdrant · Ollama · Neo4j**

---

## Quick Start

### One-Click Development

Double-click `start-dev.bat`. Wait 60 seconds. Open http://localhost:5173.

The script automatically:
- Verifies Java, Maven, Node.js, Docker
- Installs frontend dependencies if missing
- Creates `.env` from `.env.example` if absent
- Starts PostgreSQL, Qdrant, and Neo4j
- Starts Spring Boot (port 8080) and Vite dev server (port 5173)

### Production Demo

Double-click `start-prod.bat`. Open http://localhost:8080.

Builds the frontend, embeds it into Spring Boot, and starts everything as a single server — no Vite, no separate frontend process.

### Docker

```bash
docker compose -f docker-compose-prod.yml up -d
```

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Java JDK | 21+ | `java -version` |
| Maven | 3.9+ | `mvn --version` |
| Node.js | 22+ | `node -v` |
| Docker | with Compose | `docker compose version` |
| Ollama | latest | `ollama list` |

### AI Features

The application works without Ollama. AI features (RAG, decision support) are automatically disabled when Ollama is unavailable. The health dashboard at `http://localhost:8080/actuator/health` shows provider status.

To enable AI:
1. Install [Ollama](https://ollama.com)
2. Pull the required models:
   ```bash
   ollama pull qwen2.5:14b
   ollama pull nomic-embed-text
   ```
3. Restart the application

Everything else — document management, search, workspaces, user administration — works without AI.

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    React SPA (frontend/)                    │
│              TypeScript · Vite · react-query                │
├────────────────────────────────────────────────────────────┤
│              Spring Boot API (platform-api)                 │
│         REST controllers · DTOs · WebConfig · CSP           │
├──────────┬──────────┬──────────┬──────────┬───────────────┤
│ platform-│ platform-│ platform-│ platform-│ platform-      │
│ auth     │ document │ search   │ ai       │ workspace      │
│ JWT/RBAC │ ingest   │ hybrid   │ RAG/LLM  │ cases/phases   │
├──────────┼──────────┼──────────┼──────────┼───────────────┤
│ platform-│ platform-│ platform-│          │                │
│ audit    │ neo4j    │ observ   │          │                │
│ events   │ graph    │ metrics  │          │                │
└──────────┴──────────┴──────────┴──────────┴───────────────┘
```

---

## RAG Pipeline

```
Document Upload → Chunking → Embeddings (nomic-embed-text)
    → Qdrant (768d Cosine) → Hybrid Retrieval
    → LLM (qwen2.5:14b) → Grounded Answer → Citations
```

Verified end-to-end with a newly uploaded document. See [RELEASE_NOTES.md](RELEASE_NOTES.md) for the full RAG demonstration.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Architecture Handbook](docs/Architecture-Handbook.md) | Design philosophy, decisions, trade-offs |
| [Developer Guide](docs/Developer-Guide.md) | Build, run, extend, test, debug |
| [API Reference](docs/API_REFERENCE.md) | 25+ REST endpoints with schemas |
| [Operations Manual](docs/OPERATIONS_MANUAL.md) | Startup, monitoring, backup, upgrade |
| [Incident Playbook](docs/INCIDENT_PLAYBOOK.md) | 8 scenarios: symptoms → diagnosis → resolution |
| [Release Notes](RELEASE_NOTES.md) | Version history and RAG evidence |
| [Deployment Guide](docs/IMPLEMENTATION_SEQUENCE.md) | Production deployment steps |

---

## Testing

```bash
mvn test                          # Backend tests
cd frontend && npm test           # Vitest component tests
cd e2e-tests && npm install && npx playwright test   # E2E browser tests
```

---

## Configuration

Copy `.env.example` to `.env` (done automatically by startup scripts). Key variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `AUTH_JWT_SECRET` | (required) | HMAC-SHA256 signing key, ≥32 chars |
| `OLLAMA_CHAT_MODEL` | `qwen2.5:14b` | LLM model for RAG |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `QDRANT_ENABLED` | `false` (`true` in dev/Compose) | Enables Qdrant vector search |
| `QDRANT_HOST` | `localhost` | Qdrant vector DB host |
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j graph DB |

---

## License

[Apache License 2.0](LICENSE)
