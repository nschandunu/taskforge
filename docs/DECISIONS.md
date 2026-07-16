# Architectural Decisions

## Overview

This document explains the key architectural and technical decisions made during the development of TaskForge.

Rather than focusing only on implementation details, it explains *why* particular technologies and design patterns were selected.

---

# 1. Why NestJS?

### Decision

NestJS was selected as the backend framework.

### Why

NestJS provides an opinionated architecture built on top of Express that encourages scalable and maintainable applications.

Its module system naturally supports feature-based organization while providing first-class support for dependency injection, decorators, validation, authentication, and testing.

### Benefits

- Modular architecture
- Built-in Dependency Injection
- Excellent TypeScript support
- Easy testing
- Enterprise-ready structure

---

# 2. Why PostgreSQL?

### Decision

PostgreSQL was selected as the primary database.

### Why

TaskForge manages highly relational data such as users, projects, tasks, comments, notifications, and memberships.

PostgreSQL provides strong ACID guarantees, mature indexing, excellent relational capabilities, and long-term scalability.

### Benefits

- Strong relational model
- Transaction support
- Excellent query performance
- Mature ecosystem
- Open source

---

# 3. Why Prisma ORM?

### Decision

Prisma was selected as the ORM.

### Why

Prisma provides a type-safe database client that integrates seamlessly with TypeScript.

Its schema-driven approach simplifies migrations, improves developer productivity, and reduces runtime errors caused by invalid queries.

### Benefits

- End-to-end type safety
- Easy schema migrations
- Excellent developer experience
- Auto-generated database client
- Simplified relationships

---

# 4. Why JWT Authentication?

### Decision

Authentication is implemented using JSON Web Tokens (JWT).

### Why

JWT enables stateless authentication, making the backend easier to scale without maintaining server-side sessions.

The frontend simply includes the access token with each protected request.

### Benefits

- Stateless
- Scalable
- Standard authentication mechanism
- Easy frontend integration

---

# 5. Why Role-Based Authorization?

### Decision

Authorization is implemented using Roles Guards and custom decorators.

### Why

Different users have different responsibilities inside a project management platform.

Role-based authorization allows permissions to be enforced consistently at the API layer.

Supported roles include:

- ADMIN
- PROJECT_MANAGER
- TEAM_MEMBER

---

# 6. Why Feature-Based Architecture?

### Decision

The backend follows a feature-based modular architecture.

### Why

Each feature owns its own controller, service, DTOs, and business logic.

This keeps modules independent and makes future features easier to add.

Example:

```
projects/
tasks/
users/
notifications/
```

### Benefits

- Better maintainability
- Easier testing
- Lower coupling
- Better scalability

---

# 7. Why React Query?

### Decision

React Query is used for server state management.

### Why

Most frontend data originates from the backend API.

React Query simplifies:

- caching
- background refetching
- optimistic updates
- loading states
- error handling

without introducing unnecessary global state.

### Benefits

- Automatic caching
- Optimistic UI
- Reduced boilerplate
- Better user experience

---

# 8. Why Axios?

### Decision

Axios is used for HTTP communication.

### Why

Axios provides request interceptors that automatically attach JWT Bearer tokens to protected requests.

This centralizes authentication logic and avoids duplication across services.

---

# 9. Why App Router (Next.js)?

### Decision

The frontend uses the Next.js App Router.

### Why

The App Router provides a modern routing model, layouts, improved code organization, and better support for scalable applications.

### Benefits

- Nested layouts
- Route groups
- Improved organization
- Future-ready architecture

---

# 10. Why Tailwind CSS + shadcn/ui?

### Decision

The frontend UI is built using Tailwind CSS and shadcn/ui.

### Why

Tailwind enables rapid UI development with consistent spacing and responsive utilities.

shadcn/ui provides accessible, composable components that can be customized without introducing heavy UI frameworks.

### Benefits

- Consistent design system
- Accessibility
- Full customization
- Minimal runtime overhead

---

# 11. Why Docker?

### Decision

Docker is used to containerize the application.

### Why

Containerization ensures consistent development and deployment environments across different machines.

This reduces setup complexity and improves portability.

---

# 12. Why GitHub Actions?

### Decision

Continuous Integration is implemented using GitHub Actions.

### Why

Every push automatically validates the project by building and testing both backend and frontend applications.

This prevents broken code from being merged and provides immediate feedback.

---

# 13. Why Swagger?

### Decision

Swagger (OpenAPI) documents the REST API.

### Why

Swagger provides interactive documentation that improves developer experience and simplifies API testing.

Developers can authenticate, inspect schemas, and execute requests directly from the browser.

---

# 14. Why Global Validation?

### Decision

NestJS ValidationPipe is applied globally.

### Why

Validation is enforced consistently across every endpoint.

This prevents invalid requests from reaching the business logic layer and keeps controllers clean.

---

# 15. Why Global Exception Handling?

### Decision

A global HTTP Exception Filter standardizes API error responses.

### Why

Clients receive predictable error structures regardless of where the exception originates.

This improves frontend integration and debugging while avoiding exposure of internal implementation details.

---

# 16. Why Standardized API Responses?

### Decision

All successful responses follow a unified response format.

Example:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "timestamp": "...",
  "data": {}
}
```

### Why

A consistent response structure simplifies frontend development and makes API behavior predictable.

---

# Future Considerations

Possible future enhancements include:

- Refresh Token rotation
- File attachments
- Real-time notifications using WebSockets
- Full-text search
- Audit trails
- API rate limiting
- Background job processing
- Multi-tenant workspaces

---

# Summary

TaskForge was designed with the following engineering principles:

- Separation of concerns
- Scalability
- Maintainability
- Type safety
- Security
- Developer experience
- Production readiness

The technology stack and architecture were selected to balance developer productivity with long-term maintainability while following modern full-stack engineering practices.