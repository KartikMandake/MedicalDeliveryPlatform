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
  label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', landmark: '', lat: '', lng: '',
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
  for (const field of required) { if (!address[field]) return `Please provide ${field}.`; }
  if (!/^[0-9]{6}$/.test(address.pincode)) return 'Please enter a valid 6-digit pincode.';
  if (!/^[0-9]{10}$/.test(address.phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number.';
  if (!Number.isFinite(address.lat) || address.lat < -90 || address.lat > 90) return 'Please pin your exact location on the map.';
  if (!Number.isFinite(address.lng) || address.lng < -180 || address.lng > 180) return 'Please pin your exact location on the map.';
  return null;
}

function formatMoney(value) { return `Rs. ${Number(value || 0).toFixed(2)}`; }

function openRazorpayCheckout(options) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) { reject(new Error('Razorpay is not loaded. Please refresh and try again.')); return; }
    const rzp = new window.Razorpay({
      ...options,
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error('Payment cancelled by user.')) },
    });
    rzp.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')));
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
  const [isNewAddressFormOpen, setIsNewAddressFormOpen] = useState(false);

  // Accordion State
  const [activeStep, setActiveStep] = useState(1);

  const itemCount = useMemo(() => (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart.items]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    let cancelled = false;
    getAddresses().then((res) => {
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
        setIsNewAddressFormOpen(true);
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoadingAddress(false); });
    return () => { cancelled = true; };
  }, [navigate, user]);

  useEffect(() => {
    if (!loadingAddress && cart.items?.length === 0 && activeStep > 1) {
      navigate('/cart');
    }
  }, [cart.items, loadingAddress, activeStep, navigate]);

  const handleAddressChange = (field, value) => setAddress((prev) => ({ ...prev, [field]: value }));
  const handlePinChange = (lat, lng) => setAddress((prev) => ({ ...prev, lat: Number(lat).toFixed(6), lng: Number(lng).toFixed(6) }));

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { showToast('Geolocation is not supported.', 'error'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        handlePinChange(latitude, longitude);
        try {
          const { reverseGeocode } = await import('../api/auth');
          const res = await reverseGeocode(latitude.toFixed(6), longitude.toFixed(6));
          if (res.data) {
            setAddress((prev) => ({
              ...prev, city: res.data.city || prev.city, state: res.data.state || prev.state,
              pincode: res.data.pincode || prev.pincode, line2: res.data.address || prev.line2,
            }));
            showToast('Location detected & fields updated.', 'success');
          }
        } catch (err) { console.error(err); } 
        finally { setLocating(false); }
      },
      () => { showToast('Unable to detect location. Map pin manually required.', 'error'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectSavedAddress = (saved) => {
    setSelectedAddressId(saved.id);
    const normalized = { ...EMPTY_ADDRESS, ...sanitizeAddress(saved) };
    setAddress(normalized);
    setIsNewAddressFormOpen(false);
    const label = String(normalized.label || '').toLowerCase();
    if (label.includes('work')) setAddressType('work');
    else if (label.includes('other')) setAddressType('other');
    else setAddressType('home');
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setAddress(EMPTY_ADDRESS);
    setIsNewAddressFormOpen(true);
    setAddressType('home');
  };

  const confirmAddressStep = () => {
    // Basic validation before moving to step 2 visually
    const payloadAddress = sanitizeAddress(address);
    const validationError = validateAddress(payloadAddress);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }
    setActiveStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!cart.items?.length) { showToast('Your cart is empty.', 'error'); navigate('/cart'); return; }

    const payloadAddress = sanitizeAddress(address);
    payloadAddress.label = addressType === 'home' ? 'Home' : addressType === 'work' ? 'Work' : 'Other';
    const validationError = validateAddress(payloadAddress);
    if (validationError) { showToast(validationError, 'error'); setActiveStep(1); return; }

    setPlacingOrder(true);
    try {
      if (saveAddress && isNewAddressFormOpen) {
        if (selectedAddressId) {
          await updateAddress(selectedAddressId, { ...payloadAddress, isDefault: true });
        } else {
          const created = await createAddress({ ...payloadAddress, label: payloadAddress.label || 'Home', isDefault: true });
          setSelectedAddressId(created.data?.id || null);
        }
      }

      showToast('Initializing secure transaction...', 'info');
      const orderRes = await createOrder({ deliveryAddress: payloadAddress });
      const order = orderRes.data;

      const rzpRes = await createRazorpayOrder(order.id);
      const { razorpayOrderId, amount, currency, key } = rzpRes.data;

      const paymentResponse = await openRazorpayCheckout({
        key, amount, currency, name: 'MediFlow', description: `Order ${order.orderId}`, order_id: razorpayOrderId,
        prefill: { name: payloadAddress.fullName || user.name || '', email: user.email || '', contact: payloadAddress.phone },
        theme: { color: '#059669' },
      });

      await verifyPayment({ ...paymentResponse, orderId: order.id });
      await fetchCart();
      showToast('Your prescription order has been successfully placed.', 'success');
      navigate(`/tracking?orderId=${order.id}`);
    } catch (err) {
      showToast(err.message || 'Checkout failed.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] font-body text-slate-900 fixed inset-0 overflow-y-auto overflow-x-hidden flex flex-col pt-20">
      <ProductsNavBar />
      
      <main className="flex-grow max-w-[1000px] mx-auto w-full px-6 py-12">
        <header className="mb-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">Secure Checkout</p>
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-slate-900 mb-3">Finalize Procurement</h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed text-sm">
            Complete your clinical order in three simple steps.
          </p>
        </header>

        <div className="space-y-6">
          
          {/* STEP 1: Delivery Profile */}
          <div className={`bg-white rounded-[1.5rem] shadow-sm border overflow-hidden transition-all duration-500 ${activeStep === 1 ? 'border-emerald-500/50 shadow-emerald-500/5 ring-4 ring-emerald-50' : 'border-slate-200/60'}`}>
            <button 
              onClick={() => setActiveStep(1)} 
              className="w-full px-8 py-6 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
              disabled={activeStep === 1}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${activeStep === 1 ? 'bg-emerald-600 text-white' : activeStep > 1 ? 'bg-[#15803d] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {activeStep > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : '1'}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold font-headline text-slate-900">Delivery Profile</h2>
                  {activeStep > 1 && <p className="text-sm font-medium text-slate-500">{address.fullName} • {address.city}, {address.pincode}</p>}
                </div>
              </div>
              {activeStep > 1 && <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Edit</span>}
            </button>

            {activeStep === 1 && (
              <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-slate-50 h-px w-full mb-8"></div>
                
                {loadingAddress && <div className="text-center py-8"><span className="w-6 h-6 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin inline-block"></span></div>}

                {!loadingAddress && addresses.length > 0 && !isNewAddressFormOpen && (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {addresses.map((saved) => {
                        const selected = selectedAddressId === saved.id;
                        const savedLabel = String(saved.label || 'Home').toLowerCase();
                        const chipIcon = savedLabel.includes('work') ? 'work' : savedLabel.includes('other') ? 'location_on' : 'home';
                        
                        return (
                          <div
                            key={saved.id}
                            onClick={() => handleSelectSavedAddress(saved)}
                            className={`relative text-left p-5 rounded-2xl border transition-all cursor-pointer ${selected ? 'bg-white border-emerald-500 ring-4 ring-emerald-50 shadow-md' : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60'}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${selected ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                <span className="material-symbols-outlined text-[12px]">{chipIcon}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">{saved.label || 'Home'}</span>
                              </div>
                              {selected && <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                            </div>
                            <p className="font-extrabold text-slate-900 mb-1">{saved.fullName}</p>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-3 line-clamp-2">
                              {saved.line1}{saved.line2 ? `, ${saved.line2}` : ''}<br />
                              {saved.city}, {saved.state} {saved.pincode}
                            </p>
                            <p className="text-xs font-bold text-slate-700">{saved.phone}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button onClick={handleUseNewAddress} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">add</span> Add a new address
                    </button>
                  </div>
                )}

                {isNewAddressFormOpen && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm relative">
                    {addresses.length > 0 && (
                      <button onClick={() => { setIsNewAddressFormOpen(false); handleSelectSavedAddress(addresses[0]); }} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[16px] font-black">close</span>
                      </button>
                    )}
                    
                    <div className="flex items-center justify-between mb-6 pr-10">
                      <h3 className="font-extrabold text-lg text-slate-900">New Protocol Address</h3>
                      <button type="button" onClick={handleUseCurrentLocation} disabled={locating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-[14px]">my_location</span> {locating ? 'Detecting...' : 'Auto-Locate'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                       <label className="space-y-1.5">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Recipient Name</span>
                         <input type="text" value={address.fullName} onChange={(e) => handleAddressChange('fullName', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="First & Last Name" />
                       </label>
                       <label className="space-y-1.5">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Phone</span>
                         <input type="tel" value={address.phone} onChange={(e) => handleAddressChange('phone', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="10-digit mobile" />
                       </label>
                       <label className="space-y-1.5 sm:col-span-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Building & Street</span>
                         <input type="text" value={address.line1} onChange={(e) => handleAddressChange('line1', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="Flat / House No. / Building Name" />
                       </label>
                       <label className="space-y-1.5 sm:col-span-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Area / Sector</span>
                         <input type="text" value={address.line2} onChange={(e) => handleAddressChange('line2', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="Locality or Area" />
                       </label>
                       <label className="space-y-1.5">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</span>
                         <input type="text" value={address.city} onChange={(e) => handleAddressChange('city', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="City" />
                       </label>
                       <label className="space-y-1.5">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State</span>
                         <input type="text" value={address.state} onChange={(e) => handleAddressChange('state', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="State" />
                       </label>
                       <label className="space-y-1.5">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pincode</span>
                         <input type="text" value={address.pincode} onChange={(e) => handleAddressChange('pincode', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="6-digit PIN" />
                       </label>
                       <label className="space-y-1.5">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Landmark</span>
                         <input type="text" value={address.landmark} onChange={(e) => handleAddressChange('landmark', e.target.value)} className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all outline-none" placeholder="Nearby famous spot (Optional)" />
                       </label>

                       <div className="sm:col-span-2 space-y-2 mt-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pin Location on Map</span>
                         </div>
                         <AddressPinMap latitude={toNullableNumber(address.lat)} longitude={toNullableNumber(address.lng)} onPinChange={handlePinChange} />
                         <p className="text-[10px] font-bold text-slate-400 bg-slate-50 p-2 rounded-lg mt-2 inline-block">Map pinning heavily accelerates drone routing and last-mile allocation.</p>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                        {['home', 'work', 'other'].map((type) => (
                           <button 
                             key={type} type="button" onClick={() => setAddressType(type)}
                             className={`px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-colors ${addressType === type ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                           >
                             {type}
                           </button>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 border-2" />
                        <span className="text-xs font-bold text-slate-600">Save for future orders</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <button 
                    onClick={confirmAddressStep}
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-lg shadow-slate-900/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
                  >
                    Confirm Address <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* STEP 2: Order Validation */}
          <div className={`bg-white rounded-[1.5rem] shadow-sm border overflow-hidden transition-all duration-500 ${activeStep === 2 ? 'border-emerald-500/50 shadow-emerald-500/5 ring-4 ring-emerald-50' : 'border-slate-200/60 opacity-50'}`}>
            <div className="w-full px-8 py-6 flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${activeStep === 2 ? 'bg-emerald-600 text-white' : activeStep > 2 ? 'bg-[#15803d] text-white' : 'bg-slate-100 text-slate-400'}`}>
                 {activeStep > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : '2'}
               </div>
               <div>
                  <h2 className="text-xl font-extrabold font-headline text-slate-900">Order Validation & Payment</h2>
                  {activeStep === 1 && <p className="text-sm font-medium text-slate-400">Complete Address Selection First</p>}
               </div>
            </div>

            {activeStep === 2 && (
              <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-slate-50 h-px w-full mb-8"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   
                   {/* Cart Preview side */}
                   <div>
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Cart Inventory ({itemCount} units)</h3>
                     <div className="space-y-4 pr-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                       {(cart.items || []).map((item) => (
                          <div key={item.id} className="flex items-center gap-4 bg-[#f8f9fa] p-3 rounded-xl border border-slate-200/60">
                             <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-100 p-1 shrink-0 overflow-hidden">
                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" /> : <span className="material-symbols-outlined text-slate-300">medication</span>}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="font-extrabold text-sm text-slate-900 truncate">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">Qty: {String(item.quantity).padStart(2,'0')}</p>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-sm text-[#15803d]">₹{((item.price || 0) * item.quantity).toFixed(2)}</p>
                             </div>
                          </div>
                       ))}
                     </div>
                   </div>

                   {/* Payment Trigger Side */}
                   <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[40px] rounded-full pointer-events-none" />
                      
                      <div>
                        <div className="flex justify-between items-center text-sm mb-3">
                          <span className="text-slate-400 font-medium">Subtotal</span>
                          <span className="font-bold">₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-3">
                          <span className="text-slate-400 font-medium">Estimated Tax</span>
                          <span className="font-bold">₹{cart.taxes?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-emerald-400 font-bold">Delivery Fee</span>
                          <span className="font-black uppercase tracking-widest text-[10px] text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded">Free</span>
                        </div>
                      </div>

                      <div className="w-full h-px bg-slate-800 my-6"></div>

                      <div>
                        <div className="flex justify-between items-end mb-8 relative z-10">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Total Payable</span>
                            <span className="text-3xl font-black font-headline text-white tracking-tight leading-none drop-shadow-sm">₹{cart.total?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>

                        <button
                          onClick={handlePlaceOrder}
                          disabled={placingOrder || !cart.items?.length}
                          className="w-full py-4 px-6 rounded-xl bg-emerald-500 text-slate-900 font-extrabold flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative z-10"
                        >
                          {placingOrder ? (
                            <>
                              <span className="material-symbols-outlined animate-spin">refresh</span> Process Secure Transaction
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[20px]">lock</span> Pay Securely via Razorpay
                            </>
                          )}
                        </button>
                      </div>
                   </div>

                </div>
              </div>
            )}
          </div>

        </div>

        <div className="mt-8 flex items-start justify-center gap-2 text-center text-slate-400 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-[16px] text-emerald-600/70" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            HIPAA Compliant Environment • 256-bit Encryption • Satisfaction Guaranteed
          </p>
        </div>

      </main>

      <ProductsFooter />
    </div>
  );
}
