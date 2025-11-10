import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from './contexts/OrderContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TablesPage from './pages/TablesPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <Router>
      <OrderProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </OrderProvider>
    </Router>
  );
}

export default App;
