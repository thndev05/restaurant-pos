import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/layouts/customer';
import { customerService } from '@/lib/api/services';
import type { MenuItem } from '@/lib/api/services/menuItems.service';

export default function CustomerHomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Filter items by category (already sorted by priority)
  const filteredDishes =
    selectedCategory === 'All'
      ? menuItems.slice(0, 6) // Show first 6 items (already prioritized)
      : menuItems.filter((item) => item.category?.name === selectedCategory).slice(0, 6);

  // Build category list for filter buttons
  const categoryList = ['All', ...categories.slice(0, 4).map((cat) => cat.name)];

  const promoItems = [
    {
      title: 'Mexican Pizza',
      description: 'Delicious Mexican-style pizza with authentic flavors and fresh ingredients.',
      image: '/assets/images/promo-1.png',
    },
    {
      title: 'Soft Drinks',
      description: 'Refreshing beverages to complement your meal perfectly.',
      image: '/assets/images/promo-2.png',
    },
    {
      title: 'French Fry',
      description: 'Crispy golden fries seasoned to perfection.',
      image: '/assets/images/promo-3.png',
    },
    {
      title: 'Burger Kingo',
      description: 'Our signature burger with premium ingredients.',
      image: '/assets/images/promo-4.png',
    },
    {
      title: 'Chicken Masala',
      description: 'Tender chicken in rich, aromatic masala sauce.',
      image: '/assets/images/promo-5.png',
    },
  ];

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat pt-32 pb-24"
        style={{ backgroundImage: "url('/assets/images/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f1313]/90 via-[#7a1f1f]/50 to-[#7a1f1f]/10"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-white">
              <p className="font-cursive text-xl text-amber-300 sm:text-2xl">Eat Sleep And</p>
              <h1 className="font-serif text-5xl leading-[1.1] font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Supper delicious
                <br />
                Burger in town!
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-gray-100/90">
                Food is any substance consumed to provide nutritional support for an organism.
              </p>
              <div className="pt-2">
                <Link to="/customer/reservation">
                  <Button
                    size="lg"
                    className="h-14 bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] px-10 text-lg font-bold shadow-lg shadow-red-900/40 transition-all hover:from-[#5e1616] hover:to-[#4a1212] hover:shadow-xl hover:shadow-red-900/50"
                  >
                    Book A Table
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img
                src="/assets/images/hero-banner.png"
                alt="Delicious Burger"
                className="relative z-10 w-full drop-shadow-2xl"
              />
              <img
                src="/assets/images/hero-banner-bg.png"
                alt=""
                className="absolute inset-0 w-full opacity-30"
              />
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-r from-[#FAF7F5] to-white [clip-path:polygon(0_50%,100%_0,100%_100%,0_100%)]"></div>
      </section>

      {/* Promo Section */}
      <section className="bg-gradient-to-b from-[#FAF7F5] to-white py-20">
        <div className="container mx-auto px-4">
          <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-6 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
            {promoItems.map((item, index) => (
              <Card
                key={index}
                className="group min-w-[280px] flex-shrink-0 overflow-hidden border-2 transition-all duration-300 hover:border-[#7a1f1f] hover:shadow-xl lg:min-w-0"
              >
                <CardContent className="relative p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7a1f1f]/0 to-[#7a1f1f]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative">
                    <div className="mb-6 flex h-16 items-center justify-center">
                      <div className="rounded-full bg-red-100 p-4 transition-transform duration-300 group-hover:scale-110">
                        <div className="h-10 w-10 rounded-full bg-[#7a1f1f]"></div>
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h3>
                    <p className="mb-6 text-sm text-gray-600">{item.description}</p>
                    <div className="flex justify-center">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-48 w-48 object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <img
                src="/assets/images/about-banner.png"
                alt="Burger with Drinks"
                className="w-full rounded-2xl"
              />
              <img
                src="/assets/images/sale-shape-red.png"
                alt="Get up to 50% off"
                className="absolute top-0 right-0 w-48 animate-pulse"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl leading-tight font-bold tracking-tight text-gray-900 lg:text-5xl">
                Caferio, Burgers, and
                <br />
                Best Pizzas <span className="text-[#7a1f1f]">in Town!</span>
              </h2>
              <p className="leading-relaxed text-gray-600">
                The restaurants in Hangzhou also catered to many northern Chinese who had fled south
                from Kaifeng during the Jurchen invasion of the 1120s.
              </p>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg leading-tight font-bold text-gray-900">
                      Delicious & Healthy Foods
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Expertly prepared with fresh ingredients
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg leading-tight font-bold text-gray-900">
                      Family & Kids Zone
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Safe, dedicated play areas for families
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg leading-tight font-bold text-gray-900">
                      Music & Amenities
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Live entertainment and comfortable seating
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg leading-tight font-bold text-gray-900">
                      Fast Delivery
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Premium food delivered to your door
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  size="lg"
                  className="h-14 bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] px-10 font-bold shadow-lg shadow-red-900/40 transition-all hover:from-[#5e1616] hover:to-[#4a1212]"
                >
                  Order Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Menu Section */}
      <section id="food-menu" className="bg-gradient-to-b from-white to-[#FAF7F5] py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="mb-3 font-semibold text-[#7a1f1f]">Popular Dishes</p>
            <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
              Our Delicious <span className="text-[#7a1f1f]">Foods</span>
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Food is any substance consumed to provide nutritional support for an organism.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {categoryList.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={
                  category === selectedCategory
                    ? 'bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] hover:from-[#5e1616] hover:to-[#4a1212]'
                    : 'hover:border-[#7a1f1f] hover:text-[#7a1f1f]'
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#7a1f1f]" />
                <p className="text-lg text-gray-600">Loading delicious dishes...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDishes.map((dish) => (
                <Card
                  key={dish.id}
                  className="group overflow-hidden rounded-xl border border-[#E6E1DE] bg-white shadow-sm transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={dish.image || '/assets/images/placeholder-food.png'}
                      alt={dish.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder-food.png';
                      }}
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-lg leading-tight font-bold text-gray-900 transition-colors group-hover:text-[#7a1f1f]">
                        {dish.name}
                      </h3>
                      {dish.category && (
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          {dish.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#7a1f1f]">
                        ${Number(dish.price).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        className="h-9 rounded-lg bg-[#7a1f1f]/10 px-4 font-bold text-[#7a1f1f] transition-colors hover:bg-[#7a1f1f] hover:text-white"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/customer/menu">
              <Button
                size="lg"
                className="h-14 bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] px-10 font-semibold shadow-lg shadow-red-900/40 hover:from-[#5e1616] hover:to-[#4a1212]"
              >
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* QR Ordering CTA */}
      <section className="bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold lg:text-5xl">
                Order From Your Table
                <br />
                <span className="text-amber-300">Scan & Enjoy!</span>
              </h2>
              <p className="text-lg text-gray-100">
                Simply scan the QR code on your table to browse our menu, place orders, call for
                service, and request your bill - all from your smartphone!
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Browse Full Menu</p>
                    <p className="text-sm text-gray-100">
                      View all dishes with detailed images and descriptions
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Instant Ordering</p>
                    <p className="text-sm text-gray-100">
                      Order goes directly to kitchen - no waiting
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Call For Service</p>
                    <p className="text-sm text-gray-100">
                      Request assistance with a tap of a button
                    </p>
                  </div>
                </li>
              </ul>
              <Link to="/customer/table/demo">
                <Button
                  size="lg"
                  className="h-14 bg-white px-10 font-semibold text-[#7a1f1f] hover:bg-gray-100"
                >
                  Try Demo Table
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="rounded-3xl bg-white p-8 shadow-2xl">
                <QrCode className="h-64 w-64 text-gray-900" />
                <p className="mt-4 text-center font-semibold text-gray-900">Scan to Order</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .font-cursive {
          font-family: 'Shadows Into Light', cursive;
        }
      `}</style>
    </CustomerLayout>
  );
}
