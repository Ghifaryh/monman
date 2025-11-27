#!/bin/bash
# MonMan Development Setup Script

echo "🚀 Starting MonMan Development Environment"
echo "========================================"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Stop any native PostgreSQL to free port 5432
echo "🔧 Stopping native PostgreSQL (if running)..."
sudo systemctl stop postgresql 2>/dev/null || true

# Start development database
echo "🗄️ Starting PostgreSQL database in Docker..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

if docker-compose -f docker-compose.dev.yml ps | grep -q "healthy"; then
    echo "✅ Database is ready!"

    # Check if database already has tables (avoid duplicate migrations)
    echo "🔍 Checking if database needs migration..."
    table_count=$(PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")

    if [ "$table_count" -gt 0 ]; then
        echo "📊 Database already has $table_count tables - skipping migrations"
        echo "💡 To reset database: docker-compose -f docker-compose.dev.yml down -v && ./dev-setup.sh"
    else
        echo "📄 Running database migrations (safe to re-run)..."
        if [ -f "backend/scripts/migrate.sh" ]; then
            cd backend && bash scripts/migrate.sh && cd ..
            echo "✅ Database migrations completed!"
        else
            echo "⚠️  Migration script not found, running migrations manually..."
            PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0001_init.sql
            PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0002_seed_data.sql
            PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0003_sample_data.sql
            PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0004_seed_users.sql
            echo "✅ Manual migrations completed!"
        fi
    fi

    echo ""
    echo "🎉 Development environment ready!"
else
    echo "⚠️  Database might still be starting, you may need to run migrations manually"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Backend: cd backend && go run cmd/server/main.go"
echo "2. Frontend: cd frontend && bun dev"
echo ""
echo "💡 Useful Commands:"
echo "- Stop database: docker-compose -f docker-compose.dev.yml down"
echo "- View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "- Database shell: docker exec -it monman-db-dev psql -U monman_user -d monman_db"