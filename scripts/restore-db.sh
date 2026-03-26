#!/bin/bash
# scripts/restore-db.sh
# Database restore script for Gig Job Marketplace
#
# Usage: ./scripts/restore-db.sh <backup_file>
# Requirements: pg_restore, psql, DB_HOST, DB_USER, DB_NAME env vars

set -euo pipefail

BACKUP_FILE="${1:-}"

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: ./scripts/restore-db.sh <backup_file>"
  echo ""
  echo "Available backups:"
  ls -lh "${BACKUP_DIR:-./backups/postgresql}"/*.dump 2>/dev/null || echo "  No backups found"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# Use env vars or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-gig_marketplace}"

echo "⚠️  WARNING: This will REPLACE the current database!"
echo "   Host: ${DB_HOST}:${DB_PORT}"
echo "   Database: ${DB_NAME}"
echo "   Backup file: ${BACKUP_FILE}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "🔄 Terminating existing connections..."
PGPASSWORD="${DB_PASSWORD:-postgres}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
  2>/dev/null || true

echo "🔄 Dropping and recreating database..."
PGPASSWORD="${DB_PASSWORD:-postgres}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d postgres \
  -c "DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME};"

echo "🔄 Restoring from backup..."
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner --no-privileges \
  "${BACKUP_FILE}"

echo "✅ Restore completed successfully!"
echo "   Database '${DB_NAME}' has been restored from: ${BACKUP_FILE}"
