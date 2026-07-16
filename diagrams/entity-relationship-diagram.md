# Entity Relationship Diagram (ERD)

## Overview

The TaskForge database is designed using a normalized relational model. Core entities include users, roles, projects, tasks, comments, notifications, activity logs, and refresh tokens. Relationships are designed to minimize redundancy while maintaining referential integrity.

---

```mermaid
erDiagram

    Role ||--o{ User : assigns

    User ||--o{ Project : owns
    User ||--o{ ProjectMember : joins
    Project ||--o{ ProjectMember : contains

    Project ||--o{ Task : contains

    User ||--o{ Task : creates
    User ||--o{ Task : assigned_to

    Task ||--o{ TaskComment : has
    User ||--o{ TaskComment : writes

    Task ||--o{ TaskAttachment : has
    User ||--o{ TaskAttachment : uploads

    Task ||--o{ TaskLabel : tagged_with
    Label ||--o{ TaskLabel : categorizes

    User ||--o{ Notification : receives

    User ||--o{ ActivityLog : generates

    User ||--o{ RefreshToken : owns

    Role {
        uuid id PK
        enum name
        datetime createdAt
        datetime updatedAt
    }

    User {
        uuid id PK
        string firstName
        string lastName
        string email
        string password
        enum status
        uuid roleId FK
        datetime createdAt
        datetime updatedAt
    }

    Project {
        uuid id PK
        string name
        string description
        enum status
        enum priority
        datetime startDate
        datetime dueDate
        uuid ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    ProjectMember {
        uuid id PK
        uuid projectId FK
        uuid userId FK
        enum role
        enum invitationStatus
        datetime joinedAt
        datetime createdAt
        datetime updatedAt
    }

    Task {
        uuid id PK
        string title
        string description
        enum status
        enum priority
        uuid projectId FK
        uuid creatorId FK
        uuid assigneeId FK
        datetime startDate
        datetime dueDate
        datetime completedAt
        float estimatedHours
        float actualHours
        datetime createdAt
        datetime updatedAt
    }

    TaskComment {
        uuid id PK
        string content
        uuid taskId FK
        uuid authorId FK
        datetime createdAt
        datetime updatedAt
    }

    TaskAttachment {
        uuid id PK
        string fileName
        string fileUrl
        int fileSize
        uuid taskId FK
        uuid uploaderId FK
        datetime createdAt
    }

    Label {
        uuid id PK
        string name
        string color
    }

    TaskLabel {
        uuid taskId FK
        uuid labelId FK
    }

    Notification {
        uuid id PK
        string title
        string message
        enum type
        boolean isRead
        uuid userId FK
        datetime createdAt
    }

    ActivityLog {
        uuid id PK
        string action
        string entity
        string entityId
        uuid userId FK
        datetime createdAt
    }

    RefreshToken {
        uuid id PK
        string token
        datetime expiresAt
        datetime revokedAt
        uuid userId FK
        datetime createdAt
    }
```

---

## Relationship Summary

| Parent | Child | Relationship |
|---------|-------|--------------|
| Role | User | One-to-Many |
| User | Project | One-to-Many |
| Project | ProjectMember | One-to-Many |
| User | ProjectMember | One-to-Many |
| Project | Task | One-to-Many |
| User | Task (Creator) | One-to-Many |
| User | Task (Assignee) | One-to-Many |
| Task | TaskComment | One-to-Many |
| User | TaskComment | One-to-Many |
| Task | TaskAttachment | One-to-Many |
| User | TaskAttachment | One-to-Many |
| Task | Label | Many-to-Many (via TaskLabel) |
| User | Notification | One-to-Many |
| User | ActivityLog | One-to-Many |
| User | RefreshToken | One-to-Many |

---

## Design Notes

- UUIDs are used as primary keys across all entities.
- Foreign key constraints enforce referential integrity.
- Junction tables (ProjectMember and TaskLabel) model many-to-many relationships.
- Cascade deletion is applied where appropriate to maintain data consistency.
- Database indexes are defined on frequently queried foreign keys and status fields to improve performance.