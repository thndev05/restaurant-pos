import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from './contexts/OrderContext';
import LoginPage from './pages/LoginPage';
import {
  StaffHomePage,
  StaffTablesPage,
  StaffCustomersPage,
  StaffOrdersPage,
  StaffPaymentPage,
} from './pages/staff';
import { CustomerHomePage } from './pages/customer';

function App() {
  return (
    <Router>
      <OrderProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Staff Routes */}
          <Route path="/staff/home" element={<StaffHomePage />} />
          <Route path="/staff/tables" element={<StaffTablesPage />} />
          <Route path="/staff/customers" element={<StaffCustomersPage />} />
          <Route path="/staff/orders" element={<StaffOrdersPage />} />
          <Route path="/staff/payment" element={<StaffPaymentPage />} />

          {/* Customer Routes */}
          <Route path="/customer/home" element={<CustomerHomePage />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </OrderProvider>
    </Router>
  );
}

export default App;
