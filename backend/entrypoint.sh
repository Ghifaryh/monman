#!/bin/sh
set -e
SQLITE_PATH="${SQLITE_PATH:-/data/monman.db}"
export SQLITE_PATH
mkdir -p "$(dirname "$SQLITE_PATH")" 2>/dev/null || true
/usr/local/bin/migrate -sample || /usr/local/bin/migrate
exec /usr/local/bin/server
