import { useState, useEffect } from 'react';
import { getPayments } from '../../api/payments';

export default function PaymentsStats() {
  const [stats, setStats] = useState({ total: 0, pending: 0, commission: 0 });

  useEffect(() => {
    getPayments().then((r) => {
      const payments = r.data;
      const total = payments.reduce((s, p) => s + (p.total || 0), 0);
      const commission = total * 0.05;
      setStats({ total, pending: 0, commission });
    }).catch(console.error);
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0d631b]/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
        <div className="flex flex-col gap-1 relative">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Disbursed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{stats.total.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-400 mt-4">Lifetime paid orders</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006153]/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
        <div className="flex flex-col gap-1 relative">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Payments</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{stats.pending.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-400 mt-4">Awaiting verification</p>
        </div>
      </div>
      <div className="bg-[#0d631b] bg-gradient-to-br from-[#0d631b] to-[#2e7d32] p-8 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
          <span className="material-symbols-outlined text-9xl">account_balance</span>
        </div>
        <div className="flex flex-col gap-1 relative">
          <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">Platform Commission (5%)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">₹{stats.commission.toFixed(0)}</span>
          </div>
          <p className="text-xs text-white/60 mt-4">From all paid orders</p>
        </div>
      </div>
    </section>
  );
}
