import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableCard } from '@/components/staff/TableCard';
import { TableSessionDialog } from '@/components/staff/TableSessionDialog';
import { tablesService } from '@/lib/api/services';
import type { Table as ApiTable } from '@/lib/api/services/tables.service';
import type { Table } from '@/types/staff';
import { useToast } from '@/hooks/use-toast';
import { CreateOrderDialog } from '@/components/staff/CreateOrderDialog';
import { Search, RefreshCw, AlertCircle, CheckCircle2, BarChart3, Plus } from 'lucide-react';

// Helper function to convert API table to staff type
const convertApiTableToStaffTable = (apiTable: ApiTable): Table => {
  const activeSession = apiTable.sessions?.[0];

  return {
    table_id: apiTable.id,
    table_number: apiTable.number.toString(),
    capacity: apiTable.capacity,
    status:
      apiTable.status === 'AVAILABLE'
        ? 'Available'
        : apiTable.status === 'OCCUPIED'
          ? 'Occupied'
          : 'Reserved',
    qr_code_key: apiTable.qrCodeKey,
    area: apiTable.location,
    session: activeSession
      ? {
          session_id: activeSession.id,
          table_id: apiTable.id,
          start_time: activeSession.startTime,
          end_time: activeSession.endTime,
          status:
            activeSession.status === 'ACTIVE'
              ? 'Active'
              : activeSession.status === 'PAID'
                ? 'Paid'
                : 'Closed',
          party_size: activeSession.customerCount,
          orders: activeSession.orders?.map((order) => ({
            order_id: order.id,
            session_id: activeSession.id,
            status:
              order.status === 'PENDING'
                ? 'Pending'
                : order.status === 'CONFIRMED'
                  ? 'Confirmed'
                  : 'Cancelled',
            order_type: 'DineIn',
            created_at: order.createdAt,
            items: order.orderItems?.map((item) => ({
              order_item_id: item.id,
              order_id: order.id,
              item_id: item.menuItem?.id || '',
              item_name_at_order: item.itemNameAtOrder,
              quantity: item.quantity,
              price_at_order: item.priceAtOrder,
              status:
                item.status === 'PENDING'
                  ? 'Pending'
                  : item.status === 'COOKING'
                    ? 'Cooking'
                    : item.status === 'READY'
                      ? 'Ready'
                      : 'Served',
              notes: item.notes,
            })),
          })),
        }
      : undefined,
  };
};

export default function WaiterDashboardPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<ApiTable | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await tablesService.getTables();
      const convertedTables = data.map(convertApiTableToStaffTable);
      setTables(convertedTables);

      // Update selected table if it exists
      if (selectedTable) {
        const updatedTable = data.find((t) => t.id === selectedTable.id);
        if (updatedTable) {
          setSelectedTable(updatedTable);
        }
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tables',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
    // Refresh data every 30 seconds
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statuses = ['all', 'Available', 'Occupied', 'Reserved'];

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || table.status === selectedStatus;
    return matchesSearch && matchesStatus;
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

  const handleTableClick = async (table: Table) => {
    try {
      // Fetch fresh table data
      const freshTableData = await tablesService.getTableById(table.table_id);
      setSelectedTable(freshTableData);
      setShowTableDialog(true);
    } catch (error) {
      console.error('Failed to load table details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load table details',
        variant: 'destructive',
      });
    }
  };

  const handleSessionUpdate = () => {
    loadTables();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of tables, sessions, and orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
          <Button variant="outline" size="sm" onClick={loadTables} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Total Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">All restaurant tables</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.available}</div>
            <p className="text-xs text-green-600">Ready for guests</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.occupied}</div>
            <p className="text-xs text-red-600">Currently serving</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.reserved}</div>
            <p className="text-xs text-blue-600">Upcoming reservations</p>
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
          <TabsTrigger value="tables">
            All Tables
            <Badge variant="secondary" className="ml-2">
              {filteredTables.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tables View */}
        <TabsContent value="tables" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by table number or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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

          {/* Tables Grid */}
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="text-muted-foreground mx-auto h-8 w-8 animate-spin" />
              <p className="text-muted-foreground mt-2">Loading tables...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <BarChart3 className="text-muted-foreground mx-auto h-12 w-12 opacity-20" />
                <h3 className="mt-4 text-lg font-semibold">No tables found</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No tables available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTables.map((table) => (
                <TableCard
                  key={table.table_id}
                  table={table}
                  onClick={() => handleTableClick(table)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onOrderCreated={loadTables}
      />

      {/* Table Session Dialog */}
      <TableSessionDialog
        open={showTableDialog}
        onOpenChange={setShowTableDialog}
        table={selectedTable}
        onSessionUpdate={handleSessionUpdate}
      />
    </div>
  );
}
