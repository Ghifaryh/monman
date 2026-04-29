import { useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  useAccountsQuery,
  useCategoriesQuery,
  useCreateTransactionMutation,
  useCreateAccountMutation,
  useTransactionsQuery,
} from '../hooks/useFinanceQueries';
import { TransactionList } from '../features/transactions/components/TransactionList';
import { TransactionFilters } from '../features/transactions/components/TransactionFilters';
import type { TransactionApiRow } from '../api/finance';
import { formatRupiah } from '../lib/currency';
import Modal from '../components/Modal';

function transactionInDateRange(dateStr: string, range: string): boolean {
  const t = new Date(dateStr + 'T12:00:00').getTime();
  const now = Date.now();
  const dayMs = 86_400_000;
  if (range === 'all') return true;
  if (range === '7d') return now - t <= 7 * dayMs && t <= now + dayMs;
  if (range === '30d') return now - t <= 30 * dayMs && t <= now + dayMs;
  if (range === '90d') return now - t <= 90 * dayMs && t <= now + dayMs;
  if (range === 'year') {
    const y = new Date(now).getFullYear();
    const d = new Date(t);
    return d.getFullYear() === y;
  }
  return true;
}

function applyFilters(
  rows: TransactionApiRow[],
  searchTerm: string,
  category: string,
  dateRange: string,
): TransactionApiRow[] {
  let list = [...rows];
  const q = searchTerm.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.account.toLowerCase().includes(q),
    );
  }
  if (category !== 'all') {
    list = list.filter((tx) => tx.category === category);
  }
  list = list.filter((tx) => transactionInDateRange(tx.date, dateRange));
  return list;
}

function isoDateLocal(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export default function TransactionsPage() {
  useDocumentTitle('Transactions');
  const { data, isPending, error, isError } = useTransactionsQuery();
  const { data: accounts, isPending: accountsLoading, isError: accountsQueryError, error: accountsQueryErr, refetch: refetchAccounts } = useAccountsQuery();
  const [txModalType, setTxModalType] = useState<'income' | 'expense'>('expense');
  const { data: categoriesForModal, isPending: categoriesLoading } = useCategoriesQuery(txModalType);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [formAccountId, setFormAccountId] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmountRupiah, setFormAmountRupiah] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(isoDateLocal);
  const [formError, setFormError] = useState<string | null>(null);

  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<
    'cash' | 'bank' | 'credit_card' | 'ewallet' | 'investment'
  >('cash');
  const [newAccountErr, setNewAccountErr] = useState<string | null>(null);

  const createTx = useCreateTransactionMutation();
  const createAcc = useCreateAccountMutation();

  const categoryOptions = useMemo(() => {
    const names = new Set<string>();
    (data?.transactions ?? []).forEach((tx) => names.add(tx.category));
    return [
      { value: 'all', label: 'All Categories' },
      ...[...names].sort().map((c) => ({ value: c, label: c })),
    ];
  }, [data?.transactions]);

  const filtered = useMemo(
    () =>
      applyFilters(data?.transactions ?? [], searchTerm, category, dateRange),
    [data?.transactions, searchTerm, category, dateRange],
  );

  const err = isError ? (error instanceof Error ? error : new Error('Failed to load')) : null;

  const openModal = () => {
    setFormError(null);
    setNewAccountErr(null);
    setAddAccountOpen(false);
    setNewAccountName('');
    setNewAccountType('cash');
    setFormDate(isoDateLocal());
    setFormDescription('');
    setFormAmountRupiah('');
    setTxModalType('expense');
    const firstAcc = accounts?.[0]?.id;
    setFormAccountId(firstAcc ?? '');
    setFormCategoryId('');
    setModalOpen(true);
  };

  const handleCreateAccountQuick = () => {
    setNewAccountErr(null);
    const name = newAccountName.trim();
    if (!name) {
      setNewAccountErr('Masukkan nama rekening.');
      return;
    }
    createAcc.mutate(
      { name, account_type: newAccountType },
      {
        onSuccess: ({ id }) => {
          setFormAccountId(id);
          setAddAccountOpen(false);
          setNewAccountName('');
          setNewAccountErr(null);
        },
        onError: (ex) => {
          setNewAccountErr(ex instanceof Error ? ex.message : 'Gagal membuat rekening');
        },
      },
    );
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const rupiah = Number(String(formAmountRupiah).replace(/\s/g, '').replace(/,/g, '.'));
    if (!formAccountId) {
      setFormError('Pilih rekening.');
      return;
    }
    if (!formCategoryId) {
      setFormError('Pilih kategori.');
      return;
    }
    if (!Number.isFinite(rupiah) || rupiah <= 0) {
      setFormError('Jumlah tidak valid.');
      return;
    }
    const magnitudeCents = Math.round(rupiah * 100);
    const desc = formDescription.trim() || (txModalType === 'income' ? 'Pemasukan' : 'Pengeluaran');
    createTx.mutate(
      {
        account_id: formAccountId,
        category_id: formCategoryId,
        magnitude_amount_cents: magnitudeCents,
        description: desc,
        transaction_type: txModalType,
        transaction_date: formDate,
      },
      {
        onSuccess: () => {
          setModalOpen(false);
        },
        onError: (ex) => {
          setFormError(ex instanceof Error ? ex.message : 'Gagal menyimpan');
        },
      },
    );
  };

  const canAdd = !accountsQueryError && (accounts?.length ?? 0) > 0 && !accountsLoading;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0">
      {accountsQueryError && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200">
          <span>
            Gagal memuat rekening:{' '}
            {accountsQueryErr instanceof Error ? accountsQueryErr.message : 'unknown error'}
          </span>
          <button
            type="button"
            className="shrink-0 underline font-medium hover:no-underline"
            onClick={() => void refetchAccounts()}
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-neutral-50">
            Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-neutral-400">
            Manage your income and expenses in Rupiah (data from API)
          </p>
        </div>
        <button
          type="button"
          disabled={!canAdd}
          onClick={openModal}
          title={
            accountsLoading
              ? 'Memuat daftar rekening…'
              : accountsQueryError
                ? 'Perbaiki error muat rekening di atas'
              : !canAdd
                ? 'Tidak ada rekening aktif — pakai “Tambah rekening baru” di modal atau perbaiki error di atas'
                : 'Tambah transaksi'
          }
          className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Transaction
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Transaksi baru">
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTxModalType('expense')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                  txModalType === 'expense'
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setTxModalType('income')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                  txModalType === 'income'
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rekening</label>
            <select
              required
              value={formAccountId}
              onChange={(e) => setFormAccountId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              disabled={accountsLoading}
            >
              <option value="">— Pilih —</option>
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatRupiah(a.balance)})
                </option>
              ))}
            </select>
            <div className="mt-2">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => {
                  setAddAccountOpen((o) => !o);
                  setNewAccountErr(null);
                }}
              >
                {addAccountOpen ? 'Tutup' : '+ Tambah rekening baru'}
              </button>
              {addAccountOpen && (
                <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-900 space-y-2">
                  <p className="text-xs text-gray-600 dark:text-neutral-400">
                    Saldo awal Rp&nbsp;0. Transaksi Anda yang akan datang akan memperbarui saldo.
                  </p>
                  <input
                    type="text"
                    placeholder="Mis. BCA Tabungan, Kartu utama…"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-neutral-600 dark:bg-neutral-950 rounded-lg px-3 py-2 text-sm dark:text-neutral-100"
                  />
                  <select
                    value={newAccountType}
                    onChange={(e) =>
                      setNewAccountType(
                        e.target.value as 'cash' | 'bank' | 'credit_card' | 'ewallet' | 'investment',
                      )
                    }
                    className="w-full border border-gray-300 dark:border-neutral-600 dark:bg-neutral-950 rounded-lg px-3 py-2 text-sm dark:text-neutral-100"
                  >
                    <option value="cash">Tunai / dompet</option>
                    <option value="bank">Rekening bank</option>
                    <option value="ewallet">E-wallet</option>
                    <option value="credit_card">Kartu kredit</option>
                    <option value="investment">Investasi</option>
                  </select>
                  {newAccountErr && <p className="text-xs text-red-600">{newAccountErr}</p>}
                  <button
                    type="button"
                    disabled={createAcc.isPending}
                    onClick={() => handleCreateAccountQuick()}
                    className="w-full px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createAcc.isPending ? 'Menyimpan…' : 'Simpan rekening'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              required
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              disabled={categoriesLoading}
            >
              <option value="">— Pilih —</option>
              {(categoriesForModal ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={formAmountRupiah}
              onChange={(e) => setFormAmountRupiah(e.target.value)}
              placeholder="50000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Angka penuh dalam Rupiah (contoh: 125000 untuk Rp 125.000).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Belanja mingguan, gaji, …"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createTx.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createTx.isPending ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="space-y-4 sm:space-y-6">
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          category={category}
          onCategoryChange={setCategory}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          categories={categoryOptions}
        />
        <TransactionList transactions={filtered} isLoading={isPending} error={err} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 bg-white rounded-lg border p-4 dark:bg-neutral-950 dark:border-neutral-700">
        <div className="sm:col-span-1">
          <div className="text-xs text-gray-500 dark:text-neutral-400">Pemasukan bulan ini</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {data ? `+${formatRupiah(data.month_income_cents)}` : isPending ? '…' : '—'}
          </div>
        </div>
        <div className="sm:col-span-1">
          <div className="text-xs text-gray-500 dark:text-neutral-400">Pengeluaran bulan ini</div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {data ? `-${formatRupiah(data.month_expense_cents)}` : isPending ? '…' : '—'}
          </div>
        </div>
        <div className="sm:col-span-2 text-sm text-gray-500 flex items-end dark:text-neutral-400">
          Angka di atas mengikuti kalender bulan berjalan (server).
        </div>
      </div>
    </div>
  );
}
