package service

import (
	"errors"
	"fmt"
	"strings"

	"monman-backend/internal/models"
	"monman-backend/internal/repository"

	"github.com/google/uuid"
)

type validationError struct{ msg string }

func (e validationError) Error() string { return e.msg }

// IsValidation reports client-side input errors suitable for HTTP 400.
func IsValidation(err error) bool {
	_, ok := err.(validationError)
	return ok
}

// FinanceService aggregates dashboard, lists, account/category/budget payloads, and creates.
type FinanceService struct {
	txRepo  *repository.TransactionRepository
	accRepo *repository.AccountRepository
	catRepo *repository.CategoryRepository
	budRepo *repository.BudgetRepository
}

func NewFinanceService(
	txRepo *repository.TransactionRepository,
	accRepo *repository.AccountRepository,
	catRepo *repository.CategoryRepository,
	budRepo *repository.BudgetRepository,
) *FinanceService {
	return &FinanceService{
		txRepo:  txRepo,
		accRepo: accRepo,
		catRepo: catRepo,
		budRepo: budRepo,
	}
}

// Dashboard returns balance, monthly net, and last N transactions.
func (s *FinanceService) Dashboard(userID uuid.UUID, recentLimit int) (*models.DashboardPayload, error) {
	if recentLimit <= 0 || recentLimit > 50 {
		recentLimit = 8
	}
	total, err := s.txRepo.SumAccountBalance(userID)
	if err != nil {
		return nil, fmt.Errorf("dashboard balance: %w", err)
	}
	monthlyNet, err := s.txRepo.SumAmountForCalendarMonth(userID)
	if err != nil {
		return nil, fmt.Errorf("dashboard monthly: %w", err)
	}
	recent, err := s.txRepo.ListForUser(userID, recentLimit, 0)
	if err != nil {
		return nil, fmt.Errorf("dashboard recent: %w", err)
	}
	return &models.DashboardPayload{
		TotalBalanceCents:  total,
		MonthlyNetCents:    monthlyNet,
		RecentTransactions: recent,
	}, nil
}

// ListTransactions returns transactions with current-month income/expense totals.
func (s *FinanceService) ListTransactions(userID uuid.UUID, limit, offset int) (*models.TransactionListPayload, error) {
	list, err := s.txRepo.ListForUser(userID, limit, offset)
	if err != nil {
		return nil, err
	}
	inc, exp, err := s.txRepo.MonthIncomeExpenseCents(userID)
	if err != nil {
		return nil, err
	}
	return &models.TransactionListPayload{
		Transactions:      list,
		MonthIncomeCents:  inc,
		MonthExpenseCents: exp,
	}, nil
}

func (s *FinanceService) ListAccounts(userID uuid.UUID) ([]models.AccountSummary, error) {
	list, err := s.accRepo.ListActiveByUser(userID)
	if err != nil {
		return nil, err
	}
	if len(list) == 0 {
		if err := s.accRepo.EnsureDefaultCashWallet(userID); err != nil {
			return nil, err
		}
		list, err = s.accRepo.ListActiveByUser(userID)
		if err != nil {
			return nil, err
		}
	}
	return list, nil
}

func (s *FinanceService) ListCategories(userID uuid.UUID, typeFilter string) ([]models.CategorySummary, error) {
	return s.catRepo.ListActiveForUser(userID, typeFilter)
}

// CreateAccount inserts an additional wallet/account row for the user.
func (s *FinanceService) CreateAccount(userID uuid.UUID, req *models.CreateAccountRequest) (uuid.UUID, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return uuid.Nil, validationError{"name is required"}
	}
	if len(name) > 120 {
		return uuid.Nil, validationError{"name is too long"}
	}
	at := strings.ToLower(strings.TrimSpace(req.AccountType))
	if at == "" {
		at = "cash"
	}
	switch at {
	case "bank", "credit_card", "cash", "investment", "ewallet":
	default:
		return uuid.Nil, validationError{"account_type must be bank, credit_card, cash, investment, or ewallet"}
	}
	col := strings.TrimSpace(req.Color)
	if col == "" {
		col = "#3B82F6"
	}
	return s.accRepo.Create(userID, name, at, col)
}

func (s *FinanceService) ListBudgets(userID uuid.UUID) (*models.BudgetsPayload, error) {
	cards, err := s.budRepo.ListBudgetCardsPayload(userID)
	if err != nil {
		return nil, err
	}
	return &models.BudgetsPayload{Budgets: cards}, nil
}

func (s *FinanceService) CreateBudget(userID uuid.UUID, req *models.CreateBudgetRequest) (uuid.UUID, error) {
	if req.AllocatedAmount <= 0 {
		return uuid.Nil, validationError{"allocated_amount must be positive"}
	}
	if strings.TrimSpace(req.Name) == "" {
		return uuid.Nil, validationError{"name is required"}
	}
	switch req.BudgetPeriod {
	case "weekly", "monthly", "yearly":
	default:
		return uuid.Nil, validationError{"invalid budget_period"}
	}
	if len(req.PeriodStartDate) < 8 || len(req.PeriodEndDate) < 8 {
		return uuid.Nil, validationError{"period_start_date and period_end_date are required (YYYY-MM-DD)"}
	}
	ctype, catOK, err := s.catRepo.CategoryOwnedOrSystem(req.CategoryID, userID)
	if err != nil {
		return uuid.Nil, err
	}
	if !catOK {
		return uuid.Nil, validationError{"category not found"}
	}
	if ctype != "expense" {
		return uuid.Nil, validationError{"budget category must be expense type"}
	}
	icon := "📱"
	if req.Icon != nil && strings.TrimSpace(*req.Icon) != "" {
		icon = strings.TrimSpace(*req.Icon)
	}
	color := "blue"
	if req.Color != nil && strings.TrimSpace(*req.Color) != "" {
		color = strings.TrimSpace(*req.Color)
	}
	sort := 0
	if req.SortOrder != nil {
		sort = *req.SortOrder
	}
	alert := 80
	if req.AlertPercentage != nil && *req.AlertPercentage > 0 && *req.AlertPercentage <= 100 {
		alert = *req.AlertPercentage
	}
	if len(req.CommonPurchases) > 80 {
		return uuid.Nil, validationError{"at most 80 common_purchases allowed"}
	}
	for _, cp := range req.CommonPurchases {
		if strings.TrimSpace(cp.Item) == "" {
			return uuid.Nil, validationError{"each common purchase needs item when listed"}
		}
		if cp.EstimatedAmount <= 0 {
			return uuid.Nil, validationError{"estimated_amount must be positive for common purchases"}
		}
	}
	id, err := s.budRepo.Create(userID, req.CategoryID, strings.TrimSpace(req.Name), req.AllocatedAmount,
		req.BudgetPeriod, req.PeriodStartDate, req.PeriodEndDate, req.ResponsiblePerson, alert,
		icon, color, sort, req.CommonPurchases)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") || strings.Contains(err.Error(), "unique constraint") {
			return uuid.Nil, validationError{"a budget with this name already exists"}
		}
		return uuid.Nil, err
	}
	return id, nil
}

// AppendCommonPurchases inserts pembelian umum presets for an existing owned budget.
func (s *FinanceService) AppendCommonPurchases(userID uuid.UUID, budgetID uuid.UUID, req *models.AppendCommonPurchasesRequest) error {
	if req == nil || len(req.Purchases) == 0 {
		return validationError{"purchases required"}
	}
	if len(req.Purchases) > 80 {
		return validationError{"at most 80 purchases allowed"}
	}
	for _, cp := range req.Purchases {
		if strings.TrimSpace(cp.Item) == "" {
			return validationError{"each purchase needs item"}
		}
		if cp.EstimatedAmount <= 0 {
			return validationError{"estimated_amount must be positive"}
		}
	}
	err := s.budRepo.AppendCommonPurchases(budgetID, userID, req.Purchases)
	if errors.Is(err, repository.ErrBudgetNotOwned) {
		return validationError{"budget not found"}
	}
	return err
}

// CreateTransaction creates an income/expense posting and optionally links an expense line to one budget bucket.
func (s *FinanceService) CreateTransaction(userID uuid.UUID, req *models.CreateTransactionRequest) (uuid.UUID, error) {
	if req.MagnitudeAmountCents <= 0 {
		return uuid.Nil, validationError{"magnitude_amount_cents must be positive"}
	}
	if strings.TrimSpace(req.Description) == "" {
		return uuid.Nil, validationError{"description is required"}
	}
	if req.TransactionDate == "" {
		return uuid.Nil, validationError{"transaction_date is required"}
	}
	txType := strings.ToLower(strings.TrimSpace(req.TransactionType))
	if txType != "income" && txType != "expense" {
		return uuid.Nil, validationError{"transaction_type must be income or expense"}
	}

	ok, err := s.accRepo.AccountBelongs(req.AccountID, userID)
	if err != nil {
		return uuid.Nil, err
	}
	if !ok {
		return uuid.Nil, validationError{"account not found"}
	}

	var effectiveCategory uuid.UUID
	if req.BudgetID != nil {
		if txType != "expense" {
			return uuid.Nil, validationError{"budget_id can only be set for expense"}
		}
		bcat, okb, err := s.budRepo.BudgetBelongs(*req.BudgetID, userID)
		if err != nil {
			return uuid.Nil, err
		}
		if !okb {
			return uuid.Nil, validationError{"budget not found"}
		}
		effectiveCategory = bcat
		if req.CategoryID != nil && *req.CategoryID != effectiveCategory {
			return uuid.Nil, validationError{"category_id must match the budget category"}
		}
	} else {
		if req.CategoryID == nil {
			return uuid.Nil, validationError{"category_id is required"}
		}
		effectiveCategory = *req.CategoryID
	}

	ctype, ok, err := s.catRepo.CategoryOwnedOrSystem(effectiveCategory, userID)
	if err != nil {
		return uuid.Nil, err
	}
	if !ok {
		return uuid.Nil, validationError{"category not found"}
	}
	want := "expense"
	if txType == "income" {
		want = "income"
	}
	if ctype != want {
		return uuid.Nil, validationError{"category type does not match transaction_type"}
	}

	var signed int64
	switch txType {
	case "income":
		signed = req.MagnitudeAmountCents
	case "expense":
		signed = -req.MagnitudeAmountCents
	}

	var link *repository.BudgetLinkParams
	if req.BudgetID != nil && txType == "expense" {
		item := strings.TrimSpace(req.Description)
		if req.Item != nil && strings.TrimSpace(*req.Item) != "" {
			item = strings.TrimSpace(*req.Item)
		}
		link = &repository.BudgetLinkParams{
			BudgetID: *req.BudgetID,
			Item:     item,
			UserID:   userID,
		}
		if req.Quantity != nil {
			q := strings.TrimSpace(*req.Quantity)
			if q != "" {
				link.Quantity = &q
			}
		}
		if req.Store != nil {
			st := strings.TrimSpace(*req.Store)
			if st != "" {
				link.Store = &st
			}
		}
		mag := req.MagnitudeAmountCents
		link.UnitPrice = &mag
	}

	desc := strings.TrimSpace(req.Description)
	id, err := s.txRepo.Create(userID, req.AccountID, effectiveCategory, signed, desc,
		txType, req.TransactionDate, req.LocationName, link)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}
