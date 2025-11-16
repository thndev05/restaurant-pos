import type { FC, ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default AdminLayout;
