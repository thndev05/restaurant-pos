import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  RefreshCw,
  Search,
  Eye,
  Clock,
  Users,
  Package,
  Receipt,
  XCircle,
  Loader2,
  Calendar,
  Plus,
} from 'lucide-react';
import { ordersService, type Order, type OrderStatus } from '@/lib/api/services/orders.service';
import { useToast } from '@/hooks/use-toast';
import { OrderDetailDialog } from '@/components/staff/OrderDetailDialog';
import { CreateOrderDialog } from '@/components/staff/CreateOrderDialog';

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  PREPARING: {
    label: 'Preparing',
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
  READY: {
    label: 'Ready',
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  SERVED: {
    label: 'Served',
    color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
};

export default function OrderManagementPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Silent refresh without loading state (for auto-refresh and dialog close)
  const refreshOrdersSilently = useCallback(async () => {
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await ordersService.getOrders(params);
      setOrders(data);

      // Update selectedOrder if it exists to reflect new data
      setSelectedOrder((prev) => {
        if (prev) {
          // Try to find updated order in the new data
          const updatedOrder = data.find((o) => o.id === prev.id);
          if (updatedOrder) {
            return updatedOrder;
          }
          // If not found, try to fetch it
          ordersService
            .getOrderById(prev.id)
            .then((order) => setSelectedOrder(order))
            .catch((error) => console.error('Failed to refresh selected order:', error));
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      // Silent error - don't show toast for auto-refresh failures
    }
  }, [startDate, endDate]);

  // Load orders with loading state (for initial load and manual refresh)
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await ordersService.getOrders(params);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, startDate, endDate]);

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshOrdersSilently, 5000);
    return () => clearInterval(interval);
  }, [loadOrders, refreshOrdersSilently]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
  };

  const handleOrderUpdate = async () => {
    // Silent refresh when order is updated
    await refreshOrdersSilently();
  };

  const handleDetailDialogClose = (open: boolean) => {
    setShowDetailDialog(open);
    if (!open) {
      // Silent refresh when dialog closes to avoid loading spinner
      setSelectedOrder(null);
      refreshOrdersSilently();
    }
  };

  const confirmCancel = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await ordersService.cancelOrder(orderToCancel);
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
      refreshOrdersSilently();
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, { status });
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      refreshOrdersSilently();
    } catch (error) {
      console.error('Failed to update order status:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  // Filter orders based on search
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.session && order.session.table.number.toString().includes(searchQuery)) ||
      (order.orderType === 'TAKE_AWAY' &&
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.orderType === 'TAKE_AWAY' && order.customerPhone?.includes(searchQuery)) ||
      order.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group orders by status for tabs
  const groupedOrders: Record<OrderStatus | 'ALL', Order[]> = {
    ALL: filteredOrders,
    PENDING: filteredOrders.filter((o) => o.status === 'PENDING'),
    CONFIRMED: filteredOrders.filter((o) => o.status === 'CONFIRMED'),
    PREPARING: filteredOrders.filter((o) => o.status === 'PREPARING'),
    READY: filteredOrders.filter((o) => o.status === 'READY'),
    SERVED: filteredOrders.filter((o) => o.status === 'SERVED'),
    PAID: filteredOrders.filter((o) => o.status === 'PAID'),
    CANCELLED: filteredOrders.filter((o) => o.status === 'CANCELLED'),
  };

  // Calculate statistics
  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: Receipt,
      color: 'text-blue-600',
    },
    {
      title: 'Pending',
      value: groupedOrders.PENDING.length,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Confirmed',
      value: groupedOrders.CONFIRMED.length,
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Preparing',
      value: groupedOrders.PREPARING.length,
      icon: Package,
      color: 'text-purple-600',
    },
    {
      title: 'Ready',
      value: groupedOrders.READY.length,
      icon: Package,
      color: 'text-green-600',
    },
    {
      title: 'Served',
      value: groupedOrders.SERVED.length,
      icon: Package,
      color: 'text-emerald-600',
    },
    {
      title: 'Paid',
      value: groupedOrders.PAID.length,
      icon: Receipt,
      color: 'text-green-600',
    },
    {
      title: 'Cancelled',
      value: groupedOrders.CANCELLED.length,
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  const calculateOrderTotal = (order: Order) => {
    return order.orderItems.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'SERVED',
      SERVED: 'PAID',
      PAID: null,
      CANCELLED: null,
    };
    return statusFlow[currentStatus];
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const statusConfig = ORDER_STATUS_CONFIG[order.status];
    const total = calculateOrderTotal(order);
    const nextStatus = getNextStatus(order.status);
    const canUpdateStatus = nextStatus !== null;
    const canCancel =
      order.status !== 'SERVED' && order.status !== 'CANCELLED' && order.status !== 'PAID';

    return (
      <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-lg">
        <CardHeader className="from-background to-muted/20 bg-linear-to-r pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-lg font-bold">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                {order.orderType === 'DINE_IN' && order.session ? (
                  <>🍽️ Table {order.session.table.number}</>
                ) : (
                  <>📦 Takeaway - {order.customerName}</>
                )}
              </p>
            </div>
            <Badge className={`${statusConfig.color} shrink-0 px-3 py-1 font-semibold`}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{formatDuration(order.createdAt)}</span>
            </div>
            {order.orderType === 'DINE_IN' && order.session && (
              <div className="bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium">{order.session.customerCount || 0} guests</span>
              </div>
            )}
            {order.orderType === 'TAKE_AWAY' && (
              <div className="bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Takeaway</span>
              </div>
            )}
            <div className="bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="font-medium">{order.orderItems.length} items</span>
            </div>
            <div className="bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5">
              <Receipt className="h-4 w-4 text-orange-600" />
              <span className="text-primary font-bold">{formatCurrency(total)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/20">
              <p className="line-clamp-2 font-medium text-amber-900 dark:text-amber-100">
                📝 {order.notes}
              </p>
            </div>
          )}

          {order.confirmedBy && (
            <div className="inline-block rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-950/20 dark:text-green-300">
              ✓ Confirmed by: <span className="font-semibold">{order.confirmedBy.name}</span>
            </div>
          )}

          <div className="text-muted-foreground border-t pt-2 text-xs">
            📅 Created: {formatDateTime(order.createdAt)}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="default"
              className="h-10 w-full"
              onClick={() => handleViewOrder(order)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>

            {/* Action buttons based on status */}
            {order.status === 'PAID' ? (
              <Button
                variant="outline"
                size="default"
                className="h-10 w-full cursor-default border-2 border-emerald-500 bg-linear-to-r from-emerald-100 to-green-100 font-bold text-emerald-900 hover:from-emerald-200 hover:to-green-200 dark:border-emerald-600 dark:from-emerald-900/50 dark:to-green-900/50 dark:text-emerald-100 dark:hover:from-emerald-800/60 dark:hover:to-green-800/60"
                disabled
              >
                <span className="mr-2">💰</span>
                Completed & Paid
              </Button>
            ) : order.status === 'CANCELLED' ? (
              <Button
                variant="outline"
                size="default"
                className="h-10 w-full cursor-default border-2 border-rose-500 bg-linear-to-r from-rose-100 to-red-100 font-bold text-rose-900 hover:from-rose-200 hover:to-red-200 dark:border-rose-600 dark:from-rose-900/50 dark:to-red-900/50 dark:text-rose-100 dark:hover:from-rose-800/60 dark:hover:to-red-800/60"
                disabled
              >
                <span className="mr-2">✕</span>
                Order Cancelled
              </Button>
            ) : (
              <>
                {canUpdateStatus && nextStatus && (
                  <Button
                    size="default"
                    className="bg-primary hover:bg-primary/90 h-10 w-full"
                    onClick={() => handleUpdateStatus(order.id, nextStatus)}
                  >
                    {nextStatus === 'CONFIRMED' && '✓ Confirm Order'}
                    {nextStatus === 'PREPARING' && '🔥 Start Preparing'}
                    {nextStatus === 'READY' && '✓✓ Mark as Ready'}
                    {nextStatus === 'SERVED' && '✓✓✓ Mark as Served'}
                    {nextStatus === 'PAID' && '💰 Mark as Paid'}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="destructive"
                    size="default"
                    className="h-10 w-full"
                    onClick={() => confirmCancel(order.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Order Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Real-time order tracking and management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
          <Button onClick={loadOrders} disabled={isLoading} size="sm" variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="hover:border-primary/30 border-2 transition-all hover:shadow-lg"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-[10px] font-semibold sm:text-xs md:text-sm">
                {stat.title}
              </CardTitle>
              <div
                className={`bg-muted/50 flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8`}
              >
                <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl md:text-3xl">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-2 p-4 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
            <Input
              placeholder="🔍 Search by order ID, table number, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-primary h-11 border-2 pl-10"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2">
              <Calendar className="text-primary h-5 w-5" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-0 bg-transparent focus:ring-0 sm:w-40"
                placeholder="Start date"
              />
            </div>
            <div className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2">
              <Calendar className="text-primary h-5 w-5" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-0 bg-transparent focus:ring-0 sm:w-40"
                placeholder="End date"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="ALL" className="space-y-4">
        <TabsList className="bg-card h-auto flex-wrap gap-1 rounded-lg border-2 p-2 shadow-sm">
          <TabsTrigger
            value="ALL"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All{' '}
            <Badge className="bg-background text-foreground ml-2">{groupedOrders.ALL.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="PENDING"
            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
          >
            Pending{' '}
            <Badge className="bg-background text-foreground ml-2">
              {groupedOrders.PENDING.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="CONFIRMED"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Confirmed{' '}
            <Badge className="bg-background text-foreground ml-2">
              {groupedOrders.CONFIRMED.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="PREPARING"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            Preparing{' '}
            <Badge className="bg-background text-foreground ml-2">
              {groupedOrders.PREPARING.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="READY"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Ready{' '}
            <Badge className="bg-background text-foreground ml-2">
              {groupedOrders.READY.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="SERVED"
            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            Served{' '}
            <Badge className="bg-background text-foreground ml-2">
              {groupedOrders.SERVED.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="PAID"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Paid{' '}
            <Badge className="bg-background text-foreground ml-2">
              {groupedOrders.PAID.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="CANCELLED"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            Cancelled{' '}
            <Badge className="bg-background text-foreground ml-2">
              {groupedOrders.CANCELLED.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {(
          [
            'ALL',
            'PENDING',
            'CONFIRMED',
            'PREPARING',
            'READY',
            'SERVED',
            'PAID',
            'CANCELLED',
          ] as const
        ).map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {isLoading ? (
              <Card className="border-2 p-12">
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
                  <p className="text-muted-foreground text-lg font-semibold">Loading orders...</p>
                </div>
              </Card>
            ) : groupedOrders[status].length === 0 ? (
              <Card className="bg-muted/20 border-2 border-dashed p-12">
                <div className="text-center">
                  <div className="bg-muted/50 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <Receipt className="text-muted-foreground/50 h-10 w-10" />
                  </div>
                  <p className="text-foreground mb-2 text-xl font-bold">No orders found</p>
                  <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                    {status === 'ALL'
                      ? '📋 There are no orders to display. Orders will appear here once they are created.'
                      : `🔍 There are no ${status.toLowerCase()} orders at the moment.`}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {groupedOrders[status].map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onOrderCreated={refreshOrdersSilently}
      />

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        open={showDetailDialog}
        onOpenChange={handleDetailDialogClose}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder}>Confirm Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
