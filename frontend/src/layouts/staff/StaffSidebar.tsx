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
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const navigationItems = [
  { path: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/staff/menu', icon: UtensilsCrossed, label: 'Menu Management' },
  { path: '/staff/tables', icon: TableIcon, label: 'Table Management' },
  { path: '/staff/staff-management', icon: Users, label: 'Staff Management' },
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
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
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
