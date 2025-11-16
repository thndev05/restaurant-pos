import type { FC } from 'react';
import { useState } from 'react';
import CustomerLayout from '../../layouts/customer/CustomerLayout';
import { SearchBar, Card } from '../../components/common';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils';

// Mock data - giống như staff nhưng đơn giản hóa cho customer
const categories = [
  { id: 'all', name: 'All', icon: '' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'drink', name: 'Drink', icon: '☕' },
  { id: 'dessert', name: 'Dessert', icon: '🍨' },
  { id: 'appetizer', name: 'Appetizer', icon: '🍗' },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Pepperoni Pizza',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop',
    category: 'pizza',
  },
  {
    id: '2',
    name: 'Cheese Burger',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
    category: 'burger',
  },
  {
    id: '3',
    name: 'Classic Burger',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop',
    category: 'burger',
  },
  {
    id: '4',
    name: 'Chicken BBQ',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop',
    category: 'appetizer',
  },
  {
    id: '5',
    name: 'Double Burger',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300&h=300&fit=crop',
    category: 'burger',
  },
  {
    id: '6',
    name: 'Deluxe Burger',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=300&fit=crop',
    category: 'burger',
  },
];

const CustomerHomePage: FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CustomerLayout>
      <div className="container mx-auto flex flex-1 gap-6 p-6">
        {/* Menu Section */}
        <div className="flex-1">
          {/* Search */}
          <div className="mb-6">
            <SearchBar
              placeholder="Search menu..."
              onSearch={setSearchQuery}
              className="max-w-xl"
            />
          </div>

          {/* Categories */}
          <div className="mb-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'text-text-gray bg-white hover:bg-gray-50'
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-text-dark mb-2 font-semibold">{product.name}</h3>
                  <p className="text-primary mb-3 text-lg font-bold">
                    {formatCurrency(product.price)}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-primary hover:bg-primary-hover w-full rounded-lg py-2 text-sm font-medium text-white transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-text-gray py-12 text-center">
              <p>No products found</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="w-80">
          <Card className="sticky top-6">
            <div className="p-4">
              <h2 className="text-text-dark mb-4 text-xl font-bold">Your Cart</h2>

              {cart.length === 0 ? (
                <div className="text-text-gray py-8 text-center text-sm">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-text-dark text-sm font-medium">
                            {item.product.name}
                          </h4>
                          <p className="text-text-gray text-xs">
                            {formatCurrency(item.product.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-primary text-sm font-bold">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-border border-t pt-4">
                    <div className="mb-4 flex justify-between">
                      <span className="text-text-gray">Total</span>
                      <span className="text-text-dark text-lg font-bold">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                    <button className="bg-primary hover:bg-primary-hover w-full rounded-lg py-3 font-medium text-white transition-colors">
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerHomePage;
