# API Documentation

## Overview

TaskForge exposes a RESTful API built with NestJS. All endpoints follow a consistent request and response structure, making the API predictable and easy to consume.

The API is versioned and documented using Swagger/OpenAPI.

---

# Base URL

```
http://localhost:3001/api/v1
```

---

# Authentication

TaskForge uses JWT Bearer Authentication.

After a successful login, the client receives an access token.

Example:

```http
Authorization: Bearer <JWT_TOKEN>
```

Protected endpoints require a valid JWT.

---

# API Response Format

Every successful response follows the same structure.

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "timestamp": "2026-07-16T11:26:12.826Z",
  "data": {}
}
```

Errors are returned using NestJS HTTP Exceptions.

Example:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

# API Modules

The API is organized into feature-based modules.

| Module | Description |
|----------|-------------|
| Authentication | User authentication and JWT token management |
| Users | User management |
| Projects | Project CRUD and project members |
| Tasks | Task management and workflow |
| Comments | Task comments |
| Notifications | User notifications |
| Dashboard | Dashboard statistics and summaries |
| Activities | Activity logging |
| Health | Health check endpoint |

---

# Authentication

Responsible for authentication and authorization.

Typical operations include:

- Login
- Access Token generation
- JWT validation

Authentication is implemented using:

- Passport JWT
- NestJS Guards
- Role-based authorization

---

# Users

Provides user-related operations.

Typical capabilities include:

- Retrieve users
- User profile information
- User roles

---

# Projects

Manages project lifecycle.

Capabilities include:

- Create project
- Update project
- Delete project
- View project
- List projects
- Manage project members

---

# Tasks

Handles task management.

Capabilities include:

- Create task
- Update task
- Delete task
- Update task status
- Assign task
- List project tasks

Workflow stages include:

- TODO
- IN_PROGRESS
- IN_REVIEW
- DONE

---

# Comments

Supports collaboration on tasks.

Capabilities include:

- Retrieve task comments
- Create comments

Comments are linked directly to tasks.

---

# Notifications

Provides user notifications.

Capabilities include:

- Retrieve notifications
- Mark notification as read
- Retrieve unread notification count

---

# Dashboard

Provides aggregated application statistics.

Typical data includes:

- Total Projects
- Total Tasks
- Completed Tasks
- Overdue Tasks
- Recent Projects
- Recent Tasks
- Activity Feed

The Dashboard module minimizes frontend requests by aggregating commonly used metrics into a single response.

---

# Activity Logs

Records significant user actions.

Examples include:

- Project creation
- Task creation
- Status updates
- Comments
- Notifications

This data powers the Activity Feed shown in the dashboard.

---

# Validation

Incoming requests are validated using:

- DTOs
- class-validator
- ValidationPipe

Invalid requests return HTTP 400 responses.

---

# Authorization

Protected endpoints are secured using:

- JWT Authentication
- Roles Guard
- Custom Roles Decorator

Supported roles include:

- ADMIN
- PROJECT_MANAGER
- TEAM_MEMBER

---

# Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3001/docs
```

Swagger allows developers to:

- Explore endpoints
- Authenticate using JWT
- Execute requests
- Inspect request/response schemas

---

# Status Codes

The API follows standard HTTP status codes.

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

# Error Handling

Errors are handled globally using a custom HTTP Exception Filter.

This ensures all errors are returned in a consistent JSON format while preventing sensitive internal details from being exposed.

---

# API Design Principles

The API was designed around the following principles:

- RESTful resource design
- Consistent response format
- Stateless authentication
- Feature-based modularity
- Clear validation
- Predictable error handling
- Versioned endpoints
- Production-ready documentation

---

# Future Improvements

Potential future enhancements include:

- Refresh Token rotation
- API rate limiting
- Request tracing
- WebSocket notifications
- File upload service
- Public API versioning strategy