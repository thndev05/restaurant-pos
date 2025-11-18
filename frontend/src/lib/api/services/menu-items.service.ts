/**
 * Menu Items API Service
 * Handles menu item management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';
import type { ApiResponse } from '../types';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  isAvailable: boolean;
  preparationTime?: number; // in minutes
  allergens?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  preparationTime?: number;
  allergens?: string[];
  tags?: string[];
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  allergens?: string[];
  tags?: string[];
}

class MenuItemsService extends BaseApiService<MenuItem> {
  constructor() {
    super(API_ENDPOINTS.MENU_ITEMS.BASE);
  }

  /**
   * Create a new menu item
   */
  async createMenuItem(data: CreateMenuItemData) {
    return this.create(data);
  }

  /**
   * Update menu item information
   */
  async updateMenuItem(id: string | number, data: UpdateMenuItemData) {
    return this.update(id, data);
  }

  /**
   * Get menu items by category
   */
  async getMenuItemsByCategory(categoryId: string | number) {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(
      API_ENDPOINTS.MENU_ITEMS.BY_CATEGORY(categoryId)
    );
    return response.data;
  }

  /**
   * Get available menu items only
   */
  async getAvailableMenuItems() {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(`${this.endpoint}`, {
      params: { isAvailable: true },
    });
    return response.data;
  }

  /**
   * Toggle menu item availability
   */
  async toggleAvailability(id: string | number, isAvailable: boolean) {
    return this.patch(id, { isAvailable });
  }

  /**
   * Search menu items
   */
  async searchMenuItems(query: string) {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(`${this.endpoint}`, {
      params: { search: query },
    });
    return response.data;
  }

  /**
   * Upload menu item image
   */
  async uploadImage(id: string | number, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<{ imageUrl: string }>>(
      `${this.endpoint}/${id}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const menuItemsService = new MenuItemsService();
