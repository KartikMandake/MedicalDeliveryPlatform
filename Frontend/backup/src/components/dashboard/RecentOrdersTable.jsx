export default function RecentOrdersTable() {
  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h2 className="font-['Manrope'] font-bold text-xl text-slate-900">Recent Orders</h2>
        <button className="text-[#0d631b] text-sm font-bold flex items-center gap-1 hover:underline">
          View All History <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="px-8 py-4">Order ID</th>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Order 1 */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-5 text-sm font-mono text-slate-600">#ORD-4921</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#0d631b] text-xs font-bold">AS</div>
                  <span className="text-sm font-semibold text-slate-900">Alice Schmidt</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-1">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Metformin</span>
                  <span className="text-[10px] text-slate-400 font-bold">+2 more</span>
                </div>
              </td>
              <td className="px-6 py-5 text-sm font-bold text-slate-900">$128.40</td>
              <td className="px-6 py-5">
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#91f78e]/30 text-[#006e1c] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span> Ready for Pickup
                </span>
              </td>
              <td className="px-8 py-5 text-right">
                <button className="p-2 text-slate-400 hover:text-[#0d631b] transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </td>
            </tr>
            {/* Order 2 */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-5 text-sm font-mono text-slate-600">#ORD-4920</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">JB</div>
                  <span className="text-sm font-semibold text-slate-900">John Bennett</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Lisinopril</span>
              </td>
              <td className="px-6 py-5 text-sm font-bold text-slate-900">$42.00</td>
              <td className="px-6 py-5">
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-100 text-[#0d631b] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b] animate-pulse"></span> Preparing
                </span>
              </td>
              <td className="px-8 py-5 text-right">
                <button className="p-2 text-slate-400 hover:text-[#0d631b] transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </td>
            </tr>
            {/* Order 3 */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-5 text-sm font-mono text-slate-600">#ORD-4919</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">MK</div>
                  <span className="text-sm font-semibold text-slate-900">Maria Khan</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-1">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Insulin Syringe</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Alcohol Pads</span>
                </div>
              </td>
              <td className="px-6 py-5 text-sm font-bold text-slate-900">$18.25</td>
              <td className="px-6 py-5">
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Delivered
                </span>
              </td>
              <td className="px-8 py-5 text-right">
                <button className="p-2 text-slate-400 hover:text-[#0d631b] transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-slate-50/30 flex justify-center">
        <nav className="flex items-center gap-2">
          <button className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded flex items-center justify-center bg-[#0d631b] text-white font-bold text-xs">1</button>
          <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-white border border-transparent text-slate-500 font-bold text-xs transition-colors">2</button>
          <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-white border border-transparent text-slate-500 font-bold text-xs transition-colors">3</button>
          <button className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </nav>
      </div>
    </section>
  );
}
