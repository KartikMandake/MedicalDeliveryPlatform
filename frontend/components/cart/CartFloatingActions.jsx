export default function CartFloatingActions() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
      <button className="w-14 h-14 bg-white shadow-xl rounded-full flex items-center justify-center text-emerald-800 hover:bg-emerald-50 transition-colors border border-slate-100">
        <span className="material-symbols-outlined">call</span>
      </button>
      <button className="w-14 h-14 bg-emerald-600 shadow-xl rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
      </button>
    </div>
  );
}
