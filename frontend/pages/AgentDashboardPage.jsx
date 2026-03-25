import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NotificationDropdown from '../components/ui/NotificationDropdown';
import AgentRouteMap from '../components/agent/AgentRouteMap';
import {
  acceptAgentDelivery,
  confirmDeliveryWithOtp,
  getAgentDeliveries,
  getAgentPerformance,
  setAgentOnlineStatus,
} from '../api/agent';
import { updateAgentLocation } from '../api/tracking';
import { useSocket } from '../hooks/useSocket';

function toNumber(value) { const p = Number(value); return Number.isFinite(p) ? p : null; }
function formatMoney(value) { return `₹${Number(value || 0).toFixed(2)}`; }
function formatDuration(minutes) { const m = Math.round(Number(minutes)); if (!Number.isFinite(m) || m < 0) return '--'; if (m < 60) return `${m}m`; return `${Math.floor(m / 60)}h ${m % 60}m`; }

function getDistanceKm(fromLat, fromLng, toLat, toLng) {
  const [lat1, lng1, lat2, lng2] = [fromLat, fromLng, toLat, toLng].map(toNumber);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Number((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

function getPickupShops(order) {
  const shops = Array.isArray(order?.pickupShops) ? order.pickupShops : [];
  if (shops.length) return shops;
  if (order?.pickupPharmacy?.name || Number.isFinite(toNumber(order?.pickupPharmacy?.lat))) return [order.pickupPharmacy];
  return [];
}

function formatFullAddress(addr) {
  if (!addr) return 'Address not available';
  return [addr.fullName, addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || 'Address not available';
}

function getStatusBadge(status) {
  const map = {
    confirmed: 'text-amber-700 bg-amber-50 border-amber-200',
    ready_for_pickup: 'text-sky-700 bg-sky-50 border-sky-200',
    in_transit: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    delivered: 'text-slate-700 bg-slate-50 border-slate-200',
    cancelled: 'text-rose-700 bg-rose-50 border-rose-200',
  };
  return map[status] || 'text-slate-600 bg-slate-50 border-slate-200';
}

function AgentShell({ user, online, onToggleOnline, children }) {
  return (
    <div className="bg-[#f8f9fa] font-body text-slate-900 fixed inset-0 overflow-y-auto overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-sm border-b border-slate-200/50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 font-headline">MediFlow</span>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-emerald-600 font-extrabold text-sm h-16 flex items-center border-b-2 border-emerald-600 px-3">Dispatch Center</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={onToggleOnline}
            className={`flex items-center rounded-full px-4 py-2 gap-2.5 border transition-all cursor-pointer ${online ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm shadow-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <span className="relative flex h-2.5 w-2.5">
              {online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <span className="text-[10px] font-black tracking-widest uppercase">{online ? 'On Duty' : 'Off Duty'}</span>
          </button>
          <NotificationDropdown />
          <NavLink to="/agent/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900">{user.name || 'Agent'}</p>
              <p className="text-[10px] font-bold text-slate-500">Delivery Partner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black ring-2 ring-slate-200">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </NavLink>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-white pt-20 pb-6 px-4 hidden lg:flex flex-col border-r border-slate-200/60">
        <div className="mb-6">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mb-3">Command Center</h3>
        </div>
        <nav className="flex-1 space-y-1.5">
          {[
            { to: '/agent', icon: 'local_shipping', label: 'Dispatch Console', end: true },
            { to: '/agent/performance', icon: 'monitoring', label: 'Performance' },
            { to: '/agent/history', icon: 'history', label: 'Transit Log' },
            { to: '/agent/profile', icon: 'badge', label: 'My Profile' },
          ].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {children}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur-xl h-16 flex justify-around items-center border-t border-slate-200 z-40">
        {[
          { to: '/agent', icon: 'local_shipping', label: 'Dispatch', end: true },
          { to: '/agent/performance', icon: 'monitoring', label: 'Stats' },
          { to: '/agent/history', icon: 'history', label: 'History' },
          { to: '/agent/profile', icon: 'person', label: 'Profile' },
        ].map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export { AgentShell };

export default function AgentDashboardPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const socketRef = useSocket();

  const [online, setOnline] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [perf, setPerf] = useState({ total: 0, delivered: 0, inTransit: 0, successRate: 0, deliveredToday: 0, assignedToday: 0, readyForPickup: 0, avgDeliveryMinutes: 0, grossValue: 0 });
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [submittingOrderId, setSubmittingOrderId] = useState('');
  const [lastLocation, setLastLocation] = useState({ lat: null, lng: null });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const hasFetchedOnce = useRef(false);

  const captureAndPublishLocation = useCallback(async () => {
    if (!navigator.geolocation) { await setAgentOnlineStatus(true, 0, 0); setOnline(true); return; }
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => { try { await setAgentOnlineStatus(true, pos.coords.latitude, pos.coords.longitude); await updateAgentLocation(pos.coords.latitude, pos.coords.longitude); setLastLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setOnline(true); } catch {} finally { resolve(); } },
        async () => { try { await setAgentOnlineStatus(true, 0, 0); setOnline(true); } catch {} finally { resolve(); } },
        { enableHighAccuracy: true, timeout: 9000 }
      );
    });
  }, []);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setInitialLoading(true);
    try {
      const [deliveriesRes, perfRes] = await Promise.all([getAgentDeliveries(), getAgentPerformance()]);
      setDeliveries(Array.isArray(deliveriesRes.data) ? deliveriesRes.data : []);
      setPerf(perfRes.data || { total: 0, delivered: 0, inTransit: 0, successRate: 0 });
      hasFetchedOnce.current = true;
    } catch (err) { if (!hasFetchedOnce.current) showToast(err.response?.data?.message || 'Unable to load delivery dashboard.', 'error'); }
    finally { setInitialLoading(false); }
  }, [showToast]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard(true);
    setRefreshing(false);
  };

  useEffect(() => { if (!user || user.role !== 'agent') return; fetchDashboard(false); }, [fetchDashboard, user]);
  useEffect(() => { if (!user || user.role !== 'agent') return; captureAndPublishLocation(); }, [captureAndPublishLocation, user]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user || user.role !== 'agent') return;
    socket.emit('join_role', 'agent');
    const onNewDelivery = () => { fetchDashboard(true); showToast('New delivery request assigned to you.', 'info'); };
    socket.on('new_delivery', onNewDelivery);
    return () => { socket.off('new_delivery', onNewDelivery); };
  }, [fetchDashboard, showToast, socketRef, user]);

  // Silent auto-refresh every 5s
  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    const interval = setInterval(() => fetchDashboard(true), 5000);
    return () => clearInterval(interval);
  }, [fetchDashboard, user]);

  // Location push every 10s
  useEffect(() => {
    if (!online) return;
    const pushLoc = () => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(async (p) => { try { await updateAgentLocation(p.coords.latitude, p.coords.longitude); setLastLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); } catch {} }, () => {}, { enableHighAccuracy: true, timeout: 7000 }); };
    pushLoc();
    const interval = setInterval(pushLoc, 10000);
    return () => clearInterval(interval);
  }, [online]);

  const pendingRequests = useMemo(() => deliveries.filter((d) => d.status === 'ready_for_pickup' || d.status === 'confirmed'), [deliveries]);
  const activeDelivery = useMemo(() => deliveries.find((d) => d.status === 'in_transit') || null, [deliveries]);

  const nearestPending = useMemo(() => {
    if (!pendingRequests.length) return null;
    return pendingRequests
      .map((o) => ({ ...o, distKm: getDistanceKm(lastLocation.lat, lastLocation.lng, o.pickupPharmacy?.lat, o.pickupPharmacy?.lng) }))
      .sort((a, b) => (Number.isFinite(a.distKm) ? a.distKm : Infinity) - (Number.isFinite(b.distKm) ? b.distKm : Infinity))[0];
  }, [lastLocation.lat, lastLocation.lng, pendingRequests]);

  const handleOnlineToggle = async () => {
    const next = !online;
    try { await setAgentOnlineStatus(next); setOnline(next); showToast(next ? 'You are now online.' : 'You are now offline.', 'success'); }
    catch (err) { showToast(err.response?.data?.message || 'Unable to change status.', 'error'); }
  };

  const handleAccept = async (orderId) => {
    setSubmittingOrderId(orderId);
    try { await acceptAgentDelivery(orderId); showToast('Delivery accepted.', 'success'); await fetchDashboard(true); }
    catch (err) { showToast(err.response?.data?.message || 'Unable to accept.', 'error'); }
    finally { setSubmittingOrderId(''); }
  };

  const handleCustomerConfirm = async () => {
    if (!activeDelivery || !deliveryOtp.trim()) { showToast('Enter delivery OTP.', 'error'); return; }
    setSubmittingOrderId(activeDelivery.id);
    try { await confirmDeliveryWithOtp(activeDelivery.id, deliveryOtp.trim()); setDeliveryOtp(''); showToast('Delivery confirmed.', 'success'); await fetchDashboard(true); }
    catch (err) { showToast(err.response?.data?.message || 'OTP invalid.', 'error'); }
    finally { setSubmittingOrderId(''); }
  };

  if (loading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  return (
    <AgentShell user={user} online={online} onToggleOnline={handleOnlineToggle}>
      <main className="lg:ml-64 pt-20 pb-24 px-6 min-h-screen">

        {/* KPI Row */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Success Rate', value: `${perf.successRate}%`, icon: 'check_circle', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Ready Pickup', value: perf.readyForPickup || 0, icon: 'inventory_2', color: 'text-sky-500 bg-sky-50' },
            { label: 'Avg Time', value: formatDuration(perf.avgDeliveryMinutes), icon: 'speed', color: 'text-amber-500 bg-amber-50' },
            { label: 'Gross Value', value: formatMoney(perf.grossValue), icon: 'account_balance_wallet', color: 'text-indigo-500 bg-indigo-50' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <span className={`material-symbols-outlined ${kpi.color} p-2.5 rounded-xl text-[20px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
                <p className="text-2xl font-black font-headline text-slate-900">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nearest Pickup Banner */}
        {nearestPending && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-emerald-600/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-[200%] -skew-x-12 translate-x-32 bg-white/5" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>near_me</span>
              </div>
              <div>
                <h4 className="font-extrabold font-headline text-lg">Nearest Pickup Available</h4>
                <p className="text-sm font-medium text-white/80">{nearestPending.pickupPharmacy?.name || 'Pharmacy'} • {nearestPending.distKm ?? '--'} km away</p>
              </div>
            </div>
            <button onClick={() => handleAccept(nearestPending.id)} disabled={submittingOrderId === nearestPending.id}
              className="relative z-10 px-6 py-3 bg-white text-emerald-700 font-extrabold rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-60 cursor-pointer">
              {submittingOrderId === nearestPending.id ? 'Accepting...' : 'Accept & Start'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT: Assignment Queue */}
          <div className="xl:col-span-5 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-extrabold font-headline text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">assignment</span>
                Queue
                <span className="ml-1 text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
              </h2>
              <button onClick={handleManualRefresh} disabled={refreshing}
                className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-emerald-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer disabled:opacity-50">
                <span className={`material-symbols-outlined text-[16px] ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                {refreshing ? 'Syncing...' : 'Refresh'}
              </button>
            </div>

            {initialLoading && !hasFetchedOnce.current && <div className="bg-white p-8 rounded-2xl border border-slate-200/60 text-center"><span className="w-6 h-6 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin inline-block" /></div>}

            {!initialLoading && pendingRequests.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/60 border-dashed text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">inbox</span>
                <p className="text-sm font-bold text-slate-700">Queue Empty</p>
                <p className="text-xs text-slate-500 mt-1">No pending assignments. Stay online to receive dispatches.</p>
              </div>
            )}

            {pendingRequests.map((order) => {
              const pickupDistance = getDistanceKm(lastLocation.lat, lastLocation.lng, order.pickupPharmacy?.lat, order.pickupPharmacy?.lng);
              const pickupShops = getPickupShops(order);
              const isExpanded = expandedOrderId === order.id;
              const addr = order.deliveryAddress;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg hover:border-emerald-200/50 transition-all">
                  <div className="p-5 flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-black uppercase shrink-0">{order.customerName?.slice(0, 2) || 'NA'}</div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base font-headline">{order.customerName || 'Customer'}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {order.customerPhone && <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"><span className="material-symbols-outlined text-[14px]">call</span> {order.customerPhone}</a>}
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{order.orderId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>{String(order.status || '').replace(/_/g, ' ')}</span>
                      {Number.isFinite(pickupDistance) && <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{pickupDistance} km</span>}
                    </div>
                  </div>

                  <div className="px-5 pb-4 space-y-3">
                    <div className="flex items-start gap-3 bg-[#f8f9fa] p-3 rounded-xl border border-slate-200/50">
                      <span className="material-symbols-outlined text-slate-400 text-[18px] mt-0.5 shrink-0">storefront</span>
                      <div className="text-xs">
                        <p className="font-extrabold text-slate-800">{order.pickupPharmacy?.name || order.retailerName || 'Pharmacy'}</p>
                        {pickupShops.length > 1 && <p className="text-emerald-600 font-bold mt-0.5">Multi-stop: {pickupShops.length} pharmacies</p>}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-[#f8f9fa] p-3 rounded-xl border border-slate-200/50">
                      <span className="material-symbols-outlined text-rose-400 text-[18px] mt-0.5 shrink-0">location_on</span>
                      <div className="text-xs">
                        <p className="font-extrabold text-slate-800">Deliver to: {addr?.fullName || order.customerName || 'Customer'}</p>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{formatFullAddress(addr)}</p>
                        {addr?.phone && <p className="text-slate-500 mt-1 font-bold">📞 {addr.phone}</p>}
                        {addr?.landmark && <p className="text-slate-500 mt-0.5">Landmark: {addr.landmark}</p>}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="w-full px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 border-t border-slate-100 flex items-center justify-center gap-1 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                    {isExpanded ? 'Hide Details' : 'View Manifest'}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-3">
                      {(order.items || []).length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200/60 p-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Pickup Manifest</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm mb-1.5">
                              <span className="font-bold text-slate-800">{item.name} {item.sourceRetailerName && <span className="text-[10px] text-slate-400 ml-1">via {item.sourceRetailerName}</span>}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">x{item.quantity}</span>
                                <span className="text-xs font-black text-slate-900">{formatMoney(item.totalPrice)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="px-5 pb-5 flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-700 font-headline">{formatMoney(order.total)}</span>
                    <button onClick={() => handleAccept(order.id)} disabled={submittingOrderId === order.id}
                      className="py-2.5 px-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold disabled:opacity-60 transition-all hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      {submittingOrderId === order.id ? 'Accepting...' : 'Accept Pickup'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Active Delivery */}
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/60">
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold font-headline text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">gps_fixed</span> Active Delivery
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{activeDelivery ? `Order ${activeDelivery.orderId} • En route to ${activeDelivery.customerName || 'Customer'}` : 'No active in-transit delivery'}</p>
                  </div>
                  {activeDelivery && (
                    <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
                    </span>
                  )}
                </div>
              </div>

              <div className="relative h-[380px] bg-slate-100 overflow-hidden">
                <AgentRouteMap agentLocation={lastLocation}
                  pickupLocation={{ lat: activeDelivery?.pickupPharmacy?.lat, lng: activeDelivery?.pickupPharmacy?.lng }}
                  dropLocation={{ lat: activeDelivery?.deliveryAddress?.lat, lng: activeDelivery?.deliveryAddress?.lng }} />
              </div>

              {activeDelivery && (
                <div className="p-6 space-y-5">
                  {/* Customer Card */}
                  <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] -mr-10 -mt-10" />
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center text-emerald-700 text-xl font-black uppercase shrink-0">{activeDelivery.customerName?.slice(0, 2) || 'CU'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-0.5">Deliver To</p>
                        <h4 className="font-extrabold font-headline text-slate-900 text-lg leading-tight truncate">{activeDelivery.customerName || 'Customer'}</h4>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          {activeDelivery.customerPhone && <a href={`tel:${activeDelivery.customerPhone}`} className="flex items-center gap-1 text-xs font-bold text-emerald-600"><span className="material-symbols-outlined text-[14px]">call</span> {activeDelivery.customerPhone}</a>}
                        </div>
                      </div>
                      {activeDelivery.customerPhone && (
                        <a href={`tel:${activeDelivery.customerPhone}`} className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 shrink-0 cursor-pointer"><span className="material-symbols-outlined">call</span></a>
                      )}
                    </div>
                  </div>

                  {/* Address Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#f8f9fa] border border-slate-200/60">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">storefront</span> Pickup</p>
                      <p className="text-sm font-extrabold text-slate-900">{activeDelivery.pickupPharmacy?.name || activeDelivery.retailerName || '--'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f8f9fa] border border-slate-200/60">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> Drop</p>
                      <p className="text-sm font-extrabold text-slate-900 mb-1">{activeDelivery.deliveryAddress?.fullName || activeDelivery.customerName}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{formatFullAddress(activeDelivery.deliveryAddress)}</p>
                      {activeDelivery.deliveryAddress?.landmark && <p className="text-xs text-slate-500 mt-1 italic">📍 {activeDelivery.deliveryAddress.landmark}</p>}
                    </div>
                  </div>

                  {/* Items */}
                  {(activeDelivery.items || []).length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200/60">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Checklist ({activeDelivery.items.length})</p>
                      {activeDelivery.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm bg-[#f8f9fa] p-2.5 rounded-lg mb-1.5">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="font-black text-slate-900 text-xs">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* OTP */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-[30px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Customer Handshake</p>
                      <p className="text-xs font-medium text-slate-400 mb-4">Enter the customer's delivery OTP to confirm.</p>
                      <div className="flex gap-3">
                        <input type="text" value={deliveryOtp} onChange={(e) => setDeliveryOtp(e.target.value)} placeholder="Enter OTP"
                          className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm font-mono font-bold tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                        <button onClick={handleCustomerConfirm} disabled={submittingOrderId === activeDelivery.id}
                          className="px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl font-extrabold disabled:opacity-60 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          {submittingOrderId === activeDelivery.id ? 'Verifying...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AgentShell>
  );
}
