import { Link } from 'react-router-dom';
import CartNavBar from '../components/cart/CartNavBar';
import CartItemList from '../components/cart/CartItemList';
import CartPrescriptionUpload from '../components/cart/CartPrescriptionUpload';
import CartOrderSummary from '../components/cart/CartOrderSummary';
import CartSupportCard from '../components/cart/CartSupportCard';
import CartFooter from '../components/cart/CartFooter';
import CartFloatingActions from '../components/cart/CartFloatingActions';

export default function CartPage() {
  return (
    <div className="bg-[#f7f9fc] font-['Inter'] min-h-screen text-[#191c1e] selection:bg-[#a3f69c] selection:text-[#002204] flex flex-col">
      <CartNavBar />
      <main className="pt-24 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto w-full flex-grow">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link className="hover:text-[#0d631b] transition-colors" to="/">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900">Cart</span>
        </nav>
        <h1 className="font-['Manrope'] text-3xl font-extrabold mb-10 text-slate-900 tracking-tight">Your Medical Cart <span className="text-lg font-normal text-slate-500 ml-2">(3 Items)</span></h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <CartItemList />
            <CartPrescriptionUpload />
          </div>
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <CartOrderSummary />
            <CartSupportCard />
          </div>
        </div>
      </main>
      <CartFooter />
      <CartFloatingActions />
    </div>
  );
}
