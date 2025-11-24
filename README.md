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

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Go 1.x
- Bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd monman

# Start with Docker
docker-compose up
```

## Project Structure

```
monman/
├── backend/       # Go API server
├── frontend/      # React application
├── docker-compose.yml
└── README.md
```

## Development

Details coming soon as the project develops.

## License

Personal project for learning purposes.