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
  const recentTransactions = [
    { id: 1, description: 'Grocery Store', amount: -87.50, date: '2024-11-24', category: 'Food' },
    { id: 2, description: 'Salary Deposit', amount: 3200.00, date: '2024-11-23', category: 'Income' },
    { id: 3, description: 'Netflix Subscription', amount: -15.99, date: '2024-11-22', category: 'Entertainment' },
    { id: 4, description: 'Gas Station', amount: -45.20, date: '2024-11-21', category: 'Transportation' },
  ];

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Recent Transactions
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {transaction.description}
              </div>
              <div className="text-sm text-gray-500">
                {transaction.category} • {transaction.date}
              </div>
            </div>
            <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}