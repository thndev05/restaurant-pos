import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Edit, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react';
import { usersService, rolesService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import AddStaffDialog from '@/components/staff/AddStaffDialog';
import EditStaffDialog from '@/components/staff/EditStaffDialog';
import DeleteConfirmDialog from '@/components/staff/DeleteConfirmDialog';

// Role type matching backend enum
type RoleName = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';

interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  description?: string;
}

interface Staff {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

const roles: Array<'All' | RoleName> = ['All', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN'];

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All' | RoleName>('All');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await rolesService.getRoles();
        setRolesList(roles);
      } catch (err) {
        console.error('Error fetching roles:', err);
        // Fallback to extracting from staff list if API fails
      }
    };
    fetchRoles();
  }, []);

  // Extract unique roles from fetched staff as fallback
  useEffect(() => {
    if (rolesList.length === 0 && staffList.length > 0) {
      const uniqueRoles = Array.from(
        new Map(staffList.map((staff) => [staff.role.id, staff.role])).values()
      );
      setRolesList(uniqueRoles);
    }
  }, [staffList, rolesList.length]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await usersService.getAllUsers(searchQuery || undefined);
      setStaffList(users);
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage =
        error?.response?.status === 401
          ? 'You are not authorized. Please login again.'
          : error?.response?.data?.message || 'Failed to load staff members';

      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  const handleAddStaff = async (data: {
    name: string;
    username: string;
    password: string;
    roleId: string;
  }) => {
    // Use the new POST /users endpoint with roleId
    await usersService.createUser(data);
  };

  const handleUpdateStaff = async (id: string, data: { name?: string; roleId?: string }) => {
    await usersService.updateUser(id, data);
  };

  const handleEditClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = async (staff: Staff) => {
    try {
      const newStatus = !staff.isActive;
      await usersService.updateUser(staff.id, { isActive: newStatus });

      // Update local state
      setStaffList((prevStaff) =>
        prevStaff.map((s) => (s.id === staff.id ? { ...s, isActive: newStatus } : s))
      );

      toast({
        title: 'Success',
        description: `Staff member ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage =
        error?.response?.status === 401
          ? 'You are not authorized. Please login again.'
          : error?.response?.data?.message || 'Failed to update staff status. Please try again.';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error updating staff status:', err);
    }
  };

  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;

    try {
      setDeleting(true);
      await usersService.delete(selectedStaff.id);

      // Remove from local state
      setStaffList((prevStaff) => prevStaff.filter((s) => s.id !== selectedStaff.id));

      toast({
        title: 'Success',
        description: 'Staff member deleted successfully.',
      });

      setDeleteDialogOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage =
        error?.response?.status === 401
          ? 'You are not authorized. Please login again.'
          : error?.response?.data?.message || 'Failed to delete staff member. Please try again.';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error deleting staff:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadgeColor = (roleName: RoleName) => {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-purple-500';
      case 'MANAGER':
        return 'bg-blue-500';
      case 'WAITER':
        return 'bg-green-500';
      case 'KITCHEN':
        return 'bg-orange-500';
      case 'CASHIER':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Filter by role only (search is handled by API)
  const filteredStaff = staffList.filter((staff) => {
    const matchesRole = selectedRole === 'All' || staff.role.name === selectedRole;
    return matchesRole;
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
        <AddStaffDialog roles={rolesList} onStaffAdded={fetchUsers} onAddStaff={handleAddStaff} />
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search staff by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={loading}
        />
      </div>

      {/* Role Filter Tabs */}
      <Tabs
        value={selectedRole}
        onValueChange={(value) => setSelectedRole(value as 'All' | RoleName)}
      >
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {roles.map((role) => (
            <TabsTrigger key={role} value={role} className="text-xs sm:text-sm">
              {role}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedRole} className="mt-4 sm:mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchUsers}>Retry</Button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No staff members found.</p>
            </div>
          ) : (
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
                            <h3 className="truncate text-sm font-bold sm:text-base">
                              {staff.name}
                            </h3>
                            <Badge className={`${getRoleBadgeColor(staff.role.name)} text-xs`}>
                              {staff.role.displayName}
                            </Badge>
                          </div>
                        </div>
                        {staff.isActive ? (
                          <Badge className="shrink-0 bg-green-500 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <div className="text-muted-foreground space-y-0.5 text-xs sm:space-y-1 sm:text-sm">
                        <p className="truncate">👤 {staff.username}</p>
                        <p className="truncate">
                          📅 Joined: {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="truncate">
                          🔄 Updated: {new Date(staff.updatedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      <div className="flex gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 px-2 text-xs sm:px-3 sm:text-sm"
                          onClick={() => handleToggleStatus(staff)}
                          disabled={loading}
                        >
                          {staff.isActive ? (
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 sm:px-3"
                          onClick={() => handleEditClick(staff)}
                          disabled={loading}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 sm:px-3"
                          onClick={() => handleDeleteClick(staff)}
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Staff Dialog */}
      <EditStaffDialog
        staff={selectedStaff}
        roles={rolesList}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onStaffUpdated={fetchUsers}
        onUpdateStaff={handleUpdateStaff}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        staffName={selectedStaff?.name || ''}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
