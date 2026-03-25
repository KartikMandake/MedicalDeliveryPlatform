import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartOrderSummary() {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const totalItems = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (!cart.items?.length) return;

    setLoading(true);
    try {
      navigate('/checkout');
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[1.5rem] p-8 shadow-xl border border-slate-200/60 sticky top-28 xl:top-32 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

      <h2 className="text-2xl font-extrabold font-headline text-slate-900 mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-emerald-600 p-2 bg-emerald-50 rounded-xl">receipt_long</span>
        Order Summary
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Total Items</span>
          <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{String(totalItems).padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Subtotal</span>
          <span className="font-bold text-slate-800">₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Estimated Tax</span>
          <span className="font-bold text-slate-800">₹{cart.taxes?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between items-center text-sm p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50 mt-2">
          <span className="text-emerald-700 font-bold flex items-center gap-2">
             <span className="material-symbols-outlined text-[16px]">local_shipping</span> 
             Delivery Fee
          </span>
          <span className="font-black text-emerald-600 uppercase tracking-widest text-[11px]">Free</span>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>
      
      <div className="flex justify-between items-end mb-8 relative">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Total Payable</span>
          <span className="text-3xl font-black font-headline text-[#15803d] tracking-tight leading-none drop-shadow-sm">₹{cart.total?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">INR • Inc. Taxes</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || !cart.items?.length}
        className="w-full py-4 px-6 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center gap-3 transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin">refresh</span>
        ) : (
          <>
            Proceed to Checkout
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </>
        )}
      </button>

      <div className="mt-6 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <span className="material-symbols-outlined text-emerald-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        <p className="text-[11px] font-medium leading-relaxed text-slate-500">
          State-of-the-art encryption ensures your clinical order details and payment information are <strong className="text-slate-700">100% secure</strong>.
        </p>
      </div>
    </div>
  );
}
