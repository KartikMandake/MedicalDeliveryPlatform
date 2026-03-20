import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CartNavBar from '../components/cart/CartNavBar';
import CartItemList from '../components/cart/CartItemList';
import CartPrescriptionUpload from '../components/cart/CartPrescriptionUpload';
import CartOrderSummary from '../components/cart/CartOrderSummary';
import CartFooter from '../components/cart/CartFooter';
import CartFloatingActions from '../components/cart/CartFloatingActions';
import { getCart, updateCartItemQuantity } from '../lib/api';
import { DEMO_USER_ID } from '../lib/constants';

export default function CartPage() {
  const [cartData, setCartData] = useState({
    items: [],
    summary: { totalItems: 0, subtotal: 0, deliveryFee: 0, totalAmount: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCart = useCallback(async () => {
    try {
      setError('');
      const data = await getCart(DEMO_USER_ID);
      setCartData(data);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (medicineId, delta) => {
    const currentItem = cartData.items.find((item) => item.medicine_id === medicineId);
    if (!currentItem) {
      return;
    }

    const nextQuantity = Number(currentItem.quantity) + delta;
    try {
      await updateCartItemQuantity({ itemId: currentItem.id, quantity: Math.max(nextQuantity, 0) });
      await loadCart();
    } catch (updateError) {
      setError(updateError.message || 'Failed to update quantity');
    }
  };

  return (
    <div className="bg-[#f7f9fc] font-['Inter'] min-h-screen text-[#191c1e] selection:bg-[#a3f69c] selection:text-[#002204] flex flex-col">
      <CartNavBar />
      <main className="pt-24 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto w-full flex-grow">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link className="hover:text-[#0d631b] transition-colors" to="/">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900">Cart</span>
        </nav>
        <h1 className="font-['Manrope'] text-3xl font-extrabold mb-10 text-slate-900 tracking-tight">
          Your Medical Cart{' '}
          <span className="text-lg font-normal text-slate-500 ml-2">({cartData.summary.totalItems || 0} Items)</span>
        </h1>

        {isLoading && <p className="text-sm text-slate-500 mb-5">Loading cart...</p>}
        {error && <p className="text-sm text-red-600 mb-5">{error}</p>}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <CartItemList items={cartData.items || []} onQuantityChange={handleQuantityChange} />
            <CartPrescriptionUpload />
          </div>
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <CartOrderSummary summary={cartData.summary} />
          </div>
        </div>
      </main>
      <CartFooter />
      <CartFloatingActions />
    </div>
  );
}
