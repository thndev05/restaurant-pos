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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Table as TableIcon,
  ChefHat,
  User,
  DollarSign,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  ordersService,
  type Order,
  type OrderStatus,
  type OrderItem,
  type OrderItemStatus,
} from '@/lib/api/services/orders.service';
import { OrderManagementDialog } from './OrderManagementDialog';
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Item management states
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

  // Form states for edit
  const [editItemForm, setEditItemForm] = useState({
    quantity: 1,
    notes: '',
  });

  if (!order) return null;

  const calculateOrderTotal = () => {
    return order.orderItems.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await ordersService.updateOrderStatus(order.id, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      await onOrderUpdate?.();
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
      await onOrderUpdate?.();
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

  const handleUpdateItemStatus = async (itemId: string, status: OrderItemStatus) => {
    setUpdatingItemId(itemId);
    try {
      await ordersService.updateOrderItemStatus(itemId, { status });
      toast({
        title: 'Success',
        description: 'Item status updated successfully',
      });
      await onOrderUpdate?.();
    } catch (error) {
      console.error('Failed to update item status:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to update item status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleAddItemSuccess = async () => {
    setShowAddItemDialog(false);
    // Refresh order data to show new items
    await onOrderUpdate?.();
  };

  const canAddItems = () => {
    // Check if order can have items added
    // Allow adding items to SERVED orders (customers can order more)
    if (order.status === 'CANCELLED') {
      toast({
        title: 'Cannot Add Items',
        description: 'Cannot add items to a cancelled order',
        variant: 'destructive',
      });
      return false;
    }
    if (order.status === 'PAID') {
      toast({
        title: 'Cannot Add Items',
        description: 'Cannot add items to a paid order',
        variant: 'destructive',
      });
      return false;
    }
    if (!order.sessionId) {
      toast({
        title: 'Cannot Add Items',
        description: 'Cannot add items to takeaway orders',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleOpenEditItemDialog = (item: OrderItem) => {
    setSelectedItem(item);
    setEditItemForm({
      quantity: item.quantity,
      notes: item.notes || '',
    });
    setShowEditItemDialog(true);
  };

  const handleEditItem = async () => {
    if (!selectedItem || editItemForm.quantity < 1) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await ordersService.updateOrderItem(selectedItem.id, {
        quantity: editItemForm.quantity,
        notes: editItemForm.notes || undefined,
      });
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
      setShowEditItemDialog(false);
      await onOrderUpdate?.();
    } catch (error) {
      console.error('Failed to update item:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to update item',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteItemDialog = (item: OrderItem) => {
    setSelectedItem(item);
    setShowDeleteItemDialog(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    setIsUpdating(true);
    try {
      await ordersService.deleteOrderItem(selectedItem.id);
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      setShowDeleteItemDialog(false);
      await onOrderUpdate?.();
    } catch (error) {
      console.error('Failed to delete item:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const total = calculateOrderTotal();
  const canCancel =
    order.status !== 'SERVED' && order.status !== 'PAID' && order.status !== 'CANCELLED';
  const canProcessPayment = order.status === 'SERVED';

  const OrderItemCard = ({ item }: { item: OrderItem }) => {
    const itemStatusConfig = ORDER_ITEM_STATUS_CONFIG[item.status];
    const canUpdateItemStatus =
      order.status !== 'CANCELLED' && order.status !== 'PAID' && item.status !== 'CANCELLED';
    // Allow editing items even for SERVED orders (for additional orders)
    const canEditItem = order.status !== 'CANCELLED' && order.status !== 'PAID';

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
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold">{item.itemNameAtOrder}</h4>
                  <p className="text-muted-foreground text-sm">Quantity: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canUpdateItemStatus ? (
                    <Select
                      value={item.status}
                      onValueChange={(value) =>
                        handleUpdateItemStatus(item.id, value as OrderItemStatus)
                      }
                      disabled={updatingItemId === item.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">◐ Pending</SelectItem>
                        <SelectItem value="COOKING">🔥 Cooking</SelectItem>
                        <SelectItem value="READY">✓ Ready</SelectItem>
                        <SelectItem value="SERVED">✓✓ Served</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={itemStatusConfig.color}>
                      {itemStatusConfig.icon} {itemStatusConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
              {item.notes && (
                <p className="text-muted-foreground bg-muted mt-2 rounded p-2 text-sm">
                  Note: {item.notes}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {formatCurrency(item.priceAtOrder)} × {item.quantity} ={' '}
                  {formatCurrency(item.priceAtOrder * item.quantity)}
                </p>
                {canEditItem && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditItemDialog(item)}
                      disabled={isUpdating}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDeleteItemDialog(item)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
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
                    {order.orderType === 'DINE_IN' && order.session ? (
                      <>
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
                            <p className="font-semibold">
                              {order.session.customerCount || 0} people
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Package className="text-muted-foreground h-4 w-4" />
                          <div>
                            <p className="text-muted-foreground text-sm">Order Type</p>
                            <p className="font-semibold">Takeaway</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="text-muted-foreground h-4 w-4" />
                          <div>
                            <p className="text-muted-foreground text-sm">Customer</p>
                            <p className="font-semibold">{order.customerName}</p>
                          </div>
                        </div>
                      </>
                    )}
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

                  {order.orderType === 'TAKE_AWAY' && order.customerPhone && (
                    <div className="flex items-center gap-2 border-t pt-3">
                      <div className="bg-muted/50 flex-1 rounded p-2">
                        <p className="text-muted-foreground text-sm">Phone Number</p>
                        <p className="font-mono font-semibold">{order.customerPhone}</p>
                      </div>
                    </div>
                  )}

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

              {/* Session Info - Only for Dine-In */}
              {order.orderType === 'DINE_IN' && order.session && (
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
                      <span className="font-mono text-sm">{order.sessionId?.slice(0, 8)}</span>
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
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ChefHat className="h-5 w-5" />
                      Order Items ({order.orderItems.length})
                    </CardTitle>
                    {order.status !== 'CANCELLED' && order.status !== 'PAID' && order.sessionId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (canAddItems()) {
                            setShowAddItemDialog(true);
                          }
                        }}
                        disabled={isUpdating}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Item
                      </Button>
                    )}
                  </div>
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
            <div className="flex w-full flex-col gap-3">
              {/* Quick Status Update Buttons */}
              {order.status !== 'PAID' && order.status !== 'CANCELLED' && (
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  {/* Primary Action Button - Full width on mobile, flex-1 on desktop */}
                  {order.status === 'PENDING' && (
                    <Button
                      onClick={() => handleUpdateStatus('CONFIRMED')}
                      disabled={isUpdating}
                      className="flex-1"
                      size="lg"
                    >
                      <span className="mr-2 text-lg">✓</span>
                      Confirm Order
                    </Button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button
                      onClick={() => handleUpdateStatus('PREPARING')}
                      disabled={isUpdating}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <span className="mr-2 text-lg">🔥</span>
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'PREPARING' && (
                    <Button
                      onClick={() => handleUpdateStatus('READY')}
                      disabled={isUpdating}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <span className="mr-2 text-lg">✓✓</span>
                      Mark Ready
                    </Button>
                  )}
                  {order.status === 'READY' && (
                    <Button
                      onClick={() => handleUpdateStatus('SERVED')}
                      disabled={isUpdating}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      size="lg"
                    >
                      <span className="mr-2 text-lg">✓✓✓</span>
                      Mark Served
                    </Button>
                  )}
                  {order.status === 'SERVED' && canProcessPayment && (
                    <Button
                      onClick={() => setShowPaymentDialog(true)}
                      disabled={isUpdating}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <DollarSign className="mr-2 h-5 w-5" />
                      Process Payment
                    </Button>
                  )}

                  {/* Cancel Button - Always on the right/bottom */}
                  {canCancel && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={isUpdating}
                      size="lg"
                      className="sm:w-auto"
                    >
                      <XCircle className="mr-2 h-5 w-5" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              )}

              {/* Close Button - Separated with border on top for better visual hierarchy */}
              <div className="flex justify-end border-t pt-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  size="lg"
                  className="min-w-[120px]"
                >
                  Close
                </Button>
              </div>
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

      {/* Payment Dialog - Works for both session-based and non-session orders */}
      <CreatePaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        sessionId={order.sessionId}
        orderId={!order.sessionId ? order.id : undefined}
        orderTotal={total}
        onPaymentCreated={() => {
          onOrderUpdate?.();
          onOpenChange(false);
        }}
      />

      {/* Add Item Dialog - Using OrderManagementDialog */}
      {order.sessionId && (
        <OrderManagementDialog
          open={showAddItemDialog}
          onOpenChange={setShowAddItemDialog}
          sessionId={order.sessionId}
          orderId={order.id}
          mode="add"
          onSuccess={handleAddItemSuccess}
        />
      )}

      {/* Edit Item Dialog */}
      <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-semibold">{selectedItem.itemNameAtOrder}</p>
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(selectedItem.priceAtOrder)} per item
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min={1}
                  value={editItemForm.quantity}
                  onChange={(e) =>
                    setEditItemForm({ ...editItemForm, quantity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Special requests or modifications..."
                  value={editItemForm.notes}
                  onChange={(e) => setEditItemForm({ ...editItemForm, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>New Total:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedItem.priceAtOrder * editItemForm.quantity)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditItemDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleEditItem} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={showDeleteItemDialog} onOpenChange={setShowDeleteItemDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item from the order?
              {selectedItem && (
                <div className="bg-muted mt-3 rounded-lg p-3">
                  <p className="text-foreground font-semibold">{selectedItem.itemNameAtOrder}</p>
                  <p className="text-muted-foreground text-sm">
                    Quantity: {selectedItem.quantity} × {formatCurrency(selectedItem.priceAtOrder)}{' '}
                    = {formatCurrency(selectedItem.priceAtOrder * selectedItem.quantity)}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? 'Deleting...' : 'Delete Item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
