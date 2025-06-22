// API Constants
export const API_ENDPOINTS = {
  users: '/users',
  products: '/products',
  validate: '/validate',
  narrative: '/narrative',
  dbStatus: '/db-status',
} as const;

// UI Constants
export const UI_CONFIG = {
  maxContainerWidth: '1200px',
  headerHeight: '64px',
  sidebarWidth: '256px',
  mobileBreakpoint: '768px',
} as const;

// Form Validation Constants
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
    maxLength: 100,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
  password: {
    minLength: 8,
    maxLength: 100,
  },
} as const;

// App Routes
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  getStarted: '/get-started',
} as const;

// Default Values
export const DEFAULTS = {
  pageSize: 10,
  debounceDelay: 300,
  animationDuration: 200,
} as const; 