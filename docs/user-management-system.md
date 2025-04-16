# User Management System Documentation

## Overview

The User Management System provides a comprehensive solution for managing users, roles, and permissions within the portfolio application. It enables administrators to create, update, and delete users, assign roles with specific permissions, and maintain a secure audit trail of all user-related activities.

## System Architecture

The user management system follows a layered architecture pattern with clear separation of concerns:

```mermaid
flowchart TD
    subgraph "Frontend Layer"
        UI[User Interface Components]
        Forms[User Forms]
        Lists[User Lists]
    end

    subgraph "Business Logic Layer"
        Auth[Authentication Service]
        UserOps[User Operations]
        RoleOps[Role Operations]
        Audit[Audit Logging]
    end

    subgraph "Data Access Layer"
        SP[Stored Procedures]
        RLS[Row-Level Security]
        Views[Database Views]
    end

    subgraph "Database Layer"
        Users[(Users Table)]
        Roles[(Roles Table)]
        UserRoles[(User Roles Table)]
        AuditLogs[(Audit Logs Table)]
    end

    UI --> Forms
    UI --> Lists
    Forms --> UserOps
    Lists --> UserOps
    Forms --> RoleOps
    Lists --> RoleOps

    UserOps --> Auth
    RoleOps --> Auth
    UserOps --> Audit
    RoleOps --> Audit

    UserOps --> SP
    RoleOps --> SP
    Auth --> SP

    SP --> RLS
    SP --> Views

    RLS --> Users
    RLS --> Roles
    RLS --> UserRoles
    RLS --> AuditLogs

    Views --> Users

    Audit --> AuditLogs

    style UI fill:#f9f,stroke:#333,stroke-width:2px
    style Database fill:#bbf,stroke:#333,stroke-width:2px
```

## Database Schema

The user management system relies on the following database tables:

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        jsonb user_metadata
        timestamp created_at
        timestamp updated_at
        timestamp last_sign_in_at
    }

    ROLES {
        uuid id PK
        string name
        string description
        jsonb permissions
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        uuid entity_id
        jsonb old_values
        jsonb new_values
        timestamp created_at
    }

    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned_to
    USERS ||--o{ AUDIT_LOGS : creates
```

## User Roles and Permissions

The system implements a role-based access control (RBAC) model where users are assigned roles, and roles contain specific permissions.

### Default Roles

```mermaid
graph TD
    subgraph "Admin Role"
        A1[create_posts]
        A2[edit_posts]
        A3[delete_posts]
        A4[manage_comments]
        A5[manage_users]
        A6[manage_roles]
        A7[manage_media]
        A8[manage_settings]
        A9[view_analytics]
    end

    subgraph "Content Editor Role"
        B1[create_posts]
        B2[edit_posts]
        B3[manage_comments]
        B4[manage_media]
        B5[view_analytics]
    end

    subgraph "Viewer Role"
        C1[view_analytics]
    end

    style A1 fill:#f9f,stroke:#333,stroke-width:1px
    style A2 fill:#f9f,stroke:#333,stroke-width:1px
    style A3 fill:#f9f,stroke:#333,stroke-width:1px
    style A4 fill:#f9f,stroke:#333,stroke-width:1px
    style A5 fill:#f9f,stroke:#333,stroke-width:1px
    style A6 fill:#f9f,stroke:#333,stroke-width:1px
    style A7 fill:#f9f,stroke:#333,stroke-width:1px
    style A8 fill:#f9f,stroke:#333,stroke-width:1px
    style A9 fill:#f9f,stroke:#333,stroke-width:1px

    style B1 fill:#bbf,stroke:#333,stroke-width:1px
    style B2 fill:#bbf,stroke:#333,stroke-width:1px
    style B3 fill:#bbf,stroke:#333,stroke-width:1px
    style B4 fill:#bbf,stroke:#333,stroke-width:1px
    style B5 fill:#bbf,stroke:#333,stroke-width:1px

    style C1 fill:#bfb,stroke:#333,stroke-width:1px
```

## Authentication Flow

The authentication flow for the user management system:

```mermaid
sequenceDiagram
    actor User
    participant UI as User Interface
    participant Auth as Auth Service
    participant DB as Database

    User->>UI: Enter credentials
    UI->>Auth: Sign in request
    Auth->>DB: Validate credentials
    DB-->>Auth: Authentication result

    alt Authentication successful
        Auth-->>UI: Generate JWT token
        UI-->>User: Redirect to dashboard
    else Authentication failed
        Auth-->>UI: Error message
        UI-->>User: Display error
    end

    Note over User,DB: After successful authentication

    User->>UI: Access protected resource
    UI->>Auth: Verify token
    Auth->>DB: Check permissions
    DB-->>Auth: Permission result

    alt Has permission
        Auth-->>UI: Allow access
        UI-->>User: Display resource
    else No permission
        Auth-->>UI: Deny access
        UI-->>User: Display error
    end
```

## User Management Operations

### User Creation Process

```mermaid
flowchart TD
    Start([Start]) --> AdminAccess{Admin has\naccess?}
    AdminAccess -->|No| Error[Display error message]
    AdminAccess -->|Yes| FormInput[Admin fills user form]
    FormInput --> Validation{Form valid?}
    Validation -->|No| ShowErrors[Show validation errors]
    ShowErrors --> FormInput
    Validation -->|Yes| CreateUser[Call create_user procedure]
    CreateUser --> AssignRoles[Assign selected roles]
    AssignRoles --> AuditLog[Log action in audit_logs]
    AuditLog --> Success[Show success message]
    Success --> End([End])
    Error --> End
```

### User Update Process

```mermaid
flowchart TD
    Start([Start]) --> AdminAccess{Admin has\naccess?}
    AdminAccess -->|No| Error[Display error message]
    AdminAccess -->|Yes| SelectUser[Admin selects user]
    SelectUser --> FormInput[Admin updates user form]
    FormInput --> Validation{Form valid?}
    Validation -->|No| ShowErrors[Show validation errors]
    ShowErrors --> FormInput
    Validation -->|Yes| PasswordVerify[Admin verifies password]
    PasswordVerify --> VerifyCheck{Password\nverified?}
    VerifyCheck -->|No| VerifyError[Show verification error]
    VerifyError --> PasswordVerify
    VerifyCheck -->|Yes| UpdateUser[Call update_user procedure]
    UpdateUser --> UpdateRoles[Update assigned roles]
    UpdateRoles --> AuditLog[Log action in audit_logs]
    AuditLog --> Success[Show success message]
    Success --> End([End])
    Error --> End
```

### User Deletion Process

```mermaid
flowchart TD
    Start([Start]) --> AdminAccess{Admin has\naccess?}
    AdminAccess -->|No| Error[Display error message]
    AdminAccess -->|Yes| SelectUser[Admin selects user]
    SelectUser --> ConfirmDelete{Confirm\ndeletion?}
    ConfirmDelete -->|No| Cancel[Cancel operation]
    ConfirmDelete -->|Yes| DeleteUser[Call delete_user procedure]
    DeleteUser --> AuditLog[Log action in audit_logs]
    AuditLog --> Success[Show success message]
    Success --> End([End])
    Error --> End
    Cancel --> End
```

## Security Features

The user management system implements several security features to ensure data protection and access control:

1. **Password Verification**: Sensitive actions (like updating user information or changing passwords) require password verification.

2. **Audit Logging**: All important actions are logged in the audit_logs table, including:
   - User creation and updates
   - Role creation and updates
   - Password changes
   - Profile updates

3. **Row-Level Security (RLS)**: Database tables are protected with RLS policies to ensure users can only access data they're authorized to see.

4. **First User Admin**: The first user created in the system is automatically assigned the admin role.

5. **Stored Procedures**: User management operations are performed through stored procedures that enforce permission checks:
   - `create_user`: Creates a new user with specified roles
   - `update_user`: Updates an existing user's information and roles
   - `delete_user`: Deletes a user
   - These procedures ensure that only users with the appropriate permissions can perform these actions.

## Security Implementation

```mermaid
flowchart TD
    subgraph "Authentication Layer"
        JWT[JWT Token Validation]
        Session[Session Management]
    end

    subgraph "Authorization Layer"
        RBAC[Role-Based Access Control]
        Permissions[Permission Checking]
    end

    subgraph "Database Security"
        RLS[Row-Level Security]
        SP[Stored Procedures]
        Audit[Audit Logging]
    end

    Request[User Request] --> JWT
    JWT --> Session
    Session --> RBAC
    RBAC --> Permissions
    Permissions --> RLS
    Permissions --> SP
    SP --> Audit
    RLS --> Audit

    style Authentication fill:#f9f,stroke:#333,stroke-width:2px
    style Authorization fill:#bbf,stroke:#333,stroke-width:2px
    style Database fill:#bfb,stroke:#333,stroke-width:2px
```

## API Endpoints and Functions

The user management system exposes the following API endpoints and functions:

### User Management

| Function | Description | Required Permission |
|----------|-------------|---------------------|
| `create_user` | Creates a new user with specified roles | `manage_users` |
| `update_user` | Updates an existing user's information and roles | `manage_users` |
| `delete_user` | Deletes a user | `manage_users` |
| `get_user_roles` | Gets the roles assigned to a user | `manage_users` |

### Role Management

| Function | Description | Required Permission |
|----------|-------------|---------------------|
| `create_role` | Creates a new role with specified permissions | `manage_roles` |
| `update_role` | Updates an existing role's information and permissions | `manage_roles` |
| `delete_role` | Deletes a role | `manage_roles` |

### Permission Checking

| Function | Description |
|----------|-------------|
| `has_permission` | Checks if a user has a specific permission |
| `user_is_admin` | Checks if a user has the admin role |

## Implementation Details

### Database Views

The system uses a database view (`users_view`) to provide a secure way to access user data without exposing sensitive information.

### Stored Procedures

Stored procedures are used to encapsulate business logic and enforce security checks:

```sql
-- Example of the create_user stored procedure
CREATE OR REPLACE FUNCTION portfolio.create_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_roles UUID[]
) RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  role_id UUID;
  result JSONB;
BEGIN
  -- Check if the current user has permission to create users
  IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN
    RAISE EXCEPTION 'Permission denied: You do not have permission to create users';
  END IF;

  -- Create the user
  -- ... implementation details ...

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Best Practices

1. **Always verify permissions** before performing sensitive operations
2. **Log all important actions** in the audit_logs table
3. **Use stored procedures** for database operations to enforce security checks
4. **Implement password verification** for sensitive actions
5. **Follow the principle of least privilege** when assigning roles and permissions

## Troubleshooting

### Common Issues

1. **403 Forbidden errors**: Usually indicates a permission issue. Check that the user has the required role and permissions.
2. **User creation failures**: Ensure the email is unique and all required fields are provided.
3. **Role assignment issues**: Verify that the role exists and the user has permission to assign roles.

### Debugging Tips

1. Check the browser console for error messages
2. Review the audit_logs table for failed operations
3. Verify that the user has the required permissions
4. Ensure that the database schema is up to date
