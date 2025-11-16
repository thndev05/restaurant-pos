import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { FiShoppingBag, FiSettings, FiLogOut, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { MdTableBar, MdRestaurantMenu } from 'react-icons/md';
import { cn } from '../../utils/helpers';

const AdminSidebar: FC = () => {
  const navItems = [
    { id: 'dashboard', icon: FiBarChart2, title: 'Dashboard', path: '/admin/dashboard' },
    { id: 'menu', icon: MdRestaurantMenu, title: 'Menu', path: '/admin/menu' },
    { id: 'tables', icon: MdTableBar, title: 'Tables', path: '/admin/tables' },
    { id: 'staff', icon: FiUsers, title: 'Staff', path: '/admin/staff' },
  ];

  return (
    <aside className="z-10 flex w-18 flex-col items-center bg-white py-5 shadow-md">
      {/* Logo */}
      <div className="from-primary to-secondary mb-10 flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br text-xl font-bold text-white">
        <FiShoppingBag />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={item.title}
              end
              className={({ isActive }) =>
                cn(
                  'group relative flex h-12 w-12 items-center justify-center rounded-xl',
                  'transition-all duration-300 ease-in-out',
                  isActive
                    ? 'bg-primary shadow-primary/20 shadow-md'
                    : 'text-text-gray hover:bg-background hover:text-text-dark'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={24}
                    className={cn(
                      'transition-all duration-300',
                      isActive ? 'scale-110 text-white' : 'scale-100 group-hover:scale-105'
                    )}
                  />
                  {isActive && (
                    <div className="absolute top-1/2 -left-1 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="flex flex-col gap-3">
        <button
          title="Settings"
          className="text-text-gray hover:bg-background flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200"
        >
          <FiSettings size={24} />
        </button>
        <button
          title="Logout"
          className="text-text-gray hover:bg-background hover:text-danger flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200"
        >
          <FiLogOut size={24} />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
