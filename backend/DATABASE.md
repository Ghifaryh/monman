# MonMan Database Schema Documentation

## Overview

MonMan uses a PostgreSQL database with a comprehensive schema designed for Indonesian personal finance management. The database follows clean architecture principles with proper normalization, foreign key relationships, and automated triggers for data integrity.

## Key Design Principles

### 1. **Indonesian Rupiah Support**
- All monetary values stored as `BIGINT` in cents (Rupiah * 100)
- Avoids floating-point precision issues
- Example: Rp 10.000 stored as 1000000

### 2. **UUID Primary Keys**
- All tables use UUID primary keys for better distributed system support
- Uses `gen_random_uuid()` function for automatic UUID generation

### 3. **Audit Trail**
- All main tables include `created_at` and `updated_at` timestamps
- Automatic `updated_at` trigger updates on row changes

### 4. **Data Integrity**
- Comprehensive foreign key constraints with CASCADE deletes
- Check constraints for enum-like fields
- Automatic balance updates through database triggers

## Core Tables

### 1. `users` - User Management
Core user authentication and profile information.

```sql
Key Fields:
- id: UUID (Primary Key)
- username: VARCHAR(50) UNIQUE NOT NULL (Primary login identifier)
- email: VARCHAR(255) UNIQUE (Optional for notifications/recovery)
- password_hash: TEXT NOT NULL (never exposed in API)
- first_name, last_name: VARCHAR(100) NOT NULL
- phone: VARCHAR(20) (optional)
- date_of_birth: DATE (optional)
- profile_picture_url: TEXT (optional)
- is_active: BOOLEAN DEFAULT true
- email_verified_at: TIMESTAMP WITH TIME ZONE (nullable)
- created_at, updated_at: TIMESTAMP WITH TIME ZONE
```

### 2. `accounts` - Financial Accounts
Bank accounts, credit cards, cash, e-wallets, etc.

```sql
Key Fields:
- id: UUID (Primary Key)
- user_id: UUID NOT NULL (FK to users ON DELETE CASCADE)
- name: VARCHAR(100) NOT NULL e.g., "Rekening Utama", "Kartu Kredit BCA"
- account_type: VARCHAR(50) NOT NULL - "bank", "credit_card", "cash", "investment", "ewallet"
- bank_name: VARCHAR(100) - "BCA", "Mandiri", "BNI"
- account_number: VARCHAR(50) (optional)
- balance: BIGINT NOT NULL DEFAULT 0 (in cents)
- credit_limit: BIGINT (for credit cards, in cents)
- is_default: BOOLEAN DEFAULT false
- color: VARCHAR(7) DEFAULT '#3B82F6' (hex color for UI)
- is_active: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP WITH TIME ZONE
```

### 3. `categories` - Transaction Categories
Hierarchical categories for income and expenses.

```sql
Key Fields:
- id: UUID (Primary Key)
- user_id: UUID (nullable for system categories, FK ON DELETE CASCADE)
- name: VARCHAR(100) NOT NULL e.g., "Makanan & Minuman"
- category_type: VARCHAR(20) NOT NULL CHECK - "income" or "expense"
- parent_category_id: UUID (for subcategories, FK to categories)
- icon: VARCHAR(50) DEFAULT 'dollar-sign' (UI icon identifier)
- color: VARCHAR(7) DEFAULT '#6B7280' (hex color)
- is_system: BOOLEAN DEFAULT false (system-provided categories)
- is_active: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP WITH TIME ZONE
```

### 4. `transactions` - Financial Transactions
Core transaction data with full Indonesian context.

```sql
Key Fields:
- id: UUID (Primary Key)
- user_id: UUID NOT NULL (FK to users ON DELETE CASCADE)
- account_id: UUID NOT NULL (FK to accounts ON DELETE CASCADE)
- category_id: UUID (FK to categories, nullable)
- amount: BIGINT NOT NULL (negative for expenses, positive for income, in cents)
- description: TEXT NOT NULL
- transaction_type: VARCHAR(20) NOT NULL CHECK - "income", "expense", "transfer"
- transaction_date: DATE NOT NULL DEFAULT CURRENT_DATE
- notes: TEXT (optional)
- receipt_image_url: TEXT (optional)
- location_name: VARCHAR(200) e.g., "Shell Senayan"
- is_recurring: BOOLEAN DEFAULT false
- recurring_pattern: VARCHAR(20) - "daily", "weekly", "monthly", "yearly"
- created_at, updated_at: TIMESTAMP WITH TIME ZONE
```

### 5. `budgets` - Enhanced Budget Management
Category-based budgets with person responsibility and Indonesian UI customization.

```sql
Core Fields:
- id: UUID (Primary Key)
- user_id: UUID NOT NULL (FK to users ON DELETE CASCADE)
- category_id: UUID NOT NULL (FK to categories ON DELETE CASCADE)
- name: VARCHAR(100) NOT NULL e.g., "Belanja Bulanan", "Bensin Motor"
- allocated_amount: BIGINT NOT NULL (budget amount in cents)
- spent_amount: BIGINT DEFAULT 0 (current spent amount in cents, auto-calculated)
- budget_period: VARCHAR(20) NOT NULL CHECK - "weekly", "monthly", "yearly"
- period_start_date, period_end_date: DATE NOT NULL
- responsible_person: VARCHAR(50) - "husband", "wife", "both", or person name
- auto_reset: BOOLEAN DEFAULT true (auto reset when period ends)
- alert_percentage: INTEGER DEFAULT 80 (alert when spent reaches this percentage)
- is_active: BOOLEAN DEFAULT true

UI Enhancement Fields:
- icon: VARCHAR(10) DEFAULT '📱' (emoji icons: 🛒, ⛽, 💡)
- color: VARCHAR(20) DEFAULT 'blue' (UI color scheme)
- sort_order: INTEGER DEFAULT 0 (custom ordering for UI)
- created_at, updated_at: TIMESTAMP WITH TIME ZONE
- CONSTRAINT unique_user_budget_name UNIQUE (user_id, name)
```

### 6. `budget_common_purchases` - Purchase Presets
Pre-configured purchase suggestions for Indonesian shopping patterns.

```sql
Key Fields:
- id: UUID (Primary Key)
- budget_id: UUID NOT NULL (FK to budgets ON DELETE CASCADE)
- item: VARCHAR(200) NOT NULL e.g., "Indomie Goreng", "Bensin Premium"
- quantity: VARCHAR(50) e.g., "× 5", "1 kg", "Rp 20.000"
- estimated_amount: BIGINT NOT NULL (estimated price in cents)
- store: VARCHAR(200) e.g., "Indomaret", "SPBU Shell"
- is_frequently_used: BOOLEAN DEFAULT true (show in quick-add suggestions)
- sort_order: INTEGER DEFAULT 0
- created_at, updated_at: TIMESTAMP WITH TIME ZONE
```

### 7. `budget_transactions` - Detailed Budget Tracking
Enhanced transaction tracking with budget-specific metadata for item-level expense tracking.

```sql
Key Fields:
- id: UUID (Primary Key)
- transaction_id: UUID NOT NULL (FK to transactions ON DELETE CASCADE)
- budget_id: UUID NOT NULL (FK to budgets ON DELETE CASCADE)
- user_id: UUID NOT NULL (FK to users ON DELETE CASCADE)
- item: VARCHAR(200) NOT NULL (specific item purchased)
- quantity: VARCHAR(50) (quantity with unit: "× 5", "1 kg")
- store: VARCHAR(200) (where the purchase was made)
- unit_price: BIGINT (price per unit in cents, optional)
- created_at: TIMESTAMP WITH TIME ZONE
- CONSTRAINT unique_transaction_budget UNIQUE (transaction_id)
```

## Advanced Features

### 8. `income_sources` - Income Management
Track different types of Indonesian income (Gaji, Tukin, Freelance).

```sql
Key Fields:
- name: VARCHAR(100) e.g., "Gapok", "Tukin", "Freelance"
- amount: BIGINT (expected amount in cents)
- frequency: VARCHAR(20) - "monthly", "weekly", "yearly", "irregular"
- source_type: VARCHAR(50) - "salary", "freelance", "investment"
- employer_name: VARCHAR(100)
- next_expected_date: DATE
```

### 9. `transfer_transactions` - Account Transfers
Handle transfers between user accounts.

### 10. `recurring_transactions` - Recurring Templates
Templates for automatic recurring transaction creation.

### 11. `user_sessions` - Authentication
JWT session management with refresh tokens.

## Database Triggers & Automation

### 1. **Automatic Balance Updates**
```sql
-- Trigger: update_account_balance()
-- Updates account balances when transactions are inserted/updated/deleted
-- Maintains data consistency without application logic
```

### 2. **Budget Spent Tracking**
```sql
-- Trigger: update_budget_spent()
-- Automatically updates budget spent_amount when expense transactions change
-- Only processes expense transactions within budget periods
```

### 3. **Updated At Timestamps**
```sql
-- Trigger: update_updated_at_column()
-- Automatically sets updated_at = now() on row updates
-- Applied to all main tables
```

## Default Categories

The database comes pre-populated with comprehensive Indonesian categories:

### Expense Categories:
- **Makanan & Minuman** - Food and beverages
- **Transportasi** - Transportation (Bensin, Ojek Online, Tol)
- **Utilities** - Listrik, Air, Internet, Gas LPG
- **Kesehatan** - Healthcare, medicines
- **Hiburan** - Entertainment, streaming services
- **Belanja** - Shopping (clothes, electronics, cosmetics)
- **Rumah** - Housing (rent, maintenance)
- **Keuangan** - Financial (insurance, investments, taxes)

### Income Categories:
- **Gaji Pokok (Gapok)** - Base salary
- **Tunjangan Kinerja (Tukin)** - Performance allowance
- **Tunjangan Kehadiran** - Attendance allowance
- **Freelance** - Freelance work
- **Bisnis Sampingan** - Side business
- **Investasi** - Investment returns

## Budget Management System

### Indonesian Budget Categories
The database includes realistic Indonesian budget categories with UI customization:

| Name | Icon | Allocated | Period | Features |
|------|------|-----------|---------|----------|
| Belanja Bulanan | 🛒 | Rp 1,500,000 | monthly | Groceries, household items |
| Bensin Motor | ⛽ | Rp 200,000 | weekly | Gas for motorcycles |
| Listrik & Air | 💡 | Rp 500,000 | monthly | Utilities (electricity, water) |
| Internet & Pulsa | 📱 | Rp 150,000 | monthly | Internet and phone credit |
| Transportasi | 🚗 | Rp 300,000 | monthly | Transportation costs |
| Makan di Luar | 🍽️ | Rp 400,000 | monthly | Dining out |
| Kesehatan | 💊 | Rp 250,000 | monthly | Healthcare expenses |
| Pendidikan | 📚 | Rp 200,000 | monthly | Education costs |

### Common Purchase Presets (22 items total)
**Indonesian Shopping Patterns:**
- **Belanja Bulanan**: Beras 5kg (Rp 75,000) - Pasar Minggu, Minyak Goreng 1L (Rp 25,000) - Indomaret
- **Bensin Motor**: Premium Rp 20,000 - SPBU Shell, Pertalite Rp 15,000 - SPBU Pertamina
- **Listrik & Air**: Token Listrik Rp 100,000 - Mobile Banking, Tagihan Air PDAM (Bulanan)
- **Internet & Pulsa**: Paket Internet 30GB - MyTelkomsel, Pulsa Rp 25,000 - Indomaret

### Budget Management Features
✅ **UI Component Support:**
- `BudgetSettingsPage`: Category creation with icons, colors, periods, person responsibility
- `BudgetCategoryCard`: Item-level tracking, common purchases, Indonesian context
- Real-time spending calculations and budget alerts
- Period-based budget tracking (weekly/monthly/yearly)
- Person responsibility assignment (husband/wife/both)

✅ **Indonesian Context:**
- Rupiah currency stored in cents for precision
- Local store names (Indomaret, SPBU Shell, Pasar Minggu)
- Indonesian product names and quantities
- Flexible quantity tracking ("× 5", "1 kg", "Rp 20.000")

## Migration Files

### `0001_init.sql` - Core Schema
- Creates all tables including enhanced budgets with UI fields
- Includes budget_common_purchases and budget_transactions tables
- Sets up indexes for query performance
- Creates database functions and triggers
- Includes comprehensive comments and documentation

### `0002_seed_data.sql` - Default Categories
- Inserts system categories for Indonesian context
- Creates utility functions for budget management
- Sets up data validation constraints

### `0003_sample_data.sql` - Development Data
- Creates test user (test@monman.com)
- Sample accounts, transactions, budgets
- Realistic Indonesian transaction data
- Perfect for frontend development and testing

### `0004_indonesian_budget_data.sql` - Budget Seed Data
- Indonesian budget categories with UI customization
- 22 common purchase presets with realistic prices
- Indonesian store names and shopping patterns

## Usage Instructions

### 1. **Running Migrations**
```bash
# Option 1: Automated setup (recommended for new environments)
./dev-setup.sh

# Option 2: Manual migration with Docker database
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Run migrations manually
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0001_init.sql
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0002_seed_data.sql
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0003_sample_data.sql
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0004_indonesian_budget_data.sql
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0004_seed_users.sql

# Option 3: Using migration script (after updating environment variables)
cd backend
chmod +x scripts/migrate.sh
./scripts/migrate.sh
```

### 2. **Environment Variables**
```bash
# Docker Development Setup (current)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monman_db
DB_USER=monman_user
DB_PASSWORD=monman_pass

# Alternative Production Setup
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monman
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. **Connection String Format**
```
postgresql://user:password@host:port/database?sslmode=disable
```

### 4. **Go Model Usage**
```go
// Models are in internal/models/models.go
// Example transaction creation:
transaction := models.Transaction{
    UserID:          userUUID,
    AccountID:       accountUUID,
    CategoryID:      &categoryUUID,
    Amount:          -5000000, // -Rp 50.000 (negative for expense)
    Description:     "Lunch at Warteg",
    TransactionType: "expense",
    TransactionDate: time.Now(),
    LocationName:    &locationName,
}
```

## Indonesian Finance Context

### **Currency Handling**
- Store amounts as cents: Rp 10.000 = 1000000 (BIGINT)
- Frontend formatting: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`
- Always use Indonesian locale for display

### **Indonesian Banking**
- Support for major banks: BCA, Mandiri, BNI, BRI
- E-wallet integration: GoPay, OVO, DANA, ShopeePay
- Credit card tracking with limits

### **Family Finance Management**
- Budget responsibility assignment (husband/wife/both)
- Multiple income sources (Gapok + Tukin + Freelance)
- Indonesian expense categories (Bensin, Warteg, etc.)

### **Cultural Considerations**
- Location names in Indonesian (Shell Senayan, Mall Central Park)
- Category names in Indonesian (Makanan & Minuman, Transportasi)
- Support for Indonesian government salary structure (Gapok, Tukin)

## API Integration

### Backend API Endpoints
Based on the consolidated budget system, the backend should implement:

**Budget Management:**
- `GET /api/budgets` - List all budgets with stats
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

**Common Purchases:**
- `GET /api/budgets/{id}/common-purchases` - Get purchase presets
- `POST /api/budgets/{id}/common-purchases` - Add preset
- `PUT /api/budget/common-purchases/{id}` - Update preset
- `DELETE /api/budget/common-purchases/{id}` - Delete preset

**Budget Transactions:**
- `POST /api/budget/transactions` - Add expense to budget
- `GET /api/budgets/{id}/transactions` - Get budget transactions
- `PUT /api/budget/transactions/{id}` - Update transaction
- `DELETE /api/budget/transactions/{id}` - Delete transaction

**Analytics:**
- `GET /api/budget/summary` - Overall budget summary
- `GET /api/budgets/{id}/analytics` - Budget-specific analytics

### Go Model Integration
The database is designed to support the React frontend with:
- Proper JSON serialization through struct tags in `internal/models/budget.go`
- Computed fields for UI (remaining_amount, transaction_count, etc.)
- Helper methods for Indonesian currency formatting
- Request/Response DTOs for API endpoints
- Comprehensive validation using struct tags

### Development Status
✅ **Complete Database Structure**: Enhanced budgets table with UI fields, supporting tables, and constraints
✅ **Indonesian Sample Data**: Realistic budget categories and common purchases loaded
✅ **Go Models**: Complete Budget model definitions in `internal/models/budget.go`
✅ **Migration Scripts**: Idempotent migrations safe for re-running

### Next Steps
1. **Backend**: Implement repository and service layers using the Budget models
2. **API Routes**: Create RESTful endpoints for budget management
3. **Frontend**: Connect existing UI components (`BudgetSettingsPage`, `BudgetCategoryShowcase`) to new API endpoints
4. **Testing**: Validate data flow between database → API → UI components

This comprehensive schema provides the foundation for a full-featured Indonesian personal finance management application with proper data integrity, performance, cultural context, and complete budget management capabilities.