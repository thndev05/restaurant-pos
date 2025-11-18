/**
 * Tables API Service
 * Handles table management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';
import type { ApiResponse } from '../types';

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  location?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableData {
  number: string;
  capacity: number;
  location?: string;
}

export interface UpdateTableData {
  number?: string;
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
  location?: string;
}

class TablesService extends BaseApiService<Table> {
  constructor() {
    super(API_ENDPOINTS.TABLES.BASE);
  }

  /**
   * Create a new table
   */
  async createTable(data: CreateTableData) {
    return this.create(data);
  }

  /**
   * Update table information
   */
  async updateTable(id: string | number, data: UpdateTableData) {
    return this.update(id, data);
  }

  /**
   * Get available tables
   */
  async getAvailableTables() {
    const response = await apiClient.get<ApiResponse<Table[]>>(`${this.endpoint}`, {
      params: { status: 'available' },
    });
    return response.data;
  }

  /**
   * Update table status
   */
  async updateTableStatus(id: string | number, status: 'available' | 'occupied' | 'reserved') {
    return this.patch(id, { status });
  }

  /**
   * Generate QR code for table
   */
  async generateQRCode(id: string | number) {
    const response = await apiClient.post<ApiResponse<{ qrCode: string }>>(
      `${this.endpoint}/${id}/qr-code`
    );
    return response.data;
  }

  /**
   * Get table by QR code
   */
  async getTableByQRCode(qrCode: string) {
    const response = await apiClient.get<ApiResponse<Table>>(`${this.endpoint}/qr/${qrCode}`);
    return response.data;
  }

  /**
   * Get tables by status
   */
  async getTablesByStatus(status: 'available' | 'occupied' | 'reserved') {
    const response = await apiClient.get<ApiResponse<Table[]>>(`${this.endpoint}`, {
      params: { status },
    });
    return response.data;
  }
}

export const tablesService = new TablesService();
