/**
 * Base API Service
 * Generic CRUD operations that can be extended by specific services
 */

import apiClient from './client';
import type { ApiResponse, PaginatedResponse, RequestOptions } from './types';
import { AxiosError } from 'axios';

export class BaseApiService<T = unknown> {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all items (with pagination and filtering)
   */
  async getAll(options?: RequestOptions): Promise<PaginatedResponse<T>> {
    try {
      const response = await apiClient.get<PaginatedResponse<T>>(this.endpoint, {
        params: options?.params,
        signal: options?.signal,
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get a single item by ID
   */
  async getById(id: string | number): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Create a new item
   */
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(this.endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Update an existing item
   */
  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Partially update an existing item
   */
  async patch(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Delete an item
   */
  async delete(id: string | number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  protected handleError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Error in request configuration
      console.error('Request Error:', error.message);
    }
  }
}
