package models

import (
	"database/sql/driver"
	"time"

	"github.com/google/uuid"
)

// Budget represents the enhanced budget management system (uses the consolidated budgets table)
type Budget struct {
	ID                uuid.UUID    `json:"id" db:"id"`
	UserID            uuid.UUID    `json:"user_id" db:"user_id"`
	CategoryID        uuid.UUID    `json:"category_id" db:"category_id"`
	Name              string       `json:"name" db:"name"`
	AllocatedAmount   int64        `json:"allocated_amount" db:"allocated_amount"` // In cents
	SpentAmount       int64        `json:"spent_amount" db:"spent_amount"`         // In cents
	BudgetPeriod      BudgetPeriod `json:"budget_period" db:"budget_period"`
	PeriodStartDate   time.Time    `json:"period_start_date" db:"period_start_date"`
	PeriodEndDate     time.Time    `json:"period_end_date" db:"period_end_date"`
	ResponsiblePerson *string      `json:"responsible_person,omitempty" db:"responsible_person"`
	AutoReset         bool         `json:"auto_reset" db:"auto_reset"`
	AlertPercentage   int          `json:"alert_percentage" db:"alert_percentage"`
	IsActive          bool         `json:"is_active" db:"is_active"`
	
	// UI enhancement fields
	Icon      string `json:"icon" db:"icon"`
	Color     string `json:"color" db:"color"`
	SortOrder int    `json:"sort_order" db:"sort_order"`
	
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	// Computed fields (not stored in DB)
	RemainingAmount    int64                   `json:"remaining_amount,omitempty" db:"-"`
	TransactionCount   int                     `json:"transaction_count,omitempty" db:"-"`
	LastPeriodSpent    int64                   `json:"last_period_spent,omitempty" db:"-"`
	CommonPurchases    []BudgetCommonPurchase  `json:"common_purchases,omitempty" db:"-"`
	RecentTransactions []BudgetTransactionView `json:"recent_transactions,omitempty" db:"-"`
}

// BudgetPeriod represents valid budget periods
type BudgetPeriod string

const (
	BudgetPeriodWeekly  BudgetPeriod = "weekly"
	BudgetPeriodMonthly BudgetPeriod = "monthly"
	BudgetPeriodYearly  BudgetPeriod = "yearly"
)

// Value implements the driver.Valuer interface for database storage
func (bp BudgetPeriod) Value() (driver.Value, error) {
	return string(bp), nil
}

// Scan implements the sql.Scanner interface for database retrieval
func (bp *BudgetPeriod) Scan(value interface{}) error {
	if value == nil {
		*bp = BudgetPeriodMonthly
		return nil
	}
	if str, ok := value.(string); ok {
		*bp = BudgetPeriod(str)
	}
	return nil
}

// BudgetCommonPurchase represents pre-configured purchases for budgets
type BudgetCommonPurchase struct {
	ID               uuid.UUID `json:"id" db:"id"`
	BudgetID         uuid.UUID `json:"budget_id" db:"budget_id"` // References budgets.id
	Item             string    `json:"item" db:"item"`
	Quantity         *string   `json:"quantity,omitempty" db:"quantity"`
	EstimatedAmount  int64     `json:"estimated_amount" db:"estimated_amount"` // In cents
	Store            *string   `json:"store,omitempty" db:"store"`
	IsFrequentlyUsed bool      `json:"is_frequently_used" db:"is_frequently_used"`
	SortOrder        int       `json:"sort_order" db:"sort_order"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// BudgetTransaction links transactions to budgets with additional metadata
type BudgetTransaction struct {
	ID            uuid.UUID `json:"id" db:"id"`
	TransactionID uuid.UUID `json:"transaction_id" db:"transaction_id"`
	BudgetID      uuid.UUID `json:"budget_id" db:"budget_id"` // References budgets.id
	UserID        uuid.UUID `json:"user_id" db:"user_id"`
	Item          string    `json:"item" db:"item"`
	Quantity      *string   `json:"quantity,omitempty" db:"quantity"`
	Store         *string   `json:"store,omitempty" db:"store"`
	UnitPrice     *int64    `json:"unit_price,omitempty" db:"unit_price"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`

	// Joined fields from transactions table (for views)
	Amount          int64     `json:"amount,omitempty" db:"amount"`
	Description     string    `json:"description,omitempty" db:"description"`
	TransactionDate time.Time `json:"date,omitempty" db:"transaction_date"`
}

// BudgetTransactionView combines budget transaction with core transaction data
type BudgetTransactionView struct {
	ID       string  `json:"id"`
	Item     string  `json:"item"`
	Quantity *string `json:"quantity,omitempty"`
	Amount   int64   `json:"amount"` // In cents, positive value
	Store    *string `json:"store,omitempty"`
	Date     string  `json:"date"` // YYYY-MM-DD format for frontend
}

// BudgetWithStats includes computed statistics for API responses
type BudgetWithStats struct {
	Budget
	RemainingAmount    int64                   `json:"remaining_amount"`
	TransactionCount   int                     `json:"transaction_count"`
	LastPeriodSpent    int64                   `json:"last_period_spent"`
	CommonPurchases    []BudgetCommonPurchase  `json:"common_purchases"`
	RecentTransactions []BudgetTransactionView `json:"recent_transactions"`
}

// CreateBudgetRequest represents the request payload for creating budgets
type CreateBudgetRequest struct {
	CategoryID        uuid.UUID    `json:"category_id" validate:"required"`
	Name              string       `json:"name" validate:"required,min=1,max=100"`
	AllocatedAmount   int64        `json:"allocated_amount" validate:"required,min=1"`
	BudgetPeriod      BudgetPeriod `json:"budget_period" validate:"required,oneof=weekly monthly yearly"`
	ResponsiblePerson *string      `json:"responsible_person,omitempty" validate:"omitempty,max=50"`
	AutoReset         bool         `json:"auto_reset"`
	AlertPercentage   int          `json:"alert_percentage" validate:"min=0,max=100"`
	Icon              string       `json:"icon" validate:"required,min=1,max=10"`
	Color             string       `json:"color" validate:"required,min=1,max=20"`
	CommonPurchases   []CreateCommonPurchaseRequest `json:"common_purchases,omitempty"`
}

// UpdateBudgetRequest represents the request payload for updating budgets
type UpdateBudgetRequest struct {
	Name              *string      `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	AllocatedAmount   *int64       `json:"allocated_amount,omitempty" validate:"omitempty,min=1"`
	BudgetPeriod      *BudgetPeriod `json:"budget_period,omitempty" validate:"omitempty,oneof=weekly monthly yearly"`
	ResponsiblePerson *string      `json:"responsible_person,omitempty" validate:"omitempty,max=50"`
	AutoReset         *bool        `json:"auto_reset,omitempty"`
	AlertPercentage   *int         `json:"alert_percentage,omitempty" validate:"omitempty,min=0,max=100"`
	IsActive          *bool        `json:"is_active,omitempty"`
	Icon              *string      `json:"icon,omitempty" validate:"omitempty,min=1,max=10"`
	Color             *string      `json:"color,omitempty" validate:"omitempty,min=1,max=20"`
	SortOrder         *int         `json:"sort_order,omitempty"`
}

// CreateCommonPurchaseRequest represents the request payload for creating common purchases
type CreateCommonPurchaseRequest struct {
	Item             string  `json:"item" validate:"required,min=1,max=200"`
	Quantity         *string `json:"quantity,omitempty" validate:"omitempty,max=50"`
	EstimatedAmount  int64   `json:"estimated_amount" validate:"required,min=1"`
	Store            *string `json:"store,omitempty" validate:"omitempty,max=200"`
	IsFrequentlyUsed bool    `json:"is_frequently_used"`
}

// CreateBudgetTransactionRequest represents the request payload for budget transactions
type CreateBudgetTransactionRequest struct {
	BudgetID        uuid.UUID  `json:"budget_id" validate:"required"`
	AccountID       uuid.UUID  `json:"account_id" validate:"required"`
	CategoryID      *uuid.UUID `json:"category_id,omitempty"`
	Item            string     `json:"item" validate:"required,min=1,max=200"`
	Quantity        *string    `json:"quantity,omitempty" validate:"omitempty,max=50"`
	Amount          int64      `json:"amount" validate:"required,min=1"` // Positive value in cents
	Store           *string    `json:"store,omitempty" validate:"omitempty,max=200"`
	Notes           *string    `json:"notes,omitempty"`
	TransactionDate *string    `json:"transaction_date,omitempty"` // YYYY-MM-DD format, defaults to today
}

// BudgetSummaryResponse represents aggregated budget data for dashboard
type BudgetSummaryResponse struct {
	TotalAllocated  int64             `json:"total_allocated"`   // Total budget across all categories
	TotalSpent      int64             `json:"total_spent"`       // Total spent this period
	TotalRemaining  int64             `json:"total_remaining"`   // Total remaining budget
	BudgetsCount    int               `json:"budgets_count"`     // Number of active budgets
	OverBudgetCount int               `json:"over_budget_count"` // Budgets over allocated amount
	Budgets         []BudgetWithStats `json:"budgets"`           // List of budgets with stats
}