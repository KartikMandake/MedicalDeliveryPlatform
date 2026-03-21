export default function PaymentsTable() {
  return (
    <section className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">filter_list</span>
            <select className="pl-10 pr-10 py-2 bg-white border-none shadow-sm rounded-lg text-sm appearance-none focus:ring-2 focus:ring-[#0d631b]/20 w-full md:w-48">
              <option>All Statuses</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="relative flex-1 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_month</span>
            <select className="pl-10 pr-10 py-2 bg-white border-none shadow-sm rounded-lg text-sm appearance-none focus:ring-2 focus:ring-[#0d631b]/20 w-full md:w-48">
              <option>Last 30 Days</option>
              <option>Current Month</option>
              <option>Year to Date</option>
            </select>
          </div>
        </div>
        <button className="bg-[#0d631b] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95">
          <span className="material-symbols-outlined text-lg">download</span> Export Reports
        </button>
      </div>
      {/* Data Table Container */}
      <div className="bg-white rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,30,0.06)] overflow-hidden border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Retailer Share</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Share</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Commission</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-5">
                  <span className="font-mono font-bold text-slate-900">#MP-10293</span>
                  <p className="text-[10px] text-slate-400">Oct 24, 2023</p>
                </td>
                <td className="px-6 py-5 font-bold text-slate-900">$840.00</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Central Pharma</span>
                    <span className="text-xs text-[#0d631b] font-medium">$714.00 (85%)</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">James Wilson</span>
                    <span className="text-xs text-[#006e1c] font-medium">$84.00 (10%)</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-emerald-900">$42.00</span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#91f78e] text-[#00731e]">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-slate-400 hover:text-[#0d631b] transition-colors">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </button>
                </td>
              </tr>
              {/* Row 2 (Pending) */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-[#f2f4f7]/30">
                <td className="px-6 py-5">
                  <span className="font-mono font-bold text-slate-900">#MP-10294</span>
                  <p className="text-[10px] text-slate-400">Oct 25, 2023</p>
                </td>
                <td className="px-6 py-5 font-bold text-slate-900">$1,250.00</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">City Meds Inc.</span>
                    <span className="text-xs text-[#0d631b] font-medium">$1,062.50</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Elena Rodriguez</span>
                    <span className="text-xs text-[#006e1c] font-medium">$125.00</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-emerald-900">$62.50</span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-xs font-bold text-[#0d631b] border-2 border-[#0d631b] hover:bg-[#0d631b] hover:text-white px-4 py-1.5 rounded-full transition-all active:scale-95">
                    Release Payment
                  </button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-5">
                  <span className="font-mono font-bold text-slate-900">#MP-10295</span>
                  <p className="text-[10px] text-slate-400">Oct 25, 2023</p>
                </td>
                <td className="px-6 py-5 font-bold text-slate-900">$420.50</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Green Cross</span>
                    <span className="text-xs text-[#0d631b] font-medium">$357.43</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Sam Rivera</span>
                    <span className="text-xs text-[#006e1c] font-medium">$42.05</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-emerald-900">$21.02</span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#91f78e] text-[#00731e]">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-slate-400 hover:text-[#0d631b] transition-colors">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </button>
                </td>
              </tr>
              {/* Row 4 (Pending) */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-[#f2f4f7]/30">
                <td className="px-6 py-5">
                  <span className="font-mono font-bold text-slate-900">#MP-10296</span>
                  <p className="text-[10px] text-slate-400">Oct 26, 2023</p>
                </td>
                <td className="px-6 py-5 font-bold text-slate-900">$2,100.00</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Elite Biotech</span>
                    <span className="text-xs text-[#0d631b] font-medium">$1,785.00</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Mark Thompson</span>
                    <span className="text-xs text-[#006e1c] font-medium">$210.00</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-emerald-900">$105.00</span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-xs font-bold text-[#0d631b] border-2 border-[#0d631b] hover:bg-[#0d631b] hover:text-white px-4 py-1.5 rounded-full transition-all active:scale-95">
                    Release Payment
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-500 font-medium">Showing 1 to 4 of 1,240 entries</span>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 disabled:opacity-50">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0d631b] text-white font-bold text-sm">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm">124</button>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
