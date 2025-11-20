import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts';
import { ProtectedRoute } from '@/components/auth';
import StaffLoginPage from './pages/staff/LoginPage';
import StaffLayout from './layouts/staff/StaffLayout';
// Admin Pages
import DashboardPage from './pages/staff/admin/DashboardPage';
import MenuManagementPage from './pages/staff/admin/MenuManagementPage';
import TableManagementPage from './pages/staff/admin/TableManagementPage';
import StaffManagementPage from './pages/staff/admin/StaffManagementPage';
// Waiter Pages
import WaiterDashboardPage from './pages/staff/waiter/WaiterDashboardPage';
import WaiterOrdersQueuePage from './pages/staff/waiter/WaiterOrdersQueuePage';
import WaiterOrderDetailPage from './pages/staff/waiter/WaiterOrderDetailPage';
import WaiterActionsPage from './pages/staff/waiter/WaiterActionsPage';
// Kitchen Pages
import KitchenDashboardPage from './pages/staff/kitchen/KitchenDashboardPage';
// Cashier Pages
import CashierPaymentQueuePage from './pages/staff/cashier/CashierPaymentQueuePage';
// Customer Pages
import CustomerHomePage from './pages/customer/HomePage';
import ReservationPage from './pages/customer/ReservationPage';
import MenuPage from './pages/customer/MenuPage';
import TableOrderPage from './pages/customer/TableOrderPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect root to customer home */}
          <Route path="/" element={<Navigate to="/customer/home" replace />} />

          {/* Staff Routes */}
          <Route path="/staff/login" element={<StaffLoginPage />} />

          {/* Admin Routes - Protected */}
          <Route
            path="/staff/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <StaffLayout>
                  <DashboardPage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/admin/menu"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <StaffLayout>
                  <MenuManagementPage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/admin/tables"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <StaffLayout>
                  <TableManagementPage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/admin/staff-management"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <StaffLayout>
                  <StaffManagementPage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />

          {/* Waiter Routes - Protected */}
          <Route
            path="/staff/waiter/dashboard"
            element={
              <ProtectedRoute requiredRole="WAITER">
                <StaffLayout>
                  <WaiterDashboardPage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/waiter/orders"
            element={
              <ProtectedRoute requiredRole="WAITER">
                <StaffLayout>
                  <WaiterOrdersQueuePage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/waiter/orders/:orderId"
            element={
              <ProtectedRoute requiredRole="WAITER">
                <StaffLayout>
                  <WaiterOrderDetailPage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/waiter/actions"
            element={
              <ProtectedRoute requiredRole="WAITER">
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
              <ProtectedRoute requiredRole="KITCHEN">
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
              <ProtectedRoute requiredRole="CASHIER">
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
          <Route path="/customer/table/:tableId" element={<TableOrderPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
