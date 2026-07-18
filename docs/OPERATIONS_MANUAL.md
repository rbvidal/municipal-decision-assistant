# Municipal Decision Assistant — Operations Manual

Version 1.0. For pilot municipality IT operations teams.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   Browser (React SPA)                │
└─────────────────────┬────────────────────────────────┘
                      │ HTTPS :443 (prod) / HTTP :8080
┌─────────────────────▼────────────────────────────────┐
│              Spring Boot (platform-api)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ Auth JWT │ │Decision  │ │  Document Ingestion  │  │
│  │ (HS256)  │ │ Engine   │ │  (PDF/DOCX/TXT)     │  │
│  └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ Search   │ │Workspace │ │  Admin / Knowledge   │  │
│  │ (Hybrid) │ │ Manager  │ │  Table Reload        │  │
│  └──────────┘ └──────────┘ └──────────────────────┘  │
└──┬──────────┬──────────┬──────────┬──────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│PostgreSQL│ Qdrant│  Neo4j│  Ollama  │
│+pgvector│(Vector│(Graph)│  (LLM +  │
│        │ Search)│       │ Embedding)│
└──────┘ └──────┘ └──────┘ └──────────┘
```

**Module architecture:** 9 Maven modules — `platform-audit` (immutable audit log), `platform-auth` (JWT/RBAC), `platform-document` (lifecycle/ingestion), `platform-search` (hybrid retrieval), `platform-ai` (LLM orchestration), `platform-neo4j` (knowledge graph), `platform-workspace` (case management), `platform-observability` (metrics/tracing/health), `platform-api` (REST controllers + Spring Boot assembly).

---

## Startup Procedure

### Development
```bash
# Start infrastructure
docker compose up -d postgres qdrant

# Start Ollama (separate process or Docker)
ollama serve
ollama pull qwen2.5:14b
ollama pull nomic-embed-text

# Start application
mvn spring-boot:run -pl platform-api -Dspring-boot.run.profiles=dev
```

### Production
```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with production secrets

# 2. Start full stack
docker compose -f docker-compose-prod.yml up -d

# 3. Verify
curl http://localhost:8080/actuator/health
docker compose -f docker-compose-prod.yml ps
```

---

## Shutdown Procedure

### Production
```bash
# Graceful shutdown (30s timeout)
docker compose -f docker-compose-prod.yml stop

# Full shutdown (remove containers, keep volumes)
docker compose -f docker-compose-prod.yml down

# Emergency stop
docker compose -f docker-compose-prod.yml down --timeout 10
```

---

## Monitoring

### Health Endpoints
| Endpoint | Purpose |
|----------|---------|
| `GET /actuator/health` | Aggregated status (UP/DEGRADED/DOWN) |
| `GET /actuator/health/liveness` | Application alive |
| `GET /actuator/health/readiness` | Ready for traffic |
| `GET /actuator/metrics` | All Micrometer metrics |
| `GET /actuator/prometheus` | Prometheus scrape endpoint |

### Key Metrics (Prometheus)
- `http_server_requests_seconds_count` — request count
- `http_server_requests_seconds_sum` — total response time
- `jvm_memory_used_bytes` — heap usage
- `jvm_gc_pause_seconds_sum` — GC pause time
- `ingestion_jobs_total` — ingestion job count
- `retrieval_duration_seconds` — search latency

### Tracing (Jaeger)
Access traces at `http://localhost:16686` (when Jaeger is enabled via `--profile full`).
Custom spans: `decision.pipeline`, `retrieval.hybrid`, `rule.engine.evaluate`.

---

## Alerting

The `CorpusHealthAlertScheduler` runs hourly and logs warnings for:
- Embedding coverage <90%
- Missing Qdrant vectors
- Failed extraction/indexing
- Missing manifest documents

Check logs: `docker logs mda-app | grep "HEALTH ALERT"`

---

## Backup

### Automated backup (cron)
```bash
# Daily at 2 AM
0 2 * * * /path/to/scripts/backup-all.sh /path/to/backups
```

### Manual backup
```bash
./scripts/backup-postgres.sh ./backups
./scripts/backup-qdrant.sh ./backups
```

### Restore
```bash
# PostgreSQL
./scripts/restore-postgres.sh ./backups/mda-pg-20260718-020000.sql.gz

# Qdrant
./scripts/restore-qdrant.sh mda_chunks-20260718-030000.snapshot
```

---

## Upgrade Procedure

```bash
# 1. Pull latest
git pull origin master

# 2. Backup
./scripts/backup-all.sh

# 3. Rebuild and restart
docker compose -f docker-compose-prod.yml build app
docker compose -f docker-compose-prod.yml up -d app

# 4. Verify
curl http://localhost:8080/actuator/health
```

---

## Rollback Procedure

```bash
# 1. Stop current version
docker compose -f docker-compose-prod.yml stop app

# 2. Restore database if needed
./scripts/restore-postgres.sh ./backups/<backup-file>

# 3. Deploy previous version
docker compose -f docker-compose-prod.yml up -d app

# 4. Verify
curl http://localhost:8080/actuator/health
```

---

## Troubleshooting (Top 10 Issues)

1. **App won't start** — Check `docker logs mda-app`. Verify `.env` secrets. Check DB connectivity.
2. **Search returns no results** — Check Qdrant health. Verify embeddings exist via `/admin/corpus/health`.
3. **Database connection failure** — Check `docker compose ps postgres`. Verify `DB_URL` in `.env`.
4. **High latency** — Check `docker stats`. Verify Ollama responsiveness.
5. **Auth failure** — Check `AUTH_JWT_SECRET` length (≥32). Check user `enabled`/`locked` in DB.
6. **Disk full** — `df -h`. Clean old backups, Docker images, logs.
7. **Ingestion stuck** — Check Ollama. Restart ingestion worker: restart app container.
8. **OOM kill** — Check `docker inspect mda-app | grep -i oom`. Increase memory limit.
9. **Flyway migration failure** — Check `flyway_schema_history` table. Verify DB user has DDL permissions.
10. **CORS/Network errors** — Check CSP headers. Verify frontend `VITE_API_BASE_URL` points to backend.

---

## Log Access

```bash
# Application logs
docker logs mda-app --tail 200 -f

# Infrastructure logs
docker compose logs postgres --tail 50
docker compose logs qdrant --tail 50

# Production JSON logs (with trace_id/span_id)
docker logs mda-app | jq '.'
```

---

## Port Reference

| Service | Port (host) | Port (container) | External? |
|---------|-------------|-------------------|-----------|
| App | 8080 | 8080 | Yes |
| PostgreSQL | 5433 | 5432 | Dev only |
| Qdrant REST | 6333 | 6333 | Dev only |
| Qdrant gRPC | 6334 | 6334 | Dev only |
| Neo4j HTTP | 7474 | 7474 | Dev only |
| Neo4j Bolt | 7687 | 7687 | No |
| pgAdmin | 5050 | 80 | Dev only |
| Jaeger UI | 16686 | 16686 | Dev only |
