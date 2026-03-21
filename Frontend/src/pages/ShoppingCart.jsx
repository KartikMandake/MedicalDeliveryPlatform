import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ShoppingCart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(true);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setCartSubtotal(data.subtotal || 0);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (paymentMethod === 'cod') {
        const res = await fetch('http://localhost:5000/api/orders/checkout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          navigate('/orders');
        } else {
          const d = await res.json();
          alert(d.error || 'Failed to checkout');
        }
        return;
      }

      // Online Payment Flow
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you connected to the internet?');
        return;
      }

      const orderDataRes = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = await orderDataRes.json();
      
      if (!orderDataRes.ok) {
        alert(orderData.error);
        return;
      }

      const options = {
        key: 'rzp_test_STqzlnaDBvb1ko', // Safely passing Public ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MediFlow Clinical',
        description: 'Secure transaction for Medical Supplies',
        order_id: orderData.orderId,
        handler: async function (response) {
          const verifyData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            internal_order_id: orderData.internalOrderId
          };

          const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(verifyData)
          });
          
          if (verifyRes.ok) {
            navigate('/orders');
          } else {
            alert('Payment cryptographic verification failed!');
          }
        },
        prefill: {
          name: 'Patient User',
          email: 'patient@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#006e2f'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert('Error connecting during checkout');
    }
  };

  const tax = cartSubtotal * 0.00; // Flat 0% for demo
  const deliveryFee = items.length > 0 ? 5.00 : 0.00;
  const total = cartSubtotal + tax + deliveryFee;

  return (
    <div className="bg-background font-body text-on-surface min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/dashboard-patient" className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</Link>
            <div className="hidden md:flex gap-6 items-center">
              <Link to="/dashboard-patient" className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200">Home</Link>
              <Link to="/categories" className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200">Categories</Link>
              <Link to="/orders" className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200">Orders</Link>
              <a className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200" href="#">Help</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 text-zinc-900 font-bold bg-zinc-100 rounded-lg transition-all scale-95 active:opacity-80">
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
            <img
              alt="User Avatar"
              className="w-8 h-8 rounded-full border border-outline-variant/30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw-ZZ-051kYNh6hwKhGTFTwX-rd_lPuEyObLsKYY3zMNa3epokt87siyTj7PzqBLLmdoFOc3sp_ym6akkVpLQ5Yosf0mUysNwpsEQrdEmfugL2AQQIN0MhmyuQB0NK4fOm9b6Mde70fuToTHzjLZzZ47-KoqQiZO5QtvO1klQrhlp0VM994Qr5oxElrRxqlXHF5YkdXq0xa27mDZ9FEXihCRhm8o4Ux71Nc-IpAliu6KEUi6YQxRAk0xvEVb248yHaTEgBVg82NE-e"
            />
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px]"></div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Precision Cart</h1>
          <p className="text-on-surface-variant font-medium">Review your clinical selections before processing.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <p className="text-zinc-500 p-8">Loading cart data securely based on your session...</p>
            ) : items.length > 0 ? items.map((item) => (
              <div key={item.cartItemId} className="bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center group transition-all duration-200 hover:translate-x-1 shadow-[0_8px_24px_rgba(25,28,29,0.04)]">
                <div className="w-32 h-32 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
                  <img alt={item.name} className="w-full h-full object-cover" src={item.image || 'https://via.placeholder.com/150'} />
                </div>
                <div className="flex-grow space-y-2 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest font-headline block mb-1 text-primary">
                        {item.brand}
                      </span>
                      <h3 className="text-lg font-bold font-headline text-on-surface leading-tight">{item.name}</h3>
                      {item.rxRequired && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block mt-2">RX Required</span>}
                    </div>
                    <span className="text-xl font-bold font-headline text-on-surface">${Number(item.total).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 gap-4">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity.toString().padStart(2, '0')}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-6xl text-zinc-300 mb-4">shopping_cart_off</span>
                <p className="text-zinc-500">Your cart is empty.</p>
                <Link to="/categories" className="text-primary font-bold hover:underline mt-4 inline-block">Back to Inventory</Link>
              </div>
            )}
          </div>

          {/* RIGHT: Summary */}
          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_16px_32px_rgba(0,110,47,0.08)] insight-glow">
              <h2 className="text-xl font-bold font-headline text-on-surface mb-6">Order Intelligence</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Total Items</span>
                  <span className="font-semibold">{items.reduce((acc, i) => acc + i.quantity, 0).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-semibold">${Number(cartSubtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Clinical Delivery Fee</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? 'text-primary' : 'text-zinc-900'}`}>
                    {items.length === 0 ? '$0.00' : '$5.00'}
                  </span>
                </div>
              </div>
              <div className="bg-surface-container-low h-[1px] mb-6"></div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="text-lg font-bold font-headline">Total Price</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold font-headline text-primary tracking-tight">${Number(total).toFixed(2)}</span>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-1">USD • Inc. All Taxes</p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mb-8 space-y-3">
                <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2 block">Payment Method</span>
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-zinc-100 hover:border-primary/30'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${paymentMethod === 'online' ? 'text-primary' : 'text-zinc-400'}`}>credit_card</span>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'online' ? 'text-primary' : 'text-zinc-700'}`}>Online Payment</p>
                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Razorpay • UPI, Cards, Netbanking</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary' : 'border-zinc-300'}`}>
                    {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                  </div>
                  <input type="radio" className="hidden" name="payment" value="online" checked={paymentMethod === 'online'} onChange={(e) => setPaymentMethod(e.target.value)} />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-zinc-100 hover:border-primary/30'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${paymentMethod === 'cod' ? 'text-primary' : 'text-zinc-400'}`}>local_shipping</span>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'cod' ? 'text-primary' : 'text-zinc-700'}`}>Cash on Delivery</p>
                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Pay at designated delivery point</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-zinc-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                  </div>
                  <input type="radio" className="hidden" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                </label>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full py-4 px-6 rounded-full btn-primary-gradient text-white font-bold font-headline flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="mt-8 flex items-center gap-3 p-4 bg-primary-container/10 rounded-xl border border-primary/10">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <p className="text-[11px] font-medium leading-relaxed text-on-primary-fixed-variant">Clinical-grade encryption protects your medical and payment data during checkout.</p>
              </div>
            </div>
            <Link to="/categories" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors py-2">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              Continue Inventory Selection
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ShoppingCart;
