# TaskForge Architecture

## Overview

TaskForge is a modern full-stack project management platform built using a modular architecture. The system follows a clear separation of concerns between the frontend, backend, and database layers, making it scalable, maintainable, and easy to extend.

---

# High-Level Architecture

```text
                   ┌──────────────────────┐
                   │      Next.js 16      │
                   │   React + TypeScript │
                   └──────────┬───────────┘
                              │
                     REST API (HTTPS)
                              │
                   ┌──────────▼───────────┐
                   │      NestJS API      │
                   │ Authentication       │
                   │ Authorization        │
                   │ Business Logic       │
                   └──────────┬───────────┘
                              │
                        Prisma ORM
                              │
                   ┌──────────▼───────────┐
                   │     PostgreSQL       │
                   │     Relational DB    │
                   └──────────────────────┘
```

---

# Backend Architecture

The backend is built using **NestJS** and follows a feature-based modular architecture.

Each feature owns its:

- Controller
- Service
- DTOs
- Business logic

Example:

```text
src/
 ├── auth/
 ├── users/
 ├── projects/
 ├── tasks/
 ├── comments/
 ├── notifications/
 ├── dashboard/
 ├── activities/
 └── prisma/
```

This architecture provides:

- High cohesion
- Low coupling
- Better scalability
- Easier testing

---

# Frontend Architecture

The frontend is built using **Next.js App Router**.

The project follows a modular component structure.

```text
src/
 ├── app/
 ├── components/
 ├── services/
 ├── hooks/
 ├── lib/
 ├── providers/
 └── types/
```

Business logic is separated from presentation.

API communication is centralized inside the `services` layer.

React Query manages server state, caching, and synchronization.

---

# Authentication Flow

1. User submits credentials.
2. Backend validates credentials.
3. JWT Access Token is generated.
4. Token is stored in localStorage.
5. Axios interceptor automatically attaches the Bearer token.
6. NestJS JWT Guard validates every protected request.

---

# Authorization

Role-Based Access Control (RBAC) is implemented.

Available roles:

- ADMIN
- PROJECT_MANAGER
- TEAM_MEMBER

Authorization is enforced using:

- JWT Guard
- Roles Guard
- Custom Roles Decorator

---

# Database

The application uses PostgreSQL with Prisma ORM.

Primary entities include:

- Users
- Roles
- Projects
- Project Members
- Tasks
- Comments
- Notifications
- Activity Logs
- Refresh Tokens

Relationships are normalized to reduce redundancy while supporting efficient queries.

---

# API Layer

The frontend communicates exclusively through REST APIs.

Responses follow a standardized structure:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "timestamp": "...",
  "data": {}
}
```

This ensures consistency across all endpoints.

---

# Security

Security features include:

- JWT Authentication
- Password hashing using bcrypt
- DTO validation
- Global Validation Pipe
- Helmet
- Compression
- Role-based authorization
- Centralized exception handling

---

# Deployment

The application is designed to run using Docker.

Each service can be containerized independently.

CI is handled using GitHub Actions to automatically build and test both backend and frontend on every push.

---

# Design Principles

The project was designed with the following goals:

- Maintainability
- Scalability
- Security
- Separation of concerns
- Developer experience
- Production readiness