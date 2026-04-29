package api

import (
	"encoding/json"
	"log"
	"monman-backend/internal/config"
	"monman-backend/internal/db"
	"monman-backend/internal/middleware"
	"monman-backend/internal/models"
	"monman-backend/internal/repository"
	"monman-backend/internal/service"
	"monman-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// Handler holds dependencies for API handlers
type Handler struct {
	userService    *service.UserService
	financeService *service.FinanceService
	jwtUtil        *utils.JWTUtil
}

// NewHandler creates a new API handler with dependencies
func NewHandler() http.Handler {
	// Load configuration
	cfg := config.Load()

	// Initialize database connection
	database, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize repositories and services
	userRepo := repository.NewUserRepository(database.DB)
	txRepo := repository.NewTransactionRepository(database.DB)
	accRepo := repository.NewAccountRepository(database.DB)
	catRepo := repository.NewCategoryRepository(database.DB)
	budRepo := repository.NewBudgetRepository(database.DB)
	userService := service.NewUserService(userRepo)
	financeService := service.NewFinanceService(txRepo, accRepo, catRepo, budRepo)

	// Initialize JWT utility
	jwtUtil := utils.NewJWTUtil(cfg.JWT.Secret, cfg.JWT.TTL)

	// Create handler instance
	h := &Handler{
		userService:    userService,
		financeService: financeService,
		jwtUtil:        jwtUtil,
	}

	// Setup router
	r := chi.NewRouter()

	// Add CORS middleware for frontend connections
	r.Use(middleware.CORS())

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "monman-api"})
	})

	// health
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	// Auth endpoints (public)
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/login", h.handleLogin)
		r.Post("/register", h.handleRegister)
	})

	// Protected endpoints
	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.JWTAuth(cfg))
		r.Get("/profile", h.handleGetProfile)
		r.Post("/refresh-token", h.handleRefreshToken)
		r.Get("/dashboard", h.handleDashboard)
		r.Get("/transactions", h.handleTransactions)
		r.Post("/transactions", h.handleCreateTransaction)
		r.Post("/accounts", h.handleCreateAccount)
		r.Get("/accounts", h.handleAccounts)
		r.Get("/categories", h.handleCategories)
		r.Get("/budgets", h.handleBudgets)
		r.Post("/budgets", h.handleCreateBudget)
		r.Post("/budgets/{budgetID}/common-purchases", h.handleAppendBudgetCommonPurchases)
	})

	return r
}

// handleLogin processes login requests and returns JWT token
func (h *Handler) handleLogin(w http.ResponseWriter, r *http.Request) {
	var loginReq models.LoginRequest

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		log.Printf("Error decoding login request: %v", err)
		utils.WriteErrorResponse(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Authenticate user
	user, err := h.userService.AuthenticateUser(&loginReq)
	if err != nil {
		log.Printf("Authentication failed for user %s: %v", loginReq.Username, err)
		utils.WriteErrorResponse(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := h.jwtUtil.GenerateToken(user.ID, user.Username, user.IsActive)
	if err != nil {
		log.Printf("Error generating JWT token: %v", err)
		utils.WriteErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Return successful response
	response := map[string]interface{}{
		"status":  "success",
		"message": "Login successful",
		"data": map[string]interface{}{
			"token": token,
			"user": map[string]interface{}{
				"id":         user.ID,
				"username":   user.Username,
				"first_name": user.FirstName,
				"last_name":  user.LastName,
				"email":      user.Email,
			},
		},
	}

	utils.WriteJSONResponse(w, response, http.StatusOK)
}

// handleRegister processes user registration requests
func (h *Handler) handleRegister(w http.ResponseWriter, r *http.Request) {
	var createReq models.CreateUserRequest

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&createReq); err != nil {
		log.Printf("Error decoding register request: %v", err)
		utils.WriteErrorResponse(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Create user
	user, err := h.userService.CreateUser(&createReq)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		if err.Error() == "username already exists" || err.Error() == "email already exists" {
			utils.WriteErrorResponse(w, err.Error(), http.StatusConflict)
		} else {
			utils.WriteErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	// Generate JWT token for new user
	token, err := h.jwtUtil.GenerateToken(user.ID, user.Username, user.IsActive)
	if err != nil {
		log.Printf("Error generating JWT token for new user: %v", err)
		utils.WriteErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Return successful response
	response := map[string]interface{}{
		"status":  "success",
		"message": "Registration successful",
		"data": map[string]interface{}{
			"token": token,
			"user": map[string]interface{}{
				"id":         user.ID,
				"username":   user.Username,
				"first_name": user.FirstName,
				"last_name":  user.LastName,
				"email":      user.Email,
			},
		},
	}

	utils.WriteJSONResponse(w, response, http.StatusCreated)
}

// handleGetProfile returns the current user's profile information
func (h *Handler) handleGetProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from JWT claims in context
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get full user information
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		log.Printf("Error getting user profile for ID %s: %v", userID, err)
		utils.WriteErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	// Return user profile
	response := map[string]interface{}{
		"status": "success",
		"data": map[string]interface{}{
			"user": map[string]interface{}{
				"id":         user.ID,
				"username":   user.Username,
				"first_name": user.FirstName,
				"last_name":  user.LastName,
				"email":      user.Email,
				"phone":      user.Phone,
				"is_active":  user.IsActive,
				"created_at": user.CreatedAt,
				"updated_at": user.UpdatedAt,
			},
		},
	}

	utils.WriteJSONResponse(w, response, http.StatusOK)
}

// handleRefreshToken generates a new JWT token from a valid existing token
func (h *Handler) handleRefreshToken(w http.ResponseWriter, r *http.Request) {
	// Get current user from context
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get user to ensure they're still active
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		log.Printf("Error getting user for token refresh: %v", err)
		utils.WriteErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	if !user.IsActive {
		utils.WriteErrorResponse(w, "Account is inactive", http.StatusUnauthorized)
		return
	}

	// Generate new token
	newToken, err := h.jwtUtil.GenerateToken(user.ID, user.Username, user.IsActive)
	if err != nil {
		log.Printf("Error generating refresh token: %v", err)
		utils.WriteErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Return new token
	response := map[string]interface{}{
		"status": "success",
		"data": map[string]interface{}{
			"token": newToken,
		},
	}

	utils.WriteJSONResponse(w, response, http.StatusOK)
}

func (h *Handler) handleDashboard(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	recent := 8
	if q := r.URL.Query().Get("recent"); q != "" {
		if n, err := strconv.Atoi(q); err == nil && n > 0 && n <= 50 {
			recent = n
		}
	}

	payload, err := h.financeService.Dashboard(userID, recent)
	if err != nil {
		log.Printf("dashboard: %v", err)
		utils.WriteErrorResponse(w, "Failed to load dashboard", http.StatusInternalServerError)
		return
	}

	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   payload,
	}, http.StatusOK)
}

func (h *Handler) handleTransactions(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	limit := 100
	offset := 0
	if q := r.URL.Query().Get("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}
	if q := r.URL.Query().Get("offset"); q != "" {
		if n, err := strconv.Atoi(q); err == nil && n >= 0 {
			offset = n
		}
	}

	payload, err := h.financeService.ListTransactions(userID, limit, offset)
	if err != nil {
		log.Printf("transactions: %v", err)
		utils.WriteErrorResponse(w, "Failed to load transactions", http.StatusInternalServerError)
		return
	}

	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   payload,
	}, http.StatusOK)
}

func (h *Handler) handleCreateAccount(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req models.CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	id, err := h.financeService.CreateAccount(userID, &req)
	if err != nil {
		if service.IsValidation(err) {
			utils.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("create account: %v", err)
		utils.WriteErrorResponse(w, "Failed to create account", http.StatusInternalServerError)
		return
	}
	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   map[string]string{"id": id.String()},
	}, http.StatusCreated)
}

func (h *Handler) handleAccounts(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	list, err := h.financeService.ListAccounts(userID)
	if err != nil {
		log.Printf("accounts: %v", err)
		utils.WriteErrorResponse(w, "Failed to load accounts", http.StatusInternalServerError)
		return
	}
	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   map[string]interface{}{"accounts": list},
	}, http.StatusOK)
}

func (h *Handler) handleCategories(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	tfilter := r.URL.Query().Get("type")
	list, err := h.financeService.ListCategories(userID, tfilter)
	if err != nil {
		log.Printf("categories: %v", err)
		utils.WriteErrorResponse(w, "Failed to load categories", http.StatusInternalServerError)
		return
	}
	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   map[string]interface{}{"categories": list},
	}, http.StatusOK)
}

func (h *Handler) handleBudgets(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	payload, err := h.financeService.ListBudgets(userID)
	if err != nil {
		log.Printf("budgets: %v", err)
		utils.WriteErrorResponse(w, "Failed to load budgets", http.StatusInternalServerError)
		return
	}
	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   payload,
	}, http.StatusOK)
}

func (h *Handler) handleCreateTransaction(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req models.CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	id, err := h.financeService.CreateTransaction(userID, &req)
	if err != nil {
		if service.IsValidation(err) {
			utils.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("create transaction: %v", err)
		utils.WriteErrorResponse(w, "Failed to create transaction", http.StatusInternalServerError)
		return
	}
	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   map[string]string{"id": id.String()},
	}, http.StatusCreated)
}

func (h *Handler) handleCreateBudget(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req models.CreateBudgetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	id, err := h.financeService.CreateBudget(userID, &req)
	if err != nil {
		if service.IsValidation(err) {
			utils.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("create budget: %v", err)
		utils.WriteErrorResponse(w, "Failed to create budget", http.StatusInternalServerError)
		return
	}
	utils.WriteJSONResponse(w, map[string]interface{}{
		"status": "success",
		"data":   map[string]string{"id": id.String()},
	}, http.StatusCreated)
}

func (h *Handler) handleAppendBudgetCommonPurchases(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := middleware.GetUserFromContext(r)
	if !ok {
		utils.WriteErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	rawID := chi.URLParam(r, "budgetID")
	budgetID, err := uuid.Parse(rawID)
	if err != nil {
		utils.WriteErrorResponse(w, "Invalid budget id", http.StatusBadRequest)
		return
	}
	var req models.AppendCommonPurchasesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	if err := h.financeService.AppendCommonPurchases(userID, budgetID, &req); err != nil {
		if service.IsValidation(err) {
			utils.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("append common purchases: %v", err)
		utils.WriteErrorResponse(w, "Failed to append common purchases", http.StatusInternalServerError)
		return
	}
	utils.WriteJSONResponse(w, map[string]interface{}{"status": "success"}, http.StatusOK)
}
