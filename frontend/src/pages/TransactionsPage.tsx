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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Transactions
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Add Transaction
        </button>
      </div>

      {/* Feature Components */}
      <div className="space-y-4">
        <TransactionFilters />
        <TransactionList />
      </div>

      {/* Placeholder for pagination, summary, etc. */}
      <div className="text-center text-gray-500 text-sm py-4">
        Page under construction - feature components coming soon!
      </div>
    </div>
  );
}