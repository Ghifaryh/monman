/**
 * Authenticated finance API — amounts are in cents (signed for amount).
 */

import {
  authenticatedRequest,
  type ApiResponse,
} from './client'

export interface TransactionApiRow {
  id: string
  date: string
  description: string
  category: string
  amount: number
  account: string
}

export interface DashboardPayload {
  total_balance_cents: number
  monthly_net_cents: number
  recent_transactions: TransactionApiRow[]
}

export interface TransactionsListPayload {
  transactions: TransactionApiRow[]
  month_income_cents: number
  month_expense_cents: number
}

function unwrapData<T>(
  _path: string,
  response: ApiResponse<T>,
  label: string
): T {
  if (response.status !== 'success' || response.data === undefined) {
    throw new Error(
      typeof response.error === 'string'
        ? response.error
        : `${label} failed`
    )
  }
  return response.data
}

/** GET /api/dashboard */
export async function getDashboard(recentLimit?: number): Promise<DashboardPayload> {
  let path = '/api/dashboard'
  if (recentLimit != null) {
    path += `?recent=${recentLimit}`
  }
  const res = await authenticatedRequest<
    ApiResponse<DashboardPayload>
  >(path)
  return unwrapData(path, res, 'Dashboard')
}

/** GET /api/transactions */
export async function getTransactions(opts?: {
  limit?: number
  offset?: number
}): Promise<TransactionsListPayload> {
  const params = new URLSearchParams()
  if (opts?.limit != null) params.set('limit', String(opts.limit))
  if (opts?.offset != null) params.set('offset', String(opts.offset))
  const q = params.toString()
  const path = q ? `/api/transactions?${q}` : '/api/transactions'
  const res = await authenticatedRequest<
    ApiResponse<TransactionsListPayload>
  >(path)
  return unwrapData(path, res, 'Transactions')
}

export interface AccountSummaryRow {
  id: string
  name: string
  account_type: string
  balance: number
  color: string
}

export interface CategorySummaryRow {
  id: string
  name: string
  category_type: string
  icon: string
  is_system: boolean
}

export interface BudgetCommonPurchaseRow {
  id: string
  item: string
  quantity?: string
  estimated_amount: number
  store?: string
  is_frequently_used: boolean
  sort_order: number
}

export interface BudgetLineItemRow {
  id: string
  transaction_id: string
  item: string
  quantity?: string
  store?: string
  amount_cents: number
  date: string
  transaction_description?: string
}

export interface BudgetCardRow {
  id: string
  name: string
  icon: string
  color: string
  category_display: string
  allocated_amount: number
  spent_amount: number
  budget_period: string
  period_start_date: string
  period_end_date: string
  category_id: string
  /** May be null from JSON when omitted or explicitly null — always coerce with ?? [] at use sites */
  common_purchases: BudgetCommonPurchaseRow[] | null
  line_items: BudgetLineItemRow[] | null
}

export interface BudgetsPayload {
  budgets: BudgetCardRow[]
}

export async function getAccounts(): Promise<AccountSummaryRow[]> {
  const res = await authenticatedRequest<
    ApiResponse<{ accounts: AccountSummaryRow[] }>
  >('/api/accounts')
  return unwrapData('/api/accounts', res, 'Accounts').accounts
}

export type AccountTypeOption =
  | 'bank'
  | 'credit_card'
  | 'cash'
  | 'investment'
  | 'ewallet'

export interface CreateAccountPayload {
  name: string
  account_type?: AccountTypeOption
  color?: string
}

/** POST /api/accounts */
export async function createAccount(body: CreateAccountPayload): Promise<{ id: string }> {
  const res = await authenticatedRequest<ApiResponse<{ id: string }>>('/api/accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return unwrapData('/api/accounts', res, 'Create account')
}

export async function getCategories(opts?: {
  type?: 'income' | 'expense'
}): Promise<CategorySummaryRow[]> {
  const q = opts?.type ? `?type=${encodeURIComponent(opts.type)}` : ''
  const path = `/api/categories${q}`
  const res = await authenticatedRequest<
    ApiResponse<{ categories: CategorySummaryRow[] }>
  >(path)
  return unwrapData(path, res, 'Categories').categories
}

export async function getBudgets(): Promise<BudgetsPayload> {
  const res = await authenticatedRequest<ApiResponse<BudgetsPayload>>(
    '/api/budgets',
  )
  return unwrapData('/api/budgets', res, 'Budgets')
}

export interface CreateTransactionPayload {
  account_id: string
  category_id?: string
  magnitude_amount_cents: number
  description: string
  transaction_type: 'income' | 'expense'
  transaction_date: string
  location_name?: string
  budget_id?: string
  item?: string
  quantity?: string
  store?: string
}

/** POST /api/transactions */
export async function createTransaction(
  body: CreateTransactionPayload,
): Promise<{ id: string }> {
  const res = await authenticatedRequest<ApiResponse<{ id: string }>>(
    '/api/transactions',
    { method: 'POST', body: JSON.stringify(body) },
  )
  return unwrapData('/api/transactions', res, 'Create transaction')
}

export interface CreateCommonPurchasePayload {
  item: string
  quantity?: string
  /** cents */
  estimated_amount: number
  store?: string
  is_frequently_used?: boolean
  sort_order?: number
}

export interface CreateBudgetPayload {
  category_id: string
  name: string
  allocated_amount: number
  budget_period: 'weekly' | 'monthly' | 'yearly'
  period_start_date: string
  period_end_date: string
  responsible_person?: string
  alert_percentage?: number
  icon?: string
  color?: string
  sort_order?: number
  common_purchases?: CreateCommonPurchasePayload[]
}

/** POST /api/budgets */
export async function createBudget(body: CreateBudgetPayload): Promise<{ id: string }> {
  const res = await authenticatedRequest<ApiResponse<{ id: string }>>(
    '/api/budgets',
    { method: 'POST', body: JSON.stringify(body) },
  )
  return unwrapData('/api/budgets', res, 'Create budget')
}

export interface AppendCommonPurchasesPayload {
  purchases: CreateCommonPurchasePayload[]
}

/** POST /api/budgets/:id/common-purchases */
export async function appendBudgetCommonPurchases(
  budgetId: string,
  body: AppendCommonPurchasesPayload,
): Promise<void> {
  const res = await authenticatedRequest<ApiResponse<Record<string, unknown>>>(
    `/api/budgets/${encodeURIComponent(budgetId)}/common-purchases`,
    { method: 'POST', body: JSON.stringify(body) },
  )
  if (res.status !== 'success') {
    throw new Error(
      typeof res.error === 'string' ? res.error : 'Append presets failed',
    )
  }
}
