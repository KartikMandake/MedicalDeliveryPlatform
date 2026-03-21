import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/admin/analytics').then((res) => setData(res.data.monthly || [])).catch(() => {});
  }, []);

  const maxOrders = Math.max(...data.map((d) => d.orders || 0), 1);
  const maxRevenue = Math.max(...data.map((d) => d.revenue || 0), 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      <div className="lg:col-span-8 bg-white p-8 rounded-xl border-none shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#191c1e] font-headline">Performance Analytics</h3>
            <p className="text-sm text-slate-500">Orders vs. Revenue Growth (Monthly)</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-3 h-3 rounded-full bg-[#0d631b]"></span> Orders
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-3 h-3 rounded-full bg-[#44ddc1]"></span> Revenue
            </span>
          </div>
        </div>
        <div className="relative h-64 w-full flex items-end gap-2 overflow-hidden pt-4">
          {data.length === 0 ? (
            <p className="text-slate-400 text-sm m-auto">No data available</p>
          ) : (
            data.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex flex-col items-center gap-0.5 justify-end" style={{ height: '90%' }}>
                  <div
                    className="w-full bg-[#44ddc1]/60 rounded-t transition-all"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    title={`Revenue: ₹${d.revenue}`}
                  />
                  <div
                    className="w-full bg-[#0d631b]/70 rounded-t transition-all"
                    style={{ height: `${(d.orders / maxOrders) * 100}%` }}
                    title={`Orders: ${d.orders}`}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{months[d.month - 1] || d.month}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="lg:col-span-4 bg-[#0d631b] text-white p-8 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <span className="text-[#a3f69c] font-bold text-xs tracking-widest uppercase mb-4 block">New Feature</span>
          <h3 className="text-2xl font-bold font-headline leading-tight">Precision Route Optimization v2.0</h3>
          <p className="mt-4 text-[#a3f69c]/80 text-sm leading-relaxed">AI-driven logistics are reducing delivery times by an average of 14 minutes per urgent order.</p>
        </div>
        <div className="mt-8 z-10">
          <button className="bg-[#2e7d32] text-white px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95">Update Logistics Model</button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2e7d32]/30 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#006153]/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
      </div>
    </section>
  );
}
