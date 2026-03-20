import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import TrackingPage from './pages/TrackingPage';
import DashboardPage from './pages/DashboardPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PaymentsPage from './pages/PaymentsPage';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agent" element={<AgentDashboardPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
