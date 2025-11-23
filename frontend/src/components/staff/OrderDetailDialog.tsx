import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Clock,
  Users,
  Receipt,
  Package,
  XCircle,
  CheckCircle,
  Table as TableIcon,
  ChefHat,
  User,
  DollarSign,
} from 'lucide-react';
import {
  ordersService,
  type Order,
  type OrderStatus,
  type OrderItem,
  type OrderItemStatus,
} from '@/lib/api/services/orders.service';
import { useToast } from '@/hooks/use-toast';
import { CreatePaymentDialog } from './CreatePaymentDialog';

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '◐',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: '✓',
  },
  PREPARING: {
    label: 'Preparing',
    color: 'bg-purple-100 text-purple-800',
    icon: '🔥',
  },
  READY: {
    label: 'Ready',
    color: 'bg-green-100 text-green-800',
    icon: '✓✓',
  },
  SERVED: {
    label: 'Served',
    color: 'bg-emerald-100 text-emerald-800',
    icon: '✓✓✓',
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800',
    icon: '💰',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '✕',
  },
};

const ORDER_ITEM_STATUS_CONFIG: Record<
  OrderItemStatus,
  { label: string; color: string; icon: string }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '◐',
  },
  COOKING: {
    label: 'Cooking',
    color: 'bg-orange-100 text-orange-800',
    icon: '🔥',
  },
  READY: {
    label: 'Ready',
    color: 'bg-green-100 text-green-800',
    icon: '✓',
  },
  SERVED: {
    label: 'Served',
    color: 'bg-emerald-100 text-emerald-800',
    icon: '✓✓',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '✕',
  },
};

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onOrderUpdate?: () => void;
}

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

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onOrderUpdate,
}: OrderDetailDialogProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (!order) return null;

  const calculateOrderTotal = () => {
    return order.orderItems.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'SERVED',
      SERVED: null,
      PAID: null,
      CANCELLED: null,
    };
    return statusFlow[currentStatus];
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await ordersService.updateOrderStatus(order.id, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      onOrderUpdate?.();
      onOpenChange(false);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsUpdating(true);
    try {
      await ordersService.cancelOrder(order.id);
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
      onOrderUpdate?.();
      setShowCancelDialog(false);
      onOpenChange(false);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const total = calculateOrderTotal();
  const nextStatus = getNextStatus(order.status);
  const canUpdateStatus = nextStatus !== null;
  const canCancel =
    order.status !== 'SERVED' && order.status !== 'PAID' && order.status !== 'CANCELLED';
  const canProcessPayment = order.status === 'SERVED';

  const OrderItemCard = ({ item }: { item: OrderItem }) => {
    const itemStatusConfig = ORDER_ITEM_STATUS_CONFIG[item.status];
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.menuItem.image && (
              <div className="shrink-0">
                <img
                  src={item.menuItem.image}
                  alt={item.itemNameAtOrder}
                  className="h-16 w-16 rounded-md object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{item.itemNameAtOrder}</h4>
                  <p className="text-muted-foreground text-sm">Quantity: {item.quantity}</p>
                </div>
                <Badge className={itemStatusConfig.color}>
                  {itemStatusConfig.icon} {itemStatusConfig.label}
                </Badge>
              </div>
              {item.notes && (
                <p className="text-muted-foreground bg-muted mt-2 rounded p-2 text-sm">
                  Note: {item.notes}
                </p>
              )}
              <p className="mt-2 text-sm font-semibold">
                {formatCurrency(item.priceAtOrder)} × {item.quantity} ={' '}
                {formatCurrency(item.priceAtOrder * item.quantity)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">Order #{order.id.slice(0, 8)}</DialogTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Created {formatDateTime(order.createdAt)}
                </p>
              </div>
              <Badge className={statusConfig.color} variant="outline">
                {statusConfig.icon} {statusConfig.label}
              </Badge>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <TableIcon className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Table</p>
                        <p className="font-semibold">Table {order.session.table.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Guests</p>
                        <p className="font-semibold">{order.session.customerCount || 0} people</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Duration</p>
                        <p className="font-semibold">{formatDuration(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Items</p>
                        <p className="font-semibold">{order.orderItems.length}</p>
                      </div>
                    </div>
                  </div>

                  {order.confirmedBy && (
                    <div className="flex items-center gap-2 border-t pt-3">
                      <User className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Confirmed by</p>
                        <p className="font-semibold">{order.confirmedBy.name}</p>
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div className="border-t pt-3">
                      <p className="text-muted-foreground mb-1 text-sm">Order Notes</p>
                      <p className="bg-muted rounded p-3">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TableIcon className="h-5 w-5" />
                    Session Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Session ID</span>
                    <span className="font-mono text-sm">{order.sessionId.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Table Status</span>
                    <Badge variant="outline">{order.session.table.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Session Started</span>
                    <span className="text-sm">{formatDateTime(order.session.startTime)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ChefHat className="h-5 w-5" />
                    Order Items ({order.orderItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.orderItems.map((item) => (
                    <OrderItemCard key={item.id} item={item} />
                  ))}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <div className="flex w-full gap-2">
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isUpdating}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
              <div className="flex-1" />
              {canProcessPayment && (
                <Button
                  onClick={() => setShowPaymentDialog(true)}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
              )}
              {canUpdateStatus && (
                <Button onClick={() => handleUpdateStatus(nextStatus)} disabled={isUpdating}>
                  {isUpdating ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {nextStatus === 'CONFIRMED' && 'Confirm Order'}
                      {nextStatus === 'PREPARING' && 'Start Preparing'}
                      {nextStatus === 'READY' && 'Mark as Ready'}
                      {nextStatus === 'SERVED' && 'Mark as Served'}
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone. All order
              items will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} disabled={isUpdating}>
              {isUpdating ? 'Cancelling...' : 'Confirm Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <CreatePaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        sessionId={order.sessionId}
        orderTotal={total}
        onPaymentCreated={() => {
          onOrderUpdate?.();
          onOpenChange(false);
        }}
      />
    </>
  );
}
