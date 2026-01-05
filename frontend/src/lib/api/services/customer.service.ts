/**
 * Customer API Service (Public Endpoints)
 * Handles customer-facing public API calls (no authentication required)
 */

import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';
import type { MenuItem } from './menuItems.service';

// Create a separate axios instance for public customer endpoints (no auth headers)
const publicApiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/v1`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  menuItems?: MenuItem[];
}

class CustomerService {
  /**
   * Get all available menu items (public access)
   * Only returns items with isAvailable: true and isActive: true
   */
  async getAvailableMenu(search?: string): Promise<MenuItem[]> {
    const params = search ? { search } : undefined;
    const response = await publicApiClient.get<MenuItem[]>(API_ENDPOINTS.CUSTOMER.MENU, { params });
    return response.data;
  }

  /**
   * Get single menu item by ID (public access)
   * Only returns if item is available and active
   */
  async getMenuItemById(id: string): Promise<MenuItem> {
    const response = await publicApiClient.get<MenuItem>(API_ENDPOINTS.CUSTOMER.MENU_ITEM(id));
    return response.data;
  }

  /**
   * Get all active categories with available menu items (public access)
   */
  async getCategories(): Promise<Category[]> {
    const response = await publicApiClient.get<Category[]>(API_ENDPOINTS.CUSTOMER.CATEGORIES);
    return response.data;
  }

  /**
   * Get single category by ID with available menu items (public access)
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await publicApiClient.get<Category>(API_ENDPOINTS.CUSTOMER.CATEGORY(id));
    return response.data;
  }
}

export const customerService = new CustomerService();
