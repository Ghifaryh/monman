#!/bin/bash
# CLI User Creation Script

echo "🔧 Creating user via CLI command..."
echo "📝 This method creates users directly in the database"

cd /home/mhghi/projects/monman/backend

# Example usage with different users
echo "Creating admin user..."
go run cmd/create-user/main.go \
  -username=admin \
  -password=admin123 \
  -first-name=Admin \
  -last-name=User \
  -email=admin@monman.com

echo ""
echo "Creating test user..."
go run cmd/create-user/main.go \
  -username=john \
  -password=password123 \
  -first-name=John \
  -last-name=Doe \
  -email=john@example.com

echo ""
echo "✅ CLI user creation complete!"