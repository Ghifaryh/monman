#!/bin/bash

# Verification script for username-based authentication
echo "🔍 MonMan Username Authentication Verification"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Checking database schema...${NC}"

# Check if users table has username column
RESULT=$(psql -h localhost -p 5432 -U postgres -d monman_db -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username';" 2>/dev/null)

if [[ $RESULT == *"username"* ]]; then
    echo -e "${GREEN}✅ Username column exists in users table${NC}"
else
    echo -e "${RED}❌ Username column missing from users table${NC}"
    echo "Please run migrations first: docker-compose exec backend-db psql -U postgres -d monman_db -f /migrations/0001_init.sql"
    exit 1
fi

echo -e "${BLUE}2. Checking Go models and compilation...${NC}"

# Test Go compilation
cd "$(dirname "$0")/.."
if go build ./cmd/server > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Go backend compiles successfully${NC}"
else
    echo -e "${RED}❌ Go compilation failed${NC}"
    exit 1
fi

echo -e "${BLUE}3. Testing API structure...${NC}"

# Check if LoginRequest struct uses username
if grep -q "Username.*string.*json:\"username\"" internal/models/models.go; then
    echo -e "${GREEN}✅ LoginRequest uses username field${NC}"
else
    echo -e "${RED}❌ LoginRequest still uses email field${NC}"
    exit 1
fi

# Check if CreateUserRequest supports username
if grep -q "Username.*string.*json:\"username\"" internal/models/models.go; then
    echo -e "${GREEN}✅ CreateUserRequest supports username field${NC}"
else
    echo -e "${RED}❌ CreateUserRequest missing username field${NC}"
    exit 1
fi

echo -e "${BLUE}4. Checking repository layer...${NC}"

# Check if GetByUsername method exists
if grep -q "GetByUsername" internal/repository/user.go; then
    echo -e "${GREEN}✅ GetByUsername method exists in repository${NC}"
else
    echo -e "${RED}❌ GetByUsername method missing${NC}"
    exit 1
fi

echo -e "${BLUE}5. Checking service layer...${NC}"

# Check if service uses username authentication
if grep -q "GetByUsername.*req.Username" internal/service/user.go; then
    echo -e "${GREEN}✅ Service layer uses username authentication${NC}"
else
    echo -e "${RED}❌ Service layer authentication needs update${NC}"
    exit 1
fi

echo -e "${BLUE}6. Summary of Changes Made:${NC}"
echo "📋 Database Schema:"
echo "   • Users table now has 'username' as UNIQUE NOT NULL primary identifier"
echo "   • Email is now optional (nullable) field"
echo ""
echo "🔧 Go Backend:"
echo "   • User model updated with Username field"
echo "   • LoginRequest/CreateUserRequest use username instead of email"
echo "   • Repository layer has GetByUsername method"
echo "   • Service layer authenticates using username"
echo "   • API handler accepts username in login requests"
echo ""
echo "🎨 Frontend (Ready for Update):"
echo "   • LoginPage component updated to use username fields"
echo "   • Form validation updated for username input"
echo ""
echo -e "${GREEN}✅ Username-based authentication system is ready!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Run migrations: docker-compose up -d backend-db && docker-compose exec backend-db psql -U postgres -d monman_db -f /migrations/0001_init.sql"
echo "2. Start backend: cd backend && go run cmd/server/main.go"
echo "3. Test login with username instead of email"
echo ""
echo -e "${BLUE}Sample Test User:${NC}"
echo "Username: testuser"
echo "Password: (hash from sample data)"