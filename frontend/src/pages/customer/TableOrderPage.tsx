import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/contexts';
import { customerApi } from '@/lib/api/customerApiClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bell,
  CreditCard,
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
  ArrowLeft,
  Loader2,
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
  const { session, getTimeRemaining } = useSession();
  const { toast } = useToast();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemNotes, setItemNotes] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Redirect if no session
  useEffect(() => {
    if (!session) {
      toast({
        title: 'Session Required',
        description: 'Please scan the QR code at your table to start ordering.',
        variant: 'destructive',
      });
      navigate('/customer/home');
    }
  }, [session, navigate, toast]);

  // Load menu items
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoadingMenu(true);
        const data = await customerApi.getMenu();
        setMenuItems(data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(
          data
            .filter((item: MenuItem) => item.category)
            .map((item: MenuItem) => item.category!.name)
        )];
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

    if (session) {
      loadMenu();
    }
  }, [session, toast]);

  const addToCart = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const confirmAddToCart = () => {
    if (!selectedItem) return;

    const existingIndex = cart.findIndex((i) => i.id === selectedItem.id && i.notes === itemNotes);

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...selectedItem, quantity: 1, notes: itemNotes }]);
    }

    setSelectedItem(null);
    setItemNotes('');
    
    toast({
      title: 'Added to cart',
      description: `${selectedItem.name} has been added to your cart.`,
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
      
      const items = cart.map(item => ({
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
    } catch (error: any) {
      console.error('Failed to place order:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!session) {
    return null;
  }

  const timeRemaining = getTimeRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50/30 pb-20">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-emerald-400/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 h-80 w-80 animate-pulse rounded-full bg-green-400/10 blur-3xl delay-1000"></div>
      </div>

      {/* Header - Responsive */}
      <header className="fixed top-0 z-50 w-full border-b border-emerald-200/30 bg-white/80 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:h-20 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/customer/home">
              <Button
                variant="ghost"
                size="sm"
                className="group h-8 w-8 p-0 text-gray-600 transition-all hover:scale-105 hover:bg-emerald-50 hover:text-emerald-600 sm:h-10 sm:w-10"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="animate-in zoom-in rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-2 shadow-xl shadow-emerald-600/40 duration-500 sm:p-3">
                <UtensilsCrossed className="h-4 w-4 text-white sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-gray-900 sm:text-xl">
                  Table {session.tableInfo.number}
                </p>
                <p className="hidden items-center gap-1 text-xs font-medium text-emerald-600 sm:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  {timeRemaining !== null && timeRemaining < 10 ? (
                    <span className="text-orange-600 font-bold">Session expires in {timeRemaining} min</span>
                  ) : (
                    'Ready to Order'
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCallWaiter}
              className="group relative h-8 overflow-hidden border-2 border-emerald-500 bg-white px-2 text-emerald-600 shadow-md transition-all hover:scale-105 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-xl sm:h-10 sm:px-3"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <Bell className="h-4 w-4 transition-all group-hover:scale-110 group-hover:rotate-12" />
              <span className="ml-1.5 hidden text-xs font-semibold sm:ml-2 sm:inline sm:text-sm">
                Call
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('cart')}
              className="group relative h-8 overflow-hidden border-2 border-emerald-500 bg-white px-2 text-emerald-600 shadow-md transition-all hover:scale-105 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-xl sm:h-10 sm:px-3"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <ShoppingCart className="h-4 w-4 transition-all group-hover:scale-110" />
              {cart.length > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 animate-bounce rounded-full bg-gradient-to-br from-red-500 to-pink-500 p-0 text-[10px] font-bold shadow-lg ring-1 ring-white sm:-top-2 sm:-right-2 sm:h-6 sm:w-6 sm:text-xs sm:ring-2">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-3 pt-20 pb-4 sm:px-4 sm:pt-28 sm:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2 gap-1.5 bg-emerald-50/50 p-1.5 shadow-xl backdrop-blur-sm sm:mb-8 sm:gap-2 sm:p-2">
            <TabsTrigger
              value="menu"
              className="relative overflow-hidden rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 data-[state=inactive]:hover:bg-white/80 sm:py-3 sm:text-base"
            >
              <UtensilsCrossed className="mr-1.5 h-4 w-4 transition-transform group-hover:rotate-12 sm:mr-2 sm:h-5 sm:w-5" />
              <span>Menu</span>
            </TabsTrigger>
            <TabsTrigger
              value="cart"
              className="relative overflow-hidden rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 data-[state=inactive]:hover:bg-white/80 sm:py-3 sm:text-base"
            >
              <ShoppingCart className="mr-1.5 h-4 w-4 transition-transform group-hover:scale-110 sm:mr-2 sm:h-5 sm:w-5" />
              <span>Cart</span>
              {cart.length > 0 && (
                <Badge className="ml-1.5 animate-pulse bg-red-500 px-1.5 py-0.5 text-[10px] font-bold sm:ml-2 sm:px-2 sm:text-xs">
                  {cart.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-0">
            {/* Quick Actions - Responsive */}
            <div className="animate-in fade-in slide-in-from-bottom-4 mb-4 grid grid-cols-2 gap-2 duration-500 sm:mb-8 sm:gap-4">
              <Card className="group relative cursor-pointer overflow-hidden border-2 border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/30 transition-all hover:-translate-y-1 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-600/20 active:scale-95">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-400/0 to-emerald-600/0 transition-all duration-500 group-hover:from-emerald-400/10 group-hover:to-emerald-600/10"></div>
                <CardContent
                  className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center sm:gap-3 sm:p-6"
                  onClick={handleCallWaiter}
                >
                  <div className="relative rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-emerald-700 group-hover:shadow-xl group-hover:shadow-emerald-600/40 sm:p-5">
                    <Bell className="h-6 w-6 text-emerald-700 transition-all duration-500 group-hover:rotate-12 group-hover:text-white sm:h-8 sm:w-8" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-emerald-500 opacity-0 group-hover:opacity-75"></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-emerald-700 sm:text-base">
                    Call Waiter
                  </span>
                  <span className="hidden text-xs font-medium text-gray-500 transition-colors group-hover:text-emerald-600 sm:block">
                    Need assistance?
                  </span>
                </CardContent>
              </Card>
              <Card className="group relative cursor-pointer overflow-hidden border-2 border-emerald-200/50 bg-gradient-to-br from-white to-green-50/30 transition-all hover:-translate-y-1 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-600/20 active:scale-95">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-400/0 to-emerald-600/0 transition-all duration-500 group-hover:from-green-400/10 group-hover:to-emerald-600/10"></div>
                <CardContent
                  className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center sm:gap-3 sm:p-6"
                  onClick={handleRequestBill}
                >
                  <div className="relative rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-emerald-700 group-hover:shadow-xl group-hover:shadow-emerald-600/40 sm:p-5">
                    <CreditCard className="h-6 w-6 text-emerald-700 transition-all duration-500 group-hover:scale-110 group-hover:text-white sm:h-8 sm:w-8" />
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-emerald-500 opacity-0 transition-all group-hover:opacity-100 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-emerald-700 sm:text-base">
                    Request Bill
                  </span>
                  <span className="hidden text-xs font-medium text-gray-500 transition-colors group-hover:text-emerald-600 sm:block">
                    Ready to pay?
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Category Filter - Responsive */}
            <div className="animate-in fade-in slide-in-from-left mb-4 flex flex-wrap gap-2 delay-100 duration-700 sm:mb-8 sm:gap-3">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={`group relative overflow-hidden px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95 sm:px-4 sm:py-2 sm:text-sm ${
                    selectedCategory === category
                      ? 'animate-in zoom-in bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-xl shadow-emerald-600/40 hover:shadow-2xl'
                      : 'border-2 border-emerald-300/50 bg-white/80 backdrop-blur-sm hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg'
                  }`}
                >
                  {selectedCategory !== category && (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400/0 to-emerald-600/0 transition-all duration-300 group-hover:from-emerald-400/20 group-hover:to-emerald-600/20"></div>
                  )}
                  {category}
                </Button>
              ))}
            </div>

            {/* Menu Items - Fully Responsive */}
            {isLoadingMenu ? (
              <div className="col-span-full py-16 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
                <p className="mt-4 text-gray-600">Loading menu...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <p className="text-gray-600">No items available in this category.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
                {filteredItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden border-2 border-emerald-200/40 bg-gradient-to-br from-white to-emerald-50/20 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-600/30 active:scale-95"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards',
                      opacity: 0,
                    }}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-1 -z-10 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>

                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100">
                      <img
                        src={item.image || '/assets/images/food-placeholder.png'}
                        alt={item.name}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                      {/* Badges - Responsive */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 sm:top-3 sm:left-3 sm:gap-2">
                        {item.tags.includes('new') && (
                          <Badge className="animate-in zoom-in animate-pulse bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xl ring-1 ring-white/50 duration-500 sm:px-3 sm:py-1 sm:text-xs sm:ring-2">
                            <Sparkles className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                            NEW
                          </Badge>
                        )}
                        {item.tags.includes('spicy') && (
                          <Badge className="animate-in zoom-in bg-gradient-to-r from-red-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xl ring-1 ring-white/50 delay-100 duration-500 sm:px-3 sm:py-1 sm:text-xs sm:ring-2">
                            <Flame className="mr-0.5 h-2.5 w-2.5 animate-pulse sm:mr-1 sm:h-3 sm:w-3" />
                            Spicy
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-3 sm:p-4 lg:p-5">
                      <div className="mb-2 flex items-center justify-between sm:mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm sm:px-3 sm:py-1 sm:text-xs"
                        >
                          {item.category?.name || 'Other'}
                        </Badge>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-amber-400 text-amber-400 transition-all duration-300 group-hover:scale-125 sm:h-4 sm:w-4"
                              style={{ transitionDelay: `${i * 50}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="mb-1 text-sm font-bold text-gray-900 transition-colors group-hover:text-emerald-700 sm:text-base lg:text-lg">
                        {item.name}
                      </h3>
                      <p className="mb-3 hidden text-xs text-gray-500 sm:mb-4 sm:block">
                        {item.description || 'Freshly prepared with premium ingredients'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-500 sm:text-xs">Price</p>
                          <span className="text-lg font-bold text-emerald-600 transition-colors group-hover:text-emerald-700 sm:text-xl lg:text-2xl">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={!item.isAvailable}
                          className="group/btn relative h-9 w-9 overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 p-0 shadow-lg transition-all hover:scale-110 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl hover:shadow-emerald-600/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed sm:h-10 sm:w-10 lg:h-12 lg:w-12"
                        >
                          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transition-transform duration-500 group-hover/btn:translate-x-full"></div>
                          <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </TabsContent>

          <TabsContent value="cart" className="mt-0">
            {cart.length === 0 ? (
              <Card className="animate-in fade-in zoom-in border-2 border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/30 shadow-xl duration-500">
                <CardContent className="py-16 text-center sm:py-24">
                  <div className="animate-in zoom-in mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 p-8 shadow-2xl duration-700 sm:mb-8 sm:p-10">
                    <ShoppingCart className="h-16 w-16 text-emerald-600 sm:h-20 sm:w-20" />
                  </div>
                  <h3 className="animate-in slide-in-from-bottom mb-2 text-2xl font-bold tracking-tight text-gray-900 delay-100 duration-500 sm:mb-3 sm:text-3xl">
                    Your cart is empty
                  </h3>
                  <p className="animate-in slide-in-from-bottom mb-6 px-4 text-base text-gray-600 delay-200 duration-500 sm:mb-8 sm:text-lg">
                    Add delicious items from the menu to get started
                  </p>
                  <Button
                    onClick={() => setActiveTab('menu')}
                    className="animate-in zoom-in group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-base font-semibold shadow-xl shadow-emerald-600/30 transition-all delay-300 duration-500 hover:scale-105 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-2xl active:scale-95 sm:px-8 sm:py-6 sm:text-lg"
                  >
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transition-transform duration-500 group-hover:translate-x-full"></div>
                    <UtensilsCrossed className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                    Browse Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Cart Items - Responsive */}
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-2 transition-all hover:border-emerald-600 hover:shadow-lg active:scale-95"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex gap-3 sm:gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 sm:h-24 sm:w-24">
                            <img
                              src={item.image}
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
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(index)}
                                className="h-7 w-7 shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 sm:h-8 sm:w-8"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(index, -1)}
                                  className="h-7 w-7 p-0 active:scale-90 sm:h-8 sm:w-8"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-7 text-center text-sm font-bold sm:w-8 sm:text-base">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(index, 1)}
                                  className="h-7 w-7 p-0 active:scale-90 sm:h-8 sm:w-8"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="text-lg font-bold text-emerald-600 sm:text-xl">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary - Responsive */}
                <Card className="animate-in slide-in-from-bottom overflow-hidden border-2 border-emerald-300/50 bg-gradient-to-br from-white to-emerald-50/50 shadow-2xl delay-300 duration-700">
                  <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 p-5 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
                      <div className="rounded-full bg-gradient-to-br from-emerald-600 to-green-600 p-2 shadow-lg sm:p-2.5">
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
                      <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-100 to-green-100 p-3 shadow-lg sm:p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-emerald-700 sm:text-sm">
                              Total Amount
                            </p>
                            <span className="text-2xl font-bold text-emerald-700 sm:text-3xl">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                          <div className="rounded-full bg-emerald-600 p-2 shadow-lg sm:p-3">
                            <Check className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Place Order Button - Responsive */}
                <Button
                  size="lg"
                  disabled={isPlacingOrder}
                  className="animate-in zoom-in group relative h-16 w-full overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-600 text-lg font-bold shadow-2xl shadow-emerald-600/40 transition-all delay-400 duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-600/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed sm:h-20 sm:text-xl"
                  onClick={handlePlaceOrder}
                >
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                  <div className="absolute inset-0 -z-20 animate-pulse bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 opacity-0 transition-opacity group-hover:opacity-20"></div>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Add to Cart Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add to Cart</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-emerald-100 to-green-100">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="mb-1 text-xl font-bold text-gray-900">{selectedItem.name}</h3>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">{selectedItem.category?.name || 'Other'}</Badge>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: selectedItem.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-600">${selectedItem.price}</p>
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
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  onClick={confirmAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Placed Success Notification - Responsive */}
      {orderPlaced && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md duration-300">
          <Card className="animate-in zoom-in w-full max-w-sm overflow-hidden border-2 border-green-500/50 bg-gradient-to-br from-white to-green-50/50 shadow-2xl duration-500 sm:max-w-lg">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-400/20 to-emerald-600/20"></div>
            <CardContent className="relative p-8 text-center sm:p-12">
              {/* Success Icon - Responsive */}
              <div className="animate-in zoom-in mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-600/40 delay-100 duration-700 sm:mb-6 sm:h-28 sm:w-28">
                <div className="animate-in zoom-in rounded-full bg-white p-2 delay-200 duration-500 sm:p-3">
                  <Check className="h-9 w-9 stroke-[3] text-green-600 sm:h-12 sm:w-12" />
                </div>
              </div>

              {/* Animated Checkmarks Background - Hidden on mobile */}
              <div className="absolute inset-0 -z-10 hidden overflow-hidden opacity-10 sm:block">
                <Check className="absolute top-10 left-10 h-16 w-16 animate-pulse text-green-500" />
                <Check className="absolute right-10 bottom-10 h-16 w-16 animate-pulse text-emerald-500 delay-500" />
                <Sparkles className="absolute top-20 right-20 h-12 w-12 animate-pulse text-green-500 delay-300" />
                <Sparkles className="absolute bottom-20 left-20 h-12 w-12 animate-pulse text-emerald-500 delay-700" />
              </div>

              <h3 className="animate-in slide-in-from-bottom mb-2 text-2xl font-bold text-gray-900 delay-300 duration-500 sm:mb-3 sm:text-4xl">
                Order Placed!
              </h3>
              <p className="animate-in slide-in-from-bottom mb-4 text-base text-gray-700 delay-400 duration-500 sm:mb-6 sm:text-lg">
                Your order has been sent to the kitchen
              </p>
              <div className="animate-in fade-in inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-lg delay-500 duration-500 sm:px-6 sm:py-3 sm:text-sm">
                <Clock className="h-4 w-4 animate-pulse sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Your delicious food will be ready soon!</span>
                <span className="sm:hidden">Food ready soon!</span>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-600/30 blur-2xl sm:h-24 sm:w-24"></div>
              <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400/30 to-green-600/30 blur-2xl sm:h-24 sm:w-24"></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
