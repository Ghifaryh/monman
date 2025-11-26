-- Sample Data for MonMan Development
-- This file populates the database with test data for development and testing
-- Run this after the main migrations for a complete development setup

-- Insert a test user with username
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'testuser', 'test@monman.com', '$2a$12$LUiWgN7d5fh5L0dOzIf5reKDX1h5x8Kx8Kx8Kx8Kx8Kx8Kx8Kx8K', 'John', 'Doe', true, now(), now())
ON CONFLICT (username) DO NOTHING;

-- Get the test user ID for foreign key relationships
DO $$
DECLARE
    test_user_id UUID;
    main_account_id UUID;
    credit_card_id UUID;
    cash_account_id UUID;
    food_category_id UUID;
    transport_category_id UUID;
    salary_category_id UUID;
    entertainment_category_id UUID;
BEGIN
    -- Get test user ID
    SELECT id INTO test_user_id FROM users WHERE email = 'test@monman.com';

    IF test_user_id IS NOT NULL THEN
        -- Insert sample accounts
        INSERT INTO accounts (id, user_id, name, account_type, bank_name, balance, is_default, color, is_active, created_at, updated_at) VALUES
        (gen_random_uuid(), test_user_id, 'Rekening Utama', 'bank', 'BCA', 254367000, true, '#3B82F6', true, now(), now()),
        (gen_random_uuid(), test_user_id, 'Kartu Kredit BCA', 'credit_card', 'BCA', -2500000, false, '#EF4444', true, now(), now()),
        (gen_random_uuid(), test_user_id, 'Dompet Tunai', 'cash', NULL, 50000000, false, '#10B981', true, now(), now()),
        (gen_random_uuid(), test_user_id, 'GoPay', 'ewallet', 'Gojek', 15000000, false, '#00AA13', true, now(), now());

        -- Get account IDs for transactions
        SELECT id INTO main_account_id FROM accounts WHERE user_id = test_user_id AND name = 'Rekening Utama';
        SELECT id INTO credit_card_id FROM accounts WHERE user_id = test_user_id AND name = 'Kartu Kredit BCA';
        SELECT id INTO cash_account_id FROM accounts WHERE user_id = test_user_id AND name = 'Dompet Tunai';

        -- Get category IDs for transactions
        SELECT id INTO food_category_id FROM categories WHERE name = 'Makanan & Minuman' AND is_system = true;
        SELECT id INTO transport_category_id FROM categories WHERE name = 'Transportasi' AND is_system = true;
        SELECT id INTO salary_category_id FROM categories WHERE name = 'Gaji Pokok (Gapok)' AND is_system = true;
        SELECT id INTO entertainment_category_id FROM categories WHERE name = 'Hiburan' AND is_system = true;

        -- Insert sample transactions (amounts in cents, matching frontend data)
        INSERT INTO transactions (id, user_id, account_id, category_id, amount, description, transaction_type, transaction_date, location_name, created_at, updated_at) VALUES
        -- Recent transactions
        (gen_random_uuid(), test_user_id, main_account_id, salary_category_id, 320000000, 'Gaji Bulanan - Transfer', 'income', CURRENT_DATE, NULL, now(), now()),
        (gen_random_uuid(), test_user_id, main_account_id, food_category_id, -12785000, 'Belanja di Supermarket', 'expense', CURRENT_DATE, 'Supermarket Hero', now(), now()),
        (gen_random_uuid(), test_user_id, credit_card_id, transport_category_id, -5230000, 'Shell - Isi Bensin', 'expense', CURRENT_DATE - INTERVAL '1 day', 'Shell Senayan', now(), now()),
        (gen_random_uuid(), test_user_id, credit_card_id, entertainment_category_id, -15990000, 'Netflix Bulanan', 'expense', CURRENT_DATE - INTERVAL '1 day', NULL, now(), now()),
        (gen_random_uuid(), test_user_id, main_account_id, food_category_id, -25670000, 'Belanja di Mall', 'expense', CURRENT_DATE - INTERVAL '2 days', 'Mall Central Park', now(), now()),

        -- Older transactions for history
        (gen_random_uuid(), test_user_id, main_account_id, transport_category_id, -15000000, 'Grab - Ke Kantor', 'expense', CURRENT_DATE - INTERVAL '3 days', NULL, now(), now()),
        (gen_random_uuid(), test_user_id, cash_account_id, food_category_id, -8500000, 'Makan Siang', 'expense', CURRENT_DATE - INTERVAL '4 days', 'Warteg Bahari', now(), now()),
        (gen_random_uuid(), test_user_id, main_account_id, salary_category_id, 50000000, 'Bonus Kinerja', 'income', CURRENT_DATE - INTERVAL '7 days', NULL, now(), now()),
        (gen_random_uuid(), test_user_id, credit_card_id, entertainment_category_id, -12000000, 'Bioskop CGV', 'expense', CURRENT_DATE - INTERVAL '10 days', 'CGV Grand Indonesia', now(), now()),
        (gen_random_uuid(), test_user_id, main_account_id, transport_category_id, -45000000, 'Bensin Motor', 'expense', CURRENT_DATE - INTERVAL '14 days', 'Pertamina', now(), now());

        -- Insert sample budgets
        INSERT INTO budgets (id, user_id, category_id, name, allocated_amount, spent_amount, budget_period, period_start_date, period_end_date, responsible_person, auto_reset, alert_percentage, is_active, created_at, updated_at) VALUES
        -- Monthly budgets
        (gen_random_uuid(), test_user_id, food_category_id, 'Budget Makanan Bulanan', 80000000, 38455000, 'monthly', DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, 'both', true, 80, true, now(), now()),
        (gen_random_uuid(), test_user_id, transport_category_id, 'Budget Transportasi Bulanan', 50000000, 65230000, 'monthly', DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, 'husband', true, 75, true, now(), now()),
        (gen_random_uuid(), test_user_id, entertainment_category_id, 'Budget Hiburan Bulanan', 30000000, 27990000, 'monthly', DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, 'wife', true, 90, true, now(), now()),

        -- Weekly budget
        (gen_random_uuid(), test_user_id, food_category_id, 'Budget Jajan Mingguan', 15000000, 8500000, 'weekly', DATE_TRUNC('week', CURRENT_DATE), (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::date, 'both', true, 85, true, now(), now());

        -- Insert sample income sources
        INSERT INTO income_sources (id, user_id, category_id, name, amount, frequency, source_type, employer_name, account_id, is_active, next_expected_date, created_at, updated_at) VALUES
        (gen_random_uuid(), test_user_id, salary_category_id, 'Gaji Pokok PT ABC', 320000000, 'monthly', 'salary', 'PT ABC Technology', main_account_id, true, (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date, now(), now());

        -- Get freelance category ID
        SELECT id INTO salary_category_id FROM categories WHERE name = 'Freelance' AND is_system = true;

        INSERT INTO income_sources (id, user_id, category_id, name, amount, frequency, source_type, employer_name, account_id, is_active, next_expected_date, created_at, updated_at) VALUES
        (gen_random_uuid(), test_user_id, salary_category_id, 'Proyek Website', 75000000, 'irregular', 'freelance', 'PT XYZ Digital', main_account_id, true, NULL, now(), now());

    END IF;
END $$;

-- Update account balances to match the sample transactions
-- (This will be handled automatically by the triggers, but let's ensure consistency)
UPDATE accounts SET balance = (
    SELECT COALESCE(SUM(t.amount), 0)
    FROM transactions t
    WHERE t.account_id = accounts.id
) WHERE user_id IN (SELECT id FROM users WHERE email = 'test@monman.com');

RAISE NOTICE 'Sample data inserted successfully for development/testing!';
RAISE NOTICE 'Test user email: test@monman.com';
RAISE NOTICE 'You can now use this data to test the API endpoints and frontend features.';