import { useState, useEffect } from 'react';
import { getAnalytics } from '../../api/admin';

export default function EfficiencyAnalysis() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalytics().then((res) => setAnalytics(res.data)).catch(console.error);
  }, []);

  const delivered = analytics?.statusBreakdown?.find((s) => s.status === 'delivered')?.count || 0;
  const total = analytics?.statusBreakdown?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const fulfillmentRate = total ? ((delivered / total) * 100).toFixed(1) : '0.0';

  return (
    <section className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-12 lg:col-span-8 bg-[#f2f4f7] p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 mb-2">Efficiency Analysis</h2>
          <p className="text-slate-500 text-sm max-w-md mb-8">Live order fulfillment metrics from your store.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">{total || '—'}</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Fulfillment Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">{fulfillmentRate}%</span>
                <span className="text-emerald-600 text-xs font-bold">{delivered} delivered</span>
              </div>
            </div>
          </div>
          {/* Daily chart */}
          {analytics?.dailyOrders?.length > 0 && (
            <div className="mt-6 bg-white p-5 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase mb-3 block">Last 7 Days</span>
              <div className="flex items-end gap-2 h-16">
                {analytics.dailyOrders.map((d) => {
                  const max = Math.max(...analytics.dailyOrders.map((x) => Number(x.count)));
                  const h = max ? (Number(d.count) / max) * 100 : 0;
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#0d631b] rounded-t" style={{ height: `${h}%`, minHeight: '4px' }} title={`${d.count} orders`} />
                      <span className="text-[9px] text-slate-400">{d.date?.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#0d631b]/5 rounded-full blur-3xl" />
      </div>
      <div className="col-span-12 lg:col-span-4 bg-[#2e7d32] text-[#cbffc2] p-8 rounded-2xl h-full flex flex-col justify-between">
        <div>
          <h3 className="font-['Manrope'] font-bold text-xl mb-4 text-white">Order Status</h3>
          <div className="space-y-3">
            {analytics?.statusBreakdown?.map((s) => (
              <div key={s.status} className="flex justify-between items-center text-sm">
                <span className="text-white/80 capitalize">{s.status?.replace(/_/g, ' ')}</span>
                <span className="font-bold text-white">{s.count}</span>
              </div>
            )) || <p className="text-white/60 text-sm">Loading...</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
