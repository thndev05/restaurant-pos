import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import type { CartItem } from '@/types/customer';

interface LocalMenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  isActive: boolean;
  prepTime: string;
  isSpicy: boolean;
  isNew: boolean;
}

export default function TableOrderPage() {
  const { tableId } = useParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LocalMenuItem | null>(null);
  const [itemNotes, setItemNotes] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const menuItems = [
    {
      id: 1,
      name: 'Classic Burger',
      category: 'Burgers',
      price: 12.99,
      rating: 5,
      image: '/assets/images/food-menu-1.png',
      isActive: true,
      prepTime: '15 min',
      isSpicy: false,
      isNew: true,
    },
    {
      id: 2,
      name: 'Cheese Pizza',
      category: 'Pizza',
      price: 15.99,
      rating: 5,
      image: '/assets/images/food-menu-2.png',
      isActive: true,
      prepTime: '20 min',
      isSpicy: false,
      isNew: false,
    },
    {
      id: 3,
      name: 'Caesar Salad',
      category: 'Salads',
      price: 8.99,
      rating: 4,
      image: '/assets/images/food-menu-3.png',
      isActive: true,
      prepTime: '10 min',
      isSpicy: false,
      isNew: false,
    },
    {
      id: 4,
      name: 'Spaghetti Carbonara',
      category: 'Pasta',
      price: 14.99,
      rating: 5,
      image: '/assets/images/food-menu-4.png',
      isActive: true,
      prepTime: '25 min',
      isSpicy: false,
      isNew: false,
    },
    {
      id: 5,
      name: 'BBQ Burger',
      category: 'Burgers',
      price: 13.99,
      rating: 5,
      image: '/assets/images/food-menu-5.png',
      isActive: true,
      prepTime: '18 min',
      isSpicy: true,
      isNew: true,
    },
    {
      id: 6,
      name: 'Margherita Pizza',
      category: 'Pizza',
      price: 13.99,
      rating: 4,
      image: '/assets/images/food-menu-6.png',
      isActive: true,
      prepTime: '22 min',
      isSpicy: false,
      isNew: false,
    },
  ];

  const categories = ['All', 'Burgers', 'Pizza', 'Pasta', 'Salads'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const addToCart = (item: LocalMenuItem) => {
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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const filteredItems = menuItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleCallWaiter = () => {
    alert('Waiter has been notified! They will be with you shortly.');
  };

  const handleRequestBill = () => {
    setActiveTab('cart');
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert('Please add items to your cart first.');
      return;
    }
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setOrderPlaced(false);
      setActiveTab('menu');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-emerald-200/20 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/customer/home">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-emerald-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 p-2.5 shadow-lg shadow-emerald-600/30">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">Table {tableId || 'Demo'}</p>
                <p className="text-xs font-medium text-emerald-600">Scan & Order</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCallWaiter}
              className="group border-2 border-emerald-600 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
            >
              <Bell className="h-4 w-4 transition-transform group-hover:rotate-12" />
              <span className="ml-2 hidden sm:inline">Call</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('cart')}
              className="group relative border-2 border-emerald-600 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
            >
              <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 animate-pulse rounded-full bg-red-500 p-0 text-xs shadow-lg">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-28 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2 p-1 shadow-lg">
            <TabsTrigger
              value="menu"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white"
            >
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger
              value="cart"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart {cart.length > 0 && `(${cart.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-0">
            {/* Quick Actions */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              <Card className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-emerald-600 hover:shadow-xl">
                <CardContent
                  className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
                  onClick={handleCallWaiter}
                >
                  <div className="rounded-full bg-emerald-100 p-4 transition-all group-hover:bg-emerald-600">
                    <Bell className="h-8 w-8 text-emerald-700 transition-colors group-hover:text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Call Waiter</span>
                  <span className="text-xs text-gray-500">Need assistance?</span>
                </CardContent>
              </Card>
              <Card className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-emerald-600 hover:shadow-xl">
                <CardContent
                  className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
                  onClick={handleRequestBill}
                >
                  <div className="rounded-full bg-emerald-100 p-4 transition-all group-hover:bg-emerald-600">
                    <CreditCard className="h-8 w-8 text-emerald-700 transition-colors group-hover:text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Request Bill</span>
                  <span className="text-xs text-gray-500">Ready to pay?</span>
                </CardContent>
              </Card>
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className={`transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-600/30'
                      : 'border-2 border-emerald-200 hover:border-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-600 hover:shadow-2xl hover:shadow-emerald-600/20"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {item.isNew && (
                        <Badge className="animate-pulse bg-green-500 text-white shadow-lg">
                          NEW
                        </Badge>
                      )}
                      {item.isSpicy && (
                        <Badge className="bg-red-500 text-white shadow-lg">
                          <Flame className="mr-1 h-3 w-3" />
                          Spicy
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                        ))}
                      </div>
                    </div>
                    <h3 className="mb-2 font-bold text-gray-900">{item.name}</h3>
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{item.prepTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-emerald-600">${item.price}</span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-md hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cart" className="mt-0">
            {cart.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-20 text-center">
                  <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gray-100 p-8">
                    <ShoppingCart className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h3>
                  <p className="mb-6 text-gray-600">Add items from the menu to get started</p>
                  <Button
                    onClick={() => setActiveTab('menu')}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    Browse Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-2 transition-all hover:border-emerald-600 hover:shadow-lg"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-100 to-green-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                {item.notes && (
                                  <p className="text-xs text-gray-500">Note: {item.notes}</p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(index)}
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(index, -1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(index, 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="text-xl font-bold text-emerald-600">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <Card className="overflow-hidden border-2 border-emerald-200 shadow-xl">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-700" />
                      <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax (10%)</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t-2 border-emerald-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <span className="text-2xl font-bold text-emerald-700">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Place Order Button */}
                <Button
                  size="lg"
                  className="h-16 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-lg font-bold shadow-xl shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-600/40"
                  onClick={handlePlaceOrder}
                >
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  Place Order
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
                  <Badge variant="secondary">{selectedItem.category}</Badge>
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

      {/* Order Placed Success Notification */}
      {orderPlaced && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="animate-in zoom-in w-full max-w-md shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Order Placed!</h3>
              <p className="text-gray-600">
                Your order has been sent to the kitchen. Your delicious food will be ready soon!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
