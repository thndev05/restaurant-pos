/* eslint-disable react-refresh/only-export-components */
import type { FC, ReactNode } from 'react';
import { createContext, useState, useCallback } from 'react';
import type { OrderItem, Order } from '../types';
import { generateOrderId } from '../utils/helpers';
import { getCurrentDate, getCurrentTime } from '../utils/date';
import { calculateTax, calculateTotal } from '../utils/currency';

interface OrderContextType {
  currentOrder: Order | null;
  orderItems: OrderItem[];
  orderType: 'Dine in' | 'Takeaway';
  addItem: (item: OrderItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemExtras: (itemId: string, extras: string) => void;
  updateItemNote: (itemId: string, note: string) => void;
  setOrderType: (type: 'Dine in' | 'Takeaway') => void;
  clearOrder: () => void;
  calculateOrderSummary: () => {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: FC<OrderProviderProps> = ({ children }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'Dine in' | 'Takeaway'>('Dine in');

  const addItem = useCallback((item: OrderItem) => {
    setOrderItems((prev) => {
      // Check if item already exists
      const existingItemIndex = prev.findIndex((i) => i.product.id === item.product.id);

      if (existingItemIndex > -1) {
        // Update quantity
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + item.quantity,
        };
        return updated;
      }

      // Add new item
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const updateItemExtras = useCallback((itemId: string, extras: string) => {
    setOrderItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, extras } : item)));
  }, []);

  const updateItemNote = useCallback((itemId: string, note: string) => {
    setOrderItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, note } : item)));
  }, []);

  const calculateOrderSummary = useCallback(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = calculateTax(subtotal);
    const discount = 0; // Can be extended later
    const total = calculateTotal(subtotal, tax, discount);

    return { subtotal, tax, discount, total };
  }, [orderItems]);

  const clearOrder = useCallback(() => {
    setOrderItems([]);
    setOrderType('Dine in');
  }, []);

  const currentOrder: Order | null =
    orderItems.length > 0
      ? {
          id: generateOrderId(),
          items: orderItems,
          orderType,
          date: getCurrentDate(),
          time: getCurrentTime(),
          status: 'Pending',
          ...calculateOrderSummary(),
        }
      : null;

  const value: OrderContextType = {
    currentOrder,
    orderItems,
    orderType,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemExtras,
    updateItemNote,
    setOrderType,
    clearOrder,
    calculateOrderSummary,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
