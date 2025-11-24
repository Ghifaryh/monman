import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { TransactionList } from '../features/transactions/components/TransactionList';
import { TransactionFilters } from '../features/transactions/components/TransactionFilters';

/**
 * Transactions Page - Top level route component
 *
 * Demonstrates:
 * - Page as thin orchestration layer
 * - Feature components handling specific domain logic
 * - Shared state management between feature components
 */
export default function TransactionsPage() {
  useDocumentTitle('Transactions');

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0">
      {/* Mobile-friendly header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your income and expenses in Rupiah
          </p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Feature Components */}
      <div className="space-y-4 sm:space-y-6">
        <TransactionFilters />
        <TransactionList />
      </div>

      {/* Summary Card for Mobile */}
      <div className="bg-white rounded-lg border p-4 sm:hidden">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">+Rp 5.200.000</div>
            <div className="text-xs text-gray-500">Total Income</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">-Rp 3.450.000</div>
            <div className="text-xs text-gray-500">Total Expenses</div>
          </div>
        </div>
      </div>
    </div>
  );
}