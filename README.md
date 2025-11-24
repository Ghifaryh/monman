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

## 🏗 Architecture Features

### Financial Management
- **Income Tracking**: Multiple income types (salary, freelance, investments)
- **Expense Categories**: Weekly, monthly, and yearly spending patterns
- **Transaction Management**: Comprehensive income/outcome tracking
- **Mobile-First UX**: Touch-friendly interface optimized for mobile usage

### Technical Highlights
- **Authentication System**: Route-level protection with redirect handling
- **Dynamic Page Titles**: Context-aware document titles
- **Responsive Navigation**: Mobile bottom tabs + desktop sidebar
- **Feature-Based Organization**: Scalable code structure with clean separation

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Go 1.21+** (for backend development)
- **Bun** (for frontend development)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Ghifaryh/monman.git
cd monman

# Option 1: Full stack with Docker (recommended)
docker-compose up

# Option 2: Development mode
# Terminal 1 - Backend
cd backend && go run cmd/server/main.go

# Terminal 2 - Frontend
cd frontend && bun dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432 (postgres/postgres)

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
├── migrations/              # Database schema
├── docker-compose.yml
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

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it monman_db_1 psql -U postgres -d monman

# Run migrations (when implemented)
# go run migrations/migrate.go
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

- [x] Project structure and Docker setup
- [x] Basic Go API with health endpoint
- [x] React frontend with TanStack Router
- [x] Mobile-first responsive layout
- [x] Authentication routing and page titles
- [ ] Database models and migrations
- [ ] User authentication and sessions
- [ ] Transaction CRUD operations
- [ ] Income/expense categorization
- [ ] Mobile PWA features
- [ ] Data visualization and reports

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