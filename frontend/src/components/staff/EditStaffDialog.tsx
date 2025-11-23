import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  displayName: string;
}

interface Staff {
  id: string;
  name: string;
  username: string;
  role: Role;
}

interface EditStaffDialogProps {
  staff: Staff | null;
  roles: Role[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffUpdated: () => void;
  onUpdateStaff: (id: string, data: { name?: string; roleId?: string }) => Promise<void>;
}

export default function EditStaffDialog({
  staff,
  roles,
  open,
  onOpenChange,
  onStaffUpdated,
  onUpdateStaff,
}: EditStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    roleId: '',
  });
  const { toast } = useToast();

  // Update form data when staff changes
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        roleId: staff.role.id,
      });
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff) return;

    // Validation
    if (!formData.name || !formData.roleId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await onUpdateStaff(staff.id, formData);

      toast({
        title: 'Success',
        description: 'Staff member updated successfully',
      });

      onOpenChange(false);
      onStaffUpdated();
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage =
        error?.response?.status === 401
          ? 'You are not authorized. Please login again.'
          : error?.response?.data?.message || 'Failed to update staff member. Please try again.';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error updating staff:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff member information and role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={staff.username}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-muted-foreground text-xs">Username cannot be changed</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                disabled={loading}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Staff'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
