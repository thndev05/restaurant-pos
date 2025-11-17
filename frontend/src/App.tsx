import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to staff login */}
        <Route path="/" element={<Navigate to="/staff/login" replace />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/staff/admin/dashboard"
          element={
            <StaffLayout>
              <DashboardPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/admin/menu"
          element={
            <StaffLayout>
              <MenuManagementPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/admin/tables"
          element={
            <StaffLayout>
              <TableManagementPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/admin/staff-management"
          element={
            <StaffLayout>
              <StaffManagementPage />
            </StaffLayout>
          }
        />

        {/* Waiter Routes */}
        <Route
          path="/staff/waiter/dashboard"
          element={
            <StaffLayout>
              <WaiterDashboardPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/waiter/orders"
          element={
            <StaffLayout>
              <WaiterOrdersQueuePage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/waiter/orders/:orderId"
          element={
            <StaffLayout>
              <WaiterOrderDetailPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/waiter/actions"
          element={
            <StaffLayout>
              <WaiterActionsPage />
            </StaffLayout>
          }
        />

        {/* Kitchen Routes */}
        <Route
          path="/staff/kitchen/dashboard"
          element={
            <StaffLayout>
              <KitchenDashboardPage />
            </StaffLayout>
          }
        />

        {/* Cashier Routes */}
        <Route
          path="/staff/cashier/payments"
          element={
            <StaffLayout>
              <CashierPaymentQueuePage />
            </StaffLayout>
          }
        />

        {/* Backward compatibility redirects */}
        <Route path="/staff/dashboard" element={<Navigate to="/staff/admin/dashboard" replace />} />
        <Route path="/staff/menu" element={<Navigate to="/staff/admin/menu" replace />} />
        <Route path="/staff/tables" element={<Navigate to="/staff/admin/tables" replace />} />
        <Route
          path="/staff/staff-management"
          element={<Navigate to="/staff/admin/staff-management" replace />}
        />

        {/* Customer Routes */}
        <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
        <Route path="/customer/home" element={<CustomerHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
