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

	"github.com/go-chi/chi/v5"
)

// Handler holds dependencies for API handlers
type Handler struct {
	userService *service.UserService
	jwtUtil     *utils.JWTUtil
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
	userService := service.NewUserService(userRepo)

	// Initialize JWT utility
	jwtUtil := utils.NewJWTUtil(cfg.JWT.Secret, cfg.JWT.TTL)

	// Create handler instance
	h := &Handler{
		userService: userService,
		jwtUtil:     jwtUtil,
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
