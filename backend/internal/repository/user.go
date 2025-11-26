package repository

import (
	"database/sql"
	"fmt"

	"monman-backend/internal/models"

	"github.com/google/uuid"
)

// UserRepository handles user data operations
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	query := `
		INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.Phone,
		user.IsActive,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, username, email, password_hash, first_name, last_name, phone,
		       date_of_birth, profile_picture_url, is_active, email_verified_at,
		       created_at, updated_at
		FROM users
		WHERE username = $1 AND is_active = true
	`

	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Phone,
		&user.DateOfBirth,
		&user.ProfilePictureURL,
		&user.IsActive,
		&user.EmailVerifiedAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}

	return user, nil
}

// GetByEmail retrieves a user by email (for validation purposes)
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, username, email, password_hash, first_name, last_name, phone,
		       date_of_birth, profile_picture_url, is_active, email_verified_at,
		       created_at, updated_at
		FROM users
		WHERE email = $1 AND is_active = true
	`

	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Phone,
		&user.DateOfBirth,
		&user.ProfilePictureURL,
		&user.IsActive,
		&user.EmailVerifiedAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id uuid.UUID) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, username, email, password_hash, first_name, last_name, phone,
		       date_of_birth, profile_picture_url, is_active, email_verified_at,
		       created_at, updated_at
		FROM users
		WHERE id = $1 AND is_active = true
	`

	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Phone,
		&user.DateOfBirth,
		&user.ProfilePictureURL,
		&user.IsActive,
		&user.EmailVerifiedAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return user, nil
} // Update updates user information
func (r *UserRepository) Update(user *models.User) error {
	query := `
		UPDATE users
		SET username = $2, email = $3, first_name = $4, last_name = $5, phone = $6,
		    date_of_birth = $7, profile_picture_url = $8, updated_at = NOW()
		WHERE id = $1 AND is_active = true
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		query,
		user.ID,
		user.Email,
		user.FirstName,
		user.LastName,
		user.Phone,
		user.DateOfBirth,
		user.ProfilePictureURL,
	).Scan(&user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
} // UpdatePassword updates user password
func (r *UserRepository) UpdatePassword(userID uuid.UUID, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $2, updated_at = NOW()
		WHERE id = $1 AND is_active = true
	`

	_, err := r.db.Exec(query, userID, passwordHash)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// VerifyEmail marks user email as verified
func (r *UserRepository) VerifyEmail(userID uuid.UUID) error {
	query := `
		UPDATE users
		SET email_verified_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND is_active = true
	`

	_, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to verify email: %w", err)
	}

	return nil
}

// Deactivate soft-deletes a user by setting is_active to false
func (r *UserRepository) Deactivate(userID uuid.UUID) error {
	query := `
		UPDATE users
		SET is_active = false, updated_at = NOW()
		WHERE id = $1
	`

	_, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to deactivate user: %w", err)
	}

	return nil
}
