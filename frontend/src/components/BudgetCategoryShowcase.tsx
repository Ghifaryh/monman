import { BudgetCategoryCard } from '../features/dashboard';
import type { BudgetTransaction } from '../features/dashboard';

// Sample data for testing the BudgetCategoryCard component
const sampleTransactions: BudgetTransaction[] = [
  {
    id: '1',
    item: 'Indomie Goreng',
    quantity: '× 5',
    amount: 12500, // in cents
    store: 'Indomaret Jl. Sudirman',
    date: '2025-11-25'
  },
  {
    id: '2',
    item: 'Ayam potong',
    quantity: '1/2 kg',
    amount: 30000,
    store: 'Pasar Minggu',
    date: '2025-11-24'
  },
  {
    id: '3',
    item: 'Bensin',
    quantity: undefined, // no quantity for gas
    amount: 50000,
    store: 'SPBU Shell Jl. Thamrin',
    date: '2025-11-23'
  },
  {
    id: '4',
    item: 'Sabun Lifebuoy',
    quantity: undefined,
    amount: 12000,
    store: 'Alfamart',
    date: '2025-11-22'
  }
];

const commonGroceries = [
  {
    item: 'Indomie Goreng',
    quantity: '× 5',
    estimatedAmount: 12500,
    store: 'Indomaret'
  },
  {
    item: 'Ayam potong',
    quantity: '1 kg',
    estimatedAmount: 35000,
    store: 'Pasar'
  },
  {
    item: 'Beras',
    quantity: '5 kg',
    estimatedAmount: 65000,
    store: 'Toko Beras'
  },
  {
    item: 'Minyak goreng',
    quantity: '1 liter',
    estimatedAmount: 18000,
    store: 'Indomaret'
  }
];

const commonGas = [
  {
    item: 'Bensin',
    estimatedAmount: 50000,
    store: 'SPBU Shell'
  },
  {
    item: 'Bensin',
    estimatedAmount: 75000,
    store: 'SPBU Pertamina'
  },
  {
    item: 'Bensin',
    estimatedAmount: 100000,
    store: 'SPBU Shell'
  }
];

/**
 * BudgetCategoryCard Component Showcase
 *
 * Demonstrates the Indonesian-optimized budget tracking component
 * with realistic sample data and different usage scenarios.
 */
export function BudgetCategoryShowcase() {
  const handleAddTransaction = (transaction: Omit<BudgetTransaction, 'id' | 'date'>) => {
    console.log('Adding transaction:', transaction);
    // In real app, this would call an API or update state
  };

  const handleEditTransaction = (id: string, updates: Partial<BudgetTransaction>) => {
    console.log('Editing transaction:', id, updates);
  };

  const handleDeleteTransaction = (id: string) => {
    console.log('Deleting transaction:', id);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Budget Category Cards - Indonesian Style
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Groceries Budget Card */}
          <BudgetCategoryCard
            id="groceries"
            category="🛒 Belanja Bulanan"
            allocated={500000} // Rp 500,000 in cents
            spent={104500} // Current spending in cents
            period="monthly"
            transactions={sampleTransactions}
            lastPeriodSpent={145000} // Last month for comparison
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            commonPurchases={commonGroceries}
          />

          {/* Gas Budget Card */}
          <BudgetCategoryCard
            id="gas"
            category="⛽ Bensin"
            allocated={300000} // Rp 300,000 per month
            spent={225000} // Higher usage this month
            period="monthly"
            transactions={[
              {
                id: '1',
                item: 'Bensin',
                amount: 50000,
                store: 'SPBU Shell Jl. Thamrin',
                date: '2025-11-25'
              },
              {
                id: '2',
                item: 'Bensin',
                amount: 75000,
                store: 'SPBU Pertamina Jl. Sudirman',
                date: '2025-11-20'
              },
              {
                id: '3',
                item: 'Bensin',
                amount: 100000,
                store: 'SPBU Shell Jl. Gatot Subroto',
                date: '2025-11-15'
              }
            ]}
            lastPeriodSpent={180000} // Last month was lower
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            commonPurchases={commonGas}
          />

          {/* Utilities Budget Card - Weekly */}
          <BudgetCategoryCard
            id="utilities"
            category="💡 Listrik & Air"
            allocated={150000} // Weekly budget
            spent={165000} // Over budget!
            period="weekly"
            transactions={[
              {
                id: '1',
                item: 'Token PLN',
                amount: 100000,
                store: 'Mobile Banking',
                date: '2025-11-24'
              },
              {
                id: '2',
                item: 'Air PDAM',
                amount: 65000,
                store: 'Kantor PDAM',
                date: '2025-11-22'
              }
            ]}
            lastPeriodSpent={120000}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            commonPurchases={[
              {
                item: 'Token PLN',
                estimatedAmount: 100000,
                store: 'Mobile Banking'
              },
              {
                item: 'Token PLN',
                estimatedAmount: 50000,
                store: 'Mobile Banking'
              }
            ]}
          />

          {/* Entertainment Budget - Under Budget */}
          <BudgetCategoryCard
            id="entertainment"
            category="🎬 Hiburan"
            allocated={200000}
            spent={45000} // Well under budget
            period="monthly"
            transactions={[
              {
                id: '1',
                item: 'Netflix',
                amount: 45000,
                store: 'Netflix Indonesia',
                date: '2025-11-01'
              }
            ]}
            lastPeriodSpent={125000}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            commonPurchases={[
              {
                item: 'Netflix',
                estimatedAmount: 45000,
                store: 'Netflix Indonesia'
              },
              {
                item: 'Spotify',
                estimatedAmount: 25000,
                store: 'Spotify'
              },
              {
                item: 'Bioskop',
                estimatedAmount: 75000,
                store: 'CGV/XXI'
              }
            ]}
          />
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🇮🇩 Indonesian Budget Card Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Flexible Quantity Tracking:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>"× 5" for countable items (Indomie)</li>
                <li>"1/2 kg" for weight-based (Ayam)</li>
                <li>No quantity for services (Bensin, Netflix)</li>
                <li>Custom units for Indonesian shopping</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Store Price Comparison:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Track where you bought each item</li>
                <li>Compare Indomaret vs Alfamart prices</li>
                <li>SPBU brand tracking for gas</li>
                <li>Traditional market vs supermarket</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Smart Presets:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Common purchases with editable prices</li>
                <li>Different gas amounts (50rb, 75rb, 100rb)</li>
                <li>Typical grocery items and quantities</li>
                <li>Utility payment shortcuts</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Indonesian Context:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Rupiah currency formatting</li>
                <li>Indonesian date formatting</li>
                <li>Local business names (SPBU, Indomaret)</li>
                <li>Period comparison in Indonesian</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}