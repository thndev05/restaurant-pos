/**
 * Currency utility functions for formatting Vietnamese Dong
 */

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + ' VND';
};

export const parseCurrency = (currencyString: string): number => {
  return parseInt(currencyString.replace(/[^\d]/g, ''), 10) || 0;
};

export const calculateTax = (amount: number, taxRate: number = 0.05): number => {
  return amount * taxRate;
};

export const calculateDiscount = (amount: number, discountPercentage: number): number => {
  return amount * (discountPercentage / 100);
};

export const calculateTotal = (subtotal: number, tax: number, discount: number = 0): number => {
  return subtotal + tax - discount;
};
