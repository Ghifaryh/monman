import { useState } from 'react';
import { formatRupiah } from '../lib/currency';
import { BudgetCategoryCard } from '../features/dashboard/components/BudgetCategoryCard';
import { BudgetCardWithInlineEdit } from '../components/BudgetCardWithInlineEdit';
import type { BudgetTransaction } from '../features/dashboard/components/BudgetCategoryCard';

/**
 * Budget Management Examples Showcase
 *
 * Demonstrates two approaches for budget management:
 * 1. Inline editing within cards
 * 2. Dedicated budget settings page
 */
export function BudgetManagementShowcase() {
  const [transactions] = useState<BudgetTransaction[]>([
    {
      id: '1',
      item: 'Indomie Goreng',
      quantity: '× 10',
      amount: 2500000, // 25k in cents
      store: 'Indomaret Jl. Sudirman',
      date: '2024-11-25'
    },
    {
      id: '2',
      item: 'Ayam Potong',
      quantity: '1 ekor',
      amount: 4500000, // 45k in cents
      store: 'Pasar Minggu',
      date: '2024-11-24'
    }
  ]);

  const commonPurchases = [
    { item: 'Indomie Goreng', quantity: '× 5', estimatedAmount: 1500000, store: 'Indomaret' },
    { item: 'Ayam Potong', quantity: '1 ekor', estimatedAmount: 4500000, store: 'Pasar' },
    { item: 'Beras', quantity: '5 kg', estimatedAmount: 7500000, store: 'Toko Sembako' },
    { item: 'Minyak Goreng', quantity: '1 liter', estimatedAmount: 2500000 },
  ];

  const handleAddTransaction = (transaction: Omit<BudgetTransaction, 'id' | 'date'>) => {
    console.log('Adding transaction:', transaction);
    alert(`Transaksi ditambahkan: ${transaction.item} - ${formatRupiah(transaction.amount)}`);
  };

  const handleDeleteTransaction = (id: string) => {
    console.log('Deleting transaction:', id);
    alert(`Transaksi ${id} dihapus`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Budget Management Examples
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Dua pendekatan untuk mengatur budget: inline editing dalam kartu vs halaman pengaturan terpisah
        </p>
      </div>

      {/* Approach 1: Inline Budget Editing */}
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🔧 Approach 1: Inline Budget Editing
          </h2>
          <p className="text-gray-700 mb-4">
            Budget bisa diedit langsung dalam kartu. Klik pada ikon pensil atau area budget untuk mengedit.
          </p>
          <div className="bg-white rounded p-3 text-sm">
            <strong>Pros:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
              <li>Quick editing tanpa navigasi ke halaman lain</li>
              <li>Context langsung tersedia (melihat spending vs budget)</li>
              <li>Mobile-friendly untuk adjustments cepat</li>
              <li>Less cognitive load - edit di tempat</li>
            </ul>
            <strong className="block mt-3">Cons:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
              <li>Limited space untuk advanced settings</li>
              <li>Bisa crowded jika terlalu banyak controls</li>
              <li>Tidak ideal untuk bulk editing multiple budgets</li>
            </ul>
          </div>
        </div>

        <BudgetCardWithInlineEdit
          category="Belanja Bulanan (Inline Edit)"
          allocated={150000000} // 1.5M in cents
          spent={70000000}     // 700k in cents
          period="monthly"
          transactions={transactions}
          className="max-w-2xl"
          onUpdateBudget={(newAmount) => {
            alert(`Budget updated to ${formatRupiah(newAmount)}`);
          }}
        />
      </div>

      {/* Approach 2: Regular Card + Settings Page */}
      <div className="space-y-4">
        <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-400">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ⚙️ Approach 2: Dedicated Settings Page
          </h2>
          <p className="text-gray-700 mb-4">
            Budget diatur di halaman terpisah. Kartu fokus pada spending tracking saja.
          </p>
          <div className="bg-white rounded p-3 text-sm">
            <strong>Pros:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
              <li>Comprehensive budget management dalam satu tempat</li>
              <li>Bisa setup multiple categories sekaligus</li>
              <li>Space untuk advanced features (templates, presets)</li>
              <li>Clean separation of concerns</li>
              <li>Better untuk initial setup dan major changes</li>
            </ul>
            <strong className="block mt-3">Cons:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
              <li>Extra navigation step untuk edit budget</li>
              <li>Context switching antara tracking dan settings</li>
              <li>Mungkin overkill untuk simple adjustments</li>
            </ul>
          </div>
          <div className="mt-4">
            <a
              href="/budget-settings"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Lihat Halaman Budget Settings
            </a>
          </div>
        </div>

        <BudgetCategoryCard
          id="regular-card"
          category="Belanja Bulanan (Regular Card)"
          allocated={150000000} // 1.5M in cents
          spent={70000000}     // 700k in cents
          period="monthly"
          transactions={transactions}
          lastPeriodSpent={65000000} // 650k spent last period
          onAddTransaction={handleAddTransaction}
          onEditTransaction={(id, updates) => {
            console.log('Edit transaction:', id, updates);
          }}
          onDeleteTransaction={handleDeleteTransaction}
          commonPurchases={commonPurchases}
          className="max-w-2xl"
        />
      </div>

      {/* Recommendation */}
      <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          💡 Recommendation: Hybrid Approach
        </h2>
        <p className="text-gray-700 mb-3">
          Untuk MonMan, saran terbaik adalah <strong>kombinasi kedua pendekatan</strong>:
        </p>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>
              <strong>Settings Page</strong> untuk initial setup, bulk management, dan konfigurasi template
              Indonesia (Belanja Bulanan, Bensin, Listrik, dll)
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>
              <strong>Quick Edit</strong> dalam kartu untuk adjustment cepat (mungkin tombol "Edit Budget"
              yang membuka modal kecil)
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>
              <strong>Mobile-First</strong>: Settings page untuk desktop/initial setup, inline edit untuk
              mobile daily usage
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center space-x-4 pt-8">
        <a
          href="/budget-showcase"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Back to Budget Cards
        </a>
        <a
          href="/ui"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Component Showcase
        </a>
      </div>
    </div>
  );
}