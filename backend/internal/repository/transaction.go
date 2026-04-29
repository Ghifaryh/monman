package repository

import (
	"database/sql"
	"fmt"

	"monman-backend/internal/models"

	"github.com/google/uuid"
)

// BudgetLinkParams links a newly inserted expense to a budget bucket (optional row in budget_transactions).
type BudgetLinkParams struct {
	BudgetID  uuid.UUID
	Item      string
	Quantity  *string
	Store     *string
	UserID    uuid.UUID
	UnitPrice *int64 // optional magnitude in cents
}

// TransactionRepository reads transaction rows for finance views.
type TransactionRepository struct {
	db *sql.DB
}

func NewTransactionRepository(db *sql.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// SumAccountBalance returns total balance across active accounts for a user (cents).
func (r *TransactionRepository) SumAccountBalance(userID uuid.UUID) (int64, error) {
	var sum sql.NullInt64
	q := `
		SELECT COALESCE(SUM(balance), 0) FROM accounts
		WHERE user_id = ? AND is_active = 1
	`
	if err := r.db.QueryRow(q, userID.String()).Scan(&sum); err != nil {
		return 0, fmt.Errorf("sum account balance: %w", err)
	}
	if !sum.Valid {
		return 0, nil
	}
	return sum.Int64, nil
}

// SumAmountForCalendarMonth returns sum(t.amount) for transactions in the same YYYY-MM as local "today".
func (r *TransactionRepository) SumAmountForCalendarMonth(userID uuid.UUID) (int64, error) {
	var sum sql.NullInt64
	q := `
		SELECT COALESCE(SUM(amount), 0) FROM transactions
		WHERE user_id = ?
		  AND strftime('%Y-%m', transaction_date) = strftime('%Y-%m', date('now','localtime'))
	`
	if err := r.db.QueryRow(q, userID.String()).Scan(&sum); err != nil {
		return 0, fmt.Errorf("sum monthly amount: %w", err)
	}
	if !sum.Valid {
		return 0, nil
	}
	return sum.Int64, nil
}

// MonthIncomeExpenseCents returns income (sum of positive amounts) and expense (sum of abs of negatives) for current calendar month.
func (r *TransactionRepository) MonthIncomeExpenseCents(userID uuid.UUID) (income int64, expense int64, err error) {
	q := `
		SELECT
			COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)
		FROM transactions
		WHERE user_id = ?
		  AND strftime('%Y-%m', transaction_date) = strftime('%Y-%m', date('now','localtime'))
	`
	var inc, exp sql.NullInt64
	if err := r.db.QueryRow(q, userID.String()).Scan(&inc, &exp); err != nil {
		return 0, 0, fmt.Errorf("month income expense: %w", err)
	}
	if inc.Valid {
		income = inc.Int64
	}
	if exp.Valid {
		expense = exp.Int64
	}
	return income, expense, nil
}

// ListForUser returns transactions with account and category names, newest first.
func (r *TransactionRepository) ListForUser(userID uuid.UUID, limit, offset int) ([]models.TransactionAPI, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}
	q := `
		SELECT
			t.id,
			t.transaction_date,
			t.description,
			t.amount,
			a.name,
			COALESCE(c.name, '—') AS category_name
		FROM transactions t
		INNER JOIN accounts a ON a.id = t.account_id
		LEFT JOIN categories c ON c.id = t.category_id
		WHERE t.user_id = ?
		ORDER BY t.transaction_date DESC, t.created_at DESC
		LIMIT ? OFFSET ?
	`
	rows, err := r.db.Query(q, userID.String(), limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list transactions: %w", err)
	}
	defer rows.Close()

	var out []models.TransactionAPI
	for rows.Next() {
		var (
			idStr       string
			dateStr     string
			description string
			amount      int64
			accountName string
			category    string
		)
		if err := rows.Scan(&idStr, &dateStr, &description, &amount, &accountName, &category); err != nil {
			return nil, fmt.Errorf("scan transaction: %w", err)
		}
		if _, err := uuid.Parse(idStr); err != nil {
			continue
		}
		out = append(out, models.TransactionAPI{
			ID:          idStr,
			Date:        dateStr,
			Description: description,
			Category:    category,
			Amount:      amount,
			Account:     accountName,
		})
	}
	return out, rows.Err()
}

// Create inserts one transaction row and optionally a budget_transactions row inside a DB transaction.
// Caller must enforce account/category ownership and triggers update balances / budget spent.
func (r *TransactionRepository) Create(
	userID uuid.UUID,
	accountID uuid.UUID,
	categoryID uuid.UUID,
	amountSigned int64,
	description string,
	txnType string,
	txnDate string,
	location *string,
	budgetLink *BudgetLinkParams,
) (uuid.UUID, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return uuid.Nil, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	id := uuid.New()
	insert := `
		INSERT INTO transactions (
			id, user_id, account_id, category_id, amount, description,
			transaction_type, transaction_date, location_name,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
	`
	var cat interface{} = categoryID.String()
	var loc interface{}
	if location != nil {
		loc = *location
	}

	if _, err := tx.Exec(insert,
		id.String(), userID.String(), accountID.String(), cat, amountSigned, description,
		txnType, txnDate, loc,
	); err != nil {
		return uuid.Nil, fmt.Errorf("insert transaction: %w", err)
	}

	if budgetLink != nil {
		btID := uuid.New()
		bt := `
			INSERT INTO budget_transactions (
				id, transaction_id, budget_id, user_id,
				item, quantity, store, unit_price,
				created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
		`
		var q sql.NullString
		if budgetLink.Quantity != nil && *budgetLink.Quantity != "" {
			q.Valid = true
			q.String = *budgetLink.Quantity
		}
		var shop sql.NullString
		if budgetLink.Store != nil && *budgetLink.Store != "" {
			shop.Valid = true
			shop.String = *budgetLink.Store
		}
		var unit sql.NullInt64
		if budgetLink.UnitPrice != nil {
			unit.Valid = true
			unit.Int64 = *budgetLink.UnitPrice
		}
		item := budgetLink.Item
		if item == "" {
			item = description
		}

		if _, err := tx.Exec(bt,
			btID.String(),
			id.String(),
			budgetLink.BudgetID.String(),
			budgetLink.UserID.String(),
			item, q, shop, unit,
		); err != nil {
			return uuid.Nil, fmt.Errorf("insert budget_transactions: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return uuid.Nil, fmt.Errorf("commit: %w", err)
	}
	return id, nil
}
