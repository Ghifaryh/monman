import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { BalanceCard } from '../features/dashboard/components/BalanceCard';
import { RecentTransactions } from '../features/dashboard/components/RecentTransactions';

/**
 * Dashboard Page - Top level route component
 *
 * Architecture Pattern:
 * - Pages are thin route handlers that compose feature components
 * - Business logic lives in feature-specific components/hooks
 * - Pages handle routing, layout, and high-level data coordination
 */
export default function DashboardPage() {
  useDocumentTitle('Dashboard');

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Quick Balance View - Mobile */}
        <div className="text-right lg:hidden">
          <div className="text-xs text-gray-500">Total Balance</div>
          <div className="text-lg font-bold text-gray-900">Rp 2.543.670</div>
        </div>
      </div>

      {/* Feature Components - Mobile-First Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <BalanceCard />
        <RecentTransactions />
      </div>

      {/* Quick Actions - Mobile-Friendly */}
      <div className="bg-white rounded-lg border p-4 sm:p-6 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Quick Actions</h2>

        {/* Mobile: Stack buttons, Desktop: Inline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Transaction
          </button>

          <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors touch-manipulation">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Transactions
          </button>
        </div>

        {/* Additional Quick Actions for Mobile */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
          <button className="flex flex-col items-center p-3 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Reports</span>
          </button>

          <button className="flex flex-col items-center p-3 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}