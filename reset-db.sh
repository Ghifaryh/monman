#!/bin/bash
# Reset SQLite database and re-apply migrations

echo "🔄 Resetting MonMan SQLite database"
echo "===================================="

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB="${ROOT}/backend/data/monman.db"

echo "⚠️  This deletes $DB (and WAL files)"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 1
fi

rm -f "$DB" "${DB}-wal" "${DB}-shm" "${DB}-journal" 2>/dev/null
echo "📄 Running dev-setup..."
exec "$ROOT/dev-setup.sh"
