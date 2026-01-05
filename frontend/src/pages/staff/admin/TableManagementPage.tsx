import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus,
  QrCode,
  Edit,
  Trash2,
  Loader2,
  Download,
  Search,
  Eye,
  Users,
  Clock,
  RefreshCw,
  Settings,
  Copy,
} from 'lucide-react';
import { tablesService, type Table } from '@/lib/api/services/tables.service';
import { TableFormDialog, type TableFormData } from '@/components/staff/TableFormDialog';
import { TableSessionDialog } from '@/components/staff/TableSessionDialog';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [_qrToken, _setQrToken] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedTableForEdit, setSelectedTableForEdit] = useState<Table | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedTableIdRef = useRef<string | null>(null);

  // Update ref when selectedTable changes
  useEffect(() => {
    selectedTableIdRef.current = selectedTable?.id || null;
  }, [selectedTable]);

  const loadTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tablesService.getTables();

      setTables(data);

      // Update selectedTable if it exists to reflect new data
      const currentSelectedId = selectedTableIdRef.current;
      if (currentSelectedId) {
        const updatedTable = data.find((t) => t.id === currentSelectedId);
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
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleCreateTable = async (data: TableFormData) => {
    try {
      await tablesService.createTable(data);
      toast({
        title: 'Success',
        description: 'Table created successfully',
      });
      loadTables();
    } catch (error) {
      console.error('Failed to create table:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to create table',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleEditTable = async (data: TableFormData) => {
    if (!selectedTableForEdit) return;
    try {
      await tablesService.updateTable(selectedTableForEdit.id, data);
      toast({
        title: 'Success',
        description: 'Table updated successfully',
      });
      loadTables();
    } catch (error) {
      console.error('Failed to update table:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to update table',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleShowQR = async (table: Table) => {
    setSelectedTable(table);
    try {
      const response = await tablesService.generateQrToken(table.id);
      _setQrToken(response.token);
      setQrUrl(`${window.location.origin}/t/${response.token}`);
      setShowQRDialog(true);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const handleViewSession = (table: Table) => {
    console.log('\n========== FRONTEND: VIEW SESSION DEBUG ==========');
    console.log(`Table #${table.number}:`);
    console.log(`  ID: ${table.id}`);
    console.log(`  Sessions: ${table.sessions?.length || 0}`);
    if (table.sessions && table.sessions.length > 0) {
      const session = table.sessions[0];
      console.log(`  Active Session:`);
      console.log(`    ID: ${session.id}`);
      console.log(`    Status: ${session.status}`);
      console.log(`    Orders: ${session.orders?.length || 0}`);
      if (session.orders) {
        session.orders.forEach((order, idx) => {
          console.log(`      Order ${idx + 1}:`);
          console.log(`        ID: ${order.id}`);
          console.log(`        Status: ${order.status}`);
          console.log(`        Items: ${order.orderItems?.length || 0}`);
        });
      }
    }
    console.log('==================================================\n');

    setSelectedTable(table);
    setShowSessionDialog(true);
  };

  const handleSessionDialogClose = (open: boolean) => {
    setShowSessionDialog(open);
    if (!open) {
      // Refresh data when dialog closes
      loadTables();
    }
  };

  const handleDownloadQR = () => {
    if (!selectedTable) return;

    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `table-${selectedTable.number}-qr-code.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const confirmDelete = (tableId: string) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tableToDelete) return;
    try {
      await tablesService.deleteTable(tableToDelete);
      toast({
        title: 'Success',
        description: 'Table deleted successfully',
      });
      loadTables();
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    } catch (error) {
      console.error('Failed to delete table:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to delete table',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setSelectedTableForEdit(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (table: Table) => {
    setDialogMode('edit');
    setSelectedTableForEdit(table);
    setDialogOpen(true);
  };

  // Filter tables based on search
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      searchQuery === '' ||
      table.number.toString().includes(searchQuery) ||
      table.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group tables by status for tabs
  const groupedTables = {
    AVAILABLE: filteredTables.filter((t) => t.status === 'AVAILABLE'),
    OCCUPIED: filteredTables.filter((t) => t.status === 'OCCUPIED'),
    RESERVED: filteredTables.filter((t) => t.status === 'RESERVED'),
    OUT_OF_SERVICE: filteredTables.filter((t) => t.status === 'OUT_OF_SERVICE'),
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
    const hasActiveSession = sessionInfo !== null;

    return (
      <Card
        className={`transition-all hover:shadow-lg ${
          table.status === 'OCCUPIED' ? 'ring-2 ring-red-200' : ''
        }`}
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

          <div className="flex flex-wrap gap-2">
            <Button
              variant={hasActiveSession ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => handleViewSession(table)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {hasActiveSession ? 'Manage' : 'View'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShowQR(table)}>
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => openEditDialog(table)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => confirmDelete(table.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
            Manage restaurant tables, sessions, and seating arrangements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTables} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreateDialog}>
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

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by table number or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tables Grid with Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredTables.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({groupedTables.AVAILABLE.length})</TabsTrigger>
          <TabsTrigger value="occupied">Occupied ({groupedTables.OCCUPIED.length})</TabsTrigger>
          <TabsTrigger value="reserved">Reserved ({groupedTables.RESERVED.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="text-muted-foreground mx-auto h-8 w-8 animate-spin" />
              <p className="text-muted-foreground mt-2">Loading tables...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="py-12 text-center">
              <Settings className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-4">No tables found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first table to get started'}
              </p>
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

      {/* Table Form Dialog */}
      <TableFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedTableForEdit}
        onSubmit={dialogMode === 'create' ? handleCreateTable : handleEditTable}
      />

      {/* Table Session Dialog */}
      <TableSessionDialog
        open={showSessionDialog}
        onOpenChange={handleSessionDialogClose}
        table={selectedTable}
        onSessionUpdate={loadTables}
      />

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-base sm:text-lg">
              QR Code - Table {selectedTable?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-3 py-4 sm:space-y-4">
            {selectedTable && qrUrl && (
              <>
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrUrl}
                  size={window.innerWidth < 640 ? 200 : 256}
                  level="H"
                  includeMargin
                />
                <p className="text-muted-foreground text-center text-xs sm:text-sm">
                  Scan this QR code to access the menu for Table {selectedTable.number}
                </p>

                {/* Link Display with Copy Button */}
                <div className="w-full space-y-2">
                  <label className="text-sm font-medium">Table Link:</label>
                  <div className="flex gap-2">
                    <Input value={qrUrl} readOnly className="text-xs sm:text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(qrUrl);
                        toast({
                          title: 'Link Copied',
                          description: 'Table link has been copied to clipboard',
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full" onClick={handleDownloadQR}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the table.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
