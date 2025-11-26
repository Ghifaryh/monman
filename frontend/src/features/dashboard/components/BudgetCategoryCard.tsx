import { useState } from 'react';
import { formatRupiah } from '../../../lib/currency';

export interface BudgetTransaction {
  id: string;
  item: string;
  quantity?: string; // "× 2", "1/2 kg", "Rp 50.000", or empty
  amount: number; // in cents
  store?: string; // "Indomaret Jl. Sudirman", "Warung Bu Sari"
  date: string;
  category?: string; // for item suggestions
}

export interface BudgetCategoryCardProps {
  id: string;
  category: string;
  allocated: number; // in cents
  spent: number; // in cents
  period: 'weekly' | 'monthly' | 'yearly';
  transactions: BudgetTransaction[];
  lastPeriodSpent?: number; // for comparison
  onAddTransaction: (transaction: Omit<BudgetTransaction, 'id' | 'date'>) => void;
  onEditTransaction: (id: string, transaction: Partial<BudgetTransaction>) => void;
  onDeleteTransaction: (id: string) => void;
  commonPurchases?: Array<{
    item: string;
    quantity?: string;
    estimatedAmount: number; // default price, user can edit
    store?: string;
  }>;
  className?: string;
}

/**
 * Indonesian-optimized Budget Category Card
 *
 * Features:
 * - Flexible quantity tracking (weight, count, or value-based)
 * - Store location for price comparison
 * - Editable preset common purchases
 * - Period-over-period comparison
 * - Item name suggestions based on category history
 * - Mobile-first Indonesian shopping patterns
 */
export function BudgetCategoryCard({
  category,
  allocated,
  spent,
  period,
  transactions,
  lastPeriodSpent,
  onAddTransaction,
  onDeleteTransaction,
  commonPurchases = [],
  className = ''
}: BudgetCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    item: '',
    quantity: '',
    amount: 0,
    store: ''
  });

  // Calculate progress and remaining budget
  const remaining = allocated - spent;
  const progressPercentage = (spent / allocated) * 100;
  const isOverBudget = spent > allocated;

  // Period comparison
  const hasComparison = lastPeriodSpent !== undefined;
  const comparisonDiff = hasComparison ? spent - lastPeriodSpent! : 0;
  const comparisonPercentage = hasComparison && lastPeriodSpent! > 0
    ? ((comparisonDiff / lastPeriodSpent!) * 100)
    : 0;

  // Format period text in Indonesian context
  const getPeriodText = () => {
    switch (period) {
      case 'weekly': return 'minggu ini';
      case 'monthly': return 'bulan ini';
      case 'yearly': return 'tahun ini';
    }
  };

  const handleAddTransaction = () => {
    if (newTransaction.item && newTransaction.amount > 0) {
      onAddTransaction({
        item: newTransaction.item,
        quantity: newTransaction.quantity || undefined,
        amount: newTransaction.amount * 100, // convert to cents
        store: newTransaction.store || undefined
      });

      // Reset form
      setNewTransaction({ item: '', quantity: '', amount: 0, store: '' });
      setIsAddingTransaction(false);
    }
  };

  const handlePresetPurchase = (preset: typeof commonPurchases[0]) => {
    setNewTransaction({
      item: preset.item,
      quantity: preset.quantity || '',
      amount: preset.estimatedAmount / 100, // convert from cents to rupiah for display
      store: preset.store || ''
    });
    setIsAddingTransaction(true);
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Card Header - Always Visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{category}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getPeriodText()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatRupiah(remaining)}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{formatRupiah(spent)}</span>
            <span>{formatRupiah(allocated)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : progressPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{transactions.length} transaksi</span>
          <span>{progressPercentage.toFixed(0)}% terpakai</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          {/* Period Comparison */}
          {hasComparison && (
            <div className="p-4 border-b bg-white">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Perbandingan Periode</h4>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  Periode lalu: {formatRupiah(lastPeriodSpent!)}
                </span>
                <span className={`font-medium ${comparisonDiff >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {comparisonDiff >= 0 ? '+' : ''}{formatRupiah(Math.abs(comparisonDiff))}
                  {hasComparison && (
                    <span className="ml-1">
                      ({comparisonPercentage >= 0 ? '+' : ''}{comparisonPercentage.toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Common Purchases */}
          {commonPurchases.length > 0 && (
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pembelian Umum</h4>
              <div className="grid grid-cols-2 gap-2">
                {commonPurchases.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetPurchase(preset)}
                    className="text-left p-2 text-xs bg-white hover:bg-gray-50 rounded border border-gray-200 hover:border-blue-300 transition-colors dark:bg-blue-50 dark:hover:bg-blue-100 dark:border-blue-200"
                  >
                    <div className="font-medium text-gray-900 dark:text-blue-700">{preset.item}</div>
                    {preset.quantity && (
                      <div className="text-gray-600 dark:text-blue-600">{preset.quantity}</div>
                    )}
                    <div className="text-blue-600 dark:text-blue-700 font-medium">
                      ~{formatRupiah(preset.estimatedAmount)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Transaction Form */}
          {isAddingTransaction && (
            <div className="p-4 border-b bg-white">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Tambah Transaksi</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Item / Barang
                  </label>
                  <input
                    type="text"
                    value={newTransaction.item}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, item: e.target.value }))}
                    placeholder="Indomie Goreng, Ayam, Bensin..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Kuantitas (opsional)
                    </label>
                    <input
                      type="text"
                      value={newTransaction.quantity}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="× 2, 1/2 kg, dll"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={newTransaction.amount || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      placeholder="30000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tempat Beli (opsional)
                  </label>
                  <input
                    type="text"
                    value={newTransaction.store}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, store: e.target.value }))}
                    placeholder="Indomaret, Pasar Minggu, SPBU Shell..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleAddTransaction}
                    disabled={!newTransaction.item || newTransaction.amount <= 0}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setIsAddingTransaction(false)}
                    className="px-3 py-2 text-gray-600 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Transaction Button */}
          {!isAddingTransaction && (
            <div className="p-4 border-b">
              <button
                onClick={() => setIsAddingTransaction(true)}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-blue-700 dark:bg-blue-50 dark:border-blue-200 dark:hover:bg-blue-100 dark:focus:ring-blue-400"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Transaksi
              </button>
            </div>
          )}

          {/* Transaction List */}
          {transactions.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Riwayat Transaksi</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 bg-white rounded border text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {transaction.item}
                        {transaction.quantity && (
                          <span className="text-gray-600 ml-1">({transaction.quantity})</span>
                        )}
                      </div>
                      {transaction.store && (
                        <div className="text-xs text-gray-500 truncate">
                          📍 {transaction.store}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-medium text-gray-900">
                        {formatRupiah(transaction.amount)}
                      </div>
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}