import ProductsNavBar from '../components/products/ProductsNavBar';
import CartItemList from '../components/cart/CartItemList';
import CartOrderSummary from '../components/cart/CartOrderSummary';
import CartFooter from '../components/cart/CartFooter';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart } = useCart();
  const totalItems = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex flex-col">
      <ProductsNavBar />
      <main className="pt-20 pb-32 px-6 max-w-7xl mx-auto w-full flex-grow">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Precision Cart</h1>
          <p className="text-on-surface-variant font-medium">Review your clinical selections before processing. ({totalItems} items)</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            <CartItemList />
          </div>
          <aside className="lg:col-span-4 sticky top-28">
            <CartOrderSummary />
            <Link to="/products" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors py-2">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              Continue Inventory Selection
            </Link>
          </aside>
        </div>
      </main>
      <CartFooter />
    </div>
  );
}
