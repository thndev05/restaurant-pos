import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { SearchBar, Button } from '../components/common';
import type { Table } from '../types';

const mockTables: Table[] = Array.from({ length: 20 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: `T-${String(i + 1).padStart(2, '0')}`,
  status: ['available', 'occupied', 'reserved'][Math.floor(Math.random() * 3)] as Table['status'],
  capacity: 4,
}));

const TablesPage: FC = () => {
  const [tables] = useState<Table[]>(mockTables);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredTables = tables.filter((table) =>
    table.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-success text-white';
      case 'occupied':
        return 'bg-danger text-white';
      case 'reserved':
        return 'bg-warning text-white';
    }
  };

  return (
    <MainLayout>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-text-dark text-3xl font-bold">Tables</h1>
          <div className="flex items-center gap-4">
            <SearchBar
              placeholder="Search table here..."
              onSearch={setSearchQuery}
              className="w-80"
            />
            <Button onClick={() => navigate('/payment')}>Select & Pay</Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-success h-4 w-4 rounded-full"></div>
            <span className="text-text-gray text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-danger h-4 w-4 rounded-full"></div>
            <span className="text-text-gray text-sm">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-warning h-4 w-4 rounded-full"></div>
            <span className="text-text-gray text-sm">Reserved</span>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-full text-lg font-bold text-white ${getStatusColor(table.status)}`}
              >
                {table.number}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default TablesPage;
