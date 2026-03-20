import { Link } from 'react-router-dom';

export default function TrackingSidebar() {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full py-6 w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 z-40 pt-20">
      <div className="px-6 mb-8">
        <h2 className="font-['Manrope'] font-bold text-emerald-800 text-lg">St. Jude Medical</h2>
        <p className="text-xs text-slate-500 font-medium">Active Dispatch</p>
      </div>
      <nav className="flex-1 space-y-1">
        <Link className="flex items-center gap-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 rounded-lg mx-2 px-4 py-3 transition-all duration-300 ease-in-out" to="/tracking">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          <span className="font-['Inter'] text-sm font-medium">Live Track</span>
        </Link>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mx-2 px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 ease-in-out" to="/dashboard">
          <span className="material-symbols-outlined">history</span>
          <span className="font-['Inter'] text-sm font-medium">Order History</span>
        </Link>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mx-2 px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 ease-in-out" to="/upload">
          <span className="material-symbols-outlined">medical_services</span>
          <span className="font-['Inter'] text-sm font-medium">Support</span>
        </Link>
        <Link className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mx-2 px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 ease-in-out" to="/agent">
          <span className="material-symbols-outlined">emergency</span>
          <span className="font-['Inter'] text-sm font-medium">Emergency</span>
        </Link>
      </nav>
      <div className="px-4 mt-auto">
        <button className="w-full py-3 bg-[#0d631b] text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          New Request
        </button>
      </div>
    </aside>
  );
}
