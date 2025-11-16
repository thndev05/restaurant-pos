import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StaffLoginPage from './pages/staff/LoginPage';
import StaffLayout from './layouts/staff/StaffLayout';
import DashboardPage from './pages/staff/admin/DashboardPage';
import MenuManagementPage from './pages/staff/admin/MenuManagementPage';
import TableManagementPage from './pages/staff/admin/TableManagementPage';
import StaffManagementPage from './pages/staff/admin/StaffManagementPage';
import CustomerHomePage from './pages/customer/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to staff login */}
        <Route path="/" element={<Navigate to="/staff/login" replace />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route
          path="/staff/dashboard"
          element={
            <StaffLayout>
              <DashboardPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/menu"
          element={
            <StaffLayout>
              <MenuManagementPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/tables"
          element={
            <StaffLayout>
              <TableManagementPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/staff-management"
          element={
            <StaffLayout>
              <StaffManagementPage />
            </StaffLayout>
          }
        />

        {/* Customer Routes */}
        <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
        <Route path="/customer/home" element={<CustomerHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
