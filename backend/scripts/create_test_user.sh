#!/bin/bash
# Create a test user via registration API

echo "🔧 Creating test user via API..."

curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com"
  }' | jq '.'

echo ""
echo "✅ User creation complete!"
echo "💡 You can now login with username: testuser, password: password123"