import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';
import type { OrderItemStatus, OrderType } from './orders.service';

export interface KitchenItem {
  id: string;
  orderId: string;
  orderCode: string;
  quantity: number;
  itemName: string;
  status: OrderItemStatus;
  allergies: string[];
  notes?: string | null;
  cookingStartedAt?: string | null;
  readyAt?: string | null;
  orderPlacedAt: string;
  tableLabel: string;
  orderType: OrderType;
}

export interface KitchenStats {
  pending: number;
  cooking: number;
  ready: number;
  total: number;
  avgPrepMinutes: number;
}

export interface KitchenQueueResponse {
  items: KitchenItem[];
  stats: KitchenStats;
  lastUpdated: string;
}

export interface KitchenQueueFilters {
  includeCompleted?: boolean;
  search?: string;
  status?: OrderItemStatus;
  orderType?: OrderType;
  limit?: number;
}

export interface UpdateKitchenItemStatusPayload {
  status: OrderItemStatus;
  reason?: string;
}

class KitchenService {
  async getQueue(params?: KitchenQueueFilters) {
    const response = await apiClient.get<KitchenQueueResponse>(API_ENDPOINTS.KITCHEN.ITEMS, {
      params,
    });
    return response.data;
  }

  async updateItemStatus(itemId: string, payload: UpdateKitchenItemStatusPayload) {
    const response = await apiClient.patch<{ message?: string }>(
      API_ENDPOINTS.KITCHEN.ITEM_STATUS(itemId),
      payload
    );
    return response.data;
  }
}

export const kitchenService = new KitchenService();
