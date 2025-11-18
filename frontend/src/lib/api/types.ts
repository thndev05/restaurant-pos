/**
 * API Types
 * Common types for API requests and responses
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Request options
 */
export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}
