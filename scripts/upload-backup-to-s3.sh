#!/usr/bin/env bash
set -euo pipefail

if [ -z "${AWS_S3_BUCKET:-}" ]; then
  echo "AWS_S3_BUCKET not set, skipping upload"
  exit 0
fi

BACKUP_FILE=$(ls -t backup-*.sql | head -n1)
if [ -z "$BACKUP_FILE" ]; then
  echo "No backup file found"
  exit 1
fi

if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
  echo "AWS credentials not set, skipping upload"
  exit 1
fi

aws s3 cp "$BACKUP_FILE" "s3://${AWS_S3_BUCKET}/$(date +%F)/$BACKUP_FILE"

echo "Uploaded $BACKUP_FILE to s3://${AWS_S3_BUCKET}/"
