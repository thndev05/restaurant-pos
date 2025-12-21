import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  CreditCard,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { analyticsService } from '@/lib/api/services/analytics.service';
import type { DashboardData } from '@/lib/api/services/analytics.service';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#667eea', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Get default date range (last 30 days)
  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardData({
        startDate: `${startDate}T00:00:00.000Z`,
        endDate: `${endDate}T23:59:59.999Z`,
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalItemsSold: 0,
    totalCustomers: 0,
  };

  const dailyRevenue = dashboardData?.dailyRevenue || [];
  const bestSellingItems = dashboardData?.bestSellingItems || [];
  const categoryPerformance = dashboardData?.categoryPerformance || [];
  const paymentMethods = dashboardData?.paymentMethods || [];
  const orderTypes = dashboardData?.orderTypes || [];
  const peakHours = dashboardData?.peakHours || [];

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Comprehensive insights into your restaurant's performance
          </p>
        </div>
        <Button onClick={fetchDashboardData} disabled={loading} variant="outline" className="gap-2">
          {loading ? (
            <>
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              <span>Refresh Data</span>
            </>
          )}
        </Button>
      </div>

      {/* Date Filter */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-4 pt-6 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="startDate" className="text-sm font-medium">
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
              <Label htmlFor="endDate" className="text-sm font-medium">
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
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Calendar className="h-4 w-4" />
              <span>Apply Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-br transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="bg-primary/10 rounded-full p-2">
              <DollarSign className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-muted-foreground mt-1 text-xs">Total earnings in period</p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-green-50 to-green-100 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="rounded-full bg-green-200 p-2">
              <ShoppingCart className="h-5 w-5 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            <p className="text-muted-foreground mt-1 text-xs">Completed orders</p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-orange-50 to-orange-100 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <div className="rounded-full bg-orange-200 p-2">
              <TrendingUp className="h-5 w-5 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">Per order average</p>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-gradient-to-br from-blue-50 to-blue-100 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <div className="rounded-full bg-blue-200 p-2">
              <Package className="h-5 w-5 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItemsSold.toLocaleString()}</div>
            <p className="text-muted-foreground mt-1 text-xs">Total menu items</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="rounded-full bg-purple-200 p-2">
              <Users className="h-5 w-5 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-muted-foreground mt-1 text-xs">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="revenue" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="peak" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Peak Hours</span>
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Revenue & Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full" style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      className="text-xs"
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#667eea" className="text-xs" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#34d399"
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'Revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                        return [value, 'Orders'];
                      }}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#667eea"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#34d399"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Types */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full" style={{ minHeight: 256 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: { type: string; percent?: number }) =>
                          `${entry.type}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {orderTypes.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Type Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderTypes.map((type, index) => (
                    <div key={type.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{type.type}</span>
                        </div>
                        <span className="text-muted-foreground">{type.orderCount} orders</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold">${type.revenue.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                          Avg: ${type.avgOrderValue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Best Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bestSellingItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4 transition-all"
                  >
                    <div className="from-primary to-primary/60 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white">
                      #{index + 1}
                    </div>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100';
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.orderCount} orders • {item.quantitySold} sold
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-green-600">${item.revenue.toLocaleString()}</p>
                      <p className="text-muted-foreground text-xs">Total Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full" style={{ minHeight: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: { name: string; percent?: number }) =>
                          `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {categoryPerformance.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full" style={{ minHeight: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#667eea" name="Revenue" />
                      <Bar dataKey="itemsSold" fill="#34d399" name="Items Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full" style={{ minHeight: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: { method: string; percentage: number }) =>
                          `${entry.method}: ${entry.percentage}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="totalAmount"
                      >
                        {paymentMethods.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={method.method}
                      className="hover:bg-muted/50 rounded-lg border p-4 transition-all"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-semibold">{method.method}</span>
                        </div>
                        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                          {method.percentage}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Transactions</p>
                          <p className="font-semibold">{method.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Total Amount</p>
                          <p className="font-semibold">${method.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Peak Hours Tab */}
        <TabsContent value="peak">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Peak Hours Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full" style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" orientation="left" stroke="#667eea" />
                    <YAxis yAxisId="right" orientation="right" stroke="#34d399" />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                        if (name === 'orderCount') return [value, 'Orders'];
                        return [`$${value.toFixed(2)}`, 'Avg Order Value'];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#667eea" name="Revenue" />
                    <Bar yAxisId="right" dataKey="orderCount" fill="#34d399" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {peakHours.map((period) => (
                  <div
                    key={period.period}
                    className="rounded-lg border p-4 transition-all hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Clock className="text-primary h-4 w-4" />
                      <span className="text-xs font-semibold">{period.period}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Revenue</p>
                      <p className="font-bold">${period.revenue.toLocaleString()}</p>
                      <p className="text-muted-foreground text-xs">
                        {period.orderCount} orders • Avg ${period.avgOrderValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
