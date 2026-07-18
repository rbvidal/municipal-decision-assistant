#!/bin/sh
# ──────────────────────────────────────────────────────────
# Qdrant Snapshot Restore Script
# Usage: ./scripts/restore-qdrant.sh <snapshot-name>
#
# Restores a Qdrant collection from a snapshot via REST API.
# Snapshot must exist in Qdrant's snapshots directory.
# ──────────────────────────────────────────────────────────
set -e

if [ $# -lt 1 ]; then
  echo "Usage: $0 <snapshot-name>"
  echo "Example: $0 mda_chunks-20260718-030000.snapshot"
  echo ""
  echo "To list available snapshots:"
  echo "  curl http://localhost:6333/collections/mda_chunks/snapshots"
  exit 1
fi

SNAPSHOT_NAME="$1"
QDRANT_HOST="${QDRANT_HOST:-localhost}"
QDRANT_PORT="${QDRANT_REST_PORT:-6333}"
QDRANT_COLLECTION="${QDRANT_COLLECTION:-mda_chunks}"

echo "[$(date)] WARNING: Restoring snapshot will replace collection '${QDRANT_COLLECTION}'."
echo "Press Ctrl+C within 10 seconds to cancel..."
sleep 10

echo "[$(date)] Restoring Qdrant collection from snapshot '${SNAPSHOT_NAME}'..."

RESTORE_RESPONSE=$(curl -s -X PUT \
  "http://${QDRANT_HOST}:${QDRANT_PORT}/collections/${QDRANT_COLLECTION}/snapshots/${SNAPSHOT_NAME}" \
  -H "Content-Type: application/json")

echo "Restore response: ${RESTORE_RESPONSE}"

echo "[$(date)] Restore complete. Verify with:"
echo "  curl http://${QDRANT_HOST}:${QDRANT_PORT}/collections/${QDRANT_COLLECTION}"
