export default function KPICards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Today's Earnings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-emerald-100 transition-all group">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-slate-500">Today's Earnings</p>
          <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">+12.4%</span>
        </div>
        <div className="flex items-end gap-2 mb-4">
          <h3 className="text-3xl font-['Manrope'] font-extrabold text-slate-900">$2,482.00</h3>
        </div>
        <div className="h-10 flex items-end gap-1">
          <div className="flex-1 bg-emerald-100/40 h-1/2 rounded-t-sm group-hover:h-2/3 transition-all duration-500"></div>
          <div className="flex-1 bg-emerald-100/40 h-2/3 rounded-t-sm group-hover:h-full transition-all duration-500"></div>
          <div className="flex-1 bg-emerald-100/40 h-1/3 rounded-t-sm group-hover:h-1/2 transition-all duration-500"></div>
          <div className="flex-1 bg-emerald-200 h-3/4 rounded-t-sm group-hover:h-1/3 transition-all duration-500"></div>
          <div className="flex-1 bg-[#0d631b] h-full rounded-t-sm"></div>
        </div>
      </div>
      {/* Active Orders */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-emerald-100 transition-all">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-slate-500">Active Orders</p>
          <span className="material-symbols-outlined text-[#2e7d32]">local_shipping</span>
        </div>
        <h3 className="text-3xl font-['Manrope'] font-extrabold text-slate-900">18</h3>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Preparing (5)</span>
            <span>In Transit (13)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-[#0d631b]/40 w-[27%] h-full"></div>
            <div className="bg-[#0d631b] w-[73%] h-full"></div>
          </div>
        </div>
      </div>
      {/* Inventory Health */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-red-200 transition-all">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-slate-500">Inventory Health</p>
          <span className="material-symbols-outlined text-red-600">warning</span>
        </div>
        <h3 className="text-3xl font-['Manrope'] font-extrabold text-slate-900">Low Stock</h3>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">💊</div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">🧴</div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">🩹</div>
          </div>
          <p className="text-xs text-red-600 font-semibold">4 Items need attention</p>
        </div>
      </div>
    </section>
  );
}
