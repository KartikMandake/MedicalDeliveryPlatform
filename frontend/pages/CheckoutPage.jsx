import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../api/orders';
import { createRazorpayOrder, verifyPayment } from '../api/payments';
import { getAddresses, createAddress, updateAddress } from '../api/addresses';
import AddressPinMap from '../components/checkout/AddressPinMap';

const EMPTY_ADDRESS = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  lat: '',
  lng: '',
};

function toNullableNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function sanitizeAddress(address) {
  return {
    label: String(address?.label || 'Home').trim() || 'Home',
    fullName: String(address?.fullName || '').trim(),
    phone: String(address?.phone || '').trim(),
    line1: String(address?.line1 || '').trim(),
    line2: String(address?.line2 || '').trim(),
    city: String(address?.city || '').trim(),
    state: String(address?.state || '').trim(),
    pincode: String(address?.pincode || '').trim(),
    landmark: String(address?.landmark || '').trim(),
    lat: toNullableNumber(address?.lat),
    lng: toNullableNumber(address?.lng),
    isDefault: Boolean(address?.isDefault),
  };
}

function validateAddress(address) {
  const required = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
  for (const field of required) {
    if (!address[field]) return `Please provide ${field}.`;
  }
  if (!/^[0-9]{6}$/.test(address.pincode)) {
    return 'Please enter a valid 6-digit pincode.';
  }
  if (!/^[0-9]{10}$/.test(address.phone.replace(/\D/g, ''))) {
    return 'Please enter a valid 10-digit phone number.';
  }
  if (!Number.isFinite(address.lat) || address.lat < -90 || address.lat > 90) {
    return 'Please pin your exact location on the map.';
  }
  if (!Number.isFinite(address.lng) || address.lng < -180 || address.lng > 180) {
    return 'Please pin your exact location on the map.';
  }
  return null;
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function openRazorpayCheckout(options) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay is not loaded. Please refresh and try again.'));
      return;
    }

    const rzp = new window.Razorpay({
      ...options,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user.')),
      },
    });

    rzp.on('payment.failed', () => {
      reject(new Error('Payment failed. Please try again.'));
    });

    rzp.open();
  });
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [locating, setLocating] = useState(false);

  const itemCount = useMemo(
    () => (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart.items]
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let cancelled = false;

    getAddresses()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setAddresses(list);

        if (list.length) {
          const chosen = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(chosen.id);
          setAddress((prev) => ({ ...prev, ...sanitizeAddress(chosen) }));
        } else {
          setSelectedAddressId(null);
          setAddress(EMPTY_ADDRESS);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingAddress(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePinChange = (lat, lng) => {
    setAddress((prev) => ({
      ...prev,
      lat: Number(lat).toFixed(6),
      lng: Number(lng).toFixed(6),
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported in this browser.', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePinChange(position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      () => {
        showToast('Unable to detect your location. Please pin manually on the map.', 'error');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectSavedAddress = (saved) => {
    setSelectedAddressId(saved.id);
    setAddress({ ...EMPTY_ADDRESS, ...sanitizeAddress(saved) });
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setAddress(EMPTY_ADDRESS);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!cart.items?.length) {
      showToast('Your cart is empty.', 'error');
      navigate('/cart');
      return;
    }

    const payloadAddress = sanitizeAddress(address);
    const validationError = validateAddress(payloadAddress);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setPlacingOrder(true);
    try {
      if (saveAddress) {
        if (selectedAddressId) {
          await updateAddress(selectedAddressId, {
            ...payloadAddress,
            isDefault: true,
          });
        } else {
          const created = await createAddress({
            ...payloadAddress,
            label: payloadAddress.label || 'Home',
            isDefault: true,
          });
          setSelectedAddressId(created.data?.id || null);
        }
      }

      const orderRes = await createOrder({ deliveryAddress: payloadAddress });
      const order = orderRes.data;

      const rzpRes = await createRazorpayOrder(order.id);
      const { razorpayOrderId, amount, currency, key } = rzpRes.data;

      const paymentResponse = await openRazorpayCheckout({
        key,
        amount,
        currency,
        name: 'MediFlow',
        description: `Order ${order.orderId}`,
        order_id: razorpayOrderId,
        prefill: {
          name: payloadAddress.fullName || user.name || '',
          email: user.email || '',
          contact: payloadAddress.phone,
        },
        theme: { color: '#0d631b' },
      });

      await verifyPayment({ ...paymentResponse, orderId: order.id });
      await fetchCart();
      showToast('Payment verified and order placed successfully.', 'success');
      navigate(`/tracking?orderId=${order.id}`);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Checkout failed.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <ProductsNavBar />

      <main className="pt-20 pb-32 px-6 max-w-6xl mx-auto w-full">
        <header className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Checkout Flow</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-headline font-extrabold tracking-tight">Secure Checkout</h1>
          <p className="mt-2 text-sm text-on-surface-variant max-w-2xl">
            Address is mandatory before payment. You can select a saved address, edit it, or create a new one.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-8 bg-white rounded-2xl border border-zinc-100 p-6 md:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-headline font-bold">Delivery Address</h2>
              {loadingAddress && <span className="text-xs text-zinc-500">Checking saved addresses...</span>}
            </div>

            {addresses.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-400 mb-2">Saved Addresses</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addresses.map((saved) => (
                    <button
                      key={saved.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(saved)}
                      className={`text-left rounded-xl border p-3 transition-colors ${selectedAddressId === saved.id ? 'border-primary bg-primary/5' : 'border-zinc-200 hover:bg-zinc-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-700">{saved.label || 'Address'}</p>
                        {saved.isDefault && <span className="text-[10px] font-bold text-primary">Default</span>}
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{saved.line1}, {saved.city}, {saved.state} - {saved.pincode}</p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleUseNewAddress}
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                >
                  + Use a new address
                </button>
              </div>
            )}

            {!loadingAddress && !address.line1 && (
              <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                No saved address found. Please add your address to continue.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-zinc-600">
                Label
                <input
                  type="text"
                  value={address.label || ''}
                  onChange={(e) => handleAddressChange('label', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Home / Office"
                />
              </label>

              <label className="text-xs font-semibold text-zinc-600">
                Full Name *
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => handleAddressChange('fullName', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="text-xs font-semibold text-zinc-600">
                Phone *
                <input
                  type="text"
                  value={address.phone}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="md:col-span-2 text-xs font-semibold text-zinc-600">
                Address Line 1 *
                <input
                  type="text"
                  value={address.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="md:col-span-2 text-xs font-semibold text-zinc-600">
                Address Line 2
                <input
                  type="text"
                  value={address.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="text-xs font-semibold text-zinc-600">
                City *
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="text-xs font-semibold text-zinc-600">
                State *
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="text-xs font-semibold text-zinc-600">
                Pincode *
                <input
                  type="text"
                  value={address.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="text-xs font-semibold text-zinc-600">
                Landmark
                <input
                  type="text"
                  value={address.landmark}
                  onChange={(e) => handleAddressChange('landmark', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <p className="text-xs font-semibold text-zinc-600">Pin Exact Location On Map *</p>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    {locating ? 'Detecting...' : 'Use my current location'}
                  </button>
                </div>
                <AddressPinMap
                  latitude={toNullableNumber(address.lat)}
                  longitude={toNullableNumber(address.lng)}
                  onPinChange={handlePinChange}
                />
                <p className="mt-2 text-[11px] text-zinc-500">
                  Tap on the map to drop a pin for route optimization and faster delivery assignment.
                </p>
              </div>

              <label className="text-xs font-semibold text-zinc-600">
                Latitude *
                <input
                  type="number"
                  step="any"
                  value={address.lat}
                  onChange={(e) => handleAddressChange('lat', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. 28.613939"
                />
              </label>

              <label className="text-xs font-semibold text-zinc-600">
                Longitude *
                <input
                  type="number"
                  step="any"
                  value={address.lng}
                  onChange={(e) => handleAddressChange('lng', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. 77.209021"
                />
              </label>
            </div>

            <label className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-600 font-semibold">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="rounded border-zinc-300 text-primary focus:ring-primary/30"
              />
              Save this address and use it next time
            </label>
          </section>

          <aside className="lg:col-span-4 bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sticky top-24">
            <h3 className="text-lg font-headline font-bold">Order Summary</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Items</span>
                <span className="font-semibold">{itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-semibold">{formatMoney(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tax</span>
                <span className="font-semibold">{formatMoney(cart.taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Delivery</span>
                <span className="font-semibold text-primary">FREE</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="text-xl font-extrabold text-primary">{formatMoney(cart.total)}</span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placingOrder || loadingAddress || !cart.items?.length}
              className="mt-6 w-full rounded-full px-4 py-3 bg-primary text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-95"
            >
              {placingOrder ? 'Processing payment...' : 'Pay & Place Order'}
            </button>

            <Link to="/cart" className="mt-3 inline-flex w-full items-center justify-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-700">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to cart
            </Link>
          </aside>
        </div>
      </main>

      <ProductsFooter />
    </div>
  );
}
