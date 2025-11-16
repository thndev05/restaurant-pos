import type { FC } from 'react';
import { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import MainLayout from '../../layouts/staff/StaffLayout';
import { SearchBar, Badge } from '../../components/common';
import { formatCurrency, formatDate } from '../../utils';

const mockOrders = [
  {
    id: '3456872',
    items: [],
    orderType: 'Takeaway',
    date: '2024-02-02',
    time: '03:36',
    orderDetails: '×2 Chicken BBQ pizza...',
    status: 'On Hold',
    subtotal: 3250650,
    tax: 162532.5,
    discount: 0,
    total: 3413182.5,
  },
  {
    id: '3456873',
    items: [],
    orderType: 'Dine in',
    date: '2024-02-03',
    time: '14:22',
    orderDetails: '×1 Pepperoni pizza, ×2 Burger...',
    status: 'Completed',
    subtotal: 2100000,
    tax: 105000,
    discount: 0,
    total: 2205000,
  },
];

const OrdersPage: FC = () => {
  const [orders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'hold'>('history');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchQuery) ||
      (order.orderDetails && order.orderDetails.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab =
      activeTab === 'history' ? order.status !== 'On Hold' : order.status === 'On Hold';
    return matchesSearch && matchesTab;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'On Hold':
        return 'warning';
      case 'Pending':
        return 'info';
      case 'Cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <MainLayout>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-text-dark mb-4 text-3xl font-bold">Orders</h1>
          <SearchBar
            placeholder="Search by ID here..."
            onSearch={setSearchQuery}
            className="max-w-md"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-white'
                : 'text-text-gray hover:text-text-dark'
            }`}
          >
            Order history
          </button>
          <button
            onClick={() => setActiveTab('hold')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === 'hold' ? 'bg-primary text-white' : 'text-text-gray hover:text-text-dark'
            }`}
          >
            Orders on hold
          </button>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-border border-b bg-gray-50">
                <tr>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Order ID
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Order details
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">Time</th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Order type
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Order Status
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Price
                  </th>
                  <th className="text-text-dark px-6 py-4 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-gray-50">
                    <td className="text-text-dark px-6 py-4 text-sm font-medium">{order.id}</td>
                    <td className="text-text-gray px-6 py-4 text-sm">
                      {order.orderDetails || '-'}
                    </td>
                    <td className="text-text-gray px-6 py-4 text-sm">{formatDate(order.date)}</td>
                    <td className="text-text-gray px-6 py-4 text-sm">{order.time}</td>
                    <td className="text-text-gray px-6 py-4 text-sm">{order.orderType}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(order.status)} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="text-text-dark px-6 py-4 text-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-text-gray hover:text-primary rounded-md p-2 transition-colors hover:bg-gray-100">
                          <FiEdit size={16} />
                        </button>
                        <button className="text-text-gray hover:text-danger rounded-md p-2 transition-colors hover:bg-gray-100">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
