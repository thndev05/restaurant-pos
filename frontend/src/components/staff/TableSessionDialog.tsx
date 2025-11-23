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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  Edit2,
  Trash2,
  DollarSign,
} from 'lucide-react';
import type {
  Table,
  Order,
  OrderStatus,
  OrderItemStatus,
  SessionStatus,
} from '@/lib/api/services/tables.service';
import { useToast } from '@/hooks/use-toast';
import { OrderManagementDialog } from './OrderManagementDialog';
import { EditItemDialog } from './EditItemDialog';
import { CreatePaymentDialog } from './CreatePaymentDialog';

const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'outline'; className: string }
> = {
  ACTIVE: {
    label: 'Active',
    variant: 'success',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200',
  },
  PAID: {
    label: 'Paid',
    variant: 'warning',
    className: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
  },
  CLOSED: {
    label: 'Closed',
    variant: 'outline',
    className: 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200',
  },
};

interface TableSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  onSessionUpdate?: () => void;
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

const calculateOrderTotal = (order: Order) => {
  return order.orderItems.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
};

export function TableSessionDialog({
  open,
  onOpenChange,
  table,
  onSessionUpdate,
}: TableSessionDialogProps) {
  const { toast } = useToast();
  const [_selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCloseSessionDialog, setShowCloseSessionDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [customerCount, setCustomerCount] = useState<number>(1);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Order management states
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [showAddItemsDialog, setShowAddItemsDialog] = useState(false);
  const [selectedOrderForAdd, setSelectedOrderForAdd] = useState<string | null>(null);

  // Edit & Delete item states
  const [editingItem, setEditingItem] = useState<{
    id: string;
    itemNameAtOrder: string;
    quantity: number;
    notes?: string;
    priceAtOrder: number;
  } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!table) return null;

  const activeSession = table.sessions?.[0];

  const handleCreateSession = async () => {
    setIsCreatingSession(true);
    try {
      const { sessionsService } = await import('@/lib/api/services');
      await sessionsService.createSession({
        tableId: table.id,
        customerCount: customerCount,
        notes: sessionNotes || undefined,
      });
      toast({
        title: 'Success',
        description: 'Session created successfully',
      });
      setCustomerCount(1);
      setSessionNotes('');
      onSessionUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create session:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to create session',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  if (!activeSession) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Table {table.number} - Create New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-muted-foreground mb-4 rounded-md bg-blue-50 p-3 text-sm">
              <p>
                This table currently has no active session. Create a new session to start serving
                customers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerCount">Number of Guests *</Label>
              <Input
                id="customerCount"
                type="number"
                min="1"
                value={customerCount}
                onChange={(e) => setCustomerCount(parseInt(e.target.value) || 1)}
                placeholder="Enter number of guests"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingSession}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSession} disabled={isCreatingSession || customerCount < 1}>
              {isCreatingSession ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const totalAmount = activeSession.orders.reduce(
    (sum, order) => sum + calculateOrderTotal(order),
    0
  );

  const handleUpdateOrderStatus = async (_orderId: string, _newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const { ordersService } = await import('@/lib/api/services');
      await ordersService.updateOrderStatus(_orderId, { status: _newStatus });
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      onSessionUpdate?.();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateItemStatus = async (_itemId: string, _newStatus: OrderItemStatus) => {
    setIsUpdating(true);
    try {
      const { ordersService } = await import('@/lib/api/services');
      await ordersService.updateOrderItemStatus(_itemId, { status: _newStatus });
      toast({
        title: 'Success',
        description: 'Item status updated successfully',
      });
      onSessionUpdate?.();
    } catch (error) {
      console.error('Failed to update item status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async (_orderId: string) => {
    setIsUpdating(true);
    try {
      const { ordersService } = await import('@/lib/api/services');
      await ordersService.cancelOrder(_orderId);
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
      setSelectedOrderId(null);
      await Promise.resolve(onSessionUpdate?.());
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItemId) return;
    setIsUpdating(true);
    try {
      const { ordersService } = await import('@/lib/api/services');
      await ordersService.deleteOrderItem(deletingItemId);
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      setDeletingItemId(null);
      setShowDeleteDialog(false);

      // Wait for session update to complete
      await Promise.resolve(onSessionUpdate?.());
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

  const handleCloseSession = async () => {
    setIsUpdating(true);
    try {
      const { sessionsService } = await import('@/lib/api/services');
      await sessionsService.closeSession(activeSession.id);
      toast({
        title: 'Success',
        description: 'Session closed successfully',
      });
      setShowCloseSessionDialog(false);

      // Wait for session update to complete before closing dialog
      await Promise.resolve(onSessionUpdate?.());
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to close session:', error);
      toast({
        title: 'Error',
        description: 'Failed to close session',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Refresh session data after successful payment
    await Promise.resolve(onSessionUpdate?.());
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Table {table.number} - Session Management</span>
              <Badge
                variant={SESSION_STATUS_CONFIG[activeSession.status].variant}
                className={SESSION_STATUS_CONFIG[activeSession.status].className}
              >
                {SESSION_STATUS_CONFIG[activeSession.status].label}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[calc(90vh-120px)] space-y-4 overflow-y-auto pr-2">
            {/* Session Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-medium">{formatDateTime(activeSession.startTime)}</span>
                  </div>
                  {activeSession.customerCount && (
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium">{activeSession.customerCount} people</span>
                    </div>
                  )}
                </div>
                {activeSession.notes && (
                  <div className="bg-muted mt-2 rounded-md p-2 text-xs">
                    <span className="font-medium">Session Notes:</span> {activeSession.notes}
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Orders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    Orders ({activeSession.orders.filter((o) => o.status !== 'CANCELLED').length})
                  </h3>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreateOrderDialog(true)}
                  disabled={isUpdating}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </div>

              {activeSession.orders.filter((o) => o.status !== 'CANCELLED').length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">No orders yet</div>
              ) : (
                <div className="space-y-3">
                  {activeSession.orders
                    .filter((o) => o.status !== 'CANCELLED')
                    .map((order, index) => (
                      <Card key={order.id} className="border-l-primary/20 border-l-4">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-sm font-medium">
                              Order #
                              {activeSession.orders.filter((o) => o.status !== 'CANCELLED').length -
                                index}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                              <Select
                                value={order.status}
                                onValueChange={(value) =>
                                  handleUpdateOrderStatus(order.id, value as OrderStatus)
                                }
                                disabled={isUpdating}
                              >
                                <SelectTrigger className="h-7 w-[140px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                  <SelectItem value="PREPARING">Preparing</SelectItem>
                                  <SelectItem value="READY">Ready</SelectItem>
                                  <SelectItem value="SERVED">Served</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-muted-foreground text-xs">
                                {formatDateTime(order.createdAt)}
                              </span>
                              {order.status !== 'CANCELLED' && order.status !== 'SERVED' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedOrderId(order.id);
                                    // Confirm and cancel
                                    handleCancelOrder(order.id);
                                  }}
                                  disabled={isUpdating}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="rounded-md border p-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-1 items-start gap-2">
                                  <Package className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                                  <div className="flex-1">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                      <span className="text-sm font-medium">
                                        {item.itemNameAtOrder}
                                      </span>
                                      <Select
                                        value={item.status}
                                        onValueChange={(value) =>
                                          handleUpdateItemStatus(item.id, value as OrderItemStatus)
                                        }
                                        disabled={isUpdating}
                                      >
                                        <SelectTrigger className="h-6 w-[110px] text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="PENDING">Pending</SelectItem>
                                          <SelectItem value="COOKING">Cooking</SelectItem>
                                          <SelectItem value="READY">Ready</SelectItem>
                                          <SelectItem value="SERVED">Served</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="text-muted-foreground mt-1 text-xs">
                                      Qty: {item.quantity} × {formatCurrency(item.priceAtOrder)} ={' '}
                                      <span className="font-medium">
                                        {formatCurrency(item.priceAtOrder * item.quantity)}
                                      </span>
                                    </div>
                                    {item.notes && (
                                      <div className="bg-muted mt-1 rounded p-1 text-xs italic">
                                        {item.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {item.status !== 'SERVED' && item.status !== 'CANCELLED' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={() => {
                                        setEditingItem(item);
                                        setShowEditDialog(true);
                                      }}
                                      disabled={isUpdating}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => {
                                        setDeletingItemId(item.id);
                                        setShowDeleteDialog(true);
                                      }}
                                      disabled={isUpdating}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {order.notes && (
                            <div className="bg-muted mt-2 rounded-md p-2 text-xs">
                              <span className="font-medium">Order notes:</span> {order.notes}
                            </div>
                          )}
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrderForAdd(order.id);
                                setShowAddItemsDialog(true);
                              }}
                              disabled={
                                isUpdating ||
                                order.status === 'CANCELLED' ||
                                order.status === 'SERVED'
                              }
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Add Items
                            </Button>
                            <div className="text-sm font-semibold">
                              <span className="text-muted-foreground">Total: </span>
                              {formatCurrency(calculateOrderTotal(order))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => setShowPaymentDialog(true)}
                  disabled={
                    isUpdating ||
                    activeSession.orders.filter((o) => o.status !== 'CANCELLED').length === 0
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowCloseSessionDialog(true)}
                  disabled={isUpdating}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Management Dialogs */}
      <OrderManagementDialog
        open={showCreateOrderDialog}
        onOpenChange={setShowCreateOrderDialog}
        sessionId={activeSession.id}
        onSuccess={async () => {
          await Promise.resolve(onSessionUpdate?.());
        }}
        mode="create"
      />

      <OrderManagementDialog
        open={showAddItemsDialog}
        onOpenChange={setShowAddItemsDialog}
        sessionId={activeSession.id}
        orderId={selectedOrderForAdd || undefined}
        onSuccess={async () => {
          await Promise.resolve(onSessionUpdate?.());
        }}
        mode="add"
      />

      {/* Edit Item Dialog */}
      <EditItemDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        item={editingItem}
        onSuccess={async () => {
          await Promise.resolve(onSessionUpdate?.());
        }}
      />

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item from the order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <CreatePaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        sessionId={activeSession.id}
        orderTotal={totalAmount}
        onPaymentCreated={handlePaymentSuccess}
      />

      {/* Close Session Confirmation Dialog */}
      <AlertDialog open={showCloseSessionDialog} onOpenChange={setShowCloseSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Session for Table {table.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the current session. Total amount: {formatCurrency(totalAmount)}
              <br />
              Make sure all payments have been processed before closing the session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseSession}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? 'Closing...' : 'End Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
