import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Star, CheckCircle } from 'lucide-react';
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
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat pt-32 pb-20"
        style={{ backgroundImage: "url('/assets/images/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-white">
              <p className="font-cursive text-2xl text-emerald-300">Eat Sleep And</p>
              <h1 className="text-5xl leading-tight font-bold lg:text-6xl xl:text-7xl">
                Supper delicious
                <br />
                Burger in town!
              </h1>
              <p className="max-w-md text-lg text-emerald-100">
                Food is any substance consumed to provide nutritional support for an organism.
              </p>
              <Link to="/customer/reservation">
                <Button
                  size="lg"
                  className="h-14 bg-emerald-600 px-10 text-lg font-semibold hover:bg-emerald-700"
                >
                  Book A Table
                </Button>
              </Link>
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
        <div className="absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-r from-emerald-50 to-white [clip-path:polygon(0_50%,100%_0,100%_100%,0_100%)]"></div>
      </section>

      {/* Promo Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-6 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
            {promoItems.map((item, index) => (
              <Card
                key={index}
                className="group min-w-[280px] flex-shrink-0 overflow-hidden border-2 transition-all duration-300 hover:border-emerald-600 hover:shadow-xl lg:min-w-0"
              >
                <CardContent className="relative p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 to-emerald-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative">
                    <div className="mb-6 flex h-16 items-center justify-center">
                      <div className="rounded-full bg-emerald-100 p-4 transition-transform duration-300 group-hover:scale-110">
                        <div className="h-10 w-10 rounded-full bg-emerald-600"></div>
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
              <h2 className="text-4xl leading-tight font-bold text-gray-900 lg:text-5xl">
                Caferio, Burgers, and
                <br />
                Best Pizzas <span className="text-emerald-600">in Town!</span>
              </h2>
              <p className="text-gray-600">
                The restaurants in Hangzhou also catered to many northern Chinese who had fled south
                from Kaifeng during the Jurchen invasion of the 1120s, while it is also known that
                many restaurants were run by families.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                  <span className="font-medium text-gray-700">Delicious & Healthy Foods</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                  <span className="font-medium text-gray-700">Specific Family And Kids Zone</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                  <span className="font-medium text-gray-700">Music & Other Facilities</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                  <span className="font-medium text-gray-700">Fastest Food Home Delivery</span>
                </li>
              </ul>
              <Button
                size="lg"
                className="h-14 bg-emerald-600 px-10 font-semibold hover:bg-emerald-700"
              >
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Food Menu Section */}
      <section id="food-menu" className="bg-gradient-to-b from-white to-emerald-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="mb-3 font-semibold text-emerald-600">Popular Dishes</p>
            <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
              Our Delicious <span className="text-emerald-600">Foods</span>
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
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'hover:border-emerald-600 hover:text-emerald-600'
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
                className="group overflow-hidden border-2 transition-all hover:border-emerald-600 hover:shadow-2xl"
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="h-72 w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge className="absolute top-4 left-4 bg-emerald-600 px-3 py-1 text-sm font-bold">
                    {dish.discount}
                  </Badge>
                  <Button
                    size="sm"
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 bg-emerald-600 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-emerald-700"
                  >
                    Order Now
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {dish.category}
                    </Badge>
                    <div className="flex gap-1">
                      {Array.from({ length: dish.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                      ))}
                    </div>
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">{dish.name}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-600">Price:</p>
                    <span className="text-2xl font-bold text-emerald-600">
                      ${dish.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ${dish.originalPrice.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/customer/menu">
              <Button
                size="lg"
                className="h-14 bg-emerald-600 px-10 font-semibold hover:bg-emerald-700"
              >
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* QR Ordering CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold lg:text-5xl">
                Order From Your Table
                <br />
                <span className="text-yellow-300">Scan & Enjoy!</span>
              </h2>
              <p className="text-lg text-emerald-100">
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
                    <p className="text-sm text-emerald-100">
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
                    <p className="text-sm text-emerald-100">
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
                    <p className="text-sm text-emerald-100">
                      Request assistance with a tap of a button
                    </p>
                  </div>
                </li>
              </ul>
              <Link to="/customer/table/demo">
                <Button
                  size="lg"
                  className="h-14 bg-white px-10 font-semibold text-emerald-600 hover:bg-emerald-50"
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
