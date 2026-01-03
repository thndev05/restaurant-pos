import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Star, Flame, ChefHat, Clock } from 'lucide-react';
import { CustomerLayout } from '@/layouts/customer';

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Burgers', 'Pizza', 'Pasta', 'Salads', 'Drinks', 'Desserts'];

  const menuItems = [
    {
      id: 1,
      name: 'Classic Burger',
      category: 'Burgers',
      price: 12.99,
      originalPrice: 15.99,
      rating: 5,
      image: '/assets/images/food-menu-1.png',
      isNew: true,
      prepTime: '15 min',
      isSpicy: false,
    },
    {
      id: 2,
      name: 'Cheese Pizza',
      category: 'Pizza',
      price: 15.99,
      originalPrice: 18.99,
      rating: 5,
      image: '/assets/images/food-menu-2.png',
      isNew: false,
      prepTime: '20 min',
      isSpicy: false,
    },
    {
      id: 3,
      name: 'Caesar Salad',
      category: 'Salads',
      price: 8.99,
      originalPrice: 10.99,
      rating: 4,
      image: '/assets/images/food-menu-3.png',
      isNew: false,
      prepTime: '10 min',
      isSpicy: false,
    },
    {
      id: 4,
      name: 'Spaghetti Carbonara',
      category: 'Pasta',
      price: 14.99,
      originalPrice: 17.99,
      rating: 5,
      image: '/assets/images/food-menu-4.png',
      isNew: false,
      prepTime: '25 min',
      isSpicy: false,
    },
    {
      id: 5,
      name: 'BBQ Burger',
      category: 'Burgers',
      price: 13.99,
      originalPrice: 16.99,
      rating: 5,
      image: '/assets/images/food-menu-5.png',
      isNew: true,
      prepTime: '15 min',
      isSpicy: true,
    },
    {
      id: 6,
      name: 'Margherita Pizza',
      category: 'Pizza',
      price: 13.99,
      originalPrice: 15.99,
      rating: 4,
      image: '/assets/images/food-menu-6.png',
      isNew: false,
      prepTime: '20 min',
      isSpicy: false,
    },
    {
      id: 7,
      name: 'Greek Salad',
      category: 'Salads',
      price: 9.99,
      originalPrice: 11.99,
      rating: 4,
      image: '/assets/images/food-menu-1.png',
      isNew: false,
      prepTime: '8 min',
      isSpicy: false,
    },
    {
      id: 8,
      name: 'Penne Arrabiata',
      category: 'Pasta',
      price: 12.99,
      originalPrice: 14.99,
      rating: 4,
      image: '/assets/images/food-menu-2.png',
      isNew: false,
      prepTime: '22 min',
      isSpicy: true,
    },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const discount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#FAF7F5] via-white to-[#FAF7F5]">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex animate-bounce items-center justify-center">
              <div className="rounded-full bg-gradient-to-br from-[#7a1f1f] to-[#5e1616] p-5 shadow-2xl shadow-red-900/30">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
            </div>
            <p className="mb-3 font-semibold tracking-wider text-[#7a1f1f] uppercase">
              Popular Dishes
            </p>
            <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
              Our Delicious <span className="text-[#7a1f1f]">Menu</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Discover our delicious dishes crafted with love and the finest ingredients
            </p>
          </div>

          {/* Search Bar with Enhanced Design */}
          <div className="mb-8">
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute top-1/2 left-5 h-6 w-6 -translate-y-1/2 text-[#7a1f1f]" />
              <Input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 border-2 border-gray-200 pr-4 pl-14 text-lg shadow-lg transition-all focus:border-[#7a1f1f] focus:shadow-xl focus:shadow-red-900/20"
              />
            </div>
          </div>

          {/* Category Filter with Enhanced Styling */}
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`h-11 rounded-full px-6 font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg shadow-red-900/30 hover:shadow-xl'
                    : 'hover:border-primary border-2 border-[#E6E1DE] bg-white text-gray-700 hover:bg-red-50'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid with Enhanced Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, index) => (
              <Card
                key={item.id}
                className="group overflow-hidden rounded-xl border border-[#E6E1DE] bg-white shadow-sm transition-all duration-300 hover:shadow-2xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-lg font-bold text-white">Sold Out</span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {item.originalPrice && (
                    <div className="absolute top-3 right-3">
                      <div className="rounded-full bg-[#7a1f1f] px-3 py-1 text-xs font-bold text-white shadow-lg">
                        -{discount(item.originalPrice, item.price)}%
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <Button className="w-full rounded-none bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] py-6 text-base font-bold shadow-lg hover:from-[#5e1616] hover:to-[#4a1212]">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="group-hover:text-primary text-lg leading-tight font-bold text-gray-900 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-yellow-50 px-2 py-0.5">
                      <span className="text-xs font-bold text-yellow-600">{item.rating}</span>
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-primary text-2xl font-bold">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gray-100 p-8">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">No items found</h3>
              <p className="text-lg text-gray-600">
                Try adjusting your search or filter to find what you're looking for
              </p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
