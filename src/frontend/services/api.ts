// API utility functions for making HTTP requests

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error occurred');
  }
}

// User API functions
export const userApi = {
  getAll: () => request<any[]>('/users'),
  getById: (id: number) => request<any>(`/users/${id}`),
  create: (user: { name: string; email: string }) => 
    request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  update: (id: number, user: { name: string; email: string }) =>
    request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),
  delete: (id: number) =>
    request<any>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Product API functions
export const productApi = {
  getAll: () => request<any[]>('/products'),
  create: (product: { name: string; price: number; category: string }) =>
    request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
}; 