import type { FC, ReactNode } from 'react';
import StaffSidebar from './StaffSidebar';

interface StaffLayoutProps {
  children: ReactNode;
}

const StaffLayout: FC<StaffLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <StaffSidebar />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default StaffLayout;
