# Observability Architecture

**Version:** 1.0
**Date:** 2026-07-17

---

## Observability Stack

| Layer | Technology | Purpose |
|---|---|---|
| Logging | SLF4J + Logback (BE), Custom logger (FE) | Structured JSON logs |
| Metrics | Micrometer → Prometheus | JVM, HTTP, business metrics |
| Tracing | OpenTelemetry → Jaeger | Distributed request tracing |
| Health | Spring Boot Actuator | Readiness, liveness, health |
| Dashboards | Grafana | Visualization + alerting |
| Alerts | Prometheus AlertManager | Threshold-based notifications |

## Structured Logging

### Format (JSON)
```json
{
  "timestamp": "2026-07-17T10:00:01.234Z",
  "level": "INFO",
  "logger": "com.verwaltungsportal.decision.DecisionEngine",
  "message": "Decision analysis started",
  "correlationId": "a1b2c3d4",
  "caseId": "BAU-2026-0147",
  "userId": "u1",
  "duration": "8.4s",
  "tenantId": "municipality-01"
}
```

### Correlation IDs
- Generated at entry point (HTTP request, background job)
- Propagated through all service calls
- Included in all log messages
- Returned in API responses (`X-Correlation-Id` header)

## Metrics

### JVM Metrics
- `jvm_memory_used_bytes`
- `jvm_gc_pause_seconds`
- `jvm_threads_live`

### HTTP Metrics
- `http_server_requests_seconds` (count, sum, histogram)
- `http_server_requests_active`
- By endpoint, method, status

### Business Metrics
- `decisions_total` (counter, by action: APPROVE/REJECT/REVISE)
- `decision_duration_seconds` (histogram)
- `retrieval_documents_count` (gauge)
- `citation_verification_errors` (counter)
- `vector_search_latency_seconds` (histogram)
- `knowledge_graph_query_duration_seconds` (histogram)
- `active_cases` (gauge, by status)
- `active_users` (gauge)

### LLM Metrics
- `llm_request_duration_seconds` (histogram)
- `llm_token_usage_total` (counter)
- `llm_error_rate` (counter)

## Health Indicators

### Readiness (`/actuator/health/readiness`)
- Database connection
- Qdrant connection
- Neo4j connection
- LLM API reachable

### Liveness (`/actuator/health/liveness`)
- JVM alive
- Disk space available

### Custom Health Indicators
```java
@Component
public class DecisionEngineHealth implements HealthIndicator {
    @Override
    public Health health() {
        // Check decision pipeline health
    }
}
```

## Distributed Tracing

### Span Structure
```
HTTP GET /api/decision/BAU-2026-0147
  ├── POST /api/retrieval/search (250ms)
  │     └── Qdrant query (180ms)
  ├── POST /api/reasoning/evaluate (1.2s)
  │     ├── Rule evaluation (800ms)
  │     └── Neo4j graph query (400ms)
  ├── POST /api/llm/generate-draft (2.1s)
  │     └── LLM API call (2.0s)
  └── Validation (500ms)
```

### Configuration
```yaml
management:
  tracing:
    sampling:
      probability: 0.1  # 10% in production
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
```

## Grafana Dashboards

### Dashboard 1: System Overview
- Request rate, latency, error rate
- JVM memory, GC, threads
- Database connection pool

### Dashboard 2: Decision Engine
- Decision throughput
- Decision duration distribution
- Retrieval quality (MRR, NDCG)
- Citation verification rate

### Dashboard 3: Business Metrics
- Active cases by status
- Decisions by action type
- Documents processed per day
- User activity

## Alerting Rules

```yaml
groups:
- name: application
  rules:
  - alert: HighErrorRate
    expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.05
    annotations: { summary: "Error rate > 5%" }
    
  - alert: DecisionEngineDown
    expr: up{job="decision-engine"} == 0
    annotations: { summary: "Decision engine unavailable" }
    
  - alert: HighLatency
    expr: histogram_quantile(0.95, decision_duration_seconds) > 30
    annotations: { summary: "p95 decision latency > 30s" }
```

## Audit Logging

All state-changing operations must be audited:

- Case creation, update, approval, rejection
- User creation, role change, deletion
- Document upload, deletion
- Configuration changes
- LLM prompt modifications

Audit events include: timestamp, user, action, target, previous state, new state, IP address.
