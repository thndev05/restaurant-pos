import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Minus, Trash2, ShoppingCart, UtensilsCrossed, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ordersService,
  type CreateOrderData,
  type OrderType,
} from '@/lib/api/services/orders.service';
import { menuItemsService, type MenuItem } from '@/lib/api/services/menu-items.service';
import { tablesService, type Table } from '@/lib/api/services/tables.service';
import { sessionsService } from '@/lib/api/services/sessions.service';

interface OrderItemInput {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function CreateOrderDialog({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Data states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Load menu items
  const loadMenuItems = useCallback(async () => {
    setIsLoadingMenu(true);
    try {
      const response = await menuItemsService.getAll();
      const items = Array.isArray(response) ? response : response.data || [];
      setMenuItems(items.filter((item) => item.isAvailable));
    } catch (error) {
      console.error('Failed to load menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMenu(false);
    }
  }, [toast]);

  const loadTables = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      const allTables = await tablesService.getTables();
      setTables(
        allTables.filter((table) => table.status === 'AVAILABLE' || table.status === 'OCCUPIED')
      );
    } catch (error) {
      console.error('Failed to load tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tables',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTables(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      loadMenuItems();
      if (orderType === 'DINE_IN') {
        loadTables();
      }
    }
  }, [open, orderType, loadMenuItems, loadTables]);

  const handleAddItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find((item) => item.menuItemId === menuItem.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItemId === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuItemId: menuItem.id,
          menuItem,
          quantity: 1,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    setOrderItems(
      orderItems
        .map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleUpdateNotes = (menuItemId: string, notes: string) => {
    setOrderItems(
      orderItems.map((item) => (item.menuItemId === menuItemId ? { ...item, notes } : item))
    );
  };

  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems(orderItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (orderItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one item to the order',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'DINE_IN') {
      if (!selectedTable) {
        toast({
          title: 'Validation Error',
          description: 'Please select a table for dine-in orders',
          variant: 'destructive',
        });
        return;
      }
    } else if (orderType === 'TAKE_AWAY') {
      if (!customerName.trim() || !customerPhone.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Customer name and phone are required for takeaway orders',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let sessionId: string | undefined;

      // For dine-in, create or get active session
      if (orderType === 'DINE_IN') {
        const table = tables.find((t) => t.id === selectedTable);
        if (table?.sessions && table.sessions.length > 0) {
          const activeSession = table.sessions.find((s) => s.status === 'ACTIVE');
          sessionId = activeSession?.id;
        }

        if (!sessionId) {
          const sessionResponse = await sessionsService.createSession({
            tableId: selectedTable,
            customerCount: 1,
          });
          interface SessionResponse {
            data?: { id: string };
            id?: string;
          }
          sessionId =
            (sessionResponse as SessionResponse).data?.id ||
            (sessionResponse as SessionResponse).id;
        }
      }

      const orderData: CreateOrderData = {
        orderType,
        sessionId: orderType === 'DINE_IN' ? sessionId : undefined,
        customerName: orderType === 'TAKE_AWAY' ? customerName : undefined,
        customerPhone: orderType === 'TAKE_AWAY' ? customerPhone : undefined,
        items: orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        notes: orderNotes || undefined,
        autoConfirm: true, // Staff-created orders skip PENDING and go directly to CONFIRMED
      };

      await ordersService.createOrder(orderData);

      toast({
        title: 'Success',
        description: 'Order created successfully',
      });

      // Reset form
      resetForm();
      onOrderCreated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setOrderType('DINE_IN');
    setSelectedTable('');
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setSearchQuery('');
    setOrderItems([]);
    setSelectedCategory('all');
  };

  const handleClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Get unique categories
  const categories = Array.from(
    new Set(menuItems.map((item) => item.category?.name).filter(Boolean))
  );

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] max-w-6xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Order</DialogTitle>
          <DialogDescription>Add items and specify order details</DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
          {/* Left Side - Menu Items */}
          <div className="flex flex-col overflow-hidden border-r pr-4">
            <div className="mb-4 space-y-4">
              <div>
                <Label>Order Type</Label>
                <Tabs
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                  className="mt-2"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="DINE_IN">
                      <UtensilsCrossed className="mr-2 h-4 w-4" />
                      Dine In
                    </TabsTrigger>
                    <TabsTrigger value="TAKE_AWAY">
                      <Package className="mr-2 h-4 w-4" />
                      Take Away
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {orderType === 'DINE_IN' && (
                <div>
                  <Label htmlFor="table">Select Table *</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger id="table" disabled={isLoadingTables}>
                      <SelectValue placeholder="Choose a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          Table {table.number} -{' '}
                          {table.status === 'AVAILABLE' ? '✓ Available' : 'Occupied'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {orderType === 'TAKE_AWAY' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone"
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category!}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid gap-3 pb-4">
                {isLoadingMenu ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Loading menu items...</p>
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No items found</p>
                  </div>
                ) : (
                  filteredMenuItems.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handleAddItem(item)}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.description && (
                            <p className="text-muted-foreground line-clamp-1 text-xs">
                              {item.description}
                            </p>
                          )}
                          <p className="text-primary mt-1 font-semibold">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleAddItem(item)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Order Summary */}
          <div className="flex flex-col overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Order Items ({orderItems.length})</h3>
              </div>
              <Badge variant="outline" className="text-base font-bold">
                {formatCurrency(calculateTotal())}
              </Badge>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3 pb-4">
                {orderItems.length === 0 ? (
                  <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg py-12">
                    <ShoppingCart className="text-muted-foreground mb-2 h-12 w-12" />
                    <p className="text-muted-foreground text-sm">No items added yet</p>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <Card key={item.menuItemId}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {item.menuItem.image && (
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">{item.menuItem.name}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveItem(item.menuItemId)}
                              >
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="ml-auto font-semibold">
                                {formatCurrency(item.menuItem.price * item.quantity)}
                              </span>
                            </div>
                            <Input
                              placeholder="Add notes (optional)"
                              value={item.notes || ''}
                              onChange={(e) => handleUpdateNotes(item.menuItemId, e.target.value)}
                              className="mt-2"
                              size={1}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                <Textarea
                  id="orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add special instructions or notes..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || orderItems.length === 0}>
            {isSubmitting ? 'Creating...' : `Create Order - ${formatCurrency(calculateTotal())}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
