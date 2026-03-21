export default function EfficiencyAnalysis() {
  return (
    <section className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-12 lg:col-span-8 bg-[#f2f4f7] p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 mb-2">Efficiency Analysis</h2>
          <p className="text-slate-500 text-sm max-w-md mb-8">Your delivery pickup average has improved by 4 minutes compared to last week.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Avg. Prep Time</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">12m 40s</span>
                <span className="text-emerald-600 text-xs font-bold">↓ 15%</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Fulfillment Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">99.8%</span>
                <span className="text-emerald-600 text-xs font-bold">↑ 0.2%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative Background Element */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#0d631b]/5 rounded-full blur-3xl"></div>
      </div>
      <div className="col-span-12 lg:col-span-4 bg-[#2e7d32] text-[#cbffc2] p-8 rounded-2xl h-full flex flex-col justify-between">
        <div>
          <h3 className="font-['Manrope'] font-bold text-xl mb-4 text-white">Veridian Rewards</h3>
          <p className="text-[#cbffc2]/80 text-sm mb-6 leading-relaxed">You are $1,518 away from reaching the Platinum Tier retailer status this month.</p>
        </div>
        <div className="space-y-4">
          <div className="bg-white/10 p-4 rounded-xl">
            <div className="flex justify-between text-xs font-bold mb-2 text-white">
              <span>Gold Status</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-black/10 h-1.5 rounded-full">
              <div className="w-[85%] bg-white h-full rounded-full"></div>
            </div>
          </div>
          <button className="w-full bg-white text-[#0d631b] py-3 rounded-xl font-bold text-sm shadow-xl shadow-black/5 hover:bg-slate-50 transition-colors">View Benefits</button>
        </div>
      </div>
    </section>
  );
}
