import { useEffect, useState } from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAgentHistory, setAgentOnlineStatus } from '../api/agent';

function formatDateTime(value) {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  const mins = Number(minutes);
  if (!Number.isFinite(mins) || mins < 0) return '--';
  const wholeMins = Math.round(mins);
  if (wholeMins < 60) return `${wholeMins}m`;
  const h = Math.floor(wholeMins / 60);
  const m = wholeMins % 60;
  return `${h}h ${m}m`;
}

function formatStatus(status) {
  return String(status || '').replace(/_/g, ' ');
}

function formatMoney(value) {
  return `Rs.${Number(value || 0).toFixed(2)}`;
}

export default function AgentHistoryPage() {
  const { user, loading } = useAuth();
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
      .then((res) => {
        setRows(Array.isArray(res.data?.history) ? res.data.history : []);
        setPages(Number(res.data?.pages || 1));
      })
      .catch((err) => showToast(err.response?.data?.message || 'Unable to load transit history.', 'error'))
      .finally(() => setLoadingRows(false));
  }, [page, showToast, statusFilter, user]);

  const handleOnlineToggle = async () => {
    const next = !online;
    try {
      await setAgentOnlineStatus(next);
      setOnline(next);
      showToast(next ? 'You are now online for assignments.' : 'You are now offline.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to change online status.', 'error');
    }
  };

  if (loading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-sm shadow-zinc-200/50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-zinc-900 font-['Manrope']">MediFlow</span>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-green-600 font-semibold border-b-2 border-green-600 font-['Manrope'] text-sm h-16 flex items-center">Transit History</span>
          </div>
        </div>
        <NavLink to="/agent/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user.name || 'Agent'}</p>
            <p className="text-[10px] text-slate-500">Delivery Partner</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-zinc-900/10">
            {user.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </NavLink>
      </nav>

      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-zinc-50 pt-20 pb-6 px-4 hidden lg:flex flex-col">
        <div className="flex flex-col gap-1 mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 px-4">Command Center</h3>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink to="/agent" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">local_shipping</span> Order Tracking
          </NavLink>
          <NavLink to="/agent/performance" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">monitoring</span> Performance
          </NavLink>
          <NavLink to="/agent/history" className="flex items-center gap-3 px-4 py-3 bg-white text-green-600 rounded-xl shadow-sm text-sm font-medium">
            <span className="material-symbols-outlined">history</span> Transit History
          </NavLink>
          <NavLink to="/agent/profile" className="flex items-center gap-3 px-4 py-3 text-zinc-500 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
            <span className="material-symbols-outlined">person</span> My Profile
          </NavLink>
        </nav>
      </aside>

      <main className="lg:ml-64 pt-20 pb-8 px-6 min-h-screen">
        <div className="bg-white rounded-xl border border-zinc-200/60 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-['Manrope'] font-extrabold text-slate-900">All Assigned Transit Entries</h2>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="">All statuses</option>
              <option value="delivered">Delivered</option>
              <option value="in_transit">In transit</option>
              <option value="ready_for_pickup">Ready for pickup</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.08em] text-slate-500 border-b border-zinc-200/60">
                  <th className="py-2.5 pr-3">Order</th>
                  <th className="py-2.5 pr-3">Customer</th>
                  <th className="py-2.5 pr-3">Placed</th>
                  <th className="py-2.5 pr-3">Delivered</th>
                  <th className="py-2.5 pr-3">Shops</th>
                  <th className="py-2.5 pr-3">Items</th>
                  <th className="py-2.5 pr-3">Value</th>
                  <th className="py-2.5 pr-3">Duration</th>
                  <th className="py-2.5 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingRows ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-sm text-slate-500">Loading transit history...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-sm text-slate-500">No history entries found.</td>
                  </tr>
                ) : rows.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100">
                    <td className="py-2.5 pr-3 text-xs font-bold text-slate-900">{row.orderId}</td>
                    <td className="py-2.5 pr-3"><p className="text-xs font-semibold text-slate-800">{row.customerName || '--'}</p><p className="text-[11px] text-slate-500">{row.customerPhone || '--'}</p></td>
                    <td className="py-2.5 pr-3 text-xs text-slate-700">{formatDateTime(row.placedAt)}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-700">{formatDateTime(row.deliveredAt)}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-700">{Number(row.shopStops || 0)}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-700">{Number(row.itemCount || 0)}</td>
                    <td className="py-2.5 pr-3 text-xs font-semibold text-slate-800">{formatMoney(row.total)}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-700">{formatDuration(row.deliveryMinutes)}</td>
                    <td className="py-2.5 pr-3"><span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-slate-700 uppercase">{formatStatus(row.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Page {page} of {pages}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-slate-600 disabled:opacity-40">Prev</button>
              <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-slate-600 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur h-14 flex justify-around items-center border-t border-slate-200 z-40">
        <NavLink to="/agent" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>Orders</NavLink>
        <NavLink to="/agent/performance" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>Stats</NavLink>
        <NavLink to="/agent/history" className={({ isActive }) => `text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>History</NavLink>
      </nav>
    </div>
  );
}
