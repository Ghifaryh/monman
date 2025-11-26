#!/bin/bash
# Interactive User Creation Script

echo "🚀 MonMan User Creation Tool"
echo "============================"

# Check if backend is running
echo "📡 Checking if backend server is running..."
if curl -s http://localhost:8080/health >/dev/null 2>&1; then
    echo "✅ Backend server is running"
    USE_API=true
else
    echo "⚠️  Backend server is not running"
    echo "📝 Will use direct database method"
    USE_API=false
fi

echo ""
echo "👤 Enter user details:"

# Get user input
read -p "Username: " USERNAME
read -s -p "Password: " PASSWORD
echo ""
read -p "First Name: " FIRST_NAME
read -p "Last Name: " LAST_NAME
read -p "Email (optional): " EMAIL

echo ""
echo "🔧 Creating user '$USERNAME'..."

if [ "$USE_API" = true ]; then
    # Use API method
    echo "📡 Using registration API..."

    if [ -z "$EMAIL" ]; then
        JSON_DATA='{"username":"'$USERNAME'","password":"'$PASSWORD'","first_name":"'$FIRST_NAME'","last_name":"'$LAST_NAME'"}'
    else
        JSON_DATA='{"username":"'$USERNAME'","password":"'$PASSWORD'","first_name":"'$FIRST_NAME'","last_name":"'$LAST_NAME'","email":"'$EMAIL'"}'
    fi

    RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
      -H "Content-Type: application/json" \
      -d "$JSON_DATA")

    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        echo "✅ User created successfully via API!"
        echo "🔑 JWT Token received - user can login immediately"
        echo "$RESPONSE" | jq '.'
    else
        echo "❌ Failed to create user via API"
        echo "$RESPONSE"
    fi
else
    # Use CLI method
    echo "💾 Using direct database method..."

    cd /home/mhghi/projects/monman/backend

    if [ -z "$EMAIL" ]; then
        go run cmd/create-user/main.go \
          -username="$USERNAME" \
          -password="$PASSWORD" \
          -first-name="$FIRST_NAME" \
          -last-name="$LAST_NAME"
    else
        go run cmd/create-user/main.go \
          -username="$USERNAME" \
          -password="$PASSWORD" \
          -first-name="$FIRST_NAME" \
          -last-name="$LAST_NAME" \
          -email="$EMAIL"
    fi
fi

echo ""
echo "💡 User can now login with:"
echo "   Username: $USERNAME"
echo "   Password: [the password you entered]"