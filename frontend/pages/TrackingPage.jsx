import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';
import TrackingMap from '../components/tracking/TrackingMap';
import TrackingOrderDetails from '../components/tracking/TrackingOrderDetails';
import { getOrderTracking } from '../api/tracking';
import { useSocket } from '../hooks/useSocket';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Received' },
  { key: 'confirmed', label: 'Clinically Verified' },
  { key: 'preparing', label: 'Packaging' },
  { key: 'ready_for_pickup', label: 'Ready for Dispatch' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [tracking, setTracking] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);
  const [status, setStatus] = useState('');
  const [loadError, setLoadError] = useState('');
  const [syncedAt, setSyncedAt] = useState('');
  const socketRef = useSocket();

  const formatSystemTime = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString('en-US', {
      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
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
      setLoadError(err.response?.data?.message || 'Unable to establish secure connection to tracking satellite.');
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
    socket.on('order_status_update', ({ status: s }) => { setStatus(s); fetchTracking(); });
    socket.on('agent_location', (loc) => { setAgentLocation(loc); setSyncedAt(new Date().toISOString()); });
    return () => { socket.off('order_status_update'); socket.off('agent_location'); };
  }, [fetchTracking, orderId, socketRef]);

  const eta = tracking?.estimatedDelivery
    ? Math.max(0, Math.round((new Date(tracking.estimatedDelivery) - Date.now()) / 60000))
    : null;

  const destinationLocation = {
    lat: tracking?.deliveryAddress?.lat,
    lng: tracking?.deliveryAddress?.lng,
  };

  const isDelivered = status === 'delivered';
  const getStatusText = () => {
    if (isDelivered) return 'Securely Delivered';
    if (eta !== null) return `Estimated Arrival: ${eta} minutes`;
    return 'Initializing Live Telemetry';
  };

  return (
    <div className="bg-[#f8f9fa] font-body text-slate-900 fixed inset-0 overflow-y-auto overflow-x-hidden pt-20">
      <ProductsNavBar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <nav className="flex items-center gap-2 mb-8 text-xs font-bold text-slate-500 tracking-wider uppercase">
           <Link className="hover:text-emerald-700 transition-colors" to="/">Dashboard</Link>
           <span className="material-symbols-outlined text-[14px]">chevron_right</span>
           <Link className="hover:text-emerald-700 transition-colors" to="/orders">Order History</Link>
           <span className="material-symbols-outlined text-[14px]">chevron_right</span>
           <span className="text-emerald-700 font-extrabold flex items-center gap-1">
             <span className="material-symbols-outlined text-[16px]">track_changes</span>
             ID: {tracking?.orderId || orderId || 'N/A'}
           </span>
        </nav>

        {/* Hero Tracking Card */}
        <div className={`mb-10 p-8 md:p-10 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl relative overflow-hidden transition-all duration-700 ${isDelivered ? 'bg-slate-900 shadow-slate-900/10' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
           <div className={`absolute top-0 right-0 w-96 h-[200%] -skew-x-12 transform translate-x-32 bg-white/5`} />
           
           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              {!isDelivered ? (
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0 relative">
                   <div className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-50"></div>
                   <span className="material-symbols-outlined text-white text-3xl">satellite_alt</span>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-slate-800 shrink-0">
                   <span className="material-symbols-outlined text-slate-900 text-3xl">task_alt</span>
                </div>
              )}
              
              <div>
                 <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-white mb-2">
                   {getStatusText()}
                 </h1>
                 <p className="font-bold text-white/80 uppercase tracking-widest text-sm flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${isDelivered ? 'bg-white' : 'bg-white animate-pulse'}`} />
                   {loadError ? 'Signal Lost' : status ? status.replace(/_/g, ' ') : 'Establishing Connect...'}
                 </p>
                 {loadError && <p className="mt-3 text-sm text-rose-200 bg-rose-900/50 p-3 rounded-lg border border-rose-500/50">{loadError}</p>}
              </div>
           </div>

           <div className="relative z-10 hidden lg:block bg-white/10 backdrop-blur-[20px] p-4 rounded-2xl border border-white/20 text-white min-w-[200px]">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Protocol</p>
             <p className="font-mono font-bold text-sm bg-black/20 px-3 py-1.5 rounded-lg inline-block">{tracking?.orderId || 'AWAITING'}</p>
           </div>
        </div>

        {/* Macro Tracking Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
           <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 p-2 rounded-xl text-[20px]">credit_card</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Payment Link</p>
                <p className="text-sm font-extrabold text-slate-800 capitalize">{tracking?.paymentStatus || '--'}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-slate-500 bg-slate-50 p-2 rounded-xl text-[20px]">schedule</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time Registered</p>
                <p className="text-xs font-bold text-slate-800">{formatSystemTime(tracking?.placedAt)}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 p-2 rounded-xl text-[20px]">sync</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Last Telemetry Ping</p>
                <p className="text-xs font-bold text-slate-800">{formatSystemTime(syncedAt)}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4 justify-between group overflow-hidden relative">
              <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Handshake OTP</p>
                {isDelivered ? (
                  <span className="text-xs font-extrabold text-emerald-700">Not Required</span>
                ) : tracking?.deliveryOtp ? (
                  <span className="text-2xl font-black font-mono tracking-widest text-slate-900">{tracking.deliveryOtp}</span>
                ) : (
                  <span className="text-xs font-bold text-slate-500">Awaiting Generation</span>
                )}
              </div>
              <span className="material-symbols-outlined text-slate-300 text-4xl relative z-10 group-hover:text-emerald-500 transition-colors">phonelink_lock</span>
           </div>
        </div>

        {/* Visual Progress Ribbon */}
        <div className="bg-white rounded-2xl p-8 mb-10 shadow-sm border border-slate-200/60 relative overflow-hidden hidden md:block">
           <div className="flex items-center justify-between relative z-10">
             {STATUS_STEPS.map((step, i) => {
               const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
               const done = i <= currentIdx;
               const active = i === currentIdx;
               return (
                 <div key={step.key} className="flex flex-col items-center flex-1 relative group">
                    {/* connecting line */}
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute top-4 left-[50%] w-full h-1 ${done && i < currentIdx ? 'bg-emerald-500' : 'bg-slate-100'}`} style={{ zIndex: -1 }}></div>
                    )}
                    
                    <div className={`w-8 h-8 rounded-full mb-3 flex items-center justify-center font-bold text-sm border-4 transition-all duration-500 ${active ? 'bg-emerald-600 border-emerald-100 text-white shadow-lg shadow-emerald-600/30 scale-125' : done ? 'bg-emerald-500 border-white text-white' : 'bg-slate-50 border-white text-slate-300'}`}>
                      {done && !active ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
                    </div>
                    <p className={`text-[10px] uppercase tracking-wider font-extrabold text-center transition-colors ${active ? 'text-emerald-700' : done ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                 </div>
               );
             })}
           </div>
        </div>

        {/* Mapping & Inventory Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <TrackingMap agentLocation={agentLocation} destinationLocation={destinationLocation} />
           <TrackingOrderDetails order={tracking} status={status} />
        </div>

      </main>
      <ProductsFooter />
    </div>
  );
}
