import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TableCard } from '@/components/staff/TableCard';
import { StatusBadge } from '@/components/staff/StatusBadge';
import type { Table, TakeawayOrder } from '@/types/staff';
import { Search, Package, Clock, Plus, Phone, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function WaiterDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showTakeawayDialog, setShowTakeawayDialog] = useState(false);
  const [newTakeaway, setNewTakeaway] = useState({
    customerName: '',
    customerPhone: '',
    pickupTime: '',
    notes: '',
  });

  // Mock data - will be replaced with API calls
  const tables: Table[] = [
    {
      table_id: '1',
      table_number: 'A1',
      capacity: 4,
      status: 'Available',
      qr_code_key: 'qr1',
      area: 'Main Hall',
    },
    {
      table_id: '2',
      table_number: 'A2',
      capacity: 2,
      status: 'Occupied',
      qr_code_key: 'qr2',
      area: 'Main Hall',
      session: {
        session_id: 's1',
        table_id: '2',
        start_time: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'Active',
        guest_name: 'John Doe',
        party_size: 2,
        orders: [
          {
            order_id: 'o1',
            session_id: 's1',
            status: 'Pending',
            order_type: 'DineIn',
            created_at: new Date().toISOString(),
            items: [
              {
                order_item_id: 'oi1',
                order_id: 'o1',
                item_id: 'i1',
                item_name_at_order: 'Beef Steak',
                quantity: 2,
                price_at_order: 25.99,
                status: 'Pending',
              },
            ],
          },
        ],
      },
    },
    {
      table_id: '3',
      table_number: 'A3',
      capacity: 6,
      status: 'Occupied',
      qr_code_key: 'qr3',
      area: 'Main Hall',
      session: {
        session_id: 's2',
        table_id: '3',
        start_time: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'Active',
        party_size: 4,
        orders: [
          {
            order_id: 'o2',
            session_id: 's2',
            status: 'Confirmed',
            order_type: 'DineIn',
            created_at: new Date().toISOString(),
            items: [
              {
                order_item_id: 'oi2',
                order_id: 'o2',
                item_id: 'i2',
                item_name_at_order: 'Salmon',
                quantity: 1,
                price_at_order: 22.99,
                status: 'Ready',
              },
            ],
          },
        ],
      },
    },
    {
      table_id: '4',
      table_number: 'B1',
      capacity: 4,
      status: 'Reserved',
      qr_code_key: 'qr4',
      area: 'Patio',
    },
    {
      table_id: '5',
      table_number: 'B2',
      capacity: 2,
      status: 'Available',
      qr_code_key: 'qr5',
      area: 'Patio',
    },
  ];

  const takeawayOrders: TakeawayOrder[] = [
    {
      takeaway_id: 't1',
      order_id: 'o10',
      customer_name: 'Alice Johnson',
      customer_phone: '+1234567890',
      pickup_time: new Date(Date.now() + 30 * 60000).toISOString(),
      status: 'Pending',
      otp_code: '1234',
    },
    {
      takeaway_id: 't2',
      order_id: 'o11',
      customer_name: 'Bob Smith',
      customer_phone: '+1234567891',
      pickup_time: new Date(Date.now() + 15 * 60000).toISOString(),
      status: 'ReadyForPickup',
      otp_code: '5678',
    },
  ];

  const areas = ['all', 'Main Hall', 'Patio', 'VIP Room'];
  const statuses = ['all', 'Available', 'Occupied', 'Reserved'];

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.table_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || table.area === selectedArea;
    const matchesStatus = selectedStatus === 'all' || table.status === selectedStatus;
    return matchesSearch && matchesArea && matchesStatus;
  });

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'Available').length,
    occupied: tables.filter((t) => t.status === 'Occupied').length,
    reserved: tables.filter((t) => t.status === 'Reserved').length,
    pendingOrders: tables.reduce(
      (sum, t) => sum + (t.session?.orders?.filter((o) => o.status === 'Pending').length || 0),
      0
    ),
    readyItems: tables.reduce(
      (sum, t) =>
        sum +
        (t.session?.orders?.reduce(
          (orderSum, o) => orderSum + (o.items?.filter((i) => i.status === 'Ready').length || 0),
          0
        ) || 0),
      0
    ),
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowTableDialog(true);
  };

  const handleCloseSession = () => {
    // TODO: Implement close session
    alert('Close session functionality will be implemented with API integration');
    setShowTableDialog(false);
  };

  const handleCancelSession = () => {
    // TODO: Implement cancel session
    alert('Cancel session functionality will be implemented with API integration');
    setShowTableDialog(false);
  };

  const handleCreateTakeaway = () => {
    // TODO: Implement API call to create takeaway order
    console.log('Creating takeaway order:', newTakeaway);
    alert(`Takeaway order created for ${newTakeaway.customerName}`);
    setShowTakeawayDialog(false);
    setNewTakeaway({
      customerName: '',
      customerPhone: '',
      pickupTime: '',
      notes: '',
    });
  };

  const handleTakeawayInputChange = (field: keyof typeof newTakeaway, value: string) => {
    setNewTakeaway((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Waiter Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Monitor tables, sessions, and manage orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-success text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-warning text-2xl font-bold">{stats.occupied}</div>
          </CardContent>
        </Card>
        <Card className="border-info/30 bg-info/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-info text-2xl font-bold">{stats.reserved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Alerts */}
      {(stats.pendingOrders > 0 || stats.readyItems > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.pendingOrders > 0 && (
            <Card className="border-amber-500/30 bg-amber-50">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">
                    {stats.pendingOrders} Pending Order{stats.pendingOrders > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-amber-700">Require confirmation</p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.readyItems > 0 && (
            <Card className="border-blue-500/30 bg-blue-50">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">
                    {stats.readyItems} Item{stats.readyItems > 1 ? 's' : ''} Ready
                  </p>
                  <p className="text-xs text-blue-700">Ready to serve</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="takeaway">
            Takeaway
            {takeawayOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {takeawayOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tables View */}
        <TabsContent value="tables" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search table number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    {areas.map((area) => (
                      <option key={area} value={area}>
                        {area === 'all' ? 'All Areas' : area}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Status' : status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tables Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTables.map((table) => (
              <TableCard
                key={table.table_id}
                table={table}
                onClick={() => handleTableClick(table)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Takeaway View */}
        <TabsContent value="takeaway" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowTakeawayDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Takeaway
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {takeawayOrders.map((order) => (
              <Card key={order.takeaway_id} className="hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{order.customer_name}</CardTitle>
                      <p className="text-muted-foreground text-xs">{order.customer_phone}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.pickup_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span>Pickup: {new Date(order.pickup_time).toLocaleTimeString()}</span>
                    </div>
                  )}
                  {order.otp_code && (
                    <div className="rounded-md bg-slate-100 p-2">
                      <p className="text-muted-foreground text-xs">OTP Code</p>
                      <p className="font-mono text-lg font-bold">{order.otp_code}</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full" size="sm">
                    <Package className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Takeaway Dialog */}
      <Dialog open={showTakeawayDialog} onOpenChange={setShowTakeawayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Takeaway Order</DialogTitle>
            <DialogDescription>Enter customer information for the takeaway order</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                <User className="mr-2 inline h-4 w-4" />
                Customer Name *
              </Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={newTakeaway.customerName}
                onChange={(e) => handleTakeawayInputChange('customerName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">
                <Phone className="mr-2 inline h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="Enter phone number"
                value={newTakeaway.customerPhone}
                onChange={(e) => handleTakeawayInputChange('customerPhone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupTime">
                <Clock className="mr-2 inline h-4 w-4" />
                Pickup Time
              </Label>
              <Input
                id="pickupTime"
                type="datetime-local"
                value={newTakeaway.pickupTime}
                onChange={(e) => handleTakeawayInputChange('pickupTime', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special instructions or notes..."
                value={newTakeaway.notes}
                onChange={(e) => handleTakeawayInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowTakeawayDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateTakeaway}
                disabled={!newTakeaway.customerName || !newTakeaway.customerPhone}
              >
                Create Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Detail Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Table {selectedTable?.table_number} - {selectedTable?.status}
            </DialogTitle>
            <DialogDescription>Manage table session and orders</DialogDescription>
          </DialogHeader>

          {selectedTable?.session ? (
            <div className="space-y-4">
              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Session Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {selectedTable.session.guest_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guest:</span>
                      <span className="font-medium">{selectedTable.session.guest_name}</span>
                    </div>
                  )}
                  {selectedTable.session.party_size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Party Size:</span>
                      <span className="font-medium">{selectedTable.session.party_size} guests</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="font-medium">
                      {new Date(selectedTable.session.start_time).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Orders */}
              {selectedTable.session.orders && selectedTable.session.orders.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Orders</h4>
                  <div className="space-y-2">
                    {selectedTable.session.orders.map((order) => (
                      <Card key={order.order_id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Order #{order.order_id.slice(0, 8)}</p>
                              <p className="text-muted-foreground text-xs">
                                {order.items?.length || 0} items
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Edit Session
                </Button>
                <Button variant="outline" className="flex-1">
                  Add Order
                </Button>
                <Button variant="default" className="flex-1" onClick={handleCloseSession}>
                  Proceed to Payment
                </Button>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleCancelSession}>
                Cancel Session
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No active session for this table</p>
              <Button>Start New Session</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
