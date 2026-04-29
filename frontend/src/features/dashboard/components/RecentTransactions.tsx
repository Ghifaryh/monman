import { formatRupiah } from '../../../lib/currency';
import { Link } from '@tanstack/react-router';
import { useDashboardQuery } from '../../../hooks/useFinanceQueries';

/**
 * Recent transactions from GET /api/dashboard (recent_transactions).
 */
export function RecentTransactions() {
  const { data, isPending, error } = useDashboardQuery()
  const recentTransactions = data?.recent_transactions ?? []

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Tidak bisa memuat transaksi terbaru.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-neutral-950 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide dark:text-neutral-300">
            Transaksi Terbaru
          </h3>
        </div>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <span>Lihat Semua</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {isPending ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((k) => (
            <div key={k} className="flex gap-3 py-2">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-gray-200 dark:bg-neutral-700" />
                <div className="h-3 w-24 rounded bg-gray-100 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : recentTransactions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-neutral-400">Belum ada transaksi.</p>
      ) : (
        <div className="space-y-1">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="group flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  transaction.amount > 0
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {transaction.amount > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    )}
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate group-hover:text-gray-800 dark:text-neutral-100">
                    {transaction.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 dark:text-neutral-400">
                    <span className="px-2 py-1 bg-gray-100 rounded-full dark:bg-neutral-800">
                      {transaction.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(transaction.date).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-3">
                <div className={`font-bold text-sm ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {transaction.amount > 0 ? '+' : ''}{formatRupiah(Math.abs(transaction.amount))}
                </div>
                <div className="text-xs text-gray-400">
                  {transaction.amount > 0 ? 'Masuk' : 'Keluar'}
                </div>
              </div>

              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700">
        <Link
          to="/transactions"
          className="block w-full py-2 text-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Buka halaman Transaksi →
        </Link>
      </div>
    </div>
  );
}
