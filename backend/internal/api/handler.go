package api

import (
	"encoding/json"
	"log"
	"monman-backend/internal/middleware"
	"monman-backend/internal/models"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func NewHandler() http.Handler {
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

	// login endpoint - basic connection test
	r.Post("/api/login", handleLogin)

	return r
}

// handleLogin processes login requests and returns the email/password for testing
func handleLogin(w http.ResponseWriter, r *http.Request) {
	var loginReq models.LoginRequest

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		log.Printf("Error decoding login request: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid JSON format",
		})
		return
	}

	// Log received data for testing
	log.Printf("Login attempt - Username: %s, Password: %s", loginReq.Username, loginReq.Password)

	// Set response headers
	w.Header().Set("Content-Type", "application/json")

	// For now, just echo back the received data (minus password for security)
	response := map[string]interface{}{
		"message":  "Login request received successfully",
		"username": loginReq.Username,
		"status":   "success",
		"note":     "This is a basic connection test - authentication not implemented yet",
	}

	json.NewEncoder(w).Encode(response)
}
