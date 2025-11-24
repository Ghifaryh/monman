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
  const transactions = [
    {
      id: 1,
      date: '2024-11-24',
      description: 'Whole Foods Market',
      category: 'Food & Dining',
      amount: -127.85,
      account: 'Checking'
    },
    {
      id: 2,
      date: '2024-11-24',
      description: 'Direct Deposit - Salary',
      category: 'Income',
      amount: 3200.00,
      account: 'Checking'
    },
    {
      id: 3,
      date: '2024-11-23',
      description: 'Shell Gas Station',
      category: 'Transportation',
      amount: -52.30,
      account: 'Credit Card'
    },
    {
      id: 4,
      date: '2024-11-23',
      description: 'Netflix Monthly',
      category: 'Entertainment',
      amount: -15.99,
      account: 'Credit Card'
    },
    {
      id: 5,
      date: '2024-11-22',
      description: 'Target Store',
      category: 'Shopping',
      amount: -89.47,
      account: 'Checking'
    },
  ];

  const handleTransactionClick = (transactionId: number) => {
    console.log('View transaction details:', transactionId);
    // TODO: Navigate to transaction detail page or open modal
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">
          All Transactions ({transactions.length})
        </h3>
      </div>

      <div className="divide-y">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleTransactionClick(transaction.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{transaction.account}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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