import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CartNavBar from '../components/cart/CartNavBar';
import CartFooter from '../components/cart/CartFooter';
import CartFloatingActions from '../components/cart/CartFloatingActions';
import { getCart, placeOrder } from '../lib/api';
import { DEMO_CHECKOUT_PROFILE, DEMO_PRODUCTS, DEMO_USER_ID } from '../lib/constants';

const PRODUCT_IMAGE_BY_ID = DEMO_PRODUCTS.reduce((acc, product) => {
  acc[product.id] = product.image;
  return acc;
}, {});

function getItemImage(item) {
  const rawImage = item.images?.[0];
  if (rawImage && /^https?:\/\//i.test(rawImage)) {
    return rawImage;
  }
  return PRODUCT_IMAGE_BY_ID[item.medicine_id] || 'https://via.placeholder.com/160x160?text=Medicine';
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState(DEMO_CHECKOUT_PROFILE.addresses[0]?.id || 'home');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [cartData, setCartData] = useState({
    items: [],
    summary: { totalItems: 0, subtotal: 0, deliveryFee: 0, totalAmount: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      try {
        const data = await getCart(DEMO_USER_ID);
        if (active) {
          setCartData(data);
          setError('');
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Failed to load cart for checkout');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      active = false;
    };
  }, []);

  const selectedAddress = useMemo(
    () => DEMO_CHECKOUT_PROFILE.addresses.find((address) => address.id === selectedAddressId) || DEMO_CHECKOUT_PROFILE.addresses[0],
    [selectedAddressId]
  );

  const requiresPrescription = cartData.items.some((item) => item.requires_rx);

  const handlePlaceOrder = async () => {
    if ((cartData.items || []).length === 0 || isPlacingOrder) {
      return;
    }

    try {
      setPlaceOrderError('');
      setIsPlacingOrder(true);

      const result = await placeOrder({
        userId: DEMO_USER_ID,
        deliveryAddress: selectedAddress,
        paymentMethod: selectedPayment,
      });

      const nextOrderNumber = result?.order?.orderNumber;
      if (!nextOrderNumber) {
        throw new Error('Order placed, but tracking id is missing');
      }

      navigate(`/tracking?orderNumber=${nextOrderNumber}`);
    } catch (placeError) {
      setPlaceOrderError(placeError.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body antialiased min-h-screen flex flex-col">
      <CartNavBar />

      <main className="pt-24 pb-32 px-4 max-w-7xl mx-auto w-full flex-grow">
        <div className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link className="hover:text-[#0d631b] transition-colors" to="/">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link className="hover:text-[#0d631b] transition-colors" to="/cart">Cart</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900">Checkout</span>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -translate-y-1/2 -z-10" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold font-headline shadow-[0_0_20px_rgba(34,197,94,0.2)]">1</div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">Address</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold font-headline">2</div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label opacity-60">Validation</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold font-headline">3</div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label opacity-60">Payment</span>
            </div>
          </div>
        </div>

        {isLoading && <p className="text-sm text-slate-500 mb-6">Loading checkout details...</p>}
        {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h2 className="text-2xl font-bold font-headline tracking-tight">Delivery Address</h2>
                </div>
                <button className="text-primary font-semibold text-sm hover:underline">Add New</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMO_CHECKOUT_PROFILE.addresses.map((address) => (
                  <label key={address.id} className="relative block cursor-pointer group">
                    <input
                      checked={selectedAddressId === address.id}
                      className="peer sr-only"
                      name="address"
                      onChange={() => setSelectedAddressId(address.id)}
                      type="radio"
                    />
                    <div className="p-6 rounded-xl bg-surface-container-low border-2 border-transparent peer-checked:border-primary peer-checked:bg-white transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold font-headline">{address.label}</span>
                        <span
                          className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {address.line1}
                        <br />
                        {address.line2}
                        <br />
                        Contact: {address.contact}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-primary">description</span>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Prescription Validation</h2>
              </div>

              <div className="bg-primary/5 rounded-xl border-t-2 border-primary/20 p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    {requiresPrescription ? 'Prescription required for one or more items' : 'No prescription needed for current cart'}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {requiresPrescription
                      ? 'According to clinical protocols, this order requires a valid medical prescription from a registered practitioner.'
                      : 'Your current cart contains OTC products. You can proceed without prescription upload.'}
                  </p>
                </div>
                <div className="w-full md:w-auto">
                  <label className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:bg-white/50 transition-all">
                    <span className="material-symbols-outlined text-primary text-3xl mb-2">upload_file</span>
                    <span className="text-sm font-bold text-primary">Upload PDF/JPG</span>
                    <input className="hidden" type="file" />
                  </label>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-surface-container-lowest to-primary/5 border-t border-primary/20 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                  <div>
                    <p className="text-sm font-medium text-on-surface">AI Verification Active</p>
                    <p className="text-xs text-on-surface-variant">Our system will instantly scan your upload for regulatory compliance.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Payment Method</h2>
              </div>

              <div className="space-y-4">
                {[{ id: 'upi', label: 'UPI Transfer', hint: 'Instant verification via PhonePe, Google Pay, BHIM', icon: 'contactless' }, { id: 'card', label: 'Debit / Credit Card', hint: 'Secured card processing', icon: 'credit_card' }, { id: 'cod', label: 'Cash on Delivery', hint: 'Available for this location', icon: 'payments' }].map((method) => {
                  const selected = selectedPayment === method.id;
                  return (
                    <button
                      key={method.id}
                      className={`w-full p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all text-left ${
                        selected
                          ? 'bg-white border-2 border-primary shadow-sm'
                          : 'bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                      type="button"
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selected ? 'bg-primary/10' : 'bg-white'}`}>
                        <span className={`material-symbols-outlined ${selected ? 'text-primary' : 'text-on-surface'}`}>{method.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{method.label}</p>
                        <p className="text-xs text-on-surface-variant">{method.hint}</p>
                      </div>
                      <span className={`material-symbols-outlined ${selected ? 'text-primary' : 'text-outline'}`} style={selected ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {selected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-outline-variant/10">
              <h3 className="text-xl font-bold font-headline mb-6">Order Summary</h3>

              <div className="space-y-6 mb-8">
                {(cartData.items || []).map((item) => (
                  <div className="flex gap-4" key={item.id}>
                    <div className="w-16 h-16 rounded-lg bg-surface-container-low flex-shrink-0 overflow-hidden">
                      <img alt={item.name} className="w-full h-full object-cover" src={getItemImage(item)} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold leading-tight">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold mt-1 text-primary">${Number(item.total_price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-t border-zinc-100">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium">${Number(cartData.summary?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Shipping Fee</span>
                  <span className="font-medium text-primary">
                    {Number(cartData.summary?.deliveryFee || 0) === 0 ? 'FREE' : `$${Number(cartData.summary?.deliveryFee || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Taxes (Clinical GST)</span>
                  <span className="font-medium">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-zinc-100 mb-8">
                <span className="text-lg font-bold font-headline">Total Amount</span>
                <span className="text-2xl font-black text-primary font-headline tracking-tighter">
                  ${Number(cartData.summary?.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 rounded-full font-bold font-headline shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isPlacingOrder || (cartData.items || []).length === 0}
                onClick={handlePlaceOrder}
                type="button"
              >
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>

              {placeOrderError && <p className="text-xs text-red-600 mt-3 text-center">{placeOrderError}</p>}

              <p className="text-[10px] text-center mt-6 text-on-surface-variant font-medium uppercase tracking-widest">Clinical Excellence Guaranteed</p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span className="text-xs font-label">256-bit SSL Encrypted Payment</span>
            </div>

            <div className="mt-4 text-xs text-slate-500 text-center">
              Delivering to: {selectedAddress?.label} • {selectedAddress?.line2}
            </div>
          </aside>
        </div>
      </main>

      <CartFooter />
      <CartFloatingActions />
    </div>
  );
}
