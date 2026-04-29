-- Extra sample data for username `testuser` (id from 003_seed_users)
-- Run AFTER 002 + 003; triggers maintain account balances and budget spent.

DELETE FROM budget_common_purchases WHERE budget_id IN (
  SELECT id FROM budgets WHERE user_id = 'd5f55c34-51f3-4543-93d9-ba05b7221f8f'
);
DELETE FROM budgets WHERE user_id = 'd5f55c34-51f3-4543-93d9-ba05b7221f8f';
DELETE FROM income_sources WHERE user_id = 'd5f55c34-51f3-4543-93d9-ba05b7221f8f';
DELETE FROM transactions WHERE user_id = 'd5f55c34-51f3-4543-93d9-ba05b7221f8f';
DELETE FROM accounts WHERE user_id = 'd5f55c34-51f3-4543-93d9-ba05b7221f8f';

INSERT INTO accounts (id, user_id, name, account_type, bank_name, balance, is_default, color, is_active, created_at, updated_at)
VALUES
    ('a1000001-0000-4000-8000-000000000001', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'Rekening Utama', 'bank', 'BCA', 0, 1, '#3B82F6', 1, datetime('now'), datetime('now')),
    ('a1000001-0000-4000-8000-000000000002', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'Kartu Kredit BCA', 'credit_card', 'BCA', 0, 0, '#EF4444', 1, datetime('now'), datetime('now')),
    ('a1000001-0000-4000-8000-000000000003', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'Dompet Tunai', 'cash', NULL, 0, 0, '#10B981', 1, datetime('now'), datetime('now')),
    ('a1000001-0000-4000-8000-000000000004', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'GoPay', 'ewallet', 'Gojek', 0, 0, '#00AA13', 1, datetime('now'), datetime('now'));

-- Budget periods: current calendar month and current week (simple)
INSERT INTO budgets (id, user_id, category_id, name, allocated_amount, spent_amount, budget_period, period_start_date, period_end_date, responsible_person, auto_reset, alert_percentage, is_active, created_at, updated_at)
VALUES
    ('b1000001-0000-4000-8000-000000000001', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', '7f8bc71e-7786-4329-a3f5-2d0ec63a7d6a', 'Budget Makanan Bulanan', 80000000, 0, 'monthly',
     strftime('%Y-%m-%d', DATE('now','localtime'), 'start of month'), strftime('%Y-%m-%d', DATE('now','localtime','start of month','+1 month','-1 day')),
     'both', 1, 80, 1, datetime('now'), datetime('now')),
    ('b1000001-0000-4000-8000-000000000002', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'af34ebb3-a0ca-45d4-9253-cb5197a7baca', 'Budget Transportasi Bulanan', 50000000, 0, 'monthly',
     strftime('%Y-%m-%d', DATE('now','localtime'), 'start of month'), strftime('%Y-%m-%d', DATE('now','localtime','start of month','+1 month','-1 day')),
     'husband', 1, 75, 1, datetime('now'), datetime('now')),
    ('b1000001-0000-4000-8000-000000000003', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'f8c83306-4910-4b3e-a60a-f2a60a4fb374', 'Budget Hiburan Bulanan', 30000000, 0, 'monthly',
     strftime('%Y-%m-%d', DATE('now','localtime'), 'start of month'), strftime('%Y-%m-%d', DATE('now','localtime','start of month','+1 month','-1 day')),
     'wife', 1, 90, 1, datetime('now'), datetime('now')),
    ('b1000001-0000-4000-8000-000000000004', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', '7f8bc71e-7786-4329-a3f5-2d0ec63a7d6a', 'Budget Jajan Mingguan', 15000000, 0, 'weekly',
     DATE('now'), DATE('now','+6 days'),
     'both', 1, 85, 1, datetime('now'), datetime('now'));

INSERT INTO transactions (id, user_id, account_id, category_id, amount, description, transaction_type, transaction_date, location_name, created_at, updated_at)
VALUES
    ('c1000001-0000-4000-a000-000000000001', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000001', '9dbff79b-7ee6-4409-bf73-52639d3aa74d', 320000000, 'Gaji Bulanan - Transfer', 'income', DATE('now'), NULL, datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000002', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000001', '7f8bc71e-7786-4329-a3f5-2d0ec63a7d6a', -12785000, 'Belanja di Supermarket', 'expense', DATE('now'), 'Supermarket Hero', datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000003', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000002', 'af34ebb3-a0ca-45d4-9253-cb5197a7baca', -5230000, 'Shell - Isi Bensin', 'expense', DATE('now','-1 day'), 'Shell Senayan', datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000004', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000002', 'f8c83306-4910-4b3e-a60a-f2a60a4fb374', -15990000, 'Netflix Bulanan', 'expense', DATE('now','-1 day'), NULL, datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000005', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000001', '7f8bc71e-7786-4329-a3f5-2d0ec63a7d6a', -25670000, 'Belanja di Mall', 'expense', DATE('now','-2 days'), 'Mall Central Park', datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000006', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000001', 'af34ebb3-a0ca-45d4-9253-cb5197a7baca', -15000000, 'Grab - Ke Kantor', 'expense', DATE('now','-3 days'), NULL, datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000007', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000003', '7f8bc71e-7786-4329-a3f5-2d0ec63a7d6a', -8500000, 'Makan Siang', 'expense', DATE('now','-4 days'), 'Warteg Bahari', datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000008', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000001', '268fe9e2-1f50-442f-87f1-d8e63aa02425', 50000000, 'Bonus Kinerja', 'income', DATE('now','-7 days'), NULL, datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-000000000009', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000002', 'f8c83306-4910-4b3e-a60a-f2a60a4fb374', -12000000, 'Bioskop CGV', 'expense', DATE('now','-10 days'), 'CGV Grand Indonesia', datetime('now'), datetime('now')),
    ('c1000001-0000-4000-a000-00000000000a', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'a1000001-0000-4000-8000-000000000001', 'af34ebb3-a0ca-45d4-9253-cb5197a7baca', -45000000, 'Bensin Motor', 'expense', DATE('now','-14 days'), 'Pertamina', datetime('now'), datetime('now'));

INSERT INTO income_sources (id, user_id, category_id, name, amount, frequency, source_type, employer_name, account_id, is_active, next_expected_date, created_at, updated_at)
VALUES
    ('i1000001-0000-4000-8000-000000000001', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', '9dbff79b-7ee6-4409-bf73-52639d3aa74d', 'Gaji Pokok PT ABC', 320000000, 'monthly', 'salary', 'PT ABC Technology', 'a1000001-0000-4000-8000-000000000001', 1,
     strftime('%Y-%m-%d', DATE('now','localtime','start of month','+1 month')), datetime('now'), datetime('now'));

INSERT INTO income_sources (id, user_id, category_id, name, amount, frequency, source_type, employer_name, account_id, is_active, next_expected_date, created_at, updated_at)
VALUES
    ('i1000001-0000-4000-8000-000000000002', 'd5f55c34-51f3-4543-93d9-ba05b7221f8f', 'd568c433-50ff-4f5d-9941-e47501486bfc', 'Proyek Website', 75000000, 'irregular', 'freelance', 'PT XYZ Digital', 'a1000001-0000-4000-8000-000000000001', 1, NULL, datetime('now'), datetime('now'));
