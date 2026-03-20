import { useState, useEffect } from 'react';
import { getAllOrders } from '../../api/admin';
import { updateOrderStatus } from '../../api/orders';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-emerald-100 text-[#0d631b]',
  ready_for_pickup: 'bg-[#91f78e]/30 text-[#006e1c]',
  in_transit: 'bg-[#68fadd]/30 text-[#006153]',
  delivered: 'bg-[#a3f69c]/30 text-[#0d631b]',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = (p = 1) => {
    setLoading(true);
    getAllOrders({ page: p, limit: 10 })
      .then((r) => { setOrders(r.data.orders); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    fetchOrders(page);
  };

  return (
    <section className="bg-[#f2f4f7] p-1 rounded-xl">
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-[#f2f4f7]">
          <h3 className="text-lg font-bold text-[#191c1e]">Recent Orders</h3>
          <span className="text-sm text-slate-400">{total} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f7]/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef1]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : orders.map((order) => (
                <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-bold text-sm">#{order.orderId}</td>
                  <td className="px-6 py-5 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-sm text-slate-700">{order.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-5 font-bold text-sm">₹{order.total?.toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <select value={order.status} onChange={(e) => handleStatus(order.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0d631b]">
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
        <div className="px-8 py-6 border-t border-[#f2f4f7] flex justify-between items-center text-sm text-slate-500">
          <p>Showing {orders.length} of {total} orders</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-[#f2f4f7] rounded disabled:opacity-40">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 hover:bg-[#f2f4f7] rounded disabled:opacity-40">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
