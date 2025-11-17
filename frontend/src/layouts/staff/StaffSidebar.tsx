import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Table as TableIcon,
  ChefHat,
  Settings,
  LogOut,
  ClipboardList,
  Bell,
  DollarSign,
  Flame,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Admin navigation
const adminNavigationItems = [
  { path: '/staff/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/staff/admin/menu', icon: UtensilsCrossed, label: 'Menu Management' },
  { path: '/staff/admin/tables', icon: TableIcon, label: 'Table Management' },
  { path: '/staff/admin/staff-management', icon: Users, label: 'Staff Management' },
];

// Waiter navigation
const waiterNavigationItems = [
  { path: '/staff/waiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/staff/waiter/orders', icon: ClipboardList, label: 'Orders Queue' },
  { path: '/staff/waiter/actions', icon: Bell, label: 'Requests' },
];

// Kitchen navigation
const kitchenNavigationItems = [
  { path: '/staff/kitchen/dashboard', icon: Flame, label: 'Kitchen Display' },
];

// Cashier navigation
const cashierNavigationItems = [
  { path: '/staff/cashier/payments', icon: DollarSign, label: 'Payment Queue' },
];

// For demo purposes, showing all sections. In production, filter based on user role
const navigationSections = [
  { title: 'Admin', items: adminNavigationItems },
  { title: 'Waiter', items: waiterNavigationItems },
  { title: 'Kitchen', items: kitchenNavigationItems },
  { title: 'Cashier', items: cashierNavigationItems },
];

export default function StaffSidebar() {
  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold">Restaurant POS</h1>
          <p className="text-muted-foreground text-xs">Staff Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="space-y-1 p-4">
        <button className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
        <button className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
