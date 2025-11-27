#!/bin/bash

# Migration script for MonMan database
# This script connects to PostgreSQL and runs the migration files in order

set -e  # Exit on any error

# Configuration from environment variables or defaults
# Updated to match Docker development setup
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-monman_db}"
DB_USER="${DB_USER:-monman_user}"
DB_PASSWORD="${DB_PASSWORD:-monman_pass}"

# Connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"

echo "🚀 MonMan Database Migration"
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo "=============================="

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed or not in PATH"
    echo "Install PostgreSQL client: sudo apt install postgresql-client"
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
if ! psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
    echo "❌ Error: Cannot connect to database"
    echo "Make sure PostgreSQL is running and credentials are correct"
    exit 1
fi

echo "✅ Database connection successful"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$(dirname "$SCRIPT_DIR")/migrations"

echo "📁 Migrations directory: $MIGRATIONS_DIR"

# Run each migration file in order
for migration_file in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration_file" ]; then
        filename=$(basename "$migration_file")
        echo "📄 Running migration: $filename"

        if psql "$DATABASE_URL" -f "$migration_file"; then
            echo "✅ Migration $filename completed successfully"
        else
            echo "❌ Error: Migration $filename failed"
            exit 1
        fi
    fi
done

echo ""
echo "🎉 All migrations completed successfully!"
echo ""

# Show some basic statistics
echo "📊 Database Statistics:"
echo "======================"

# Count tables
table_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "Total tables: $table_count"

# Show table names and row counts
echo ""
echo "Table overview:"
psql "$DATABASE_URL" -c "
SELECT
    schemaname,
    tablename,
    (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
  SELECT
    schemaname,
    tablename,
    query_to_xml(format('SELECT COUNT(*) as cnt FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
) t;
"

echo ""
echo "🗄️  Default categories loaded:"
psql "$DATABASE_URL" -c "SELECT category_type, COUNT(*) FROM categories WHERE is_system = true GROUP BY category_type;"

echo ""
echo "Ready to use! 🚀"