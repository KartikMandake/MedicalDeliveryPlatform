export default function AdminNavBar() {
  return (
    <header className="flex justify-between items-center w-full px-8 py-3 ml-64 max-w-[calc(100%-16rem)] bg-white/70 dark:bg-slate-900/70 backdrop-blur-md docked full-width top-0 sticky z-40 shadow-sm shadow-slate-200/50 dark:shadow-none">
      <div className="flex items-center gap-8">
        <span className="text-lg font-black text-emerald-800 dark:text-emerald-200 tracking-tight font-headline">Delivery Control</span>
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input className="pl-10 pr-4 py-2 bg-[#f2f4f7] border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-[#0d631b]/40 focus:outline-none placeholder:text-slate-400" placeholder="Search deliveries, labs, IDs..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 dark:text-slate-500 hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-400 dark:text-slate-500 hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <img alt="Admin Profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-100 dark:ring-emerald-900/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg3mcSQ3ObFqVqRaDvw2uA8rzAcZ02K2kVSZchSWRQy2BwPXQL6NqSZ5jO0MA6CO-bBGbQzpOrc0Xv5RJi62j7uP4bpEUH7v3fQkDPiTeeGw39R8HbGQ3OEpg6xjAjLjhsYwEk1z3W-DEzinSdQPjvtp1AiCIcl3DNyTceBKPWHPLx2YsqZxNKTZZGn7N37kF7RmRcO0Yn3sN0yXpnzN-CJrHI43dAta-Bfla8QTSMb5RHgKQapqFOS5zE-nyKgm79fL3g86Qb97yF"/>
      </div>
    </header>
  );
}
