import { formatRupiah } from '../../../lib/currency';

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
  // Amounts stored in cents (Rupiah * 100)
  const balanceInCents = 254367000; // Rp 2.543.670
  const monthlyChangeInCents = +23412000; // +Rp 234.120
  const isPositiveChange = monthlyChangeInCents > 0;

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          {/* Header with Icon */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Saldo Saat Ini
            </h3>
          </div>

          {/* Main Balance */}
          <div className="mb-3">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {formatRupiah(balanceInCents)}
            </div>

            {/* Monthly Change */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${isPositiveChange
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}>
                <svg className={`w-4 h-4 ${isPositiveChange ? 'rotate-0' : 'rotate-180'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7M17 17H7" />
                </svg>
                {isPositiveChange ? '+' : ''}{formatRupiah(Math.abs(monthlyChangeInCents))}
              </div>
              <span className="text-sm text-gray-500">
                bulan ini
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Visual Element */}
        <div className="flex flex-col items-end justify-center ml-4">
          {/* Trend Chart - Compact on mobile, larger on desktop */}
          <div className="w-16 h-10 sm:w-24 sm:h-16 mb-2">
            <svg viewBox="0 0 120 64" className="w-full h-full">
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Simple upward trend line */}
              <polyline
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2.5"
                points="0,50 20,45 40,40 60,30 80,25 100,15 120,10"
              />
              {/* Area under the curve */}
              <polygon
                fill="url(#trendGradient)"
                points="0,50 20,45 40,40 60,30 80,25 100,15 120,10 120,64 0,64"
              />
              {/* Data points */}
              <circle cx="120" cy="10" r="3" fill="rgb(34, 197, 94)" />
            </svg>
          </div>

          {/* Quick Stats - More compact on mobile */}
          <div className="text-right">
            <div className="text-xs text-gray-500 hidden sm:block">Trend</div>
            <div className="text-xs sm:text-sm font-semibold text-green-600">↗ Naik</div>
          </div>
        </div>
      </div>

      {/* Bottom Quick Info */}
      <div className="relative z-10 mt-4 pt-3 border-t border-blue-200/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Terakhir diperbarui</span>
          <span className="font-medium text-gray-700">
            {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}