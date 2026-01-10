# System Architecture

## User Authentication & Data Flow

```mermaid
graph TD
    A[User] -->|1. Click Sign In| B[Google OAuth Login]
    B -->|2. Authenticate| C[Google]
    C -->|3. Return User Info| D[NextAuth Callback]
    D -->|4. signIn callback| E[upsertUser Function]
    E -->|5. INSERT or UPDATE| F[(PostgreSQL Database)]
    F -->|6. Return User Data| E
    E -->|7. Success| D
    D -->|8. Create Session| G[User Session]
    G -->|Access App| A
```

## Database Structure

```mermaid
erDiagram
    USERS {
        varchar id PK "Google User ID"
        varchar email UK "Email (Unique)"
        varchar name "User Name"
        text image "Profile Image URL"
        boolean email_verified "Email Verified Status"
        timestamp created_at "Account Creation Time"
        timestamp updated_at "Last Update Time (Auto)"
        timestamp last_login "Last Login Time"
    }
```

## File Organization

```
rarity-runner/
├── auth.ts                          # ✅ Updated - Auto-save user on login
├── lib/db/
│   ├── db.ts                       # ✅ Updated - Export pool
│   ├── schema/
│   │   └── users.sql              # ✅ New - Table schema
│   ├── models/
│   │   └── user.ts                # ✅ New - User CRUD functions
│   ├── migrate.ts                 # ✅ New - Migration script
│   ├── test-user-model.ts         # ✅ New - Test script
│   └── README.md                  # ✅ Updated - User docs
└── .env.local                      # Database credentials
```

## CRUD Operations Flow

```mermaid
sequenceDiagram
    participant App
    participant UserModel
    participant Pool
    participant PostgreSQL

    Note over App,PostgreSQL: Create/Update User (UPSERT)
    App->>UserModel: upsertUser(userData)
    UserModel->>Pool: query(INSERT ... ON CONFLICT)
    Pool->>PostgreSQL: Execute SQL
    PostgreSQL-->>Pool: Return User Row
    Pool-->>UserModel: User Object
    UserModel-->>App: User Data

    Note over App,PostgreSQL: Get User
    App->>UserModel: getUserById(id)
    UserModel->>Pool: query(SELECT ... WHERE id)
    Pool->>PostgreSQL: Execute SQL
    PostgreSQL-->>Pool: Return Rows
    Pool-->>UserModel: Query Result
    UserModel-->>App: User Object or null
```
