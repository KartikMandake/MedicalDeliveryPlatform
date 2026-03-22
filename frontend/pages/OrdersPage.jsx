import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import { getMyOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ACTIVE_STATUSES = new Set(['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'in_transit']);

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusPillClass(status) {
  if (status === 'delivered') return 'bg-primary-container/10 text-primary';
  if (status === 'cancelled') return 'bg-error-container/20 text-error';
  if (status === 'in_transit') return 'bg-sky-100 text-sky-700';
  if (status === 'ready_for_pickup') return 'bg-violet-100 text-violet-700';
  if (status === 'preparing' || status === 'confirmed') return 'bg-secondary-container/20 text-secondary';
  return 'bg-surface-container-high text-on-surface-variant';
}

function statusLabel(status) {
  if (status === 'delivered') return 'Delivered';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'preparing' || status === 'confirmed') return 'Processing';
  if (status === 'ready_for_pickup') return 'Ready for Pickup';
  if (status === 'in_transit') return 'In Transit';
  if (status === 'placed') return 'Placed';
  return String(status || 'Pending').replace(/_/g, ' ');
}

function orderTitle(order) {
  const items = order.items || [];
  if (!items.length) return 'Clinical Order Bundle';
  if (items.length === 1) return items[0].name || 'Clinical Order Item';
  return `${items[0].name || 'Clinical Bundle'} +${items.length - 1} items`;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [reorderingId, setReorderingId] = useState('');

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

  const visibleOrders = useMemo(() => orders.slice(0, visibleCount), [orders, visibleCount]);

  const hasMoreOrders = visibleCount < orders.length;

  const insightText = useMemo(() => {
    const active = orders.find((order) => ACTIVE_STATUSES.has(order.status));
    if (!active) {
      return 'All active orders are stable. Next refill suggestions will appear as usage patterns update.';
    }
    return `Order ${active.orderId || active.id} is ${statusLabel(active.status).toLowerCase()}. Keep tracking enabled for latest delivery updates.`;
  }, [orders]);

  const handleReorder = async (order) => {
    const items = order.items || [];
    const validItems = items.filter((item) => item.medicineId);

    if (!validItems.length) {
      showToast('Reorder is unavailable for this order.', 'info');
      return;
    }

    setReorderingId(order.id);
    try {
      await Promise.all(validItems.map((item) => addItem(item.medicineId, Number(item.quantity || 1))));
      showToast('Items added to cart.', 'success');
      navigate('/cart');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to reorder items.', 'error');
    } finally {
      setReorderingId('');
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <ProductsNavBar />

      <div className="flex min-h-screen pt-16">
        <aside className="hidden lg:flex flex-col p-4 gap-4 h-screen w-64 border-r border-zinc-200 bg-zinc-50 sticky top-16">
          <div className="px-2 py-4">
            <h2 className="text-lg font-black text-green-700 font-headline">Clinical Portal</h2>
            <p className="text-xs text-zinc-500 font-headline">AI-Powered Inventory</p>
          </div>

          <nav className="flex-1 space-y-2">
            <Link className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-100 rounded-xl hover:translate-x-1 transition-transform duration-200 font-headline text-sm" to="/dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-100 rounded-xl hover:translate-x-1 transition-transform duration-200 font-headline text-sm" to="/products">
              <span className="material-symbols-outlined">category</span>
              <span>Categories</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 bg-white text-green-700 shadow-sm rounded-xl font-semibold hover:translate-x-1 transition-transform duration-200 font-headline text-sm" to="/orders">
              <span className="material-symbols-outlined">package_2</span>
              <span>Order History</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-100 rounded-xl hover:translate-x-1 transition-transform duration-200 font-headline text-sm" to="/upload">
              <span className="material-symbols-outlined">description</span>
              <span>Prescriptions</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-100 rounded-xl hover:translate-x-1 transition-transform duration-200 font-headline text-sm" to="/help">
              <span className="material-symbols-outlined">help_center</span>
              <span>Support</span>
            </Link>
          </nav>

          <Link to="/upload" className="bg-gradient-to-br from-primary to-primary-container text-white rounded-xl py-3 px-4 font-semibold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all mb-8 text-center">
            Upload Prescription
          </Link>
        </aside>

        <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full pb-28 lg:pb-12">
          <header className="mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block font-label">Transaction Repository</span>
            <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tighter">Order History</h1>
            <p className="text-on-surface-variant mt-2 max-w-xl font-body text-sm leading-relaxed">
              A precise record of your medical supplies and prescriptions, verified by our fluid intelligence engine.
            </p>
          </header>

          <div className="rounded-xl p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 insight-glow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface">Precision Insight</h4>
                <p className="text-sm text-on-surface-variant">{insightText}</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/products')} className="px-6 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:scale-105 transition-transform active:scale-95">
              Schedule Auto-Refill
            </button>
          </div>

          {loading && (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_24px_rgba(25,28,29,0.04)] text-sm text-on-surface-variant">
              Loading your order history...
            </div>
          )}

          {!loading && !orders.length && (
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_rgba(25,28,29,0.04)] text-center">
              <p className="text-sm text-on-surface-variant">No orders available yet.</p>
              <button type="button" onClick={() => navigate('/products')} className="mt-4 px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:opacity-90">
                Browse Products
              </button>
            </div>
          )}

          {!loading && !!orders.length && (
            <div className="space-y-6">
              {visibleOrders.map((order) => {
                const totalItems = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                const canTrack = ACTIVE_STATUSES.has(order.status);
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div key={order.id} className={`bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_24px_rgba(25,28,29,0.04)] hover:shadow-[0_16px_32px_rgba(0,110,47,0.08)] transition-all duration-300 group ${order.status === 'cancelled' ? 'opacity-75 hover:opacity-100' : ''}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-label">Order ID: #{order.orderId || order.id}</span>
                        <h3 className="font-headline font-bold text-lg text-on-surface">{orderTitle(order)}</h3>
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>{formatDate(order.placedAt)}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">inventory_2</span>{totalItems} Items</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xl font-black text-on-surface font-headline">{formatMoney(order.total)}</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${statusPillClass(order.status)}`}>
                            {statusLabel(order.status)}
                          </span>
                        </div>

                        <div className="h-10 w-[1px] bg-zinc-100 hidden md:block" />

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                            title={isExpanded ? 'Hide details' : 'View details'}
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>

                          {canTrack ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/tracking?orderId=${order.id}`)}
                              className="bg-surface-container-high text-on-surface px-5 py-2 rounded-full text-xs font-bold hover:bg-surface-container-highest transition-colors active:scale-95"
                            >
                              Track
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={reorderingId === order.id}
                              onClick={() => handleReorder(order)}
                              className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform active:scale-95 shadow-md disabled:opacity-60"
                            >
                              {reorderingId === order.id ? 'Reordering...' : 'Reorder'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-zinc-100">
                        {(order.items || []).length ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(order.items || []).map((item, idx) => (
                              <div key={`${order.id}-${idx}`} className="rounded-xl tonal-shift p-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-on-surface truncate">{item.name || 'Medicine'}</p>
                                  <p className="text-xs text-on-surface-variant mt-0.5">Qty {item.quantity} × {formatMoney(item.unitPrice)}</p>
                                </div>
                                <span className="text-xs font-bold text-on-surface whitespace-nowrap">{formatMoney(item.totalPrice)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-on-surface-variant">Detailed line items are unavailable for this order.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && hasMoreOrders && (
            <div className="mt-12 flex justify-center">
              <button type="button" onClick={() => setVisibleCount((prev) => prev + 6)} className="text-on-surface-variant text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors group">
                View more historical data
                <span className="material-symbols-outlined text-sm group-hover:translate-y-1 transition-transform">expand_more</span>
              </button>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-zinc-50 w-full py-12 px-8 border-t border-zinc-100 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <span className="font-headline font-bold text-zinc-900">MediFlow AI</span>
            <p className="font-body text-xs text-zinc-500 leading-relaxed">© 2024 MediFlow AI. Clinical Excellence and Fluid Intelligence.</p>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => showToast('Policy page is not connected yet.', 'info')} className="text-left font-body text-xs text-zinc-500 hover:text-zinc-900 transition-colors opacity-80 hover:opacity-100">Privacy Policy</button>
            <button type="button" onClick={() => showToast('Terms page is not connected yet.', 'info')} className="text-left font-body text-xs text-zinc-500 hover:text-zinc-900 transition-colors opacity-80 hover:opacity-100">Terms of Service</button>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => navigate('/tracking')} className="text-left font-body text-xs text-zinc-500 hover:text-zinc-900 transition-colors opacity-80 hover:opacity-100">Contact Medical Hub</button>
            <button type="button" onClick={() => showToast('API docs are not published yet.', 'info')} className="text-left font-body text-xs text-zinc-500 hover:text-zinc-900 transition-colors opacity-80 hover:opacity-100">API Documentation</button>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-label">System Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary font-label">Node Active: Precision V2.4</span>
            </div>
          </div>
        </div>
      </footer>

      <nav className="lg:hidden flex justify-around items-center px-4 pt-3 pb-8 w-full fixed bottom-0 z-50 rounded-t-3xl bg-white/80 backdrop-blur-lg shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] border-t border-zinc-200">
        <Link className="flex flex-col items-center justify-center text-zinc-400 active:scale-90 transition-transform duration-200" to="/dashboard">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-zinc-400 active:scale-90 transition-transform duration-200" to="/products">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Categories</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-green-600 scale-110 active:scale-90 transition-transform duration-200" to="/orders">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Orders</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-zinc-400 active:scale-90 transition-transform duration-200" to="/help">
          <span className="material-symbols-outlined">contact_support</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Help</span>
        </Link>
      </nav>
    </div>
  );
}
