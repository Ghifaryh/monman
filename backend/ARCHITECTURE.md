# 🏗️ MonMan Backend Architecture & File Flow

## 📁 Directory Structure Overview
```
backend/
├── cmd/server/main.go      # 🚀 Application entry point
├── internal/               # 🔒 Private application code
│   ├── api/handler.go      # 🌐 HTTP routes and handlers
│   ├── service/user.go     # 💼 Business logic layer
│   ├── repository/user.go  # 🗄️ Database operations
│   ├── models/models.go    # 📋 Data structures
│   ├── config/config.go    # ⚙️ Configuration management
│   ├── db/connection.go    # 🔌 Database connection
│   ├── middleware/cors.go  # 🛡️ Request middleware
│   └── utils/response.go   # 🔧 Helper utilities
├── migrations/             # 📊 Database schema files
└── scripts/               # 🛠️ Utility scripts
```

## 🔄 Request Flow Diagram
```
🌐 HTTP Request → Handler → Service → Repository → 🗄️ Database
     ↓              ↓         ↓          ↓
  [main.go]    [handler.go] [service] [repository]
     ↓              ↓         ↓          ↓
 [Chi Router]   [JSON Parse] [Business] [SQL Query]
     ↓              ↓         ↓          ↓
  [CORS]       [Validation] [Logic]   [Database]
```

## 📋 File Connections & Flow

### 1. 🚀 Entry Point: `cmd/server/main.go`
```go
func main() {
    // 1. Sets up HTTP server on port 8080
    h := api.NewHandler()  // ← Creates router with all routes

    // 2. Starts server with graceful shutdown
    srv := &http.Server{
        Addr:    ":8080",
        Handler: h,  // ← Chi router from handler.go
    }
}
```
**Purpose**: Application bootstrap, server lifecycle management

**Key Features:**
- Environment variable configuration (API_PORT)
- Graceful shutdown with context timeout
- Signal handling for clean server termination

### 2. 🌐 HTTP Layer: `internal/api/handler.go`
```go
func NewHandler() http.Handler {
    r := chi.NewRouter()

    // 1. Add middleware (CORS for frontend)
    r.Use(middleware.CORS())  // ← From middleware/cors.go

    // 2. Define routes
    r.Get("/health", healthCheck)
    r.Post("/api/login", handleLogin)  // ← Handles login requests

    return r
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
    var loginReq models.LoginRequest  // ← From models/models.go
    // Parse JSON, validate, return response
}
```
**Purpose**: Route definitions, HTTP request/response handling, JSON parsing

**Key Responsibilities:**
- Chi router setup and middleware registration
- HTTP request parsing and validation
- JSON encoding/decoding
- HTTP status code management
- Error response formatting

### 3. 💼 Business Logic: `internal/service/user.go`
```go
type UserService struct {
    userRepo *repository.UserRepository  // ← Dependency injection
}

func (s *UserService) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
    // 1. Business rules validation
    existingUser, err := s.userRepo.GetByUsername(req.Username)  // ← Call repository

    // 2. Password encryption
    hashedPassword, err := bcrypt.GenerateFromPassword(...)

    // 3. Create user via repository
    return s.userRepo.Create(user)  // ← Database operation
}
```
**Purpose**: Business rules, validation, password encryption, orchestration

**Key Features:**
- Username-based authentication system
- Password hashing with bcrypt
- Business rule validation
- User creation and authentication logic
- Error handling with wrapped errors

### 4. 🗄️ Data Layer: `internal/repository/user.go`
```go
type UserRepository struct {
    db *sql.DB  // ← Database connection
}

func (r *UserRepository) Create(user *models.User) error {
    query := `
        INSERT INTO users (username, email, password_hash, ...)
        VALUES ($1, $2, $3, ...)
        RETURNING id, created_at, updated_at
    `

    err := r.db.QueryRow(query, user.Username, user.Email, ...).Scan(...)  // ← SQL execution
    return err
}
```
**Purpose**: SQL queries, database operations, data persistence

**Key Operations:**
- User CRUD operations
- SQL query execution with proper parameterization
- Database transaction handling
- UUID generation and handling
- Timestamp management

### 5. 📋 Data Models: `internal/models/models.go`
```go
type User struct {
    ID           uuid.UUID `json:"id" db:"id"`
    Username     string    `json:"username" db:"username"`
    PasswordHash string    `json:"-" db:"password_hash"`  // ← Never in JSON
    // ... other fields
}

type LoginRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}
```
**Purpose**: Data structures, JSON/database mapping, type definitions

**Key Features:**
- Complete user model with Indonesian context
- JSON and database struct tags
- Password security (excluded from JSON)
- UUID-based primary keys
- Optional fields with pointers
- Request/response DTOs

### 6. 🔌 Database: `internal/db/connection.go`
```go
func Connect(cfg *config.Config) (*DB, error) {
    dsn := fmt.Sprintf(
        "host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
        cfg.Database.Host, cfg.Database.Port, ...  // ← From config
    )

    db, err := sql.Open("postgres", dsn)  // ← PostgreSQL connection
    return &DB{db}, err
}
```
**Purpose**: Database connection management, connection pooling

**Features:**
- PostgreSQL connection with proper DSN formatting
- Connection health checking
- Database wrapper struct
- Configuration-driven connection parameters

### 7. ⚙️ Configuration: `internal/config/config.go`
```go
type Config struct {
    Server   ServerConfig   // Port, environment
    Database DatabaseConfig // Host, port, credentials
    JWT      JWTConfig     // Secret keys
}

func Load() (*Config, error) {
    // Load from environment variables
    return &Config{...}, nil
}
```
**Purpose**: Environment configuration, settings management

**Configuration Areas:**
- Server settings (port, environment)
- Database connection parameters
- JWT configuration for authentication
- Environment variable loading

### 8. 🛡️ Middleware: `internal/middleware/cors.go`
```go
func CORS() func(next http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Set CORS headers for frontend communication
            w.Header().Set("Access-Control-Allow-Origin", "*")
            // ... other CORS headers
            next.ServeHTTP(w, r)
        })
    }
}
```
**Purpose**: Cross-origin request handling for frontend integration

### 9. 🔧 Utilities: `internal/utils/response.go`
```go
func JSONResponse(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}
```
**Purpose**: Common helper functions and utilities

## 🔗 Dependency Flow & Connections

### Layer Dependencies (Top to Bottom):
```
main.go
   ↓ imports
handler.go ← middleware.CORS()
   ↓ uses     ← models.LoginRequest
service.go
   ↓ uses
repository.go
   ↓ uses
db.connection.go
   ↓ uses
config.go
```

### Key Design Patterns:

#### 1. Clean Architecture
- **Handler**: HTTP concerns only (parsing, routing, responses)
- **Service**: Business logic only (validation, encryption, orchestration)
- **Repository**: Database operations only (SQL, transactions)
- **Models**: Pure data structures (no logic)

#### 2. Dependency Injection
```go
// Service depends on Repository (injected)
userRepo := repository.NewUserRepository(db)
userService := service.NewUserService(userRepo)
```

#### 3. Interface Segregation
Each layer has specific responsibilities:
- **API layer**: JSON, HTTP status codes, request parsing
- **Service layer**: Business validation, password encryption
- **Repository layer**: SQL queries, database transactions

## 🚀 Example Request Journey

**Login Request: `POST /api/login`**
```
1. 🌐 Chi Router (handler.go) receives request
2. 🛡️ CORS middleware processes headers
3. 📋 JSON decoded into LoginRequest (models.go)
4. 💼 Service validates credentials (service/user.go)
5. 🗄️ Repository queries database (repository/user.go)
6. 🔌 SQL executed via connection (db/connection.go)
7. 📊 Database returns user data
8. 🔒 Password verified with bcrypt
9. 🌐 JSON response sent back to frontend
```

## 💡 Key Go Patterns Used

### Short Variable Declaration (`:=`)
The `:=` operator is Go's "short variable declaration" - it declares and initializes variables in one step with automatic type inference:

```go
// Throughout the codebase:
user, err := s.userRepo.GetByUsername(req.Username)  // Declare + assign
hashedPassword, err := bcrypt.GenerateFromPassword(...)
db, err := sql.Open("postgres", dsn)

// Instead of verbose:
var user *models.User
var err error
user, err = s.userRepo.GetByUsername(req.Username)
```

**Rules for `:=`:**
- Only works inside functions (not package level)
- At least one variable must be new
- Go infers types automatically
- Very common in error handling patterns

### Error Handling Pattern
```go
if err != nil {
    return nil, fmt.Errorf("failed to create user: %w", err)
}
```

### Struct Tags for JSON/DB Mapping
```go
type User struct {
    ID       uuid.UUID `json:"id" db:"id"`           // Maps to both
    Password string    `json:"-" db:"password_hash"` // DB only, not JSON
}
```

## 📊 Database Integration

### Current Schema (from migrations/0001_init.sql):
- **PostgreSQL 16** with UUID-based architecture
- **9 main tables**: users, accounts, categories, transactions, etc.
- **Indonesian financial context**: Rupiah amounts, local banking
- **Username-based authentication** (email optional)

### Migration System:
- `0001_init.sql`: Core schema with all tables
- `0002_seed_data.sql`: Basic category and account setup
- `0003_sample_data.sql`: Test data for development

## 🔐 Authentication Flow

### Current Implementation:
1. **Username + Password** login (not email-based)
2. **bcrypt** password hashing
3. **UUID** user identification
4. **Database validation** against users table

### Planned Enhancements:
- JWT token generation and validation
- Session management
- Password reset functionality
- Email verification (optional)

## 🛠️ Development Workflow

### Running the Backend:
```bash
# Option 1: Direct Go execution
cd backend && go run cmd/server/main.go

# Option 2: With Docker
docker-compose up backend

# Option 3: With air for hot reloading
air
```

### Database Operations:
```bash
# Run migrations
./scripts/migrate.sh

# Verify authentication
./scripts/verify_username_auth.sh

# Check database
./scripts/verify.sh
```

### Adding New Features:

1. **Add Model** in `models/models.go`
2. **Create Repository** methods in `repository/`
3. **Implement Service** logic in `service/`
4. **Add Handler** routes in `api/handler.go`
5. **Update Database** with new migrations

## 🎯 Current Status

### ✅ Completed:
- [x] Clean architecture structure
- [x] PostgreSQL integration with full schema
- [x] Username-based authentication system
- [x] CORS middleware for frontend integration
- [x] Basic user management (create, login, validate)
- [x] Proper error handling and logging
- [x] Docker containerization

### 🚧 In Progress:
- [ ] JWT token implementation
- [ ] Budget management API endpoints
- [ ] Transaction CRUD operations
- [ ] Session management

### 📋 Planned:
- [ ] Advanced authentication (password reset, email verification)
- [ ] Budget category API integration
- [ ] Transaction categorization and filtering
- [ ] Data visualization endpoints
- [ ] API documentation with Swagger

## 🏆 Learning Benefits

This architecture teaches modern Go backend patterns used in production:

1. **Clean Architecture**: Clear separation of concerns
2. **Dependency Injection**: Testable and maintainable code
3. **Error Handling**: Proper Go error patterns with wrapping
4. **Database Integration**: PostgreSQL with proper connection management
5. **HTTP API Design**: RESTful endpoints with proper status codes
6. **Security**: Password hashing and input validation
7. **Configuration Management**: Environment-driven settings
8. **Container Architecture**: Docker-ready application structure

This structure mirrors patterns used in frameworks and follows Go community best practices for production applications.