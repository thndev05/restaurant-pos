import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Star, CheckCircle, Plus } from 'lucide-react';
import { CustomerLayout } from '@/layouts/customer';

export default function CustomerHomePage() {
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

  const popularDishes = [
    {
      name: 'Fried Chicken Unlimited',
      category: 'Chicken',
      image: '/assets/images/food-menu-1.png',
      price: 49.0,
      originalPrice: 69.0,
      discount: '-15%',
      rating: 5,
    },
    {
      name: 'Burger King Whopper',
      category: 'Burger',
      image: '/assets/images/food-menu-2.png',
      price: 29.0,
      originalPrice: 39.0,
      discount: '-10%',
      rating: 5,
    },
    {
      name: 'White Castle Pizzas',
      category: 'Pizza',
      image: '/assets/images/food-menu-3.png',
      price: 49.0,
      originalPrice: 69.0,
      discount: '-25%',
      rating: 5,
    },
    {
      name: 'Bell Burrito Supreme',
      category: 'Burrito',
      image: '/assets/images/food-menu-4.png',
      price: 59.0,
      originalPrice: 69.0,
      discount: '-20%',
      rating: 5,
    },
    {
      name: 'Kung Pao Chicken BBQ',
      category: 'Nuggets',
      image: '/assets/images/food-menu-5.png',
      price: 49.0,
      originalPrice: 69.0,
      discount: '-5%',
      rating: 5,
    },
    {
      name: "Wendy's Chicken",
      category: 'Chicken',
      image: '/assets/images/food-menu-6.png',
      price: 49.0,
      originalPrice: 69.0,
      discount: '-15%',
      rating: 5,
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
              <p className="font-cursive text-xl sm:text-2xl text-amber-300">Eat Sleep And</p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
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
                    className="h-14 bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] px-10 text-lg font-bold hover:from-[#5e1616] hover:to-[#4a1212] shadow-lg shadow-red-900/40 hover:shadow-xl hover:shadow-red-900/50 transition-all"
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
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 lg:text-5xl">
                Caferio, Burgers, and
                <br />
                Best Pizzas <span className="text-[#7a1f1f]">in Town!</span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The restaurants in Hangzhou also catered to many northern Chinese who had fled south
                from Kaifeng during the Jurchen invasion of the 1120s.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Delicious & Healthy Foods</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Expertly prepared with fresh ingredients</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Family & Kids Zone</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Safe, dedicated play areas for families</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Music & Amenities</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Live entertainment and comfortable seating</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <CheckCircle className="h-6 w-6 text-[#7a1f1f]" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Fast Delivery</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Premium food delivered to your door</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  size="lg"
                  className="h-14 bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] px-10 font-bold hover:from-[#5e1616] hover:to-[#4a1212] shadow-lg shadow-red-900/40 transition-all"
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
            {['All', 'Pizza', 'Burger', 'Drinks', 'Sandwich'].map((category) => (
              <Button
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                className={
                  category === 'All'
                    ? 'bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] hover:from-[#5e1616] hover:to-[#4a1212]'
                    : 'hover:border-[#7a1f1f] hover:text-[#7a1f1f]'
                }
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {popularDishes.map((dish, index) => (
              <Card
                key={index}
                className="group overflow-hidden rounded-xl border border-[#E6E1DE] bg-white shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {dish.discount && (
                    <Badge className="absolute top-3 left-3 bg-[#7a1f1f] px-2 py-1 text-xs font-bold shadow-md">
                      {dish.discount}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#7a1f1f] transition-colors">{dish.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                      <span className="text-xs font-bold text-yellow-600">{dish.rating}</span>
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-[#7a1f1f]">
                        ${dish.price.toFixed(2)}
                      </span>
                      {dish.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ${dish.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="h-9 px-4 bg-[#7a1f1f]/10 hover:bg-[#7a1f1f] text-[#7a1f1f] hover:text-white rounded-lg transition-colors font-bold"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/customer/menu">
              <Button
                size="lg"
                className="h-14 bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] px-10 font-semibold hover:from-[#5e1616] hover:to-[#4a1212] shadow-lg shadow-red-900/40"
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
