export default function ProductsSidebar() {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl p-6 tonal-card border border-slate-100">
        <h2 className="font-bold text-lg mb-6">Filters</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-sm mb-4">Category</h3>
            <div className="space-y-3 custom-scrollbar max-h-48 overflow-y-auto pr-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Pain Relief</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Antibiotics</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Vitamins</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Supplements</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Diabetes Care</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Heart Health</span>
              </label>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4">Price Range</h3>
            <input className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-[#2E7D32]" max="1000" min="0" type="range"/>
            <div className="flex justify-between items-center mt-2 text-xs font-medium text-slate-500">
              <span>₹0</span>
              <span>₹1000</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4">Brand</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Cipla</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Sun Pharma</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Dr. Reddy's</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]" type="checkbox"/>
                <span className="text-sm text-slate-600 group-hover:text-emerald-700">Himalaya</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
