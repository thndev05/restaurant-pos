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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    itemNameAtOrder: string;
    quantity: number;
    notes?: string;
    priceAtOrder: number;
  } | null;
  onSuccess: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export function EditItemDialog({ open, onOpenChange, item, onSuccess }: EditItemDialogProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [notes, setNotes] = useState(item?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!item || quantity < 1) return;

    setSubmitting(true);
    try {
      const { ordersService } = await import('@/lib/api/services');
      await ordersService.updateOrderItem(item.id, {
        quantity,
        notes: notes || undefined,
      });
      // Call onSuccess and wait for it to complete before closing
      await Promise.resolve(onSuccess());

      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update item:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to update item',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  const totalPrice = item.priceAtOrder * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md border p-3">
            <h3 className="font-medium">{item.itemNameAtOrder}</h3>
            <p className="text-muted-foreground text-sm">
              Price: {formatCurrency(item.priceAtOrder)} per item
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests..."
              rows={3}
            />
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || quantity < 1}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
