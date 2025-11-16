import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager' | 'Staff' | 'Kitchen' | 'Cashier';
  status: 'active' | 'inactive';
  joinedDate: string;
  avatar?: string;
}

const roles = ['All', 'Admin', 'Manager', 'Staff', 'Kitchen', 'Cashier'];

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  const [staffList, setStaffList] = useState<Staff[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@restaurant.com',
      phone: '0123456789',
      role: 'Admin',
      status: 'active',
      joinedDate: '2023-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@restaurant.com',
      phone: '0987654321',
      role: 'Manager',
      status: 'active',
      joinedDate: '2023-02-20',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@restaurant.com',
      phone: '0123456788',
      role: 'Staff',
      status: 'active',
      joinedDate: '2023-03-10',
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.williams@restaurant.com',
      phone: '0987654322',
      role: 'Kitchen',
      status: 'active',
      joinedDate: '2023-04-05',
    },
    {
      id: '5',
      name: 'Tom Brown',
      email: 'tom.brown@restaurant.com',
      phone: '0123456787',
      role: 'Cashier',
      status: 'inactive',
      joinedDate: '2023-05-12',
    },
  ]);

  const handleToggleStatus = (staffId: string) => {
    setStaffList((staff) =>
      staff.map((s) =>
        s.id === staffId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      )
    );
  };

  const handleDelete = (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaffList((staff) => staff.filter((s) => s.id !== staffId));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500';
      case 'Manager':
        return 'bg-blue-500';
      case 'Staff':
        return 'bg-green-500';
      case 'Kitchen':
        return 'bg-orange-500';
      case 'Cashier':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || staff.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Staff Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage restaurant staff members and their roles
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Staff
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search staff by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Role Filter Tabs */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {roles.map((role) => (
            <TabsTrigger key={role} value={role} className="text-xs sm:text-sm">
              {role}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedRole} className="mt-4 sm:mt-6">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {filteredStaff.map((staff) => (
              <Card key={staff.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12">
                          <span className="text-base font-bold sm:text-lg">
                            {staff.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold sm:text-base">{staff.name}</h3>
                          <Badge className={`${getRoleBadgeColor(staff.role)} text-xs`}>
                            {staff.role}
                          </Badge>
                        </div>
                      </div>
                      {staff.status === 'active' ? (
                        <Badge className="shrink-0 bg-green-500 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="shrink-0 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <div className="text-muted-foreground space-y-0.5 text-xs sm:space-y-1 sm:text-sm">
                      <p className="truncate">📧 {staff.email}</p>
                      <p>📱 {staff.phone}</p>
                      <p>📅 Joined: {new Date(staff.joinedDate).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 px-2 text-xs sm:px-3 sm:text-sm"
                        onClick={() => handleToggleStatus(staff.id)}
                      >
                        {staff.status === 'active' ? (
                          <>
                            <UserX className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Deactivate</span>
                            <span className="sm:hidden">Off</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Activate</span>
                            <span className="sm:hidden">On</span>
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="px-2 sm:px-3">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 sm:px-3"
                        onClick={() => handleDelete(staff.id)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
