import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderCard } from '@/components/staff/OrderCard';
import type { Order } from '@/types/staff';
import { Search, Filter, ArrowUpDown, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function WaiterOrdersQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');

  // Mock data
  const mockOrders: Order[] = [
    {
      order_id: 'ord-001',
      session_id: 'ses-001',
      status: 'Pending',
      order_type: 'DineIn',
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      total_amount: 45.99,
      session: {
        session_id: 'ses-001',
        table_id: 'tbl-001',
        start_time: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'Active',
        table: {
          table_id: 'tbl-001',
          table_number: 'A1',
          capacity: 4,
          status: 'Occupied',
          qr_code_key: 'qr1',
        },
      },
      items: [
        {
          order_item_id: 'oi-001',
          order_id: 'ord-001',
          item_id: 'item-001',
          item_name_at_order: 'Beef Steak',
          quantity: 2,
          price_at_order: 19.99,
          status: 'Pending',
          notes: 'Medium rare, no onions',
          allergies: ['Dairy'],
        },
        {
          order_item_id: 'oi-002',
          order_id: 'ord-001',
          item_id: 'item-002',
          item_name_at_order: 'Caesar Salad',
          quantity: 1,
          price_at_order: 6.01,
          status: 'Pending',
        },
      ],
    },
    {
      order_id: 'ord-002',
      session_id: 'ses-002',
      status: 'Confirmed',
      order_type: 'DineIn',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      staff_name: 'John Smith',
      total_amount: 32.98,
      session: {
        session_id: 'ses-002',
        table_id: 'tbl-002',
        start_time: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'Active',
        table: {
          table_id: 'tbl-002',
          table_number: 'A3',
          capacity: 6,
          status: 'Occupied',
          qr_code_key: 'qr2',
        },
      },
      items: [
        {
          order_item_id: 'oi-003',
          order_id: 'ord-002',
          item_id: 'item-003',
          item_name_at_order: 'Grilled Salmon',
          quantity: 1,
          price_at_order: 22.99,
          status: 'Cooking',
          station: 'Grill',
        },
        {
          order_item_id: 'oi-004',
          order_id: 'ord-002',
          item_id: 'item-004',
          item_name_at_order: 'French Fries',
          quantity: 1,
          price_at_order: 4.99,
          status: 'Ready',
          station: 'Fryer',
        },
        {
          order_item_id: 'oi-005',
          order_id: 'ord-002',
          item_id: 'item-005',
          item_name_at_order: 'Cola',
          quantity: 1,
          price_at_order: 5.0,
          status: 'Ready',
          station: 'Bar',
        },
      ],
    },
    {
      order_id: 'ord-003',
      session_id: 'ses-003',
      status: 'Pending',
      order_type: 'Takeaway',
      created_at: new Date(Date.now() - 2 * 60000).toISOString(),
      total_amount: 28.5,
      items: [
        {
          order_item_id: 'oi-006',
          order_id: 'ord-003',
          item_id: 'item-006',
          item_name_at_order: 'Margherita Pizza',
          quantity: 2,
          price_at_order: 14.25,
          status: 'Pending',
        },
      ],
    },
  ];

  const filteredOrders = mockOrders
    .filter((order) => {
      const matchesSearch =
        order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.session?.table?.table_number?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesType = filterType === 'all' || order.order_type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      // Priority: Pending first, then by time
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === 'Pending').length,
    confirmed: mockOrders.filter((o) => o.status === 'Confirmed').length,
    readyItems: mockOrders.reduce(
      (sum, o) => sum + (o.items?.filter((i) => i.status === 'Ready').length || 0),
      0
    ),
  };

  const handleConfirmOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowConfirmDialog(true);
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
  };

  const confirmOrderAction = () => {
    // TODO: API call to confirm order
    alert(`Confirming order ${selectedOrder?.order_id}`);
    setShowConfirmDialog(false);
    setConfirmNotes('');
    setSelectedOrder(null);
  };

  const cancelOrderAction = () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    // TODO: API call to cancel order
    alert(`Cancelling order ${selectedOrder?.order_id}: ${cancelReason}`);
    setShowCancelDialog(false);
    setCancelReason('');
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders Queue</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage and process customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Total Orders</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-50">
          <CardContent className="p-4">
            <div className="text-sm text-amber-700">Pending</div>
            <div className="text-2xl font-bold text-amber-900">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Confirmed</div>
            <div className="text-success text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card className="border-info/30 bg-info/5">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Ready Items</div>
            <div className="text-info text-2xl font-bold">{stats.readyItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="DineIn">Dine-In</option>
                <option value="Takeaway">Takeaway</option>
                <option value="Delivery">Delivery</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'time' ? 'priority' : 'time')}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortBy === 'time' ? 'Time' : 'Priority'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.order_id}
            order={order}
            onConfirm={() => handleConfirmOrder(order)}
            onCancel={() => handleCancelOrder(order)}
            onView={() => alert(`View order ${order.order_id}`)}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Confirm Order Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Review order details and confirm to send to kitchen
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold">
                      Order #{selectedOrder.order_id.slice(0, 8)}
                    </span>
                    <span className="font-bold">${selectedOrder.total_amount?.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.order_item_id} className="text-sm">
                        <div className="flex justify-between">
                          <span>
                            {item.quantity}x {item.item_name_at_order}
                          </span>
                          <span>${(item.quantity * item.price_at_order).toFixed(2)}</span>
                        </div>
                        {item.notes && (
                          <p className="text-muted-foreground mt-1 text-xs">Note: {item.notes}</p>
                        )}
                        {item.allergies && item.allergies.length > 0 && (
                          <div className="mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            <p className="text-xs text-amber-600">
                              Allergies: {item.allergies.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="confirm-notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="confirm-notes"
                  placeholder="Add any notes for the kitchen..."
                  value={confirmNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setConfirmNotes(e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmOrderAction}>Confirm Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>Please provide a reason for cancelling this order</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Cancellation Reason *</Label>
              <Textarea
                id="cancel-reason"
                placeholder="e.g., Customer changed mind, item not available..."
                value={cancelReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCancelReason(e.target.value)
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Back
            </Button>
            <Button variant="destructive" onClick={cancelOrderAction}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
