import { useState, useEffect } from 'react';
import { getKPIs } from '../../api/admin';

const kpiConfig = [
  { key: 'totalOrders', label: 'Total Orders', icon: 'receipt_long', color: 'bg-blue-50 text-blue-600' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: 'payments', color: 'bg-emerald-50 text-[#0d631b]', prefix: '₹' },
  { key: 'totalUsers', label: 'Total Users', icon: 'group', color: 'bg-purple-50 text-purple-600' },
  { key: 'activeAgents', label: 'Active Agents', icon: 'delivery_dining', color: 'bg-orange-50 text-orange-600' },
];

export default function KPICards() {
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKPIs().then((res) => setKpis(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpiConfig.map(({ key, label, icon, color, prefix }) => (
        <div key={key} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">{label}</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-['Manrope'] font-extrabold text-slate-900">
              {prefix}{typeof kpis[key] === 'number' ? kpis[key].toLocaleString() : '—'}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
