import { Link } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <aside className="flex flex-col py-6 bg-slate-50 dark:bg-slate-900 h-screen w-64 border-r-0 fixed left-0 top-0 z-50">
      <div className="px-6 mb-10">
        <h1 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-headline">MediFlow Admin</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide">Precision Logistics</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link className="flex items-center gap-3 px-4 py-3 text-emerald-700 dark:text-emerald-300 font-bold border-r-4 border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 transition-colors" to="/admin">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label">Dashboard</span>
        </Link>
        <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95" to="/tracking">
          <span className="material-symbols-outlined">package_2</span>
          <span className="font-label">Orders</span>
        </Link>
        <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95" to="/payments">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-label">Payments</span>
        </Link>
        <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95" to="/dashboard">
          <span className="material-symbols-outlined">group</span>
          <span className="font-label">Users</span>
        </Link>
        <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95" to="/products">
          <span className="material-symbols-outlined">local_pharmacy</span>
          <span className="font-label">Pharmacies</span>
        </Link>
      </nav>
      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <img alt="Medical Admin Avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyHFNl5_WkfThFSC5OcRFHUZG5y018AvyCJROK1mSC31t25L9zzGMAYWudPy7tq-OHnYIHKmZMgmfJBWoNAxZLAtg3LLqC6jRuVrg_gh6sbmjBbzCmVITgU34Nom3isyiUi6sn_7-ltN-nMgVdivtFDF3-iM2KNj5Gcf-b1itjHZfRM-pUY-NrUYf4CIXD_oO32JByYi9EwEZeHSf8nbtSVTHSi1lfTAgqrqGpvF34NEInm8A1H3u-RG8aiHzR0yCxn9YQLJPvCVuY"/>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-slate-900 dark:text-white">Dr. Aris Thorne</p>
            <p className="text-xs text-slate-500 truncate">System Overseer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
