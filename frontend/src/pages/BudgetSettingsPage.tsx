import { useMemo, useState } from 'react';
import { formatRupiah } from '../lib/currency';
import {
  useAppendBudgetCommonPurchasesMutation,
  useBudgetsQuery,
  useCategoriesQuery,
  useCreateBudgetMutation,
} from '../hooks/useFinanceQueries';
import type { BudgetCardRow, CreateCommonPurchasePayload } from '../api/finance';

function isoFromDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

function suggestedPeriodDates(period: 'weekly' | 'monthly' | 'yearly'): { start: string; end: string } {
  const now = new Date();
  if (period === 'weekly') {
    const end = new Date(now);
    end.setDate(end.getDate() + 6);
    return { start: isoFromDate(now), end: isoFromDate(end) };
  }
  if (period === 'monthly') {
    const y = now.getFullYear();
    const m = now.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return { start: isoFromDate(start), end: isoFromDate(end) };
  }
  const y = now.getFullYear();
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

interface DraftPreset {
  item: string;
  quantity: string;
  estimatedRupiah: string;
  store: string;
}

interface CategoryPreset {
  name: string;
  icon: string;
  color: string;
  /** cents — same convention as API */
  suggestedAmount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

const categoryPresets: CategoryPreset[] = [
  { name: 'Belanja Bulanan', icon: '🛒', color: 'blue', suggestedAmount: 150000000, period: 'monthly' },
  { name: 'Bensin Motor', icon: '⛽', color: 'yellow', suggestedAmount: 20000000, period: 'weekly' },
  { name: 'Listrik & Air', icon: '💡', color: 'green', suggestedAmount: 50000000, period: 'monthly' },
  { name: 'Internet & Pulsa', icon: '📱', color: 'purple', suggestedAmount: 15000000, period: 'monthly' },
  { name: 'Transportasi', icon: '🚗', color: 'orange', suggestedAmount: 30000000, period: 'monthly' },
  { name: 'Makan di Luar', icon: '🍽️', color: 'red', suggestedAmount: 40000000, period: 'monthly' },
  { name: 'Kesehatan', icon: '💊', color: 'teal', suggestedAmount: 25000000, period: 'monthly' },
  { name: 'Pendidikan', icon: '📚', color: 'indigo', suggestedAmount: 20000000, period: 'monthly' },
];

function parseRupiahInput(raw: string): number {
  const n = Number(String(raw).replace(/\./g, '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

function PresetRowAppend({ budget }: { budget: BudgetCardRow }) {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rupiah, setRupiah] = useState('');
  const [store, setStore] = useState('');
  const append = useAppendBudgetCommonPurchasesMutation();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const est = parseRupiahInput(rupiah);
    const trimmed = item.trim();
    if (!trimmed || !Number.isFinite(est) || est <= 0) return;
    const payload: CreateCommonPurchasePayload = {
      item: trimmed,
      estimated_amount: Math.round(est * 100),
      ...(quantity.trim() ? { quantity: quantity.trim() } : {}),
      ...(store.trim() ? { store: store.trim() } : {}),
    };
    append.mutate(
      { budgetId: budget.id, purchases: [payload] },
      {
        onSuccess: () => {
          setItem('');
          setQuantity('');
          setRupiah('');
          setStore('');
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <div className="text-sm font-medium text-gray-800 mb-2">Tambah pembelian umum</div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          placeholder="Barang"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="text-sm px-2 py-1.5 border rounded"
        />
        <input
          placeholder="Qty (ops.)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="text-sm px-2 py-1.5 border rounded"
        />
        <input
          placeholder="Perkiraan (Rp)"
          value={rupiah}
          onChange={(e) => setRupiah(e.target.value)}
          className="text-sm px-2 py-1.5 border rounded"
        />
        <input
          placeholder="Toko (ops.)"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="text-sm px-2 py-1.5 border rounded"
        />
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={append.isPending || !item.trim()}
          className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
        >
          {append.isPending ? 'Menyimpan…' : '+ Simpan preset'}
        </button>
      </div>
    </form>
  );
}

/**
 * Dedicated budget settings: lists real budgets from the API and supports creating budgets (with presets) and appending presets.
 */
export function BudgetSettingsPage() {
  const { data: budgetsPayload, isPending, error, isError, refetch } = useBudgetsQuery();
  const { data: expenseCategories, isPending: catsLoading } = useCategoriesQuery('expense');
  const createBudget = useCreateBudgetMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAllocatedRp, setFormAllocatedRp] = useState('');
  const [formPeriod, setFormPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formIcon, setFormIcon] = useState('📱');
  const [formColor, setFormColor] = useState('blue');
  const [presetsDraft, setPresetsDraft] = useState<DraftPreset[]>([]);
  const [formErr, setFormErr] = useState<string | null>(null);

  const openModal = () => {
    const p = suggestedPeriodDates('monthly');
    setFormCategoryId('');
    setFormName('');
    setFormAllocatedRp('');
    setFormPeriod('monthly');
    setFormStart(p.start);
    setFormEnd(p.end);
    setFormIcon('📱');
    setFormColor('blue');
    setPresetsDraft([]);
    setFormErr(null);
    setModalOpen(true);
  };

  const applyDatesForPeriod = (period: 'weekly' | 'monthly' | 'yearly') => {
    const p = suggestedPeriodDates(period);
    setFormStart(p.start);
    setFormEnd(p.end);
  };

  const totalAllocated = useMemo(() => {
    return (budgetsPayload?.budgets ?? []).reduce((s, b) => s + b.allocated_amount, 0);
  }, [budgetsPayload?.budgets]);

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    const rp = parseRupiahInput(formAllocatedRp);
    if (!formCategoryId.trim() || !formName.trim() || !Number.isFinite(rp) || rp <= 0) {
      setFormErr('Lengkapi kategori, nama, dan alokasi (Rp).');
      return;
    }
    const common: CreateCommonPurchasePayload[] = presetsDraft
      .map((row) => {
        const est = parseRupiahInput(row.estimatedRupiah);
        const it = row.item.trim();
        if (!it || !Number.isFinite(est) || est <= 0) return null;
        const cp: CreateCommonPurchasePayload = {
          item: it,
          estimated_amount: Math.round(est * 100),
          ...(row.quantity.trim() ? { quantity: row.quantity.trim() } : {}),
          ...(row.store.trim() ? { store: row.store.trim() } : {}),
        };
        return cp;
      })
      .filter((x): x is CreateCommonPurchasePayload => x != null);

    createBudget.mutate(
      {
        category_id: formCategoryId,
        name: formName.trim(),
        allocated_amount: Math.round(rp * 100),
        budget_period: formPeriod,
        period_start_date: formStart,
        period_end_date: formEnd,
        icon: formIcon,
        color: formColor,
        ...(common.length > 0 ? { common_purchases: common } : {}),
      },
      {
        onSuccess: () => {
          setModalOpen(false);
          void refetch();
        },
        onError: (ex) =>
          setFormErr(ex instanceof Error ? ex.message : 'Gagal membuat budget'),
      },
    );
  };

  const addPresetDraftRow = () => {
    setPresetsDraft((rows) => [...rows, { item: '', quantity: '', estimatedRupiah: '', store: '' }]);
  };

  const updatePresetDraft = (i: number, patch: Partial<DraftPreset>) => {
    setPresetsDraft((rows) =>
      rows.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    );
  };
  const removePresetDraft = (i: number) =>
    setPresetsDraft((rows) => rows.filter((_, j) => j !== i));

  const applyPreset = (preset: CategoryPreset) => {
    const p = suggestedPeriodDates(preset.period);
    setModalOpen(true);
    setFormName(preset.name);
    setFormIcon(preset.icon);
    setFormColor(preset.color);
    setFormPeriod(preset.period);
    setFormStart(p.start);
    setFormEnd(p.end);
    setFormAllocatedRp(String(preset.suggestedAmount / 100));
    setPresetsDraft([]);
    setFormErr(null);
  };

  const budgets = budgetsPayload?.budgets ?? [];

  if (isPending || catsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-gray-600">Memuat pengaturan budget…</div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-red-600">
        Gagal memuat budget: {error instanceof Error ? error.message : 'Error'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Budget</h1>
        <p className="text-gray-600 mb-4">
          Data dari server: buat budget baru atau tambah pembelian umum ke budget yang ada.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-blue-900">Total alokasi (aktif)</h3>
            <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalAllocated)}</p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Budget baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Template kategori Indonesia</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryPresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg border hover:border-blue-300 transition-colors"
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <div className="text-sm font-medium text-gray-900">{preset.name}</div>
              <div className="text-xs text-gray-500">
                ~{formatRupiah(preset.suggestedAmount)}/
                {preset.period === 'monthly' ? 'bulan' : preset.period === 'weekly' ? 'minggu' : 'tahun'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Budget Anda</h2>
        </div>

        <div className="divide-y">
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Belum ada budget. Gunakan &quot;Budget baru&quot; atau POST{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/api/budgets</code>.
            </div>
          ) : (
            budgets.map((b) => (
              <div key={b.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{b.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">{b.name}</h3>
                      <p className="text-sm text-gray-600">
                        {b.category_display} · {formatRupiah(b.spent_amount)} / {formatRupiah(b.allocated_amount)} (
                        {b.budget_period})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {b.period_start_date} — {b.period_end_date}
                      </p>
                    </div>
                  </div>
                </div>

                {(b.common_purchases ?? []).length > 0 && (
                  <ul className="mt-4 text-sm space-y-1">
                    <li className="font-medium text-gray-700">Pembelian umum:</li>
                    {(b.common_purchases ?? []).map((p) => (
                      <li key={p.id} className="text-gray-700">
                        {p.item}
                        {p.quantity ? ` (${p.quantity})` : ''} — ~{formatRupiah(p.estimated_amount)}
                        {p.store ? ` · ${p.store}` : ''}
                      </li>
                    ))}
                  </ul>
                )}

                <PresetRowAppend budget={b} />
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 my-8 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget baru</h2>

            <form className="space-y-4" onSubmit={handleCreateBudget}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori pengeluaran</label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">— Pilih —</option>
                  {(expenseCategories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama budget</label>
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alokasi (Rp)</label>
                <input
                  required
                  value={formAllocatedRp}
                  onChange={(e) => setFormAllocatedRp(e.target.value)}
                  placeholder="1500000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                <select
                  value={formPeriod}
                  onChange={(e) => {
                    const np = e.target.value as typeof formPeriod;
                    setFormPeriod(np);
                    applyDatesForPeriod(np);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="yearly">Tahunan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                  <input
                    type="date"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Akhir</label>
                  <input
                    type="date"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  className="w-16 px-2 py-2 border rounded-lg text-center"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  aria-label="Icon"
                />
                <input
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Warna tema (mis. blue)"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">Pembelian umum (opsional)</span>
                  <button
                    type="button"
                    className="text-sm text-blue-600"
                    onClick={addPresetDraftRow}
                  >
                    + Baris
                  </button>
                </div>
                {presetsDraft.map((row, i) => (
                  <div key={i} className="flex flex-wrap gap-2 mb-2 items-start">
                    <input
                      placeholder="Barang"
                      value={row.item}
                      onChange={(e) => updatePresetDraft(i, { item: e.target.value })}
                      className="flex-1 min-w-[120px] text-sm px-2 py-1 border rounded"
                    />
                    <input
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => updatePresetDraft(i, { quantity: e.target.value })}
                      className="w-24 text-sm px-2 py-1 border rounded"
                    />
                    <input
                      placeholder="Rp"
                      value={row.estimatedRupiah}
                      onChange={(e) =>
                        updatePresetDraft(i, { estimatedRupiah: e.target.value })
                      }
                      className="w-28 text-sm px-2 py-1 border rounded"
                    />
                    <input
                      placeholder="Toko"
                      value={row.store}
                      onChange={(e) => updatePresetDraft(i, { store: e.target.value })}
                      className="flex-1 min-w-[100px] text-sm px-2 py-1 border rounded"
                    />
                    <button
                      type="button"
                      className="text-xs text-red-600"
                      onClick={() => removePresetDraft(i)}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>

              {formErr && <p className="text-sm text-red-600">{formErr}</p>}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createBudget.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {createBudget.isPending ? 'Menyimpan…' : 'Buat budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
