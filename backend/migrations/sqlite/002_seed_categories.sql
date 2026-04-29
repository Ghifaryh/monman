-- Default categories (system). INSERT OR REPLACE keeps re-runnable migrations safe.
INSERT OR REPLACE INTO categories (id, name, category_type, icon, color, is_system, is_active) VALUES
-- Food & Beverages
('7f8bc71e-7786-4329-a3f5-2d0ec63a7d6a', 'Makanan & Minuman', 'expense', 'utensils', '#EF4444', 1, 1),
('2b3801da-dd3c-414e-8f61-37dbe450ed22', 'Groceries / Belanja', 'expense', 'shopping-cart', '#F97316', 1, 1),
('583bf834-22b7-476c-a701-4965437992a7', 'Restoran & Cafe', 'expense', 'coffee', '#F59E0B', 1, 1),

-- Transportation
('af34ebb3-a0ca-45d4-9253-cb5197a7baca', 'Transportasi', 'expense', 'car', '#10B981', 1, 1),
('de16c845-c10a-4a5a-8c0e-9114366f9862', 'Bensin / BBM', 'expense', 'fuel', '#059669', 1, 1),
('6c2d58fc-0aa7-4df8-8fb4-e022be9cea08', 'Ojek / Taxi Online', 'expense', 'motorcycle', '#06B6D4', 1, 1),
('698ba6c9-7b81-4308-bfc9-a2d00ef7f431', 'Parkir & Tol', 'expense', 'road', '#0891B2', 1, 1),

-- Utilities & Bills
('4e279d48-58c7-4230-a1b2-4519f044957c', 'Listrik', 'expense', 'zap', '#FBBF24', 1, 1),
('7573ea65-c12f-4dce-a6bb-830c98cc47f5', 'Air', 'expense', 'droplet', '#3B82F6', 1, 1),
('2f7067d9-4061-4b83-ac59-daa6014bbc24', 'Internet & Telepon', 'expense', 'wifi', '#6366F1', 1, 1),
('73f0f355-78e0-43e2-9cea-ca66c0f93f27', 'Gas (LPG)', 'expense', 'flame', '#DC2626', 1, 1),

-- Healthcare
('248ca260-3513-4e83-8530-f9126ad514db', 'Kesehatan', 'expense', 'heart', '#EC4899', 1, 1),
('274a629f-4843-4b91-a5c0-5e747e5d6d6c', 'Obat-obatan', 'expense', 'pill', '#BE185D', 1, 1),
('0240bf55-d513-4786-93ad-653911c97e12', 'Dokter & Rumah Sakit', 'expense', 'stethoscope', '#C2185B', 1, 1),

-- Education
('5bc6d69a-6fa1-498c-b501-11890ed24c49', 'Pendidikan', 'expense', 'book', '#8B5CF6', 1, 1),
('cb84c95c-cbf5-4b11-9011-bdb2ba483f72', 'Kursus & Pelatihan', 'expense', 'graduation-cap', '#7C3AED', 1, 1),

-- Entertainment
('f8c83306-4910-4b3e-a60a-f2a60a4fb374', 'Hiburan', 'expense', 'film', '#F472B6', 1, 1),
('eb7a3bc2-5594-4c1c-a0dc-5d163f959959', 'Streaming (Netflix, dll)', 'expense', 'tv', '#E879F9', 1, 1),
('cf6b5c41-c3e3-42d3-9912-5c17c6c18aea', 'Bioskop & Konser', 'expense', 'ticket', '#D946EF', 1, 1),

-- Shopping
('f6c84896-5bee-4f1c-b13f-87971dd701b5', 'Belanja Pakaian', 'expense', 'shirt', '#A855F7', 1, 1),
('7a8accf8-dcda-44dd-acba-8a5ea7095fcd', 'Elektronik', 'expense', 'smartphone', '#9333EA', 1, 1),
('71129691-a7f9-4616-8b1d-0d0ce7906fc8', 'Kosmetik & Perawatan', 'expense', 'sparkles', '#EC4899', 1, 1),

-- Housing
('734a5178-f7ea-427b-974d-9b3c0f2b686e', 'Sewa / Cicilan Rumah', 'expense', 'home', '#6B7280', 1, 1),
('d2b5c77f-4362-425f-a017-67b2cb36c28b', 'Perawatan Rumah', 'expense', 'wrench', '#4B5563', 1, 1),

-- Financial
('6b0c39fa-0352-4e23-b598-4d695ed1fa63', 'Asuransi', 'expense', 'shield', '#374151', 1, 1),
('a16b22be-2149-4723-8a05-fe4ecc5494e5', 'Investasi', 'expense', 'trending-up', '#1F2937', 1, 1),
('9e6b8f85-8b84-4c32-8c0f-2b12c4ce8cd7', 'Pajak', 'expense', 'receipt', '#111827', 1, 1),

-- Others
('ea983318-bf42-4465-b4ca-cdd3a3a42a8e', 'Donasi & Zakat', 'expense', 'gift', '#059669', 1, 1),
('aae95140-25c8-4cb8-808b-59aee555b24c', 'Lain-lain', 'expense', 'more-horizontal', '#9CA3AF', 1, 1);

-- Insert default income categories
INSERT OR REPLACE INTO categories (id, name, category_type, icon, color, is_system, is_active) VALUES
-- Salary & Work Income
('9dbff79b-7ee6-4409-bf73-52639d3aa74d', 'Gaji Pokok (Gapok)', 'income', 'banknote', '#10B981', 1, 1),
('9a5f48ec-00e0-424d-8db2-95cb4e48f02a', 'Tunjangan Kinerja (Tukin)', 'income', 'award', '#059669', 1, 1),
('1fb7d7e0-3ced-484d-829b-f691640127c3', 'Tunjangan Kehadiran', 'income', 'clock', '#047857', 1, 1),
('57997ef4-f5f9-4df9-9923-64e1491501d2', 'Lembur', 'income', 'clock-plus', '#065F46', 1, 1),
('268fe9e2-1f50-442f-87f1-d8e63aa02425', 'Bonus', 'income', 'gift', '#34D399', 1, 1),

-- Business & Freelance
('d568c433-50ff-4f5d-9941-e47501486bfc', 'Freelance', 'income', 'briefcase', '#3B82F6', 1, 1),
('6a24bdf6-f193-497b-83f7-f88835a05a1f', 'Bisnis Sampingan', 'income', 'store', '#2563EB', 1, 1),
('e900aebc-0313-411e-ab04-b05d0eaf3824', 'Komisi Penjualan', 'income', 'handshake', '#1D4ED8', 1, 1),

-- Investments & Passive Income
('60e931cd-772a-4df5-a902-b9ad0a372080', 'Dividen Saham', 'income', 'trending-up', '#7C3AED', 1, 1),
('0bb36c79-b83c-4006-8493-6d4382b09a60', 'Bunga Deposito', 'income', 'piggy-bank', '#6D28D9', 1, 1),
('5958844e-15c2-4e5c-9028-2b2294dc5390', 'Hasil Investasi', 'income', 'chart-line', '#5B21B6', 1, 1),

-- Other Income
('1f8de24b-ae01-4b38-a484-33779ffd0491', 'Hadiah & Hibah', 'income', 'gift', '#EC4899', 1, 1),
('9a5b4333-bdd2-4e48-b60b-f01056f1d2c0', 'Penjualan Barang', 'income', 'shopping-bag', '#BE185D', 1, 1),
('fe1fb8e2-53f4-4895-8379-5ce52450be49', 'Cashback', 'income', 'credit-card', '#A21CAF', 1, 1),
('3d320c86-88bc-43bf-9daa-6e0fcf5ab5f5', 'Pendapatan Lainnya', 'income', 'plus-circle', '#059669', 1, 1);
