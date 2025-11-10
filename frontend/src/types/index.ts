/**
 * TypeScript type definitions for the application
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  extras?: string;
  note?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  orderType: 'Dine in' | 'Takeaway';
  date: string;
  time: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'On Hold' | 'Pending' | 'Completed' | 'Cancelled';
  customerId?: string;
  tableId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  numberOfOrders: number;
  lastActivity: string;
  totalSpend: number;
}

export interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  capacity?: number;
}

export interface PaymentMethod {
  type: 'cash' | 'credit' | 'debit' | 'mobile';
  amount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
