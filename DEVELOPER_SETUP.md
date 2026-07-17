# Developer Setup — Municipal Decision Assistant

**Version:** 1.0
**Last verified:** 2026-07-17

## Prerequisites

| Tool | Minimum Version | How to Check |
|---|---|---|
| Java (Temurin) | 21 | `java -version` |
| Maven | 3.9 | `mvn --version` |
| Node.js | 24 | `node --version` |
| npm | 11 | `npm --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | v2 | `docker compose version` |
| Ollama (optional) | latest | `ollama --version` |

## One-Time Setup

**Prerequisite:** Docker must be running. Start Docker Desktop before proceeding.

```bash
# 1. Clone the repository
git clone https://github.com/rbvidal/municipal-decision-assistant
cd municipal-decision-assistant

# 2. Start all infrastructure services
docker compose up -d

# 3. Wait for all services to be healthy
docker compose ps
# All services should show "healthy" or "running"

# 4. Pull Ollama models (optional — only if using local LLM)
ollama pull qwen2.5:14b
ollama pull nomic-embed-text

# 5. Build all Maven modules (skip integration tests if Docker is not running)
mvn clean install -DskipTests

# 6. Install frontend dependencies
cd frontend
npm install
```

## Daily Development Workflow

### With Docker running (full stack)

### Terminal 1 — Backend
```bash
cd municipal-decision-assistant
docker compose up -d            # Ensure infrastructure is running
mvn spring-boot:run -pl platform-api
```

### Terminal 2 — Frontend
```bash
cd municipal-decision-assistant/frontend
npm run dev
```

### Terminal 3 — Tests & Git
```bash
cd municipal-decision-assistant

# Backend tests (unit tests only — fast, no Docker needed)
mvn test -pl platform-ai

# Backend tests (integration tests — requires Docker)
mvn test -pl platform-api

# Full build with all tests (requires Docker)
mvn clean install

# Full build skipping integration tests (no Docker needed)
mvn clean install -DskipTests

# Frontend tests
cd frontend && npm test
```

## Access Points

| Service | URL | Credentials |
|---|---|---|
| React Frontend | http://localhost:5173 | — |
| Thymeleaf UI | http://localhost:8080 | — |
| Backend API | http://localhost:8080/api | — |
| Actuator Health | http://localhost:8080/actuator/health | — |
| pgAdmin | http://localhost:5050 | admin@cognitera.local / admin |
| Qdrant REST | http://localhost:6333 | — |
| Qdrant Dashboard | http://localhost:6333/dashboard | — |
| Neo4j Browser | http://localhost:7474 | neo4j / password |
| Ollama API | http://localhost:11434 | — |

## Environment Variables

All variables have sensible defaults for local development. Override via `.env` file or shell environment.

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/municipal_decision_assistant` | PostgreSQL connection |
| `DB_USERNAME` | `platform` | Database user |
| `DB_PASSWORD` | `platform` | Database password |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API |
| `OLLAMA_CHAT_MODEL` | `qwen2.5:14b` | LLM model for chat |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Model for embeddings |
| `QDRANT_HOST` | `localhost` | Qdrant host |
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j connection |
| `AUTH_JWT_SECRET` | *(dev default)* | JWT signing secret (change in production!) |

## Troubleshooting

### Docker is not running
The platform requires Docker for PostgreSQL (pgvector), Qdrant, and Neo4j. Without Docker:
- Backend will not start (needs PostgreSQL)
- Integration tests will fail (needs Qdrant, PostgreSQL)
- You can still build: `mvn clean install -DskipTests`
- You can still build the frontend: `cd frontend && npm run build`

### Docker services fail to start
```bash
docker compose down -v    # Remove volumes and start fresh
docker compose up -d
```

### Maven build fails with dependency errors
```bash
mvn clean install -DskipTests -U   # Force update snapshots
```

### Frontend can't connect to backend
Verify backend is running and the port matches:
```bash
curl http://localhost:8080/actuator/health
```

### Port conflicts
Check for processes using the required ports:
```bash
# Windows
netstat -ano | findstr "8080 5173 5433 6333 7687 7474 5050 11434"

# Linux/Mac
lsof -i :8080 :5173 :5433 :6333 :7687 :7474 :5050 :11434
```

### Ollama models not pulled
```bash
ollama list                     # Check installed models
ollama pull qwen2.5:14b         # Pull if missing
ollama pull nomic-embed-text    # Pull if missing
```

### Database tables missing
The application uses `ddl-auto: update` in development. Tables are created automatically on first startup. If tables are missing:
```bash
# Restart the backend — Hibernate will create/update schema
mvn spring-boot:run -pl platform-api
```
