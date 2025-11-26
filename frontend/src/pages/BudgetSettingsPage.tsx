import { useState } from 'react';
import { formatRupiah } from '../lib/currency';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number; // in cents
  period: 'weekly' | 'monthly' | 'yearly';
  color: string;
  icon: string;
  isActive: boolean;
  commonPurchases: Array<{
    item: string;
    quantity?: string;
    estimatedAmount: number;
    store?: string;
  }>;
}

/**
 * Option 2: Dedicated Budget Settings Page
 *
 * This shows a comprehensive budget management interface where users can:
 * - Create new budget categories
 * - Set allocation amounts and periods
 * - Configure common purchases for each category
 * - Enable/disable categories
 * - Use Indonesian shopping presets
 */
export function BudgetSettingsPage() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Belanja Bulanan',
      allocated: 150000000, // 1.5M in cents
      period: 'monthly',
      color: 'blue',
      icon: '🛒',
      isActive: true,
      commonPurchases: [
        { item: 'Beras 5kg', estimatedAmount: 7500000, store: 'Pasar Minggu' },
        { item: 'Minyak Goreng', estimatedAmount: 2500000, store: 'Indomaret' },
        { item: 'Gula Pasir', estimatedAmount: 1500000 },
        { item: 'Daging Ayam', quantity: '1kg', estimatedAmount: 3500000 },
      ]
    },
    {
      id: '2',
      name: 'Bensin Motor',
      allocated: 20000000, // 200k in cents
      period: 'weekly',
      color: 'yellow',
      icon: '⛽',
      isActive: true,
      commonPurchases: [
        { item: 'Premium', quantity: 'Rp 20.000', estimatedAmount: 2000000, store: 'SPBU Shell' },
        { item: 'Pertalite', quantity: 'Rp 15.000', estimatedAmount: 1500000, store: 'SPBU Pertamina' },
      ]
    },
    {
      id: '3',
      name: 'Listrik & Air',
      allocated: 50000000, // 500k in cents
      period: 'monthly',
      color: 'green',
      icon: '💡',
      isActive: true,
      commonPurchases: [
        { item: 'Token Listrik', quantity: 'Rp 100.000', estimatedAmount: 10000000 },
        { item: 'Tagihan Air', estimatedAmount: 15000000 },
      ]
    }
  ]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    allocated: 0,
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    color: 'blue',
    icon: '📱'
  });

  // Indonesian category presets
  const categoryPresets = [
    { name: 'Belanja Bulanan', icon: '🛒', color: 'blue', suggestedAmount: 150000000, period: 'monthly' as const },
    { name: 'Bensin Motor', icon: '⛽', color: 'yellow', suggestedAmount: 20000000, period: 'weekly' as const },
    { name: 'Listrik & Air', icon: '💡', color: 'green', suggestedAmount: 50000000, period: 'monthly' as const },
    { name: 'Internet & Pulsa', icon: '📱', color: 'purple', suggestedAmount: 15000000, period: 'monthly' as const },
    { name: 'Transportasi', icon: '🚗', color: 'orange', suggestedAmount: 30000000, period: 'monthly' as const },
    { name: 'Makan di Luar', icon: '🍽️', color: 'red', suggestedAmount: 40000000, period: 'monthly' as const },
    { name: 'Kesehatan', icon: '💊', color: 'teal', suggestedAmount: 25000000, period: 'monthly' as const },
    { name: 'Pendidikan', icon: '📚', color: 'indigo', suggestedAmount: 20000000, period: 'monthly' as const },
  ];

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.allocated > 0) {
      const category: BudgetCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        allocated: newCategory.allocated * 100, // Convert to cents
        period: newCategory.period,
        color: newCategory.color,
        icon: newCategory.icon,
        isActive: true,
        commonPurchases: []
      };

      setBudgetCategories(prev => [...prev, category]);
      setNewCategory({ name: '', allocated: 0, period: 'monthly', color: 'blue', icon: '📱' });
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = (id: string, updates: Partial<BudgetCategory>) => {
    setBudgetCategories(prev =>
      prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    );
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Yakin ingin menghapus kategori budget ini?')) {
      setBudgetCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const handlePresetSelect = (preset: typeof categoryPresets[0]) => {
    setNewCategory({
      name: preset.name,
      allocated: preset.suggestedAmount / 100, // Convert to rupiah for display
      period: preset.period as 'weekly' | 'monthly',
      color: preset.color,
      icon: preset.icon
    });
    setIsAddingCategory(true);
  };

  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Budget</h1>
        <p className="text-gray-600 mb-4">
          Kelola kategori budget dan alokasi pengeluaran bulanan Anda
        </p>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Total Budget Aktif</h3>
              <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalBudget)}</p>
            </div>
            <div className="text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Kategori Indonesia</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetSelect(preset)}
              className="p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg border hover:border-blue-300 transition-colors"
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <div className="text-sm font-medium text-gray-900">{preset.name}</div>
              <div className="text-xs text-gray-500">
                ~{formatRupiah(preset.suggestedAmount)}/{preset.period === 'monthly' ? 'bulan' : 'minggu'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Categories List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Kategori Budget</h2>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Tambah Kategori Baru
            </button>
          </div>
        </div>

        <div className="divide-y">
          {budgetCategories.map((category) => (
            <div key={category.id} className="p-6">
              {editingCategory === category.id ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Kategori
                      </label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget (Rp)
                      </label>
                      <input
                        type="number"
                        value={category.allocated / 100}
                        onChange={(e) => handleUpdateCategory(category.id, { allocated: Number(e.target.value) * 100 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Periode
                      </label>
                      <select
                        value={category.period}
                        onChange={(e) => handleUpdateCategory(category.id, { period: e.target.value as 'weekly' | 'monthly' | 'yearly' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                        <option value="yearly">Tahunan</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Simpan Kategori
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatRupiah(category.allocated)} / {category.period === 'weekly' ? 'minggu' : category.period === 'monthly' ? 'bulan' : 'tahun'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.isActive}
                        onChange={(e) => handleUpdateCategory(category.id, { isActive: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Aktif</span>
                    </label>

                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tambah Kategori Baru</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Misalnya: Transportasi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (Rp)
                  </label>
                  <input
                    type="number"
                    value={newCategory.allocated || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, allocated: Number(e.target.value) }))}
                    placeholder="500000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periode
                  </label>
                  <select
                    value={newCategory.period}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, period: e.target.value as 'weekly' | 'monthly' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon & Nama
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">+</span>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nama kategori"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name || newCategory.allocated <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Tambah Kategori
              </button>
              <button
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}