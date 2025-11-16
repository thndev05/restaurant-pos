import { useState } from 'react';
import { Bell, Search, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StaffSidebar from './StaffSidebar';

export default function StaffHeader() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b bg-white px-4 sm:h-16 sm:px-6">
        {/* Left side - Mobile menu button + Search */}
        <div className="flex flex-1 items-center gap-2 sm:gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Search - hidden on mobile, visible on sm+ */}
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input placeholder="Search orders, customers..." className="pl-9" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search icon for mobile */}
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
              3
            </Badge>
          </Button>

          {/* User - Simplified on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-muted-foreground text-xs">Staff</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="animate-in slide-in-from-left absolute top-0 left-0 h-full w-64">
            <StaffSidebar />
          </div>
        </div>
      )}
    </>
  );
}
