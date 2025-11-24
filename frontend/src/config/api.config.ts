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
  // Sessions endpoints
  SESSIONS: {
    BASE: 'sessions',
    BY_ID: (id: string | number) => `sessions/${id}`,
    CLOSE: (id: string | number) => `sessions/${id}/close`,
  },
  // Orders endpoints
  ORDERS: {
    BASE: 'orders',
    BY_ID: (id: string | number) => `orders/${id}`,
    UPDATE_STATUS: (id: string | number) => `orders/${id}/status`,
    ADD_ITEMS: (id: string | number) => `orders/${id}/items`,
    CANCEL: (id: string | number) => `orders/${id}/cancel`,
    ITEMS: {
      UPDATE: (itemId: string | number) => `orders/items/${itemId}`,
      UPDATE_STATUS: (itemId: string | number) => `orders/items/${itemId}/status`,
      DELETE: (itemId: string | number) => `orders/items/${itemId}`,
    },
  },
  // Payments endpoints
  PAYMENTS: {
    BASE: 'payments',
    BY_ID: (id: string | number) => `payments/${id}`,
    BY_SESSION: (sessionId: string | number) => `payments/session/${sessionId}`,
    PROCESS: (id: string | number) => `payments/${id}/process`,
  },
  // Actions endpoints
  ACTIONS: {
    BASE: 'actions',
    BY_ID: (id: string | number) => `actions/${id}`,
    BY_SESSION: (sessionId: string | number) => `actions/session/${sessionId}`,
    PENDING: 'actions/pending',
  },
} as const;
