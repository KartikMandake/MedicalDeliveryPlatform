import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAgentHistory, setAgentOnlineStatus } from '../api/agent';
import { AgentShell } from './AgentDashboardPage';

function formatDateTime(v) { if (!v) return '--'; const d = new Date(v); return Number.isNaN(d.getTime()) ? '--' : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function formatDuration(m) { const mins = Math.round(Number(m)); if (!Number.isFinite(mins) || mins < 0) return '--'; if (mins < 60) return `${mins}m`; return `${Math.floor(mins / 60)}h ${mins % 60}m`; }
function formatMoney(v) { return `₹${Number(v || 0).toFixed(2)}`; }
function formatFullAddress(addr) { if (!addr) return '--'; return [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ') || '--'; }

function getStatusConfig(status) {
  const map = {
    confirmed: { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Confirmed' },
    ready_for_pickup: { color: 'text-sky-700 bg-sky-50 border-sky-200', label: 'Ready' },
    in_transit: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'In Transit' },
    delivered: { color: 'text-slate-700 bg-slate-50 border-slate-200', label: 'Delivered' },
    cancelled: { color: 'text-rose-700 bg-rose-50 border-rose-200', label: 'Cancelled' },
  };
  return map[status] || { color: 'text-slate-600 bg-slate-50 border-slate-200', label: String(status || '').replace(/_/g, ' ') };
}

export default function AgentHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [online, setOnline] = useState(false);
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingRows, setLoadingRows] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    setLoadingRows(true);
    getAgentHistory({ page, limit: 10, ...(statusFilter ? { status: statusFilter } : {}) })
      .then((res) => { setRows(Array.isArray(res.data?.history) ? res.data.history : []); setPages(Number(res.data?.pages || 1)); })
      .catch((err) => showToast(err.response?.data?.message || 'Unable to load history.', 'error'))
      .finally(() => setLoadingRows(false));
  }, [page, showToast, statusFilter, user]);

  const handleOnlineToggle = async () => {
    const next = !online;
    try { await setAgentOnlineStatus(next); setOnline(next); } catch {}
  };

  if (authLoading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  return (
    <AgentShell user={user} online={online} onToggleOnline={handleOnlineToggle}>
      <main className="lg:ml-64 pt-20 pb-24 px-6 min-h-screen">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold font-headline text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">history</span> Transit Log
            </h1>
            <p className="text-sm text-slate-500 mt-1">Full history of all assigned deliveries with customer details.</p>
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm">
            <option value="">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="in_transit">In Transit</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          {loadingRows ? (
            <div className="flex items-center justify-center h-64"><span className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">inbox</span>
              <p className="text-sm font-bold text-slate-700">No Entries Found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filter or complete more deliveries.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] uppercase tracking-[0.1em] text-slate-400 font-black border-b border-slate-100 bg-[#f8f9fa]">
                    <th className="py-3.5 px-5">Order</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3">Address</th>
                    <th className="py-3.5 px-3">Placed</th>
                    <th className="py-3.5 px-3">Delivered</th>
                    <th className="py-3.5 px-3">Items</th>
                    <th className="py-3.5 px-3">Value</th>
                    <th className="py-3.5 px-3">Duration</th>
                    <th className="py-3.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const cfg = getStatusConfig(row.status);
                    return (
                      <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="text-xs font-extrabold text-slate-900">{row.orderId}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="text-xs font-bold text-slate-800">{row.customerName || '--'}</p>
                          <p className="text-[10px] text-slate-500">{row.customerPhone || '--'}</p>
                        </td>
                        <td className="py-3.5 px-3 max-w-[180px]">
                          <p className="text-[11px] text-slate-600 truncate">{formatFullAddress(row.deliveryAddress)}</p>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">{formatDateTime(row.placedAt)}</td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">{formatDateTime(row.deliveredAt)}</td>
                        <td className="py-3.5 px-3 text-xs font-bold text-slate-700">{Number(row.itemCount || 0)}</td>
                        <td className="py-3.5 px-3 text-xs font-extrabold text-slate-900">{formatMoney(row.total)}</td>
                        <td className="py-3.5 px-3 text-xs font-bold text-slate-700">{formatDuration(row.deliveryMinutes)}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cfg.color}`}>{cfg.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {rows.length > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 font-bold">Page {page} of {pages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-extrabold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer">Prev</button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-extrabold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer">Next</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </AgentShell>
  );
}
