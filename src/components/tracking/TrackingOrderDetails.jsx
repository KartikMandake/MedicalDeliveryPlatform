export default function TrackingOrderDetails() {
  return (
    <div className="lg:col-span-3 flex flex-col gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-headline font-bold text-slate-900 mb-6">Status Timeline</h3>
        <div className="space-y-0">
          <div className="flex gap-4 pb-8 border-l-2 border-[#a3f69c] relative ml-3">
            <div className="absolute -left-[11px] top-0 w-5 h-5 bg-[#a3f69c] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-xs text-[#005312]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <div className="pl-4">
              <p className="text-sm font-bold text-slate-900 leading-none">Order Placed</p>
              <p className="text-xs text-slate-500 mt-1">10:00 AM</p>
            </div>
          </div>
          <div className="flex gap-4 pb-8 border-l-2 border-[#a3f69c] relative ml-3">
            <div className="absolute -left-[11px] top-0 w-5 h-5 bg-[#a3f69c] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-xs text-[#005312]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <div className="pl-4">
              <p className="text-sm font-bold text-slate-900 leading-none">Accepted</p>
              <p className="text-xs text-slate-500 mt-1">10:05 AM</p>
            </div>
          </div>
          <div className="flex gap-4 pb-8 border-l-2 border-[#a3f69c] relative ml-3">
            <div className="absolute -left-[11px] top-0 w-5 h-5 bg-[#a3f69c] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-xs text-[#005312]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <div className="pl-4">
              <p className="text-sm font-bold text-slate-900 leading-none">Packed</p>
              <p className="text-xs text-slate-500 mt-1">10:15 AM</p>
            </div>
          </div>
          <div className="flex gap-4 pb-8 border-l-2 border-dashed border-slate-300 relative ml-3">
            <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-[#00BFA5]">
              <div className="w-2 h-2 bg-[#00BFA5] rounded-full pulse-ring"></div>
              <div className="w-2 h-2 bg-[#00BFA5] rounded-full z-10"></div>
            </div>
            <div className="pl-4">
              <p className="text-sm font-bold text-[#0d631b] leading-none">Out for Delivery</p>
              <p className="text-xs text-slate-500 mt-1">10:20 AM</p>
            </div>
          </div>
          <div className="flex gap-4 pb-2 relative ml-3">
            <div className="absolute -left-[11px] top-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center border-2 border-transparent"></div>
            <div className="pl-4">
              <p className="text-sm font-medium text-slate-500 leading-none opacity-50">Delivered</p>
              <p className="text-xs text-slate-500 mt-1 opacity-50">Pending</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden ring-4 ring-emerald-50">
            <img alt="Courier David Miller" className="w-full h-full object-cover" data-alt="Friendly male medical courier portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlrjpsOhAopd1CHMJfDxUBHhCw719JfIpE5FzLMlumgJHYeEAW5qlOx-aqOT4lfhB2lUZn7GvsAiUoMYzfMe-przQ6HCBm68hwhRjabiYbH9A1wFPdJAFV0uAY66YLABSHL4NspwV_cF4kz_SU6bRwnshCl3AQzeRXKpYfMfCpxgfR-rljy6AnixaiqPC4OWUv_l7ZFTK8vUV3W4YKi4Rapm1yBMsMTweRvaHxThxS4ZgY0qNmWYbyr0m733RqErLJQS37QKgPRq_I"/>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">David Miller</h4>
            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-semibold">4.9</span>
              <span className="text-xs opacity-60">(1.2k ratings)</span>
            </div>
          </div>
        </div>
        <button className="w-full py-3 bg-[#007c6b] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-lg">call</span>
          Call Agent
        </button>
      </div>
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Medical Items</span>
          <span className="text-xs font-medium text-[#0d631b]">3 Items</span>
        </div>
        <ul className="space-y-3">
          <li className="flex justify-between text-sm">
            <span className="text-slate-600">Insulin Glargine (10ml)</span>
            <span className="font-semibold text-slate-900">x2</span>
          </li>
          <li className="flex justify-between text-sm">
            <span className="text-slate-600">Sterile Syringes (Box)</span>
            <span className="font-semibold text-slate-900">x1</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
