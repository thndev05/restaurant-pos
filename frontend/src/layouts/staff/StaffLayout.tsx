import type { ReactNode } from 'react';
import StaffSidebar from './StaffSidebar';
import StaffHeader from './StaffHeader';

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block">
        <StaffSidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
