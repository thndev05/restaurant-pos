import type { FC, ReactNode } from 'react';

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout: FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="from-primary to-secondary flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br text-xl font-bold text-white">
                🍽️
              </div>
              <h1 className="text-text-dark text-2xl font-bold">Restaurant POS</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-gray text-sm">Welcome, Guest!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white py-4 shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <p className="text-text-gray text-sm">© 2024 Restaurant POS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
