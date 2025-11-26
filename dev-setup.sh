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
sleep 5

# Check database health
if docker-compose -f docker-compose.dev.yml ps | grep -q "healthy"; then
    echo "✅ Database is ready!"
else
    echo "⚠️  Database might still be starting..."
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