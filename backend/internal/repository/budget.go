package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"monman-backend/internal/models"

	"github.com/google/uuid"
)

// ErrBudgetNotOwned indicates the budget id does not belong to this user or is inactive.
var ErrBudgetNotOwned = errors.New("budget not owned or not found")


const maxLineItemsPerBudget = 40

type BudgetRepository struct {
	db *sql.DB
}

func NewBudgetRepository(db *sql.DB) *BudgetRepository {
	return &BudgetRepository{db: db}
}

func (r *BudgetRepository) BudgetBelongs(budgetID, userID uuid.UUID) (categoryID uuid.UUID, ok bool, err error) {
	q := `SELECT category_id FROM budgets WHERE id = ? AND user_id = ? AND is_active = 1`
	var catStr string
	if err := r.db.QueryRow(q, budgetID.String(), userID.String()).Scan(&catStr); err == sql.ErrNoRows {
		return uuid.Nil, false, nil
	} else if err != nil {
		return uuid.Nil, false, err
	}
	cid, err := uuid.Parse(catStr)
	if err != nil {
		return uuid.Nil, false, err
	}
	return cid, true, nil
}

// BudgetOwned reports whether this active budget belongs to the user.
func (r *BudgetRepository) BudgetOwned(budgetID, userID uuid.UUID) (bool, error) {
	var n int
	err := r.db.QueryRow(
		`SELECT COUNT(*) FROM budgets WHERE id = ? AND user_id = ? AND is_active = 1`,
		budgetID.String(), userID.String(),
	).Scan(&n)
	if err != nil {
		return false, err
	}
	return n > 0, nil
}

// Create inserts a new budget (spent_amount = 0) and optional pembelian umum presets in one transaction.
func (r *BudgetRepository) Create(
	userID, categoryID uuid.UUID,
	name string,
	allocated int64,
	period, start, end string,
	responsible *string,
	alert int,
	icon, color string,
	sort int,
	commonPurchases []models.CreateCommonPurchaseInput,
) (uuid.UUID, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return uuid.Nil, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	id := uuid.New()
	a := alert
	if a <= 0 {
		a = 80
	}
	var rp interface{}
	if responsible != nil {
		rp = *responsible
	}
	q := `
		INSERT INTO budgets (
			id, user_id, category_id, name, allocated_amount, spent_amount,
			budget_period, period_start_date, period_end_date, responsible_person,
			auto_reset, alert_percentage, is_active, icon, color, sort_order,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 1, ?, 1, ?, ?, ?, datetime('now'), datetime('now'))
	`
	_, err = tx.Exec(q,
		id.String(), userID.String(), categoryID.String(), name, allocated,
		period, start, end,
		rp, a,
		icon, color, sort,
	)
	if err != nil {
		return uuid.Nil, fmt.Errorf("insert budget: %w", err)
	}

	if err := insertBudgetCommonPurchasesTx(tx, id, commonPurchases, 80); err != nil {
		return uuid.Nil, err
	}

	if err := tx.Commit(); err != nil {
		return uuid.Nil, fmt.Errorf("commit budget: %w", err)
	}
	return id, nil
}

// AppendCommonPurchases inserts preset rows after verifying budget ownership.
func (r *BudgetRepository) AppendCommonPurchases(budgetID, userID uuid.UUID, items []models.CreateCommonPurchaseInput) error {
	ok, err := r.BudgetOwned(budgetID, userID)
	if err != nil {
		return err
	}
	if !ok {
		return ErrBudgetNotOwned
	}
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if err := insertBudgetCommonPurchasesTx(tx, budgetID, items, 80); err != nil {
		return err
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit common purchases: %w", err)
	}
	return nil
}

func insertBudgetCommonPurchasesTx(
	tx *sql.Tx,
	budgetID uuid.UUID,
	items []models.CreateCommonPurchaseInput,
	maxRows int,
) error {
	if len(items) > maxRows {
		return fmt.Errorf("too many common_purchases (max %d)", maxRows)
	}
	insert := `
		INSERT INTO budget_common_purchases (
			id, budget_id, item, quantity, estimated_amount, store,
			is_frequently_used, sort_order,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
	`
	for i := range items {
		it := items[i]
		if strings.TrimSpace(it.Item) == "" {
			continue
		}
		if it.EstimatedAmount <= 0 {
			return fmt.Errorf("estimated_amount must be positive for item %q", it.Item)
		}
		pid := uuid.New()
		var qty, store sql.NullString
		if it.Quantity != nil && strings.TrimSpace(*it.Quantity) != "" {
			qty = sql.NullString{String: strings.TrimSpace(*it.Quantity), Valid: true}
		}
		if it.Store != nil && strings.TrimSpace(*it.Store) != "" {
			store = sql.NullString{String: strings.TrimSpace(*it.Store), Valid: true}
		}
		freq := 1
		if it.IsFrequentlyUsed != nil && !*it.IsFrequentlyUsed {
			freq = 0
		}
		sortOrd := i
		if it.SortOrder != nil {
			sortOrd = *it.SortOrder
		}
		_, err := tx.Exec(insert,
			pid.String(), budgetID.String(), strings.TrimSpace(it.Item),
			qty, it.EstimatedAmount, store,
			freq, sortOrd,
		)
		if err != nil {
			return fmt.Errorf("insert common purchase: %w", err)
		}
	}
	return nil
}

// ListBudgetCardsPayload loads active budgets with category display and nested preset / line-item rows for the showcase API.
func (r *BudgetRepository) ListBudgetCardsPayload(userID uuid.UUID) ([]models.BudgetCardAPI, error) {
	q := `
		SELECT b.id, b.name, b.icon, b.color,
			b.allocated_amount, b.spent_amount,
			b.budget_period, b.period_start_date, b.period_end_date,
			b.category_id, c.name AS category_name
		FROM budgets b
		INNER JOIN categories c ON c.id = b.category_id
		WHERE b.user_id = ? AND b.is_active = 1 AND c.is_active = 1
		ORDER BY b.sort_order, b.name`

	rows, err := r.db.Query(q, userID.String())
	if err != nil {
		return nil, fmt.Errorf("list budgets: %w", err)
	}
	defer rows.Close()

	type row struct {
		id, name, icon, color, period, start, end, catID, catName string
		allocated, spent                                            int64
	}
	var budgetRows []row
	idOrder := []string{}
	for rows.Next() {
		var rr row
		if err := rows.Scan(
			&rr.id, &rr.name, &rr.icon, &rr.color,
			&rr.allocated, &rr.spent,
			&rr.period, &rr.start, &rr.end,
			&rr.catID, &rr.catName); err != nil {
			return nil, fmt.Errorf("scan budget: %w", err)
		}
		budgetRows = append(budgetRows, rr)
		idOrder = append(idOrder, rr.id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(budgetRows) == 0 {
		return []models.BudgetCardAPI{}, nil
	}

	commonByBudget, err := r.loadCommonPurchasesMapped(userID, idOrder)
	if err != nil {
		return nil, err
	}
	linesByBudget, err := r.loadBudgetLineItemsMapped(userID, idOrder)
	if err != nil {
		return nil, err
	}

	out := make([]models.BudgetCardAPI, 0, len(budgetRows))
	for _, br := range budgetRows {
		display := br.catName
		if br.icon != "" {
			display = fmt.Sprintf("%s %s", br.icon, br.catName)
		}
		out = append(out, models.BudgetCardAPI{
			ID:              br.id,
			Name:            br.name,
			Icon:            br.icon,
			Color:           br.color,
			CategoryDisplay: display,
			AllocatedAmount: br.allocated,
			SpentAmount:     br.spent,
			BudgetPeriod:    br.period,
			PeriodStartDate: br.start,
			PeriodEndDate:   br.end,
			CategoryID:      br.catID,
			CommonPurchases: commonByBudget[br.id],
			LineItems:       linesByBudget[br.id],
		})
	}
	return out, nil
}

func (r *BudgetRepository) loadCommonPurchasesMapped(userID uuid.UUID, budgetIDs []string) (map[string][]models.BudgetCommonPurchaseAPI, error) {
	out := make(map[string][]models.BudgetCommonPurchaseAPI)
	if len(budgetIDs) == 0 {
		return out, nil
	}
	placeholders := ""
	args := []any{userID.String()}
	for i, id := range budgetIDs {
		if i > 0 {
			placeholders += ","
		}
		placeholders += "?"
		args = append(args, id)
	}
	q := fmt.Sprintf(`
		SELECT p.id, p.budget_id, p.item, p.quantity, p.estimated_amount, p.store, p.is_frequently_used, p.sort_order
		FROM budget_common_purchases p
		INNER JOIN budgets b ON b.id = p.budget_id AND b.user_id = ?
		WHERE p.budget_id IN (%s)
		ORDER BY p.budget_id, p.sort_order, p.item`, placeholders)

	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, fmt.Errorf("common purchases: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			id, bid, item string
			qty, store    sql.NullString
			amt           int64
			freq, sort    int
		)
		if err := rows.Scan(&id, &bid, &item, &qty, &amt, &store, &freq, &sort); err != nil {
			return nil, fmt.Errorf("scan common purchase: %w", err)
		}
		cp := models.BudgetCommonPurchaseAPI{
			ID:               id,
			Item:             item,
			EstimatedAmount:  amt,
			IsFrequentlyUsed: freq == 1,
			SortOrder:        sort,
		}
		if qty.Valid {
			cp.Quantity = qty.String
		}
		if store.Valid {
			cp.Store = store.String
		}
		out[bid] = append(out[bid], cp)
	}
	return out, rows.Err()
}

func (r *BudgetRepository) loadBudgetLineItemsMapped(userID uuid.UUID, budgetIDs []string) (map[string][]models.BudgetLineItemAPI, error) {
	out := make(map[string][]models.BudgetLineItemAPI)
	raw := make(map[string][]models.BudgetLineItemAPI)

	if len(budgetIDs) == 0 {
		return out, nil
	}
	placeholders := ""
	args := []any{userID.String()}
	for i, id := range budgetIDs {
		if i > 0 {
			placeholders += ","
		}
		placeholders += "?"
		args = append(args, id)
	}
	// Same scope as DB triggers that bump budgets.spent_amount: expense rows whose category and date
	// fall into this budget's window. Optional budget_transactions row enriches item/qty/store when
	// the expense was created with budget_id (e.g. from the Budget page).
	q := fmt.Sprintf(`
		SELECT
			b.id AS budget_id,
			t.id AS transaction_id,
			CASE
				WHEN bt.id IS NOT NULL AND NULLIF(TRIM(bt.item), '') IS NOT NULL THEN TRIM(bt.item)
				WHEN NULLIF(TRIM(t.description), '') IS NOT NULL THEN TRIM(t.description)
				ELSE 'Pengeluaran'
			END AS item,
			bt.quantity, bt.store,
			ABS(t.amount), t.transaction_date, t.description
		FROM budgets b
		INNER JOIN transactions t ON t.user_id = b.user_id
			AND t.category_id = b.category_id
			AND t.transaction_type = 'expense'
			AND t.transaction_date >= b.period_start_date
			AND t.transaction_date <= b.period_end_date
		LEFT JOIN budget_transactions bt ON bt.budget_id = b.id
			AND bt.transaction_id = t.id
			AND bt.user_id = b.user_id
		WHERE b.user_id = ? AND b.id IN (%s)
		ORDER BY b.id, t.transaction_date DESC, t.id DESC`, placeholders)

	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, fmt.Errorf("budget line items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			bid, tid, item, txDate, desc string
			qty, store                   sql.NullString
			amount                       int64
		)
		if err := rows.Scan(&bid, &tid, &item, &qty, &store, &amount, &txDate, &desc); err != nil {
			return nil, fmt.Errorf("scan line: %w", err)
		}
		li := models.BudgetLineItemAPI{
			ID:                     tid,
			TransactionID:          tid,
			Item:                   item,
			AmountCents:            amount,
			Date:                   txDate,
			TransactionDescription: desc,
		}
		if qty.Valid {
			li.Quantity = qty.String
		}
		if store.Valid {
			li.Store = store.String
		}
		raw[bid] = append(raw[bid], li)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for bid, list := range raw {
		if len(list) > maxLineItemsPerBudget {
			list = list[:maxLineItemsPerBudget]
		}
		out[bid] = list
	}
	for _, id := range budgetIDs {
		if _, ok := out[id]; !ok {
			out[id] = nil
		}
	}
	return out, nil
}
