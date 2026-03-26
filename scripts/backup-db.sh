#!/bin/bash
# scripts/backup-db.sh
# Database backup script for Gig Job Marketplace
#
# Usage: ./scripts/backup-db.sh
# Requirements: pg_dump, DB_HOST, DB_USER, DB_NAME env vars

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups/postgresql}"
BACKUP_FILE="${BACKUP_DIR}/gig_marketplace_${TIMESTAMP}.dump"

# Use env vars or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-gig_marketplace}"

echo "🔄 Starting database backup..."
echo "   Host: ${DB_HOST}:${DB_PORT}"
echo "   Database: ${DB_NAME}"

mkdir -p "${BACKUP_DIR}"

# Dump database in custom format (compressed)
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -Fc --no-owner --no-privileges \
  -f "${BACKUP_FILE}"

echo "✅ Backup created: ${BACKUP_FILE}"
echo "   Size: $(du -sh "${BACKUP_FILE}" | cut -f1)"

# Clean old backups (keep 7 days)
echo "🧹 Cleaning old backups (older than 7 days)..."
find "${BACKUP_DIR}" -name "*.dump" -mtime +7 -delete 2>/dev/null || true

echo "📊 Current backups:"
ls -lh "${BACKUP_DIR}"/*.dump 2>/dev/null || echo "   No backups found"
echo ""
echo "✅ Backup complete!"
