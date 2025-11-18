/**
 * Customers API Service
 * Handles customer management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';
import type { ApiResponse } from '../types';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
}

class CustomersService extends BaseApiService<Customer> {
  constructor() {
    super(API_ENDPOINTS.CUSTOMERS.BASE);
  }

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerData) {
    return this.create(data);
  }

  /**
   * Update customer information
   */
  async updateCustomer(id: string | number, data: UpdateCustomerData) {
    return this.update(id, data);
  }

  /**
   * Search customers by name, email, or phone
   */
  async searchCustomers(query: string) {
    const response = await apiClient.get<ApiResponse<Customer[]>>(`${this.endpoint}`, {
      params: { search: query },
    });
    return response.data;
  }

  /**
   * Get customer by phone number
   */
  async getCustomerByPhone(phone: string) {
    const response = await apiClient.get<ApiResponse<Customer>>(`${this.endpoint}/phone/${phone}`);
    return response.data;
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string) {
    const response = await apiClient.get<ApiResponse<Customer>>(`${this.endpoint}/email/${email}`);
    return response.data;
  }

  /**
   * Add loyalty points
   */
  async addLoyaltyPoints(id: string | number, points: number) {
    const response = await apiClient.post<ApiResponse<Customer>>(
      `${this.endpoint}/${id}/loyalty-points`,
      { points }
    );
    return response.data;
  }

  /**
   * Redeem loyalty points
   */
  async redeemLoyaltyPoints(id: string | number, points: number) {
    const response = await apiClient.post<ApiResponse<Customer>>(
      `${this.endpoint}/${id}/redeem-points`,
      { points }
    );
    return response.data;
  }
}

export const customersService = new CustomersService();
