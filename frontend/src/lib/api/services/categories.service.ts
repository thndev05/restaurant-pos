/**
 * Categories API Service
 * Handles category management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';
import type { ApiResponse } from '../types';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
  displayOrder?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

class CategoriesService extends BaseApiService<Category> {
  constructor() {
    super(API_ENDPOINTS.CATEGORIES.BASE);
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryData) {
    return this.create(data);
  }

  /**
   * Update category information
   */
  async updateCategory(id: string | number, data: UpdateCategoryData) {
    return this.update(id, data);
  }

  /**
   * Get active categories only
   */
  async getActiveCategories() {
    const response = await apiClient.get<ApiResponse<Category[]>>(`${this.endpoint}`, {
      params: { isActive: true },
    });
    return response.data;
  }

  /**
   * Toggle category active status
   */
  async toggleCategoryStatus(id: string | number, isActive: boolean) {
    return this.patch(id, { isActive });
  }

  /**
   * Update display order
   */
  async updateDisplayOrder(id: string | number, displayOrder: number) {
    return this.patch(id, { displayOrder });
  }
}

export const categoriesService = new CategoriesService();
