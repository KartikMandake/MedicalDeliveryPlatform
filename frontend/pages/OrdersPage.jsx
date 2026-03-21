import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';
import { getMyOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ACTIVE_STATUSES = new Set(['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'in_transit']);

function resolveImage(itemImage) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadBase = apiBase.replace(/\/api\/?$/, '');

  if (!itemImage) return '';
  const raw = String(itemImage).trim();
  if (!raw) return '';

  // If this is already a URL, keep as-is.
  if (/^(https?:\/\/|data:|blob:)/i.test(raw)) return raw;

  // Some DB rows keep comma-containing URLs or CSV values. Prefer first token that looks like URL/path.
  const candidates = raw.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
  const first = candidates.find(Boolean) || '';
  if (!first) return '';
  if (/^(https?:\/\/|data:|blob:)/i.test(first)) return first;

  return `${uploadBase}${first.startsWith('/') ? '' : '/'}${first}`;
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusClass(status) {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-800';
  if (status === 'cancelled') return 'bg-rose-100 text-rose-700';
  if (status === 'in_transit') return 'bg-sky-100 text-sky-800';
  return 'bg-amber-100 text-amber-800';
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    getMyOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        showToast(err.response?.data?.message || 'Unable to load your order history.', 'error');
      })
      .finally(() => setLoading(false));
  }, [navigate, showToast, user]);

  const filteredOrders = useMemo(() => {
    if (tab === 'active') return orders.filter((order) => ACTIVE_STATUSES.has(order.status));
    if (tab === 'past') return orders.filter((order) => !ACTIVE_STATUSES.has(order.status));
    return orders;
  }, [orders, tab]);

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <ProductsNavBar />

      <main className="pt-20 pb-32 px-6 max-w-6xl mx-auto w-full">
        <header className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Transaction Repository</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-headline font-extrabold tracking-tight">Order History</h1>
          <p className="mt-2 text-sm text-on-surface-variant max-w-2xl">
            View all your previous orders and track active deliveries in real time.
          </p>
        </header>

        <div className="mb-6 inline-flex rounded-full bg-surface-container-low p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-full transition-colors ${tab === 'all' ? 'bg-primary text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-full transition-colors ${tab === 'active' ? 'bg-primary text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={`px-4 py-2 rounded-full transition-colors ${tab === 'past' ? 'bg-primary text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
          >
            Past
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-sm font-semibold text-zinc-500">
            Loading your orders...
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
            <p className="text-sm text-zinc-500">No orders found in this section.</p>
            <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Browse products
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const totalItems = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
              const canTrack = ACTIVE_STATUSES.has(order.status);
              return (
                <article key={order.id} className="bg-white rounded-2xl border border-zinc-100 shadow-[0_6px_20px_rgba(15,23,42,0.06)] p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-[0.18em] text-zinc-400">Order ID</p>
                      <h2 className="text-lg font-headline font-bold mt-1">{order.orderId}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {formatDate(order.placedAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">inventory_2</span>
                          {totalItems} items
                        </span>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xl font-headline font-extrabold">{formatMoney(order.total)}</p>
                      <span className={`mt-1 inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${statusClass(order.status)}`}>
                        {String(order.status || 'pending').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {(order.items || []).length > 0 && (
                    <div className="mt-4 border-t border-zinc-100 pt-4">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.12em] mb-3">Ordered Products</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(order.items || []).map((item, idx) => {
                          const imageUrl = resolveImage(item.image);
                          return (
                            <div key={`${order.id}-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/40">
                              {imageUrl ? (
                                <img src={imageUrl} alt={item.name || 'Medicine'} className="w-12 h-12 rounded-lg object-cover bg-white border border-zinc-100" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-white border border-zinc-100 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-zinc-300">medication</span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-zinc-800 truncate">{item.name || 'Medicine'}</p>
                                <p className="text-[11px] text-zinc-500">Qty: {item.quantity}</p>
                              </div>
                              <span className="text-xs font-bold text-zinc-700 whitespace-nowrap">{formatMoney(item.totalPrice)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    {canTrack ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/tracking?orderId=${order.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:opacity-95"
                      >
                        Track Order
                        <span className="material-symbols-outlined text-base">location_searching</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-500 text-[11px] font-semibold">
                        Tracking unavailable
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <ProductsFooter />
    </div>
  );
}
