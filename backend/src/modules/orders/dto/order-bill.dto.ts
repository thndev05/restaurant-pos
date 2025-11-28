import { OrderType } from 'src/generated/prisma';

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
  createdAt: Date | string;
  confirmedBy: string | null;
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
