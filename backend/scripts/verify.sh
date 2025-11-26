#!/bin/bash

# MonMan Database & Models Verification Script
# This script verifies that the database schema and Go models are properly configured

echo "🔍 MonMan Database & Models Verification"
echo "======================================="

# Check Go build
echo "1. Checking Go compilation..."
cd "$(dirname "$0")"
if go build -v ./... > /dev/null 2>&1; then
    echo "   ✅ Go build successful - no compilation errors"
else
    echo "   ❌ Go build failed"
    exit 1
fi

# Check model imports
echo "2. Checking model imports..."
cd .. 2>/dev/null || true  # Go back to backend root
if go list -deps ./internal/models 2>/dev/null | grep -q "github.com/google/uuid"; then
    echo "   ✅ UUID dependency properly imported"
else
    echo "   ❌ UUID dependency missing"
    exit 1
fi

# Check migration files exist
echo "3. Checking migration files..."
migration_files=(
    "migrations/0001_init.sql"
    "migrations/0002_seed_data.sql"
    "migrations/0003_sample_data.sql"
)

for file in "${migration_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
        exit 1
    fi
done

# Check migration script
echo "4. Checking migration script..."
if [ -x "scripts/migrate.sh" ]; then
    echo "   ✅ Migration script is executable"
else
    echo "   ❌ Migration script not executable"
    exit 1
fi

# Count model types
echo "5. Checking model definitions..."
model_count=$(grep -c "^type.*struct {" internal/models/models.go)
echo "   ✅ Found $model_count model types defined"

# Check key models exist
key_models=("User" "Account" "Category" "Transaction" "Budget")
for model in "${key_models[@]}"; do
    if grep -q "type $model struct" internal/models/models.go; then
        echo "   ✅ $model model defined"
    else
        echo "   ❌ $model model missing"
        exit 1
    fi
done

# Check Indonesian categories in seed data
echo "6. Checking Indonesian categories..."
if grep -q "Makanan & Minuman" migrations/0002_seed_data.sql; then
    echo "   ✅ Indonesian expense categories found"
else
    echo "   ❌ Indonesian categories missing"
    exit 1
fi

if grep -q "Gaji Pokok (Gapok)" migrations/0002_seed_data.sql; then
    echo "   ✅ Indonesian income categories found"
else
    echo "   ❌ Indonesian income categories missing"
    exit 1
fi

# Check environment template
echo "7. Checking environment configuration..."
if [ -f ".env.example" ]; then
    if grep -q "DB_NAME=monman" .env.example; then
        echo "   ✅ Environment template configured"
    else
        echo "   ❌ Environment template incomplete"
        exit 1
    fi
else
    echo "   ❌ Environment template missing"
    exit 1
fi

echo ""
echo "🎉 All checks passed! MonMan backend is ready to use."
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your database"
echo "2. Run './scripts/migrate.sh' to set up the database"
echo "3. Start the server with 'go run cmd/server/main.go'"
echo ""
echo "Database Features Ready:"
echo "• UUID-based architecture for better scalability"
echo "• Indonesian Rupiah support (amounts in cents)"
echo "• Comprehensive Indonesian categories"
echo "• Automatic balance and budget tracking"
echo "• Family finance management features"
echo "• Sample development data included"