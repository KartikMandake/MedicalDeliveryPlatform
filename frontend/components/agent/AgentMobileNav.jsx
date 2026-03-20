export default function AgentMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-white/80 backdrop-blur-xl flex justify-around items-center px-6 pb-safe z-50 border-t border-slate-100">
      <button className="flex flex-col items-center justify-center bg-green-100 text-green-800 rounded-xl px-4 py-1">
        <span className="material-symbols-outlined">map</span>
        <span className="text-[10px] font-semibold mt-0.5">Map</span>
      </button>
      <button className="flex flex-col items-center justify-center text-slate-400">
        <span className="material-symbols-outlined">inventory_2</span>
        <span className="text-[10px] font-semibold mt-0.5">Deliveries</span>
      </button>
      <button className="flex flex-col items-center justify-center text-slate-400">
        <span className="material-symbols-outlined">account_balance_wallet</span>
        <span className="text-[10px] font-semibold mt-0.5">Earnings</span>
      </button>
    </nav>
  );
}
