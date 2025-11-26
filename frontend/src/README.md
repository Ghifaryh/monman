# MonMan Frontend Architecture

## Project Structure

```
src/
├── pages/              # Top-level page components (route handlers)
│   ├── DashboardPage.tsx
│   └── TransactionsPage.tsx
├── features/           # Feature-based organization
│   ├── dashboard/
│   │   ├── components/
│   │   └── index.ts
│   └── transactions/
│       ├── components/
│       └── index.ts
├── components/         # Shared/reusable components
├── layouts/           # Layout components
├── hooks/             # Shared custom hooks
├── api/               # API client and utilities
└── routes/            # TanStack Router configuration
```

## Architecture Patterns

### Pages vs Components vs Features

**Pages (`/pages`):**
- Thin route handlers that compose feature components
- Handle routing, layout, and high-level data coordination
- One page per route (DashboardPage, TransactionsPage, etc.)

**Features (`/features`):**
- Domain-driven organization (dashboard, transactions, accounts, etc.)
- Contains feature-specific components, hooks, API calls, and types
- Encapsulates business logic for a specific domain

**Components (`/components`):**
- Shared, reusable UI components (Button, Modal, etc.)
- No business logic, pure presentation components
- Can be used across multiple features

### Feature Structure

Each feature follows this pattern:
```
features/dashboard/
├── components/         # Feature-specific components
│   ├── BalanceCard.tsx
│   └── RecentTransactions.tsx
├── hooks/             # Feature-specific hooks (future)
├── api/               # Feature-specific API calls (future)
├── types.ts           # Feature-specific TypeScript types (future)
└── index.ts           # Central export point
```

### Import Patterns

**Good:**
```typescript
// Clean imports through feature exports
import { BalanceCard, RecentTransactions } from '../features/dashboard';
import { TransactionList, TransactionFilters } from '../features/transactions';
```

**Avoid:**
```typescript
// Deep imports make refactoring harder
import { BalanceCard } from '../features/dashboard/components/BalanceCard';
import { RecentTransactions } from '../features/dashboard/components/RecentTransactions';
```

## UI Design System

### Theme Implementation
- **Light/Dark Mode**: Complete CSS override system using `.dark` class
- **Color Consistency**: Blue-to-indigo gradients for primary actions
- **Eye-Friendly Dark Colors**: Softer red tones for better dark mode experience
- **Responsive Navigation**: Adaptive mobile tabs (2-5 items) with proper spacing

### Component Patterns
```typescript
// Professional Login Page
<LoginPage />              // Two-column desktop, single-column mobile

// App Shell Layout
<App>                      // Mobile header + bottom nav, desktop sidebar
  <DashboardPage />        // Feature composition
  <TransactionsPage />     // Feature composition
</App>

// Feature Components
<BalanceCard />            // Gradient background, Indonesian Rupiah formatting
<RecentTransactions />     // Mobile-optimized list with proper contrast
<TransactionList />        // Responsive filters and data display
```

## Learning Benefits

This architecture teaches modern React patterns used in production:

1. **Separation of Concerns**: Pages handle routing, features handle business logic
2. **Mobile-First Design**: Progressive enhancement from mobile to desktop
3. **Theme System**: Global CSS overrides vs component-level dark mode classes
4. **Scalability**: Easy to find and organize code as features grow
5. **Maintainability**: Clear boundaries between different parts of the application
6. **Team Collaboration**: Multiple developers can work on different features independently
7. **Testing**: Features can be tested in isolation

## Current Implementation Status

### ✅ Completed Architecture
- **Authentication Flow**: Complete login/logout with JWT tokens and protected routes
- **Feature-based organization** with dashboard, transactions, and budget management features
- **Mobile-first responsive design** with adaptive navigation and touch-friendly interfaces
- **Complete theme system** with light/dark mode coordination across all components
- **Indonesian-optimized UI components** with rupiah formatting and local shopping patterns
- **Budget management system** with dual approach (inline editing + settings page)
- **Layout patterns** including two-column login, app shell, and expandable cards
- **User state management** with localStorage persistence and automatic logout

### 🚧 Next Development Phase

1. **API Integration** (Current Focus)
   - Connect budget components to backend PostgreSQL database
   - Integrate transaction management with real data persistence
   - Implement dashboard with live account balances and recent transactions

2. **Enhanced Budget Features**
   - Item suggestion system based on purchase history
   - Shopping list integration with planned vs actual tracking
   - Budget period management with auto-reset functionality
   - Person responsibility assignment for couple financial management

3. **Advanced Patterns**
   - Custom hooks for budget state management
   - TypeScript interfaces for Indonesian shopping data models
   - Unit tests for budget components and currency formatting
   - Optimistic updates for real-time budget tracking

This structure mirrors patterns used in frameworks like Next.js and follows React community best practices for larger applications.