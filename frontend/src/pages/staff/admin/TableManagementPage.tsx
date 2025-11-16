import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, Edit, Trash2 } from 'lucide-react';

interface Table {
  id: string;
  number: number;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: string;
}

const sections = ['Main Floor', 'Patio', 'Private Room', 'Bar Area'];

export default function TableManagementPage() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const [tables, setTables] = useState<Table[]>([
    { id: '1', number: 1, capacity: 4, section: 'Main Floor', status: 'available' },
    {
      id: '2',
      number: 2,
      capacity: 2,
      section: 'Main Floor',
      status: 'occupied',
      currentOrder: '#001',
    },
    { id: '3', number: 3, capacity: 6, section: 'Main Floor', status: 'reserved' },
    { id: '4', number: 4, capacity: 4, section: 'Main Floor', status: 'available' },
    { id: '5', number: 5, capacity: 8, section: 'Private Room', status: 'reserved' },
    { id: '6', number: 6, capacity: 2, section: 'Patio', status: 'available' },
    { id: '7', number: 7, capacity: 4, section: 'Patio', status: 'occupied', currentOrder: '#002' },
    { id: '8', number: 8, capacity: 2, section: 'Bar Area', status: 'available' },
  ]);

  const handleShowQR = (table: Table) => {
    setSelectedTable(table);
    setShowQRDialog(true);
  };

  const handleDelete = (tableId: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      setTables((tables) => tables.filter((t) => t.id !== tableId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-red-500">Occupied</Badge>;
      case 'reserved':
        return <Badge className="bg-yellow-500">Reserved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Table Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage restaurant tables and seating arrangements
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Table
        </Button>
      </div>

      {/* Tables by Section */}
      {sections.map((section) => {
        const sectionTables = tables.filter((t) => t.section === section);
        if (sectionTables.length === 0) return null;

        return (
          <div key={section} className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-semibold sm:text-xl">{section}</h2>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {sectionTables.map((table) => (
                <Card key={table.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold sm:text-xl">Table {table.number}</h3>
                        {getStatusBadge(table.status)}
                      </div>
                      <div className="text-muted-foreground text-xs sm:text-sm">
                        <p>Capacity: {table.capacity} people</p>
                        {table.currentOrder && (
                          <p className="text-primary font-semibold">Order: {table.currentOrder}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 px-2 text-xs sm:px-3 sm:text-sm"
                          onClick={() => handleShowQR(table)}
                        >
                          <QrCode className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">QR</span>
                        </Button>
                        <Button variant="outline" size="sm" className="px-2 sm:px-3">
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 sm:px-3"
                          onClick={() => handleDelete(table.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-base sm:text-lg">
              QR Code - Table {selectedTable?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-3 py-4 sm:space-y-4">
            {selectedTable && (
              <>
                <QRCodeSVG
                  value={`${window.location.origin}/customer/table/${selectedTable.id}`}
                  size={window.innerWidth < 640 ? 200 : 256}
                  level="H"
                  includeMargin
                />
                <p className="text-muted-foreground text-center text-xs sm:text-sm">
                  Scan this QR code to access the menu for Table {selectedTable.number}
                </p>
                <Button className="w-full">Download QR Code</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
