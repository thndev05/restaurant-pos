import type { FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiEdit } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import { SearchBar, Button } from '../components/common';
import type { Customer } from '../types';
import { formatCurrency, formatDate } from '../utils';

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ahmed Aly',
    phone: '01254876329',
    address: '1901 Thornridge...',
    numberOfOrders: 44,
    lastActivity: '2024-01-04',
    totalSpend: 4566000,
  },
  {
    id: '2',
    name: 'John Smith',
    phone: '01234567890',
    address: '2345 Main Street...',
    numberOfOrders: 23,
    lastActivity: '2024-02-15',
    totalSpend: 2340000,
  },
];

const CustomersPage: FC = () => {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  return (
    <MainLayout>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-text-dark text-3xl font-bold">Customers</h1>
          <div className="flex items-center gap-4">
            <SearchBar
              placeholder="Search customers here..."
              onSearch={setSearchQuery}
              className="w-80"
            />
            <Button>
              <FiPlus /> Add new customer
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === 'all' ? 'bg-primary text-white' : 'text-text-gray hover:text-text-dark'
            }`}
          >
            All customers
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-primary text-white'
                : 'text-text-gray hover:text-text-dark'
            }`}
          >
            Recent customers
          </button>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-border border-b bg-gray-50">
                <tr>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Mobile number
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Address
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Number of orders
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Last activity
                  </th>
                  <th className="text-text-dark px-6 py-4 text-left text-sm font-semibold">
                    Total spend
                  </th>
                  <th className="text-text-dark px-6 py-4 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-gray-50">
                    <td className="text-text-dark px-6 py-4 text-sm">{customer.name}</td>
                    <td className="text-text-gray px-6 py-4 text-sm">{customer.phone}</td>
                    <td className="text-text-gray px-6 py-4 text-sm">{customer.address}</td>
                    <td className="text-text-gray px-6 py-4 text-sm">{customer.numberOfOrders}</td>
                    <td className="text-text-gray px-6 py-4 text-sm">
                      {formatDate(customer.lastActivity)}
                    </td>
                    <td className="text-text-dark px-6 py-4 text-sm font-medium">
                      {formatCurrency(customer.totalSpend)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-text-gray hover:text-primary transition-colors">
                          <FiEdit size={18} />
                        </button>
                        <Button size="sm">Make order</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomersPage;
