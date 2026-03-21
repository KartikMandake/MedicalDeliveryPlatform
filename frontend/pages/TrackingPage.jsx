import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TrackingNavBar from '../components/tracking/TrackingNavBar';
import TrackingSidebar from '../components/tracking/TrackingSidebar';
import TrackingMobileNav from '../components/tracking/TrackingMobileNav';
import TrackingMap from '../components/tracking/TrackingMap';
import TrackingOrderDetails from '../components/tracking/TrackingOrderDetails';
import TrackingFooter from '../components/tracking/TrackingFooter';
import { getOrderTracking } from '../api/tracking';
import { useSocket } from '../hooks/useSocket';

const STATUS_STEPS = ['confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'delivered'];

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [tracking, setTracking] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);
  const [status, setStatus] = useState('');
  const socketRef = useSocket();

  useEffect(() => {
    if (!orderId) return;
    getOrderTracking(orderId).then((res) => {
      setTracking(res.data.order);
      setAgentLocation(res.data.agentLocation);
      setStatus(res.data.order.status);
    }).catch(console.error);
  }, [orderId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !orderId) return;
    socket.emit('track_order', orderId);
    socket.on('order_status_update', ({ status: s }) => setStatus(s));
    socket.on('agent_location', (loc) => setAgentLocation(loc));
    return () => {
      socket.off('order_status_update');
      socket.off('agent_location');
    };
  }, [orderId, socketRef]);

  const eta = tracking?.estimatedDelivery
    ? Math.max(0, Math.round((new Date(tracking.estimatedDelivery) - Date.now()) / 60000))
    : null;

  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] min-h-screen antialiased">
      <TrackingNavBar />
      <TrackingSidebar />
      <main className="lg:ml-64 pt-20 min-h-screen flex flex-col">
        <div className="w-full p-6 md:p-8 flex-1">
          <nav className="flex items-center gap-2 mb-6 text-sm text-slate-500 font-medium">
            <Link className="hover:text-[#0d631b] transition-colors" to="/">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link className="hover:text-[#0d631b] transition-colors" to="/tracking">My Orders</Link>
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
                Status: {status?.replace(/_/g, ' ') || 'Loading...'}
              </p>
            </div>
            <div className="relative z-10 bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30 text-sm font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              ORDER #{tracking?.orderId || '—'}
            </div>
          </div>

          {/* Status Steps */}
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const currentIdx = STATUS_STEPS.indexOf(status);
                const done = i <= currentIdx;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center gap-2 relative z-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10 ${done ? 'bg-[#0d631b] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                    </div>
                    <span className="text-[10px] text-center text-slate-500 capitalize hidden sm:block">{step.replace(/_/g, ' ')}</span>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`hidden sm:block absolute top-4 left-1/2 h-0.5 w-full -z-10 ${done ? 'bg-[#0d631b]' : 'bg-slate-100'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            <TrackingMap agentLocation={agentLocation} />
            <TrackingOrderDetails order={tracking} />
          </div>
        </div>
        <TrackingFooter />
      </main>
      <TrackingMobileNav />
    </div>
  );
}
