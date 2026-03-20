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
    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
      <div className="space-y-4 text-sm mb-8">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal ({cart.items?.length || 0} items)</span>
          <span className="font-bold text-slate-900">₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Delivery Fee</span>
          <span className="font-bold text-[#0d631b]">FREE</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Est. Taxes (5%)</span>
          <span className="font-bold text-slate-900">₹{cart.taxes?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="h-px bg-slate-100 my-2" />
        <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2">
          <span>Total</span>
          <span>₹{cart.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading || !cart.items?.length}
        className="w-full bg-[#0d631b] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:opacity-95 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
        {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
      </button>
      <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
        <span className="material-symbols-outlined text-[#0d631b]">local_shipping</span>
        <p className="text-xs font-medium text-slate-600">Free climate-controlled delivery on all medical orders.</p>
      </div>
    </div>
  );
}
