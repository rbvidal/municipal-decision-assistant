#!/bin/sh
# ──────────────────────────────────────────────────────────
# Combined Backup Script (PostgreSQL + Qdrant)
# Usage: ./scripts/backup-all.sh [backup-dir]
#
# Runs both PostgreSQL and Qdrant backups sequentially.
# Schedule via cron: 0 2 * * * /path/to/scripts/backup-all.sh
# ──────────────────────────────────────────────────────────
set -e

BACKUP_DIR="${1:-./backups}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== MDA Full Backup — $(date) ==="
echo "Backup directory: ${BACKUP_DIR}"

echo ""
echo "── PostgreSQL ──"
"${SCRIPT_DIR}/backup-postgres.sh" "${BACKUP_DIR}"

echo ""
echo "── Qdrant ──"
"${SCRIPT_DIR}/backup-qdrant.sh" "${BACKUP_DIR}"

echo ""
echo "=== Backup complete — $(date) ==="
ls -lh "${BACKUP_DIR}"/* 2>/dev/null || echo "(no backup files found)"
