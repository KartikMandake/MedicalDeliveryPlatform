import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/retailer/dashboard', icon: 'dashboard', label: 'Global Overview', fill: true },
  { to: '/retailer/inventory', icon: 'inventory_2', label: 'Inventory Hub' },
  { to: '/retailer/orders', icon: 'local_shipping', label: 'Order Tracking' },
  { to: '/retailer/profile', icon: 'person', label: 'Store Profile' },
];

export default function RetailerSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 z-40 bg-zinc-50/80 backdrop-blur-sm border-r border-zinc-200/70 flex-col pt-20 pb-5 px-3 hidden lg:flex">
      <div className="mb-6 px-3">
        <h2 className="text-[15px] font-bold text-zinc-900 font-headline tracking-tight">Command Center</h2>
        <p className="text-[11px] text-zinc-500">Precision Logistics</p>
      </div>
      <div className="space-y-1">
        {NAV_ITEMS.map(({ to, icon, label, fill }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-white text-green-700 shadow-sm font-semibold translate-x-0.5'
                  : 'text-zinc-500 hover:bg-zinc-200/40 group'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[19px] ${!isActive ? 'group-hover:text-green-600' : ''}`}
                style={isActive && fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
        {(() => {
          const to = '/retailer/forecasting';
          const isActive = location.pathname === to;
          return (
            <Link
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-white text-green-700 shadow-sm font-semibold translate-x-0.5'
                  : 'text-zinc-500 hover:bg-zinc-200/40 group'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${!isActive ? 'group-hover:text-green-600' : ''}`}>insights</span>
              <span>Demand Forecast</span>
            </Link>
          );
        })()}
      </div>
      <div className="mt-auto space-y-1.5">
        <Link
          to="/retailer/inventory"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 mb-2 bg-white text-[#006e2f] rounded-lg border border-[#006e2f]/15 hover:bg-[#006e2f]/5 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[19px]">add_circle</span>
          <span className="font-semibold">Manage Inventory</span>
        </Link>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/40 rounded-lg transition-all" onClick={() => {}}>
          <span className="material-symbols-outlined text-[19px]">help</span>
          <span>Support</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/40 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-[19px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
