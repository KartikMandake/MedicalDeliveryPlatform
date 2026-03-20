import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import CreateAccount from './CreateAccount';
import DashboardPatient from './DashboardPatient';
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
      <Route path="/categories" element={<Categories />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/cart" element={<ShoppingCart />} />
      <Route path="/upload-prescription" element={<PrescriptionUpload />} />
    </Routes>
  );
}

export default App;
