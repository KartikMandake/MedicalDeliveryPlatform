import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAgentPerformance, setAgentOnlineStatus } from '../api/agent';
import { AgentShell } from './AgentDashboardPage';

function formatMoney(v) { return `₹${Number(v || 0).toFixed(2)}`; }
function formatDuration(m) { const mins = Math.round(Number(m)); if (!Number.isFinite(mins) || mins < 0) return '--'; if (mins < 60) return `${mins}m`; return `${Math.floor(mins / 60)}h ${mins % 60}m`; }

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
      .then((res) => { setStats(res.data || {}); setOnline(Boolean(res.data?.liveLocation?.isOnline)); })
      .catch((err) => showToast(err.response?.data?.message || 'Unable to load metrics.', 'error'))
      .finally(() => setLoadingStats(false));
  }, [showToast, user]);

  const trendMax = useMemo(() => Math.max(1, ...(stats?.trendLast7Days || []).map((d) => Number(d.count || 0))), [stats]);

  const handleOnlineToggle = async () => {
    const next = !online;
    try { await setAgentOnlineStatus(next); setOnline(next); showToast(next ? 'Online.' : 'Offline.', 'success'); }
    catch (err) { showToast(err.response?.data?.message || 'Failed.', 'error'); }
  };

  if (loading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  return (
    <AgentShell user={user} online={online} onToggleOnline={handleOnlineToggle}>
      <main className="lg:ml-64 pt-20 pb-24 px-6 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold font-headline text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">monitoring</span> Performance Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1">Your delivery efficiency and operational metrics at a glance.</p>
        </div>

        {loadingStats ? (
          <div className="flex items-center justify-center h-64"><span className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Hero KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Success Rate', value: `${stats?.successRate || 0}%`, icon: 'check_circle', iconColor: 'text-emerald-500 bg-emerald-50', big: true },
                { label: 'Delivered Today', value: stats?.deliveredToday || 0, icon: 'today', iconColor: 'text-sky-500 bg-sky-50' },
                { label: 'Avg Delivery', value: formatDuration(stats?.avgDeliveryMinutes), icon: 'timer', iconColor: 'text-amber-500 bg-amber-50' },
                { label: 'Avg Value', value: formatMoney(stats?.avgDeliveredValue), icon: 'payments', iconColor: 'text-indigo-500 bg-indigo-50' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`material-symbols-outlined ${kpi.iconColor} p-2 rounded-xl text-[18px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
                  </div>
                  <p className={`font-black font-headline text-slate-900 ${kpi.big ? 'text-3xl' : 'text-2xl'}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Operational Breakdown */}
              <section className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-lg font-extrabold font-headline text-slate-900 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">analytics</span> Breakdown
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'Total Handled', value: stats?.total || 0, icon: 'package_2', color: 'text-slate-500' },
                    { label: 'Completed', value: stats?.delivered || 0, icon: 'task_alt', color: 'text-emerald-600' },
                    { label: 'In Transit', value: stats?.inTransit || 0, icon: 'local_shipping', color: 'text-sky-500' },
                    { label: 'Ready For Pickup', value: stats?.readyForPickup || 0, icon: 'inventory_2', color: 'text-amber-500' },
                    { label: 'Cancelled', value: stats?.cancelled || 0, icon: 'cancel', color: 'text-rose-500' },
                    { label: 'Multi-shop Orders', value: stats?.multiShopOrders || 0, icon: 'store', color: 'text-violet-500' },
                    { label: 'Gross Value', value: formatMoney(stats?.grossValue), icon: 'account_balance_wallet', color: 'text-indigo-500' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between bg-[#f8f9fa] p-3.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className={`material-symbols-outlined text-[16px] ${row.color}`}>{row.icon}</span> {row.label}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">{row.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 7-Day Trend */}
              <section className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-lg font-extrabold font-headline text-slate-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">trending_up</span> 7-Day Delivery Trend
                </h2>
                <div className="space-y-4">
                  {(stats?.trendLast7Days || []).map((day) => {
                    const pct = Math.max(8, Math.round((Number(day.count || 0) / trendMax) * 100));
                    return (
                      <div key={`${day.date}-${day.label}`} className="flex items-center gap-4">
                        <span className="w-10 text-xs text-slate-500 font-extrabold text-right">{day.label}</span>
                        <div className="flex-1 h-8 rounded-xl bg-slate-50 overflow-hidden relative flex items-center">
                          <div className="h-full rounded-xl bg-emerald-500 transition-all duration-700 ease-out flex items-center justify-end pr-3" style={{ width: `${pct}%` }}>
                            {pct > 30 && <span className="text-[11px] font-black text-white">{day.count}</span>}
                          </div>
                          {pct <= 30 && <span className="text-[11px] font-black text-slate-500 ml-2">{day.count}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Row */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Weekly Total</p>
                    <p className="text-2xl font-black font-headline text-slate-900">
                      {(stats?.trendLast7Days || []).reduce((sum, d) => sum + Number(d.count || 0), 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Avg</p>
                    <p className="text-2xl font-black font-headline text-slate-900">
                      {((stats?.trendLast7Days || []).reduce((sum, d) => sum + Number(d.count || 0), 0) / 7).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Best Day</p>
                    <p className="text-2xl font-black font-headline text-slate-900">
                      {Math.max(0, ...(stats?.trendLast7Days || []).map((d) => Number(d.count || 0)))}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </AgentShell>
  );
}
