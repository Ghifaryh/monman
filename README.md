# MonMan - Personal Money Management

A comprehensive personal finance management application designed for mobile-first usage, built as a learning project to explore modern full-stack development patterns.

## 🎯 Purpose

This project serves as a practical learning experience for:
- Modern Go backend development with clean architecture
- React TypeScript frontend with advanced routing and state management
- Mobile-first responsive design principles
- Full-stack API integration and authentication patterns
- Container orchestration with Docker

## 🚀 Tech Stack

### Backend
- **Language:** Go 1.21+ with Chi router
- **Architecture:** Clean architecture with internal packages
- **Database:** PostgreSQL 16 with UUID-based schema
- **API:** RESTful JSON API with CORS support

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** TanStack Router with nested layouts
- **State Management:** TanStack Query + custom hooks
- **Styling:** TailwindCSS v4 with mobile-first design
- **Build Tool:** Vite with Bun runtime

### Infrastructure
- **Containerization:** Docker with multi-stage builds
- **Database:** PostgreSQL with persistent volumes
- **Development:** Hot reload for both frontend and backend

## 🏗 Current Features

### User Interface
- **Professional Login**: Two-column desktop layout with gradient branding
- **Mobile-Optimized Navigation**: Bottom tab bar for thumb accessibility
- **Responsive Design**: Seamless mobile-to-desktop experience
- **Theme System**: Light/dark mode toggle (UI complete, CSS pending)
- **Dynamic Titles**: Context-aware page titles and navigation

### Financial Management
- **Budget Categories**: Indonesian-optimized templates (Belanja Bulanan, Bensin Motor, Listrik & Air)
- **Smart Budget Tracking**: Period-based allocations with spending progress
- **Transaction Management**: Item tracking with quantity, store location, and flexible categorization
- **Indonesian Shopping Patterns**: Preset purchases for common items (Indomie, gas by rupiah, etc.)
- **Currency Support**: Native Indonesian Rupiah formatting with proper locale
- **Budget Management**: Dual approach with inline editing and dedicated settings page

### Technical Architecture
- **Authentication Flow**: Route-level protection with automatic redirects
- **API Client**: Centralized request handling with error management
- **State Management**: TanStack Query for server state, hooks for client state
- **Feature Organization**: Scalable code structure with clean separation
- **Mobile-First**: Progressive enhancement from mobile to desktop

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Go 1.21+** (for backend development)
- **Bun** (for frontend development)
- **PostgreSQL client** (`psql`) for database operations

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Ghifaryh/monman.git
cd monman

# Option 1: Full stack with Docker (recommended)
docker-compose up

# Option 2: Development mode with database in Docker (hybrid approach)
# Terminal 1 - Start PostgreSQL database
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2 - Run database migrations
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0001_init.sql
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0002_seed_data.sql
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0003_sample_data.sql
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0004_seed_users.sql

# Terminal 3 - Backend
cd backend && go run cmd/server/main.go

# Terminal 4 - Frontend
cd frontend && bun dev

# Option 3: Automated setup (recommended for new environments)
./dev-setup.sh
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432 (monman_user/monman_pass/monman_db)

### Test Users (after running migrations)
- **testuser** / test@example.com (password: `password123`)
- **admin** / admin@monman.com (password: `admin123`)
- **demo** / demo@monman.com (password: `demo123`)
- **budi** / budi@example.com (password: `indonesia123`)

### API Registration Examples
```bash
# Register new users via API
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"husband","password":"x","first_name":"Ghifary","last_name":"The Husband"}'

curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"wifey","password":"x","first_name":"Inten","last_name":"Wifey"}'
```

## 📁 Project Structure

```
monman/
├── backend/
│   ├── cmd/server/           # Application entry point
│   ├── internal/
│   │   ├── api/             # HTTP handlers and routing
│   │   ├── models/          # Data structures
│   │   ├── repository/      # Data access layer
│   │   ├── service/         # Business logic
│   │   └── config/          # Configuration management
│   ├── migrations/          # Database migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route components
│   │   ├── features/        # Feature-based organization
│   │   ├── components/      # Shared UI components
│   │   ├── layouts/         # Layout components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── api/             # API client
│   │   └── routes/          # Route configuration
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── dev-setup.sh            # Automated development setup
├── reset-db.sh              # Database reset script
└── README.md
```

## 🛠 Development Workflow

### Backend Development (Go)
```bash
# Check running processes
lsof -i:8080

# Kill process if needed
lsof -ti:8080 | xargs kill -9

# Dependency management (after adding imports)
go mod tidy

# Run with hot reload (if using air)
air
```

### Frontend Development (React)
```bash
cd frontend

# Install dependencies
bun install

# Start development server
bun dev

# Type checking
bun run type-check

# Linting
bun run lint
```

### Database Management

#### Daily Development Workflow
```bash
# Start database (first time or after computer restart)
docker-compose -f docker-compose.dev.yml up -d

# Stop database at end of day (data preserved)
docker-compose -f docker-compose.dev.yml down

# Next day - start again (all data still there)
docker-compose -f docker-compose.dev.yml up -d
```

#### Database Operations
```bash
# Connect to PostgreSQL (Docker container)
docker exec -it monman-db-dev psql -U monman_user -d monman_db

# Connect via native psql client (if installed)
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db

# Check database tables
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -c "\dt"

# View sample data
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -c "SELECT username, email FROM users;"

# Run specific migration
PGPASSWORD=monman_pass psql -h localhost -p 5432 -U monman_user -d monman_db -f backend/migrations/0001_init.sql

# Stop database (keeps all data for next restart)
docker-compose -f docker-compose.dev.yml down     # Safe shutdown - data persists

# Reset database completely (for schema changes during development)
docker-compose -f docker-compose.dev.yml down -v  # Remove container + volume (deletes all data)
./dev-setup.sh                                    # Required: Start fresh with migrations

# Convenient reset script
./reset-db.sh                                     # Automated down -v + setup
```

## 🎯 Learning Objectives

### Go Backend Concepts
- **Clean Architecture**: Separation of concerns with internal packages
- **HTTP Routing**: Chi router with middleware patterns
- **Database Integration**: PostgreSQL with proper connection handling
- **JSON APIs**: RESTful endpoint design and error handling
- **Environment Configuration**: 12-factor app principles

### React Frontend Concepts
- **Modern Routing**: TanStack Router with nested layouts and guards
- **State Management**: Server state with TanStack Query, client state with hooks
- **TypeScript Integration**: Type-safe component and API patterns
- **Mobile-First Design**: Responsive layouts and touch interactions
- **Feature Architecture**: Scalable code organization patterns

## 🚧 Roadmap

### ✅ Completed
- [x] **Project Structure & Docker**: Complete containerization with PostgreSQL 16
- [x] **Database Schema**: 9 tables with UUID keys, Indonesian categories, sample data
- [x] **Authentication System**: JWT + bcrypt with user registration/login APIs
- [x] **Database Migrations**: Complete schema with seed data and test users
- [x] **Development Workflow**: Hybrid Docker database + native development setup
- [x] **Frontend Architecture**: TanStack Router with protected routes and auth flow
- [x] **Mobile-First UI**: Professional login, responsive navigation, theme system
- [x] **Indonesian Support**: Rupiah formatting, local categories, cultural patterns
- [x] **Budget Management UI**: Cards with inline editing, settings page, shopping patterns
- [x] **Cross-Platform Setup**: Works on WSL, Arch, macOS with identical configuration

### 🚧 In Progress
- [ ] **API Integration**: Connect frontend budget components to backend endpoints
- [ ] **Transaction CRUD**: Complete transaction management with categories and accounts
- [ ] **Dashboard Data**: Real-time balance cards and recent transactions from database

### 📋 Planned
- [ ] Transaction CRUD operations with categories
- [ ] Income/expense categorization and filtering
- [ ] Dashboard with financial overview
- [ ] Data visualization and spending reports
- [ ] Mobile PWA features (offline support, app install)
- [ ] Advanced filtering and search functionality

## 📱 Mobile-First Design

This application prioritizes mobile usage with:
- **Touch-friendly navigation** (≥44px tap targets)
- **Bottom tab navigation** for thumb accessibility
- **Responsive breakpoints** (mobile → tablet → desktop)
- **Progressive enhancement** from mobile to desktop features

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome! Please feel free to open issues for discussion.

## 📄 License

Personal project for learning purposes. Code available for educational reference.