import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { BudgetCategoryCard } from '../features/dashboard';
import type { BudgetTransaction } from '../features/dashboard';
import {
  useAccountsQuery,
  useBudgetsQuery,
  useCreateTransactionMutation,
} from '../hooks/useFinanceQueries';
import { indonesianDemoBudgets } from '../data/budgetDemoExamples';

function isoDateLocal(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Kartu anggaran: data dari GET /api/budgets plus contoh Indonesia (offline).
 * Route: `/budget` — redirect dari `/budget-showcase`.
 */
export function BudgetPage() {
  const { data: budgetsData, isPending, error, isError } = useBudgetsQuery();
  const { data: accounts, isPending: accLoading } = useAccountsQuery();
  const createTx = useCreateTransactionMutation();

  const [demoHint, setDemoHint] = useState<string | null>(null);

  const defaultAccountId = accounts?.[0]?.id;

  const handleAddForBudget = (
    budgetId: string,
    transaction: Omit<BudgetTransaction, 'id' | 'date'>,
  ) => {
    if (!defaultAccountId) {
      window.alert('Tambah rekening terlebih dahulu (akun belum punya rekening aktif).');
      return;
    }
    const desc =
      [transaction.item, transaction.store].filter(Boolean).join(' — ') || 'Pengeluaran anggaran';
    createTx.mutate({
      account_id: defaultAccountId,
      budget_id: budgetId,
      magnitude_amount_cents: transaction.amount,
      description: desc,
      transaction_type: 'expense',
      transaction_date: isoDateLocal(),
      item: transaction.item,
      quantity: transaction.quantity,
      store: transaction.store,
    });
  };

  if (isPending || accLoading) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-neutral-400">Memuat anggaran…</div>
    );
  }

  const apiCards = budgetsData?.budgets ?? [];
  const hasApi = apiCards.length > 0;

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-50">Budget</h1>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
              Anggaran Anda disinkronkan dari{' '}
              <code className="text-xs bg-gray-100 dark:bg-neutral-900 px-1 rounded">GET /api/budgets</code>. Buat
              anggaran baru di{' '}
              <Link to="/budget-settings" className="text-blue-600 hover:underline dark:text-blue-400">
                Pengaturan Budget
              </Link>
              .
            </p>
          </div>
        </div>

        {demoHint && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100">
            {demoHint}
            <button
              type="button"
              className="ml-2 underline font-medium"
              onClick={() => setDemoHint(null)}
            >
              Tutup
            </button>
          </div>
        )}

        {!defaultAccountId && (
          <p className="mb-4 text-sm text-amber-800 dark:text-amber-200/90">
            Belum ada rekening aktif untuk mencatat transaksi — buka{' '}
            <Link to="/transactions" className="underline">
              Transactions
            </Link>{' '}
            agar &quot;Dompet utama&quot; dibuat otomatis.
          </p>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200 mb-6">
            Gagal memuat anggaran dari server: {error instanceof Error ? error.message : 'error'}
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-3 flex items-center gap-2 flex-wrap">
            Anggaran Anda
            {hasApi && (
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-100">
                tersimpan
              </span>
            )}
          </h2>

          {!hasApi && !isError && (
            <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/80 p-6 text-center dark:bg-blue-950/20 dark:border-blue-900">
              <p className="text-gray-700 dark:text-neutral-300 mb-3">
                Belum ada anggaran untuk akun Anda. Tambahkan di Pengaturan — lalu kartu Anda muncul di sini.
              </p>
              <Link
                to="/budget-settings"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Buat budget di Pengaturan
              </Link>
            </div>
          )}

          {hasApi && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apiCards.map((b) => {
                const period = b.budget_period as 'weekly' | 'monthly' | 'yearly';
                const transactions: BudgetTransaction[] = (b.line_items ?? []).map((li) => ({
                  id: li.id,
                  item: li.item,
                  quantity: li.quantity,
                  amount: li.amount_cents,
                  store: li.store,
                  date: li.date,
                }));
                const commonPurchases = (b.common_purchases ?? []).map((p) => ({
                  item: p.item,
                  quantity: p.quantity,
                  estimatedAmount: p.estimated_amount,
                  store: p.store,
                }));

                return (
                  <div key={b.id} className="relative">
                    <span className="absolute -top-1 -right-1 z-10 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-600 text-white shadow">
                      API
                    </span>
                    <BudgetCategoryCard
                      id={b.id}
                      category={b.category_display}
                      allocated={b.allocated_amount}
                      spent={b.spent_amount}
                      period={period}
                      transactions={transactions}
                      onAddTransaction={(tx) => handleAddForBudget(b.id, tx)}
                      onEditTransaction={() => {}}
                      onDeleteTransaction={() => {}}
                      commonPurchases={commonPurchases}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2 flex flex-wrap items-center gap-2">
            Contoh tampilan (Indonesia)
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200">
              tidak disimpan ke server
            </span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
            Interaksi di blok ini hanya untuk pola UI — setelah Anda punya budget (API), gunakan kartu bertanda hijau di atas untuk data sungguhan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indonesianDemoBudgets.map((demo) => (
              <div key={demo.id} className="relative">
                <span className="absolute -top-1 -right-1 z-10 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-600 text-white shadow">
                  Contoh
                </span>
                <BudgetCategoryCard
                  id={demo.id}
                  category={demo.category}
                  allocated={demo.allocated}
                  spent={demo.spent}
                  period={demo.period}
                  transactions={demo.transactions}
                  lastPeriodSpent={demo.lastPeriodSpent}
                  commonPurchases={demo.commonPurchases}
                  onAddTransaction={() =>
                    setDemoHint(
                      'Ini kartu contoh — buat budget sungguhan di Pengaturan, lalu pakai kartu bertanda API.',
                    )
                  }
                  onEditTransaction={() =>
                    setDemoHint('Edit hanya contoh UI. Untuk data sungguhan: Pengaturan Budget.')
                  }
                  onDeleteTransaction={() => setDemoHint('Hapus hanya untuk contoh UI.')}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg border dark:bg-neutral-900 dark:border-neutral-700 text-sm text-gray-700 dark:text-neutral-300">
            <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100 mb-2">
              Mengapa dua blok?
            </h3>
            <p className="mb-2">
              <strong className="text-gray-900 dark:text-neutral-100">Anggaran Anda</strong> memakai{' '}
              <code className="text-xs bg-gray-100 dark:bg-neutral-800 px-1 rounded">GET /api/budgets</code>. Total
              terpakai mengikuti semua pengeluaran dengan <strong>kategori dan tanggal</strong> yang masuk periode
              budget (termasuk dari halaman Transaksi).{' '}
              <code className="text-xs bg-gray-100 dark:bg-neutral-800 px-1 rounded">budget_id</code> pada{' '}
              <code className="text-xs bg-gray-100 dark:bg-neutral-800 px-1 rounded">POST /api/transactions</code>{' '}
              opsional — dipakai untuk metadata barang/toko saat menambah dari kartu budget.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-neutral-100">Contoh Indonesia</strong> mempertahankan skenario
              kartu seperti demo asli—jelas berguna sampai beberapa kategori anggaran terisi dari API Anda.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/** @deprecated gunakan nama export `BudgetPage` */
export const BudgetCategoryShowcase = BudgetPage;
