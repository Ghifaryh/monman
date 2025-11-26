package service

import (
	"errors"
	"fmt"

	"monman-backend/internal/models"
	"monman-backend/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UserService handles user business logic
type UserService struct {
	userRepo *repository.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// CreateUser creates a new user with encrypted password
func (s *UserService) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	// Check if username already exists
	existingUser, err := s.userRepo.GetByUsername(req.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing username: %w", err)
	}
	if existingUser != nil {
		return nil, errors.New("username already exists")
	}

	// Check if email already exists (if provided)
	if req.Email != "" {
		existingEmailUser, err := s.userRepo.GetByEmail(req.Email)
		if err != nil {
			return nil, fmt.Errorf("failed to check existing email: %w", err)
		}
		if existingEmailUser != nil {
			return nil, errors.New("email already exists")
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user model
	user := &models.User{
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		IsActive:     true,
	}

	// Set optional fields if provided
	if req.Email != "" {
		user.Email = &req.Email
	}
	if req.Phone != "" {
		user.Phone = &req.Phone
	}

	// Save user
	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// AuthenticateUser validates user credentials using username
func (s *UserService) AuthenticateUser(req *models.LoginRequest) (*models.User, error) {
	// Get user by username
	user, err := s.userRepo.GetByUsername(req.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id uuid.UUID) (*models.User, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	return user, nil
}

// UpdateUser updates user profile information
func (s *UserService) UpdateUser(userID uuid.UUID, updates *models.User) (*models.User, error) {
	// Get existing user first
	existingUser, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get existing user: %w", err)
	}
	if existingUser == nil {
		return nil, errors.New("user not found")
	}

	// Update other fields
	existingUser.Email = updates.Email
	existingUser.FirstName = updates.FirstName
	existingUser.LastName = updates.LastName
	existingUser.Phone = updates.Phone
	existingUser.DateOfBirth = updates.DateOfBirth
	existingUser.ProfilePictureURL = updates.ProfilePictureURL

	// Save updates
	if err := s.userRepo.Update(existingUser); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return existingUser, nil
}

// UpdatePassword updates user password
func (s *UserService) UpdatePassword(userID uuid.UUID, currentPassword, newPassword string) error {
	// Get user for password verification
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return errors.New("user not found")
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	// Update password
	if err := s.userRepo.UpdatePassword(userID, string(hashedPassword)); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// VerifyEmail marks user email as verified
func (s *UserService) VerifyEmail(userID uuid.UUID) error {
	return s.userRepo.VerifyEmail(userID)
}

// DeactivateUser soft-deletes a user account
func (s *UserService) DeactivateUser(userID uuid.UUID) error {
	return s.userRepo.Deactivate(userID)
}
