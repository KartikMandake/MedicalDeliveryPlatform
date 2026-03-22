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
  const [addressType, setAddressType] = useState('home');

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
    const normalized = { ...EMPTY_ADDRESS, ...sanitizeAddress(saved) };
    setAddress(normalized);
    const label = String(normalized.label || '').toLowerCase();
    if (label.includes('work')) setAddressType('work');
    else if (label.includes('other')) setAddressType('other');
    else setAddressType('home');
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setAddress(EMPTY_ADDRESS);
    setAddressType('home');
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
    payloadAddress.label = addressType === 'home' ? 'Home' : addressType === 'work' ? 'Work' : 'Other';
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
    <div className="bg-surface fixed inset-0 overflow-y-auto overflow-x-hidden text-on-surface font-body">
      <ProductsNavBar />

      <main className="max-w-7xl mx-auto pt-24 pb-16 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Cart</span>
              </div>
              <div className="flex-1 h-px bg-outline-variant/30 mx-4 mt-[-20px]" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold ring-4 ring-primary/10">2</div>
                <span className="text-xs font-label uppercase tracking-widest text-primary font-bold">Address</span>
              </div>
              <div className="flex-1 h-px bg-outline-variant/30 mx-4 mt-[-20px]" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold">3</div>
                <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant/50">Payment</span>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6 gap-3">
                <h2 className="text-2xl font-headline font-extrabold tracking-tight">Saved Addresses</h2>
                <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant/70">Step 2 of 3</span>
              </div>

              {loadingAddress && <p className="text-xs text-zinc-500 mb-4">Checking saved addresses...</p>}

              {!!addresses.length && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((saved) => {
                    const selected = selectedAddressId === saved.id;
                    const savedLabel = String(saved.label || 'Home').toLowerCase();
                    const chipIcon = savedLabel.includes('work') ? 'work' : savedLabel.includes('other') ? 'location_on' : 'home';
                    const chipText = savedLabel.includes('work') ? 'Work' : savedLabel.includes('other') ? 'Other' : 'Home';

                    return (
                      <button
                        key={saved.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(saved)}
                        className={`relative text-left p-6 rounded-xl border transition-all ${selected ? 'bg-surface-container-lowest border-2 border-primary shadow-[0_16px_32px_rgba(0,110,47,0.08)]' : 'bg-surface-container-lowest shadow-[0_8px_24px_rgba(25,28,29,0.04)] hover:bg-surface-container-low border-transparent'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${selected ? 'bg-secondary-container/30' : 'bg-surface-container-high'}`}>
                            <span className={`material-symbols-outlined text-sm ${selected ? 'text-secondary' : 'text-on-surface-variant'}`}>{chipIcon}</span>
                            <span className={`text-xs font-bold uppercase tracking-tight ${selected ? 'text-secondary' : 'text-on-surface-variant'}`}>{chipText}</span>
                          </div>
                          {selected && (
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                        </div>
                        <p className={`font-bold text-lg mb-1 ${selected ? 'text-on-surface' : 'text-on-surface-variant/80'}`}>{saved.fullName || 'Recipient'}</p>
                        <p className={`text-sm leading-relaxed mb-4 ${selected ? 'text-on-surface-variant' : 'text-on-surface-variant/60'}`}>
                          {saved.line1 || '--'}{saved.line2 ? `, ${saved.line2}` : ''}<br />
                          {saved.city || '--'}, {saved.state || '--'} {saved.pincode || ''}
                        </p>
                        <p className={`text-sm font-medium ${selected ? 'text-on-surface-variant' : 'text-on-surface-variant/60'}`}>{saved.phone || '--'}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={handleUseNewAddress}
                className="mt-4 text-xs font-semibold text-primary hover:underline"
              >
                + Use a new address
              </button>

              {!loadingAddress && !address.line1 && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  No saved address found. Please add your address to continue.
                </div>
              )}
            </section>

            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_24px_rgba(25,28,29,0.04)] border border-outline-variant/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-xl font-headline font-bold">Add New Delivery Address</h2>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 text-primary font-bold text-sm hover:bg-primary/10 transition-all border border-primary/20 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg">my_location</span>
                  {locating ? 'Detecting...' : 'Use Current Location'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Full Name</span>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="Enter recipient name"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Phone Number</span>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="Enter phone number"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">House No / Building</span>
                  <input
                    type="text"
                    value={address.line1}
                    onChange={(e) => handleAddressChange('line1', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="e.g., Flat 402, Sunshine Residency"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Street / Area</span>
                  <input
                    type="text"
                    value={address.line2}
                    onChange={(e) => handleAddressChange('line2', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="e.g., Landmark St, Sector 12"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">City</span>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="Seattle"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">State</span>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="Washington"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Pincode</span>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="98101"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Landmark (Optional)</span>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={(e) => handleAddressChange('landmark', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="e.g., Near City Hospital"
                  />
                </label>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <p className="text-xs font-semibold text-zinc-600">Pin Exact Location On Map *</p>
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

                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={address.lat}
                    onChange={(e) => handleAddressChange('lat', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="e.g., 47.606200"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={address.lng}
                    onChange={(e) => handleAddressChange('lng', e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    placeholder="e.g., -122.332100"
                  />
                </label>
              </div>

              <div className="pt-4 mt-2 border-t border-outline-variant/10">
                <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-4">Address Type</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'home', label: 'Home' },
                    { key: 'work', label: 'Work' },
                    { key: 'other', label: 'Other' },
                  ].map((type) => (
                    <label key={type.key} className="flex items-center gap-3 px-6 py-3 rounded-full bg-surface-container-low cursor-pointer hover:bg-surface-container-high transition-all">
                      <input
                        className="w-4 h-4 text-primary focus:ring-primary"
                        name="address_type"
                        type="radio"
                        value={type.key}
                        checked={addressType === type.key}
                        onChange={(e) => setAddressType(e.target.value)}
                      />
                      <span className="text-sm font-bold">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant"
                  id="save_address"
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                <label className="text-sm text-on-surface-variant font-medium" htmlFor="save_address">Save this address for future use</label>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_24px_rgba(25,28,29,0.04)] border border-outline-variant/5">
                <h3 className="text-lg font-headline font-extrabold mb-6 tracking-tight">Order Summary</h3>

                <div className="space-y-4 mb-8">
                  {(cart.items || []).slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-xl">medication</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{item.name || 'Medicine'}</p>
                          <p className="text-xs text-on-surface-variant">Qty {item.quantity}{item.brand ? ` • ${item.brand}` : ''}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold whitespace-nowrap">{formatMoney(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-dashed border-outline-variant/50">
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Items</span>
                    <span className="font-medium">{itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatMoney(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Tax</span>
                    <span className="font-medium">{formatMoney(cart.taxes)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Delivery Charges</span>
                    <span className="font-medium text-primary">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-headline font-bold">Total Price</span>
                    <span className="text-2xl font-headline font-black text-primary">{formatMoney(cart.total)}</span>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/5 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                  <div>
                    <p className="text-sm font-bold text-primary">Deliver to {address.city || 'your city'}</p>
                    <p className="text-xs text-on-secondary-container mt-0.5">Estimated arrival: Today, before 8:00 PM</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || loadingAddress || !cart.items?.length}
                    className="w-full py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_24px_rgba(25,28,29,0.04)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {placingOrder ? 'Processing payment...' : 'Proceed to Payment'}
                  </button>
                  <Link to="/cart" className="block w-full text-center text-sm font-bold text-on-surface-variant hover:text-primary transition-colors py-2">
                    Back to Cart
                  </Link>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60 leading-tight">
                  HIPAA Compliant and Secure Checkout Environment
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ProductsFooter />
    </div>
  );
}
