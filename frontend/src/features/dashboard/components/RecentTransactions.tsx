import { formatRupiah } from '../../../lib/currency';

/**
 * Recent Transactions Component - Dashboard Feature
 *
 * Demonstrates:
 * - Feature-specific component with mock data
 * - Encapsulated styling and behavior
 * - Ready for API integration
 */
export function RecentTransactions() {
  // TODO: Replace with actual API call
  // Amounts in cents for precise calculation
  const recentTransactions = [
    { id: 1, description: 'Belanja Groceries', amount: -8750000, date: '2024-11-24', category: 'Makanan' },
    { id: 2, description: 'Gaji Bulanan', amount: 320000000, date: '2024-11-23', category: 'Pendapatan' },
    { id: 3, description: 'Netflix Subscription', amount: -15990000, date: '2024-11-22', category: 'Hiburan' },
    { id: 4, description: 'Isi Bensin', amount: -4520000, date: '2024-11-21', category: 'Transportasi' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Transaksi Terbaru
          </h3>
        </div>
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <span>Lihat Semua</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-1">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="group flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Transaction Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.amount > 0
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
                }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {transaction.amount > 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  )}
                </svg>
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate group-hover:text-gray-800">
                  {transaction.description}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {transaction.category}
                  </span>
                  <span>•</span>
                  <span>{new Date(transaction.date).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0 ml-3">
              <div className={`font-bold text-sm ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {transaction.amount > 0 ? '+' : ''}{formatRupiah(Math.abs(transaction.amount))}
              </div>
              <div className="text-xs text-gray-400">
                {transaction.amount > 0 ? 'Masuk' : 'Keluar'}
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          Tampilkan 12 transaksi lainnya
        </button>
      </div>
    </div>
  );
}