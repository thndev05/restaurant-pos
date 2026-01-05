import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, ChefHat, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/layouts/customer';
import { customerService } from '@/lib/api/services';
import type { MenuItem } from '@/lib/api/services/menuItems.service';

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu items and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [itemsData, categoriesData] = await Promise.all([
          customerService.getAvailableMenu(),
          customerService.getCategories(),
        ]);

        // Sort items by category priority for better display
        // Priority: Combo > Fried Chicken > Burger > Side > Drink
        const categoryPriority: Record<string, number> = {
          Combo: 1,
          'Fried Chicken': 2,
          Burger: 3,
          Side: 4,
          Drink: 5,
        };

        const sortedItems = [...itemsData].sort((a, b) => {
          const aPriority = categoryPriority[a.category?.name || ''] || 999;
          const bPriority = categoryPriority[b.category?.name || ''] || 999;
          // If same category, sort by name
          if (aPriority === bPriority) {
            return a.name.localeCompare(b.name);
          }
          return aPriority - bPriority;
        });

        setMenuItems(sortedItems);
        
        // Sort categories by priority as well
        const sortedCategories = [...categoriesData].sort((a, b) => {
          const aPriority = categoryPriority[a.name] || 999;
          const bPriority = categoryPriority[b.name] || 999;
          return aPriority - bPriority;
        });
        
        setCategories(sortedCategories);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Build category filter list
  const categoryList = ['All', ...categories.map((cat) => cat.name)];

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#FAF7F5] via-white to-[#FAF7F5]">
        {/* Loading State */}
        {loading && (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#7a1f1f]" />
              <p className="text-lg text-gray-600">Loading delicious menu...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">😞</div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Oops!</h3>
              <p className="text-lg text-gray-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-[#7a1f1f] hover:bg-[#5e1616]"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
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
              {categoryList.map((category) => (
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
                      src={item.image || '/assets/images/placeholder-food.png'}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder-food.png';
                      }}
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-lg font-bold text-white">Sold Out</span>
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
                      {item.category && (
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          {item.category.name}
                        </Badge>
                      )}
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {item.description || 'Delicious dish prepared with fresh ingredients'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-primary text-2xl font-bold">
                        ${Number(item.price).toFixed(2)}
                      </span>
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
        )}
      </div>
    </CustomerLayout>
  );
}
