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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, ShoppingCart, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: { name: string };
  isAvailable: boolean;
}

interface OrderItem {
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  notes: string;
}

interface OrderManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  orderId?: string;
  onSuccess: () => void;
  mode: 'create' | 'add';
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export function OrderManagementDialog({
  open,
  onOpenChange,
  sessionId,
  orderId,
  onSuccess,
  mode,
}: OrderManagementDialogProps) {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (open) {
      loadMenuItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const { menuItemsService } = await import('@/lib/api/services');
      const response = await menuItemsService.getAll();
      const data = response.data || response;
      setMenuItems(data.filter((item: MenuItem) => item.isAvailable));
    } catch (error) {
      console.error('Failed to load menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (menuItem: MenuItem) => {
    const existing = selectedItems.find((item) => item.menuItemId === menuItem.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.menuItemId === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { menuItemId: menuItem.id, menuItem, quantity: 1, notes: '' },
      ]);
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter((item) => item.menuItemId !== menuItemId));
    } else {
      setSelectedItems(
        selectedItems.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity } : item))
      );
    }
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setSelectedItems(
      selectedItems.map((item) => (item.menuItemId === menuItemId ? { ...item, notes } : item))
    );
  };

  const removeItem = (menuItemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one item',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { ordersService } = await import('@/lib/api/services');

      // Validate and prepare items
      interface ItemData {
        menuItemId: string;
        quantity: number;
        notes?: string;
      }
      const items = selectedItems
        .filter((item) => item.quantity > 0) // Only include items with quantity > 0
        .map((item) => {
          const itemData: ItemData = {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          };

          // Only add notes if it's not empty
          if (item.notes && item.notes.trim()) {
            itemData.notes = item.notes.trim();
          }

          return itemData;
        });

      if (items.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid items to add',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      if (mode === 'create') {
        const orderData = {
          orderType: 'DINE_IN' as const,
          sessionId,
          items,
          autoConfirm: true, // Staff-created orders skip PENDING and go directly to CONFIRMED
          ...(orderNotes && orderNotes.trim() ? { notes: orderNotes.trim() } : {}),
        };
        console.log('Creating order:', orderData);
        await ordersService.createOrder(orderData);
        toast({
          title: 'Success',
          description: 'Order created successfully',
        });
      } else {
        if (!orderId) {
          throw new Error('Order ID is required for adding items');
        }

        // Validate items before sending
        for (const item of items) {
          if (!item.menuItemId || typeof item.menuItemId !== 'string') {
            throw new Error(`Invalid menuItemId: ${item.menuItemId}`);
          }
          if (!item.quantity || item.quantity < 1) {
            throw new Error(`Invalid quantity for item: ${item.quantity}`);
          }
        }

        console.log('Adding items to order:', {
          orderId,
          itemsCount: items.length,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            hasNotes: !!i.notes,
          })),
        });

        const result = await ordersService.addOrderItems(orderId, { items });
        console.log('Add items result:', result);

        // Call onSuccess to refresh the order data
        await Promise.resolve(onSuccess());

        toast({
          title: 'Success',
          description: `${items.length} item(s) added to order successfully`,
        });
      }

      // For all modes, call onSuccess if not already called
      if (mode === 'create') {
        await Promise.resolve(onSuccess());
      }

      setSelectedItems([]);
      setOrderNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit order:', error);

      // Extract detailed error information
      let errorMessage = 'Failed to submit order';
      let errorDetails = '';

      if (error && typeof error === 'object') {
        if ('response' in error) {
          interface ErrorResponse {
            status?: number;
            statusText?: string;
            data?: {
              message?: string;
              error?: string;
            };
          }
          const response = (error as { response?: ErrorResponse }).response;
          errorMessage = response?.data?.message || errorMessage;
          errorDetails = response?.data?.error || '';

          // Log full error details for debugging
          console.error('API Error Details:', {
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
            orderId: orderId,
            itemsCount: selectedItems.length,
          });

          // Log the full response data separately for easier inspection
          console.error('Response Data:', response?.data);

          // Check for validation errors
          if (response?.data?.message) {
            console.error('Error Message:', response.data.message);
          }
          if (response?.data?.error) {
            console.error('Error Type:', response.data.error);
          }
          if (Array.isArray(response?.data?.message)) {
            console.error('Validation Errors:', response.data.message);
          }
        }
      }

      toast({
        title: 'Error',
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (item.menuItem?.price || 0) * item.quantity,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Order' : 'Add Items to Order'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Menu Items Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-2">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                  No menu items found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMenuItems.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:bg-accent cursor-pointer p-3 transition-colors"
                      onClick={() => addItem(item)}
                    >
                      <div className="flex items-start gap-3">
                        {item.image && (
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">{item.name}</h4>
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category.name}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-muted-foreground mt-1 text-xs">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-semibold">
                              {formatCurrency(item.price)}
                            </span>
                            <Button size="sm" variant="outline" className="h-6 px-2">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Selected Items Cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h3 className="font-semibold">Selected Items ({selectedItems.length})</h3>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-2">
              {selectedItems.length === 0 ? (
                <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                  No items selected
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <Card key={item.menuItemId} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          {item.menuItem?.image && (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                              <img
                                src={item.menuItem.image}
                                alt={item.menuItem.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex flex-1 items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{item.menuItem?.name}</h4>
                              <p className="text-muted-foreground text-xs">
                                {formatCurrency(item.menuItem?.price || 0)} × {item.quantity} ={' '}
                                <span className="font-semibold">
                                  {formatCurrency((item.menuItem?.price || 0) * item.quantity)}
                                </span>
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => removeItem(item.menuItemId)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.menuItemId, parseInt(e.target.value) || 1)
                            }
                            className="h-7 w-16 text-center"
                            min="1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Textarea
                          placeholder="Special instructions..."
                          value={item.notes}
                          onChange={(e) => updateNotes(item.menuItemId, e.target.value)}
                          className="text-xs"
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="orderNotes" className="text-sm">
                  Order Notes (Optional)
                </Label>
                <Textarea
                  id="orderNotes"
                  placeholder="Any special instructions for this order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || selectedItems.length === 0}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Create Order' : 'Add Items'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
