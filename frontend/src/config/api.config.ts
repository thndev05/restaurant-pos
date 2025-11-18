/**
 * API Configuration
 * Centralized configuration for API settings
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
} as const;

/**
 * Get full API URL with version prefix
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/${cleanEndpoint}`;
};

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    LOGOUT: 'auth/logout',
    REFRESH: 'auth/refresh',
    ME: 'auth/me',
  },
  // Users endpoints
  USERS: {
    BASE: 'users',
    BY_ID: (id: string | number) => `users/${id}`,
  },
  // Categories endpoints
  CATEGORIES: {
    BASE: 'categories',
    BY_ID: (id: string | number) => `categories/${id}`,
  },
  // Menu items endpoints
  MENU_ITEMS: {
    BASE: 'menu-items',
    BY_ID: (id: string | number) => `menu-items/${id}`,
    BY_CATEGORY: (categoryId: string | number) => `menu-items/category/${categoryId}`,
  },
  // Tables endpoints
  TABLES: {
    BASE: 'tables',
    BY_ID: (id: string | number) => `tables/${id}`,
  },
  // Customers endpoints
  CUSTOMERS: {
    BASE: 'customers',
    BY_ID: (id: string | number) => `customers/${id}`,
  },
} as const;
