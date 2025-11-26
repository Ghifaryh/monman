package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWTClaims represents the claims stored in JWT token
type JWTClaims struct {
	UserID   uuid.UUID `json:"user_id"`
	Username string    `json:"username"`
	IsActive bool      `json:"is_active"`
	jwt.RegisteredClaims
}

// JWTUtil handles JWT token operations
type JWTUtil struct {
	secretKey []byte
	ttlHours  int
}

// NewJWTUtil creates a new JWT utility instance
func NewJWTUtil(secretKey string, ttlHours int) *JWTUtil {
	return &JWTUtil{
		secretKey: []byte(secretKey),
		ttlHours:  ttlHours,
	}
}

// GenerateToken creates a new JWT token for a user
func (j *JWTUtil) GenerateToken(userID uuid.UUID, username string, isActive bool) (string, error) {
	now := time.Now()
	expiry := now.Add(time.Duration(j.ttlHours) * time.Hour)

	claims := JWTClaims{
		UserID:   userID,
		Username: username,
		IsActive: isActive,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiry),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "monman-api",
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secretKey)
}

// ValidateToken validates a JWT token and returns the claims
func (j *JWTUtil) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return j.secretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	if !token.Valid {
		return nil, errors.New("token is not valid")
	}

	// Check if user is active
	if !claims.IsActive {
		return nil, errors.New("user account is inactive")
	}

	return claims, nil
}

// RefreshToken generates a new token if the current one is still valid
func (j *JWTUtil) RefreshToken(tokenString string) (string, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	// Generate new token with same user data
	return j.GenerateToken(claims.UserID, claims.Username, claims.IsActive)
}
