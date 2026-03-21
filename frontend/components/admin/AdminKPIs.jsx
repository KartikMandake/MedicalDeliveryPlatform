import { useState, useEffect } from 'react';
import { getKPIs } from '../../api/admin';

export default function AdminKPIs() {
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKPIs().then((r) => setKpis(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Orders', value: kpis.totalOrders, icon: 'local_shipping', badge: 'Live' },
    { label: 'Total Revenue', value: kpis.totalRevenue ? `₹${Number(kpis.totalRevenue).toLocaleString()}` : '₹0', icon: 'account_balance_wallet', badge: '+live' },
    { label: 'Active Agents', value: kpis.activeAgents, icon: 'delivery_dining', badge: 'Online' },
    { label: 'Total Users', value: kpis.totalUsers, icon: 'group', badge: 'Global' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {cards.map(({ label, value, icon, badge }) => (
        <div key={label} className="bg-white p-6 rounded-xl shadow-sm transition-transform hover:-translate-y-1 duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#2e7d32]/10 rounded-lg">
              <span className="material-symbols-outlined text-[#0d631b]">{icon}</span>
            </div>
            <span className="text-xs font-bold text-[#2e7d32] bg-[#a3f69c]/20 px-2 py-1 rounded-full">{badge}</span>
          </div>
          <p className="text-slate-500 text-sm mb-1">{label}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
          ) : (
            <h3 className="text-2xl font-extrabold text-[#191c1e]">{value ?? '—'}</h3>
          )}
        </div>
      ))}
    </section>
  );
}
