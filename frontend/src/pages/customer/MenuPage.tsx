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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex animate-bounce items-center justify-center">
              <div className="rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 shadow-2xl shadow-emerald-600/30">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
            </div>
            <p className="mb-3 font-semibold tracking-wider text-emerald-600 uppercase">
              Popular Dishes
            </p>
            <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
              Our Delicious <span className="text-emerald-600">Menu</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Discover our delicious dishes crafted with love and the finest ingredients
            </p>
          </div>

          {/* Search Bar with Enhanced Design */}
          <div className="mb-8">
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute top-1/2 left-5 h-6 w-6 -translate-y-1/2 text-emerald-600" />
              <Input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 border-2 border-emerald-200 pr-4 pl-14 text-lg shadow-lg transition-all focus:border-emerald-600 focus:shadow-xl focus:shadow-emerald-600/20"
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
                className={`h-12 px-8 text-base font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/40'
                    : 'border-2 border-emerald-200 hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-emerald-50'
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
                className="group overflow-hidden border-2 border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-600 hover:shadow-2xl hover:shadow-emerald-600/20"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.isNew && (
                      <Badge className="animate-pulse bg-green-500 text-white shadow-lg">NEW</Badge>
                    )}
                    {item.isSpicy && (
                      <Badge className="bg-red-500 text-white shadow-lg">
                        <Flame className="mr-1 h-3 w-3" />
                        Spicy
                      </Badge>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {item.originalPrice && (
                    <div className="absolute top-3 right-3">
                      <div className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
                        -{discount(item.originalPrice, item.price)}%
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <Button className="w-full rounded-none bg-gradient-to-r from-emerald-600 to-emerald-700 py-6 text-lg font-semibold shadow-lg hover:from-emerald-700 hover:to-emerald-800">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      {item.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 transition-all ${
                            i < item.rating
                              ? 'fill-emerald-500 text-emerald-500'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-gray-600">
                        ({item.rating}.0)
                      </span>
                    </div>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-emerald-600">
                    {item.name}
                  </h3>

                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{item.prepTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-emerald-600">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
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
