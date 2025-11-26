# MonMan Backend - Indonesian Personal Finance Management API

A comprehensive Go backend API for MonMan, designed specifically for Indonesian personal finance management with support for Rupiah currency, Indonesian banking systems, and cultural financial patterns.

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- PostgreSQL 13+
- `psql` client (for migrations)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit database credentials and other settings
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=monman
# DB_USER=postgres
# DB_PASSWORD=postgres
```

### 2. Database Setup
```bash
# Create database (if not exists)
createdb monman

# Run migrations
./scripts/migrate.sh

# This will:
# - Create all tables with proper schema
# - Insert Indonesian default categories
# - Add sample development data
```

### 3. Start Development Server
```bash
# Install dependencies
go mod tidy

# Run server
go run cmd/server/main.go

# Server starts on http://localhost:8080
```

## 🏗️ Architecture Overview

### Clean Architecture Structure
```
backend/
├── cmd/server/          # Application entry point
├── internal/
│   ├── api/            # HTTP handlers and routes
│   ├── config/         # Configuration management
│   ├── db/             # Database connection
│   ├── middleware/     # HTTP middleware (CORS, auth, etc.)
│   ├── models/         # Data models and DTOs
│   ├── repository/     # Data access layer
│   ├── service/        # Business logic layer
│   └── utils/          # Utility functions
├── migrations/         # SQL migration files
└── scripts/           # Utility scripts
```

### Key Design Principles

**1. Indonesian Rupiah Support**
- All monetary values stored as `BIGINT` in cents (Rupiah × 100)
- Avoids floating-point precision issues
- Example: Rp 50.000 stored as 5000000

**2. UUID-Based Architecture**
- All primary keys use UUID for better distributed system support
- No auto-incrementing integers for better scalability

**3. Cultural Context**
- Indonesian category names (Makanan & Minuman, Transportasi)
- Support for Indonesian banking (BCA, Mandiri, BNI, BRI)
- E-wallet integration (GoPay, OVO, DANA)
- Family financial management (husband/wife budget responsibility)

## 📊 Database Schema

### Core Tables

#### `users` - User Management
```sql
- id: UUID (Primary Key)
- email: VARCHAR(255) UNIQUE
- password_hash: TEXT (bcrypt hashed)
- first_name, last_name: VARCHAR(100)
- phone: VARCHAR(20) (optional)
- is_active: BOOLEAN
- email_verified_at: TIMESTAMP (nullable)
```

#### `accounts` - Financial Accounts
```sql
- name: VARCHAR(100) e.g., "Rekening Utama BCA"
- account_type: ENUM ("bank", "credit_card", "cash", "ewallet")
- bank_name: VARCHAR(100) e.g., "BCA", "Mandiri"
- balance: BIGINT (in cents)
- credit_limit: BIGINT (for credit cards)
- color: VARCHAR(7) (hex color for UI)
```

#### `categories` - Transaction Categories
```sql
- name: VARCHAR(100) e.g., "Makanan & Minuman"
- category_type: ENUM ("income", "expense")
- icon: VARCHAR(50) (UI icon identifier)
- parent_category_id: UUID (for subcategories)
- is_system: BOOLEAN (default Indonesian categories)
```

#### `transactions` - Financial Transactions
```sql
- amount: BIGINT (negative for expenses, positive for income)
- description: TEXT
- transaction_type: ENUM ("income", "expense", "transfer")
- transaction_date: DATE
- location_name: VARCHAR(200) e.g., "Shell Senayan"
- receipt_image_url: TEXT (optional)
```

#### `budgets` - Budget Management
```sql
- allocated_amount: BIGINT (budget in cents)
- spent_amount: BIGINT (current spent amount)
- budget_period: ENUM ("weekly", "monthly", "yearly")
- responsible_person: VARCHAR(50) ("husband", "wife", "both")
- alert_percentage: INTEGER (1-100)
```

### Advanced Features

- **Income Sources**: Track Gaji, Tukin, Freelance income separately
- **Transfer Transactions**: Handle account-to-account transfers
- **Recurring Transactions**: Templates for recurring payments
- **User Sessions**: JWT-based authentication with refresh tokens

## 🔄 Automatic Database Features

### 1. Balance Management
- Account balances automatically updated when transactions change
- Database triggers ensure consistency without application logic

### 2. Budget Tracking
- Budget spent amounts automatically calculated from transactions
- Only processes expense transactions within budget periods

### 3. Audit Trail
- All tables include `created_at` and `updated_at` timestamps
- Automatic timestamp updates via database triggers

## 🇮🇩 Indonesian Features

### Default Categories

**Expense Categories:**
- Makanan & Minuman (Food & Beverages)
- Transportasi (Bensin, Ojek Online, Tol)
- Listrik, Air, Internet, Gas LPG
- Kesehatan (Healthcare)
- Hiburan (Netflix, Bioskop)
- Belanja (Pakaian, Elektronik)
- Sewa/Cicilan Rumah

**Income Categories:**
- Gaji Pokok (Gapok) - Base salary
- Tunjangan Kinerja (Tukin) - Performance allowance
- Tunjangan Kehadiran - Attendance allowance
- Freelance, Bisnis Sampingan
- Dividen Saham, Bunga Deposito

### Banking Integration
- Major Indonesian banks: BCA, Mandiri, BNI, BRI
- E-wallets: GoPay, OVO, DANA, ShopeePay
- Credit card tracking with proper limits

### Cultural Considerations
- Family budget responsibility (husband/wife assignments)
- Multiple income source tracking (government salary structure)
- Indonesian location names and merchant names

## 📡 API Endpoints

### User Management
```
POST   /api/users/register    # User registration
POST   /api/users/login       # User authentication
GET    /api/users/profile     # Get user profile
PUT    /api/users/profile     # Update user profile
```

### Account Management
```
GET    /api/accounts          # List user accounts
POST   /api/accounts          # Create account
PUT    /api/accounts/:id      # Update account
DELETE /api/accounts/:id      # Delete account
```

### Transactions
```
GET    /api/transactions      # List transactions (with filters)
POST   /api/transactions      # Create transaction
PUT    /api/transactions/:id  # Update transaction
DELETE /api/transactions/:id  # Delete transaction
```

### Categories & Budgets
```
GET    /api/categories        # List categories
POST   /api/budgets          # Create budget
GET    /api/budgets          # List budgets
PUT    /api/budgets/:id      # Update budget
```

### Dashboard
```
GET    /api/dashboard        # Dashboard summary data
```

## 🛠️ Development Tools

### Migration Management
```bash
# Run all migrations
./scripts/migrate.sh

# Check migration status
./scripts/migrate.sh --status

# Reset database (development only)
./scripts/migrate.sh --reset
```

### Testing Data
```sql
-- Test user credentials
Email: test@monman.com
Password: (set during user creation)

-- Sample accounts, transactions, and budgets included
-- See migrations/0003_sample_data.sql for details
```

### Go Model Usage
```go
// Create transaction with proper Indonesian context
transaction := &models.Transaction{
    UserID:          userID,
    AccountID:       accountID,
    CategoryID:      &categoryID,
    Amount:          -15000000,  // -Rp 150.000 (expense)
    Description:     "Belanja di Supermarket",
    TransactionType: "expense",
    LocationName:    &locationName,
}

// Format for Indonesian display
formattedAmount := formatRupiah(transaction.Amount)
// Output: "Rp 150.000"
```

## 🔐 Security Features

### Password Security
- bcrypt hashing with proper cost factor
- Password strength validation
- Secure password update flow

### Data Protection
- Soft deletion for user accounts
- Password fields excluded from JSON responses
- Input validation and sanitization

## 📈 Performance Optimizations

### Database Indexes
- Optimized for common query patterns
- User-specific data filtering
- Date range queries for transactions

### Connection Management
- Connection pooling
- Health check endpoints
- Graceful shutdown handling

## 🚀 Deployment

### Docker Support
```bash
# Build image
docker build -t monman-backend .

# Run with environment
docker run -p 8080:8080 --env-file .env monman-backend
```

### Environment Variables
See `.env.example` for complete configuration options including:
- Database connection settings
- JWT configuration
- CORS settings
- Indonesian locale settings

## 📚 Learning Resources

This project demonstrates modern Go patterns:

### Go-Specific Patterns Explained
- **Clean Architecture**: Separation of concerns with repository/service layers
- **Dependency Injection**: Manual DI without frameworks
- **Error Handling**: Proper Go error patterns with context
- **Database Integration**: Raw SQL with proper scanning
- **Struct Tags**: JSON and database field mapping

### Compared to Laravel/PHP
- **Models**: Structs with methods vs. Eloquent models
- **Migrations**: SQL files vs. Laravel schema builder
- **Routing**: Chi router vs. Laravel routes
- **Validation**: Manual validation vs. Laravel validators
- **ORM**: Raw SQL vs. Eloquent ORM

### Modern Full-Stack Concepts
- **API-First Design**: RESTful API with proper HTTP codes
- **UUID Primary Keys**: Better for distributed systems
- **Currency Handling**: Integer cents vs. floating point
- **Cultural Localization**: Indonesian-specific features

## 🤝 Contributing

1. Follow Go conventions and clean architecture patterns
2. Add proper error handling with context
3. Include database migrations for schema changes
4. Maintain Indonesian cultural context in features
5. Add comprehensive documentation for new features

This backend provides a solid foundation for Indonesian personal finance management with proper Go patterns, comprehensive database design, and cultural considerations.