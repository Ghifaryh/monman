import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAccount,
  createBudget,
  createTransaction,
  getAccounts,
  getBudgets,
  appendBudgetCommonPurchases,
  getCategories,
  getDashboard,
  getTransactions,
  type AppendCommonPurchasesPayload,
  type BudgetsPayload,
  type AccountSummaryRow,
  type CategorySummaryRow,
  type CreateAccountPayload,
  type CreateBudgetPayload,
  type CreateTransactionPayload,
  type DashboardPayload,
  type TransactionsListPayload,
} from '../api/finance'

export const dashboardQueryKey = ['dashboard'] as const
export const transactionsQueryKey = ['transactions'] as const
export const accountsQueryKey = ['accounts'] as const
export const budgetsQueryKey = ['budgets'] as const

export function categoriesQueryKey(type?: 'income' | 'expense') {
  return ['categories', type ?? ''] as const
}

export function useDashboardQuery() {
  return useQuery<DashboardPayload>({
    queryKey: dashboardQueryKey,
    queryFn: () => getDashboard(8),
  })
}

export function useTransactionsQuery() {
  return useQuery<TransactionsListPayload>({
    queryKey: transactionsQueryKey,
    queryFn: () => getTransactions({ limit: 200 }),
  })
}

export function useAccountsQuery() {
  return useQuery<AccountSummaryRow[]>({
    queryKey: accountsQueryKey,
    queryFn: () => getAccounts(),
  })
}

export function useBudgetsQuery() {
  return useQuery<BudgetsPayload>({
    queryKey: budgetsQueryKey,
    queryFn: () => getBudgets(),
  })
}

export function useCategoriesQuery(type?: 'income' | 'expense') {
  return useQuery<CategorySummaryRow[]>({
    queryKey: categoriesQueryKey(type),
    queryFn: () => getCategories({ type }),
  })
}

export function useCreateTransactionMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTransactionPayload) => createTransaction(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: dashboardQueryKey })
      void qc.invalidateQueries({ queryKey: transactionsQueryKey })
      void qc.invalidateQueries({ queryKey: budgetsQueryKey })
      void qc.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}

export function useCreateAccountMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAccountPayload) => createAccount(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountsQueryKey })
      void qc.invalidateQueries({ queryKey: dashboardQueryKey })
    },
  })
}

export function useCreateBudgetMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBudgetPayload) => createBudget(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: budgetsQueryKey })
      void qc.invalidateQueries({ queryKey: dashboardQueryKey })
    },
  })
}

export function useAppendBudgetCommonPurchasesMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { budgetId: string } & AppendCommonPurchasesPayload) =>
      appendBudgetCommonPurchases(vars.budgetId, { purchases: vars.purchases }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: budgetsQueryKey })
      void qc.invalidateQueries({ queryKey: dashboardQueryKey })
    },
  })
}
