# System Architecture Diagram

## Overview

TaskForge follows a layered architecture that separates presentation, business logic, data access, and persistence. The frontend communicates with the backend through a REST API, while Prisma ORM manages database interactions with PostgreSQL. Authentication is handled using JWT, and continuous integration is provided through GitHub Actions.

---

```mermaid
flowchart TB

%% ==============================
%% CLIENT LAYER
%% ==============================

subgraph Client["Client Layer"]

Browser["Web Browser"]

Next["Next.js 16
React 19
TypeScript"]

UI["shadcn/ui
Tailwind CSS"]

RQ["React Query"]

Axios["Axios Client
JWT Interceptor"]

Browser --> Next
Next --> UI
Next --> RQ
RQ --> Axios

end

%% ==============================
%% API LAYER
%% ==============================

subgraph API["Backend API Layer (NestJS)"]

Controllers["Controllers"]

Guards["JWT Guard
Roles Guard"]

Validation["Validation Pipe
DTO Validation"]

Services["Business Services"]

Filters["Exception Filter"]

Controllers --> Guards
Guards --> Validation
Validation --> Services
Services --> Filters

end

%% ==============================
%% DATA LAYER
%% ==============================

subgraph Data["Data Access Layer"]

Prisma["Prisma ORM"]

Postgres["PostgreSQL"]

Prisma --> Postgres

end

%% ==============================
%% SUPPORTING SERVICES
%% ==============================

subgraph Docs["Documentation"]

Swagger["Swagger / OpenAPI"]

end

subgraph Security["Authentication"]

JWT["JWT Authentication"]

BCrypt["bcrypt Password Hashing"]

end

subgraph DevOps["DevOps"]

Docker["Docker"]

Github["GitHub Actions CI"]

end

%% ==============================
%% CONNECTIONS
%% ==============================

Axios --> Controllers

Services --> Prisma

Controllers --> Swagger

Guards --> JWT

Services --> BCrypt

Github --> Docker

Docker --> API

Docker --> Client

```

---

# Request Flow

```text
User

↓

Next.js Frontend

↓

Axios

↓

JWT Authentication

↓

NestJS Controller

↓

Validation

↓

Business Service

↓

Prisma ORM

↓

PostgreSQL

↓

Response

↓

React Query Cache

↓

Updated UI
```

---

# Architectural Layers

| Layer | Responsibility |
|--------|----------------|
| Client Layer | User interface and interaction |
| API Layer | Business logic, validation, and authorization |
| Data Layer | Database access through Prisma ORM |
| Database | Persistent storage using PostgreSQL |
| Documentation | Interactive API documentation with Swagger |
| DevOps | Docker containerization and GitHub Actions CI |

---

# Security Architecture

TaskForge applies security at multiple layers:

- JWT Bearer Authentication
- Role-Based Access Control (RBAC)
- Password hashing using bcrypt
- DTO validation
- Global Validation Pipe
- Global Exception Filter
- Protected API endpoints

---

# Design Principles

The architecture was designed around the following principles:

- Separation of concerns
- Modular feature-based architecture
- Scalability
- Maintainability
- Type safety
- Security by default
- Production readiness