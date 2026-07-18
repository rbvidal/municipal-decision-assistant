# Municipal Decision Assistant — Incident Playbook

Production operations guide for the Municipal Decision Assistant platform.
8 incident scenarios with symptoms, diagnosis, mitigation, and resolution procedures.

---

## Scenario 1: Application Won't Start

**Symptoms:**
- `docker compose up` fails or container exits immediately
- Health check fails after 40s start period
- `docker logs mda-app` shows connection errors

**Diagnosis:**
1. Check container status: `docker compose -f docker-compose-prod.yml ps`
2. Check app logs: `docker logs mda-app --tail 100`
3. Check if infrastructure is healthy: `docker compose ps postgres qdrant`
4. Verify environment variables are set: `docker compose config`
5. Check database connectivity: `docker exec mda-postgres pg_isready -U platform`

**Mitigation (immediate):**
- Restart: `docker compose -f docker-compose-prod.yml restart app`
- If dependency failure: `docker compose restart postgres qdrant && sleep 10 && docker compose restart app`

**Resolution (permanent):**
- Verify `.env` contains all required variables from `.env.example`
- Check `AUTH_JWT_SECRET` is at least 32 characters
- Check database connection string matches Docker network hostnames
- Verify PostgreSQL port: inside Docker network it's 5432 (not 5433)

---

## Scenario 2: Search Returns No Results

**Symptoms:**
- Search queries return empty results or very low relevance scores
- `/admin/corpus-health` shows zero Qdrant vectors
- Users report "Keine Ergebnisse" for known-indexed documents

**Diagnosis:**
1. Check Qdrant health: `curl http://localhost:6333/health`
2. Check collection exists: `curl http://localhost:6333/collections`
3. Check vector count: `curl http://localhost:6333/collections/mda_chunks`
4. Check app logs for Qdrant errors: `docker logs mda-app | grep -i qdrant`
5. Verify corpus health: `curl http://localhost:8080/api/admin/corpus/health`

**Mitigation (immediate):**
- Restart Qdrant: `docker compose restart qdrant`
- Trigger reindex of a document via Admin UI or `POST /api/documents/{id}/reindex`
- Trigger manifest batch import: `POST /api/documents/manifest-import`

**Resolution (permanent):**
- Check disk space on Qdrant volume: `docker exec mda-qdrant df -h /qdrant/storage`
- If disk full: expand volume or clean old snapshots
- Recreate collection if corrupted: stop app, delete Qdrant collection, re-import documents
- Check embedding model availability: `curl http://localhost:11434/api/tags`

---

## Scenario 3: Database Connection Failure

**Symptoms:**
- Application logs show `Connection refused` or `timeout` errors
- `/actuator/health` shows `db: DOWN`
- All API endpoints return 500 errors

**Diagnosis:**
1. Check PostgreSQL container: `docker compose ps postgres`
2. Check PostgreSQL logs: `docker logs mda-postgres --tail 50`
3. Test connectivity: `docker exec mda-postgres pg_isready -U platform`
4. Check disk space: `docker exec mda-postgres df -h /var/lib/postgresql/data`

**Mitigation (immediate):**
- Restart PostgreSQL: `docker compose restart postgres && sleep 5 && docker compose restart app`
- If disk full: `docker exec mda-postgres pg_dumpall -U platform > emergency_dump.sql`

**Resolution (permanent):**
- Increase disk: expand Docker volume or move to larger host
- Enable WAL archiving in `postgresql.conf` for point-in-time recovery
- Set up monitoring alert for disk usage >80%
- Verify `DB_PASSWORD` in `.env` has not been changed inadvertently

---

## Scenario 4: High Response Latency

**Symptoms:**
- API responses take >5 seconds
- Users report slow search or decision queries
- Prometheus `http_server_requests_seconds` p95 exceeds threshold

**Diagnosis:**
1. Check container resource usage: `docker stats --no-stream`
2. Check Ollama status: `curl http://localhost:11434/api/tags`
3. Check if ZGC is active: `docker logs mda-app | grep -i "gc"`
4. Check JVM heap: `curl http://localhost:8080/actuator/metrics/jvm.memory.used`
5. Check recent deployments: `git log --oneline -5`

**Mitigation (immediate):**
- Increase app container resources: raise memory limit in compose file
- Restart Ollama: `systemctl restart ollama` or restart container
- Scale down load: reduce concurrent users if under stress test

**Resolution (permanent):**
- Increase `JAVA_OPTS` memory: adjust `-XX:MaxRAMPercentage` upward
- Consider dedicated Ollama host if LLM inference is the bottleneck
- Enable query result caching for common queries
- Profile slow queries using `/actuator/metrics` and tracing spans in Jaeger

---

## Scenario 5: Authentication Failure (Users Cannot Log In)

**Symptoms:**
- Login returns 401 for all users including previously-working accounts
- Token refresh returns 401
- `POST /api/auth/login` returns error responses

**Diagnosis:**
1. Check app logs for auth errors: `docker logs mda-app | grep -i "auth\|jwt\|login"`
2. Verify JWT secret: `echo $AUTH_JWT_SECRET | wc -c` (must be ≥32)
3. Check database for users: `docker exec mda-postgres psql -U platform -d municipal_decision_assistant -c "SELECT email, enabled, locked FROM auth_users;"`
4. Test with curl: `curl -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"test@test.com","password":"test"}'`

**Mitigation (immediate):**
- If JWT secret changed: restart app so all tokens are re-issued consistently
- If user locked: `UPDATE auth_users SET locked=false WHERE email='user@example.com';`
- If user disabled: `UPDATE auth_users SET enabled=true WHERE email='user@example.com';`

**Resolution (permanent):**
- Never change `AUTH_JWT_SECRET` while users have active sessions
- Document secret rotation procedure with grace period
- Add admin endpoint to unlock users: `PUT /api/admin/users/{id}/unlock`

---

## Scenario 6: Disk Space Exhaustion

**Symptoms:**
- Application writes fail with "No space left on device"
- Docker containers show unhealthy
- Backup scripts fail
- PostgreSQL reports "could not write to file"

**Diagnosis:**
1. Check disk: `df -h`
2. Check Docker usage: `docker system df`
3. Find large files: `du -sh /var/lib/docker/volumes/*`
4. Check backup directory size: `du -sh ./backups`

**Mitigation (immediate):**
- Clean Docker: `docker system prune -a --volumes` (WARNING: deletes unused data)
- Remove old backups: `find ./backups -mtime +30 -delete`
- Remove old Docker images: `docker image prune -a`
- Truncate large log files: `truncate -s 0 /var/log/*.log`

**Resolution (permanent):**
- Set up log rotation for Docker containers
- Schedule automatic cleanup of old backups (already in backup scripts)
- Increase disk allocation for production host
- Set up disk usage monitoring alert at 80%

---

## Scenario 7: Document Ingestion Failure

**Symptoms:**
- Uploaded documents stuck in `PENDING` or `FAILED` status
- `/admin/corpus-health` shows documents without embeddings
- Ingestion job count increasing without completion

**Diagnosis:**
1. Check ingestion worker logs: `docker logs mda-app | grep -i "ingestion\|DocumentIngestionWorker"`
2. Check failed ingestion jobs: `GET /api/documents?status=FAILED`
3. Check Ollama availability: `curl http://localhost:11434/api/tags`
4. Check if embedding model is loaded: `curl http://localhost:11434/api/show -d '{"name":"nomic-embed-text"}'`

**Mitigation (immediate):**
- Restart Ollama: `systemctl restart ollama`
- Retry failed jobs: `POST /api/documents/{documentId}/reindex`
- Trigger batch reindex: restart app (ingestion worker polls automatically)

**Resolution (permanent):**
- Ensure Ollama starts before the application (add to compose `depends_on` or startup script)
- Add health check for Ollama embedding endpoint
- Increase ingestion poll interval if Ollama is under-provisioned
- Monitor `ingestion.jobs.total` and `ingestion.job.duration` metrics

---

## Scenario 8: Memory Exhaustion / OOM Kill

**Symptoms:**
- Application container restarts unexpectedly
- `docker logs mda-app` shows `ExitOnOutOfMemoryError` or `java.lang.OutOfMemoryError`
- Container exits with code 137 (SIGKILL from OOM killer)
- Happens during peak load or large document processing

**Diagnosis:**
1. Check container restart count: `docker compose ps` (look at "Restarts" column)
2. Check OOM kills: `docker inspect mda-app | grep -i oom`
3. Check JVM heap: `curl http://localhost:8080/actuator/metrics/jvm.memory.max`
4. Check which requests caused OOM: `docker logs mda-app --tail 200 | grep -B5 "OutOfMemory"`

**Mitigation (immediate):**
- Increase container memory limit in compose file: `memory: 4G`
- Restart with more headroom: `docker compose -f docker-compose-prod.yml up -d --force-recreate app`
- Temporarily disable non-critical services: `docker compose stop neo4j jaeger`

**Resolution (permanent):**
- Set `-XX:MaxRAMPercentage=75.0` (already configured in Dockerfile)
- Profile heap usage with `jcmd` or heap dump on OOM
- Add `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heapdump.hprof`
- Consider vertical scaling: increase host memory
- Consider separating Ollama to a dedicated host to reduce contention

---

## Quick Reference Commands

```bash
# Application status
docker compose -f docker-compose-prod.yml ps
docker logs mda-app --tail 100 -f
curl http://localhost:8080/actuator/health

# Infrastructure status
docker compose ps postgres qdrant neo4j
docker exec mda-postgres pg_isready -U platform
curl http://localhost:6333/health
curl http://localhost:7474

# Restart services
docker compose -f docker-compose-prod.yml restart app
docker compose -f docker-compose-prod.yml down && docker compose -f docker-compose-prod.yml up -d

# Backup
./scripts/backup-all.sh
ls -lh ./backups/

# Database queries
docker exec mda-postgres psql -U platform -d municipal_decision_assistant \
  -c "SELECT count(*) FROM auth_users;"
docker exec mda-postgres psql -U platform -d municipal_decision_assistant \
  -c "SELECT status, count(*) FROM document_ingestion_jobs GROUP BY status;"
```

---

## Escalation Path

| Severity | Condition | Response Time | Action |
|----------|-----------|---------------|--------|
| P1 — Critical | App down, all users affected | 15 minutes | Page on-call engineer, follow Scenario 1 |
| P2 — High | Search/Decision degraded | 1 hour | Investigate during business hours |
| P3 — Medium | Single user affected, non-blocking | 4 hours | File issue, fix in next release |
| P4 — Low | Cosmetic, documentation | 1 week | Backlog |
