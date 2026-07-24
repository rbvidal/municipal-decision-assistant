# k6 Load Testing Suite — Municipal Decision Assistant

## Directory Structure

```
k6-scripts/
├── lib/
│   └── auth.js              Shared auth module (login, headers, health)
├── 01-smoke-test.js         1 VU × 5 min — deployment verification
├── 02-daily-load.js         20 VU × 15 min — normal office workload
├── 03-peak-morning.js       50 VU × 13 min — login rush + peak
├── 04-ai-heavy.js           2 VU × 6 iter — AI behaviour validation (NOT load)
├── 05-search-intensive.js   15 VU × 12 min — search + document retrieval
├── 06-upload-stress.js      5 VU × 8 min — concurrent document uploads
├── 07-admin-ops.js          3 VU × 7 min — audit, corpus, admin browsing
├── 08-long-session.js       1 VU × 60 min — memory leak / drift detection
├── run-all.sh               Batch runner
└── README.md                This file
```

## Test Matrix

| Script | VUs | Duration | Focus | DB Load |
|---|---|---|---|---|
| 01-smoke | 1 | 5 min | Health check | Light |
| 02-daily | 20 | 15 min | Mixed workflow | Medium |
| 03-peak | 50 | 13 min | Login rush | Heavy |
| 04-ai | 2 | 6 iter | AI behaviour validation | Light |
| 05-search | 15 | 12 min | Search + docs | Heavy |
| 06-upload | 5 | 8 min | File upload | Medium |
| 07-admin | 3 | 7 min | Admin browsing | Light |
| 08-long | 1 | 60 min | Stability | Light |

## Prerequisites

```bash
# Install k6
# macOS: brew install k6
# Linux: apt install k6 / yum install k6
# Windows: choco install k6

# Verify
k6 version
```

## Quick Start

```bash
# Smoke test only (verify deployment)
k6 run k6-scripts/01-smoke-test.js

# Smoke with custom target
k6 run k6-scripts/01-smoke-test.js -e BASE_URL=http://staging:8080

# Full suite
bash k6-scripts/run-all.sh

# Smoke only
bash k6-scripts/run-all.sh --smoke-only
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:8080` | Backend base URL |
| `TEST_EMAIL` | `test@test.de` | Test user email |
| `TEST_PASSWORD` | `Test123!` | Test user password |
| `K6_WEB_DASHBOARD` | `false` | Enable web dashboard |

## Recommended Execution Order

1. **01-smoke** — Always first. If this fails, stop and fix.
2. **02-daily** — Baseline. Record metrics as reference.
3. **03-peak** — Stress test. Observe degradation pattern.
4. **05-search** — Database + Qdrant + Neo4j load.
5. **06-upload** — File I/O + ingestion.
6. **04-ai** — AI behaviour validation (NOT a load test). Validates inference correctness, response format, evidence, error handling, and recovery. Max 2 VUs — the single GPU must not be saturated.
7. **07-admin** — Any time.
8. **08-long-session** — Overnight or during quiet period.

## Thresholds

### Load Test Thresholds (scripts 01-03, 05-08)

| Metric | Smoke | Daily | Peak | Search | Upload | Admin | Long |
|---|---|---|---|---|---|---|---|
| Health p95 | <500ms | <500ms | - | - | - | - | - |
| Login p95 | <2s | <3s | <5s | - | <3s | <3s | <3s |
| Search p95 | - | <10s | <15s | <15s | - | - | - |
| Error rate | <1% | <2% | <5% | <2% | <2% | <1% | <1% |

### AI Validation Thresholds (script 04)

Script 04 validates behaviour, not throughput. Thresholds check correctness, not speed:

| Metric | Limit | Purpose |
|---|---|---|
| Error rate | <15% | Allow occasional GPU timeout; validate error handling |
| Login p95 | <5s | Auth should be fast regardless of AI load |
| Health p95 | <2s | Health endpoint must stay responsive |

No AI response-time threshold — the single GPU is outside the scope of application load testing.

## Monitoring During Tests

### Application (JVM)
```bash
# In separate terminal
watch -n 5 'curl -s localhost:8080/actuator/metrics/jvm.memory.used | jq .measurements[0].value'
watch -n 5 'curl -s localhost:8080/actuator/metrics/jvm.threads.live | jq .measurements[0].value'
```

### Docker
```bash
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### Ollama (single GPU — observe, don't benchmark)
```bash
# Check if model is loaded and responding
curl -s http://localhost:11434/api/tags | jq '.models[].name'
# Check GPU memory (NVIDIA)
nvidia-smi --query-gpu=memory.used,memory.total --format=csv
```
The Quadro P5000 handles ~1 inference at a time. The AI validation script
limits concurrency to 2 VUs to avoid saturating the GPU. This subsystem is
NOT a load-test target.

### PostgreSQL
```bash
docker exec mda-postgres psql -U platform -d platform \
  -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
```

### Key Metrics to Watch

| Layer | Metric | Source |
|---|---|---|
| App | Response time p50/p95/p99 | k6 output |
| App | Error rate | k6 output |
| App | Requests/sec | k6 output |
| JVM | Heap usage | /actuator/metrics |
| JVM | GC pause time | /actuator/metrics |
| JVM | Thread count | /actuator/metrics |
| JVM | CPU usage | /actuator/metrics |
| DB | Active connections | pg_stat_activity |
| DB | Query duration | PostgreSQL logs |
| Neo4j | Query time | Neo4j metrics |
| Qdrant | Search latency | Qdrant metrics |
| Ollama | Inference health (observe only) | /actuator/metrics ai.inference.duration |
| Docker | Container CPU/RAM | docker stats |

## CI Integration — GitHub Actions

```yaml
# .github/workflows/k6-load-test.yml
name: k6 Load Test

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]

jobs:
  k6-smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/setup-k6-action@v1
      - run: |
          k6 run k6-scripts/01-smoke-test.js \
            -e BASE_URL=${{ secrets[format('{0}_BASE_URL', inputs.environment)] }} \
            -e TEST_EMAIL=${{ secrets.TEST_EMAIL }} \
            -e TEST_PASSWORD=${{ secrets.TEST_PASSWORD }}
```

## Generating Reports

k6 automatically produces:
- **Summary**: printed to stdout
- **JSON**: use `--out json=results.json` for programmatic analysis
- **HTML Dashboard**: set `K6_WEB_DASHBOARD=true` for real-time web UI
- **CSV**: pipe JSON through `jq`:
  ```bash
  k6 run --out json=results.json script.js
  cat results.json | jq -r '
    .metrics.http_req_duration.values |
    to_entries[] | [.key, .value] | @csv
  ' > latency.csv
  ```
- **Grafana Cloud**: use `K6_CLOUD_TOKEN` for automatic upload
