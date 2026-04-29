import { formatRupiah, getAmountColorClass } from '../../../lib/currency';
import type { TransactionApiRow } from '../../../api/finance';

interface TransactionListProps {
  transactions: TransactionApiRow[];
  isLoading?: boolean;
  error?: Error | null;
}

export function TransactionList({ transactions, isLoading, error }: TransactionListProps) {
  const handleTransactionClick = (id: string) => {
    // Future: detail modal / /transactions/$id
    console.debug('transaction', id)
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg p-6 text-sm text-red-800 dark:text-red-300">
        {error.message}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border overflow-hidden dark:bg-neutral-950 dark:border-neutral-700 animate-pulse">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-700 h-14" />
        {[1, 2, 3, 4].map((k) => (
          <div key={k} className="px-6 py-4 border-b border-gray-50 dark:border-neutral-800 flex justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 rounded bg-gray-200 dark:bg-neutral-700" />
              <div className="h-3 w-64 rounded bg-gray-100 dark:bg-neutral-800" />
            </div>
            <div className="h-6 w-24 rounded bg-gray-100 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden dark:bg-neutral-950 dark:border-neutral-700">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-neutral-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-50">
          All Transactions ({transactions.length})
        </h3>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-neutral-400">
          Belum ada transaksi. Tambah dari dashboard atau (nanti) form di sini.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              role="button"
              tabIndex={0}
              onClick={() => handleTransactionClick(transaction.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleTransactionClick(transaction.id)}
              className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 dark:text-neutral-400">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-xs rounded-full w-fit">
                            {transaction.category}
                          </span>
                          <span className="hidden sm:inline dark:text-neutral-600">•</span>
                          <span className="text-xs">{transaction.account}</span>
                          <span className="hidden sm:inline dark:text-neutral-600">•</span>
                          <span className="text-xs">
                            {new Date(transaction.date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-lg font-semibold ${getAmountColorClass(transaction.amount)}`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {formatRupiah(Math.abs(transaction.amount))}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
