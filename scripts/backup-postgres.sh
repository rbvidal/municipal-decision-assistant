#!/bin/sh
# ──────────────────────────────────────────────────────────
# PostgreSQL Backup Script
# Usage: ./scripts/backup-postgres.sh [backup-dir]
#
# Creates a gzipped SQL dump of the MDA database.
# Run via cron daily: 0 2 * * * /path/to/scripts/backup-postgres.sh
# ──────────────────────────────────────────────────────────
set -e

BACKUP_DIR="${1:-./backups}"
DB_NAME="${DB_NAME:-municipal_decision_assistant}"
DB_USER="${DB_USERNAME:-platform}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/mda-pg-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL backup to ${BACKUP_FILE}..."

PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  --no-owner --no-acl --compress=9 \
  > "${BACKUP_FILE}"

echo "[$(date)] Backup complete: $(du -sh "${BACKUP_FILE}" | cut -f1)"

# Retention: keep last 30 daily backups
find "${BACKUP_DIR}" -name "mda-pg-*.sql.gz" -mtime +30 -delete 2>/dev/null || true
echo "[$(date)] Cleanup complete (30-day retention)"
