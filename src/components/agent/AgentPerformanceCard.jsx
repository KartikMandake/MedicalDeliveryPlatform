export default function AgentPerformanceCard() {
  return (
    <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-4xl z-10">
      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Today's Earnings</span>
            <span className="text-2xl font-headline font-extrabold text-[#0d631b]">$184.20</span>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Completed</span>
            <span className="text-2xl font-headline font-extrabold text-[#191c1e]">12 <span className="text-sm font-medium text-slate-400">deliveries</span></span>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Rating</span>
            <div className="flex items-center gap-1 text-[#006e1c] font-extrabold text-2xl">
              <span>4.9</span>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
        </div>
        <button className="px-6 py-3 bg-[#191c1e] text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <span>Daily Report</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
