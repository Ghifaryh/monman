package repository

import (
	"database/sql"
	"fmt"
	"time"

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

func parseSQLiteTime(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, fmt.Errorf("empty time")
	}
	layouts := []string{
		time.RFC3339Nano,
		time.RFC3339,
		"2006-01-02 15:04:05",
		"2006-01-02 15:04:05-07:00",
		"2006-01-02",
	}
	var last error
	for _, l := range layouts {
		t, err := time.Parse(l, s)
		if err == nil {
			return t, nil
		}
		last = err
	}
	return time.Time{}, last
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	user.ID = uuid.New()
	var emailAny any
	if user.Email != nil {
		emailAny = *user.Email
	}
	var phoneAny any
	if user.Phone != nil {
		phoneAny = *user.Phone
	}

	query := `
		INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		RETURNING created_at, updated_at
	`

	var createdAtStr, updatedAtStr string
	err := r.db.QueryRow(
		query,
		user.ID.String(),
		user.Username,
		emailAny,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		phoneAny,
		sqlBool(user.IsActive),
	).Scan(&createdAtStr, &updatedAtStr)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	user.CreatedAt, err = parseSQLiteTime(createdAtStr)
	if err != nil {
		return fmt.Errorf("parse created_at: %w", err)
	}
	user.UpdatedAt, err = parseSQLiteTime(updatedAtStr)
	if err != nil {
		return fmt.Errorf("parse updated_at: %w", err)
	}

	return nil
}

func sqlBool(b bool) int {
	if b {
		return 1
	}
	return 0
}

func scanUser(row *sql.Row) (*models.User, error) {
	var (
		idStr          string
		username       string
		emailNS        sql.NullString
		passwordHash   string
		firstName      string
		lastName       string
		phoneNS        sql.NullString
		dobNS          sql.NullString
		picNS          sql.NullString
		isActive       int
		emailVerifiedN sql.NullString
		createdAtStr   string
		updatedAtStr   string
	)

	err := row.Scan(
		&idStr,
		&username,
		&emailNS,
		&passwordHash,
		&firstName,
		&lastName,
		&phoneNS,
		&dobNS,
		&picNS,
		&isActive,
		&emailVerifiedN,
		&createdAtStr,
		&updatedAtStr,
	)
	if err != nil {
		return nil, err
	}

	uid, err := uuid.Parse(idStr)
	if err != nil {
		return nil, fmt.Errorf("parse user id: %w", err)
	}
	user := &models.User{
		ID:           uid,
		Username:     username,
		PasswordHash: passwordHash,
		FirstName:    firstName,
		LastName:     lastName,
		IsActive:     isActive == 1,
	}
	if emailNS.Valid {
		s := emailNS.String
		user.Email = &s
	}
	if phoneNS.Valid {
		s := phoneNS.String
		user.Phone = &s
	}
	if dobNS.Valid && dobNS.String != "" {
		t, err := parseSQLiteTime(dobNS.String)
		if err == nil {
			user.DateOfBirth = &t
		}
	}
	if picNS.Valid {
		s := picNS.String
		user.ProfilePictureURL = &s
	}
	if emailVerifiedN.Valid && emailVerifiedN.String != "" {
		t, err := parseSQLiteTime(emailVerifiedN.String)
		if err == nil {
			user.EmailVerifiedAt = &t
		}
	}
	user.CreatedAt, err = parseSQLiteTime(createdAtStr)
	if err != nil {
		return nil, fmt.Errorf("created_at: %w", err)
	}
	user.UpdatedAt, err = parseSQLiteTime(updatedAtStr)
	if err != nil {
		return nil, fmt.Errorf("updated_at: %w", err)
	}
	return user, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	query := `
		SELECT id, username, email, password_hash, first_name, last_name, phone,
		       date_of_birth, profile_picture_url, is_active, email_verified_at,
		       created_at, updated_at
		FROM users
		WHERE username = ? AND is_active = 1
	`

	row := r.db.QueryRow(query, username)
	user, err := scanUser(row)
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
	query := `
		SELECT id, username, email, password_hash, first_name, last_name, phone,
		       date_of_birth, profile_picture_url, is_active, email_verified_at,
		       created_at, updated_at
		FROM users
		WHERE email = ? AND is_active = 1
	`

	row := r.db.QueryRow(query, email)
	user, err := scanUser(row)
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
	query := `
		SELECT id, username, email, password_hash, first_name, last_name, phone,
		       date_of_birth, profile_picture_url, is_active, email_verified_at,
		       created_at, updated_at
		FROM users
		WHERE id = ? AND is_active = 1
	`

	row := r.db.QueryRow(query, id.String())
	user, err := scanUser(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return user, nil
}

// Update updates user information
func (r *UserRepository) Update(user *models.User) error {
	var dobAny any
	if user.DateOfBirth != nil {
		dobAny = user.DateOfBirth.Format("2006-01-02")
	}
	var emailAny any
	if user.Email != nil {
		emailAny = *user.Email
	}
	var phoneAny any
	if user.Phone != nil {
		phoneAny = *user.Phone
	}
	var picAny any
	if user.ProfilePictureURL != nil {
		picAny = *user.ProfilePictureURL
	}

	query := `
		UPDATE users
		SET email = ?, first_name = ?, last_name = ?, phone = ?,
		    date_of_birth = ?, profile_picture_url = ?, updated_at = datetime('now')
		WHERE id = ? AND is_active = 1
		RETURNING updated_at
	`

	var updatedAtStr string
	err := r.db.QueryRow(
		query,
		emailAny,
		user.FirstName,
		user.LastName,
		phoneAny,
		dobAny,
		picAny,
		user.ID.String(),
	).Scan(&updatedAtStr)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	user.UpdatedAt, err = parseSQLiteTime(updatedAtStr)
	return err
}

// UpdatePassword updates user password
func (r *UserRepository) UpdatePassword(userID uuid.UUID, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = ?, updated_at = datetime('now')
		WHERE id = ? AND is_active = 1
	`

	_, err := r.db.Exec(query, passwordHash, userID.String())
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// VerifyEmail marks user email as verified
func (r *UserRepository) VerifyEmail(userID uuid.UUID) error {
	query := `
		UPDATE users
		SET email_verified_at = datetime('now'), updated_at = datetime('now')
		WHERE id = ? AND is_active = 1
	`

	_, err := r.db.Exec(query, userID.String())
	if err != nil {
		return fmt.Errorf("failed to verify email: %w", err)
	}

	return nil
}

// Deactivate soft-deletes a user by setting is_active to false
func (r *UserRepository) Deactivate(userID uuid.UUID) error {
	query := `
		UPDATE users
		SET is_active = 0, updated_at = datetime('now')
		WHERE id = ?
	`

	_, err := r.db.Exec(query, userID.String())
	if err != nil {
		return fmt.Errorf("failed to deactivate user: %w", err)
	}

	return nil
}
