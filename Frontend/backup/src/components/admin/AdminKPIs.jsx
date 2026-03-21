export default function AdminKPIs() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {/* Metric Card 1 */}
      <div className="bg-white p-6 rounded-xl border-none shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#2e7d32]/10 rounded-lg">
            <span className="material-symbols-outlined text-[#0d631b]">local_shipping</span>
          </div>
          <span className="text-xs font-bold text-[#2e7d32] bg-[#a3f69c]/20 px-2 py-1 rounded-full">+12%</span>
        </div>
        <p className="text-slate-500 text-sm font-label mb-1">Total Orders</p>
        <h3 className="text-2xl font-extrabold text-[#191c1e] font-headline">14,284</h3>
      </div>
      {/* Metric Card 2 */}
      <div className="bg-white p-6 rounded-xl border-none shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <span className="material-symbols-outlined text-emerald-800">account_balance_wallet</span>
          </div>
          <span className="text-xs font-bold text-[#2e7d32] bg-[#a3f69c]/20 px-2 py-1 rounded-full">+8%</span>
        </div>
        <p className="text-slate-500 text-sm font-label mb-1">Total Revenue</p>
        <h3 className="text-2xl font-extrabold text-[#191c1e] font-headline">$482,910</h3>
      </div>
      {/* Metric Card 3 */}
      <div className="bg-white p-6 rounded-xl border-none shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#006153]/10 rounded-lg">
            <span className="material-symbols-outlined text-[#006153]">pending_actions</span>
          </div>
          <span className="text-xs font-bold text-[#007c6b] bg-[#68fadd]/20 px-2 py-1 rounded-full">Live</span>
        </div>
        <p className="text-slate-500 text-sm font-label mb-1">Active Deliveries</p>
        <h3 className="text-2xl font-extrabold text-[#191c1e] font-headline">156</h3>
      </div>
      {/* Metric Card 4 */}
      <div className="bg-white p-6 rounded-xl border-none shadow-sm transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#006e1c]/10 rounded-lg">
            <span className="material-symbols-outlined text-[#006e1c]">medication</span>
          </div>
          <span className="text-xs font-bold text-[#40493d] bg-[#e0e3e6] px-2 py-1 rounded-full">Global</span>
        </div>
        <p className="text-slate-500 text-sm font-label mb-1">Active Pharmacies</p>
        <h3 className="text-2xl font-extrabold text-[#191c1e] font-headline">84</h3>
      </div>
    </section>
  );
}
