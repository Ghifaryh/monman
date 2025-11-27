-- MonMan Database Schema
-- Indonesian Personal Finance Management System
-- All monetary values stored as BIGINT in cents (Rupiah * 100) to avoid floating point precision issues

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table - Core user authentication and profile data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL, -- Primary login identifier
    email VARCHAR(255) UNIQUE, -- Optional email for notifications/recovery
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Accounts table - Financial accounts (Bank accounts, Credit cards, Cash, etc.)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Rekening Utama", "Kartu Kredit BCA"
    account_type VARCHAR(50) NOT NULL, -- "bank", "credit_card", "cash", "investment", "ewallet"
    bank_name VARCHAR(100), -- e.g., "BCA", "Mandiri", "BNI"
    account_number VARCHAR(50),
    balance BIGINT NOT NULL DEFAULT 0, -- Balance in cents (Rupiah * 100)
    credit_limit BIGINT DEFAULT NULL, -- For credit cards, in cents
    is_default BOOLEAN DEFAULT false, -- Default account for transactions
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI display
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories table - Transaction categories with support for income and expense types
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for system categories
    name VARCHAR(100) NOT NULL, -- e.g., "Makanan & Minuman", "Transportasi", "Gaji"
    category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('income', 'expense')),
    parent_category_id UUID REFERENCES categories(id), -- For subcategories
    icon VARCHAR(50) DEFAULT 'dollar-sign', -- Icon identifier for UI
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI display
    is_system BOOLEAN DEFAULT false, -- System-provided categories
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transactions table - Core financial transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    amount BIGINT NOT NULL, -- Amount in cents, negative for expenses, positive for income
    description TEXT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    receipt_image_url TEXT,
    location_name VARCHAR(200), -- e.g., "Shell Senayan", "Supermarket Hero"
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(20), -- "daily", "weekly", "monthly", "yearly"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transfer transactions (for account-to-account transfers)
CREATE TABLE transfer_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    from_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    to_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL, -- Amount in cents
    transfer_fee BIGINT DEFAULT 0, -- Fee in cents
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget categories - Budget management with person responsibility and UI customization
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Gas Budget Mingguan", "Belanja Bulanan"
    allocated_amount BIGINT NOT NULL, -- Budget amount in cents
    spent_amount BIGINT DEFAULT 0, -- Current spent amount in cents
    budget_period VARCHAR(20) NOT NULL CHECK (budget_period IN ('weekly', 'monthly', 'yearly')),
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    responsible_person VARCHAR(50), -- "husband", "wife", "both", or person name
    auto_reset BOOLEAN DEFAULT true, -- Auto reset when period ends
    alert_percentage INTEGER DEFAULT 80, -- Alert when spent reaches this percentage
    is_active BOOLEAN DEFAULT true,

    -- UI customization fields for Indonesian budget management
    icon VARCHAR(10) DEFAULT '📱', -- Emoji or icon identifier (🛒, ⛽, 💡)
    color VARCHAR(20) DEFAULT 'blue', -- Color scheme for UI (blue, yellow, green, etc.)
    sort_order INTEGER DEFAULT 0, -- For custom ordering in UI

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Ensure one budget per name per user
    CONSTRAINT unique_user_budget_name UNIQUE (user_id, name)
);

-- Income sources - Different types of income (Gaji, Tukin, Freelance, etc.)
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Gapok", "Tukin", "Freelance", "Presence Money"
    amount BIGINT NOT NULL, -- Expected amount in cents
    frequency VARCHAR(20) NOT NULL, -- "monthly", "weekly", "yearly", "irregular"
    source_type VARCHAR(50) NOT NULL, -- "salary", "freelance", "investment", "business"
    employer_name VARCHAR(100),
    account_id UUID REFERENCES accounts(id), -- Default receiving account
    is_active BOOLEAN DEFAULT true,
    next_expected_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recurring transactions template
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    frequency VARCHAR(20) NOT NULL, -- "daily", "weekly", "monthly", "yearly"
    frequency_interval INTEGER DEFAULT 1, -- Every X days/weeks/months/years
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for indefinite
    next_occurrence_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget common purchases - Pre-configured purchase suggestions for budget categories
CREATE TABLE budget_common_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    item VARCHAR(200) NOT NULL, -- e.g., "Indomie Goreng", "Bensin Premium"
    quantity VARCHAR(50), -- e.g., "× 5", "1/2 kg", "Rp 20.000"
    estimated_amount BIGINT NOT NULL, -- Estimated price in cents
    store VARCHAR(200), -- e.g., "Indomaret", "SPBU Shell"
    is_frequently_used BOOLEAN DEFAULT true, -- Show in quick-add suggestions
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget transactions - Enhanced transaction tracking with budget-specific metadata
CREATE TABLE budget_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item VARCHAR(200) NOT NULL, -- Specific item purchased
    quantity VARCHAR(50), -- Quantity with unit (e.g., "× 5", "1 kg")
    store VARCHAR(200), -- Where the purchase was made
    unit_price BIGINT, -- Price per unit in cents (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Ensure one budget transaction record per transaction
    CONSTRAINT unique_transaction_budget UNIQUE (transaction_id)
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_user_id_active ON accounts(user_id, is_active);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(category_type);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(period_start_date, period_end_date);
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_income_sources_user_id ON income_sources(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id, is_active);
CREATE INDEX idx_budget_common_purchases_budget ON budget_common_purchases(budget_id);
CREATE INDEX idx_budget_common_purchases_frequently_used ON budget_common_purchases(budget_id, is_frequently_used);
CREATE INDEX idx_budget_transactions_budget ON budget_transactions(budget_id);
CREATE INDEX idx_budget_transactions_user ON budget_transactions(user_id);
CREATE INDEX idx_budget_transactions_transaction ON budget_transactions(transaction_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON income_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_common_purchases_updated_at BEFORE UPDATE ON budget_common_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();