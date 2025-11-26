package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"monman-backend/internal/config"
	"monman-backend/internal/db"
	"monman-backend/internal/models"
	"monman-backend/internal/repository"
	"monman-backend/internal/service"
)

func main() {
	// Command line flags
	username := flag.String("username", "", "Username for the new user")
	password := flag.String("password", "", "Password for the new user")
	firstName := flag.String("first-name", "", "First name of the user")
	lastName := flag.String("last-name", "", "Last name of the user")
	email := flag.String("email", "", "Email address (optional)")
	flag.Parse()

	// Validate required fields
	if *username == "" || *password == "" || *firstName == "" || *lastName == "" {
		fmt.Println("❌ Error: username, password, first-name, and last-name are required")
		fmt.Println("\n📝 Usage:")
		fmt.Println("go run cmd/create-user/main.go -username=john -password=secret123 -first-name=John -last-name=Doe -email=john@example.com")
		os.Exit(1)
	}

	// Load configuration
	cfg := config.Load()

	// Connect to database
	database, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize services
	userRepo := repository.NewUserRepository(database.DB)
	userService := service.NewUserService(userRepo)

	// Create user request
	createReq := &models.CreateUserRequest{
		Username:  *username,
		Password:  *password,
		FirstName: *firstName,
		LastName:  *lastName,
	}

	// Add email if provided
	if *email != "" {
		createReq.Email = *email
	}

	// Create user
	fmt.Printf("🔧 Creating user '%s'...\n", *username)
	user, err := userService.CreateUser(createReq)
	if err != nil {
		log.Fatalf("❌ Failed to create user: %v", err)
	}

	// Success message
	fmt.Printf("✅ User created successfully!\n")
	fmt.Printf("👤 ID: %s\n", user.ID)
	fmt.Printf("🏷️  Username: %s\n", user.Username)
	fmt.Printf("📧 Email: %v\n", user.Email)
	fmt.Printf("🔐 Password: [HASHED]\n")
	fmt.Printf("📅 Created: %s\n", user.CreatedAt.Format("2006-01-02 15:04:05"))
	fmt.Printf("\n💡 You can now login with username '%s' and your password\n", user.Username)
}
