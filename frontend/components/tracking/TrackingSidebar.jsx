import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function TrackingSidebar() {
  const [orders, setOrders] = useState([]);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    api.get('/orders/my').then((res) => setOrders(res.data)).catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full py-6 w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 z-40 pt-20">
      <div className="px-6 mb-4">
        <h2 className="font-['Manrope'] font-bold text-emerald-800 text-lg">My Orders</h2>
        <p className="text-xs text-slate-500 font-medium">Active Dispatch</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        {orders.length === 0 && (
          <p className="text-xs text-slate-400 px-4 py-2">No orders found</p>
        )}
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/tracking?orderId=${order.id}`}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ease-in-out ${
              String(order.id) === String(orderId)
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <div className="overflow-hidden">
              <p className="font-['Inter'] text-sm font-medium truncate">Order #{order.id}</p>
              <p className="text-[10px] text-slate-400 capitalize">{order.status}</p>
            </div>
          </Link>
        ))}
      </nav>
      <div className="px-4 mt-auto">
        <Link to="/products" className="block w-full py-3 bg-[#0d631b] text-white rounded-xl font-semibold shadow-lg text-center hover:scale-[1.02] active:scale-95 transition-all">
          New Request
        </Link>
      </div>
    </aside>
  );
}
