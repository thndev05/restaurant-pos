import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface BestSellingItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  imageUrl: string;
}

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('2024-11-01');
  const [endDate, setEndDate] = useState('2024-11-30');

  const revenueData: RevenueData[] = [
    { date: '2024-11-01', revenue: 15000, orders: 45 },
    { date: '2024-11-02', revenue: 18000, orders: 52 },
    { date: '2024-11-03', revenue: 22000, orders: 68 },
    { date: '2024-11-04', revenue: 19000, orders: 55 },
    { date: '2024-11-05', revenue: 25000, orders: 72 },
    { date: '2024-11-06', revenue: 28000, orders: 81 },
    { date: '2024-11-07', revenue: 24000, orders: 69 },
  ];

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
  const totalItemsSold = bestSellingItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleFilter = () => {
    console.log('Filtering from', startDate, 'to', endDate);
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Overview of your restaurant performance and statistics
        </p>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4 pt-6 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="startDate" className="text-sm">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="text-sm">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              onClick={handleFilter}
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Calendar className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total Revenue</CardTitle>
            <DollarSign className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl font-bold sm:text-2xl">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-success/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total Orders</CardTitle>
            <ShoppingCart className="text-success h-4 w-4 sm:h-5 sm:w-5" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl font-bold sm:text-2xl">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Avg Order Value</CardTitle>
            <TrendingUp className="text-warning h-4 w-4 sm:h-5 sm:w-5" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl font-bold sm:text-2xl">${avgOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-info/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Items Sold</CardTitle>
            <ShoppingCart className="text-info h-4 w-4 sm:h-5 sm:w-5" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl font-bold sm:text-2xl">{totalItemsSold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => String(new Date(d).getDate())}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
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
        </CardContent>
      </Card>

      {/* Best Selling Items */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Best Selling Items</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {bestSellingItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium sm:h-8 sm:w-8 sm:text-sm">
                  {index + 1}
                </div>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-10 w-10 flex-shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium sm:text-base">{item.name}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-medium sm:text-sm">{item.quantity} sold</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
