import { formatRupiah, getAmountColorClass } from '../../../lib/currency';

/**
 * Transaction List Component - Transactions Feature
 *
 * Demonstrates:
 * - Feature component with mock data
 * - List rendering patterns
 * - Interaction handlers ready for real functionality
 */
export function TransactionList() {
  // TODO: Replace with actual API data and filtering logic
  // All amounts in cents for precise calculations
  const transactions = [
    {
      id: 1,
      date: '2024-11-24',
      description: 'Belanja di Supermarket',
      category: 'Makanan & Minuman',
      amount: -12785000, // -Rp 127.850
      account: 'Rekening Utama'
    },
    {
      id: 2,
      date: '2024-11-24',
      description: 'Gaji Bulanan - Transfer',
      category: 'Pendapatan',
      amount: 320000000, // +Rp 3.200.000
      account: 'Rekening Utama'
    },
    {
      id: 3,
      date: '2024-11-23',
      description: 'Shell - Isi Bensin',
      category: 'Transportasi',
      amount: -5230000, // -Rp 52.300
      account: 'Kartu Kredit'
    },
    {
      id: 4,
      date: '2024-11-23',
      description: 'Netflix Bulanan',
      category: 'Hiburan',
      amount: -15990000, // -Rp 159.900
      account: 'Kartu Kredit'
    },
    {
      id: 5,
      date: '2024-11-22',
      description: 'Belanja di Mall',
      category: 'Belanja',
      amount: -8947000, // -Rp 89.470
      account: 'Rekening Utama'
    },
  ];

  const handleTransactionClick = (transactionId: number) => {
    console.log('View transaction details:', transactionId);
    // TODO: Navigate to transaction detail page or open modal
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">
          All Transactions ({transactions.length})
        </h3>
      </div>

      <div className="divide-y">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-4 sm:px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleTransactionClick(transaction.id)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {/* Mobile: Stack vertically, Desktop: Inline with dots */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                        <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full w-fit">{transaction.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs">{transaction.account}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs">{new Date(transaction.date).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="text-right">
                  <div className={`text-sm sm:text-lg font-semibold ${getAmountColorClass(transaction.amount)}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatRupiah(Math.abs(transaction.amount))}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}