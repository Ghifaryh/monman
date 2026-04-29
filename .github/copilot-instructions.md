# AI Coding Agent Instructions for MonMan

## Project Overview
MonMan is a personal money management application with a Go backend API and React TypeScript frontend, containerized with Docker and PostgreSQL. This is a learning project for exploring modern full-stack development patterns.

**Target Platform**: This web application is designed primarily for mobile usage, requiring mobile-first responsive design and touch-friendly interfaces.

**Current Status**: Complete authentication system implemented with JWT + bcrypt. Database fully set up with migrations and seed data. Frontend authentication flow working with protected routes. Ready for API integration phase to connect UI components with database endpoints.

**Learning Focus**: When implementing features, always provide explanations of architectural decisions, design patterns, and code structure. Assume familiarity with JavaScript and frameworks like Laravel, but explain Go-specific patterns, React ecosystem choices, and modern full-stack concepts.

## Architecture & Key Components

### Backend (Go + Chi Router)
- **Entry Point**: `backend/cmd/server/main.go` - Simple HTTP server with graceful shutdown
- **API Layer**: `backend/internal/api/handler.go` - Chi router with minimal endpoints (`/health`, `/`)
- **Models**: `backend/internal/models/user.go` - Contains `User` and `Transaction` structs with JSON/DB tags
- **Database**: PostgreSQL with UUID-based schema in `migrations/0001_init.sql` (accounts, categories, transactions)
- **Config**: Environment-based configuration in `backend/internal/config/config.go`

### Frontend (React + TypeScript + TanStack)
- **Router**: TanStack Router with nested route structure in `src/routes/index.tsx`
  - Root route for layout-less pages (login)
  - App layout route for authenticated pages with `App.tsx` wrapper
- **State Management**: TanStack Query for server state, custom `useLocalStorage` hook for client state
- **Styling**: TailwindCSS v4 with Vite plugin integration
- **API Client**: Centralized in `src/api/client.ts` with base fetch wrapper and auth utilities

## Development Workflow

### Local Development
```bash
# Full stack with Docker
docker-compose up

# Frontend only (requires backend running)
cd frontend && bun dev

# Backend only
cd backend && go run cmd/server/main.go
```

### Key Conventions

**Go Backend Patterns:**
- Clean architecture with `internal/` packages (api, models, repository, service)
- Chi router for HTTP routing
- Environment variables for configuration (DB_HOST, DB_PORT, etc.)
- JSON struct tags with DB field mapping: `json:"field_name" db:"field_name"`
- Password fields excluded from JSON: `json:"-"`

**React Frontend Patterns:**
- Feature-based organization: `src/features/{feature}/` with pages in `src/pages/`
- TanStack Router with nested layouts - distinguish between public (login) and authenticated routes
- API calls through centralized `apiRequest<T>()` wrapper
- Custom hooks for reusable stateful logic (see `useLocalStorage`, `useDocumentTitle`)
- Tailwind classes for styling, no CSS modules
- Mobile-first responsive design with touch-friendly UI components
- Indonesian Rupiah (IDR) currency formatting using Intl.NumberFormat with 'id-ID' locale

**Current Implementation Status:**
- **Authentication System**: Complete JWT + bcrypt implementation with user registration/login APIs
- **Database Setup**: PostgreSQL with 9 tables, UUID keys, sample data, and test users ready
- **Development Workflow**: Hybrid approach with Docker database + native backend/frontend development
- **Frontend Auth Flow**: Login/logout working, protected routes, user state management complete
- **Cross-Platform Ready**: Works identically on WSL, Arch, macOS, Windows with Docker port forwarding
- **API Testing**: User registration and login endpoints tested and functional

**Database Schema:**
- UUID primary keys with `gen_random_uuid()`
- BIGINT for money amounts in Indonesian Rupiah cents (avoid floating point precision issues)
- Foreign key constraints with CASCADE deletes
- Timestamps with `TIMESTAMP WITH TIME ZONE`
- Currency amounts stored as integers (e.g., Rp 10.000 stored as 1000000 cents)

## Project-Specific Guidelines

**Learning-First Implementation:**
- Always explain the "why" behind architectural choices and patterns
- Compare Go patterns to familiar concepts from Laravel/PHP when relevant
- Explain React ecosystem tools (TanStack Router vs React Router, TanStack Query vs traditional state management)
- Clarify modern full-stack patterns that differ from traditional MVC frameworks

**When adding new backend endpoints:**
- Add to `internal/api/handler.go` Chi router
- Follow the existing JSON response pattern: `map[string]string{"status": "ok"}`
- Use environment variables for configuration, update `docker-compose.yml` accordingly
- Explain Go's clean architecture approach vs Laravel's MVC structure

**When adding new React components:**
- Use hybrid architecture: pages in `src/pages/`, feature components in `src/features/`, shared components in `src/components/`
- Components that need layout use `appLayoutRoute` parent
- Full-page components (like login) use `rootRoute` parent
- Leverage TanStack Query for server state, `useLocalStorage` for persistent client state
- Design with mobile-first approach: touch targets ≥44px, thumb-friendly navigation, responsive breakpoints
- Explain modern React patterns (hooks, composition) and how they compare to traditional approaches

**Database changes:**
- Create new migration files following `000X_description.sql` pattern
- Use UUID for all primary keys
- Money amounts should be BIGINT (stored in cents)
- Always include `created_at` timestamps

**Container Development:**
- Backend builds multi-stage Docker with Go 1.21 Alpine
- Frontend not containerized yet - runs via Bun locally
- PostgreSQL 16 with persistent volume `db_data`
- API accessible on `localhost:8080`, DB on `localhost:5432`

## Development Notes & Common Commands

**Go Development:**
```bash
# Check running Go server port
lsof -i:8080

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Go dependency management (like npm install)
go mod tidy  # Run after adding imports to Go files
```

**Project Requirements & Features:**
- **Currency**: Use Indonesian Rupiah (IDR) for all monetary values and formatting
- **Income/Outcome System**: Use "Income" instead of "Salary" to encompass multiple income types (salary, freelance, etc.)
- **Spending Categories**: Support weekly, monthly, yearly spending patterns
- **Multiple Income Sources**: Handle different salary types and freelance income
- **Transaction Types**: Clear distinction between income and expenses
- **Number Formatting**: Use Indonesian locale for currency display (Rp 1.000.000,00)

**Advanced Features (Future Implementation):**
- **Income Categories**: Support multiple income types (Tukin, Gapok, Presence Money, freelance, etc.)
- **Budget Cards System**: Category-based budget tracking with remaining balance display
  - Example: Gas budget Rp 100.000/week → spend Rp 50.000 → show Rp 50.000 remaining
  - Categories like: Gas, Cooking/Shopping, Water, Utilities, etc.
  - Each budget card shows: allocated amount, spent amount, remaining balance, time period
- **Person Responsibility**: Assign budget categories to specific people (husband/wife)
  - Track who is responsible for which spending categories
  - Support split financial management between couples
  - Person-specific budget views and spending limits
- **Budget Period Management**: Weekly, monthly, yearly budget cycles with auto-reset

## Files to Reference for Patterns
- `backend/internal/models/user.go` - Model struct patterns
- `frontend/src/routes/index.tsx` - Router setup and nested layouts
- `frontend/src/api/client.ts` - API client patterns and error handling
- `frontend/src/layouts/App.tsx` - Mobile/desktop navigation, theme toggle, layout patterns
- `frontend/src/components/LoginPage.tsx` - Professional two-column design, responsive forms
- `frontend/src/features/transactions/components/TransactionList.tsx` - Mobile-first component design
- `frontend/src/hooks/useLocalStorage.ts` - Custom hook patterns for client state
- `migrations/0001_init.sql` - Database schema conventions
- `docker-compose.yml` - Container orchestration and environment setup

## Common UI Patterns to Follow
- **Mobile-first responsive**: Start with mobile layout, enhance for `lg:` breakpoint
- **Two-column desktop layouts**: Left branding/content, right form/action area
- **Touch targets**: Minimum 44px height for buttons and interactive elements
- **Theme consistency**: Use blue-to-indigo gradients for primary actions, gray scales for text
- **Loading states**: Include spinner animations and disabled states for async operations
- **Indonesian currency**: Format with `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`