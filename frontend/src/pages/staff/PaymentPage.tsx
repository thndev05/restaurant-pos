import type { FC } from 'react';
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/staff/StaffLayout';
import { Button } from '../../components/common';
import { useOrder } from '../../hooks';
import { formatCurrency } from '../../utils';

const PaymentPage: FC = () => {
  const navigate = useNavigate();
  const { calculateOrderSummary, orderItems } = useOrder();
  const { subtotal, tax } = calculateOrderSummary();

  const [discount] = useState(30);
  const [activePaymentMethod, setActivePaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [cashAmount, setCashAmount] = useState('600');
  const [creditAmount, setCreditAmount] = useState('200');

  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal + tax - discountAmount;

  const handleNumberPad = (value: string) => {
    if (activePaymentMethod === 'cash') {
      setCashAmount((prev) => (prev === '0' ? value : prev + value));
    } else {
      setCreditAmount((prev) => (prev === '0' ? value : prev + value));
    }
  };

  const handleClear = () => {
    if (activePaymentMethod === 'cash') {
      setCashAmount('0');
    } else {
      setCreditAmount('0');
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Payment */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-text-dark text-3xl font-bold">Payment</h1>
            <Button variant="outline" className="ml-auto">
              Choose Customer
            </Button>
          </div>

          {/* Info */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            {formatCurrency(
              finalTotal - parseInt(cashAmount || '0') - parseInt(creditAmount || '0')
            )}{' '}
            will be remaining after this payment
          </div>

          {/* Summary */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-gray">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-gray">Tax 5%</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-gray">Add Discount</span>
                <span className="text-danger font-medium">{discount}%</span>
              </div>
              <div className="border-border flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total amount</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Choose payment method</h3>

            <div className="space-y-3">
              <div
                onClick={() => setActivePaymentMethod('cash')}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                  activePaymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    activePaymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  {activePaymentMethod === 'cash' && (
                    <div className="bg-primary h-3 w-3 rounded-full"></div>
                  )}
                </div>
                <span className="flex-1 font-medium">Cash</span>
                <input
                  type="text"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="border-border w-32 rounded-md border px-3 py-2 text-right"
                  placeholder="Amount"
                />
              </div>

              <div
                onClick={() => setActivePaymentMethod('credit')}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                  activePaymentMethod === 'credit' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    activePaymentMethod === 'credit' ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  {activePaymentMethod === 'credit' && (
                    <div className="bg-primary h-3 w-3 rounded-full"></div>
                  )}
                </div>
                <span className="flex-1 font-medium">Credit</span>
                <input
                  type="text"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="border-border w-32 rounded-md border px-3 py-2 text-right"
                  placeholder="Amount"
                />
              </div>
            </div>
          </div>

          {/* Numpad */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'C'].map((key) => (
                <button
                  key={key}
                  onClick={() => (key === 'C' ? handleClear() : handleNumberPad(key))}
                  className="h-14 rounded-md bg-gray-50 text-lg font-medium transition-colors hover:bg-gray-100"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="custom-scrollbar w-96 overflow-y-auto bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold">Order Summary</h2>

          {orderItems.length === 0 ? (
            <div className="text-text-gray py-12 text-center">
              <p>No items in order</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="border-border flex gap-3 border-b pb-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="mb-1 text-sm font-medium">{item.product.name}</h4>
                    <p className="text-text-gray text-xs">Qty: {item.quantity}</p>
                    <p className="mt-2 text-sm font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Button fullWidth size="lg">
              Complete Payment
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentPage;
