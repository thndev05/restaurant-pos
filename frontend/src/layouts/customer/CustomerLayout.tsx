import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  UtensilsCrossed,
  Menu as MenuIcon,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';
import { useState } from 'react';

interface CustomerLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function CustomerLayout({ children, showFooter = true }: CustomerLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200/20 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link
            to="/customer/home"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="rounded-full bg-gradient-to-br from-[#7a1f1f] to-[#5e1616] p-2">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              Restaurant<span className="text-[#7a1f1f]">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/customer/home"
              className={`font-medium transition-colors ${isActive('/customer/home') ? 'text-[#7a1f1f]' : 'text-gray-700 hover:text-[#7a1f1f]'}`}
            >
              Home
            </Link>
            <Link
              to="/customer/menu"
              className={`font-medium transition-colors ${isActive('/customer/menu') ? 'text-[#7a1f1f]' : 'text-gray-700 hover:text-[#7a1f1f]'}`}
            >
              Menu
            </Link>
            <Link
              to="/customer/reservation"
              className={`font-medium transition-colors ${isActive('/customer/reservation') ? 'text-[#7a1f1f]' : 'text-gray-700 hover:text-[#7a1f1f]'}`}
            >
              Reservation
            </Link>
            <a
              href="#contact"
              className="font-medium text-gray-700 transition-colors hover:text-[#7a1f1f]"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/customer/reservation" className="hidden md:block">
              <Button className="h-11 bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] px-8 font-medium shadow-lg shadow-red-900/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-900/40">
                Book Now
              </Button>
            </Link>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="animate-in slide-in-from-top border-t bg-white duration-200 md:hidden">
            <nav className="container mx-auto flex flex-col px-4 py-4">
              <Link
                to="/customer/home"
                className={`py-3 font-medium transition-colors ${isActive('/customer/home') ? 'text-[#7a1f1f]' : 'text-gray-700 hover:text-[#7a1f1f]'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/customer/menu"
                className={`py-3 font-medium transition-colors ${isActive('/customer/menu') ? 'text-[#7a1f1f]' : 'text-gray-700 hover:text-[#7a1f1f]'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                to="/customer/reservation"
                className={`py-3 font-medium transition-colors ${isActive('/customer/reservation') ? 'text-[#7a1f1f]' : 'text-gray-700 hover:text-[#7a1f1f]'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Reservation
              </Link>
              <a
                href="#contact"
                className="py-3 font-medium text-gray-700 hover:text-[#7a1f1f]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link
                to="/customer/reservation"
                className="pt-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-gradient-to-r from-[#7a1f1f] to-[#5e1616] hover:from-[#5e1616] hover:to-[#4a1212]">
                  Book Now
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">{children}</main>

      {/* Footer */}
      {showFooter && (
        <footer
          id="contact"
          className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-10 text-white"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,157,45,0.3),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,90,95,0.2),transparent_50%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="space-y-6">
                <Link to="/customer/home" className="flex items-center gap-2">
                  <div className="rounded-full bg-gradient-to-br from-[#7a1f1f] to-[#5e1616] p-2">
                    <UtensilsCrossed className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold tracking-tight">
                    Restaurant<span className="text-[#7a1f1f]">.</span>
                  </span>
                </Link>
                <p className="text-gray-400">
                  Experience the finest dining with our delicious menu crafted by expert chefs.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="group">
                    <div className="rounded-full bg-gray-800 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#7a1f1f]">
                      <Facebook className="h-5 w-5" />
                    </div>
                  </a>
                  <a href="#" className="group">
                    <div className="rounded-full bg-gray-800 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#7a1f1f]">
                      <Twitter className="h-5 w-5" />
                    </div>
                  </a>
                  <a href="#" className="group">
                    <div className="rounded-full bg-gray-800 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#7a1f1f]">
                      <Instagram className="h-5 w-5" />
                    </div>
                  </a>
                  <a href="#" className="group">
                    <div className="rounded-full bg-gray-800 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#7a1f1f]">
                      <Youtube className="h-5 w-5" />
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="mb-6 text-lg font-bold">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/customer/home"
                      className="text-gray-400 transition-colors hover:text-[#7a1f1f]"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/customer/menu"
                      className="text-gray-400 transition-colors hover:text-[#7a1f1f]"
                    >
                      Our Menu
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/customer/reservation"
                      className="text-gray-400 transition-colors hover:text-[#7a1f1f]"
                    >
                      Reservations
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="text-gray-400 transition-colors hover:text-[#7a1f1f]"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="mb-6 text-lg font-bold">Contact Us</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-[#7a1f1f]" />
                    <span className="text-gray-400">
                      VKU University, 470 Tran Dai Nghia
                      <br />
                      Ngu Hanh Son, Da Nang
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-5 w-5 flex-shrink-0 text-[#7a1f1f]" />
                    <a
                      href="tel:+842363653561"
                      className="text-gray-400 transition-colors hover:text-[#7a1f1f]"
                    >
                      +84 236 3653 561
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0 text-[#7a1f1f]" />
                    <a
                      href="mailto:contact@vku.udn.vn"
                      className="text-gray-400 transition-colors hover:text-[#7a1f1f]"
                    >
                      contact@vku.udn.vn
                    </a>
                  </li>
                </ul>
              </div>

              {/* Opening Hours */}
              <div>
                <h3 className="mb-6 text-lg font-bold">Opening Hours</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between text-gray-400">
                    <span>Monday - Friday</span>
                    <span className="font-medium text-white">10:00 - 22:00</span>
                  </li>
                  <li className="flex justify-between text-gray-400">
                    <span>Saturday</span>
                    <span className="font-medium text-white">09:00 - 23:00</span>
                  </li>
                  <li className="flex justify-between text-gray-400">
                    <span>Sunday</span>
                    <span className="font-medium text-white">09:00 - 23:00</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 border-t border-gray-700 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 Restaurant. All rights reserved. Made with{' '}
                <span className="text-red-500">❤</span>
              </p>
            </div>
          </div>

          {/* Decorative Bottom Illustration */}
          <div className="absolute right-0 bottom-0 left-0 h-32 opacity-20">
            <img
              src="/assets/images/footer-illustration.png"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </footer>
      )}
    </div>
  );
}
