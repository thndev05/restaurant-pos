import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast';
import { tablesService } from '@/lib/api/services';
import type { Table, TableStatus } from '@/lib/api/services/tables.service';
import { Edit2 } from 'lucide-react';

interface EditTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  onTableUpdated?: () => void;
}

export function EditTableDialog({
  open,
  onOpenChange,
  table,
  onTableUpdated,
}: EditTableDialogProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    location: '',
    status: 'AVAILABLE' as TableStatus,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number.toString(),
        capacity: table.capacity.toString(),
        location: table.location || '',
        status: table.status,
      });
    }
  }, [table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!table) return;

    if (!formData.number || !formData.capacity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const tableNumber = parseInt(formData.number);
    const tableCapacity = parseInt(formData.capacity);

    if (isNaN(tableNumber) || tableNumber < 1) {
      toast({
        title: 'Validation Error',
        description: 'Table number must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(tableCapacity) || tableCapacity < 1) {
      toast({
        title: 'Validation Error',
        description: 'Capacity must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await tablesService.updateTable(table.id, {
        number: tableNumber,
        capacity: tableCapacity,
        location: formData.location || undefined,
        status: formData.status,
      });

      toast({
        title: 'Success',
        description: 'Table updated successfully',
      });

      onTableUpdated?.();
      onOpenChange(false);
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
    } finally {
      setIsUpdating(false);
    }
  };

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Edit Table {table.number}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-number">
                Table Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-number"
                type="number"
                min="1"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Enter table number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-capacity">
                Capacity (guests) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Enter capacity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location (Optional)</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TableStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Table'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
