import { useState } from 'react';
import { formatRupiah } from '../lib/currency';
import type { BudgetCategoryCardProps } from '../features/dashboard/components/BudgetCategoryCard';

/**
 * Option 1: Inline Budget Editing Example
 *
 * This shows how budget allocation editing could work directly within each card.
 * Users can click on the budget amount to edit it inline.
 */
export function BudgetCardWithInlineEdit({
  category,
  allocated,
  spent,
  period,
  transactions,
  className = ''
}: Pick<BudgetCategoryCardProps, 'category' | 'allocated' | 'spent' | 'period' | 'transactions' | 'className'> & {
  onUpdateBudget?: (newAllocated: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetAmount, setTempBudgetAmount] = useState(allocated / 100); // Convert to rupiah for editing

  // Calculate progress and remaining budget
  const remaining = allocated - spent;
  const progressPercentage = (spent / allocated) * 100;
  const isOverBudget = spent > allocated;

  // Format period text in Indonesian context
  const getPeriodText = () => {
    switch (period) {
      case 'weekly': return 'minggu ini';
      case 'monthly': return 'bulan ini';
      case 'yearly': return 'tahun ini';
    }
  };

  const handleBudgetSave = () => {
    const newAllocated = tempBudgetAmount * 100; // Convert back to cents
    // onUpdateBudget?.(newAllocated); // This would call the parent to update the budget
    setIsEditingBudget(false);

    // For demo, we'll just show an alert
    alert(`Budget untuk ${category} diubah ke ${formatRupiah(newAllocated)}`);
  };

  const handleBudgetCancel = () => {
    setTempBudgetAmount(allocated / 100); // Reset to original
    setIsEditingBudget(false);
  };



  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Card Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{category}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getPeriodText()}
            </span>
          </div>

          {/* Inline Budget Editing */}
          <div className="flex items-center space-x-2">
            {isEditingBudget ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={tempBudgetAmount || ''}
                  onChange={(e) => setTempBudgetAmount(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  autoFocus
                />
                <button
                  onClick={handleBudgetSave}
                  className="p-1 text-green-600 hover:text-green-700"
                  title="Simpan"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleBudgetCancel}
                  className="p-1 text-red-600 hover:text-red-700"
                  title="Batal"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(remaining)}
                </span>
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Edit budget"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Budget Allocation Display (clickable to edit) */}
        {!isEditingBudget && (
          <div
            className="mb-2 cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
            onClick={() => setIsEditingBudget(true)}
          >
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Budget: <span className="font-medium text-blue-600">{formatRupiah(allocated)}</span></span>
              <span className="text-xs text-gray-400">👆 Klik untuk edit</span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{formatRupiah(spent)}</span>
            <span>{formatRupiah(allocated)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : progressPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{transactions.length} transaksi</span>
          <span>{progressPercentage.toFixed(0)}% terpakai</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="text-center text-gray-500 text-sm">
            <p>📝 Fitur inline editing budget</p>
            <p className="text-xs mt-1">
              • Klik pada jumlah budget untuk mengedit<br />
              • Edit langsung dalam card tanpa popup<br />
              • Cocok untuk penyesuaian cepat
            </p>
          </div>
        </div>
      )}
    </div>
  );
}