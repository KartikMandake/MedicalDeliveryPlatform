export default function ProductsPagination() {
  return (
    <div className="mt-14 flex justify-center">
      <button className="flex items-center gap-2 px-9 py-3.5 bg-white border border-zinc-200 rounded-full text-sm font-semibold text-on-surface hover:bg-zinc-50 hover:border-primary/30 transition-all active:scale-95 group">
        <span>Load More Products</span>
        <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary transition-colors">expand_more</span>
      </button>
    </div>
  );
}
