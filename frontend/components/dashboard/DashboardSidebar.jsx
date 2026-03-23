import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 w-64 font-['Inter'] text-sm font-medium z-40">
      <div className="mb-10 px-4">
        <h1 className="font-['Manrope'] font-extrabold text-emerald-800 dark:text-emerald-200 text-xl tracking-tight">Medical Logistics</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Retailer Portal</p>
      </div>
      <nav className="flex-1 space-y-1">
        <Link to="/retailer/dashboard" className="flex items-center gap-3 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 rounded-lg px-4 py-2 transition-all duration-200 ease-in-out">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/retailer/orders" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out rounded-lg">
          <span className="material-symbols-outlined">package_2</span>
          <span>Orders</span>
        </Link>
        <Link to="/retailer/inventory" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out rounded-lg">
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Inventory</span>
        </Link>
        <Link to="/payments" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out rounded-lg">
          <span className="material-symbols-outlined">payments</span>
          <span>Earnings</span>
        </Link>
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1">
        <div className="px-4 py-2 mb-2">
          <p className="text-xs font-bold text-slate-700 truncate">{user?.name || 'Retailer'}</p>
          <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-red-500 px-4 py-2 hover:bg-red-50 transition-all duration-200 ease-in-out rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
