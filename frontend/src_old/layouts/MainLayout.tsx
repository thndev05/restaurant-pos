import type { FC, ReactNode } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default MainLayout;
