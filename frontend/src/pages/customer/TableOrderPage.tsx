import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts';
import { customerApi } from '@/lib/api/customerApiClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bell,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Trash2,
  Sparkles,
  Clock,
  Flame,
  Check,
  UtensilsCrossed,
  Loader2,
  Receipt,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isActive: boolean;
  tags: string[];
  category?: {
    id: string;
    name: string;
  };
}

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export default function TableOrderPage() {
  const navigate = useNavigate();
  const { session, getTimeRemaining, isLoading: isSessionLoading } = useSession();
  const { toast } = useToast();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemNotes, setItemNotes] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('menu');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Redirect if no session after loading
  useEffect(() => {
    if (!isSessionLoading && !session) {
      toast({
        title: 'Session Required',
        description: 'Please scan the QR code at your table to start ordering.',
        variant: 'destructive',
      });
      navigate('/customer/home');
    }
  }, [session, isSessionLoading, navigate, toast]);

  // Load menu items only when session is ready
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoadingMenu(true);
        const response = await customerApi.getMenu();
        const data = response.data || response;
        setMenuItems(data);

        // Extract unique categories
        const uniqueCategories = [
          'All',
          ...new Set(
            data
              .filter((item: MenuItem) => item.category)
              .map((item: MenuItem) => item.category!.name)
          ),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to load menu:', error);
        toast({
          title: 'Error',
          description: 'Failed to load menu items. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingMenu(false);
      }
    };

    // Only load menu if session is loaded and exists
    if (!isSessionLoading && session) {
      loadMenu();
    }
  }, [session, isSessionLoading, toast]);

  const addToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1); // Reset quantity when opening dialog
  };

  const confirmAddToCart = () => {
    if (!selectedItem) return;

    const existingIndex = cart.findIndex((i) => i.id === selectedItem.id && i.notes === itemNotes);

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += itemQuantity;
      setCart(newCart);
    } else {
      setCart([...cart, { ...selectedItem, quantity: itemQuantity, notes: itemNotes }]);
    }

    setSelectedItem(null);
    setItemNotes('');
    setItemQuantity(1);

    toast({
      title: 'Added to cart',
      description: `${itemQuantity} × ${selectedItem.name} added to your cart.`,
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const filteredItems = menuItems.filter(
    (item) => selectedCategory === 'All' || item.category?.name === selectedCategory
  );

  const handleCallWaiter = async () => {
    try {
      await customerApi.createAction('CALL_STAFF', 'Customer requested assistance');
      toast({
        title: 'Waiter Called',
        description: 'A waiter has been notified and will be with you shortly.',
      });
    } catch (error) {
      console.error('Failed to call waiter:', error);
      toast({
        title: 'Error',
        description: 'Failed to notify waiter. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestBill = async () => {
    try {
      await customerApi.createAction('REQUEST_BILL', 'Customer requested bill');
      setActiveTab('cart');
      toast({
        title: 'Bill Requested',
        description: 'Your bill has been requested. A staff member will bring it shortly.',
      });
    } catch (error) {
      console.error('Failed to request bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to request bill. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add items to your cart first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsPlacingOrder(true);

      const items = cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        ...(item.notes && { notes: item.notes }),
      }));

      await customerApi.createOrder(items);

      setOrderPlaced(true);
      setTimeout(() => {
        setCart([]);
        setOrderPlaced(false);
        setActiveTab('menu');
      }, 3000);

      toast({
        title: 'Order Placed',
        description: 'Your order has been sent to the kitchen!',
      });
    } catch (error: unknown) {
      console.error('Failed to place order:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const getCartItem = (itemId: string) => cart.find((item) => item.id === itemId);

  if (!session) {
    return null;
  }

  const timeRemaining = getTimeRemaining();

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f6f6] pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-[#f4f0f0] bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex size-8 items-center justify-center rounded-full text-white">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base leading-tight font-bold tracking-tight">BBQ Prime</h1>
                <span className="text-xs font-medium text-gray-500">
                  Table {session.tableInfo.number}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 hidden -translate-x-1/2 md:flex">
            <div className="flex animate-pulse items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1.5 text-yellow-800">
              <Clock className="h-[18px] w-[18px]" />
              <span className="text-sm font-bold tabular-nums">
                {timeRemaining !== null
                  ? `${String(Math.floor(timeRemaining)).padStart(2, '0')}:${String(Math.floor((timeRemaining % 1) * 60)).padStart(2, '0')}`
                  : '00:00'}
              </span>
              <span className="text-xs font-medium opacity-80">remaining</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Timer (Mobile) */}
            <div className="flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1 text-yellow-800 md:hidden">
              <span className="text-xs font-bold tabular-nums">
                {timeRemaining !== null
                  ? `${String(Math.floor(timeRemaining)).padStart(2, '0')}:${String(Math.floor((timeRemaining % 1) * 60)).padStart(2, '0')}`
                  : '00:00'}
              </span>
            </div>
            {/* Call Waiter - Desktop */}
            <button
              onClick={handleCallWaiter}
              className="hidden items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-200 lg:flex"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span>Call Waiter</span>
            </button>
            {/* Call Waiter - Mobile Icon Only */}
            <button
              onClick={handleCallWaiter}
              className="flex items-center justify-center rounded-xl bg-gray-100 p-2 text-gray-800 transition-colors hover:bg-gray-200 lg:hidden"
              title="Call Waiter"
            >
              <Bell className="h-5 w-5" />
            </button>
            {/* Request Bill - Desktop */}
            <button
              onClick={handleRequestBill}
              className="hidden items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-200 lg:flex"
            >
              <Receipt className="h-[18px] w-[18px]" />
              <span>Request Bill</span>
            </button>
            {/* Request Bill - Mobile Icon Only */}
            <button
              onClick={handleRequestBill}
              className="flex items-center justify-center rounded-xl bg-gray-100 p-2 text-gray-800 transition-colors hover:bg-gray-200 lg:hidden"
              title="Request Bill"
            >
              <Receipt className="h-5 w-5" />
            </button>
            {/* Cart Button */}
            <button
              onClick={() => setActiveTab('cart')}
              className="relative rounded-xl p-2 transition-colors hover:bg-gray-100"
            >
              <ShoppingCart className="h-6 w-6 text-gray-800" />
              {cart.length > 0 && (
                <span className="bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-[#e6dbdb]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`relative flex flex-col items-center pb-3 text-sm font-bold transition-colors ${
                activeTab === 'menu' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Menu
              {activeTab === 'menu' && (
                <span className="bg-primary absolute bottom-0 h-[3px] w-full rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`relative flex flex-col items-center pb-3 text-sm font-bold transition-colors ${
                activeTab === 'cart' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              My Order
              {activeTab === 'cart' && (
                <span className="bg-primary absolute bottom-0 h-[3px] w-full rounded-t-full"></span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'menu' && (
          <>
            {/* Categories */}
            <div className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div className="flex min-w-max gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex h-9 items-center gap-2 rounded-xl px-4 shadow-md transition-all active:scale-95 ${
                      selectedCategory === category
                        ? 'bg-primary shadow-primary/20 text-white'
                        : 'border border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                    }`}
                  >
                    {category === selectedCategory && category !== 'All' && (
                      <Star className="h-[18px] w-[18px]" />
                    )}
                    <span className="text-sm font-bold">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            {isLoadingMenu ? (
              <div className="col-span-full py-16 text-center">
                <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
                <p className="mt-4 text-gray-600">Loading menu...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <p className="text-gray-600">No items available in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => {
                  const cartItem = getCartItem(item.id);
                  return (
                    <div
                      key={item.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{
                            backgroundImage: `url(${item.image || '/assets/images/food-placeholder.png'})`,
                          }}
                        />
                        {item.tags.includes('new') && (
                          <span className="bg-primary/90 absolute top-3 left-3 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                            Best Seller
                          </span>
                        )}
                        {item.tags.includes('spicy') && (
                          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-orange-500/90 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                            <Flame className="h-[12px] w-[12px]" /> Spicy
                          </span>
                        )}
                        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
                          <Star className="h-[14px] w-[14px] fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-bold">4.9</span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-lg leading-tight font-bold text-gray-900">
                            {item.name}
                          </h3>
                        </div>
                        <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">
                          {item.description || 'Freshly prepared with premium ingredients'}
                        </p>
                        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-400">Price</span>
                            <span className="text-primary text-lg font-bold">
                              ${Number(item.price).toFixed(2)}
                            </span>
                          </div>
                          {cartItem ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  const idx = cart.findIndex((c) => c.id === item.id);
                                  updateQuantity(idx, -1);
                                }}
                                className="flex size-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                              >
                                <Minus className="h-[18px] w-[18px]" />
                              </button>
                              <span className="w-4 text-center text-sm font-bold">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  const idx = cart.findIndex((c) => c.id === item.id);
                                  updateQuantity(idx, 1);
                                }}
                                className="bg-primary shadow-primary/30 flex size-8 items-center justify-center rounded-lg text-white shadow-sm"
                              >
                                <Plus className="h-[18px] w-[18px]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              disabled={!item.isAvailable}
                              className="bg-primary shadow-primary/30 group/btn flex items-center justify-center rounded-xl p-2.5 text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="h-[20px] w-[20px] transition-transform group-active/btn:scale-90" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'cart' && (
          <>
            {cart.length === 0 ? (
              <Card className="animate-in fade-in zoom-in border-2 border-gray-200/50 bg-gradient-to-br from-white to-white/80 shadow-xl duration-500">
                <CardContent className="py-16 text-center sm:py-24">
                  <div className="animate-in zoom-in mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 p-8 shadow-2xl duration-700 sm:mb-8 sm:p-10">
                    <ShoppingCart className="text-primary h-16 w-16 sm:h-20 sm:w-20" />
                  </div>
                  <h3 className="animate-in slide-in-from-bottom mb-2 text-2xl font-bold tracking-tight text-gray-900 delay-100 duration-500 sm:mb-3 sm:text-3xl">
                    Your cart is empty
                  </h3>
                  <p className="animate-in slide-in-from-bottom mb-6 px-4 text-base text-gray-600 delay-200 duration-500 sm:mb-8 sm:text-lg">
                    Add delicious items from the menu to get started
                  </p>
                  <Button
                    onClick={() => setActiveTab('menu')}
                    className="animate-in zoom-in group from-primary shadow-primary/30 relative overflow-hidden bg-gradient-to-r to-[#9b0c0c] px-6 py-5 text-base font-semibold shadow-xl transition-all delay-300 duration-500 hover:scale-105 hover:shadow-2xl active:scale-95 sm:px-8 sm:py-6 sm:text-lg"
                  >
                    <UtensilsCrossed className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                    Browse Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item, index) => (
                    <Card
                      key={index}
                      className="hover:border-primary overflow-hidden border-2 transition-all hover:shadow-lg"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex gap-3 sm:gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-red-100 to-orange-100 sm:h-24 sm:w-24">
                            <img
                              src={item.image || '/assets/images/food-placeholder.png'}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                                  {item.name}
                                </h3>
                                {item.notes && (
                                  <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                                    Note: {item.notes}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(index)}
                                className="h-7 w-7 shrink-0 p-0 text-red-500 hover:text-red-600 sm:h-8 sm:w-8"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                  onClick={() => updateQuantity(index, -1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 active:scale-90 sm:h-8 sm:w-8"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center text-sm font-bold sm:w-8 sm:text-base">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(index, 1)}
                                  className="bg-primary flex h-7 w-7 items-center justify-center rounded-lg text-white active:scale-90 sm:h-8 sm:w-8"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-primary text-lg font-bold sm:text-xl">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="animate-in slide-in-from-bottom overflow-hidden border-2 border-red-300/30 bg-gradient-to-br from-white to-red-50/50 shadow-2xl delay-300 duration-700">
                  <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 p-5 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
                      <div className="from-primary rounded-full bg-gradient-to-br to-[#9b0c0c] p-2 shadow-lg sm:p-2.5">
                        <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Order Summary
                      </h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between rounded-lg bg-white/60 p-2.5 text-sm text-gray-700 backdrop-blur-sm sm:p-3 sm:text-base">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-bold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between rounded-lg bg-white/60 p-2.5 text-sm text-gray-700 backdrop-blur-sm sm:p-3 sm:text-base">
                        <span className="font-medium">Tax (10%)</span>
                        <span className="font-bold">${tax.toFixed(2)}</span>
                      </div>
                      <div className="rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-100 to-orange-100 p-3 shadow-lg sm:p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-primary text-xs font-medium sm:text-sm">
                              Total Amount
                            </p>
                            <span className="text-primary text-2xl font-bold sm:text-3xl">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                          <div className="bg-primary rounded-full p-2 shadow-lg sm:p-3">
                            <Check className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  size="lg"
                  disabled={isPlacingOrder}
                  onClick={handlePlaceOrder}
                  className="animate-in zoom-in group from-primary shadow-primary/40 relative h-16 w-full overflow-hidden bg-gradient-to-r via-red-700 to-[#9b0c0c] text-lg font-bold shadow-2xl transition-all delay-400 duration-700 hover:scale-[1.02] hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-20 sm:text-xl"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin sm:mr-3 sm:h-7 sm:w-7" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-6 w-6 transition-transform group-hover:scale-110 sm:mr-3 sm:h-7 sm:w-7" />
                      <span>Place Order</span>
                      <div className="ml-2 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur-sm sm:ml-3 sm:px-3 sm:text-sm">
                        ${total.toFixed(2)}
                      </div>
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 z-50 w-full">
          <div
            className="bg-primary-dark pb-safe w-full p-4 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
            style={{ backgroundColor: '#9b0c0c' }}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="rounded bg-white/20 px-2 py-1 text-xs font-bold">
                    {cart.length} Items
                  </div>
                  <span className="text-xs font-medium text-white/70">in cart</span>
                </div>
                <div className="mt-0.5 text-lg font-bold">
                  ${total.toFixed(2)} <span className="text-xs font-normal opacity-80">+ tax</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('cart')}
                className="text-primary-dark flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold shadow-lg transition-all hover:bg-gray-100 active:scale-95"
                style={{ color: '#9b0c0c' }}
              >
                <span>View Order</span>
                <span className="text-[18px]">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add to Cart</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-red-100 to-orange-100">
                <img
                  src={selectedItem.image || '/assets/images/food-placeholder.png'}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="mb-1 text-xl font-bold text-gray-900">{selectedItem.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-primary text-3xl font-bold">
                    ${Number(selectedItem.price).toFixed(2)}
                  </p>
                  {itemQuantity > 1 && (
                    <p className="text-lg font-semibold text-gray-600">
                      Total: ${(Number(selectedItem.price) * itemQuantity).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 active:scale-95"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="min-w-[3rem] text-center text-2xl font-bold">
                    {itemQuantity}
                  </span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-red-700 active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., No onions, extra sauce..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-2"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="from-primary flex-1 bg-gradient-to-r to-[#9b0c0c] hover:from-[#9b0c0c] hover:to-[#9b0c0c]"
                  onClick={confirmAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Placed Success Notification  */}
      {orderPlaced && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md duration-300">
          <Card className="animate-in zoom-in w-full max-w-sm overflow-hidden border-2 border-red-500/50 bg-gradient-to-br from-white to-red-50/30 shadow-2xl duration-500 sm:max-w-lg">
            <CardContent className="relative p-8 text-center sm:p-12">
              <div className="animate-in zoom-in from-primary shadow-primary/40 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br to-[#9b0c0c] shadow-2xl delay-100 duration-700 sm:mb-6 sm:h-28 sm:w-28">
                <Check className="h-9 w-9 stroke-[3] text-white sm:h-12 sm:w-12" />
              </div>
              <h3 className="animate-in slide-in-from-bottom mb-2 text-2xl font-bold text-gray-900 delay-300 duration-500 sm:mb-3 sm:text-4xl">
                Order Placed!
              </h3>
              <p className="animate-in slide-in-from-bottom mb-4 text-base text-gray-700 delay-400 duration-500 sm:mb-6 sm:text-lg">
                Your order has been sent to the kitchen
              </p>
              <div className="animate-in fade-in text-primary inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-100 to-orange-100 px-4 py-2 text-xs font-semibold shadow-lg delay-500 duration-500 sm:px-6 sm:py-3 sm:text-sm">
                <Clock className="h-4 w-4 animate-pulse sm:h-5 sm:w-5" />
                <span>Your delicious food will be ready soon!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
