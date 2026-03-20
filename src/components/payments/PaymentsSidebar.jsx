export default function PaymentsSidebar() {
  return (
    <aside className="h-screen w-72 flex flex-col fixed left-0 top-0 bg-slate-50 dark:bg-slate-950 p-6 space-y-2 z-50">
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0d631b] flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <div>
            <h2 className="font-['Manrope'] font-black text-emerald-800 dark:text-emerald-300 text-xl leading-tight">CareChain</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Admin Terminal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg group transition-all" href="#">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-medium">Dashboard</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg group transition-all" href="#">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-medium">Orders</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-100 shadow-sm rounded-lg group transition-all" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span className="font-medium">Payments</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg group transition-all" href="#">
          <span className="material-symbols-outlined">group</span>
          <span className="font-medium">Users</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg group transition-all" href="#">
          <span className="material-symbols-outlined">local_pharmacy</span>
          <span className="font-medium">Pharmacies</span>
        </a>
      </nav>
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 rounded-lg transition-all">
          <span className="material-symbols-outlined">help_outline</span>
          <span className="font-medium">Support</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-[#ba1a1a] hover:bg-[#ffdad6]/20 rounded-lg transition-all">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
