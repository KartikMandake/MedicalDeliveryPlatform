import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orders';
import { createRazorpayOrder, verifyPayment } from '../../api/payments';

export default function CartOrderSummary() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const totalItems = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (!cart.items?.length) return;

    setLoading(true);
    try {
      // 1. Create order in DB
      const orderRes = await createOrder({ deliveryAddress: user.address || {} });
      const order = orderRes.data;

      // 2. Create Razorpay order
      const rzpRes = await createRazorpayOrder(order.id);

      const { razorpayOrderId, amount, currency, key } = rzpRes.data;

      // 3. Open Razorpay checkout
      const options = {
        key,
        amount,
        currency,
        name: 'MedDeliver',
        description: `Order ${order.orderId}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          await verifyPayment({ ...response, orderId: order.id });
          await fetchCart();
          navigate(`/tracking?orderId=${order.id}`);
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#0d631b' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Razorpay script not loaded — fallback for dev
        alert('Razorpay not loaded. Add the Razorpay script to index.html for payments.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_16px_32px_rgba(0,110,47,0.08)] insight-glow">
      <h2 className="text-xl font-bold font-headline text-on-surface mb-6">Order Intelligence</h2>
      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Total Items</span>
          <span className="font-semibold">{String(totalItems).padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className="font-semibold">₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Clinical Delivery Fee</span>
          <span className="font-semibold text-primary">FREE</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Estimated Tax</span>
          <span className="font-semibold">₹{cart.taxes?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      <div className="bg-surface-container-low h-[1px] mb-6"></div>
      <div className="flex justify-between items-baseline mb-8">
        <span className="text-lg font-bold font-headline">Total Price</span>
        <div className="text-right">
          <span className="text-3xl font-extrabold font-headline text-primary tracking-tight">₹{cart.total?.toFixed(2) || '0.00'}</span>
          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-1">INR • Inc. All Taxes</p>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading || !cart.items?.length}
        className="w-full py-4 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold font-headline flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
        {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
      </button>
      <div className="mt-8 flex items-center gap-3 p-4 bg-primary-container/10 rounded-xl border border-primary/10">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        <p className="text-[11px] font-medium leading-relaxed text-on-primary-fixed-variant">Clinical-grade encryption protects your medical and payment data during checkout.</p>
      </div>
    </div>
  );
}
