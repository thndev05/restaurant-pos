import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Order, OrderItem } from '@/types/staff';
import {
  ArrowLeft,
  Clock,
  User,
  UtensilsCrossed,
  AlertTriangle,
  CheckCircle,
  Printer,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function WaiterOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [showServeDialog, setShowServeDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [additionalNote, setAdditionalNote] = useState('');

  // Mock data - in production, fetch based on orderId
  const mockOrder: Order = {
    order_id: orderId || 'ord-001',
    session_id: 'ses-001',
    status: 'Confirmed',
    order_type: 'DineIn',
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    staff_name: 'John Smith',
    total_amount: 52.47,
    notes: 'Please serve together',
    session: {
      session_id: 'ses-001',
      table_id: 'tbl-001',
      start_time: new Date(Date.now() - 60 * 60000).toISOString(),
      status: 'Active',
      guest_name: 'Alice Johnson',
      party_size: 3,
      table: {
        table_id: 'tbl-001',
        table_number: 'A5',
        capacity: 4,
        status: 'Occupied',
        qr_code_key: 'qr1',
      },
    },
    items: [
      {
        order_item_id: 'oi-001',
        order_id: orderId || 'ord-001',
        item_id: 'item-001',
        item_name_at_order: 'Beef Steak',
        quantity: 2,
        price_at_order: 19.99,
        status: 'Ready',
        notes: 'Medium rare, no onions',
        allergies: ['Dairy'],
        station: 'Grill',
        image_url: 'https://via.placeholder.com/100',
        cooking_started_at: new Date(Date.now() - 15 * 60000).toISOString(),
        ready_at: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        order_item_id: 'oi-002',
        order_id: orderId || 'ord-001',
        item_id: 'item-002',
        item_name_at_order: 'Caesar Salad',
        quantity: 1,
        price_at_order: 8.99,
        status: 'Ready',
        station: 'Cold Kitchen',
        image_url: 'https://via.placeholder.com/100',
        ready_at: new Date(Date.now() - 3 * 60000).toISOString(),
      },
      {
        order_item_id: 'oi-003',
        order_id: orderId || 'ord-001',
        item_id: 'item-003',
        item_name_at_order: 'French Fries',
        quantity: 2,
        price_at_order: 4.5,
        status: 'Cooking',
        station: 'Fryer',
        image_url: 'https://via.placeholder.com/100',
        cooking_started_at: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        order_item_id: 'oi-004',
        order_id: orderId || 'ord-001',
        item_id: 'item-004',
        item_name_at_order: 'Cola',
        quantity: 3,
        price_at_order: 3.0,
        status: 'Served',
        station: 'Bar',
        image_url: 'https://via.placeholder.com/100',
        served_at: new Date(Date.now() - 10 * 60000).toISOString(),
      },
    ],
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ${Math.floor(diffMinutes % 60)}m ago`;
  };

  const handleServeItem = (item: OrderItem) => {
    setSelectedItem(item);
    setShowServeDialog(true);
  };

  const confirmServeItem = () => {
    alert(`Marking item ${selectedItem?.item_name_at_order} as served`);
    setShowServeDialog(false);
    setSelectedItem(null);
  };

  const handleAddNote = (item: OrderItem) => {
    setSelectedItem(item);
    setAdditionalNote(item.notes || '');
    setShowAddNoteDialog(true);
  };

  const saveNote = () => {
    alert(`Adding note to ${selectedItem?.item_name_at_order}: ${additionalNote}`);
    setShowAddNoteDialog(false);
    setSelectedItem(null);
    setAdditionalNote('');
  };

  const handlePrintKitchenTicket = (item: OrderItem) => {
    alert(`Printing kitchen ticket for ${item.item_name_at_order}`);
  };

  const handleRequestBill = () => {
    alert('Creating request bill action for cashier');
  };

  const itemsByStatus = {
    cooking: mockOrder.items?.filter((i) => i.status === 'Cooking') || [],
    ready: mockOrder.items?.filter((i) => i.status === 'Ready') || [],
    served: mockOrder.items?.filter((i) => i.status === 'Served') || [],
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Order #{mockOrder.order_id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            View and manage order details
          </p>
        </div>
        <StatusBadge status={mockOrder.status} className="text-base" />
      </div>

      {/* Order Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-sm">Table</p>
              <div className="mt-1 flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                <p className="font-semibold">{mockOrder.session?.table?.table_number}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Guest</p>
              <div className="mt-1 flex items-center gap-2">
                <User className="h-4 w-4" />
                <p className="font-semibold">{mockOrder.session?.guest_name || 'Walk-in'}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Created</p>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <p className="font-semibold">{getTimeSince(mockOrder.created_at)}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Confirmed by</p>
              <div className="mt-1 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <p className="font-semibold">{mockOrder.staff_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {mockOrder.notes && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              <strong>Order Note:</strong> {mockOrder.notes}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items - Ready to Serve */}
      {itemsByStatus.ready.length > 0 && (
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-success">Ready to Serve</CardTitle>
              <Badge variant="success">{itemsByStatus.ready.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsByStatus.ready.map((item) => (
                <Card key={item.order_item_id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.item_name_at_order}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {item.quantity}x {item.item_name_at_order}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              ${(item.quantity * item.price_at_order).toFixed(2)}
                            </p>
                          </div>
                          {item.station && (
                            <Badge variant="outline" className="text-xs">
                              {item.station}
                            </Badge>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-2 rounded bg-amber-50 p-2 text-sm text-amber-900">
                            <strong>Note:</strong> {item.notes}
                          </div>
                        )}

                        {item.allergies && item.allergies.length > 0 && (
                          <div className="mt-2 flex items-start gap-2 rounded bg-red-50 p-2 text-sm text-red-900">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                              <strong>Allergy Alert:</strong> {item.allergies.join(', ')}
                            </div>
                          </div>
                        )}

                        {item.ready_at && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            Ready {getTimeSince(item.ready_at)}
                          </p>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => handleServeItem(item)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Served
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAddNote(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items - Cooking */}
      {itemsByStatus.cooking.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-warning">Cooking</CardTitle>
              <Badge variant="warning">{itemsByStatus.cooking.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsByStatus.cooking.map((item) => (
                <Card key={item.order_item_id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.item_name_at_order}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {item.quantity}x {item.item_name_at_order}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              ${(item.quantity * item.price_at_order).toFixed(2)}
                            </p>
                          </div>
                          {item.station && (
                            <Badge variant="outline" className="text-xs">
                              {item.station}
                            </Badge>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-2 rounded bg-amber-50 p-2 text-sm text-amber-900">
                            <strong>Note:</strong> {item.notes}
                          </div>
                        )}

                        {item.cooking_started_at && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            Cooking for {getTimeSince(item.cooking_started_at)}
                          </p>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintKitchenTicket(item)}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Reprint Ticket
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAddNote(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items - Served */}
      {itemsByStatus.served.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Served</CardTitle>
              <Badge variant="secondary">{itemsByStatus.served.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsByStatus.served.map((item) => (
                <Card key={item.order_item_id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.item_name_at_order}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {item.quantity}x {item.item_name_at_order}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              ${(item.quantity * item.price_at_order).toFixed(2)}
                            </p>
                          </div>
                          <Badge variant="success" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Served
                          </Badge>
                        </div>

                        {item.served_at && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            Served {getTimeSince(item.served_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total & Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Order Total</p>
              <p className="text-3xl font-bold">${mockOrder.total_amount?.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRequestBill}>
                Request Bill
              </Button>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serve Item Dialog */}
      <Dialog open={showServeDialog} onOpenChange={setShowServeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Served</DialogTitle>
            <DialogDescription>
              Confirm that you have served this item to the customer
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="py-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold">
                    {selectedItem.quantity}x {selectedItem.item_name_at_order}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    ${(selectedItem.quantity * selectedItem.price_at_order).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmServeItem}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Served
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Item</DialogTitle>
            <DialogDescription>
              Add or update notes for {selectedItem?.item_name_at_order}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-note">Note</Label>
              <Textarea
                id="item-note"
                placeholder="Add special instructions or notes..."
                value={additionalNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setAdditionalNote(e.target.value)
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
