export default function AdminAnalytics() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      <div className="lg:col-span-8 bg-white p-8 rounded-xl border-none shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#191c1e] font-headline">Performance Analytics</h3>
            <p className="text-sm text-slate-500">Orders vs. Revenue Growth Growth (Monthly)</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-3 h-3 rounded-full bg-[#0d631b]"></span> Orders
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-3 h-3 rounded-full bg-[#44ddc1]"></span> Revenue
            </span>
          </div>
        </div>
        {/* Abstract Data Visualization */}
        <div className="relative h-64 w-full flex items-end gap-4 overflow-hidden pt-4">
          <div className="flex-1 bg-[#f2f4f7] rounded-t-lg relative group h-[40%]">
            <div className="absolute bottom-0 w-full bg-[#0d631b]/20 h-[80%] rounded-t-lg transition-all hover:bg-[#0d631b]/40"></div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-1 w-full bg-[#44ddc1] opacity-40"></div>
          </div>
          <div className="flex-1 bg-[#f2f4f7] rounded-t-lg relative group h-[65%]">
            <div className="absolute bottom-0 w-full bg-[#0d631b]/20 h-[70%] rounded-t-lg transition-all hover:bg-[#0d631b]/40"></div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 h-1 w-full bg-[#44ddc1] opacity-40"></div>
          </div>
          <div className="flex-1 bg-[#f2f4f7] rounded-t-lg relative group h-[55%]">
            <div className="absolute bottom-0 w-full bg-[#0d631b]/20 h-[90%] rounded-t-lg transition-all hover:bg-[#0d631b]/40"></div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 h-1 w-full bg-[#44ddc1] opacity-40"></div>
          </div>
          <div className="flex-1 bg-[#f2f4f7] rounded-t-lg relative group h-[85%]">
            <div className="absolute bottom-0 w-full bg-[#0d631b]/20 h-[60%] rounded-t-lg transition-all hover:bg-[#0d631b]/40"></div>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 h-1 w-full bg-[#44ddc1] opacity-40"></div>
          </div>
          <div className="flex-1 bg-[#f2f4f7] rounded-t-lg relative group h-[70%]">
            <div className="absolute bottom-0 w-full bg-[#0d631b]/20 h-[85%] rounded-t-lg transition-all hover:bg-[#0d631b]/40"></div>
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 h-1 w-full bg-[#44ddc1] opacity-40"></div>
          </div>
          <div className="flex-1 bg-[#f2f4f7] rounded-t-lg relative group h-[95%]">
            <div className="absolute bottom-0 w-full bg-[#0d631b]/20 h-[75%] rounded-t-lg transition-all hover:bg-[#0d631b]/40"></div>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 h-1 w-full bg-[#44ddc1] opacity-40"></div>
          </div>
          {/* Legend X-Axis */}
          <div className="absolute bottom-[-1.5rem] w-full flex justify-between px-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      </div>
      {/* Asymmetric Support Card */}
      <div className="lg:col-span-4 bg-[#0d631b] text-white p-8 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <span className="text-[#a3f69c] font-bold text-xs tracking-widest uppercase mb-4 block">New Feature</span>
          <h3 className="text-2xl font-bold font-headline leading-tight">Precision Route Optimization v2.0</h3>
          <p className="mt-4 text-[#a3f69c]/80 text-sm leading-relaxed">AI-driven logistics are reducing delivery times by an average of 14 minutes per urgent order.</p>
        </div>
        <div className="mt-8 z-10">
          <button className="bg-[#2e7d32] text-white px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95">Update Logistics Model</button>
        </div>
        {/* Abstract Texture Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2e7d32]/30 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#006153]/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
      </div>
    </section>
  );
}
