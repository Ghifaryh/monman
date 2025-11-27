#!/bin/bash
# Database Reset Script for MonMan
# Completely resets database and re-runs all migrations

echo "🔄 Resetting MonMan Database"
echo "============================"

echo "⚠️  This will completely destroy all data!"
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Reset cancelled"
    exit 1
fi

echo "🛑 Stopping database container and removing volume..."
docker-compose -f docker-compose.dev.yml down -v

echo "🚀 Starting fresh database with migrations..."
./dev-setup.sh

echo ""
echo "✅ Database reset complete!"
echo "🎯 Ready to start development with fresh data"