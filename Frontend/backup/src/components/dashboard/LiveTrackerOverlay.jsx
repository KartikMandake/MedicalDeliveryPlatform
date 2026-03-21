export default function LiveTrackerOverlay() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="glass-effect bg-slate-900/90 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wide uppercase">System Live</span>
        </div>
        <div className="h-4 w-px bg-white/20"></div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="opacity-70">Courier Availability: <span className="text-white opacity-100 font-bold">High</span></span>
          <span className="opacity-70">Network Latency: <span className="text-white opacity-100 font-bold">14ms</span></span>
        </div>
      </div>
    </div>
  );
}
