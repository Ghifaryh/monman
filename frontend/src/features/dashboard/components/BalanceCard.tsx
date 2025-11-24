/**
 * Balance Card Component - Dashboard Feature
 *
 * Feature Component Pattern:
 * - Handles specific domain logic (account balance display)
 * - Can be reused across different pages if needed
 * - Contains its own state management and API calls
 */
export function BalanceCard() {
  // TODO: Replace with actual balance data from API
  const balance = 2543.67;
  const monthlyChange = +234.12;
  const isPositiveChange = monthlyChange > 0;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Current Balance
      </h3>

      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-900">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}>
            {isPositiveChange ? '+' : ''}${monthlyChange.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            this month
          </span>
        </div>
      </div>
    </div>
  );
}