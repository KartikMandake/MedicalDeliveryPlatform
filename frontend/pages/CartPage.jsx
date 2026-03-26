import ProductsNavBar from '../components/products/ProductsNavBar';
import CartItemList from '../components/cart/CartItemList';
import CartOrderSummary from '../components/cart/CartOrderSummary';
import MediGuardPanel from '../components/cart/MediGuardPanel';
import ProductsFooter from '../components/products/ProductsFooter';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart } = useCart();
  const totalItems = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div className="bg-[#f8f9fa] font-body text-slate-900 fixed inset-0 overflow-y-auto overflow-x-hidden flex flex-col pt-20">
      <ProductsNavBar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
        
        <header className="mb-10 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">Order Staging</p>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-slate-900 mb-3">Precision Cart</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto md:mx-0 leading-relaxed text-sm md:text-base">
            Review your clinical selections and e-commerce additions before dispatch. You currently have <span className="font-bold text-slate-800">{String(totalItems).padStart(2, '0')}</span> items buffered.
          </p>
        </header>

        {/* AI Safety & Insights Panels */}
        <div className="space-y-4 mb-8">
          <MediGuardPanel cartItemCount={(cart.items || []).length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          <div className="lg:col-span-8 space-y-6">
            <CartItemList />
          </div>
          
          <aside className="lg:col-span-4 relative z-10 w-full h-full">
            <div className="sticky top-28">
              <CartOrderSummary />
              <Link to="/products" className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors py-3 group">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Continue Procurement
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <ProductsFooter />
    </div>
  );
}
