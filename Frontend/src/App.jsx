import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import DashboardPatient from './pages/DashboardPatient';
import DashboardRetailer from './pages/DashboardRetailer';
import DashboardDelivery from './pages/DashboardDelivery';
import Checkout from './pages/Checkout';
import Categories from './pages/Categories';
import OrderHistory from './pages/OrderHistory';
import ShoppingCart from './pages/ShoppingCart';
import PrescriptionUpload from './pages/PrescriptionUpload';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<CreateAccount />} />
      <Route path="/dashboard-patient" element={<DashboardPatient />} />
      <Route path="/dashboard-retailer" element={<DashboardRetailer />} />
      <Route path="/dashboard-delivery" element={<DashboardDelivery />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/cart" element={<ShoppingCart />} />
      <Route path="/upload-prescription" element={<PrescriptionUpload />} />
    </Routes>
  );
}

export default App;
