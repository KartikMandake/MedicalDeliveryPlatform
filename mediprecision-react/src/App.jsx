import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import CreateAccount from './CreateAccount';
import DashboardPatient from './DashboardPatient';
import DashboardRetailer from './DashboardRetailer';
import DashboardDelivery from './DashboardDelivery';
import Checkout from './Checkout';
import Categories from './Categories';
import OrderHistory from './OrderHistory';
import ShoppingCart from './ShoppingCart';
import PrescriptionUpload from './PrescriptionUpload';

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
