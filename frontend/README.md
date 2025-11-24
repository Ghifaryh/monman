# MonMan Frontend

React TypeScript frontend for the MonMan personal finance management application, built with mobile-first responsive design principles.

## 🛠 Tech Stack

- **React 18** with TypeScript for type-safe development
- **TanStack Router** for advanced client-side routing with nested layouts
- **TanStack Query** for server state management and caching
- **TailwindCSS v4** with mobile-first responsive utilities
- **Vite** with fast HMR and optimized builds
- **Bun** runtime for improved performance

## 🏗 Architecture

### Mobile-First Design
- **Responsive breakpoints**: Mobile → tablet → desktop progression
- **Touch-friendly UI**: Minimum 44px tap targets, thumb-accessible navigation
- **Bottom tab navigation** for mobile, sidebar for desktop
- **Progressive enhancement** from mobile to desktop features

### Route Structure
```
/                    # Login page (public, no layout)
/app                 # Protected route with App layout
├── /dashboard       # Main dashboard
├── /transactions    # Transaction management
└── /profile         # User profile
```

### State Management
- **Server State**: TanStack Query for API data, caching, and synchronization
- **Client State**: Custom hooks (`useLocalStorage`) for persistent UI state
- **Theme Management**: React useState with localStorage persistence

## 🚀 Development

### Getting Started
```bash
# Install dependencies
bun install

# Start development server (requires backend running)
bun dev

# Type checking
bun run type-check

# Build for production
bun run build
```

### Key Features
- **Authentication Flow**: Route-protected pages with automatic redirects
- **Dynamic Titles**: Context-aware document titles using `useDocumentTitle`
- **Currency Formatting**: Indonesian Rupiah (IDR) with proper locale formatting
- **Error Handling**: Centralized API error management with user feedback
- **Theme System**: Light/dark mode toggle (UI implemented, CSS pending)

### Code Organization
```
src/
├── api/              # API client and utilities
├── components/       # Shared UI components
├── features/         # Feature-specific components
├── hooks/           # Custom React hooks
├── layouts/         # Layout components (App.tsx)
├── lib/             # Utility functions
├── pages/           # Route components
├── routes/          # TanStack Router configuration
└── styles/          # Global CSS and Tailwind
```

### Mobile-First Guidelines
- Start with mobile layout, enhance for larger screens
- Use `lg:` prefixes for desktop-specific styles
- Test touch interactions and thumb accessibility
- Ensure minimum 44px tap targets for buttons
- Consider network constraints and loading states
```
