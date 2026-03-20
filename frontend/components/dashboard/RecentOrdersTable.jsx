import { useState, useEffect } from 'react';
import { getAllOrders } from '../../api/admin';
import { updateOrderStatus } from '../../api/orders';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-emerald-100 text-[#0d631b]',
  ready_for_pickup: 'bg-[#91f78e]/30 text-[#006e1c]',
  in_transit: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-100 text-red-600',
};

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchOrders = (p = 1) => {
    setLoading(true);
    getAllOrders({ page: p, limit: 10 })
      .then((res) => { setOrders(res.data.orders); setPages(res.data.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    fetchOrders(page);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h2 className="font-['Manrope'] font-bold text-xl text-slate-900">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5 text-sm font-mono text-slate-600">#{order.orderId}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#0d631b] text-xs font-bold">
                      {order.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{order.user?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-900">₹{order.total?.toFixed(2)}</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-bold ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
                  >
                    {['pending','confirmed','preparing','ready_for_pickup','in_transit','delivered','cancelled'].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="p-6 bg-slate-50/30 flex justify-center">
          <nav className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-40">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${p === page ? 'bg-[#0d631b] text-white' : 'hover:bg-white border border-transparent text-slate-500'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-40">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </nav>
        </div>
      )}
    </section>
  );
}
