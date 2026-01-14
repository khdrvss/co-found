#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-file>
Restore a backup created by scripts/backup-db.sh"
  exit 1
fi

BACKUP_FILE=$1
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL must be set (target DB to restore into)"
  exit 1
fi

echo "Restoring $BACKUP_FILE into $DATABASE_URL"
pg_restore --clean --if-exists -d "$DATABASE_URL" "$BACKUP_FILE"

echo "Restore complete"
