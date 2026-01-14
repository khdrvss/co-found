#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL must be set"
  exit 1
fi

TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
FILENAME="backup-$TIMESTAMP.sql"

echo "Backing up database to $FILENAME"
pg_dump "$DATABASE_URL" -Fc -f "$FILENAME"

echo "Backup saved: $FILENAME"
