import { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { updateProfile, reverseGeocode } from '../api/auth';
import { getAddresses, createAddress, updateAddress } from '../api/addresses';
import { getMyOrders } from '../api/orders';

/* ─── Static sample data (replace with API calls as needed) ─────────────── */
const PRESCRIPTIONS = [
  {
    id: 'RX-2024-0091',
    drug: 'Amoxicillin 500mg',
    dosage: '1 tablet · 3× daily',
    refillsLeft: 2,
    expiresOn: 'Jan 15, 2025',
    status: 'active',
  },
  {
    id: 'RX-2024-0074',
    drug: 'Metformin 1000mg',
    dosage: '1 tablet · 2× daily with meals',
    refillsLeft: 5,
    expiresOn: 'Mar 22, 2025',
    status: 'active',
  },
  {
    id: 'RX-2023-0215',
    drug: 'Lisinopril 10mg',
    dosage: '1 tablet · once daily',
    refillsLeft: 0,
    expiresOn: 'Jun 01, 2024',
    status: 'expired',
  },
];

const ORDER_HISTORY = [
  {
    id: 'ORD-2024-881',
    date: 'Oct 24, 2023',
    items: ['Amoxicillin (×2)', 'Vitamin D3 (×1)'],
    total: '$42.50',
    status: 'delivered',
  },
  {
    id: 'ORD-2023-742',
    date: 'Sep 12, 2023',
    items: ['Lisinopril 10mg (×1)'],
    total: '$18.20',
    status: 'delivered',
  },
  {
    id: 'ORD-2023-611',
    date: 'Aug 05, 2023',
    items: ['Metformin (×3)', 'B12 Complex (×1)'],
    total: '$115.00',
    status: 'delivered',
  },
];



function statusChip(status) {
  if (status === 'active') return 'bg-emerald-100 text-emerald-700';
  if (status === 'expired') return 'bg-rose-100 text-rose-700';
  if (status === 'delivered') return 'bg-sky-100 text-sky-700';
  return 'bg-zinc-100 text-zinc-500';
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return '';
}

function buildAddressPayload({ existingAddress, user, reverseData, latitude, longitude }) {
  const lineAddress = reverseData?.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  const phone = normalizePhone(existingAddress?.phone || user?.phone);

  return {
    label: existingAddress?.label || 'Home',
    fullName: String(existingAddress?.fullName || user?.name || '').trim(),
    phone,
    line1: String(existingAddress?.line1 || lineAddress).trim(),
    line2: String(existingAddress?.line2 || '').trim(),
    city: String(existingAddress?.city || reverseData?.city || '').trim(),
    state: String(existingAddress?.state || reverseData?.state || '').trim(),
    pincode: String(existingAddress?.pincode || reverseData?.pincode || '').replace(/\D/g, '').slice(0, 6),
    landmark: String(existingAddress?.landmark || '').trim(),
    lat: Number(latitude.toFixed(6)),
    lng: Number(longitude.toFixed(6)),
    isDefault: true,
  };
}

function isAddressPayloadComplete(payload) {
  return Boolean(
    payload.fullName &&
    /^\d{10}$/.test(payload.phone) &&
    payload.line1 &&
    payload.city &&
    payload.state &&
    /^\d{6}$/.test(payload.pincode) &&
    Number.isFinite(payload.lat) &&
    Number.isFinite(payload.lng)
  );
}

export default function PatientProfilePage() {
  const { user, loading, logout, login } = useAuth();
  const { itemCount } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { type: 'success'|'error', text }
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Pre-fill form from DB whenever user data loads/changes
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'user') return <Navigate to="/dashboard" replace />;

  const displayName = user?.name || 'Patient';
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout?.();
    navigate('/login');
  };

  // Open edit modal pre-filled with live user data from DB
  const openEdit = () => {
    setFormData({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
    setSaveMsg(null);
    setEditOpen(true);
  };

  const [detecting, setDetecting] = useState(false);
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use backend proxy for reliability and to bypass CORS/User-Agent issues
          const res = await reverseGeocode(latitude, longitude);
          const addressText = res.data?.address;

          const addressesRes = await getAddresses().catch(() => ({ data: [] }));
          const savedAddresses = Array.isArray(addressesRes.data) ? addressesRes.data : [];
          const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;
          const payload = buildAddressPayload({
            existingAddress: defaultAddress,
            user,
            reverseData: res.data,
            latitude,
            longitude,
          });
          let addressSynced = false;

          if (isAddressPayloadComplete(payload)) {
            if (defaultAddress?.id) {
              await updateAddress(defaultAddress.id, payload);
            } else {
              await createAddress(payload);
            }
            addressSynced = true;
          }

          if (addressText) {
            setFormData(f => ({ ...f, address: addressText }));
            if (addressSynced) {
              showToast('Location detected and delivery coordinates saved.', 'success');
            } else {
              showToast('Location detected. Please complete full address details once to save coordinates for delivery.', 'warning');
            }
          } else {
            setFormData(f => ({ ...f, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
            showToast('Coordinates detected, but address lookup failed.', 'info');
          }
        } catch (err) {
          console.error('Reverse Geocoding Error:', err);
          setFormData(f => ({ ...f, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          showToast('Address lookup failed. Coordinates shown instead.', 'warning');
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        if (error.code === 1) {
          showToast('Location permission denied.', 'error');
        } else {
          showToast('Unable to detect location. Please type manually.', 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save profile to DB via PUT /auth/me
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await updateProfile({ name: formData.name.trim(), phone: formData.phone.trim(), address: formData.address.trim() });
      // Update AuthContext with fresh user data from server
      login(localStorage.getItem('token'), res.data);
      setSaveMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setEditOpen(false), 1200);
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'description' },
    { id: 'orders', label: 'Order History', icon: 'receipt_long' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="bg-background font-body text-on-background selection:bg-primary-container selection:text-on-primary-container fixed inset-0 overflow-y-auto overflow-x-hidden">

      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</span>
          </Link>

          {/* flex-1 spacer to push nav links to the right — matches DashboardPage layout */}
          <div className="flex-1" />
          <div className="hidden lg:flex items-center gap-8 font-headline text-sm font-medium tracking-tight mr-6">
            <Link className="text-zinc-500 hover:text-zinc-900 transition-all" to="/dashboard">Home</Link>
            <Link className="text-zinc-500 hover:text-zinc-900 transition-all" to="/products">Categories</Link>
            <Link className="text-zinc-500 hover:text-zinc-900 transition-all" to="/orders">Orders</Link>
            <Link className="text-zinc-500 hover:text-zinc-900 transition-all" to="/tracking">Help</Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/cart')} className="relative p-2 hover:bg-zinc-100 rounded-lg transition-all active:scale-95" type="button">
              <span className="material-symbols-outlined text-zinc-600">shopping_cart</span>
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-primary text-[10px] text-white flex items-center justify-center rounded-full font-bold">{itemCount}</span>
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-lg transition-all active:scale-95" type="button">
              <span className="material-symbols-outlined text-zinc-600">notifications</span>
            </button>
            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full border-2 border-primary shadow-sm bg-zinc-900 text-white flex items-center justify-center font-bold ring-2 ring-primary/30 hover:scale-105 transition-all active:scale-95"
                title="Account menu"
                type="button"
              >
                {initials}
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]">
                  {/* User info */}
                  <div className="px-4 py-4 bg-gradient-to-br from-primary/5 to-primary-container/10 border-b border-zinc-100">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Signed in as</p>
                    <p className="font-bold text-zinc-900 text-sm mt-0.5 truncate">{displayName}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                  </div>
                  {/* Menu items */}
                  <div className="p-2">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base text-zinc-400">person</span>
                      My Profile
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); setActiveTab('settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base text-zinc-400">settings</span>
                      Settings
                    </button>
                    <div className="border-t border-zinc-100 my-1" />
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px] w-full" />
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 lg:sticky lg:top-24 space-y-6 shrink-0">

            {/* Profile card */}
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-primary to-primary-container rounded-t-3xl" />
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-4 z-10">
                  {initials}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-4">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Active Patient
                </div>
                <h2 className="text-xl font-black font-headline text-zinc-900">{displayName}</h2>
                <p className="text-sm text-zinc-400 mt-1">Patient ID: MF-{String(user?.id || '000001').slice(-6).padStart(6, '0')}</p>
              </div>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <span className="material-symbols-outlined text-primary text-base">mail</span>
                  <span className="truncate">{user?.email || 'patient@mediflow.ai'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <span className="material-symbols-outlined text-primary text-base">phone</span>
                  <span>{user?.phone || '+91 00000 00000'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <span className="material-symbols-outlined text-primary text-base">location_on</span>
                  <span className={user?.address ? 'text-xs truncate' : 'text-zinc-400 italic text-xs'}>
                    {user?.address || 'Address not set'}
                  </span>
                </div>
              </div>

              <button
                onClick={openEdit}
                className="w-full mt-6 py-3 border-2 border-zinc-100 text-zinc-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
            </div>

            {/* Side Navigation */}
            <div className="bg-white rounded-3xl shadow-sm p-4 space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
              <div className="border-t border-zinc-100 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-8">

            {/* Page Header */}
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold font-headline tracking-tight text-zinc-900">
                  Patient Profile
                </h1>
                <p className="text-zinc-500 font-medium mt-1">Manage your information and track medical orders.</p>
              </div>

            </header>

            {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-[fadeIn_0.3s_ease-in]">

                {/* Prescription status banner */}
                <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 rounded-3xl p-8 border border-primary/10">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary font-label mb-2">Prescription Status</p>
                      <h2 className="text-xl font-black font-headline text-zinc-900">
                        You have{' '}
                        <span className="text-primary">
                          {PRESCRIPTIONS.filter((p) => p.status === 'active').length} active prescriptions
                        </span>{' '}
                        ready for refill.
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('prescriptions')}
                      className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-md shadow-primary/20"
                      type="button"
                    >
                      Manage Prescriptions
                    </button>
                  </div>
                </div>


                {/* Quick actions */}
                <div>
                  <h3 className="text-lg font-black font-headline text-zinc-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => navigate('/upload')} className="text-left bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" type="button">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">prescriptions</span>
                      </div>
                      <h4 className="font-bold text-zinc-900 font-headline">Upload Prescription</h4>
                      <p className="text-xs text-zinc-400 mt-1">AI verification in seconds</p>
                    </button>
                    <button onClick={() => navigate('/orders')} className="text-left bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" type="button">
                      <div className="w-12 h-12 bg-secondary-container text-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">history</span>
                      </div>
                      <h4 className="font-bold text-zinc-900 font-headline">Order History</h4>
                      <p className="text-xs text-zinc-400 mt-1">View & reorder past items</p>
                    </button>
                    <button onClick={() => navigate('/tracking')} className="text-left bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" type="button">
                      <div className="w-12 h-12 bg-surface-container-high text-on-surface-variant rounded-2xl flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">local_shipping</span>
                      </div>
                      <h4 className="font-bold text-zinc-900 font-headline">Track Delivery</h4>
                      <p className="text-xs text-zinc-400 mt-1">Real-time order tracking</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRESCRIPTIONS TAB ─────────────────────────────────── */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-in]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black font-headline text-zinc-900">My Prescriptions</h3>
                  <button onClick={() => navigate('/upload')} className="px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-full text-sm font-bold shadow-md shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2" type="button">
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Rx
                  </button>
                </div>
                {PRESCRIPTIONS.map((rx) => (
                  <div key={rx.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${rx.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 font-headline">{rx.drug}</h4>
                          <p className="text-sm text-zinc-500 mt-0.5">{rx.dosage}</p>
                          <p className="text-xs text-zinc-400 mt-1">Rx #{rx.id} · Expires {rx.expiresOn}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusChip(rx.status)}`}>
                          {rx.status}
                        </span>
                        <span className="text-xs font-bold text-zinc-500">{rx.refillsLeft} refills left</span>
                        {rx.status === 'active' && (
                          <button onClick={() => navigate('/products')} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-sm" type="button">
                            Order Refill
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── ORDERS TAB ────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-in]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black font-headline text-zinc-900">Order History</h3>
                  <button onClick={() => navigate('/orders')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1" type="button">
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
                {ORDER_HISTORY.map((order) => (
                  <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-zinc-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>pill</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 font-headline">{order.id}</h4>
                          <p className="text-xs text-zinc-400 mt-0.5">{order.date}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {order.items.map((item) => (
                              <span key={item} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-medium">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xl font-black text-zinc-900">{order.total}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusChip(order.status)}`}>
                          {order.status}
                        </span>
                        <button onClick={() => navigate('/orders')} className="px-4 py-2 bg-surface-container-low text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all" type="button">
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── SETTINGS TAB ──────────────────────────────────────── */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-in]">
                <h3 className="text-lg font-black font-headline text-zinc-900">Account Settings</h3>

                <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block mb-2">Full Name</label>
                      <input
                        value={formData.name !== '' ? formData.name : displayName}
                        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                        onFocus={() => { if (formData.name === '') setFormData((f) => ({ ...f, name: user?.name || '' })); }}
                        placeholder="Your full name"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block mb-2">Email Address</label>
                      <input readOnly value={user?.email || ''} className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 text-sm font-medium text-zinc-400 cursor-not-allowed" />
                      <p className="text-[10px] text-zinc-400 mt-1 ml-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block mb-2">Phone Number</label>
                      <input
                        value={formData.phone}
                        onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 00000 00000"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block mb-2">Patient ID</label>
                      <input readOnly value={`MF-${String(user?.id || '').slice(-6).padStart(6, '0')}`} className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 text-sm font-medium text-zinc-400 cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block">Delivery Address</label>
                       <button
                         type="button"
                         onClick={handleDetectLocation}
                         disabled={detecting}
                         className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                       >
                         <span className="material-symbols-outlined text-sm">my_location</span>
                         {detecting ? 'Detecting...' : 'Detect Location'}
                       </button>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
                      placeholder="e.g. 12 MG Road, Pune, Maharashtra 411001"
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  {saveMsg && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium ${
                      saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                    }`}>
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {saveMsg.type === 'success' ? 'check_circle' : 'error'}
                      </span>
                      {saveMsg.text}
                    </div>
                  )}
                  <button
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    type="submit"
                  >
                    {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                {/* Danger zone */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-100">
                  <h4 className="font-bold text-zinc-900 font-headline mb-1">Danger Zone</h4>
                  <p className="text-sm text-zinc-400 mb-6">These actions are irreversible. Please proceed with caution.</p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-5 py-2.5 border-2 border-rose-200 text-rose-500 rounded-full text-sm font-bold hover:bg-rose-50 transition-all" type="button">
                      Delete Account
                    </button>
                    <button onClick={handleLogout} className="px-5 py-2.5 border-2 border-zinc-200 text-zinc-600 rounded-full text-sm font-bold hover:bg-zinc-50 transition-all" type="button">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ──────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 glass-nav border-t border-zinc-100 rounded-t-3xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link className="flex flex-col items-center justify-center text-zinc-400" to="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-zinc-400" to="/products">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Browse</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-zinc-400" to="/orders">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Orders</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-primary scale-110" to="/profile">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Profile</span>
          </Link>
        </div>
      </nav>

      {/* ── Edit Profile Modal ──────────────────────────────────────────── */}
      {editOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <div>
                <h3 className="text-lg font-black font-headline text-zinc-900">Edit Profile</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Changes are saved directly to your account</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-sm text-zinc-600">close</span>
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Avatar preview */}
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {(formData.name || displayName).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{formData.name || displayName}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block mb-2">Full Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block mb-2">Phone Number</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 00000 00000"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block mb-2">Email Address</label>
                <input
                  readOnly
                  value={user?.email || ''}
                  className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 text-sm font-medium text-zinc-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-400 mt-1 ml-1">Email address cannot be changed</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-label block">Delivery Address</label>
                   <button
                     type="button"
                     onClick={handleDetectLocation}
                     disabled={detecting}
                     className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                   >
                     <span className="material-symbols-outlined text-sm">my_location</span>
                     {detecting ? 'Detecting...' : 'Detect Location'}
                   </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. 12 MG Road, Pune, Maharashtra 411001"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              {saveMsg && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium ${
                  saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                }`}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {saveMsg.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {saveMsg.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-3 border-2 border-zinc-200 text-zinc-700 rounded-2xl font-bold text-sm hover:bg-zinc-50 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="submit"
                >
                  {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
