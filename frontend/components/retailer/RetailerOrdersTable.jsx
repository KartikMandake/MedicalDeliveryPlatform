import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  getAvailableDeliveryAgents,
  getRetailerOrders,
  updateRetailerOrderStatus,
} from '../../api/retailer';
import { useToast } from '../../context/ToastContext';

const STATUS_STYLES = {
  placed: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-emerald-100 text-emerald-700',
  ready_for_pickup: 'bg-violet-100 text-violet-700',
  in_transit: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-rose-100 text-rose-600',
};

function resolveItemImage(item) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadBase = apiBase.replace(/\/api\/?$/, '');

  const rawPrimary = item?.image ? String(item.image).trim() : '';
  const rawLegacy = Array.isArray(item?.images)
    ? item.images.join(',')
    : (item?.images ? String(item.images).trim() : '');
  const raw = rawPrimary || rawLegacy;
  if (!raw) return '';
  if (/^(https?:\/\/|data:|blob:)/i.test(raw)) return raw;

  const first = raw
    .split(',')
    .map((s) => s.trim().replace(/^"|"$/g, ''))
    .find(Boolean) || '';
  if (!first) return '';
  if (/^(https?:\/\/|data:|blob:)/i.test(first)) return first;
  return `${uploadBase}${first.startsWith('/') ? '' : '/'}${first}`;
}

function formatStatus(status) {
  return String(status || '').replace(/_/g, ' ');
}

function AgentPills({ agents = [], selectedAgentId, onSelect }) {
  if (!agents.length) {
    return <p className="text-[11px] text-zinc-500">No online agents available right now.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {agents.slice(0, 4).map((agent, idx) => {
        const selected = selectedAgentId === agent.id;
        const label = agent.name || 'Agent';
        const distance = Number.isFinite(agent.distanceToPharmacyKm)
          ? `${agent.distanceToPharmacyKm} km`
          : Number.isFinite(agent.distanceToCustomerKm)
            ? `${agent.distanceToCustomerKm} km`
            : 'distance unknown';

        return (
          <button
            key={agent.id}
            type="button"
            onClick={() => onSelect(agent.id)}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors ${selected ? 'bg-[#006e2f] text-white border-[#006e2f]' : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#006e2f]/40'}`}
            title={`${label} • ${distance}${idx === 0 ? ' • nearest' : ''}`}
          >
            {label}{idx === 0 ? ' • nearest' : ''}
          </button>
        );
      })}
    </div>
  );
}

function OrderItems({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const imageUrl = resolveItemImage(item);
        return (
          <div key={`${item.medicine_name}-${idx}`} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              {imageUrl ? (
                <img src={imageUrl} alt={item.medicine_name || 'Medicine'} className="w-9 h-9 rounded-lg object-cover bg-white" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-zinc-400 text-sm">medication</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-800 truncate">{item.medicine_name}</p>
                <p className="text-[11px] text-zinc-500">Qty {item.quantity} × ₹{Number(item.unit_price || 0).toFixed(2)}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-700">₹{Number(item.total_price || 0).toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function RetailerOrdersTable({ compact = false }) {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [actingOrderId, setActingOrderId] = useState('');
  const [agentsByOrder, setAgentsByOrder] = useState({});
  const [selectedAgentByOrder, setSelectedAgentByOrder] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getRetailerOrders({ page: 1, limit: compact ? 8 : 40 });
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to load retailer orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const incomingOrders = useMemo(
    () => orders.filter((order) => order.status === 'placed'),
    [orders]
  );

  const recentOrders = useMemo(
    () => orders.filter((order) => order.status !== 'placed'),
    [orders]
  );

  const fetchAgentsForOrder = async (orderId) => {
    if (!orderId || agentsByOrder[orderId]) return;
    try {
      const res = await getAvailableDeliveryAgents({ orderId });
      const list = Array.isArray(res.data) ? res.data : [];
      setAgentsByOrder((prev) => ({ ...prev, [orderId]: list }));
      if (list.length) {
        setSelectedAgentByOrder((prev) => ({
          ...prev,
          [orderId]: prev[orderId] || list[0].id,
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to fetch nearby delivery agents.', 'error');
    }
  };

  const runOrderAction = async (orderId, status, agentId) => {
    try {
      setActingOrderId(orderId);
      await updateRetailerOrderStatus(orderId, status, agentId);
      if (status === 'confirmed') {
        showToast('Order accepted and moved to preparing.', 'success');
      } else if (status === 'ready_for_pickup') {
        showToast('Pickup request sent to selected agent.', 'success');
      } else if (status === 'cancelled') {
        showToast('Order cancelled.', 'info');
      } else {
        showToast('Order updated.', 'success');
      }
      await fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order.', 'error');
    } finally {
      setActingOrderId('');
    }
  };

  const renderIncomingSection = () => (
    <section className="bg-white rounded-xl border border-zinc-100/70 shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold text-zinc-900">Incoming Orders</h2>
        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-[0.08em]">
          {incomingOrders.length} new
        </span>
      </div>

      <div className="p-4 space-y-3.5">
        {incomingOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
            <span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>
            No new incoming orders.
          </div>
        ) : (
          incomingOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-400 font-bold">Order #{order.order_number}</p>
                  <p className="text-sm font-semibold text-zinc-900 mt-1">{order.customer_name || 'Customer'}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">{order.items?.length || 0} items • ₹{Number(order.total_amount || 0).toFixed(2)}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Awaiting Acceptance</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => runOrderAction(order.id, 'confirmed')}
                  disabled={actingOrderId === order.id}
                  className="px-4 py-2 rounded-lg bg-[#006e2f] text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
                >
                  Accept and Start Preparing
                </button>
                <button
                  type="button"
                  onClick={() => runOrderAction(order.id, 'cancelled')}
                  disabled={actingOrderId === order.id}
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-bold hover:bg-zinc-50 disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                  className="ml-auto text-xs font-bold text-zinc-500 hover:text-zinc-700"
                >
                  {expandedOrderId === order.id ? 'Hide Items' : 'View Items'}
                </button>
              </div>

              {expandedOrderId === order.id && (
                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <OrderItems items={order.items || []} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );

  const renderRecentSection = () => (
    <section className="bg-white rounded-xl border border-zinc-100/70 shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold text-zinc-900">Recent and Active Orders</h2>
        <span className="text-[11px] text-zinc-500">Track preparation, dispatch, and delivery</span>
      </div>

      <div className="divide-y divide-zinc-100">
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No accepted/recent orders yet.</div>
        ) : (
          recentOrders.map((order) => {
            const status = order.status;
            const needsAgentAssignment = status === 'preparing' || status === 'confirmed';
            const chosenAgent = selectedAgentByOrder[order.id] || '';

            return (
              <Fragment key={order.id}>
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-400 font-bold">Order #{order.order_number}</p>
                      <p className="text-sm font-semibold text-zinc-900 mt-1">{order.customer_name || 'Customer'}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{order.items?.length || 0} items • ₹{Number(order.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start ${STATUS_STYLES[status] || 'bg-zinc-100 text-zinc-600'}`}>
                      {formatStatus(status)}
                    </span>
                  </div>

                  {needsAgentAssignment && (
                    <div className="mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-zinc-800">Step 2: Assign delivery agent and send pickup request</p>
                          <p className="text-[11px] text-zinc-500 mt-1">Once assigned, agent receives request directly. No manual in-transit update needed.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchAgentsForOrder(order.id)}
                          className="px-3 py-1.5 rounded-lg border border-zinc-200 text-[11px] font-bold text-zinc-600 hover:bg-white"
                        >
                          Refresh Nearby Agents
                        </button>
                      </div>

                      <div className="mt-3">
                        <AgentPills
                          agents={agentsByOrder[order.id] || []}
                          selectedAgentId={chosenAgent}
                          onSelect={(agentId) => setSelectedAgentByOrder((prev) => ({ ...prev, [order.id]: agentId }))}
                        />
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!chosenAgent) {
                              showToast('Select an agent before sending pickup request.', 'error');
                              return;
                            }
                            runOrderAction(order.id, 'ready_for_pickup', chosenAgent);
                          }}
                          disabled={actingOrderId === order.id}
                          className="px-4 py-2 rounded-lg bg-[#006e2f] text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
                        >
                          Assign Agent and Request Pickup
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'ready_for_pickup' && (
                    <div className="mt-4 p-3 rounded-xl bg-violet-50 border border-violet-100 text-[12px] text-violet-800 font-medium">
                      Pickup request sent. Waiting for agent acceptance. Order will automatically move to in transit when accepted.
                    </div>
                  )}

                  {status === 'in_transit' && (
                    <div className="mt-4 p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-[12px] text-cyan-800 font-medium">
                      Delivery is in transit. Track live status from Order Tracking.
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-700"
                    >
                      {expandedOrderId === order.id ? 'Hide Items' : 'View Items'}
                    </button>
                    {status !== 'delivered' && status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => runOrderAction(order.id, 'cancelled')}
                        disabled={actingOrderId === order.id}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-60"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="px-4 pb-4 bg-zinc-50/50">
                    <OrderItems items={order.items || []} />
                  </div>
                )}
              </Fragment>
            );
          })
        )}
      </div>
    </section>
  );

  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-zinc-100/70 shadow-sm p-5">
        <p className="text-sm text-zinc-500">Loading orders...</p>
      </section>
    );
  }

  if (compact) {
    return (
      <section className="space-y-4">
        {renderIncomingSection()}
        {renderRecentSection()}
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {renderIncomingSection()}
      {renderRecentSection()}
    </section>
  );
}
