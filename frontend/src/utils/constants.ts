/**
 * Application constants
 */

export const ORDER_TYPES = {
  DINE_IN: 'Dine in',
  TAKEAWAY: 'Takeaway',
} as const;

export const ORDER_STATUS = {
  ON_HOLD: 'On Hold',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT: 'credit',
  DEBIT: 'debit',
  MOBILE: 'mobile',
} as const;

export const TAX_RATE = 0.05; // 5%

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: '' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'drink', name: 'Drink', icon: '☕' },
  { id: 'dessert', name: 'Dessert', icon: '🍨' },
  { id: 'appetizer', name: 'Appetizer', icon: '🍗' },
] as const;
