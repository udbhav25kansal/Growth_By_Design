// User-related types
export interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
}

export interface UpdateUserData {
  name: string;
}

// API-related types
export interface ApiError {
  error: string;
  status?: number;
}

// Form-related types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  placeholder?: string;
}

// Product-related types (for future use)
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  created_at?: string;
}

// Component prop types
export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
} 