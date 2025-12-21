// =========== Type Definitions for Staff Pages ===========

// Enums
export type TableStatus = 'Available' | 'Occupied' | 'Reserved';
export type SessionStatus = 'Active' | 'Paid' | 'Closed';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';
export type OrderItemStatus = 'Pending' | 'Cooking' | 'Ready' | 'Served';
export type PaymentStatus = 'Pending' | 'Success' | 'Failed';
export type PaymentMethod = 'Cash' | 'Online';
export type ActionType = 'Call_Staff' | 'Request_Bill';
export type ActionStatus = 'Pending' | 'Handled';
export type OrderType = 'DINE_IN' | 'TAKE_AWAY';
export type TakeawayStatus =
  | 'Pending'
  | 'Packed'
  | 'ReadyForPickup'
  | 'PickedUp'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled';

// Reservation
export interface Reservation {
  id: string;
  reservationTime: string;
  partySize: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  guestName?: string;
  guestPhone?: string;
  customerId?: string;
  tableId: string;
  createdAt: string;
  updatedAt: string;
}

// Table
export interface Table {
  table_id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  qr_code_key: string;
  area?: string; // Optional zone/area
  session?: TableSession; // Current active session
  reservations?: Reservation[]; // Upcoming reservations
}

// Table Session
export interface TableSession {
  session_id: string;
  table_id: string;
  table?: Table;
  start_time: string;
  end_time?: string;
  status: SessionStatus;
  guest_name?: string;
  party_size?: number;
  orders?: Order[];
  payment?: Payment;
}

// Order
export interface Order {
  order_id: string;
  order_type: OrderType;
  session_id?: string;
  session?: TableSession;
  customer_name?: string;
  customer_phone?: string;
  staff_id?: string;
  staff_name?: string;
  status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
  notes?: string;
  total_amount?: number;
}

// Order Item
export interface OrderItem {
  order_item_id: string;
  order_id: string;
  item_id: string;
  item_name_at_order: string;
  quantity: number;
  price_at_order: number;
  notes?: string;
  status: OrderItemStatus;
  image_url?: string;
  modifiers?: string[]; // Food modifiers
  allergies?: string[]; // Allergy warnings
  cooking_started_at?: string;
  ready_at?: string;
  served_at?: string;
}

// Payment
export interface Payment {
  payment_id: string;
  session_id: string;
  total_amount: number;
  sub_total: number;
  vat: number;
  discount: number;
  tip?: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  payment_time?: string;
  created_at: string;
}

// Staff Action
export interface StaffAction {
  action_id: string;
  session_id: string;
  session?: TableSession;
  action_type: ActionType;
  status: ActionStatus;
  created_at: string;
  handled_by_staff_id?: string;
  handled_by_staff_name?: string;
  handled_at?: string;
  notes?: string;
}

// Takeaway/Delivery Order
export interface TakeawayOrder {
  takeaway_id: string;
  order_id: string;
  order?: Order;
  customer_name: string;
  customer_phone: string;
  pickup_time?: string;
  delivery_address?: string;
  status: TakeawayStatus;
  otp_code?: string;
  rider_name?: string;
  rider_phone?: string;
  notes?: string;
}

// Menu Item (for reference)
export interface MenuItem {
  item_id: string;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  tags?: string[];
}

// Staff
export interface Staff {
  staff_id: string;
  username: string;
  full_name: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  total_tables: number;
  occupied_tables: number;
  available_tables: number;
  pending_orders: number;
  active_sessions: number;
  pending_actions: number;
  ready_items: number;
}

// Notification
export interface Notification {
  id: string;
  type: 'order' | 'action' | 'item_ready' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  related_id?: string; // order_id, action_id, etc.
}
