import type { BudgetTransaction } from '../features/dashboard';

/** Convert whole Rupiah to stored cents (matches formatRupiah / API). */
export const rpToCents = (wholeRp: number) => Math.round(wholeRp * 100);

/** Original Indonesian showcase — rich presets for offline/demo cards. */

const groSampleTx: BudgetTransaction[] = [
  {
    id: 'demo-gro-1',
    item: 'Indomie Goreng',
    quantity: '× 5',
    amount: rpToCents(12500),
    store: 'Indomaret Jl. Sudirman',
    date: '2026-04-18',
  },
  {
    id: 'demo-gro-2',
    item: 'Ayam potong',
    quantity: '1/2 kg',
    amount: rpToCents(30000),
    store: 'Pasar Minggu',
    date: '2026-04-17',
  },
  {
    id: 'demo-gro-3',
    item: 'Bensin',
    amount: rpToCents(50000),
    store: 'SPBU Shell Jl. Thamrin',
    date: '2026-04-16',
  },
  {
    id: 'demo-gro-4',
    item: 'Sabun Lifebuoy',
    amount: rpToCents(12000),
    store: 'Alfamart',
    date: '2026-04-15',
  },
];

export interface DemoBudgetDefinition {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  transactions: BudgetTransaction[];
  commonPurchases: Array<{
    item: string;
    quantity?: string;
    estimatedAmount: number;
    store?: string;
  }>;
  lastPeriodSpent?: number;
}

export const indonesianDemoBudgets: DemoBudgetDefinition[] = [
  {
    id: 'demo-groceries',
    category: '🛒 Belanja Bulanan',
    allocated: rpToCents(500_000),
    spent: rpToCents(104_500),
    period: 'monthly',
    transactions: groSampleTx,
    lastPeriodSpent: rpToCents(145_000),
    commonPurchases: [
      { item: 'Indomie Goreng', quantity: '× 5', estimatedAmount: rpToCents(12500), store: 'Indomaret' },
      { item: 'Ayam potong', quantity: '1 kg', estimatedAmount: rpToCents(35000), store: 'Pasar' },
      { item: 'Beras', quantity: '5 kg', estimatedAmount: rpToCents(65000), store: 'Toko Beras' },
      { item: 'Minyak goreng', quantity: '1 liter', estimatedAmount: rpToCents(18000), store: 'Indomaret' },
    ],
  },
  {
    id: 'demo-gas',
    category: '⛽ Bensin',
    allocated: rpToCents(300_000),
    spent: rpToCents(225_000),
    period: 'monthly',
    transactions: [
      {
        id: 'demo-gas-1',
        item: 'Bensin',
        amount: rpToCents(50000),
        store: 'SPBU Shell Jl. Thamrin',
        date: '2026-04-18',
      },
      {
        id: 'demo-gas-2',
        item: 'Bensin',
        amount: rpToCents(75000),
        store: 'SPBU Pertamina Jl. Sudirman',
        date: '2026-04-12',
      },
      {
        id: 'demo-gas-3',
        item: 'Bensin',
        amount: rpToCents(100000),
        store: 'SPBU Shell Jl. Gatot Subroto',
        date: '2026-04-06',
      },
    ],
    lastPeriodSpent: rpToCents(180_000),
    commonPurchases: [
      { item: 'Bensin', estimatedAmount: rpToCents(50000), store: 'SPBU Shell' },
      { item: 'Bensin', estimatedAmount: rpToCents(75000), store: 'SPBU Pertamina' },
      { item: 'Bensin', estimatedAmount: rpToCents(100000), store: 'SPBU Shell' },
    ],
  },
  {
    id: 'demo-utilities',
    category: '💡 Listrik & Air',
    allocated: rpToCents(150_000),
    spent: rpToCents(165_000),
    period: 'weekly',
    transactions: [
      {
        id: 'demo-u1',
        item: 'Token PLN',
        amount: rpToCents(100000),
        store: 'Mobile Banking',
        date: '2026-04-17',
      },
      {
        id: 'demo-u2',
        item: 'Air PDAM',
        amount: rpToCents(65000),
        store: 'Kantor PDAM',
        date: '2026-04-15',
      },
    ],
    lastPeriodSpent: rpToCents(120_000),
    commonPurchases: [
      { item: 'Token PLN', estimatedAmount: rpToCents(100000), store: 'Mobile Banking' },
      { item: 'Token PLN', estimatedAmount: rpToCents(50000), store: 'Mobile Banking' },
    ],
  },
  {
    id: 'demo-entertainment',
    category: '🎬 Hiburan',
    allocated: rpToCents(200_000),
    spent: rpToCents(45000),
    period: 'monthly',
    transactions: [
      {
        id: 'demo-e1',
        item: 'Netflix',
        amount: rpToCents(45000),
        store: 'Netflix Indonesia',
        date: '2026-04-01',
      },
    ],
    lastPeriodSpent: rpToCents(125_000),
    commonPurchases: [
      { item: 'Netflix', estimatedAmount: rpToCents(45000), store: 'Netflix Indonesia' },
      { item: 'Spotify', estimatedAmount: rpToCents(25000), store: 'Spotify' },
      { item: 'Bioskop', estimatedAmount: rpToCents(75000), store: 'CGV/XXI' },
    ],
  },
];
