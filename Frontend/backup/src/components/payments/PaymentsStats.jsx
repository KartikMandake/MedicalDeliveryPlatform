export default function PaymentsStats() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stat Card 1 */}
      <div className="bg-white p-8 rounded-xl shadow-sm border-none relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0d631b]/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
        <div className="flex flex-col gap-1 relative">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Disbursed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$1.2M</span>
            <span className="text-[#0d631b] font-bold text-sm flex items-center bg-[#a3f69c]/30 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-sm">trending_up</span> 12%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-4">Lifetime payout to retailers & agents</p>
        </div>
      </div>
      {/* Stat Card 2 */}
      <div className="bg-white p-8 rounded-xl shadow-sm border-none relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006153]/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
        <div className="flex flex-col gap-1 relative">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Payments</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$45,280</span>
          </div>
          <div className="w-full bg-[#eceef1] mt-6 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#44ddc1] h-full w-2/3"></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">68 batches awaiting approval</p>
        </div>
      </div>
      {/* Stat Card 3 */}
      <div className="bg-[#0d631b] bg-gradient-to-br from-[#0d631b] to-[#2e7d32] p-8 rounded-xl shadow-lg border-none relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
          <span className="material-symbols-outlined text-9xl">account_balance</span>
        </div>
        <div className="flex flex-col gap-1 relative">
          <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">Admin Commission</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">$124,500</span>
          </div>
          <p className="text-xs text-white/60 mt-4">Q3 Earnings Projection: +8.4%</p>
        </div>
      </div>
    </section>
  );
}
