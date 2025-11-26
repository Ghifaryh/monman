package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the MonMan system
// Following clean architecture pattern with proper JSON and DB tags
type User struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	Username          string     `json:"username" db:"username"`     // Primary login identifier
	Email             *string    `json:"email,omitempty" db:"email"` // Optional email for notifications
	PasswordHash      string     `json:"-" db:"password_hash"`       // Never include in JSON responses
	FirstName         string     `json:"first_name" db:"first_name"`
	LastName          string     `json:"last_name" db:"last_name"`
	Phone             *string    `json:"phone,omitempty" db:"phone"`
	DateOfBirth       *time.Time `json:"date_of_birth,omitempty" db:"date_of_birth"`
	ProfilePictureURL *string    `json:"profile_picture_url,omitempty" db:"profile_picture_url"`
	IsActive          bool       `json:"is_active" db:"is_active"`
	EmailVerifiedAt   *time.Time `json:"email_verified_at,omitempty" db:"email_verified_at"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}

// Account represents a financial account (bank, credit card, cash, etc.)
// Supports Indonesian banking system and e-wallets
type Account struct {
	ID            uuid.UUID `json:"id" db:"id"`
	UserID        uuid.UUID `json:"user_id" db:"user_id"`
	Name          string    `json:"name" db:"name"`                     // e.g., "Rekening Utama", "Kartu Kredit BCA"
	AccountType   string    `json:"account_type" db:"account_type"`     // "bank", "credit_card", "cash", "investment", "ewallet"
	BankName      *string   `json:"bank_name,omitempty" db:"bank_name"` // e.g., "BCA", "Mandiri", "BNI"
	AccountNumber *string   `json:"account_number,omitempty" db:"account_number"`
	Balance       int64     `json:"balance" db:"balance"`                     // Balance in cents (Rupiah * 100)
	CreditLimit   *int64    `json:"credit_limit,omitempty" db:"credit_limit"` // For credit cards, in cents
	IsDefault     bool      `json:"is_default" db:"is_default"`               // Default account for transactions
	Color         string    `json:"color" db:"color"`                         // Hex color for UI display
	IsActive      bool      `json:"is_active" db:"is_active"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`

	// Computed fields (not stored in DB)
	FormattedBalance string `json:"formatted_balance" db:"-"` // For Indonesian Rupiah formatting
}

// Category represents transaction categories with support for income and expense types
// Supports hierarchical categories (parent-child relationships)
type Category struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	UserID           *uuid.UUID `json:"user_id,omitempty" db:"user_id"`   // NULL for system categories
	Name             string     `json:"name" db:"name"`                   // e.g., "Makanan & Minuman", "Transportasi"
	CategoryType     string     `json:"category_type" db:"category_type"` // "income" or "expense"
	ParentCategoryID *uuid.UUID `json:"parent_category_id,omitempty" db:"parent_category_id"`
	Icon             string     `json:"icon" db:"icon"`           // Icon identifier for UI
	Color            string     `json:"color" db:"color"`         // Hex color for UI display
	IsSystem         bool       `json:"is_system" db:"is_system"` // System-provided categories
	IsActive         bool       `json:"is_active" db:"is_active"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`

	// Related data (loaded via joins)
	ParentCategory *Category  `json:"parent_category,omitempty" db:"-"`
	SubCategories  []Category `json:"sub_categories,omitempty" db:"-"`
}

// Transaction represents a financial transaction with Indonesian Rupiah support
// All amounts stored in cents to avoid floating point precision issues
type Transaction struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	UserID           uuid.UUID  `json:"user_id" db:"user_id"`
	AccountID        uuid.UUID  `json:"account_id" db:"account_id"`
	CategoryID       *uuid.UUID `json:"category_id,omitempty" db:"category_id"`
	Amount           int64      `json:"amount" db:"amount"` // Amount in cents, negative for expenses, positive for income
	Description      string     `json:"description" db:"description"`
	TransactionType  string     `json:"transaction_type" db:"transaction_type"` // "income", "expense", "transfer"
	TransactionDate  time.Time  `json:"transaction_date" db:"transaction_date"`
	Notes            *string    `json:"notes,omitempty" db:"notes"`
	ReceiptImageURL  *string    `json:"receipt_image_url,omitempty" db:"receipt_image_url"`
	LocationName     *string    `json:"location_name,omitempty" db:"location_name"` // e.g., "Shell Senayan"
	IsRecurring      bool       `json:"is_recurring" db:"is_recurring"`
	RecurringPattern *string    `json:"recurring_pattern,omitempty" db:"recurring_pattern"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`

	// Related data (loaded via joins)
	Account         *Account  `json:"account,omitempty" db:"-"`
	Category        *Category `json:"category,omitempty" db:"-"`
	FormattedAmount string    `json:"formatted_amount" db:"-"` // For Indonesian Rupiah formatting
	AbsoluteAmount  int64     `json:"absolute_amount" db:"-"`  // Absolute value of amount
}

// Budget represents budget categories with person responsibility
// Supports Indonesian family financial management patterns
type Budget struct {
	ID                uuid.UUID `json:"id" db:"id"`
	UserID            uuid.UUID `json:"user_id" db:"user_id"`
	CategoryID        uuid.UUID `json:"category_id" db:"category_id"`
	Name              string    `json:"name" db:"name"`                         // e.g., "Gas Budget Mingguan"
	AllocatedAmount   int64     `json:"allocated_amount" db:"allocated_amount"` // Budget amount in cents
	SpentAmount       int64     `json:"spent_amount" db:"spent_amount"`         // Current spent amount in cents
	BudgetPeriod      string    `json:"budget_period" db:"budget_period"`       // "weekly", "monthly", "yearly"
	PeriodStartDate   time.Time `json:"period_start_date" db:"period_start_date"`
	PeriodEndDate     time.Time `json:"period_end_date" db:"period_end_date"`
	ResponsiblePerson *string   `json:"responsible_person,omitempty" db:"responsible_person"` // "husband", "wife", "both"
	AutoReset         bool      `json:"auto_reset" db:"auto_reset"`
	AlertPercentage   int       `json:"alert_percentage" db:"alert_percentage"`
	IsActive          bool      `json:"is_active" db:"is_active"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`

	// Related data and computed fields
	Category           *Category `json:"category,omitempty" db:"-"`
	RemainingAmount    int64     `json:"remaining_amount" db:"-"`    // Calculated: allocated - spent
	FormattedAllocated string    `json:"formatted_allocated" db:"-"` // Indonesian Rupiah format
	FormattedSpent     string    `json:"formatted_spent" db:"-"`     // Indonesian Rupiah format
	FormattedRemaining string    `json:"formatted_remaining" db:"-"` // Indonesian Rupiah format
	SpentPercentage    float64   `json:"spent_percentage" db:"-"`    // Percentage of budget used
	OverBudget         bool      `json:"is_over_budget" db:"-"`      // True if spent > allocated
	AlertRequired      bool      `json:"should_alert" db:"-"`        // True if spent >= alert percentage
	DaysRemaining      int       `json:"days_remaining" db:"-"`      // Days until period ends
}

// IncomeSource represents different types of income with Indonesian context
type IncomeSource struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	UserID           uuid.UUID  `json:"user_id" db:"user_id"`
	CategoryID       uuid.UUID  `json:"category_id" db:"category_id"`
	Name             string     `json:"name" db:"name"`               // e.g., "Gapok", "Tukin", "Freelance"
	Amount           int64      `json:"amount" db:"amount"`           // Expected amount in cents
	Frequency        string     `json:"frequency" db:"frequency"`     // "monthly", "weekly", "yearly", "irregular"
	SourceType       string     `json:"source_type" db:"source_type"` // "salary", "freelance", "investment", "business"
	EmployerName     *string    `json:"employer_name,omitempty" db:"employer_name"`
	AccountID        *uuid.UUID `json:"account_id,omitempty" db:"account_id"` // Default receiving account
	IsActive         bool       `json:"is_active" db:"is_active"`
	NextExpectedDate *time.Time `json:"next_expected_date,omitempty" db:"next_expected_date"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`

	// Related data
	Category        *Category `json:"category,omitempty" db:"-"`
	Account         *Account  `json:"account,omitempty" db:"-"`
	FormattedAmount string    `json:"formatted_amount" db:"-"` // Indonesian Rupiah format
}

// UserSession represents user authentication sessions
type UserSession struct {
	ID           uuid.UUID `json:"id" db:"id"`
	UserID       uuid.UUID `json:"user_id" db:"user_id"`
	SessionToken string    `json:"session_token" db:"session_token"`
	RefreshToken *string   `json:"refresh_token,omitempty" db:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at" db:"expires_at"`
	IPAddress    *string   `json:"ip_address,omitempty" db:"ip_address"`
	UserAgent    *string   `json:"user_agent,omitempty" db:"user_agent"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// Request/Response DTOs for API endpoints

// CreateUserRequest represents the request payload for user registration
type CreateUserRequest struct {
	Username  string `json:"username" validate:"required,min=3,max=50,alphanum"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"first_name" validate:"required,min=1,max=100"`
	LastName  string `json:"last_name" validate:"required,min=1,max=100"`
	Email     string `json:"email,omitempty" validate:"omitempty,email"`
	Phone     string `json:"phone,omitempty" validate:"omitempty,max=20"`
}

// LoginRequest represents the request payload for user login
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse represents the response for successful login
type LoginResponse struct {
	User         User   `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresAt    string `json:"expires_at"`
}

// CreateTransactionRequest represents the request for creating a transaction
type CreateTransactionRequest struct {
	AccountID        uuid.UUID `json:"account_id" validate:"required"`
	CategoryID       uuid.UUID `json:"category_id,omitempty"`
	Amount           int64     `json:"amount" validate:"required,ne=0"`
	Description      string    `json:"description" validate:"required,min=1,max=255"`
	TransactionType  string    `json:"transaction_type" validate:"required,oneof=income expense"`
	TransactionDate  string    `json:"transaction_date" validate:"required"` // ISO date format
	Notes            string    `json:"notes,omitempty"`
	LocationName     string    `json:"location_name,omitempty"`
	IsRecurring      bool      `json:"is_recurring,omitempty"`
	RecurringPattern string    `json:"recurring_pattern,omitempty" validate:"omitempty,oneof=daily weekly monthly yearly"`
}

// CreateBudgetRequest represents the request for creating a budget
type CreateBudgetRequest struct {
	CategoryID        uuid.UUID `json:"category_id" validate:"required"`
	Name              string    `json:"name" validate:"required,min=1,max=100"`
	AllocatedAmount   int64     `json:"allocated_amount" validate:"required,gt=0"`
	BudgetPeriod      string    `json:"budget_period" validate:"required,oneof=weekly monthly yearly"`
	ResponsiblePerson string    `json:"responsible_person,omitempty"`
	AlertPercentage   int       `json:"alert_percentage,omitempty" validate:"omitempty,min=1,max=100"`
}

// DashboardResponse represents the dashboard summary data
type DashboardResponse struct {
	TotalBalance       int64              `json:"total_balance"`
	MonthlyIncome      int64              `json:"monthly_income"`
	MonthlyExpenses    int64              `json:"monthly_expenses"`
	MonthlyChange      int64              `json:"monthly_change"`
	FormattedBalance   string             `json:"formatted_balance"`
	FormattedIncome    string             `json:"formatted_income"`
	FormattedExpenses  string             `json:"formatted_expenses"`
	FormattedChange    string             `json:"formatted_change"`
	RecentTransactions []Transaction      `json:"recent_transactions"`
	ActiveAccounts     []Account          `json:"active_accounts"`
	BudgetOverview     []Budget           `json:"budget_overview"`
	SpendingByCategory []CategorySpending `json:"spending_by_category"`
}

// CategorySpending represents spending summary by category
type CategorySpending struct {
	CategoryID       uuid.UUID `json:"category_id"`
	CategoryName     string    `json:"category_name"`
	CategoryIcon     string    `json:"category_icon"`
	CategoryColor    string    `json:"category_color"`
	TotalAmount      int64     `json:"total_amount"`
	TransactionCount int       `json:"transaction_count"`
	FormattedAmount  string    `json:"formatted_amount"`
	Percentage       float64   `json:"percentage"`
}

// Helper methods for models

// FullName returns the concatenated first and last name
func (u *User) FullName() string {
	return u.FirstName + " " + u.LastName
}

// IsEmailVerified checks if the user's email is verified
func (u *User) IsEmailVerified() bool {
	return u.EmailVerifiedAt != nil
}

// IsIncome checks if the transaction is income
func (t *Transaction) IsIncome() bool {
	return t.TransactionType == "income" || t.Amount > 0
}

// IsExpense checks if the transaction is expense
func (t *Transaction) IsExpense() bool {
	return t.TransactionType == "expense" || t.Amount < 0
}

// GetAbsoluteAmount returns the absolute value of the transaction amount
func (t *Transaction) GetAbsoluteAmount() int64 {
	if t.Amount < 0 {
		return -t.Amount
	}
	return t.Amount
}

// CalculateRemainingAmount calculates the remaining budget amount
func (b *Budget) CalculateRemainingAmount() int64 {
	return b.AllocatedAmount - b.SpentAmount
}

// CalculateSpentPercentage calculates the percentage of budget spent
func (b *Budget) CalculateSpentPercentage() float64 {
	if b.AllocatedAmount == 0 {
		return 0
	}
	return float64(b.SpentAmount) / float64(b.AllocatedAmount) * 100
}

// IsOverBudget checks if the budget is exceeded
func (b *Budget) IsOverBudget() bool {
	return b.SpentAmount > b.AllocatedAmount
}

// ShouldAlert checks if an alert should be shown based on alert percentage
func (b *Budget) ShouldAlert() bool {
	percentage := b.CalculateSpentPercentage()
	return percentage >= float64(b.AlertPercentage)
}

// CalculateDaysRemaining calculates days remaining in budget period
func (b *Budget) CalculateDaysRemaining() int {
	now := time.Now()
	if now.After(b.PeriodEndDate) {
		return 0
	}
	duration := b.PeriodEndDate.Sub(now)
	return int(duration.Hours() / 24)
}
