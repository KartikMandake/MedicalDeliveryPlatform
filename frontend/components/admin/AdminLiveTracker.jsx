export default function AdminLiveTracker() {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white/70 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl border-none flex items-center gap-6 max-w-sm">
      <div className="flex items-center gap-3">
        <div className="relative w-3 h-3">
          <div className="absolute inset-0 bg-[#ba1a1a] rounded-full animate-ping opacity-25"></div>
          <div className="relative w-3 h-3 bg-[#ba1a1a] rounded-full"></div>
        </div>
        <span className="text-sm font-bold text-[#191c1e] font-label">3 Urgent Deliveries</span>
      </div>
      <div className="h-4 w-[1px] bg-slate-200"></div>
      <button className="text-[#0d631b] text-sm font-extrabold uppercase tracking-widest hover:text-[#2e7d32] transition-colors">Track All</button>
    </div>
  );
}
