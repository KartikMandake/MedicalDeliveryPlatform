import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getProducts } from '../api/products';
import { getMyOrders } from '../api/orders';
import { updateProfile, reverseGeocode } from '../api/auth';

const ACTIVE_STATUSES = new Set(['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'in_transit']);

const ALERTS = [
  {
    title: 'Dengue Alert',
    subtitle: 'High risk in Sector 42',
    icon: 'warning',
    iconColor: 'text-error',
    accent: 'border-error',
    tags: ['Mosquito Nets', 'Odomos'],
  },
  {
    title: 'Flu Season',
    subtitle: 'Moderate activity detected',
    icon: 'thermometer',
    iconColor: 'text-amber-500',
    accent: 'border-amber-400',
    tags: ['Sanitizer', 'N95 Masks'],
  },
  {
    title: 'Allergy Warning',
    subtitle: 'High pollen count today',
    icon: 'eco',
    iconColor: 'text-primary',
    accent: 'border-primary',
    tags: ['Cetirizine', 'Eye Drops'],
  },
];

function resolveImage(itemImage) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadBase = apiBase.replace(/\/api\/?$/, '');

  if (!itemImage) return '';
  const raw = String(itemImage).trim();
  if (!raw) return '';
  if (/^(https?:\/\/|data:|blob:)/i.test(raw)) return raw;

  const candidates = raw.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
  const first = candidates.find(Boolean) || '';
  if (!first) return '';
  if (/^(https?:\/\/|data:|blob:)/i.test(first)) return first;

  return `${uploadBase}${first.startsWith('/') ? '' : '/'}${first}`;
}

function formatMoney(value) {
  return `Rs.${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '--';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '--';
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusChip(status) {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'cancelled') return 'bg-rose-100 text-rose-700';
  if (ACTIVE_STATUSES.has(status)) return 'bg-sky-100 text-sky-700';
  return 'bg-zinc-100 text-zinc-600';
}

function greetingLabel() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardPage() {
  const { user, loading, login } = useAuth();
  const { itemCount, addItem, isAdding } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
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
          // Now using our own backend proxy for reliability
          const res = await reverseGeocode(latitude, longitude);
          const addressText = res.data?.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          // Persist to backend and update context
          const updateRes = await updateProfile({
            name: user.name,
            phone: user.phone,
            address: addressText
          });
          login(localStorage.getItem('token'), updateRes.data);

          showToast('Delivery address updated successfully.', 'success');
        } catch (err) {
          console.error('Reverse Geocoding Error:', err);
          showToast('Location detected, but address lookup failed. Please set manually.', 'warning');
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        if (error.code === 1) {
          showToast('Location permission denied. Please allow location access.', 'error');
        } else {
          showToast('Unable to detect location. Please set address in profile.', 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto-detect location on mount if not set
  useEffect(() => {
    if (user && !user.address && !detecting) {
      handleDetectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.address]);

  useEffect(() => {
    if (!user || user.role !== 'user') return;

    let mounted = true;
    setLoadingData(true);

    Promise.all([
      getProducts({ page: 1, limit: 6 }),
      getMyOrders(),
    ])
      .then(([productsRes, ordersRes]) => {
        if (!mounted) return;
        const fetchedProducts = Array.isArray(productsRes.data?.items)
          ? productsRes.data.items
          : Array.isArray(productsRes.data?.products)
            ? productsRes.data.products
            : Array.isArray(productsRes.data)
              ? productsRes.data
              : [];
        setProducts(fetchedProducts.slice(0, 6));
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        showToast(err.response?.data?.message || 'Unable to load your dashboard data.', 'error');
      })
      .finally(() => {
        if (mounted) setLoadingData(false);
      });

    return () => {
      mounted = false;
    };
  }, [showToast, user]);

  const recommended = useMemo(() => products.slice(0, 3), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const activeOrder = useMemo(() => orders.find((o) => ACTIVE_STATUSES.has(o.status)) || null, [orders]);

  const categories = useMemo(() => {
    const types = products
      .map((p) => String(p.type || '').trim())
      .filter(Boolean);
    const unique = [...new Set(types)];
    return unique.slice(0, 4).length ? unique.slice(0, 4) : ['Cardiology', 'Dermatology', 'Pediatrics', 'Diabetic Care'];
  }, [products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const handleAddProduct = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, 1);
      showToast(`${product.name} added to cart.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add product to cart.', 'error');
    }
  };

  const handleReorder = async (order) => {
    const firstItem = order?.items?.[0];
    if (!firstItem?.medicineId) {
      showToast('This order item is unavailable for quick reorder.', 'info');
      return;
    }
    try {
      await addItem(firstItem.medicineId, Math.max(1, Number(firstItem.quantity || 1)));
      showToast('Added from order history to cart.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to reorder this item.', 'error');
    }
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'user') {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'agent') return <Navigate to="/agent" replace />;
    if (user.role === 'retailer') return <Navigate to="/retailer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  const displayName = user?.name || 'Customer';

  return (
    <div className="bg-background font-body text-on-background selection:bg-primary-container selection:text-on-primary-container fixed inset-0 overflow-y-auto overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</span>
          </Link>

          <button
            type="button"
            onClick={handleDetectLocation}
            className="hidden xl:flex items-center gap-2 ml-8 px-4 py-2 hover:bg-zinc-100 rounded-2xl transition-all group"
          >
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">{detecting ? 'progress_activity' : 'location_on'}</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Deliver to</p>
              <p className="text-xs font-bold text-zinc-900 leading-none truncate max-w-[120px]">
                {user?.address || (detecting ? 'Detecting...' : 'Set Location')}
              </p>
            </div>
          </button>

          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400"
                placeholder="Search medicines or symptoms..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div className="hidden lg:flex items-center gap-8 font-headline text-sm font-medium tracking-tight">
            <Link className="text-green-700 font-bold border-b-2 border-green-600 pb-1" to="/dashboard">Home</Link>
            <Link className="text-zinc-500 hover:text-zinc-900 transition-all" to="/products">Categories</Link>
            <Link className="text-zinc-500 hover:text-zinc-900 transition-all" to="/orders">Orders</Link>
            <Link className="text-zinc-500 hover:text-zinc-900 transition-all" to="/tracking">Help</Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/cart')} className="relative p-2 hover:bg-zinc-100 rounded-lg transition-all active:scale-95" type="button">
              <span className="material-symbols-outlined text-zinc-600">shopping_cart</span>
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-primary text-[10px] text-white flex items-center justify-center rounded-full font-bold">{itemCount}</span>
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-lg transition-all active:scale-95" type="button" onClick={() => showToast('No new notifications.', 'info')}>
              <span className="material-symbols-outlined text-zinc-600">notifications</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-zinc-900 text-white flex items-center justify-center font-bold hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all active:scale-95"
              title="View Profile"
              type="button"
            >
              {(displayName[0] || 'U').toUpperCase()}
            </button>
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px] w-full" />
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-zinc-900">{greetingLabel()}, {displayName} <span role="img" aria-label="wave">👋</span></h1>
          <p className="text-zinc-500 font-medium mt-1">Your AI-monitored health hub is up to date.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase font-label">
                <span className="material-symbols-outlined text-sm">bolt</span> Ultra Fast Clinical Delivery
              </span>
              <h2 className="text-5xl lg:text-6xl font-black font-headline leading-[1.1] text-zinc-900">
                24/7 Medicine <br /> Delivery in <span className="text-primary italic">Minutes</span>
              </h2>
              <p className="text-lg text-zinc-500 max-w-md font-body leading-relaxed">
                Access life-saving prescriptions and wellness essentials with MediFlow&apos;s predictive inventory tracking.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/upload')} className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3" type="button">
                <span className="material-symbols-outlined">upload_file</span> Upload Prescription
              </button>
              <button onClick={() => navigate('/products')} className="px-8 py-4 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition-all active:scale-95" type="button">
                Browse Medicines
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/50">
              <img alt="Delivery illustration" className="w-full h-[400px] object-cover" src="/imagecopy.png" />
              <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center gap-3 border border-white">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <span className="text-sm font-bold text-zinc-900 font-headline">Verified Medicines</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <button onClick={() => navigate('/upload')} className="text-left bg-surface-container-lowest p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group" type="button">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">prescriptions</span>
            </div>
            <h3 className="font-bold text-zinc-900 font-headline">Upload Prescription</h3>
            <p className="text-xs text-zinc-400 mt-1">Get AI verification in seconds</p>
          </button>
          <button onClick={() => navigate('/products')} className="text-left bg-surface-container-lowest p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group" type="button">
            <div className="w-12 h-12 bg-error-container text-error rounded-2xl flex items-center justify-center mb-4 group-hover:bg-error group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">e911_emergency</span>
            </div>
            <h3 className="font-bold text-zinc-900 font-headline">Emergency Order</h3>
            <p className="text-xs text-zinc-400 mt-1">Priority 10-min dispatch</p>
          </button>
          <button onClick={() => navigate('/orders')} className="text-left bg-surface-container-lowest p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group" type="button">
            <div className="w-12 h-12 bg-secondary-container text-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">history</span>
            </div>
            <h3 className="font-bold text-zinc-900 font-headline">Reorder Medicines</h3>
            <p className="text-xs text-zinc-400 mt-1">Based on previous history</p>
          </button>
          <button onClick={() => navigate('/products')} className="text-left bg-surface-container-lowest p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group" type="button">
            <div className="w-12 h-12 bg-surface-container-high text-on-surface-variant rounded-2xl flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">near_me</span>
            </div>
            <h3 className="font-bold text-zinc-900 font-headline">Find Nearby Pharmacies</h3>
            <p className="text-xs text-zinc-400 mt-1">View stock in real-time</p>
          </button>
        </section>

        <div className="flex flex-col lg:flex-row gap-8 items-start mb-16">
          <aside className="w-full lg:w-72 lg:sticky lg:top-24 space-y-10">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-label mb-6">Categories</h4>
              <ul className="space-y-2">
                {categories.map((cat, idx) => (
                  <li key={cat}>
                    <button type="button" onClick={() => navigate(`/products?type=${encodeURIComponent(cat)}`)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${idx === 0 ? 'bg-white text-primary font-bold shadow-sm' : 'hover:bg-zinc-100 text-zinc-600'}`}>
                      {cat}
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-label mb-6">Price Range</h4>
              <input className="w-full accent-primary h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer" type="range" />
              <div className="flex justify-between text-xs font-bold text-zinc-500 mt-2">
                <span>Rs.0</span>
                <span>Rs.5000+</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-label mb-6">Trusted Brands</h4>
              <div className="flex flex-wrap gap-2">
                {['Pfizer', 'Cipla', 'Glaxo', 'Sun Pharma'].map((brand) => (
                  <button key={brand} onClick={() => navigate(`/products?brand=${encodeURIComponent(brand)}`)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${brand === 'Glaxo' ? 'bg-primary/10 text-primary border border-primary/20 font-bold' : 'bg-zinc-100 text-zinc-600 font-medium hover:bg-zinc-200'}`} type="button">
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-16">


            <section>


              {loadingData ? (
                <div className="bg-white p-8 rounded-3xl text-sm text-zinc-500 border border-zinc-100">Loading recommendations...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {recommended.map((product) => {
                    const image = resolveImage(product.images || product.image);
                    const outOfStock = Number(product.stock || 0) <= 0;
                    return (
                      <div key={product.id} className={`group bg-surface-container-lowest rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col ${outOfStock ? 'opacity-80 grayscale' : ''}`}>
                        <div className="relative h-48 rounded-2xl overflow-hidden mb-5">
                          {image ? (
                            <img alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={image} />
                          ) : (
                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-zinc-300 text-4xl">medication</span>
                            </div>
                          )}
                          {outOfStock && (
                            <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
                              <span className="px-4 py-2 bg-white rounded-full text-xs font-black uppercase tracking-widest text-zinc-900 shadow-xl">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-label">{product.brand || 'Clinical Brand'}</span>
                          <h3 className="text-lg font-bold text-zinc-900 font-headline mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                          <p className="text-xs text-zinc-500 mb-4">{product.type || 'Medicine'}</p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50">
                            <div className="flex flex-col">
                              <span className="text-xl font-black text-zinc-900">{formatMoney(product.price)}</span>
                            </div>
                            {outOfStock ? (
                              <button className="px-4 py-2 bg-zinc-100 text-zinc-400 rounded-xl text-xs font-bold cursor-not-allowed" disabled type="button">Notify Me</button>
                            ) : (
                              <button
                                onClick={() => handleAddProduct(product)}
                                disabled={isAdding(product.id)}
                                className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors group-hover:scale-110 active:scale-90 disabled:opacity-60"
                                type="button"
                              >
                                <span className="material-symbols-outlined">{isAdding(product.id) ? 'hourglass_top' : 'add'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold font-headline">Live Track Order</h2>
                    <p className="text-xs text-zinc-400">Order ID: {activeOrder?.orderId || '--'}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary text-[10px] font-black rounded-full uppercase tracking-tighter">
                    {activeOrder ? String(activeOrder.status).replace(/_/g, ' ') : 'No active order'}
                  </span>
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                      <div className="w-0.5 h-10 bg-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Order Placed</h4>
                      <p className="text-[10px] text-zinc-400">{formatDate(activeOrder?.placedAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                      <div className="w-0.5 h-10 bg-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Confirmed &amp; Packed</h4>
                      <p className="text-[10px] text-zinc-400">Preparing for dispatch</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shadow-lg shadow-primary-fixed/30 -ml-1">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>delivery_dining</span>
                      </div>
                      <div className="w-0.5 h-10 bg-zinc-700 border-dashed border-l border-zinc-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary-fixed">Out for Delivery</h4>
                      <p className="text-[10px] text-zinc-300 font-medium">Estimated: 12 mins away</p>
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-40">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">flag</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Delivered</h4>
                      <p className="text-[10px] text-zinc-400">Arriving soon</p>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate(activeOrder ? `/tracking?orderId=${activeOrder.id}` : '/tracking')} className="w-full mt-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2" type="button">
                  <span className="material-symbols-outlined text-sm">call</span> Contact Delivery Partner
                </button>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-50">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold font-headline text-zinc-900">Recent History</h2>
                  <button type="button" onClick={() => navigate('/orders')} className="text-xs font-bold text-primary">See All</button>
                </div>
                <div className="space-y-6">
                  {recentOrders.length === 0 && (
                    <p className="text-sm text-zinc-500">No orders yet. Start with your first medicine order.</p>
                  )}
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
                          <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary transition-colors">pill</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{order.orderId}</h4>
                          <p className="text-[10px] text-zinc-400">{formatDate(order.placedAt)} • {(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} Items</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-black text-zinc-900">{formatMoney(order.total)}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusChip(order.status)}`}>
                            {String(order.status || 'pending').replace(/_/g, ' ')}
                          </span>
                          <button onClick={() => handleReorder(order)} className="px-3 py-1 bg-surface-container-low text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all" type="button">Reorder</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-zinc-50">
              <div className="max-w-xl mx-auto text-center space-y-8">
                <div>
                  <h2 className="text-3xl font-black font-headline text-zinc-900">Upload Your Prescription</h2>
                  <p className="text-zinc-500 mt-2">Our AI will analyze it and suggest the exact dosage and schedule.</p>
                </div>
                <button onClick={() => navigate('/upload')} className="w-full border-2 border-dashed border-zinc-200 rounded-3xl p-10 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group" type="button">
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl text-zinc-400 group-hover:text-primary">cloud_upload</span>
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900">Drag &amp; drop files here</h4>
                  <p className="text-sm text-zinc-400 mt-1">Accepts JPG, PNG or PDF (Max 10MB)</p>
                </button>
                <div className="flex flex-col md:flex-row gap-4">
                  <button onClick={() => navigate('/upload')} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20" type="button">
                    <span className="material-symbols-outlined">folder_open</span> Select from Device
                  </button>
                  <button onClick={() => showToast('WhatsApp upload integration will be available soon.', 'info')} className="flex-1 py-4 border-2 border-zinc-100 text-zinc-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors" type="button">
                    <span className="material-symbols-outlined">chat</span> WhatsApp Upload
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-950 pt-20 pb-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">medical_services</span>
              </div>
              <span className="text-xl font-bold tracking-tighter text-white font-headline">MediFlow AI</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Pioneering clinical excellence through predictive intelligence and fluid distribution networks.
            </p>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-bold font-headline">Platform</h5>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><Link className="hover:text-primary transition-colors" to="/products">Categories</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/orders">Order History</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/upload">Prescriptions</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/tracking">Track Delivery</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-bold font-headline">Medical Hub</h5>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><button className="hover:text-primary transition-colors" onClick={() => showToast('Doctor consult is coming soon.', 'info')} type="button">Consult Doctor</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => showToast('Health alerts are based on your local region.', 'info')} type="button">Health Alerts</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => showToast('Privacy policy page is coming soon.', 'info')} type="button">Privacy Policy</button></li>
              <li><button className="hover:text-primary transition-colors" onClick={() => showToast('Clinical terms page is coming soon.', 'info')} type="button">Clinical Terms</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-bold font-headline">Download App</h5>
            <div className="flex flex-col gap-3">
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
                <span className="material-symbols-outlined text-zinc-400 text-3xl">phone_iphone</span>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Available on</p>
                  <p className="text-sm font-bold text-white">App Store</p>
                </div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
                <span className="material-symbols-outlined text-zinc-400 text-3xl">ad_units</span>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Available on</p>
                  <p className="text-sm font-bold text-white">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-xs">© 2024 MediFlow AI. Clinical Excellence &amp; Fluid Intelligence.</p>
          <div className="flex gap-8">
            <button className="text-zinc-500 hover:text-white transition-colors" type="button"><span className="material-symbols-outlined text-lg">share</span></button>
            <button className="text-zinc-500 hover:text-white transition-colors" type="button"><span className="material-symbols-outlined text-lg">person_add</span></button>
            <button className="text-zinc-500 hover:text-white transition-colors" type="button"><span className="material-symbols-outlined text-lg">support_agent</span></button>
          </div>
        </div>
      </footer>

      <nav className="lg:hidden fixed bottom-0 w-full z-50 glass-nav border-t border-zinc-100 rounded-t-3xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link className="flex flex-col items-center justify-center text-primary scale-110" to="/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
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
          <Link className="flex flex-col items-center justify-center text-zinc-400" to="/tracking">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Help</span>
          </Link>
        </div>
      </nav>

      <div className="fixed bottom-24 lg:bottom-10 right-10 z-[70] flex flex-col items-center gap-4" data-state={contactOpen ? 'open' : 'closed'} id="floating-contact-menu">
        <div className="flex flex-col items-center gap-4">
          <a className={`menu-item group w-12 h-12 lg:w-14 lg:h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl active:scale-95 transition-all ${contactOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-5 scale-50 pointer-events-none'}`} href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noreferrer">
            <span className="material-symbols-outlined text-2xl lg:text-3xl">chat</span>
          </a>
          <a className={`menu-item group w-12 h-12 lg:w-14 lg:h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl active:scale-95 transition-all ${contactOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-5 scale-50 pointer-events-none'}`} href="tel:+91XXXXXXXXXX">
            <span className="material-symbols-outlined text-2xl lg:text-3xl">call</span>
          </a>
          <button className={`menu-item relative group w-12 h-12 lg:w-14 lg:h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl active:scale-95 transition-all ${contactOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-5 scale-50 pointer-events-none'}`} onClick={() => { setChatOpen((prev) => !prev); setContactOpen(false); }} type="button">
            <span className="material-symbols-outlined text-2xl lg:text-3xl">forum</span>
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
          </button>
        </div>
        <button className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative z-10 animate-pulse" onClick={() => setContactOpen((prev) => !prev)} type="button">
          <span className="material-symbols-outlined text-2xl lg:text-3xl transition-transform duration-300" style={{ transform: contactOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            {contactOpen ? 'close' : 'chat'}
          </span>
        </button>
      </div>

      {chatOpen && (
        <div className="fixed bottom-24 lg:bottom-10 right-10 z-[60] flex flex-col items-end gap-4" id="chatbot-modal">
          <div className="w-80 bg-white rounded-[2rem] shadow-2xl border border-zinc-100 overflow-hidden flex flex-col">
            <div className="bg-zinc-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-white text-sm font-bold">AI Clinical Assistant</span>
              </div>
              <button className="text-zinc-400 hover:text-white" onClick={() => setChatOpen(false)} type="button"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <div className="p-4 h-64 overflow-y-auto space-y-4 text-xs">
              <div className="bg-zinc-100 p-3 rounded-2xl rounded-tl-none self-start mr-8">
                Hello {displayName}! How can I assist you with your medicine inventory today?
              </div>
              <div className="bg-primary-container/20 p-3 rounded-2xl rounded-tr-none self-end ml-8 text-on-primary-container font-medium">
                You can ask me to find medicines, suggest alternatives, or check reorder options.
              </div>
            </div>
            <div className="p-4 border-t border-zinc-50 flex gap-2">
              <input className="flex-1 bg-zinc-50 border-none rounded-xl py-2 px-3 text-xs" placeholder="Type here..." type="text" />
              <button className="w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center" onClick={() => showToast('Chat send is not connected yet.', 'info')} type="button"><span className="material-symbols-outlined text-sm">send</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
