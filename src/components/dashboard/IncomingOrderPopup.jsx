export default function IncomingOrderPopup() {
  return (
    <div className="fixed top-24 right-8 z-50 animate-bounce-subtle">
      <div className="w-80 glass-effect bg-white/90 border border-emerald-100 shadow-2xl rounded-2xl overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="bg-[#2e7d32] text-[#cbffc2] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Urgent New Order</span>
          <span className="text-xs text-slate-400 font-mono">#ORD-5501</span>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0d631b] text-2xl">medical_services</span>
          </div>
          <div>
            <h4 className="font-['Manrope'] font-bold text-slate-900 text-lg leading-tight">Amoxicillin 500mg</h4>
            <p className="text-xs text-slate-500">Qty: 2 boxes • Total: $24.50</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Decline</button>
          <button className="py-2.5 rounded-xl bg-[#0d631b] text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-[#0d631b]/20">Accept</button>
        </div>
      </div>
    </div>
  );
}
