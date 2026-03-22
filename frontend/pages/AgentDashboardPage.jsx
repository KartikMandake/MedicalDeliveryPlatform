import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AgentRouteMap from '../components/agent/AgentRouteMap';
import {
  acceptAgentDelivery,
  confirmDeliveryWithOtp,
  getAgentDeliveries,
  getAgentHistory,
  getAgentPerformance,
  setAgentOnlineStatus,
} from '../api/agent';
import { updateAgentLocation } from '../api/tracking';
import { useSocket } from '../hooks/useSocket';

function formatStatus(status) {
  return String(status || '').replace(/_/g, ' ');
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDateTime(value) {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  const mins = Number(minutes);
  if (!Number.isFinite(mins) || mins < 0) return '--';
  const wholeMins = Math.round(mins);
  if (wholeMins < 60) return `${wholeMins}m`;
  const h = Math.floor(wholeMins / 60);
  const m = wholeMins % 60;
  return `${h}h ${m}m`;
}

function formatMoney(value) {
  return `Rs.${Number(value || 0).toFixed(2)}`;
}

function getDistanceKm(fromLat, fromLng, toLat, toLng) {
  const lat1 = toNumber(fromLat);
  const lng1 = toNumber(fromLng);
  const lat2 = toNumber(toLat);
  const lng2 = toNumber(toLng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function getPickupShops(order) {
  const shops = Array.isArray(order?.pickupShops) ? order.pickupShops : [];
  if (shops.length) return shops;
  if (order?.pickupPharmacy?.name || Number.isFinite(toNumber(order?.pickupPharmacy?.lat))) {
    return [order.pickupPharmacy];
  }
  return [];
}

export default function AgentDashboardPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const socketRef = useSocket();

  const [online, setOnline] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [perf, setPerf] = useState({
    total: 0,
    delivered: 0,
    inTransit: 0,
    successRate: 0,
    deliveredToday: 0,
    assignedToday: 0,
    readyForPickup: 0,
    avgDeliveryMinutes: 0,
    avgDeliveredValue: 0,
    grossValue: 0,
    cancelled: 0,
    multiShopOrders: 0,
    trendLast7Days: [],
  });
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [historyStatus, setHistoryStatus] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [submittingOrderId, setSubmittingOrderId] = useState('');
  const [lastLocation, setLastLocation] = useState({ lat: null, lng: null });

  const captureAndPublishLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      await setAgentOnlineStatus(true, 0, 0);
      setOnline(true);
      return;
    }

    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            await setAgentOnlineStatus(true, latitude, longitude);
            await updateAgentLocation(latitude, longitude);
            setLastLocation({ lat: latitude, lng: longitude });
            setOnline(true);
          } catch {
            // Keep dashboard usable even if one network call fails.
          } finally {
            resolve();
          }
        },
        async () => {
          try {
            await setAgentOnlineStatus(true, 0, 0);
            setOnline(true);
          } catch {
            // Ignore initial online bootstrap failure; user can toggle manually.
          } finally {
            resolve();
          }
        },
        { enableHighAccuracy: true, timeout: 9000 }
      );
    });
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoadingData(true);
    try {
      const [deliveriesRes, perfRes] = await Promise.all([
        getAgentDeliveries(),
        getAgentPerformance(),
      ]);
      setDeliveries(Array.isArray(deliveriesRes.data) ? deliveriesRes.data : []);
      setPerf(perfRes.data || {
        total: 0,
        delivered: 0,
        inTransit: 0,
        successRate: 0,
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to load delivery dashboard.', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getAgentHistory({ page: historyPage, limit: 8, ...(historyStatus ? { status: historyStatus } : {}) });
      setHistoryRows(Array.isArray(res.data?.history) ? res.data.history : []);
      setHistoryPages(Number(res.data?.pages || 1));
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to load delivery history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyStatus, showToast]);

  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    fetchDashboard();
  }, [fetchDashboard, user]);

  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    fetchHistory();
  }, [fetchHistory, user]);

  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    captureAndPublishLocation();
  }, [captureAndPublishLocation, user]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user || user.role !== 'agent') return;
    socket.emit('join_role', 'agent');

    const onNewDelivery = () => {
      fetchDashboard();
      fetchHistory();
      showToast('New delivery request assigned to you.', 'info');
    };

    socket.on('new_delivery', onNewDelivery);
    return () => {
      socket.off('new_delivery', onNewDelivery);
    };
  }, [fetchDashboard, fetchHistory, showToast, socketRef, user]);

  useEffect(() => {
    if (!user || user.role !== 'agent') return undefined;

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchDashboard, user]);

  useEffect(() => {
    if (!online) return;

    const pushLocation = async () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            await updateAgentLocation(latitude, longitude);
            setLastLocation({ lat: latitude, lng: longitude });
          } catch {
            // Keep UI responsive if location update fails intermittently.
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 7000 }
      );
    };

    pushLocation();
    const interval = setInterval(pushLocation, 10000);
    return () => clearInterval(interval);
  }, [online]);

  const pendingRequests = useMemo(
    () => deliveries.filter((d) => d.status === 'ready_for_pickup' || d.status === 'confirmed'),
    [deliveries]
  );

  const activeDelivery = useMemo(
    () => deliveries.find((d) => d.status === 'in_transit') || null,
    [deliveries]
  );

  const nearestPending = useMemo(() => {
    if (!pendingRequests.length) return null;
    const withDistance = pendingRequests
      .map((order) => {
        const km = getDistanceKm(
          lastLocation.lat,
          lastLocation.lng,
          order.pickupPharmacy?.lat,
          order.pickupPharmacy?.lng
        );
        return { ...order, distanceToPickupKm: km };
      })
      .sort((a, b) => {
        const aDist = Number.isFinite(a.distanceToPickupKm) ? a.distanceToPickupKm : Number.POSITIVE_INFINITY;
        const bDist = Number.isFinite(b.distanceToPickupKm) ? b.distanceToPickupKm : Number.POSITIVE_INFINITY;
        if (aDist !== bDist) return aDist - bDist;
        return String(a.orderId).localeCompare(String(b.orderId));
      });
    return withDistance[0];
  }, [lastLocation.lat, lastLocation.lng, pendingRequests]);

  const trendMax = useMemo(() => {
    const counts = (perf.trendLast7Days || []).map((d) => Number(d.count || 0));
    return Math.max(1, ...counts);
  }, [perf.trendLast7Days]);

  const handleOnlineToggle = async () => {
    const next = !online;
    try {
      await setAgentOnlineStatus(next);
      setOnline(next);
      showToast(next ? 'You are now online for assignments.' : 'You are now offline.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to change online status.', 'error');
    }
  };

  const handleAccept = async (orderId) => {
    setSubmittingOrderId(orderId);
    try {
      await acceptAgentDelivery(orderId);
      showToast('Delivery accepted. Marked as in transit.', 'success');
      await fetchDashboard();
      await fetchHistory();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to accept delivery.', 'error');
    } finally {
      setSubmittingOrderId('');
    }
  };

  const handleCustomerConfirm = async () => {
    if (!activeDelivery) return;
    if (!deliveryOtp.trim()) {
      showToast('Please enter delivery OTP shared by customer.', 'error');
      return;
    }

    setSubmittingOrderId(activeDelivery.id);
    try {
      await confirmDeliveryWithOtp(activeDelivery.id, deliveryOtp.trim());
      setDeliveryOtp('');
      showToast('Delivery confirmed by customer OTP.', 'success');
      await fetchDashboard();
      await fetchHistory();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to confirm delivery OTP.', 'error');
    } finally {
      setSubmittingOrderId('');
    }
  };

  if (loading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-sm shadow-zinc-200/50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-zinc-900 font-['Manrope']">MediFlow</span>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-green-600 font-semibold border-b-2 border-green-600 font-['Manrope'] text-sm h-16 flex items-center">Delivery Operations</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleOnlineToggle}
            className={`flex items-center rounded-full px-3 py-1 gap-2 border ${online ? 'bg-[#f3f4f5] border-[#bccbb9]/40 text-[#3d4a3d]' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
          >
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-[#006e2f] animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[10px] font-bold tracking-wider uppercase">{online ? 'Online' : 'Offline'}</span>
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user.name || 'Agent'}</p>
            <p className="text-[10px] text-slate-500">Delivery Partner</p>
          </div>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-zinc-50 pt-20 pb-6 px-4 hidden lg:flex flex-col">
        <div className="flex flex-col gap-1 mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 px-4">Command Center</h3>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink to="/agent" className="flex items-center gap-3 px-4 py-3 bg-white text-green-600 rounded-xl shadow-sm text-sm font-medium">
            <span className="material-symbols-outlined">local_shipping</span> Order Tracking
          </NavLink>
          <NavLink to="/agent/performance" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">monitoring</span> Performance
          </NavLink>
          <NavLink to="/agent/history" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">history</span> Transit History
          </NavLink>
        </nav>
        <div className="mt-auto bg-white p-4 rounded-xl shadow-sm border border-zinc-200/60">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Today</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-slate-900">{perf.deliveredToday || 0}</span>
            <span className="text-[10px] font-medium text-[#006e2f] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">Delivered</span>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 pt-20 pb-8 px-6 min-h-screen">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden border border-[#006e2f]/10" style={{ background: 'linear-gradient(to bottom right, #ffffff, rgba(74, 225, 118, 0.05))' }}>
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div>
              <h4 className="font-['Manrope'] font-bold text-slate-900">Nearest Suggested Pickup</h4>
              <p className="text-sm text-slate-600">
                {nearestPending
                  ? `${nearestPending.pickupPharmacy?.name || 'Assigned pharmacy'} • ${nearestPending.distanceToPickupKm ?? '--'} km away`
                  : 'No pending pickup requests right now.'}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200/60 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Success Rate</span>
              <span className="text-xs font-medium text-slate-700">In Transit: {perf.inTransit}</span>
            </div>
            <p className="text-2xl font-['Manrope'] font-extrabold text-slate-900 mt-4">{perf.successRate}%</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-zinc-200/60 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Assigned Today</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{perf.assignedToday || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200/60 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ready For Pickup</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{perf.readyForPickup || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200/60 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Avg Delivery Time</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatDuration(perf.avgDeliveryMinutes)}</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200/60 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Gross Handled Value</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{formatMoney(perf.grossValue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-['Manrope'] text-lg font-extrabold text-slate-900">Assigned Queue ({pendingRequests.length})</h2>
            </div>

            {loadingData && <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm text-slate-500">Loading delivery requests...</div>}

            {!loadingData && pendingRequests.length === 0 && (
              <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm text-slate-500">No pending assignments right now.</div>
            )}

            {pendingRequests.map((order) => {
              const pickupDistance = getDistanceKm(lastLocation.lat, lastLocation.lng, order.pickupPharmacy?.lat, order.pickupPharmacy?.lng);
              const pickupShops = getPickupShops(order);
              return (
                <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#22c55e] hover:translate-x-1 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#afefb4] text-[#145126] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-tighter">Assigned</span>
                    <span className="text-[11px] font-bold text-slate-500">{Number.isFinite(pickupDistance) ? `${pickupDistance} km` : 'distance NA'}</span>
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-slate-900">{order.pickupPharmacy?.name || order.retailerName || 'Pharmacy pickup'}</h3>
                  {pickupShops.length > 1 && (
                    <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Multi-shop pickup: {pickupShops.length} pharmacies</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Order {order.orderId} • {formatStatus(order.status)}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Deliver to: {order.customerName || 'Customer'} {order.customerPhone ? `• ${order.customerPhone}` : ''}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Address: {order.deliveryAddress?.line1 || 'Delivery address on file'}</p>

                  {(order.items || []).length > 0 && (
                    <div className="mt-3 rounded-lg bg-[#f8f9fa] border border-zinc-200/60 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup List</p>
                      <ul className="mt-1 space-y-1">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <li key={`${order.id}-${idx}`} className="text-[11px] text-slate-700">
                            {item.name} x{item.quantity}
                            {item.sourceRetailerName ? ` • ${item.sourceRetailerName}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pickupShops.length > 0 && (
                    <div className="mt-3 rounded-lg bg-white border border-zinc-200/70 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup Shops</p>
                      <ul className="mt-1.5 space-y-1">
                        {pickupShops.map((shop, idx) => (
                          <li key={`${order.id}-shop-${idx}`} className="text-[11px] text-slate-700">
                            {shop?.name || `Pharmacy ${idx + 1}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{formatMoney(order.total)}</span>
                    <button
                      type="button"
                      onClick={() => handleAccept(order.id)}
                      disabled={submittingOrderId === order.id}
                      className="py-2 px-4 bg-[#006e2f] text-white rounded-lg text-xs font-bold disabled:opacity-60"
                    >
                      {submittingOrderId === order.id ? 'Accepting...' : 'Accept Pickup'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-zinc-200/60">
              <div className="p-6 border-b border-zinc-200/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-['Manrope'] text-xl font-extrabold text-slate-900 tracking-tight">Active Delivery</h2>
                    <p className="text-sm text-slate-500">
                      {activeDelivery ? `Order ${activeDelivery.orderId} • ${activeDelivery.pickupPharmacy?.name || activeDelivery.retailerName || 'Assigned pharmacy'}` : 'No active in-transit delivery'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[360px] bg-zinc-100 overflow-hidden">
                <AgentRouteMap
                  agentLocation={lastLocation}
                  pickupLocation={{
                    lat: activeDelivery?.pickupPharmacy?.lat,
                    lng: activeDelivery?.pickupPharmacy?.lng,
                  }}
                  dropLocation={{
                    lat: activeDelivery?.deliveryAddress?.lat,
                    lng: activeDelivery?.deliveryAddress?.lng,
                  }}
                />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-zinc-200/60">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Current Delivery</p>
                    <p className="text-lg font-['Manrope'] font-extrabold text-slate-900">
                      {activeDelivery ? `${activeDelivery.customerName || 'Customer'} • ${activeDelivery.customerPhone || '--'}` : 'Waiting for accepted pickup'}
                    </p>
                  </div>
                </div>
              </div>

              {activeDelivery && (
                <div className="p-6 space-y-4 border-t border-zinc-200/60">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Pickup Route Plan</p>
                    <ul className="mt-2 space-y-1.5">
                      {getPickupShops(activeDelivery).map((shop, idx) => (
                        <li key={`${activeDelivery.id}-active-shop-${idx}`} className="text-sm text-slate-800">
                          Stop {idx + 1}: {shop?.name || `Pharmacy ${idx + 1}`}
                        </li>
                      ))}
                      {getPickupShops(activeDelivery).length === 0 && (
                        <li className="text-sm text-slate-500">Pickup pharmacy details will appear once assignment payload is available.</li>
                      )}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Pickup Pharmacy</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{activeDelivery.pickupPharmacy?.name || activeDelivery.retailerName || '--'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Delivery Address</p>
                      <p className="mt-1 text-sm font-bold text-slate-900 truncate">{activeDelivery.deliveryAddress?.line1 || '--'}</p>
                    </div>
                  </div>

                  {(activeDelivery.items || []).length > 0 && (
                    <div className="p-4 rounded-xl bg-[#f3f4f5] border border-zinc-200/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Medicine Pickup Checklist</p>
                      <ul className="space-y-1.5">
                        {activeDelivery.items.map((item, idx) => (
                          <li key={`${activeDelivery.id}-${idx}`} className="text-sm text-slate-800 flex justify-between gap-2">
                            <span>{item.name}{item.sourceRetailerName ? ` • ${item.sourceRetailerName}` : ''}</span>
                            <span className="font-bold">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-700">Customer Confirmation on Delivery</p>
                    <p className="text-xs text-emerald-700/80 mt-1">Ask customer for delivery OTP and enter it below to mark order delivered.</p>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={deliveryOtp}
                        onChange={(e) => setDeliveryOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                      <button
                        type="button"
                        onClick={handleCustomerConfirm}
                        disabled={submittingOrderId === activeDelivery.id}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-60"
                      >
                        {submittingOrderId === activeDelivery.id ? 'Confirming...' : 'Confirm Delivered'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4 bg-white rounded-xl border border-zinc-200/60 p-5">
            <h3 className="text-lg font-['Manrope'] font-extrabold text-slate-900 mb-4">Performance Insights</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed Orders</span>
                <span className="font-bold text-slate-900">{perf.delivered}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cancelled Orders</span>
                <span className="font-bold text-slate-900">{perf.cancelled || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Multi-shop Orders</span>
                <span className="font-bold text-slate-900">{perf.multiShopOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Average Delivered Value</span>
                <span className="font-bold text-slate-900">{formatMoney(perf.avgDeliveredValue)}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-200/60">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Last 7 Days Delivery Trend</p>
              <div className="space-y-2">
                {(perf.trendLast7Days || []).map((day) => {
                  const width = `${Math.max(6, Math.round((Number(day.count || 0) / trendMax) * 100))}%`;
                  return (
                    <div key={`${day.date}-${day.label}`} className="flex items-center gap-2">
                      <span className="w-8 text-[11px] text-slate-500 font-semibold">{day.label}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full rounded-full bg-[#006e2f]" style={{ width }} />
                      </div>
                      <span className="w-6 text-right text-[11px] font-bold text-slate-700">{day.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 bg-white rounded-xl border border-zinc-200/60 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-['Manrope'] font-extrabold text-slate-900">Transit History</h3>
              <div className="flex items-center gap-2">
                <select
                  value={historyStatus}
                  onChange={(e) => {
                    setHistoryStatus(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white"
                >
                  <option value="">All statuses</option>
                  <option value="delivered">Delivered</option>
                  <option value="in_transit">In transit</option>
                  <option value="ready_for_pickup">Ready for pickup</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.08em] text-slate-500 border-b border-zinc-200/60">
                    <th className="py-2.5 pr-3">Order</th>
                    <th className="py-2.5 pr-3">Customer</th>
                    <th className="py-2.5 pr-3">Shops</th>
                    <th className="py-2.5 pr-3">Items</th>
                    <th className="py-2.5 pr-3">Value</th>
                    <th className="py-2.5 pr-3">Duration</th>
                    <th className="py-2.5 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-sm text-slate-500">Loading transit history...</td>
                    </tr>
                  ) : historyRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-sm text-slate-500">No history entries found.</td>
                    </tr>
                  ) : historyRows.map((row) => (
                    <tr key={row.id} className="border-b border-zinc-100">
                      <td className="py-2.5 pr-3">
                        <p className="text-xs font-bold text-slate-900">{row.orderId}</p>
                        <p className="text-[11px] text-slate-500">{formatDateTime(row.placedAt)}</p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-xs font-semibold text-slate-800">{row.customerName || '--'}</p>
                        <p className="text-[11px] text-slate-500">{row.customerPhone || '--'}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-slate-700">{Number(row.shopStops || 0)}</td>
                      <td className="py-2.5 pr-3 text-xs text-slate-700">{Number(row.itemCount || 0)}</td>
                      <td className="py-2.5 pr-3 text-xs font-semibold text-slate-800">{formatMoney(row.total)}</td>
                      <td className="py-2.5 pr-3 text-xs text-slate-700">{formatDuration(row.deliveryMinutes)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-slate-700 uppercase">
                          {formatStatus(row.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">Page {historyPage} of {historyPages}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-slate-600 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.min(historyPages, p + 1))}
                  disabled={historyPage >= historyPages}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-slate-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur h-14 flex justify-around items-center border-t border-slate-200 z-40">
        <NavLink to="/agent" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>Orders</NavLink>
        <NavLink to="/agent/performance" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>Stats</NavLink>
        <NavLink to="/agent/history" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>History</NavLink>
      </nav>
    </div>
  );
}
