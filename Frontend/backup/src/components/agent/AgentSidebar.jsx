export default function AgentSidebar() {
  return (
    <nav className="hidden md:flex flex-col py-4 space-y-2 bg-slate-50 w-64 border-r border-slate-100 h-full fixed left-0">
      <div className="px-6 mb-8 pt-2">
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#0d631b]">
            <span className="material-symbols-outlined">medical_services</span>
          </div>
          <div>
            <p className="font-headline font-bold text-sm">Agent Smith</p>
            <p className="text-xs text-slate-500">On-Duty • Level 4</p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <a className="bg-white text-green-700 shadow-sm rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-medium transition-all duration-200" href="#">
          <span className="material-symbols-outlined">map</span>
          <span>Live Map</span>
        </a>
        <a className="text-slate-600 hover:text-green-600 hover:bg-slate-200/50 rounded-lg px-4 py-3 mx-2 flex items-center gap-3 font-medium transition-all duration-200" href="#">
          <span className="material-symbols-outlined">local_shipping</span>
          <span>Active Deliveries</span>
        </a>
        <a className="text-slate-600 hover:text-green-600 hover:bg-slate-200/50 rounded-lg px-4 py-3 mx-2 flex items-center gap-3 font-medium transition-all duration-200" href="#">
          <span className="material-symbols-outlined">payments</span>
          <span>Earnings</span>
        </a>
        <a className="text-slate-600 hover:text-green-600 hover:bg-slate-200/50 rounded-lg px-4 py-3 mx-2 flex items-center gap-3 font-medium transition-all duration-200" href="#">
          <span className="material-symbols-outlined">account_circle</span>
          <span>Profile</span>
        </a>
      </div>
      <div className="px-4 pb-4 space-y-4">
        <div className="h-px bg-slate-200 mx-2"></div>
        <a className="text-slate-600 hover:text-green-600 hover:bg-slate-200/50 rounded-lg px-4 py-3 mx-2 flex items-center gap-3 font-medium transition-all duration-200" href="#">
          <span className="material-symbols-outlined">help_outline</span>
          <span>Support</span>
        </a>
        <a className="text-slate-600 hover:text-green-600 hover:bg-slate-200/50 rounded-lg px-4 py-3 mx-2 flex items-center gap-3 font-medium transition-all duration-200" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
        <button className="w-full mt-4 py-3 px-4 bg-red-100 text-red-800 font-bold rounded-xl active:scale-95 transition-transform">
          Go Offline
        </button>
      </div>
    </nav>
  );
}
