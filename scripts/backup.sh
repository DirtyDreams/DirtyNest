#!/usr/bin/env bash
# PostgreSQL backup for DirtyNest — pg_dump the postgres container to ./backups.
# Usage: ./scripts/backup.sh [output_dir]
# Restore: gunzip -c backups/dirtynest-<ts>.sql.gz | docker compose exec -T postgres psql -U dirtynest -d dirtynest
set -euo pipefail

OUT_DIR="${1:-$(dirname "$0")/../backups}"
mkdir -p "$OUT_DIR"

TS="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$OUT_DIR/dirtynest-$TS.sql.gz"

echo "Backing up dirtynest postgres -> $OUT_FILE"
docker compose exec -T postgres pg_dump -U dirtynest -d dirtynest | gzip > "$OUT_FILE"

echo "Done. Size: $(du -h "$OUT_FILE" | cut -f1)"
