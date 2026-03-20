import { useState } from 'react';
import ProductsSidebar from '../components/products/ProductsSidebar';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductsPagination from '../components/products/ProductsPagination';
import CartNavBar from '../components/cart/CartNavBar';
import CartFloatingActions from '../components/cart/CartFloatingActions';
import CartFooter from '../components/cart/CartFooter';
import { addToCart } from '../lib/api';
import { DEMO_PRODUCTS, DEMO_USER_ID } from '../lib/constants';

export default function ProductsPage() {
  const [addingMedicineId, setAddingMedicineId] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleAddToCart = async (medicineId) => {
    try {
      setAddingMedicineId(medicineId);
      await addToCart({ userId: DEMO_USER_ID, medicineId, quantity: 1 });
      setFeedback({ type: 'success', message: 'Added to cart successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Could not add item to cart' });
    } finally {
      setAddingMedicineId('');
      setTimeout(() => {
        setFeedback({ type: '', message: '' });
      }, 2200);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">
      <CartNavBar />
      <main className="pt-24 pb-20 px-6 lg:px-8 max-w-screen-2xl mx-auto w-full flex-grow">
        {feedback.message && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {feedback.message}
          </div>
        )}
        <div className="flex gap-8 xl:gap-10">
          <ProductsSidebar />
          <section className="flex-1">
            <ProductsGrid
              products={DEMO_PRODUCTS}
              onAddToCart={handleAddToCart}
              addingMedicineId={addingMedicineId}
            />
            <ProductsPagination />
          </section>
        </div>
      </main>
      <CartFooter />
      <CartFloatingActions />
    </div>
  );
}
