import { useState } from 'react';
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
import type { TableStatus } from '@/lib/api/services/tables.service';
import { Plus } from 'lucide-react';

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableCreated?: () => void;
}

export function CreateTableDialog({ open, onOpenChange, onTableCreated }: CreateTableDialogProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    location: '',
    status: 'AVAILABLE' as TableStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setIsCreating(true);
    try {
      await tablesService.createTable({
        number: tableNumber,
        capacity: tableCapacity,
        location: formData.location || undefined,
        status: formData.status,
      });

      toast({
        title: 'Success',
        description: 'Table created successfully',
      });

      // Reset form
      setFormData({
        number: '',
        capacity: '',
        location: '',
        status: 'AVAILABLE',
      });

      onTableCreated?.();
      onOpenChange(false);
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
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Table
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="number">
                Table Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                type="number"
                min="1"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Enter table number (e.g., 1, 2, 3)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">
                Capacity (guests) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Enter capacity (e.g., 2, 4, 6)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location (e.g., Window side, Corner, Patio)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TableStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Table'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
