import type { FC } from 'react';
import { useState } from 'react';
import { AdminLayout } from '../../layouts/admin';
import { Card, Button, Input, Modal, Badge } from '../../components/common';
import { FiPlus, FiEdit2, FiTrash2, FiPrinter } from 'react-icons/fi';
import { MdQrCode2 } from 'react-icons/md';
import QRCode from 'react-qr-code';
import type { Table } from '../../types';

const TableManagementPage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);

  // Mock tables data
  const [tables, setTables] = useState<Table[]>([
    { id: '1', number: 'A1', status: 'available', capacity: 4 },
    { id: '2', number: 'A2', status: 'occupied', capacity: 4 },
    { id: '3', number: 'A3', status: 'reserved', capacity: 2 },
    { id: '4', number: 'B1', status: 'available', capacity: 6 },
    { id: '5', number: 'B2', status: 'occupied', capacity: 6 },
    { id: '6', number: 'B3', status: 'available', capacity: 8 },
    { id: '7', number: 'C1', status: 'available', capacity: 4 },
    { id: '8', number: 'C2', status: 'reserved', capacity: 2 },
  ]);

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleDelete = (tableId: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      setTables((items) => items.filter((table) => table.id !== tableId));
    }
  };

  const handleAddNew = () => {
    setEditingTable(null);
    setIsModalOpen(true);
  };

  const handleShowQR = (table: Table) => {
    setSelectedTableForQR(table);
    setQrModalOpen(true);
  };

  const handlePrintQR = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'danger';
      case 'reserved':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Group tables by prefix (A, B, C, etc.)
  const groupedTables = tables.reduce(
    (acc, table) => {
      const prefix = table.number.charAt(0);
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      acc[prefix].push(table);
      return acc;
    },
    {} as Record<string, Table[]>
  );

  return (
    <AdminLayout>
      <div className="bg-background flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-text-dark mb-2 text-3xl font-bold">Table Management</h1>
              <p className="text-text-gray text-sm">
                Manage restaurant tables and generate QR codes
              </p>
            </div>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <FiPlus size={18} />
              Add New Table
            </Button>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="border-primary/20 bg-primary/5">
              <div className="text-center">
                <p className="text-primary text-3xl font-bold">{tables.length}</p>
                <p className="text-text-gray mt-1 text-sm">Total Tables</p>
              </div>
            </Card>
            <Card className="border-success/20 bg-success/5">
              <div className="text-center">
                <p className="text-success text-3xl font-bold">
                  {tables.filter((t) => t.status === 'available').length}
                </p>
                <p className="text-text-gray mt-1 text-sm">Available</p>
              </div>
            </Card>
            <Card className="border-danger/20 bg-danger/5">
              <div className="text-center">
                <p className="text-danger text-3xl font-bold">
                  {tables.filter((t) => t.status === 'occupied').length}
                </p>
                <p className="text-text-gray mt-1 text-sm">Occupied</p>
              </div>
            </Card>
            <Card className="border-warning/20 bg-warning/5">
              <div className="text-center">
                <p className="text-warning text-3xl font-bold">
                  {tables.filter((t) => t.status === 'reserved').length}
                </p>
                <p className="text-text-gray mt-1 text-sm">Reserved</p>
              </div>
            </Card>
          </div>

          {/* Tables by Section */}
          {Object.entries(groupedTables).map(([section, sectionTables]) => (
            <div key={section} className="mb-8">
              <h2 className="text-text-dark mb-4 text-xl font-bold">Section {section}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {sectionTables.map((table) => (
                  <Card key={table.id} className="transition-shadow hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-text-dark mb-2 text-xl font-bold">
                          Table {table.number}
                        </h3>
                        <p className="text-text-gray mb-3 text-sm">
                          Capacity: {table.capacity} people
                        </p>
                        <Badge variant={getStatusColor(table.status)}>
                          {getStatusLabel(table.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleShowQR(table)}
                          className="text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg transition-all"
                          title="View QR Code"
                        >
                          <MdQrCode2 size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(table)}
                          className="text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg transition-all"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(table.id)}
                          className="text-danger hover:bg-danger/10 flex h-8 w-8 items-center justify-center rounded-lg transition-all"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTable ? 'Edit Table' : 'Add New Table'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Table Number</label>
            <Input type="text" placeholder="e.g., A1, B2, C3" defaultValue={editingTable?.number} />
          </div>

          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Capacity</label>
            <Input
              type="number"
              placeholder="Number of people"
              defaultValue={editingTable?.capacity}
              min={1}
            />
          </div>

          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Status</label>
            <select
              className="text-text-dark border-background focus:border-primary w-full rounded-lg border bg-white px-4 py-3 transition-all outline-none"
              defaultValue={editingTable?.status || 'available'}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              {editingTable ? 'Update' : 'Create'} Table
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={`QR Code - Table ${selectedTableForQR?.number}`}
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="border-text-dark flex h-64 w-64 items-center justify-center rounded-lg border-2 bg-white">
              {selectedTableForQR ? (
                <QRCode
                  value={`https://restaurant.com/order?table=${selectedTableForQR.id}`}
                  size={160}
                  viewBox={`0 0 160 160`}
                />
              ) : (
                <div className="text-center">
                  <MdQrCode2 size={120} className="text-text-gray mx-auto mb-4" />
                  <p className="text-text-dark font-medium">No table selected</p>
                </div>
              )}
            </div>

            <p className="text-text-gray mt-4 text-center text-sm break-words">
              URL:{' '}
              {selectedTableForQR
                ? `https://restaurant.com/order?table=${selectedTableForQR.id}`
                : ''}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setQrModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintQR} className="flex items-center gap-2">
              <FiPrinter size={18} />
              Print QR Code
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default TableManagementPage;
