#!/bin/bash
# MonMan Development Setup (SQLite — no Docker DB required)

echo "🚀 MonMan dev setup (SQLite)"
echo "==========================="

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/backend"
mkdir -p "$BACKEND_DIR/data"

export PATH="${PATH}:$(go env GOPATH 2>/dev/null)/bin"
if ! command -v go &>/dev/null; then
  echo "❌ Go is required. Install Go 1.21+ and retry."
  export PATH="/usr/local/go/bin:$PATH"
fi

echo "🗄️  Applying SQLite migrations..."
(
  cd "$BACKEND_DIR" || exit 1
  export SQLITE_PATH="${SQLITE_PATH:-./data/monman.db}"
  export MONMAN_SAMPLE="${MONMAN_SAMPLE:-1}"
  if [ "$MONMAN_SAMPLE" = "1" ]; then
    go run ./cmd/migrate -sample
  else
    go run ./cmd/migrate
  fi
) || {
  echo "❌ Migration failed"
  exit 1
}

echo ""
echo "🎉 Ready."
echo "Backend:  cd backend && SQLITE_PATH=./data/monman.db JWT_SECRET=change-me go run ./cmd/server"
echo "Frontend: cd frontend && bun dev"
echo ""
echo "SQLite file: $BACKEND_DIR/data/monman.db"
echo "Reset DB:    rm backend/data/monman.db* && ./dev-setup.sh"
