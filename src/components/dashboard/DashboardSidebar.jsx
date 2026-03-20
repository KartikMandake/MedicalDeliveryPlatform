import { Link } from 'react-router-dom';

export default function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 w-64 font-['Inter'] text-sm font-medium z-40">
      <div className="mb-10 px-4">
        <h1 className="font-['Manrope'] font-extrabold text-emerald-800 dark:text-emerald-200 text-xl tracking-tight">Medical Logistics</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Retailer Portal</p>
      </div>
      <nav className="flex-1 space-y-1">
        <Link className="flex items-center gap-3 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 rounded-lg px-4 py-2 transition-all duration-200 ease-in-out" to="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out" to="/tracking">
          <span className="material-symbols-outlined">package_2</span>
          <span>Orders</span>
        </Link>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out" to="/products">
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Inventory</span>
        </Link>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out" to="/payments">
          <span className="material-symbols-outlined">payments</span>
          <span>Earnings</span>
        </Link>
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1">
        <button className="w-full mb-4 bg-[#0d631b] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-sm">add</span>
          New Delivery
        </button>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 transition-all duration-200 ease-in-out" to="/admin">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </Link>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 px-4 py-2 hover:bg-slate-200/50 transition-all duration-200 ease-in-out" to="/upload">
          <span className="material-symbols-outlined">help</span>
          <span>Support</span>
        </Link>
      </div>
    </aside>
  );
}
