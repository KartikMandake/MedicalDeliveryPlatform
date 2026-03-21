import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';
import TrackingMap from '../components/tracking/TrackingMap';
import TrackingOrderDetails from '../components/tracking/TrackingOrderDetails';
import { getOrderTracking } from '../api/tracking';
import { useSocket } from '../hooks/useSocket';

const STATUS_STEPS = ['confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'delivered'];

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [tracking, setTracking] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);
  const [status, setStatus] = useState('');
  const [loadError, setLoadError] = useState('');
  const [syncedAt, setSyncedAt] = useState('');
  const socketRef = useSocket();

  const formatDateTime = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    setLoadError('');
    try {
      const res = await getOrderTracking(orderId);
      setTracking(res.data.order);
      setAgentLocation(res.data.agentLocation);
      setStatus(res.data.order.status);
      setSyncedAt(res.data.syncedAt || new Date().toISOString());
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.message || 'Unable to load tracking details.');
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [fetchTracking, orderId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !orderId) return;
    socket.emit('track_order', orderId);
    socket.on('order_status_update', ({ status: s }) => {
      setStatus(s);
      fetchTracking();
    });
    socket.on('agent_location', (loc) => {
      setAgentLocation(loc);
      setSyncedAt(new Date().toISOString());
    });
    return () => {
      socket.off('order_status_update');
      socket.off('agent_location');
    };
  }, [fetchTracking, orderId, socketRef]);

  const eta = tracking?.estimatedDelivery
    ? Math.max(0, Math.round((new Date(tracking.estimatedDelivery) - Date.now()) / 60000))
    : null;

  const destinationLocation = {
    lat: tracking?.deliveryAddress?.lat,
    lng: tracking?.deliveryAddress?.lng,
  };

  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] min-h-screen antialiased">
      <ProductsNavBar />
      <main className="pt-20 pb-32 px-6 max-w-7xl mx-auto w-full min-h-screen flex flex-col">
        <div className="w-full py-6 md:py-8 flex-1">
          <nav className="flex items-center gap-2 mb-6 text-sm text-slate-500 font-medium">
            <Link className="hover:text-[#0d631b] transition-colors" to="/">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link className="hover:text-[#0d631b] transition-colors" to="/orders">My Orders</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 font-semibold tracking-tight">
              Tracking #{tracking?.orderId || orderId || 'N/A'}
            </span>
          </nav>

          <div className="mb-8 p-6 rounded-2xl bg-[#2e7d32] text-[#cbffc2] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-[#0d631b]/30 -skew-x-12 transform translate-x-20" />
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold tracking-tighter text-white">
                {status === 'delivered' ? 'Order Delivered' : eta !== null ? `Estimated Delivery: ${eta} mins` : 'Tracking your order...'}
              </h1>
              <p className="font-medium text-[#cbffc2] opacity-90 capitalize">
                Status: {loadError ? 'Unavailable' : status?.replace(/_/g, ' ') || 'Loading...'}
              </p>
              {loadError && <p className="mt-2 text-sm text-rose-100">{loadError}</p>}
            </div>
            <div className="relative z-10 bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30 text-sm font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              ORDER #{tracking?.orderId || '—'}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Order Entity</p>
              <p className="mt-2 text-xs text-slate-600 break-all">{tracking?.id || orderId || '--'}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Retailer Entity</p>
              <p className="mt-2 text-xs text-slate-600 break-all">{tracking?.retailerId || '--'}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Agent Entity</p>
              <p className="mt-2 text-xs text-slate-600 break-all">{tracking?.agentId || '--'}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Payment Status</p>
              <p className="mt-2 text-sm font-semibold text-slate-800 capitalize">{tracking?.paymentStatus || '--'}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Placed At</p>
              <p className="mt-2 text-xs text-slate-700">{formatDateTime(tracking?.placedAt)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Last Sync</p>
              <p className="mt-2 text-xs text-slate-700">{formatDateTime(syncedAt)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm md:col-span-2 xl:col-span-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Delivery OTP (Share With Delivery Partner)</p>
              {tracking?.status === 'delivered' ? (
                <p className="mt-2 text-sm font-semibold text-emerald-700">Order already delivered. OTP no longer required.</p>
              ) : tracking?.deliveryOtp ? (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-2xl font-extrabold tracking-[0.2em] text-slate-900">{tracking.deliveryOtp}</span>
                  <span className="text-xs text-slate-500">Provide this OTP only after you receive your medicines.</span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">OTP will appear once delivery is ready/in transit.</p>
              )}
            </div>
          </div>

          {/* Status Steps */}
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const currentIdx = STATUS_STEPS.indexOf(status);
                const done = i <= currentIdx;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-[#0d631b] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                    </div>
                    <span className="text-[10px] text-center text-slate-500 capitalize hidden sm:block">{step.replace(/_/g, ' ')}</span>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute h-0.5 w-full ${done ? 'bg-[#0d631b]' : 'bg-slate-100'}`} style={{ display: 'none' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            <TrackingMap agentLocation={agentLocation} destinationLocation={destinationLocation} />
            <TrackingOrderDetails order={tracking} />
          </div>
        </div>
      </main>
      <ProductsFooter />
    </div>
  );
}
