/**
 * Orders API Service
 * Handles order management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'PAID'
  | 'CANCELLED';
export type OrderItemStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  isAvailable: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  itemNameAtOrder: string;
  status: OrderItemStatus;
  notes?: string;
  allergies?: string[];
  cookingStartedAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  rejectionReason?: string | null;
  orderId: string;
  menuItemId: string;
  menuItem: MenuItem;
}

export interface Table {
  id: string;
  number: number;
  status: string;
}

export interface Session {
  id: string;
  table: Table;
  customerCount?: number;
  startTime: string;
}

export interface ConfirmedBy {
  id: string;
  name: string;
  username: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  sessionId?: string;
  confirmedById?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  session?: Session;
  confirmedBy?: ConfirmedBy;
}

export interface GetOrdersParams {
  status?: OrderStatus;
  orderType?: OrderType;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
}

export interface OrderBillItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderBill {
  orderId: string;
  orderNumber: string;
  orderType: OrderType;
  createdAt: string;
  confirmedBy?: string | null;
  items: OrderBillItem[];
  subTotal: number;
  tax: number;
  discount: number;
  total: number;
  // For dine-in orders
  tableNumber?: number;
  customerCount?: number;
  sessionId?: string;
  // For takeaway orders
  customerName?: string;
  customerPhone?: string;
}

export interface UpdateOrderItemStatusData {
  status: OrderItemStatus;
  reason?: string;
}

export interface CreateOrderItemData {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export type OrderType = 'DINE_IN' | 'TAKE_AWAY';

export interface CreateOrderData {
  orderType: OrderType;
  sessionId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CreateOrderItemData[];
  notes?: string;
  autoConfirm?: boolean;
}

export interface AddOrderItemsData {
  items: CreateOrderItemData[];
}

export interface UpdateOrderItemData {
  quantity?: number;
  notes?: string;
}

class OrdersService extends BaseApiService<never> {
  constructor() {
    super(API_ENDPOINTS.ORDERS.BASE);
  }

  /**
   * Get all orders with optional filters
   */
  async getOrders(params?: GetOrdersParams): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(this.endpoint, { params });
    return response.data;
  }

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderData): Promise<unknown> {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string | number): Promise<Order> {
    const response = await apiClient.get<Order>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string | number,
    data: UpdateOrderStatusData
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
      data
    );
    return response.data;
  }

  /**
   * Add items to an existing order
   */
  async addOrderItems(
    orderId: string | number,
    data: AddOrderItemsData
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.ORDERS.ADD_ITEMS(orderId),
      data
    );
    return response.data;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string | number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(API_ENDPOINTS.ORDERS.CANCEL(id), {});
    return response.data;
  }

  /**
   * Get order bill
   */
  async getOrderBill(id: string | number): Promise<OrderBill> {
    const response = await apiClient.get<OrderBill>(API_ENDPOINTS.ORDERS.BILL(id));
    return response.data;
  }

  /**
   * Update order item (quantity, notes)
   */
  async updateOrderItem(
    itemId: string | number,
    data: UpdateOrderItemData
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      API_ENDPOINTS.ORDERS.ITEMS.UPDATE(itemId),
      data
    );
    return response.data;
  }

  /**
   * Update order item status
   */
  async updateOrderItemStatus(
    itemId: string | number,
    data: UpdateOrderItemStatusData
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      API_ENDPOINTS.ORDERS.ITEMS.UPDATE_STATUS(itemId),
      data
    );
    return response.data;
  }

  /**
   * Delete an order item
   */
  async deleteOrderItem(itemId: string | number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.ORDERS.ITEMS.DELETE(itemId)
    );
    return response.data;
  }
}

export const ordersService = new OrdersService();
