#!/bin/sh
# ──────────────────────────────────────────────────────────
# PostgreSQL Restore Script
# Usage: ./scripts/restore-postgres.sh <backup-file.sql.gz>
#
# Restores a gzipped SQL dump to the MDA database.
# WARNING: This drops and recreates the database.
# Test in staging before using in production.
# ──────────────────────────────────────────────────────────
set -e

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  echo "Example: $0 ./backups/mda-pg-20260718-020000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${DB_NAME:-municipal_decision_assistant}"
DB_USER="${DB_USERNAME:-platform}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "[$(date)] WARNING: This will drop and recreate database '${DB_NAME}'."
echo "Press Ctrl+C within 10 seconds to cancel..."
sleep 10

echo "[$(date)] Dropping existing connections..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
  -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();" 2>/dev/null || true

echo "[$(date)] Dropping and recreating database..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
  -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
  -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

echo "[$(date)] Restoring from ${BACKUP_FILE}..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD}" psql \
  -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"

echo "[$(date)] Restore complete. Database '${DB_NAME}' restored from ${BACKUP_FILE}."
echo "Run Flyway migrations if needed: mvn flyway:migrate -pl platform-api"
