export default function AdminOrdersTable() {
  return (
    <section className="bg-[#f2f4f7] p-1 rounded-xl">
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-[#f2f4f7]">
          <h3 className="text-lg font-bold text-[#191c1e] font-headline">Recent Orders</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#40493d] hover:bg-[#f2f4f7] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#40493d] hover:bg-[#f2f4f7] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">download</span> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f7]/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Pharmacy</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef1]">
              <tr className="group hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">#MP-10293</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Oct 24, 2023</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Sarah Jenkins</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">GreenLeaf Pharma</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#91f78e]/30 text-[#006e1c] italic">Processing</span>
                </td>
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">$124.50</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[#0d631b] text-xs font-bold hover:underline">View Details</button>
                </td>
              </tr>
              <tr className="group hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">#MP-10294</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Oct 24, 2023</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Robert Chen</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">City Central Lab</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#68fadd]/30 text-[#006153]">In Transit</span>
                </td>
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">$28.90</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[#0d631b] text-xs font-bold hover:underline">View Details</button>
                </td>
              </tr>
              <tr className="group hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">#MP-10295</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Oct 23, 2023</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Alice Vance</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">MediCare North</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#a3f69c]/30 text-[#0d631b]">Delivered</span>
                </td>
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">$210.00</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[#0d631b] text-xs font-bold hover:underline">View Details</button>
                </td>
              </tr>
              <tr className="group hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">#MP-10296</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Oct 23, 2023</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">Marcus Thorne</td>
                <td className="px-8 py-5 text-[#40493d] text-sm">GreenLeaf Pharma</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a]">Delayed</span>
                </td>
                <td className="px-8 py-5 font-bold text-[#191c1e] text-sm">$15.25</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[#0d631b] text-xs font-bold hover:underline">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 border-t border-[#f2f4f7] flex justify-between items-center text-sm text-slate-500">
          <p>Showing 4 of 14,284 orders</p>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-[#f2f4f7] rounded transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="p-2 hover:bg-[#f2f4f7] rounded transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}
