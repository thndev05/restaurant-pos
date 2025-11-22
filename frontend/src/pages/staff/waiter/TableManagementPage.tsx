import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSessionDialog } from '@/components/staff/TableSessionDialog';
import { tablesService } from '@/lib/api/services';
import type { Table, TableStatus } from '@/lib/api/services/tables.service';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Users, Clock, RefreshCw, Settings, ChevronRight } from 'lucide-react';

const TABLE_STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    icon: '✓',
  },
  OCCUPIED: {
    label: 'Occupied',
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    icon: '◉',
  },
  RESERVED: {
    label: 'Reserved',
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    icon: '◐',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    icon: '✕',
  },
} as const;

export default function TableManagementPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'ALL'>('ALL');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await tablesService.getTables(statusFilter !== 'ALL' ? statusFilter : undefined);
      setTables(data);

      // Update selectedTable if it exists to reflect new data
      setSelectedTable((prev) => {
        if (prev) {
          const updatedTable = data.find((t) => t.id === prev.id);
          return updatedTable || prev;
        }
        return prev;
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      searchQuery === '' ||
      table.number.toString().includes(searchQuery) ||
      table.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const groupedTables = {
    AVAILABLE: filteredTables.filter((t) => t.status === 'AVAILABLE'),
    OCCUPIED: filteredTables.filter((t) => t.status === 'OCCUPIED'),
    RESERVED: filteredTables.filter((t) => t.status === 'RESERVED'),
    OUT_OF_SERVICE: filteredTables.filter((t) => t.status === 'OUT_OF_SERVICE'),
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setSessionDialogOpen(true);
  };

  const handleSessionUpdate = () => {
    loadTables();
  };

  const getSessionInfo = (table: Table) => {
    const activeSession = table.sessions?.[0];
    if (!activeSession) return null;

    const orderCount = activeSession.orders.length;
    const totalItems = activeSession.orders.reduce(
      (sum, order) => sum + order.orderItems.length,
      0
    );

    return { activeSession, orderCount, totalItems };
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const TableCard = ({ table }: { table: Table }) => {
    const statusConfig = TABLE_STATUS_CONFIG[table.status];
    const sessionInfo = getSessionInfo(table);

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg ${
          table.status === 'OCCUPIED' ? 'ring-2 ring-red-200' : ''
        }`}
        onClick={() => handleTableClick(table)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Table {table.number}</CardTitle>
              {table.location && <p className="text-muted-foreground text-sm">{table.location}</p>}
            </div>
            <Badge className={statusConfig.color} variant="outline">
              {statusConfig.icon} {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium">{table.capacity} guests</span>
          </div>

          {sessionInfo && (
            <>
              <div className="bg-muted h-px" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {formatDuration(sessionInfo.activeSession.startTime)}
                  </span>
                </div>
                {sessionInfo.activeSession.customerCount && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="font-medium">{sessionInfo.activeSession.customerCount}</span>
                  </div>
                )}
                <div className="bg-primary/10 rounded-md p-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {sessionInfo.orderCount} {sessionInfo.orderCount === 1 ? 'Order' : 'Orders'}
                    </span>
                    <span className="text-muted-foreground">
                      {sessionInfo.totalItems} {sessionInfo.totalItems === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleTableClick(table);
            }}
          >
            {table.status === 'OCCUPIED' ? 'Manage Session' : 'View Details'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all restaurant tables and sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTables} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupedTables.AVAILABLE.length}</div>
            <p className="text-muted-foreground text-xs">Ready for guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupedTables.OCCUPIED.length}</div>
            <p className="text-muted-foreground text-xs">Currently serving</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupedTables.RESERVED.length}</div>
            <p className="text-muted-foreground text-xs">Upcoming reservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupedTables.OUT_OF_SERVICE.length}</div>
            <p className="text-muted-foreground text-xs">Under maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by table number or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as TableStatus | 'ALL')}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tables</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="OCCUPIED">Occupied</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tables Grid */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredTables.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({groupedTables.AVAILABLE.length})</TabsTrigger>
          <TabsTrigger value="occupied">Occupied ({groupedTables.OCCUPIED.length})</TabsTrigger>
          <TabsTrigger value="reserved">Reserved ({groupedTables.RESERVED.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="text-muted-foreground mx-auto h-8 w-8 animate-spin" />
              <p className="text-muted-foreground mt-2">Loading tables...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="py-12 text-center">
              <Settings className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-4">No tables found</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {groupedTables.AVAILABLE.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No available tables</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groupedTables.AVAILABLE.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="occupied" className="space-y-4">
          {groupedTables.OCCUPIED.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No occupied tables</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groupedTables.OCCUPIED.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reserved" className="space-y-4">
          {groupedTables.RESERVED.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No reserved tables</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groupedTables.RESERVED.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Dialog */}
      <TableSessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        table={selectedTable}
        onSessionUpdate={handleSessionUpdate}
      />
    </div>
  );
}
