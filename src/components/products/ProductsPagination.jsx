export default function ProductsPagination() {
  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2E7D32] text-white font-bold">1</button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium">2</button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium">3</button>
      <span className="px-2 text-slate-400">...</span>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium">20</button>
      <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
