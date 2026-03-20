export default function AgentOrderPopup() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-[#191c1e]/10 backdrop-blur-[2px]">
      <div className="w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-[#0d631b] px-8 py-6 text-white flex justify-between items-center">
          <div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">New Delivery Request</p>
            <h2 className="text-2xl font-headline font-extrabold">#MP-9921</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] uppercase font-bold">Earnings</p>
            <p className="text-xl font-headline font-extrabold">$15.50</p>
          </div>
        </div>
        {/* Details */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-[#0d631b] text-xl">radio_button_checked</span>
                <div className="w-px h-10 bg-slate-200"></div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pickup</p>
                <p className="font-bold text-[#191c1e]">City General Pharmacy</p>
                <p className="text-sm text-slate-500">421 Healthcare Blvd</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-[#006e1c] text-xl">location_on</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drop-off</p>
                <p className="font-bold text-[#191c1e]">Saint Jude Medical Center</p>
                <p className="text-sm text-slate-500">Station 4, Emergency Wing</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#f2f4f7] rounded-xl">
            <span className="material-symbols-outlined text-[#006153]">inventory_2</span>
            <span className="text-xs font-medium text-[#40493d] italic">Contains: Critical medical supplies (Refrigerated)</span>
          </div>
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-4 bg-[#0d631b] text-white font-bold rounded-2xl shadow-lg shadow-[#0d631b]/20 active:scale-95 transition-transform">
              Accept
            </button>
            <button className="px-6 py-4 bg-[#e6e8eb] text-[#40493d] font-bold rounded-2xl active:scale-95 transition-transform">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
