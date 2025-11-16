import type { FC } from 'react';
import { useState } from 'react';
import { AdminLayout } from '../../layouts/admin';
import { Card, Button, Input, Modal, Badge } from '../../components/common';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import type { Staff } from '../../types';
import { USER_ROLES } from '../../utils/roles';

const StaffManagementPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Mock staff data
  const [staffList, setStaffList] = useState<Staff[]>([
    {
      id: '1',
      username: 'admin',
      fullName: 'John Smith',
      role: USER_ROLES.ADMIN,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      username: 'manager01',
      fullName: 'Sarah Johnson',
      role: USER_ROLES.MANAGER,
      isActive: true,
      createdAt: '2024-02-20',
    },
    {
      id: '3',
      username: 'cashier01',
      fullName: 'Mike Davis',
      role: USER_ROLES.CASHIER,
      isActive: true,
      createdAt: '2024-03-10',
    },
    {
      id: '4',
      username: 'staff01',
      fullName: 'Emily Wilson',
      role: USER_ROLES.STAFF,
      isActive: true,
      createdAt: '2024-03-15',
    },
    {
      id: '5',
      username: 'kitchen01',
      fullName: 'David Brown',
      role: USER_ROLES.KITCHEN,
      isActive: true,
      createdAt: '2024-03-20',
    },
    {
      id: '6',
      username: 'staff02',
      fullName: 'Lisa Anderson',
      role: USER_ROLES.STAFF,
      isActive: false,
      createdAt: '2024-04-01',
    },
  ]);

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: USER_ROLES.ADMIN, label: 'Admin' },
    { value: USER_ROLES.MANAGER, label: 'Manager' },
    { value: USER_ROLES.CASHIER, label: 'Cashier' },
    { value: USER_ROLES.STAFF, label: 'Staff' },
    { value: USER_ROLES.KITCHEN, label: 'Kitchen' },
  ];

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaffList((items) => items.filter((staff) => staff.id !== staffId));
    }
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffList((items) =>
      items.map((staff) => (staff.id === staffId ? { ...staff, isActive: !staff.isActive } : staff))
    );
  };

  const getRoleBadgeVariant = (
    role: string
  ): 'success' | 'danger' | 'warning' | 'info' | 'neutral' => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'danger';
      case USER_ROLES.MANAGER:
        return 'info';
      case USER_ROLES.CASHIER:
        return 'warning';
      case USER_ROLES.KITCHEN:
        return 'success';
      default:
        return 'neutral';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Group staff by role
  const staffByRole = filteredStaff.reduce(
    (acc, staff) => {
      if (!acc[staff.role]) {
        acc[staff.role] = [];
      }
      acc[staff.role].push(staff);
      return acc;
    },
    {} as Record<string, Staff[]>
  );

  return (
    <AdminLayout>
      <div className="bg-background flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-text-dark mb-2 text-3xl font-bold">Staff Management</h1>
              <p className="text-text-gray text-sm">Manage staff accounts and assign roles</p>
            </div>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <FiPlus size={18} />
              Add New Staff
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="text-text-gray absolute top-1/2 left-3 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search staff by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="w-full md:w-48">
                <select
                  className="text-text-dark border-background focus:border-primary w-full rounded-lg border bg-white px-4 py-3 transition-all outline-none"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="border-primary/20 bg-primary/5">
              <div className="text-center">
                <p className="text-primary text-3xl font-bold">{staffList.length}</p>
                <p className="text-text-gray mt-1 text-sm">Total Staff</p>
              </div>
            </Card>
            <Card className="border-success/20 bg-success/5">
              <div className="text-center">
                <p className="text-success text-3xl font-bold">
                  {staffList.filter((s) => s.isActive).length}
                </p>
                <p className="text-text-gray mt-1 text-sm">Active</p>
              </div>
            </Card>
            <Card className="border-danger/20 bg-danger/5">
              <div className="text-center">
                <p className="text-danger text-3xl font-bold">
                  {staffList.filter((s) => !s.isActive).length}
                </p>
                <p className="text-text-gray mt-1 text-sm">Inactive</p>
              </div>
            </Card>
            <Card className="border-warning/20 bg-warning/5">
              <div className="text-center">
                <p className="text-warning text-3xl font-bold">{Object.keys(staffByRole).length}</p>
                <p className="text-text-gray mt-1 text-sm">Roles</p>
              </div>
            </Card>
          </div>

          {/* Staff Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-background border-b">
                    <th className="text-text-gray pb-3 text-left text-sm font-medium">
                      Staff Member
                    </th>
                    <th className="text-text-gray pb-3 text-left text-sm font-medium">Username</th>
                    <th className="text-text-gray pb-3 text-left text-sm font-medium">Role</th>
                    <th className="text-text-gray pb-3 text-left text-sm font-medium">Status</th>
                    <th className="text-text-gray pb-3 text-left text-sm font-medium">
                      Joined Date
                    </th>
                    <th className="text-text-gray pb-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-background border-b last:border-b-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                            <FiUser size={20} />
                          </div>
                          <span className="text-text-dark font-medium">{staff.fullName}</span>
                        </div>
                      </td>
                      <td className="text-text-gray py-4">{staff.username}</td>
                      <td className="py-4">
                        <Badge variant={getRoleBadgeVariant(staff.role)}>
                          {getRoleLabel(staff.role)}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleStatus(staff.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                            staff.isActive
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-danger/10 text-danger hover:bg-danger/20'
                          }`}
                        >
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="text-text-gray py-4">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(staff.id)}
                            className="text-danger hover:bg-danger/10 flex h-8 w-8 items-center justify-center rounded-lg transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStaff.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-text-gray text-lg">No staff members found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Full Name</label>
            <Input
              type="text"
              placeholder="Enter full name"
              defaultValue={editingStaff?.fullName}
            />
          </div>

          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Username</label>
            <Input type="text" placeholder="Enter username" defaultValue={editingStaff?.username} />
          </div>

          {!editingStaff && (
            <div>
              <label className="text-text-dark mb-2 block text-sm font-medium">Password</label>
              <Input type="password" placeholder="Enter password" />
            </div>
          )}

          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Role</label>
            <select
              className="text-text-dark border-background focus:border-primary w-full rounded-lg border bg-white px-4 py-3 transition-all outline-none"
              defaultValue={editingStaff?.role || USER_ROLES.STAFF}
            >
              <option value={USER_ROLES.ADMIN}>Admin</option>
              <option value={USER_ROLES.MANAGER}>Manager</option>
              <option value={USER_ROLES.CASHIER}>Cashier</option>
              <option value={USER_ROLES.STAFF}>Staff</option>
              <option value={USER_ROLES.KITCHEN}>Kitchen</option>
            </select>
          </div>

          <div>
            <label className="text-text-dark mb-2 block text-sm font-medium">Status</label>
            <select
              className="text-text-dark border-background focus:border-primary w-full rounded-lg border bg-white px-4 py-3 transition-all outline-none"
              defaultValue={editingStaff?.isActive ? 'active' : 'inactive'}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              {editingStaff ? 'Update' : 'Create'} Staff
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default StaffManagementPage;
