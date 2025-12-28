/**
 * Tables API Service
 * Handles table management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
export type SessionStatus = 'ACTIVE' | 'PAID' | 'CLOSED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
export type OrderItemStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  itemNameAtOrder: string;
  status: OrderItemStatus;
  notes?: string;
  menuItem?: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  notes?: string;
  sessionId: string;
  confirmedById?: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TableSession {
  id: string;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  customerCount?: number;
  notes?: string;
  tableId: string;
  orders: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  location?: string;
  qrCodeKey: string;
  sessions?: TableSession[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableData {
  number: number;
  capacity: number;
  status?: TableStatus;
  location?: string;
}

export interface UpdateTableData {
  number?: number;
  capacity?: number;
  status?: TableStatus;
  location?: string;
}

export interface QrTokenResponse {
  token: string;
  qrCodeUrl: string;
  tableNumber: number;
  tableId: string;
}

class TablesService extends BaseApiService<Table> {
  constructor() {
    super(API_ENDPOINTS.TABLES.BASE);
  }

  /**
   * Get all tables
   */
  async getTables(status?: TableStatus): Promise<Table[]> {
    const response = await apiClient.get<Table[]>(`${this.endpoint}`, {
      params: status ? { status } : undefined,
    });
    return response.data;
  }

  /**
   * Get table by ID
   */
  async getTableById(id: string | number): Promise<Table> {
    const response = await apiClient.get<Table>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Create a new table
   */
  async createTable(data: CreateTableData): Promise<Table> {
    const response = await apiClient.post<Table>(`${this.endpoint}`, data);
    return response.data;
  }

  /**
   * Update table information
   */
  async updateTable(id: string | number, data: UpdateTableData): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Delete table
   */
  async deleteTable(id: string | number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Update table status
   */
  async updateTableStatus(id: string | number, status: TableStatus): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.endpoint}/${id}/status`, {
      status,
    });
    return response.data;
  }

  /**
   * Generate QR token for a table
   */
  async generateQrToken(id: string | number, branchId?: string): Promise<QrTokenResponse> {
    const response = await apiClient.post<QrTokenResponse>(`${this.endpoint}/${id}/generate-qr`, {
      branchId,
    });
    return response.data;
  }
}

export const tablesService = new TablesService();
