/**
 * Menu Items API Service
 * Handles all menu item-related API calls
 */

import apiClient from '../client';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  isActive: boolean;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  isAvailable?: boolean;
  image?: File;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  isAvailable?: boolean;
  image?: File;
}

export interface GetMenuItemsParams {
  search?: string;
}

class MenuItemsService {
  /**
   * Get all menu items
   */
  async getMenuItems(params?: GetMenuItemsParams): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>('/menu-items', { params });
    return response.data;
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(id: string): Promise<MenuItem> {
    const response = await apiClient.get<MenuItem>(`/menu-items/${id}`);
    return response.data;
  }

  /**
   * Create new menu item
   */
  async createMenuItem(data: CreateMenuItemData): Promise<MenuItem> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('price', data.price.toString());
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable.toString());
    if (data.image) formData.append('image', data.image);

    const response = await apiClient.post<MenuItem>('/menu-items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(id: string, data: UpdateMenuItemData): Promise<void> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price) formData.append('price', data.price.toString());
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable.toString());
    if (data.image) formData.append('image', data.image);

    await apiClient.patch(`/menu-items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Toggle menu item availability
   */
  async toggleAvailability(id: string): Promise<{ isAvailable: boolean }> {
    const response = await apiClient.patch<{ isAvailable: boolean }>(
      `/menu-items/${id}/toggle-availability`
    );
    return response.data;
  }

  /**
   * Soft delete menu item
   */
  async softDeleteMenuItem(id: string): Promise<void> {
    await apiClient.delete(`/menu-items/${id}`);
  }

  /**
   * Hard delete menu item
   */
  async hardDeleteMenuItem(id: string): Promise<void> {
    await apiClient.delete(`/menu-items/${id}/hard`);
  }
}

export const menuItemsService = new MenuItemsService();
