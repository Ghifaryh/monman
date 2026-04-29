package models

import "github.com/google/uuid"

// CreateTransactionRequest is the body for POST /api/transactions.
// MagnitudeAmountCents is always positive; sign is inferred from transaction_type.
type CreateTransactionRequest struct {
	AccountID            uuid.UUID  `json:"account_id"`
	CategoryID           *uuid.UUID `json:"category_id,omitempty"`
	MagnitudeAmountCents int64      `json:"magnitude_amount_cents"`
	Description          string     `json:"description"`
	TransactionType      string     `json:"transaction_type"` // income | expense
	TransactionDate      string     `json:"transaction_date"` // YYYY-MM-DD
	LocationName         *string    `json:"location_name,omitempty"`
	BudgetID             *uuid.UUID `json:"budget_id,omitempty"`
	Item                 *string    `json:"item,omitempty"`
	Quantity             *string    `json:"quantity,omitempty"`
	Store                *string    `json:"store,omitempty"`
}

// CreateBudgetRequest is the body for POST /api/budgets.
type CreateBudgetRequest struct {
	CategoryID        uuid.UUID                     `json:"category_id"`
	Name              string                        `json:"name"`
	AllocatedAmount   int64                         `json:"allocated_amount"`
	BudgetPeriod      string                        `json:"budget_period"`
	PeriodStartDate   string                        `json:"period_start_date"`
	PeriodEndDate     string                        `json:"period_end_date"`
	ResponsiblePerson *string                       `json:"responsible_person,omitempty"`
	AlertPercentage   *int                          `json:"alert_percentage,omitempty"`
	Icon              *string                       `json:"icon,omitempty"`
	Color             *string                       `json:"color,omitempty"`
	SortOrder         *int                          `json:"sort_order,omitempty"`
	CommonPurchases   []CreateCommonPurchaseInput   `json:"common_purchases,omitempty"`
}

// CreateCommonPurchaseInput is one pembelian umum preset (amount in cents).
type CreateCommonPurchaseInput struct {
	Item             string  `json:"item"`
	Quantity         *string `json:"quantity,omitempty"`
	EstimatedAmount  int64   `json:"estimated_amount"`
	Store            *string `json:"store,omitempty"`
	IsFrequentlyUsed *bool   `json:"is_frequently_used,omitempty"`
	SortOrder        *int    `json:"sort_order,omitempty"`
}

// AppendCommonPurchasesRequest is the body for POST /api/budgets/:id/common-purchases.
type AppendCommonPurchasesRequest struct {
	Purchases []CreateCommonPurchaseInput `json:"purchases"`
}

// CreateAccountRequest is the body for POST /api/accounts.
type CreateAccountRequest struct {
	Name        string  `json:"name"`
	AccountType string  `json:"account_type,omitempty"` // bank | credit_card | cash | investment | ewallet — default cash
	Color       string  `json:"color,omitempty"`
}

// AccountSummary for GET /api/accounts.
type AccountSummary struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	AccountType string `json:"account_type"`
	Balance     int64  `json:"balance"`
	Color       string `json:"color"`
}

// CategorySummary for GET /api/categories.
type CategorySummary struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	CategoryType string `json:"category_type"`
	Icon         string `json:"icon"`
	IsSystem     bool   `json:"is_system"`
}

// BudgetCommonPurchaseAPI is a preset row for BudgetCategoryCard.
type BudgetCommonPurchaseAPI struct {
	ID               string `json:"id"`
	Item             string `json:"item"`
	Quantity         string `json:"quantity,omitempty"`
	EstimatedAmount  int64  `json:"estimated_amount"`
	Store            string `json:"store,omitempty"`
	IsFrequentlyUsed bool   `json:"is_frequently_used"`
	SortOrder        int    `json:"sort_order"`
}

// BudgetLineItemAPI is a linked expense line with item metadata.
type BudgetLineItemAPI struct {
	ID                      string `json:"id"`
	TransactionID           string `json:"transaction_id"`
	Item                    string `json:"item"`
	Quantity                string `json:"quantity,omitempty"`
	Store                   string `json:"store,omitempty"`
	AmountCents             int64  `json:"amount_cents"`
	Date                    string `json:"date"`
	TransactionDescription  string `json:"transaction_description,omitempty"`
}

// BudgetCardAPI is one budget bucket for showcase / planner UI.
type BudgetCardAPI struct {
	ID               string                     `json:"id"`
	Name             string                     `json:"name"`
	Icon             string                     `json:"icon"`
	Color            string                     `json:"color"`
	CategoryDisplay  string                     `json:"category_display"`
	AllocatedAmount  int64                      `json:"allocated_amount"`
	SpentAmount      int64                      `json:"spent_amount"`
	BudgetPeriod     string                     `json:"budget_period"`
	PeriodStartDate  string                     `json:"period_start_date"`
	PeriodEndDate    string                     `json:"period_end_date"`
	CategoryID       string                     `json:"category_id"`
	CommonPurchases  []BudgetCommonPurchaseAPI  `json:"common_purchases"`
	LineItems        []BudgetLineItemAPI        `json:"line_items"`
}

// BudgetsPayload for GET /api/budgets.
type BudgetsPayload struct {
	Budgets []BudgetCardAPI `json:"budgets"`
}
