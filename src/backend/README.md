# Backend Directory Structure

This directory contains all backend-related code for the Growth By Design application.

## Directory Structure

```
src/backend/
├── database/
│   ├── connection.ts    # Database connection, migrations, and query setup
│   └── init.ts         # Database initialization (imported in app layout)
├── services/
│   ├── userService.ts  # User business logic and operations
│   └── index.ts       # Service exports
└── README.md          # This file
```

## Database Layer (`database/`)

### `connection.ts`
- Database connection using better-sqlite3
- Migration system for schema management
- Prepared statements and query definitions
- Graceful shutdown handling

### `init.ts`
- Automatic database initialization
- Imported in `app/layout.tsx` to ensure DB is ready before API routes

## Service Layer (`services/`)

### `userService.ts`
Contains all user-related business logic:
- `createUser(userData)` - Create a new user
- `getUserById(id)` - Get user by ID
- `getUserByEmail(email)` - Get user by email
- `updateUser(id, userData)` - Update user information
- `getAllUsers()` - Get all users

### Adding New Services
1. Create new service file (e.g., `productService.ts`)
2. Follow the same pattern as `userService.ts`
3. Export from `services/index.ts`

## Usage in API Routes

Instead of directly using database queries, API routes should use services:

```typescript
// ❌ Old way - direct database access
import { db, queries } from '@/lib/database';
const user = queries.getUserById.get(id);

// ✅ New way - using service layer
import { UserService } from '@/backend/services/userService';
const user = await UserService.getUserById(id);
```

## Benefits

1. **Separation of Concerns**: Database logic separated from business logic
2. **Better Error Handling**: Centralized error handling in services
3. **Type Safety**: Proper TypeScript interfaces for all data structures
4. **Testability**: Services can be easily unit tested
5. **Scalability**: Easy to add new features and services

## API Routes Location

API routes remain in `src/app/api/` as required by Next.js, but they now use the service layer instead of direct database access. 