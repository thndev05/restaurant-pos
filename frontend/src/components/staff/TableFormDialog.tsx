import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { Table, TableStatus } from '@/lib/api/services/tables.service';

export interface TableFormData {
  number: number;
  capacity: number;
  status?: TableStatus;
  location?: string;
}

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TableFormData) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Table;
}

const TABLE_STATUSES: { value: TableStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

export function TableFormDialog({
  open,
  onOpenChange,
  onSubmit,
  mode,
  initialData,
}: TableFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TableFormData>({
    number: 1,
    capacity: 4,
    status: 'AVAILABLE',
    location: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TableFormData, string>>>({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        number: initialData.number,
        capacity: initialData.capacity,
        status: initialData.status,
        location: initialData.location || '',
      });
    } else if (mode === 'create') {
      setFormData({
        number: 1,
        capacity: 4,
        status: 'AVAILABLE',
        location: '',
      });
    }
    setErrors({});
  }, [initialData, mode, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TableFormData, string>> = {};

    if (!formData.number || formData.number < 1) {
      newErrors.number = 'Table number must be at least 1';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData: TableFormData = {
        number: formData.number,
        capacity: formData.capacity,
        status: formData.status,
        location: formData.location || undefined,
      };
      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Add New Table' : 'Edit Table'}</DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Create a new table in your restaurant'
                : 'Update table information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Table Number */}
            <div className="grid gap-2">
              <Label htmlFor="number">
                Table Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                type="number"
                min="1"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: parseInt(e.target.value) || 0 })
                }
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
            </div>

            {/* Capacity */}
            <div className="grid gap-2">
              <Label htmlFor="capacity">
                Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
                }
                className={errors.capacity ? 'border-red-500' : ''}
              />
              {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TableStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location/Section</Label>
              <Input
                id="location"
                placeholder="e.g., Main Floor, Patio, Private Room"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Table'
              ) : (
                'Update Table'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
