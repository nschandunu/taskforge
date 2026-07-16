# TaskForge

A modern full-stack project management platform built with **Next.js**, **NestJS**, **PostgreSQL**, and **Prisma**.

TaskForge enables teams to manage projects, organize tasks using a Kanban workflow, collaborate through comments, monitor activity, and track project progress through a responsive dashboard. The project was developed with a strong focus on clean architecture, scalability, security, and developer experience.

---

## Features

### Authentication & Authorization

- JWT Authentication
- Role-Based Access Control (RBAC)
- Secure password hashing with bcrypt
- Protected API routes
- Refresh token support

### Dashboard

- Project statistics
- Task statistics
- Recent projects
- Recent tasks
- Activity feed
- Responsive dashboard cards

### Project Management

- Create, update, and delete projects
- Project priority & status
- Project members
- Project progress tracking
- Search and filtering

### Task Management

- Create, edit, and delete tasks
- Drag-and-drop Kanban board
- Task assignment
- Due dates
- Priorities
- Status management

### Collaboration

- Task comments
- Activity logging
- Notifications
- User profiles

### Developer Experience

- Swagger API Documentation
- Database Seeder
- Global Validation
- Global Exception Handling
- Standardized API Responses
- GitHub Actions CI
- Docker Support

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Axios
- React Hook Form
- Zod

## Backend

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport
- class-validator
- Swagger

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Jest
- Vitest

---

# Architecture

```text
                    Next.js Frontend
                           │
                           │ REST API
                           ▼
                     NestJS Backend
                           │
                      Prisma ORM
                           │
                           ▼
                     PostgreSQL Database
```

A more detailed explanation is available in:

```
docs/
├── ARCHITECTURE.md
├── API.md
└── DECISIONS.md
```

---

# Project Structure

```text
taskforge/

├── apps/
│   ├── api/                # NestJS Backend
│   └── web/                # Next.js Frontend
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DECISIONS.md
│
├── docker-compose.yml
└── README.md
```

---

# Getting Started

## Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL
- Docker (Optional)

---

## Clone Repository

```bash
git clone <repository-url>

cd taskforge
```

---

# Backend

```bash
cd apps/api

pnpm install
```

Configure environment variables.

```
DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=
```

Generate Prisma Client

```bash
pnpm prisma generate
```

Run migrations

```bash
pnpm prisma migrate dev
```

Seed database

```bash
pnpm db:seed
```

Run backend

```bash
pnpm start:dev
```

---

# Frontend

```bash
cd apps/web

pnpm install
```

Configure

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Run frontend

```bash
pnpm dev
```

---

# Docker

Run the complete application

```bash
docker compose up --build
```

---

# API Documentation

Swagger documentation is available at

```
http://localhost:3001/docs
```

The API includes documentation for all endpoints, request schemas, response models, and authentication.

---

# Testing

Backend

```bash
pnpm test
```

Coverage

```bash
pnpm test:cov
```

Frontend

```bash
pnpm test
```

---

# Continuous Integration

GitHub Actions automatically validates every push and pull request.

Pipeline includes:

- Dependency Installation
- Backend Build
- Backend Tests
- Frontend Build
- Frontend Tests (if available)

---

# Demo Accounts

## Administrator

```
Email:
admin@taskforge.com

Password:
********
```

## Project Manager

```
Email:
manager@taskforge.com

Password:
********
```

## Team Member

```
Email:
member@taskforge.com

Password:
********
```

> Replace the passwords above with the actual seeded credentials before submitting.

---

# Screenshots

## Login

> Add screenshot

---

## Dashboard

> Add screenshot

---

## Projects

> Add screenshot

---

## Kanban Board

> Add screenshot

---

## Notifications

> Add screenshot

---

## Dark Mode

> Add screenshot

---

# Documentation

Additional documentation is available in the `docs/` directory.

| Document | Description |
|----------|-------------|
| ARCHITECTURE.md | Overall system architecture |
| API.md | API design and conventions |
| DECISIONS.md | Architectural and technology decisions |

---

# Future Improvements

- Real-time notifications using WebSockets
- File uploads and attachments
- Advanced search
- Email notifications
- Audit logs
- Workspace support
- Calendar integration
- Time tracking
- Activity analytics

---

# License

This project is licensed under the MIT License.