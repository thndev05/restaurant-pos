import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, SessionProvider, NotificationProvider } from '@/contexts';
import { ProtectedRoute } from '@/components/auth';
import { Toaster } from '@/components/ui/toaster';
import StaffLoginPage from './pages/staff/LoginPage';
import StaffLayout from './layouts/staff/StaffLayout';
import ProfilePage from './pages/staff/ProfilePage';
import SettingsPage from './pages/staff/SettingsPage';
import NotificationsPage from './pages/staff/NotificationsPage';
// Admin Pages
import AdminDashboardPage from './pages/staff/admin/DashboardPage';
import MenuManagementPage from './pages/staff/admin/MenuManagementPage';
import TableManagementPage from './pages/staff/admin/TableManagementPage';
import OrderManagementPage from './pages/staff/admin/OrderManagementPage';
import StaffManagementPage from './pages/staff/admin/StaffManagementPage';
import ReservationManagementPage from './pages/staff/admin/ReservationManagementPage';
// Waiter Pages
import WaiterDashboardPage from './pages/staff/waiter/WaiterDashboardPage';
import WaiterOrdersQueuePage from './pages/staff/waiter/WaiterOrdersQueuePage';
import WaiterActionsPage from './pages/staff/waiter/WaiterActionsPage';
// Kitchen Pages
import KitchenDashboardPage from './pages/staff/kitchen/KitchenDashboardPage';
// Cashier Pages
import CashierPaymentQueuePage from './pages/staff/cashier/CashierPaymentQueuePage';
// Customer Pages
import CustomerHomePage from './pages/customer/HomePage';
import ReservationPage from './pages/customer/ReservationPage';
import MenuPage from './pages/customer/MenuPage';
import TableQRPage from './pages/customer/TableQRPage';
import TableOrderPage from './pages/customer/TableOrderPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <SessionProvider>
            <Routes>
              {/* Redirect root to customer home */}
              <Route path="/" element={<Navigate to="/customer/home" replace />} />

              {/* QR Code Entry Point - NEW */}
              <Route path="/t/:token" element={<TableQRPage />} />

              {/* Staff Routes */}
              <Route path="/staff/login" element={<StaffLoginPage />} />

              {/* Profile Route - Protected (All staff roles) */}
              <Route
                path="/staff/profile"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <ProfilePage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Settings Route - Protected (All staff roles) */}
              <Route
                path="/staff/settings"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <SettingsPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Notifications Route - Protected (All staff roles) */}
              <Route
                path="/staff/notifications"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <NotificationsPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - Protected */}
              <Route
                path="/staff/admin/dashboard"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <AdminDashboardPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/admin/menu"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <MenuManagementPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/admin/tables"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <TableManagementPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/admin/orders"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <OrderManagementPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/admin/staff-management"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <StaffManagementPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/admin/reservations"
                element={
                  <ProtectedRoute requiredPermission="module.admin.access">
                    <StaffLayout>
                      <ReservationManagementPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Waiter Routes - Protected */}
              <Route
                path="/staff/waiter/dashboard"
                element={
                  <ProtectedRoute requiredPermission="module.waiter.access">
                    <StaffLayout>
                      <WaiterDashboardPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/waiter/orders"
                element={
                  <ProtectedRoute requiredPermission="module.waiter.access">
                    <StaffLayout>
                      <WaiterOrdersQueuePage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/waiter/actions"
                element={
                  <ProtectedRoute requiredPermission="module.waiter.access">
                    <StaffLayout>
                      <WaiterActionsPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Kitchen Routes - Protected */}
              <Route
                path="/staff/kitchen/dashboard"
                element={
                  <ProtectedRoute requiredPermission="module.kitchen.access">
                    <StaffLayout>
                      <KitchenDashboardPage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Cashier Routes - Protected */}
              <Route
                path="/staff/cashier/payments"
                element={
                  <ProtectedRoute requiredPermission="module.cashier.access">
                    <StaffLayout>
                      <CashierPaymentQueuePage />
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Backward compatibility redirects */}
              <Route
                path="/staff/dashboard"
                element={<Navigate to="/staff/admin/dashboard" replace />}
              />
              <Route path="/staff/menu" element={<Navigate to="/staff/admin/menu" replace />} />
              <Route path="/staff/tables" element={<Navigate to="/staff/admin/tables" replace />} />
              <Route
                path="/staff/staff-management"
                element={<Navigate to="/staff/admin/staff-management" replace />}
              />

              {/* Customer Routes */}
              <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
              <Route path="/customer/home" element={<CustomerHomePage />} />
              <Route path="/customer/reservation" element={<ReservationPage />} />
              <Route path="/customer/menu" element={<MenuPage />} />
              <Route path="/customer/order" element={<TableOrderPage />} />
              {/* Legacy route for backward compatibility */}
              <Route
                path="/customer/table/:tableId"
                element={<Navigate to="/customer/order" replace />}
              />
            </Routes>
            <Toaster />
          </SessionProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
