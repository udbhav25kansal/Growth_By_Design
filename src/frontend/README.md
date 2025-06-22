# Frontend Directory Structure

This directory contains all frontend-related code for the Growth By Design application.

## Directory Structure

```
src/frontend/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── AppHeader.tsx   # Application header
│   │   ├── UIButton.tsx    # Button component
│   │   └── FormInput.tsx   # Input field component
│   ├── features/           # Feature-specific components
│   │   └── UserProfileCard.tsx
│   └── index.ts           # Component exports
├── services/
│   └── api.ts             # Client-side API utilities
├── utils/
│   └── index.ts           # Frontend utility functions
├── styles/
│   └── main.scss          # Custom styles and CSS variables
├── types/
│   └── index.ts           # TypeScript interfaces and types
├── constants/
│   └── index.ts           # Frontend constants and configuration
├── hooks/
│   └── index.ts           # Custom React hooks (ready for future use)
└── README.md              # This file
```

## Components Layer (`components/`)

### UI Components (`ui/`)
Reusable, generic UI components that can be used throughout the app:
- `AppHeader` - Application navigation header
- `UIButton` - Button component with multiple variants
- `FormInput` - Input field with label and error handling

### Feature Components (`features/`)
Feature-specific components with business logic:
- `UserProfileCard` - User profile display component

### Component Organization
- All components use TypeScript with proper interfaces
- Components utilize the utility functions from `@/frontend/utils`
- Consistent styling with Tailwind CSS classes

## Services Layer (`services/`)

### `api.ts`
Client-side API utilities for making HTTP requests:
- `userApi` - User-related API calls
- `productApi` - Product-related API calls
- `ApiError` - Custom error handling class
- Generic `request` function for HTTP operations

## Utils Layer (`utils/`)

Frontend utility functions:
- `cn()` - Tailwind CSS class merging utility
- `formatCurrency()` - Currency formatting
- `formatDate()` - Date formatting
- `capitalize()` - String capitalization
- `generateId()` - Random ID generation
- `debounce()` - Function debouncing

## Types Layer (`types/`)

TypeScript interfaces and types:
- `User` - User data structure
- `CreateUserData` / `UpdateUserData` - User operation types
- `ApiError` - API error structure
- `FormField` - Form field configuration
- `Product` - Product data structure

## Constants Layer (`constants/`)

Frontend configuration and constants:
- `API_ENDPOINTS` - API endpoint paths
- `UI_CONFIG` - UI configuration values
- `VALIDATION` - Form validation rules
- `ROUTES` - Application routes
- `DEFAULTS` - Default values and settings

## Styles Layer (`styles/`)

### `main.scss`
Custom styles and CSS variables:
- CSS custom properties for theming
- Global styles and resets
- Custom component styles

## Usage Examples

### Importing Components
```typescript
// Individual imports
import { AppHeader, UIButton } from '@/frontend/components';

// Or direct import
import AppHeader from '@/frontend/components/ui/AppHeader';
```

### Using Services
```typescript
import { userApi } from '@/frontend/services/api';

const users = await userApi.getAll();
```

### Using Utils
```typescript
import { cn, formatCurrency } from '@/frontend/utils';

const classes = cn('base-class', conditionalClass);
const price = formatCurrency(99.99);
```

### Using Types
```typescript
import { User, CreateUserData } from '@/frontend/types';

const user: User = { id: 1, name: 'John', email: 'john@example.com' };
```

## Benefits

1. **Clear Separation**: Frontend code is clearly separated from backend
2. **Better Organization**: Components, services, and utilities are properly categorized
3. **Type Safety**: Comprehensive TypeScript interfaces throughout
4. **Reusability**: Components and utilities are designed for reuse
5. **Maintainability**: Easy to find and modify frontend code
6. **Scalability**: Structure supports growth with hooks, constants, and services
7. **Developer Experience**: Consistent imports and clear file organization

## Adding New Components

1. Create component in appropriate directory (`ui/` or `features/`)
2. Add proper TypeScript interfaces
3. Use utility functions and constants where appropriate
4. Export from `components/index.ts`
5. Update this README if adding new categories 