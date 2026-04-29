package models

// TransactionAPI is the JSON shape used by list/dashboard endpoints (amounts in cents).
type TransactionAPI struct {
	ID          string `json:"id"`
	Date        string `json:"date"` // YYYY-MM-DD
	Description string `json:"description"`
	Category    string `json:"category"`
	Amount      int64  `json:"amount"` // signed cents
	Account     string `json:"account"`
}

// DashboardPayload is returned by GET /api/dashboard.
type DashboardPayload struct {
	TotalBalanceCents  int64            `json:"total_balance_cents"`
	MonthlyNetCents    int64            `json:"monthly_net_cents"` // Sum(amount) for current calendar month
	RecentTransactions []TransactionAPI `json:"recent_transactions"`
}

// TransactionListPayload is returned by GET /api/transactions.
type TransactionListPayload struct {
	Transactions      []TransactionAPI `json:"transactions"`
	MonthIncomeCents  int64            `json:"month_income_cents"`  // current month, positive totals only
	MonthExpenseCents int64            `json:"month_expense_cents"` // current month, absolute value of negatives
}
