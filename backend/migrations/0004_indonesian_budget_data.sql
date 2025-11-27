-- Indonesian Budget Seed Data
-- Adds realistic Indonesian budget categories and common purchases to the enhanced budgets table

-- Indonesian budget categories with UI customization
INSERT INTO budgets (user_id, category_id, name, allocated_amount, budget_period, period_start_date, period_end_date, icon, color, sort_order, is_active)
SELECT
    u.id as user_id,
    c.id as category_id,
    budget_data.name,
    budget_data.allocated_amount,
    budget_data.budget_period,
    budget_data.period_start_date,
    budget_data.period_end_date,
    budget_data.icon,
    budget_data.color,
    budget_data.sort_order,
    true as is_active
FROM users u
CROSS JOIN categories c
CROSS JOIN (VALUES
    ('Belanja Bulanan', 150000000, 'monthly', '2025-11-01'::DATE, '2025-11-30'::DATE, '🛒', 'blue', 1),
    ('Bensin Motor', 20000000, 'weekly', '2025-11-24'::DATE, '2025-11-30'::DATE, '⛽', 'yellow', 2),
    ('Listrik & Air', 50000000, 'monthly', '2025-11-01'::DATE, '2025-11-30'::DATE, '💡', 'green', 3),
    ('Internet & Pulsa', 15000000, 'monthly', '2025-11-01'::DATE, '2025-11-30'::DATE, '📱', 'purple', 4),
    ('Transportasi', 30000000, 'monthly', '2025-11-01'::DATE, '2025-11-30'::DATE, '🚗', 'orange', 5),
    ('Makan di Luar', 40000000, 'monthly', '2025-11-01'::DATE, '2025-11-30'::DATE, '🍽️', 'red', 6),
    ('Kesehatan', 25000000, 'monthly', '2025-11-01'::DATE, '2025-11-30'::DATE, '💊', 'teal', 7),
    ('Pendidikan', 20000000, 'monthly', '2025-11-01'::DATE, '2025-11-30'::DATE, '📚', 'indigo', 8)
) AS budget_data(name, allocated_amount, budget_period, period_start_date, period_end_date, icon, color, sort_order)
WHERE u.username = 'testuser'
  AND c.name = 'Groceries / Belanja'
  AND c.category_type = 'expense'
  AND NOT EXISTS (
    SELECT 1 FROM budgets b
    WHERE b.user_id = u.id
    AND b.name = budget_data.name
  );

-- Common purchases for Belanja Bulanan
INSERT INTO budget_common_purchases (budget_id, item, quantity, estimated_amount, store, is_frequently_used, sort_order)
SELECT
    b.id,
    purchase_data.item,
    purchase_data.quantity,
    purchase_data.estimated_amount,
    purchase_data.store,
    purchase_data.is_frequently_used,
    purchase_data.sort_order
FROM budgets b
CROSS JOIN (VALUES
    ('Beras 5kg', '5 kg', 7500000, 'Pasar Minggu', true, 1),
    ('Minyak Goreng', '1 liter', 2500000, 'Indomaret', true, 2),
    ('Gula Pasir', '1 kg', 1500000, 'Alfamart', true, 3),
    ('Daging Ayam', '1 kg', 3500000, 'Pasar Tradisional', true, 4),
    ('Telur Ayam', '1 kg', 2800000, 'Indomaret', true, 5),
    ('Sayur Bayam', '1 ikat', 500000, 'Pasar Minggu', true, 6),
    ('Tomat', '1/2 kg', 800000, 'Pasar Tradisional', true, 7),
    ('Bawang Merah', '1/4 kg', 1200000, 'Pasar Minggu', true, 8)
) AS purchase_data(item, quantity, estimated_amount, store, is_frequently_used, sort_order)
WHERE b.name = 'Belanja Bulanan'
  AND b.user_id = (SELECT id FROM users WHERE username = 'testuser' LIMIT 1);

-- Common purchases for Bensin Motor
INSERT INTO budget_common_purchases (budget_id, item, quantity, estimated_amount, store, is_frequently_used, sort_order)
SELECT
    b.id,
    purchase_data.item,
    purchase_data.quantity,
    purchase_data.estimated_amount,
    purchase_data.store,
    purchase_data.is_frequently_used,
    purchase_data.sort_order
FROM budgets b
CROSS JOIN (VALUES
    ('Premium', 'Rp 20.000', 2000000, 'SPBU Shell', true, 1),
    ('Pertalite', 'Rp 15.000', 1500000, 'SPBU Pertamina', true, 2),
    ('Premium', 'Rp 50.000', 5000000, 'SPBU Shell', true, 3),
    ('Pertalite', 'Rp 25.000', 2500000, 'SPBU Pertamina', true, 4)
) AS purchase_data(item, quantity, estimated_amount, store, is_frequently_used, sort_order)
WHERE b.name = 'Bensin Motor'
  AND b.user_id = (SELECT id FROM users WHERE username = 'testuser' LIMIT 1);

-- Common purchases for Listrik & Air
INSERT INTO budget_common_purchases (budget_id, item, quantity, estimated_amount, store, is_frequently_used, sort_order)
SELECT
    b.id,
    purchase_data.item,
    purchase_data.quantity,
    purchase_data.estimated_amount,
    purchase_data.store,
    purchase_data.is_frequently_used,
    purchase_data.sort_order
FROM budgets b
CROSS JOIN (VALUES
    ('Token Listrik', 'Rp 100.000', 10000000, 'Mobile Banking', true, 1),
    ('Token Listrik', 'Rp 50.000', 5000000, 'Mobile Banking', true, 2),
    ('Tagihan Air PDAM', 'Bulanan', 15000000, 'Kantor PDAM', true, 3)
) AS purchase_data(item, quantity, estimated_amount, store, is_frequently_used, sort_order)
WHERE b.name = 'Listrik & Air'
  AND b.user_id = (SELECT id FROM users WHERE username = 'testuser' LIMIT 1);

-- Common purchases for Internet & Pulsa
INSERT INTO budget_common_purchases (budget_id, item, quantity, estimated_amount, store, is_frequently_used, sort_order)
SELECT
    b.id,
    purchase_data.item,
    purchase_data.quantity,
    purchase_data.estimated_amount,
    purchase_data.store,
    purchase_data.is_frequently_used,
    purchase_data.sort_order
FROM budgets b
CROSS JOIN (VALUES
    ('Paket Internet 30GB', 'Bulanan', 10000000, 'MyTelkomsel', true, 1),
    ('Pulsa Rp 25.000', '25k', 2500000, 'Indomaret', true, 2),
    ('WiFi IndiHome', 'Bulanan', 35000000, 'Auto Debit', true, 3)
) AS purchase_data(item, quantity, estimated_amount, store, is_frequently_used, sort_order)
WHERE b.name = 'Internet & Pulsa'
  AND b.user_id = (SELECT id FROM users WHERE username = 'testuser' LIMIT 1);

-- Common purchases for Makan di Luar
INSERT INTO budget_common_purchases (budget_id, item, quantity, estimated_amount, store, is_frequently_used, sort_order)
SELECT
    b.id,
    purchase_data.item,
    purchase_data.quantity,
    purchase_data.estimated_amount,
    purchase_data.store,
    purchase_data.is_frequently_used,
    purchase_data.sort_order
FROM budgets b
CROSS JOIN (VALUES
    ('Nasi Gudeg', '1 porsi', 1500000, 'Gudeg Jogja', true, 1),
    ('Ayam Geprek', '1 porsi', 2000000, 'Geprek Bensu', true, 2),
    ('Bakso Malang', '1 mangkok', 1800000, 'Bakso Lapangan Tembak', true, 3),
    ('McDonald''s', '1 paket', 4500000, 'McDonald''s', false, 4)
) AS purchase_data(item, quantity, estimated_amount, store, is_frequently_used, sort_order)
WHERE b.name = 'Makan di Luar'
  AND b.user_id = (SELECT id FROM users WHERE username = 'testuser' LIMIT 1);