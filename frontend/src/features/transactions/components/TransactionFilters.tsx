/**
 * Filters — controlled from parent so they apply to API-loaded rows.
 */

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  dateRange: string;
  onDateRangeChange: (v: string) => void;
  categories: { value: string; label: string }[];
}

export function TransactionFilters({
  searchTerm,
  onSearchTermChange,
  category,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  categories,
}: TransactionFiltersProps) {
  const dateOptions = [
    { value: 'all', label: 'All time' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: 'year', label: 'This year' },
  ];

  return (
    <div className="bg-white rounded-lg border p-4 overflow-hidden dark:bg-neutral-950 dark:border-neutral-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="tx-search" className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">
            Search
          </label>
          <input
            id="tx-search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search transactions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-50"
          />
        </div>

        <div>
          <label htmlFor="tx-daterange" className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">
            Date Range
          </label>
          <select
            id="tx-daterange"
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-50"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-cat" className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">
            Category
          </label>
          <select
            id="tx-cat"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-50"
          >
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
