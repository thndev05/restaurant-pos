import type { FC } from 'react';
import { FiPlus, FiMinus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useOrder } from '../../hooks';
import { Button } from '../common';
import { formatCurrency } from '../../utils/currency';
import { useNavigate } from 'react-router-dom';

const OrderPanel: FC = () => {
  const {
    orderItems,
    orderType,
    setOrderType,
    updateItemQuantity,
    removeItem,
    calculateOrderSummary,
    currentOrder,
  } = useOrder();

  const navigate = useNavigate();
  const { subtotal, tax, total } = calculateOrderSummary();

  const handleContinue = () => {
    if (orderItems.length > 0) {
      navigate('/payment');
    }
  };

  return (
    <aside className="custom-scrollbar w-96 overflow-y-auto bg-white p-6 shadow-md">
      {/* Order Header */}
      <div className="mb-6">
        <h2 className="text-text-dark mb-4 text-xl font-bold">Order details</h2>

        {/* Order Type Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setOrderType('Dine in')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              orderType === 'Dine in'
                ? 'bg-primary text-white'
                : 'text-text-gray bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Dine in
          </button>
          <button
            onClick={() => setOrderType('Takeaway')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              orderType === 'Takeaway'
                ? 'bg-primary text-white'
                : 'text-text-gray bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Takeaway
          </button>
        </div>

        {/* Order Info */}
        {currentOrder && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-gray">Order ID</span>
              <span className="text-text-dark font-medium">#{currentOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-gray">Date</span>
              <span className="text-text-dark font-medium">{currentOrder.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Items Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-text-dark font-semibold">Items</h3>
        <span className="bg-primary rounded-full px-2 py-1 text-xs font-medium text-white">
          {orderItems.length}
        </span>
      </div>

      {/* Order Items */}
      <div className="custom-scrollbar mb-6 max-h-96 space-y-4 overflow-y-auto">
        {orderItems.length === 0 ? (
          <div className="text-text-gray py-12 text-center">
            <p>No items in order</p>
            <p className="mt-2 text-sm">Add items from menu</p>
          </div>
        ) : (
          orderItems.map((item) => (
            <div key={item.id} className="border-border flex gap-3 border-b pb-4">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <h4 className="text-text-dark mb-1 text-sm font-medium">{item.product.name}</h4>
                {item.extras && <p className="text-text-gray text-xs">Extra: {item.extras}</p>}
                {item.note && <p className="text-text-gray text-xs">Note: {item.note}</p>}
                <div className="mt-2 flex items-center justify-between">
                  {/* Action Icons */}
                  <div className="flex gap-2">
                    <button className="text-text-gray hover:text-primary transition-colors">
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-text-gray hover:text-danger transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      className="border-border hover:border-primary hover:text-primary flex h-6 w-6 items-center justify-center rounded-md border transition-colors"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      className="border-border hover:border-primary hover:text-primary flex h-6 w-6 items-center justify-center rounded-md border transition-colors"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-text-dark mt-2 text-sm font-semibold">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <>
          <div className="border-border mb-4 space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-gray">Subtotal</span>
              <span className="text-text-dark font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-gray">Tax 5%</span>
              <span className="text-text-dark font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="border-border flex justify-between border-t pt-3 text-base font-bold">
              <span className="text-text-dark">Total amount</span>
              <span className="text-text-dark">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Continue Button */}
          <Button onClick={handleContinue} fullWidth size="lg">
            Continue
          </Button>
        </>
      )}
    </aside>
  );
};

export default OrderPanel;
