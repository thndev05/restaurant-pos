import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Calendar,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts';

// Admin navigation
const adminNavigationItems = [
  { path: '/staff/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/staff/admin/menu', icon: UtensilsCrossed, label: 'Menu Management' },
  { path: '/staff/admin/tables', icon: TableIcon, label: 'Table Management' },
  { path: '/staff/admin/reservations', icon: Calendar, label: 'Reservations' },
  { path: '/staff/admin/orders', icon: ClipboardList, label: 'Order Management' },
  { path: '/staff/admin/payments', icon: DollarSign, label: 'Payments' },
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

export default function StaffSidebar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/staff/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter navigation based on module access permissions
  const getNavigationSections = () => {
    if (!user) return [];

    const sections = [];

    // Admin/Manager module - management features
    if (hasPermission('module.admin.access')) {
      sections.push({ title: 'Admin', items: adminNavigationItems });
    }
    // Waiter module - accessible by Admin, Manager, and Waiters
    if (hasPermission('module.waiter.access')) {
      sections.push({ title: 'Waiter', items: waiterNavigationItems });
    }
    // Kitchen module - accessible by Admin, Manager, and Kitchen staff
    if (hasPermission('module.kitchen.access')) {
      sections.push({ title: 'Kitchen', items: kitchenNavigationItems });
    }
    // Cashier module - accessible by Admin, Manager, and Cashiers
    if (hasPermission('module.cashier.access')) {
      sections.push({ title: 'Cashier', items: cashierNavigationItems });
    }

    return sections;
  };

  const visibleSections = getNavigationSections();

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

      {/* User Info Card */}
      {user && (
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user.role.displayName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {visibleSections.map((section) => (
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
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and need to sign in again to access the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
