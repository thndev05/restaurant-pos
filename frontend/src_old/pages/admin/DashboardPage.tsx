import type { FC } from 'react';
import { useState } from 'react';
import { AdminLayout } from '../../layouts/admin';
import { Card, Button, Input } from '../../components/common';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import type { RevenueData, BestSellingItem } from '../../types';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const DashboardPage: FC = () => {
  const [startDate, setStartDate] = useState('2024-11-01');
  const [endDate, setEndDate] = useState('2024-11-30');

  // Mock data for revenue chart
  const revenueData: RevenueData[] = [
    { date: '2024-11-01', revenue: 15000, orders: 45 },
    { date: '2024-11-02', revenue: 18000, orders: 52 },
    { date: '2024-11-03', revenue: 22000, orders: 68 },
    { date: '2024-11-04', revenue: 19000, orders: 55 },
    { date: '2024-11-05', revenue: 25000, orders: 72 },
    { date: '2024-11-06', revenue: 28000, orders: 81 },
    { date: '2024-11-07', revenue: 24000, orders: 69 },
  ];

  // Mock data for best-selling items
  const bestSellingItems: BestSellingItem[] = [
    {
      id: '1',
      name: 'Beef Steak',
      quantity: 145,
      revenue: 36250000,
      imageUrl: 'https://via.placeholder.com/100',
    },
    {
      id: '2',
      name: 'Grilled Salmon',
      quantity: 128,
      revenue: 32000000,
      imageUrl: 'https://via.placeholder.com/100',
    },
    {
      id: '3',
      name: 'Caesar Salad',
      quantity: 98,
      revenue: 14700000,
      imageUrl: 'https://via.placeholder.com/100',
    },
    {
      id: '4',
      name: 'Margherita Pizza',
      quantity: 87,
      revenue: 17400000,
      imageUrl: 'https://via.placeholder.com/100',
    },
    {
      id: '5',
      name: 'Pasta Carbonara',
      quantity: 76,
      revenue: 15200000,
      imageUrl: 'https://via.placeholder.com/100',
    },
  ];

  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const handleFilter = () => {
    // Handle filter logic here - would normally fetch data from API
    console.log('Filtering from', startDate, 'to', endDate);
  };

  return (
    <AdminLayout>
      <div className="bg-background flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-text-dark mb-2 text-3xl font-bold">Dashboard</h1>
            <p className="text-text-gray text-sm">
              Overview of your restaurant performance and statistics
            </p>
          </div>

          {/* Date Filter */}
          <Card className="mb-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-text-dark mb-2 block text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-text-dark mb-2 block text-sm font-medium">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleFilter} className="flex items-center gap-2">
                <FiCalendar size={18} />
                Filter
              </Button>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-gray mb-1 text-sm font-medium">Total Revenue</p>
                  <p className="text-text-dark text-2xl font-bold">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <FiDollarSign size={24} />
                </div>
              </div>
            </Card>

            <Card className="border-success/20 bg-success/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-gray mb-1 text-sm font-medium">Total Orders</p>
                  <p className="text-text-dark text-2xl font-bold">{totalOrders}</p>
                </div>
                <div className="bg-success/10 text-success flex h-12 w-12 items-center justify-center rounded-full">
                  <FiShoppingCart size={24} />
                </div>
              </div>
            </Card>

            <Card className="border-warning/20 bg-warning/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-gray mb-1 text-sm font-medium">Avg Order Value</p>
                  <p className="text-text-dark text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
                </div>
                <div className="bg-warning/10 text-warning flex h-12 w-12 items-center justify-center rounded-full">
                  <FiTrendingUp size={24} />
                </div>
              </div>
            </Card>

            <Card className="border-info/20 bg-info/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-gray mb-1 text-sm font-medium">Items Sold</p>
                  <p className="text-text-dark text-2xl font-bold">
                    {bestSellingItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div className="bg-info/10 text-info flex h-12 w-12 items-center justify-center rounded-full">
                  <FiShoppingCart size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-8">
            <h2 className="text-text-dark mb-6 text-xl font-bold">Revenue Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => String(new Date(d).getDate())} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#667eea"
                    name="Revenue"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#34d399"
                    name="Orders"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Best Selling Items */}
          <Card>
            <h2 className="text-text-dark mb-6 text-xl font-bold">Best Selling Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-background border-b">
                    <th className="text-text-gray pb-3 text-left text-sm font-medium">Item</th>
                    <th className="text-text-gray pb-3 text-right text-sm font-medium">
                      Quantity Sold
                    </th>
                    <th className="text-text-gray pb-3 text-right text-sm font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellingItems.map((item, index) => (
                    <tr key={item.id} className="border-background border-b last:border-b-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-text-gray flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                            {index + 1}
                          </span>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="text-text-dark font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-text-dark py-4 text-right font-medium">
                        {item.quantity}
                      </td>
                      <td className="text-text-dark py-4 text-right font-medium">
                        ${(item.revenue / 1000).toFixed(1)}k
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
