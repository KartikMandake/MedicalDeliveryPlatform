import { Fragment, useState, useEffect } from 'react';
import { getRetailerOrders, getAvailableDeliveryAgents, updateRetailerOrderStatus } from '../../api/retailer';

const STATUS_STYLES = {
  placed: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-emerald-100 text-[#0d631b]',
  ready_for_pickup: 'bg-[#91f78e]/30 text-[#006e1c]',
  in_transit: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-100 text-red-600',
};

const RETAILER_STATUSES = ['confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'cancelled'];

function resolveItemImage(item) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadBase = apiBase.replace(/\/api\/?$/, '');

  const rawPrimary = item?.image ? String(item.image).trim() : '';
  const rawLegacy = Array.isArray(item?.images)
    ? item.images.join(',')
    : (item?.images ? String(item.images).trim() : '');
  const raw = rawPrimary || rawLegacy;
  if (!raw) return '';

  // Preserve complete URLs (Cloudinary transforms may include commas in path segments).
  if (/^(https?:\/\/|data:|blob:)/i.test(raw)) return raw;

  const candidates = raw
    .split(',')
    .map((s) => s.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);

  const first = candidates[0] || '';
  if (!first) return '';
  if (/^(https?:\/\/|data:|blob:)/i.test(first)) return first;
  return `${uploadBase}${first.startsWith('/') ? '' : '/'}${first}`;
}

export default function RetailerOrdersTable({ compact = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [agentsByOrder, setAgentsByOrder] = useState({});
  const [loadingAgentsByOrder, setLoadingAgentsByOrder] = useState({});
  const [selectedAgentByOrder, setSelectedAgentByOrder] = useState({});

  const limit = compact ? 5 : 10;

  const fetchOrders = (p = 1) => {
    setLoading(true);
    const params = { page: p, limit };
    if (statusFilter) params.status = statusFilter;
    getRetailerOrders(params)
      .then((res) => { setOrders(res.data.orders || []); setPages(res.data.pages || 1); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page); }, [page, statusFilter]);

  const fetchAgentsForOrder = async (orderId) => {
    if (!orderId || loadingAgentsByOrder[orderId]) return;
    setLoadingAgentsByOrder((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await getAvailableDeliveryAgents({ orderId });
      const ranked = Array.isArray(res.data) ? res.data : [];
      setAgentsByOrder((prev) => ({ ...prev, [orderId]: ranked }));
      setSelectedAgentByOrder((prev) => {
        if (prev[orderId]) return prev;
        if (!ranked.length) return prev;
        return { ...prev, [orderId]: ranked[0].id };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAgentsByOrder((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    orders
      .filter((order) => !['delivered', 'cancelled'].includes(order.status))
      .forEach((order) => {
        if (!agentsByOrder[order.id]) fetchAgentsForOrder(order.id);
      });
  }, [orders]);

  const handleStatusChange = async (id, status) => {
    try {
      const selectedAgentId = selectedAgentByOrder[id];
      if (status === 'in_transit' && !selectedAgentId) {
        window.alert('Please select a delivery agent before requesting out for delivery.');
        return;
      }

      await updateRetailerOrderStatus(id, status, status === 'in_transit' ? selectedAgentId : undefined);
      fetchOrders(page);
      if (status === 'in_transit') {
        window.alert('Delivery request sent to the selected agent. Status will move to in transit after agent acceptance.');
      }
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to update status');
      console.error('Failed to update status:', err);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-zinc-100/70">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-['Manrope'] font-bold text-lg text-slate-900 tracking-tight">
          {compact ? 'Recent Orders' : 'Order Management'}
        </h2>
        {!compact && (
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-[11px] border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
          >
            <option value="">All Statuses</option>
            {['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'delivered', 'cancelled'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em] bg-slate-50/60">
              <th className="px-4 py-3.5">Order</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Total</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-3.5 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                  No orders found
                </td>
              </tr>
            ) : orders.map((order) => (
              <Fragment key={order.id}>
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => {
                  const nextExpanded = expandedOrder === order.id ? null : order.id;
                  setExpandedOrder(nextExpanded);
                  if (nextExpanded === order.id) fetchAgentsForOrder(order.id);
                }}>
                  <td className="px-4 py-4 text-xs font-mono text-slate-600">#{order.order_number}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[#0d631b] text-[10px] font-bold">
                        {order.customer_name?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">{order.customer_name || 'Unknown'}</span>
                        {order.customer_phone && <span className="text-[11px] text-slate-400">{order.customer_phone}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-900">₹{Number(order.total_amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[11px] text-slate-400">
                    {order.placed_at ? new Date(order.placed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    {['delivered', 'cancelled'].includes(order.status) ? (
                      <span className="text-[11px] text-slate-400 italic">Completed</span>
                    ) : (
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        {order.status !== 'in_transit' && (
                          <button
                            type="button"
                            onClick={() => fetchAgentsForOrder(order.id)}
                            disabled={loadingAgentsByOrder[order.id]}
                            className="text-[10px] text-left font-bold text-emerald-700 hover:underline disabled:opacity-60"
                          >
                            {loadingAgentsByOrder[order.id] ? 'Finding nearest agents...' : 'Find nearest available agent'}
                          </button>
                        )}

                        <select
                          value={selectedAgentByOrder[order.id] || ''}
                          onChange={(e) => setSelectedAgentByOrder((prev) => ({ ...prev, [order.id]: e.target.value }))}
                          className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0d631b] bg-white"
                        >
                          <option value="">Select nearest agent (for out-for-delivery)</option>
                          {(agentsByOrder[order.id] || []).map((agent, idx) => (
                            <option key={agent.id} value={agent.id}>
                              {(agent.name || 'Agent')}
                              {idx === 0 ? ' (nearest)' : ''}
                              {Number.isFinite(agent.distanceToPharmacyKm) ? ` • ${agent.distanceToPharmacyKm}km from pharmacy` : ''}
                              {Number.isFinite(agent.distanceToCustomerKm) ? ` • ${agent.distanceToCustomerKm}km from customer` : ''}
                            </option>
                          ))}
                        </select>

                        {selectedAgentByOrder[order.id] && (agentsByOrder[order.id] || []).length > 0 && (
                          <p className="text-[10px] text-slate-500">
                            Recommended: {(agentsByOrder[order.id] || [])[0]?.name || 'Nearest available agent'}
                          </p>
                        )}

                        <select
                          value=""
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0d631b] bg-white"
                        >
                          <option value="" disabled>Update…</option>
                          {RETAILER_STATUSES.filter(s => s !== order.status).map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
                {/* Expanded order items */}
                {expandedOrder === order.id && order.items?.length > 0 && (
                  <tr key={`${order.id}-items`}>
                    <td colSpan={6} className="px-4 py-4 bg-slate-50/50">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] mb-2.5">Order Items</p>
                        {order.items.map((item, idx) => {
                          const imageUrl = resolveItemImage(item);
                          return (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-3">
                              {imageUrl ? (
                                <img src={imageUrl} alt={item.medicine_name || 'Medicine'} className="w-9 h-9 rounded-lg object-cover bg-white" />
                              ) : null}
                              <div>
                                <p className="text-xs font-semibold text-slate-800">{item.medicine_name}</p>
                                <p className="text-[11px] text-slate-400">Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">₹{Number(item.total_price).toFixed(2)}</span>
                          </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && pages > 1 && (
        <div className="p-4 bg-slate-50/30 flex justify-center">
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
