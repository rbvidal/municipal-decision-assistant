la#!/bin/bash
# k6 Load Test Suite Runner
# Usage: ./k6-scripts/run-all.sh [--smoke-only]
#
# Environment variables:
#   BASE_URL        Backend URL (default: http://localhost:8080)
#   TEST_EMAIL      Test user email (default: test@test.de)
#   TEST_PASSWORD   Test user password (default: Test123!)
#   K6_PROMETHEUS_RW_SERVER_URL  Prometheus remote write URL (optional)

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="k6-results/${TIMESTAMP}"
SMOKE_ONLY=false
FAILURES=()

if [ "${1:-}" = "--smoke-only" ]; then
  SMOKE_ONLY=true
fi

mkdir -p "${OUTPUT_DIR}"

echo "============================================"
echo "  k6 Municipal Decision Assistant"
echo "  Load Test Suite"
echo "============================================"
echo ""
echo "Target: ${BASE_URL}"
echo "Output: ${OUTPUT_DIR}"
echo ""

run_test() {
  local name="$1"
  local script="$2"
  local json="${OUTPUT_DIR}/${name}.json"
  local log="${OUTPUT_DIR}/${name}.log"

  echo "--- ${name} ---"
  if k6 run "${script}" \
      --out "json=${json}" \
      --env BASE_URL="${BASE_URL}" \
      --no-color > "${log}" 2>&1; then
    echo "  PASS  (results: ${json})"
  else
    local rc=$?
    echo "  FAIL (exit code ${rc})"
    FAILURES+=("${name} (exit ${rc})")
    echo "  Last 10 lines of ${log}:"
    tail -10 "${log}" | sed 's/^/    /'
  fi
  echo ""

  sleep 5  # let the server breathe between tests
}

# ── Smoke (always run first) ──
run_test "01-smoke" "k6-scripts/01-smoke-test.js"

if [ "$SMOKE_ONLY" = true ]; then
  echo "Smoke test only — done."
  exit 0
fi

# ── Full suite ──
run_test "02-daily"         "k6-scripts/02-daily-load.js"
run_test "03-peak"          "k6-scripts/03-peak-morning.js"
run_test "04-ai-validation" "k6-scripts/04-ai-heavy.js"
run_test "05-search"        "k6-scripts/05-search-intensive.js"
run_test "06-upload"        "k6-scripts/06-upload-stress.js"
run_test "07-admin"         "k6-scripts/07-admin-ops.js"
run_test "08-long-session"  "k6-scripts/08-long-session.js"

echo ""
echo "============================================"
if [ ${#FAILURES[@]} -eq 0 ]; then
  echo "  All tests passed."
else
  echo "  ${#FAILURES[@]} test(s) failed:"
  for f in "${FAILURES[@]}"; do
    echo "    - ${f}"
  done
fi
echo "  Results: ${OUTPUT_DIR}"
echo "============================================"

exit ${#FAILURES[@]}
