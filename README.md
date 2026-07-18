# Municipal Decision Assistant

**AI-powered decision support for municipal administrations** — semantic search, deterministic rule evaluation, and evidence-based reasoning for German municipal documents.

**Java 21 · Spring Boot 3.3 · React 19 · 9 Modules · 540+ Tests**

---

## Quick Start

```bash
git clone https://github.com/rbvidal/municipal-decision-assistant
cd municipal-decision-assistant

# Start infrastructure (PostgreSQL + Qdrant + Neo4j)
docker compose up -d

# Build all modules
mvn clean install -DskipTests

# Start backend
mvn spring-boot:run -pl platform-api

# Start frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173` (React SPA) or `http://localhost:8080` (Thymeleaf).

**Prerequisites:** Java 21, Maven 3.9+, Node.js 22+, Docker, Ollama (optional — for local LLM).

---

## Architecture

```
platform-api              REST controllers, Spring Boot assembly, DTOs
platform-ai               LLM orchestration, RuleEngine, DecisionRouter, knowledge tables
platform-search           Hybrid retrieval (keyword + vector fusion), citations
platform-document         Document lifecycle, ingestion pipeline, versioning
platform-neo4j            Knowledge graph (optional, gracefully degraded)
platform-workspace        Case/workspace management, timeline, document linking
platform-observability    Micrometer metrics, Prometheus, OTel tracing, health
platform-auth             JWT authentication, BCrypt, RBAC
platform-audit            Immutable audit event log
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [VERSION_1_0_FINAL.md](VERSION_1_0_FINAL.md) | Executive summary, features, limitations, release decision |
| [Architecture Handbook](docs/Architecture-Handbook.md) | Design philosophy, architecture decisions, trade-offs |
| [Developer Guide](docs/Developer-Guide.md) | Build, run, extend, test, debug, contribute |
| [API Reference](docs/API_REFERENCE.md) | 35+ REST endpoints with request/response schemas |
| [Operations Manual](docs/OPERATIONS_MANUAL.md) | Startup, monitoring, backup, upgrade, rollback |
| [Incident Playbook](docs/INCIDENT_PLAYBOOK.md) | 8 scenarios: symptoms → diagnosis → resolution |
| [Release Audit](docs/RELEASE_AUDIT_REPORT.md) | Full v1.0 release verification |
| [Implementation Sequence](docs/IMPLEMENTATION_SEQUENCE.md) | 12-slice roadmap with 78 tasks |

---

## Testing

```bash
mvn test                       # ~540 backend tests
cd frontend && npm test        # Vitest component tests
k6 run k6-scripts/smoke-test.js  # Performance baseline
npx playwright test            # E2E browser tests
```

---

## Production Deployment

```bash
cp .env.example .env          # Configure secrets
docker compose -f docker-compose-prod.yml up -d
curl http://localhost:8080/actuator/health
```

---

## License

**[Apache License 2.0](LICENSE)**
