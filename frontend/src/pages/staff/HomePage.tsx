import type { FC } from 'react';
import { useState } from 'react';
import { SearchBar } from '../../components/common';
import ProductCard from '../../components/home/ProductCard';
import CategoryFilter from '../../components/home/CategoryFilter';
import OrderPanel from '../../components/home/OrderPanel';
import MainLayout from '../../layouts/staff/StaffLayout';
import { useOrder } from '../../hooks';
import type { Product } from '../../types';
import { generateId } from '../../utils/helpers';

// Mock data
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

const HomePage: FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useOrder();

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    addItem({
      id: generateId(),
      product,
      quantity: 1,
    });
  };

  return (
    <MainLayout>
      {/* Main Content */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-text-dark mb-4 text-3xl font-bold">Home</h1>
          <SearchBar
            placeholder="Search menu here..."
            onSearch={setSearchQuery}
            className="max-w-md"
          />
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-text-dark mb-4 text-xl font-semibold">Categories</h2>
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-text-dark mb-4 text-xl font-semibold">
            {activeCategory === 'all'
              ? 'Most Popular'
              : categories.find((c) => c.id === activeCategory)?.name}
          </h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={handleProductClick} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-text-gray py-12 text-center">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Panel */}
      <OrderPanel />
    </MainLayout>
  );
};

export default HomePage;
