export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between w-full px-6 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm dark:shadow-none docked full-width top-0 sticky z-30">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#0d631b]/20" placeholder="Search orders, SKU, or prescriptions..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors relative">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">St. Jude Pharmacy</p>
            <p className="text-[10px] text-slate-500 uppercase">Retailer ID: 8829</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2e7d32] flex items-center justify-center text-[#cbffc2] font-bold">
            <span className="material-symbols-outlined">account_circle</span>
          </div>
        </div>
      </div>
    </header>
  );
}
