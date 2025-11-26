-- Seed Data for MonMan
-- Default categories and sample data for Indonesian personal finance management

-- Insert default expense categories
INSERT INTO categories (id, name, category_type, icon, color, is_system, is_active) VALUES
-- Food & Beverages
(gen_random_uuid(), 'Makanan & Minuman', 'expense', 'utensils', '#EF4444', true, true),
(gen_random_uuid(), 'Groceries / Belanja', 'expense', 'shopping-cart', '#F97316', true, true),
(gen_random_uuid(), 'Restoran & Cafe', 'expense', 'coffee', '#F59E0B', true, true),

-- Transportation
(gen_random_uuid(), 'Transportasi', 'expense', 'car', '#10B981', true, true),
(gen_random_uuid(), 'Bensin / BBM', 'expense', 'fuel', '#059669', true, true),
(gen_random_uuid(), 'Ojek / Taxi Online', 'expense', 'motorcycle', '#06B6D4', true, true),
(gen_random_uuid(), 'Parkir & Tol', 'expense', 'road', '#0891B2', true, true),

-- Utilities & Bills
(gen_random_uuid(), 'Listrik', 'expense', 'zap', '#FBBF24', true, true),
(gen_random_uuid(), 'Air', 'expense', 'droplet', '#3B82F6', true, true),
(gen_random_uuid(), 'Internet & Telepon', 'expense', 'wifi', '#6366F1', true, true),
(gen_random_uuid(), 'Gas (LPG)', 'expense', 'flame', '#DC2626', true, true),

-- Healthcare
(gen_random_uuid(), 'Kesehatan', 'expense', 'heart', '#EC4899', true, true),
(gen_random_uuid(), 'Obat-obatan', 'expense', 'pill', '#BE185D', true, true),
(gen_random_uuid(), 'Dokter & Rumah Sakit', 'expense', 'stethoscope', '#C2185B', true, true),

-- Education
(gen_random_uuid(), 'Pendidikan', 'expense', 'book', '#8B5CF6', true, true),
(gen_random_uuid(), 'Kursus & Pelatihan', 'expense', 'graduation-cap', '#7C3AED', true, true),

-- Entertainment
(gen_random_uuid(), 'Hiburan', 'expense', 'film', '#F472B6', true, true),
(gen_random_uuid(), 'Streaming (Netflix, dll)', 'expense', 'tv', '#E879F9', true, true),
(gen_random_uuid(), 'Bioskop & Konser', 'expense', 'ticket', '#D946EF', true, true),

-- Shopping
(gen_random_uuid(), 'Belanja Pakaian', 'expense', 'shirt', '#A855F7', true, true),
(gen_random_uuid(), 'Elektronik', 'expense', 'smartphone', '#9333EA', true, true),
(gen_random_uuid(), 'Kosmetik & Perawatan', 'expense', 'sparkles', '#EC4899', true, true),

-- Housing
(gen_random_uuid(), 'Sewa / Cicilan Rumah', 'expense', 'home', '#6B7280', true, true),
(gen_random_uuid(), 'Perawatan Rumah', 'expense', 'wrench', '#4B5563', true, true),

-- Financial
(gen_random_uuid(), 'Asuransi', 'expense', 'shield', '#374151', true, true),
(gen_random_uuid(), 'Investasi', 'expense', 'trending-up', '#1F2937', true, true),
(gen_random_uuid(), 'Pajak', 'expense', 'receipt', '#111827', true, true),

-- Others
(gen_random_uuid(), 'Donasi & Zakat', 'expense', 'gift', '#059669', true, true),
(gen_random_uuid(), 'Lain-lain', 'expense', 'more-horizontal', '#9CA3AF', true, true);

-- Insert default income categories
INSERT INTO categories (id, name, category_type, icon, color, is_system, is_active) VALUES
-- Salary & Work Income
(gen_random_uuid(), 'Gaji Pokok (Gapok)', 'income', 'banknote', '#10B981', true, true),
(gen_random_uuid(), 'Tunjangan Kinerja (Tukin)', 'income', 'award', '#059669', true, true),
(gen_random_uuid(), 'Tunjangan Kehadiran', 'income', 'clock', '#047857', true, true),
(gen_random_uuid(), 'Lembur', 'income', 'clock-plus', '#065F46', true, true),
(gen_random_uuid(), 'Bonus', 'income', 'gift', '#34D399', true, true),

-- Business & Freelance
(gen_random_uuid(), 'Freelance', 'income', 'briefcase', '#3B82F6', true, true),
(gen_random_uuid(), 'Bisnis Sampingan', 'income', 'store', '#2563EB', true, true),
(gen_random_uuid(), 'Komisi Penjualan', 'income', 'handshake', '#1D4ED8', true, true),

-- Investments & Passive Income
(gen_random_uuid(), 'Dividen Saham', 'income', 'trending-up', '#7C3AED', true, true),
(gen_random_uuid(), 'Bunga Deposito', 'income', 'piggy-bank', '#6D28D9', true, true),
(gen_random_uuid(), 'Hasil Investasi', 'income', 'chart-line', '#5B21B6', true, true),

-- Other Income
(gen_random_uuid(), 'Hadiah & Hibah', 'income', 'gift', '#EC4899', true, true),
(gen_random_uuid(), 'Penjualan Barang', 'income', 'shopping-bag', '#BE185D', true, true),
(gen_random_uuid(), 'Cashback', 'income', 'credit-card', '#A21CAF', true, true),
(gen_random_uuid(), 'Pendapatan Lainnya', 'income', 'plus-circle', '#059669', true, true);

-- Create a function to automatically update account balances when transactions are inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        UPDATE accounts
        SET balance = balance + NEW.amount
        WHERE id = NEW.account_id;
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Revert old amount
        UPDATE accounts
        SET balance = balance - OLD.amount
        WHERE id = OLD.account_id;

        -- Apply new amount
        UPDATE accounts
        SET balance = balance + NEW.amount
        WHERE id = NEW.account_id;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE accounts
        SET balance = balance - OLD.amount
        WHERE id = OLD.account_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update account balances
CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balance();

-- Create a function to automatically update budget spent amounts
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process expense transactions
    IF (TG_OP = 'INSERT' AND NEW.transaction_type = 'expense') THEN
        UPDATE budgets
        SET spent_amount = spent_amount + ABS(NEW.amount)
        WHERE user_id = NEW.user_id
        AND category_id = NEW.category_id
        AND period_start_date <= NEW.transaction_date
        AND period_end_date >= NEW.transaction_date
        AND is_active = true;
        RETURN NEW;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
        -- Revert old amount if it was an expense
        IF OLD.transaction_type = 'expense' THEN
            UPDATE budgets
            SET spent_amount = spent_amount - ABS(OLD.amount)
            WHERE user_id = OLD.user_id
            AND category_id = OLD.category_id
            AND period_start_date <= OLD.transaction_date
            AND period_end_date >= OLD.transaction_date
            AND is_active = true;
        END IF;

        -- Apply new amount if it's an expense
        IF NEW.transaction_type = 'expense' THEN
            UPDATE budgets
            SET spent_amount = spent_amount + ABS(NEW.amount)
            WHERE user_id = NEW.user_id
            AND category_id = NEW.category_id
            AND period_start_date <= NEW.transaction_date
            AND period_end_date >= NEW.transaction_date
            AND is_active = true;
        END IF;
        RETURN NEW;
    END IF;

    IF (TG_OP = 'DELETE' AND OLD.transaction_type = 'expense') THEN
        UPDATE budgets
        SET spent_amount = spent_amount - ABS(OLD.amount)
        WHERE user_id = OLD.user_id
        AND category_id = OLD.category_id
        AND period_start_date <= OLD.transaction_date
        AND period_end_date >= OLD.transaction_date
        AND is_active = true;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update budget spent amounts
CREATE TRIGGER trigger_update_budget_spent
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_spent();

-- Add some constraints and check functions
ALTER TABLE accounts ADD CONSTRAINT check_account_type
    CHECK (account_type IN ('bank', 'credit_card', 'cash', 'investment', 'ewallet'));

ALTER TABLE budgets ADD CONSTRAINT check_budget_period
    CHECK (budget_period IN ('weekly', 'monthly', 'yearly'));

ALTER TABLE budgets ADD CONSTRAINT check_positive_amounts
    CHECK (allocated_amount > 0 AND spent_amount >= 0);

ALTER TABLE income_sources ADD CONSTRAINT check_income_frequency
    CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'irregular'));

-- Function to create a new budget period (auto-reset functionality)
CREATE OR REPLACE FUNCTION create_new_budget_period(budget_id UUID)
RETURNS VOID AS $$
DECLARE
    budget_rec budgets%ROWTYPE;
    new_start_date DATE;
    new_end_date DATE;
BEGIN
    SELECT * INTO budget_rec FROM budgets WHERE id = budget_id;

    IF budget_rec.budget_period = 'weekly' THEN
        new_start_date := budget_rec.period_end_date + INTERVAL '1 day';
        new_end_date := new_start_date + INTERVAL '6 days';
    ELSIF budget_rec.budget_period = 'monthly' THEN
        new_start_date := budget_rec.period_end_date + INTERVAL '1 day';
        new_end_date := new_start_date + INTERVAL '1 month' - INTERVAL '1 day';
    ELSIF budget_rec.budget_period = 'yearly' THEN
        new_start_date := budget_rec.period_end_date + INTERVAL '1 day';
        new_end_date := new_start_date + INTERVAL '1 year' - INTERVAL '1 day';
    END IF;

    UPDATE budgets
    SET period_start_date = new_start_date,
        period_end_date = new_end_date,
        spent_amount = 0
    WHERE id = budget_id;
END;
$$ LANGUAGE plpgsql;