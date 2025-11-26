package middleware

import (
	"context"
	"monman-backend/internal/config"
	"monman-backend/internal/utils"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

// JWTContextKey is the key used to store JWT claims in request context
type JWTContextKey string

const (
	JWTClaimsKey JWTContextKey = "jwt_claims"
)

// JWTAuth creates a JWT authentication middleware
func JWTAuth(cfg *config.Config) func(http.Handler) http.Handler {
	jwtUtil := utils.NewJWTUtil(cfg.JWT.Secret, cfg.JWT.TTL)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Check Bearer prefix
			parts := strings.Fields(authHeader)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]

			// Validate token
			claims, err := jwtUtil.ValidateToken(tokenString)
			if err != nil {
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			// Add claims to request context
			ctx := context.WithValue(r.Context(), JWTClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext extracts user information from JWT claims in context
func GetUserFromContext(r *http.Request) (userID uuid.UUID, username string, ok bool) {
	claims, ok := r.Context().Value(JWTClaimsKey).(*utils.JWTClaims)
	if !ok {
		return uuid.Nil, "", false
	}
	return claims.UserID, claims.Username, true
}

// GetClaimsFromContext extracts JWT claims from request context
func GetClaimsFromContext(r *http.Request) (*utils.JWTClaims, bool) {
	claims, ok := r.Context().Value(JWTClaimsKey).(*utils.JWTClaims)
	return claims, ok
}
