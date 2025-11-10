import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiShoppingBag, FiSettings } from 'react-icons/fi';
import { MdTableBar } from 'react-icons/md';
import { PiReceiptBold } from 'react-icons/pi';
import { cn } from '../utils/helpers';

const Sidebar: FC = () => {
  const navItems = [
    { id: 'home', icon: FiHome, title: 'Home', path: '/home' },
    { id: 'tables', icon: MdTableBar, title: 'Tables', path: '/tables' },
    { id: 'customers', icon: FiUsers, title: 'Customers', path: '/customers' },
    { id: 'orders', icon: PiReceiptBold, title: 'Orders', path: '/orders' },
  ];

  return (
    <aside className="z-10 flex w-18 flex-col items-center bg-white py-5 shadow-md">
      {/* Logo */}
      <div className="from-primary to-secondary mb-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white">
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
              className={({ isActive }) =>
                cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200',
                  'text-text-gray hover:bg-background',
                  isActive && 'bg-primary hover:bg-primary-hover text-white'
                )
              }
            >
              <Icon size={24} />
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <button
        title="Settings"
        className="text-text-gray hover:bg-background flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200"
      >
        <FiSettings size={24} />
      </button>
    </aside>
  );
};

export default Sidebar;
