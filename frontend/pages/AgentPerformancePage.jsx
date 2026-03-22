import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAgentPerformance, setAgentOnlineStatus } from '../api/agent';

function formatMoney(value) {
  return `Rs.${Number(value || 0).toFixed(2)}`;
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

export default function AgentPerformancePage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [online, setOnline] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    setLoadingStats(true);
    getAgentPerformance()
      .then((res) => {
        setStats(res.data || {});
        setOnline(Boolean(res.data?.liveLocation?.isOnline));
      })
      .catch((err) => showToast(err.response?.data?.message || 'Unable to load performance metrics.', 'error'))
      .finally(() => setLoadingStats(false));
  }, [showToast, user]);

  const trendMax = useMemo(() => {
    const counts = (stats?.trendLast7Days || []).map((d) => Number(d.count || 0));
    return Math.max(1, ...counts);
  }, [stats]);

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

  if (loading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-sm shadow-zinc-200/50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-zinc-900 font-['Manrope']">MediFlow</span>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-green-600 font-semibold border-b-2 border-green-600 font-['Manrope'] text-sm h-16 flex items-center">Performance Insights</span>
          </div>
        </div>
        <NavLink to="/agent/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user.name || 'Agent'}</p>
            <p className="text-[10px] text-slate-500">Delivery Partner</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-zinc-900/10">
            {user.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </NavLink>
      </nav>

      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-zinc-50 pt-20 pb-6 px-4 hidden lg:flex flex-col">
        <div className="flex flex-col gap-1 mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 px-4">Command Center</h3>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink to="/agent" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">local_shipping</span> Order Tracking
          </NavLink>
          <NavLink to="/agent/performance" className="flex items-center gap-3 px-4 py-3 bg-white text-green-600 rounded-xl shadow-sm text-sm font-medium">
            <span className="material-symbols-outlined">monitoring</span> Performance
          </NavLink>
          <NavLink to="/agent/history" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">history</span> Transit History
          </NavLink>
          <NavLink to="/agent/profile" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">person</span> My Profile
          </NavLink>
        </nav>
      </aside>

      <main className="lg:ml-64 pt-20 pb-8 px-6 min-h-screen">
        {loadingStats ? (
          <div className="bg-white rounded-xl border border-zinc-200/60 p-6 text-sm text-slate-500">Loading performance insights...</div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-zinc-200/60 p-4"><p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Success Rate</p><p className="mt-2 text-2xl font-bold text-slate-900">{stats?.successRate || 0}%</p></div>
              <div className="bg-white rounded-xl border border-zinc-200/60 p-4"><p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Delivered Today</p><p className="mt-2 text-2xl font-bold text-slate-900">{stats?.deliveredToday || 0}</p></div>
              <div className="bg-white rounded-xl border border-zinc-200/60 p-4"><p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Average Delivery Time</p><p className="mt-2 text-2xl font-bold text-slate-900">{formatDuration(stats?.avgDeliveryMinutes)}</p></div>
              <div className="bg-white rounded-xl border border-zinc-200/60 p-4"><p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Average Delivered Value</p><p className="mt-2 text-xl font-bold text-slate-900">{formatMoney(stats?.avgDeliveredValue)}</p></div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <section className="xl:col-span-5 bg-white rounded-xl border border-zinc-200/60 p-5">
                <h2 className="text-lg font-['Manrope'] font-extrabold text-slate-900 mb-4">Operational Breakdown</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-500">Total Orders Handled</span><span className="font-bold text-slate-900">{stats?.total || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">In Transit</span><span className="font-bold text-slate-900">{stats?.inTransit || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Ready For Pickup</span><span className="font-bold text-slate-900">{stats?.readyForPickup || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Cancelled</span><span className="font-bold text-slate-900">{stats?.cancelled || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Multi-shop Orders</span><span className="font-bold text-slate-900">{stats?.multiShopOrders || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Gross Handled Value</span><span className="font-bold text-slate-900">{formatMoney(stats?.grossValue)}</span></div>
                </div>
              </section>

              <section className="xl:col-span-7 bg-white rounded-xl border border-zinc-200/60 p-5">
                <h2 className="text-lg font-['Manrope'] font-extrabold text-slate-900 mb-4">7-Day Delivery Trend</h2>
                <div className="space-y-3">
                  {(stats?.trendLast7Days || []).map((day) => {
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
              </section>
            </div>
          </>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur h-14 flex justify-around items-center border-t border-slate-200 z-40">
        <NavLink to="/agent" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>Orders</NavLink>
        <NavLink to="/agent/performance" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>Stats</NavLink>
        <NavLink to="/agent/history" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>History</NavLink>
      </nav>
    </div>
  );
}
