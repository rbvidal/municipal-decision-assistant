#!/bin/sh
# ──────────────────────────────────────────────────────────
# Qdrant Snapshot Backup Script
# Usage: ./scripts/backup-qdrant.sh [backup-dir]
#
# Creates a Qdrant collection snapshot via REST API.
# Run via cron daily: 0 3 * * * /path/to/scripts/backup-qdrant.sh
# ──────────────────────────────────────────────────────────
set -e

BACKUP_DIR="${1:-./backups}"
QDRANT_HOST="${QDRANT_HOST:-localhost}"
QDRANT_PORT="${QDRANT_REST_PORT:-6333}"
QDRANT_COLLECTION="${QDRANT_COLLECTION:-mda_chunks}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Creating Qdrant snapshot for collection '${QDRANT_COLLECTION}'..."

# Create snapshot via Qdrant REST API
SNAPSHOT_RESPONSE=$(curl -s -X POST \
  "http://${QDRANT_HOST}:${QDRANT_PORT}/collections/${QDRANT_COLLECTION}/snapshots" \
  -H "Content-Type: application/json")

echo "Snapshot created: ${SNAPSHOT_RESPONSE}"

# Download the snapshot (if Qdrant stores it locally, copy it)
# Qdrant stores snapshots in ./snapshots/ directory by default
# For Docker: docker cp mda-qdrant:/qdrant/snapshots ./backups/qdrant-snapshots/
echo "[$(date)] Qdrant snapshot complete."

# Retention: keep last 30 daily snapshots
find "${BACKUP_DIR}" -name "qdrant-snapshot-*" -mtime +30 -delete 2>/dev/null || true
echo "[$(date)] Cleanup complete (30-day retention)"
