package repository

import (
	"database/sql"
	"fmt"

	"monman-backend/internal/models"

	"github.com/google/uuid"
)

type AccountRepository struct {
	db *sql.DB
}

func NewAccountRepository(db *sql.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) ListActiveByUser(userID uuid.UUID) ([]models.AccountSummary, error) {
	q := `
		SELECT id, name, account_type, balance, color
		FROM accounts WHERE user_id = ? AND is_active = 1
		ORDER BY is_default DESC, name ASC`
	rows, err := r.db.Query(q, userID.String())
	if err != nil {
		return nil, fmt.Errorf("list accounts: %w", err)
	}
	defer rows.Close()
	var out []models.AccountSummary
	for rows.Next() {
		var a models.AccountSummary
		var idStr string
		if err := rows.Scan(&idStr, &a.Name, &a.AccountType, &a.Balance, &a.Color); err != nil {
			return nil, err
		}
		a.ID = idStr
		out = append(out, a)
	}
	return out, rows.Err()
}

// Create inserts a new active non-default account (balance starts at zero).
func (r *AccountRepository) Create(userID uuid.UUID, name, accountType, color string) (uuid.UUID, error) {
	id := uuid.New()
	q := `
		INSERT INTO accounts (
			id, user_id, name, account_type, balance, is_default, color, is_active,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, 0, 0, ?, 1, datetime('now'), datetime('now'))
	`
	_, err := r.db.Exec(q, id.String(), userID.String(), name, accountType, color)
	if err != nil {
		return uuid.Nil, fmt.Errorf("insert account: %w", err)
	}
	return id, nil
}

// AccountBelongs verifies an account belongs to user and is active.
func (r *AccountRepository) AccountBelongs(accountID, userID uuid.UUID) (bool, error) {
	var n int
	q := `SELECT COUNT(*) FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1`
	if err := r.db.QueryRow(q, accountID.String(), userID.String()).Scan(&n); err != nil {
		return false, err
	}
	return n > 0, nil
}

// EnsureDefaultCashWallet inserts one default cash account if the user has no active accounts.
// New registrations do not otherwise create rows in `accounts`, which would leave transactions and budgets unusable.
func (r *AccountRepository) EnsureDefaultCashWallet(userID uuid.UUID) error {
	id := uuid.New()
	q := `
		INSERT INTO accounts (
			id, user_id, name, account_type, balance, is_default, color, is_active,
			created_at, updated_at
		) VALUES (?, ?, ?, 'cash', 0, 1, '#22C55E', 1, datetime('now'), datetime('now'))
	`
	_, err := r.db.Exec(q, id.String(), userID.String(), "Dompet utama")
	if err != nil {
		return fmt.Errorf("ensure default cash wallet: %w", err)
	}
	return nil
}

// CategoryRepository lists categories visible to user (system + own).
type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) ListActiveForUser(userID uuid.UUID, typeFilter string) ([]models.CategorySummary, error) {
	q := `
		SELECT id, name, category_type, icon, is_system FROM categories
		WHERE is_active = 1 AND (user_id IS NULL OR user_id = ?)
	`
	args := []any{userID.String()}
	if typeFilter == "income" || typeFilter == "expense" {
		q += " AND category_type = ?"
		args = append(args, typeFilter)
	}
	q += " ORDER BY is_system DESC, name ASC"

	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, fmt.Errorf("list categories: %w", err)
	}
	defer rows.Close()

	var out []models.CategorySummary
	for rows.Next() {
		var c models.CategorySummary
		var idStr string
		var isSys int
		if err := rows.Scan(&idStr, &c.Name, &c.CategoryType, &c.Icon, &isSys); err != nil {
			return nil, err
		}
		c.ID = idStr
		c.IsSystem = isSys == 1
		out = append(out, c)
	}
	return out, rows.Err()
}

// CategoryOwnedOrSystem returns true if category exists and user can attach it.
func (r *CategoryRepository) CategoryOwnedOrSystem(categoryID, userID uuid.UUID) (ctype string, ok bool, err error) {
	q := `
		SELECT category_type FROM categories
		WHERE id = ? AND is_active = 1 AND (user_id IS NULL OR user_id = ?)
	`
	err = r.db.QueryRow(q, categoryID.String(), userID.String()).Scan(&ctype)
	if err == sql.ErrNoRows {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return ctype, true, nil
}
