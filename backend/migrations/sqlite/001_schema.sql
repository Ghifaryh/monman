-- MonMan SQLite schema (UUIDs stored as TEXT)
-- Money: BIGINT cents. Booleans: INTEGER 0/1

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth TEXT,
    profile_picture_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    email_verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'credit_card', 'cash', 'investment', 'ewallet')),
    bank_name TEXT,
    account_number TEXT,
    balance INTEGER NOT NULL DEFAULT 0,
    credit_limit INTEGER DEFAULT NULL,
    is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
    color TEXT DEFAULT '#3B82F6',
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_type TEXT NOT NULL CHECK (category_type IN ('income', 'expense')),
    parent_category_id TEXT REFERENCES categories(id),
    icon TEXT DEFAULT 'dollar-sign',
    color TEXT DEFAULT '#6B7280',
    is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    transaction_date TEXT NOT NULL DEFAULT (date('now')),
    notes TEXT,
    receipt_image_url TEXT,
    location_name TEXT,
    is_recurring INTEGER NOT NULL DEFAULT 0 CHECK (is_recurring IN (0, 1)),
    recurring_pattern TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transfer_transactions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    from_transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    to_transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transfer_fee INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    allocated_amount INTEGER NOT NULL,
    spent_amount INTEGER NOT NULL DEFAULT 0,
    budget_period TEXT NOT NULL CHECK (budget_period IN ('weekly', 'monthly', 'yearly')),
    period_start_date TEXT NOT NULL,
    period_end_date TEXT NOT NULL,
    responsible_person TEXT,
    auto_reset INTEGER NOT NULL DEFAULT 1 CHECK (auto_reset IN (0, 1)),
    alert_percentage INTEGER DEFAULT 80,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    icon TEXT DEFAULT '📱',
    color TEXT DEFAULT 'blue',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, name),
    CHECK (allocated_amount > 0 AND spent_amount >= 0)
);

CREATE TABLE IF NOT EXISTS income_sources (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'irregular')),
    source_type TEXT NOT NULL,
    employer_name TEXT,
    account_id TEXT REFERENCES accounts(id),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    next_expected_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    frequency TEXT NOT NULL,
    frequency_interval INTEGER DEFAULT 1,
    start_date TEXT NOT NULL,
    end_date TEXT,
    next_occurrence_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    expires_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budget_common_purchases (
    id TEXT PRIMARY KEY NOT NULL,
    budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    quantity TEXT,
    estimated_amount INTEGER NOT NULL,
    store TEXT,
    is_frequently_used INTEGER NOT NULL DEFAULT 1 CHECK (is_frequently_used IN (0, 1)),
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budget_transactions (
    id TEXT PRIMARY KEY NOT NULL,
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    quantity TEXT,
    store TEXT,
    unit_price INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id_active ON accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period_start_date, period_end_date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_budget_common_purchases_budget ON budget_common_purchases(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_common_purchases_frequently_used ON budget_common_purchases(budget_id, is_frequently_used);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_budget ON budget_transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_user ON budget_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_transaction ON budget_transactions(transaction_id);

-- Account balance: mirror transactions -> accounts.balance
CREATE TRIGGER IF NOT EXISTS tr_accounts_after_insert_tx
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
END;

CREATE TRIGGER IF NOT EXISTS tr_accounts_after_update_tx
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
END;

CREATE TRIGGER IF NOT EXISTS tr_accounts_after_delete_tx
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
END;

-- Budget spent: expense transactions only
CREATE TRIGGER IF NOT EXISTS tr_budgets_after_insert_tx
AFTER INSERT ON transactions
FOR EACH ROW
WHEN NEW.transaction_type = 'expense' AND NEW.category_id IS NOT NULL
BEGIN
    UPDATE budgets SET spent_amount = spent_amount + ABS(NEW.amount)
    WHERE user_id = NEW.user_id
      AND category_id = NEW.category_id
      AND period_start_date <= NEW.transaction_date
      AND period_end_date >= NEW.transaction_date
      AND is_active = 1;
END;

CREATE TRIGGER IF NOT EXISTS tr_budgets_after_update_tx
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    UPDATE budgets SET spent_amount = spent_amount - ABS(OLD.amount)
    WHERE OLD.transaction_type = 'expense' AND OLD.category_id IS NOT NULL
      AND user_id = OLD.user_id
      AND category_id = OLD.category_id
      AND period_start_date <= OLD.transaction_date
      AND period_end_date >= OLD.transaction_date
      AND is_active = 1;

    UPDATE budgets SET spent_amount = spent_amount + ABS(NEW.amount)
    WHERE NEW.transaction_type = 'expense' AND NEW.category_id IS NOT NULL
      AND user_id = NEW.user_id
      AND category_id = NEW.category_id
      AND period_start_date <= NEW.transaction_date
      AND period_end_date >= NEW.transaction_date
      AND is_active = 1;
END;

CREATE TRIGGER IF NOT EXISTS tr_budgets_after_delete_tx
AFTER DELETE ON transactions
FOR EACH ROW
WHEN OLD.transaction_type = 'expense' AND OLD.category_id IS NOT NULL
BEGIN
    UPDATE budgets SET spent_amount = spent_amount - ABS(OLD.amount)
    WHERE user_id = OLD.user_id
      AND category_id = OLD.category_id
      AND period_start_date <= OLD.transaction_date
      AND period_end_date >= OLD.transaction_date
      AND is_active = 1;
END;
