import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/retailer';

export default function RetailerKPI() {
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setKpis(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const Skeleton = () => <div className="h-7 w-20 bg-zinc-100 rounded animate-pulse" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {/* Total Orders */}
      <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-[#22c55e]/10 rounded-lg">
            <span className="material-symbols-outlined text-[#006e2f] text-[19px]">shopping_bag</span>
          </div>
          {!loading && kpis.ordersToday > 0 && (
            <span className="text-[10px] font-bold text-[#006e2f] px-2 py-1 bg-[#006e2f]/5 rounded">+{kpis.ordersToday} today</span>
          )}
        </div>
        <p className="text-xs text-zinc-500 font-medium">Total Orders</p>
        {loading ? <Skeleton /> : (
          <h3 className="text-[28px] font-bold font-headline mt-1 leading-none">{(kpis.totalOrders || 0).toLocaleString()}</h3>
        )}
      </div>

      {/* Revenue */}
      <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-[#afefb4]/20 rounded-lg">
            <span className="material-symbols-outlined text-[#2f6a3c] text-[19px]">payments</span>
          </div>
          {!loading && kpis.revenueToday > 0 && (
            <span className="text-[10px] font-bold text-[#2f6a3c] px-2 py-1 bg-[#2f6a3c]/5 rounded">₹{kpis.revenueToday?.toLocaleString()} today</span>
          )}
        </div>
        <p className="text-xs text-zinc-500 font-medium">Revenue</p>
        {loading ? <Skeleton /> : (
          <h3 className="text-[28px] font-bold font-headline mt-1 leading-none">₹{(kpis.totalRevenue || 0).toLocaleString()}</h3>
        )}
      </div>

      {/* Low Stock Items */}
      <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-[#ff8b7c]/20 rounded-lg">
            <span className="material-symbols-outlined text-[#9e4036] text-[19px]">warning</span>
          </div>
          {!loading && kpis.lowStockCount > 0 && (
            <span className="text-[10px] font-bold text-[#9e4036] px-2 py-1 bg-[#9e4036]/5 rounded">Critical</span>
          )}
        </div>
        <p className="text-xs text-zinc-500 font-medium">Low Stock Items</p>
        {loading ? <Skeleton /> : (
          <h3 className="text-[28px] font-bold font-headline mt-1 leading-none">{kpis.lowStockCount || 0}</h3>
        )}
      </div>

      {/* AI Insight Card */}
      <div className="p-5 rounded-xl shadow-lg shadow-[#006e2f]/5 border border-[#006e2f]/10" style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(74, 225, 118, 0.05) 100%)', borderTop: '2px solid rgba(0, 110, 47, 0.2)' }}>
        <div className="flex items-center gap-2 mb-4 text-[#006e2f]">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="text-[10px] font-bold uppercase" style={{ letterSpacing: '0.05em' }}>AI Prediction</span>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-zinc-100 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-xs text-[#191c1d] font-semibold leading-relaxed">
              {kpis.pendingOrders > 0
                ? `${kpis.pendingOrders} pending orders need attention. Inventory has ${kpis.inventoryItems} items.`
                : `System running smoothly. ${kpis.inventoryItems || 0} items in stock.`}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#006e2f]" style={{ width: `${Math.min(100, ((kpis.inventoryItems || 0) / Math.max(1, (kpis.inventoryItems || 0) + (kpis.lowStockCount || 0))) * 100)}%` }} />
              </div>
              <span className="text-[10px] font-bold text-[#006e2f]">{kpis.lowStockCount > 3 ? 'High' : 'Low'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
