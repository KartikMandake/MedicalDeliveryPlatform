import { useDeferredValue, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDemandForecast } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RetailerSidebar from '../components/retailer/RetailerSidebar';
import RetailerTopNav from '../components/retailer/RetailerTopNav';
import RetailerFooter from '../components/retailer/RetailerFooter';
import SaltComposition from '../components/ui/SaltComposition';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const priorityStyles = {
  Launch: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Restock: 'bg-amber-50 text-amber-700 border-amber-200',
  Monitor: 'bg-sky-50 text-sky-700 border-sky-200',
  Reduce: 'bg-rose-50 text-rose-700 border-rose-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const formatCount = (value) => numberFormatter.format(Number(value) || 0);
const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatPercent = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '--';
  return `${numeric > 0 ? '+' : ''}${numeric.toFixed(1)}%`;
};
const formatCoverage = (value) => {
  if (!Number.isFinite(Number(value))) return 'Not stocked';
  return `${Number(value).toFixed(1)} days`;
};

const getSearchableSaltText = (saltName) => {
  if (!saltName) return '';
  if (typeof saltName !== 'string') return String(saltName);
  if (!saltName.includes('<')) return saltName;

  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(saltName, 'text/html');
      return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    } catch {
      return saltName.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  return saltName.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

function KpiCard({ icon, label, value, detail }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function RetailerForecastingPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!user || user.role !== 'retailer') return;

    const loadForecast = async () => {
      try {
        const res = await getDemandForecast();
        setForecast(res.data || null);
      } catch (err) {
        showToast(err.response?.data?.message || 'Unable to load demand forecast.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [user, showToast]);

  if (authLoading) return null;
  if (!user || user.role !== 'retailer') return <Navigate to="/login" replace />;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getDemandForecast();
      setForecast(res.data || null);
      showToast('Demand forecast refreshed.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to refresh forecast.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const medicineForecasts = forecast?.medicineForecasts || [];
  const query = deferredSearch.trim().toLowerCase();
  const filteredForecasts = medicineForecasts.filter((item) => {
    const searchableSaltName = getSearchableSaltText(item.saltName).toLowerCase();
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.categoryName.toLowerCase().includes(query) ||
      item.manufacturer.toLowerCase().includes(query) ||
      searchableSaltName.includes(query);

    if (!matchesQuery) return false;
    if (filter === 'all') return true;
    if (filter === 'launch') return item.priority === 'Launch';
    if (filter === 'restock') return item.priority === 'Restock';
    if (filter === 'slow') return item.priority === 'Reduce';
    if (filter === 'stocked') return item.inInventory;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f8f7] font-body text-slate-900 antialiased">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 px-5 pt-24 pb-28 md:px-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden px-6 py-6 md:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_30%)]" />
              <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Retail Forecasting</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-[2.7rem]">
                    Business demand forecasting across the full medicines catalog
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    This forecast blends nearby delivered-order demand, platform-wide medicine velocity, your store performance,
                    and live location weather pressure to show what to launch, restock, and deprioritize next.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Store</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{forecast?.meta?.shopName || 'Retailer Store'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Radius</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{forecast?.meta?.radiusKm ? `${forecast.meta.radiusKm} km` : 'Fallback'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#006e2f] disabled:opacity-70"
                  >
                    <span className="material-symbols-outlined text-[18px]">{refreshing ? 'progress_activity' : 'autorenew'}</span>
                    {refreshing ? 'Refreshing' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {loading && !forecast ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <span className="material-symbols-outlined animate-pulse text-3xl">query_stats</span>
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-950">Building the local demand model</h2>
              <p className="mt-2 text-sm text-slate-500">Pulling market, weather, and medicine demand signals for this store.</p>
            </div>
          ) : (
            <>
              {(forecast?.warnings || []).length > 0 && (
                <section className="rounded-[1.6rem] border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600">warning</span>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-amber-900">Forecast signal notes</p>
                      {(forecast.warnings || []).map((warning) => (
                        <p key={warning} className="text-sm text-amber-800">{warning}</p>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard icon="query_stats" label="Projected Demand" value={formatCount(forecast?.kpis?.totalProjectedDemand30d)} detail="Projected 30-day pull across all active medicines." />
                <KpiCard icon="payments" label="Revenue Opportunity" value={formatCurrency(forecast?.kpis?.totalProjectedRevenue30d)} detail="Estimated next-30-day medicine revenue in this catchment." />
                <KpiCard icon="storefront" label="Launch Gaps" value={formatCount(forecast?.kpis?.unstockedOpportunityCount)} detail="Strong-demand medicines not in current inventory." />
                <KpiCard icon="inventory_2" label="Restock Risks" value={formatCount(forecast?.kpis?.restockRiskCount)} detail={`${forecast?.kpis?.marketCoveragePct || 0}% of projected demand is currently covered.`} />
              </section>

              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Demand curve</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Actual vs projected weekly demand</h2>
                  <div className="mt-5 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast?.weeklyDemand || []} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="actualAreaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="projectedAreaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="actualDemand" name="Actual demand" stroke="#16a34a" fill="url(#actualAreaFill)" strokeWidth={2.5} connectNulls />
                        <Area type="monotone" dataKey="projectedDemand" name="Projected demand" stroke="#0ea5e9" fill="url(#projectedAreaFill)" strokeWidth={2.5} connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category outlook</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Demand concentration by category</h2>
                  <div className="mt-5 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(forecast?.categoryForecasts || []).slice(0, 6)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                        <XAxis dataKey="categoryName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={52} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="last30Days" name="Last 30 days" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="projected30Days" name="Projected 30 days" fill="#006e2f" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Market signals</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">What the model is reading</h2>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {(forecast?.marketSignals || []).map((signal) => (
                      <div key={signal.label} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#006e2f] shadow-sm">
                            <span className="material-symbols-outlined">{signal.icon}</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{signal.label}</p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{signal.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Strategy notes</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Actionable business insights</h2>
                  <div className="mt-5 space-y-3">
                    {(forecast?.insights || []).map((insight) => (
                      <div key={insight.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#006e2f] shadow-sm">
                            <span className="material-symbols-outlined">{insight.icon}</span>
                          </div>
                          <p className="text-sm font-black text-slate-950">{insight.title}</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{insight.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[1.85rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Medicine planner</p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Forecasted demand across all active medicines</h2>
                    <p className="mt-2 text-sm text-slate-500">Search the catalog and isolate launch gaps, restock risks, or slow movers.</p>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search medicine, category, manufacturer"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#006e2f] focus:bg-white md:w-[320px]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'launch', label: 'Launch gaps' },
                        { key: 'restock', label: 'Restock' },
                        { key: 'slow', label: 'Slow movers' },
                        { key: 'stocked', label: 'Stocked' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setFilter(item.key)}
                          className={`rounded-full border px-3 py-2 text-xs font-bold transition-colors ${
                            filter === item.key
                              ? 'border-[#006e2f] bg-[#006e2f] text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-[#006e2f]/30 hover:text-[#006e2f]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <div className="max-h-[720px] overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="sticky top-0 bg-slate-950 text-left text-xs uppercase tracking-[0.14em] text-slate-300">
                        <tr>
                          <th className="px-4 py-3.5 font-black">Medicine</th>
                          <th className="px-4 py-3.5 font-black">Category</th>
                          <th className="px-4 py-3.5 font-black">Local 30d</th>
                          <th className="px-4 py-3.5 font-black">Projected 30d</th>
                          <th className="px-4 py-3.5 font-black">Trend</th>
                          <th className="px-4 py-3.5 font-black">Coverage</th>
                          <th className="px-4 py-3.5 font-black">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredForecasts.map((item) => (
                          <tr key={item.id} className="align-top hover:bg-slate-50/80">
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-black text-slate-950">{item.name}</p>
                                  {!item.inInventory && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Not stocked</span>}
                                  {item.requiresRx && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">Rx</span>}
                                </div>
                                <p className="text-xs text-slate-500">{item.manufacturer || 'Manufacturer unavailable'}</p>
                                {item.saltName && (
                                  <SaltComposition
                                    saltName={item.saltName}
                                    format="text"
                                    className="text-xs text-slate-400"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-slate-900">{item.categoryName}</p>
                              <p className="mt-1 text-xs text-slate-500">Demand index {item.marketDemandIndex}</p>
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-700">{formatCount(item.local30Days)}</td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-black text-slate-950">{formatCount(item.projected30Days)}</p>
                              <p className="mt-1 text-xs text-slate-500">{formatCurrency(item.projectedRevenue)}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className={`text-sm font-bold ${item.trendPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatPercent(item.trendPct)}</p>
                              <p className="mt-1 text-xs text-slate-500">Confidence {item.confidence}%</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-slate-900">{formatCoverage(item.coverageDays)}</p>
                              <p className="mt-1 text-xs text-slate-500">Stock {item.availableStock} / Reorder {item.reorderLevel}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${priorityStyles[item.priority] || priorityStyles.Low}`}>{item.priority}</span>
                              {item.weatherReasons?.length > 0 && <p className="mt-2 text-xs text-slate-500">{item.weatherReasons.join(', ')}</p>}
                            </td>
                          </tr>
                        ))}
                        {filteredForecasts.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500">No medicines match this filter yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <RetailerFooter />
    </div>
  );
}
