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
- **Database:** SQLite (`backend/data/monman.db`; legacy Postgres SQL in `backend/migrations/postgres/`)
- **API:** RESTful JSON API with CORS support

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** TanStack Router with nested layouts
- **State Management:** TanStack Query + custom hooks
- **Styling:** TailwindCSS v4 with mobile-first design
- **Build Tool:** Vite with Bun runtime

### Infrastructure
- **Containerization:** Docker with multi-stage builds
- **Database:** SQLite file in a Docker volume (or local `data/` folder)
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

- **Go 1.21+** (backend), **Bun** (frontend)
- **Docker** optional (`docker compose` for containerized frontend+API)

### Quick Start

```bash
git clone https://github.com/Ghifaryh/monman.git
cd monman

# Creates backend/data/monman.db and applies SQLite migrations (with sample demo data).
./dev-setup.sh

cd backend && SQLITE_PATH=./data/monman.db JWT_SECRET=change-me go run ./cmd/server
# Second terminal — frontend:
cd frontend && bun dev

# Alternative: SQLite only (migration CLI)
# cd backend && go run ./cmd/migrate -sample && go run ./cmd/server

# Containers (API migrates SQLite in /data on startup)
docker compose up --build
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Database file**: `backend/data/monman.db`

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

### Database Management (SQLite)

The app uses a single SQLite file (default `backend/data/monman.db`; override with `SQLITE_PATH`).

```bash
# Re-apply migrations idempotently (optional)
cd backend && go run ./cmd/migrate -sample

# Inspect (if sqlite3 CLI is installed)
sqlite3 backend/data/monman.db '.tables'
sqlite3 backend/data/monman.db "SELECT username, email FROM users;"

# Nuclear reset
./reset-db.sh
```

## 🎯 Learning Objectives

### Go Backend Concepts
- **Clean Architecture**: Separation of concerns with internal packages
- **HTTP Routing**: Chi router with middleware patterns
- **Database Integration**: SQLite with `database/sql` and WAL mode
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
- [x] **Project Structure & Docker**: API + SQLite volume; optional legacy Postgres SQL under `migrations/postgres/`
- [x] **Database Schema**: 9 tables with UUID keys, Indonesian categories, sample data
- [x] **Authentication System**: JWT + bcrypt with user registration/login APIs
- [x] **Database Migrations**: Complete schema with seed data and test users
- [x] **Development Workflow**: SQLite file + native Go/Bun; `./dev-setup.sh` for migrations
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