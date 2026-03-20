export default function ProductsPagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-30"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${p === page ? 'bg-[#2E7D32] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          {p}
        </button>
      ))}
      {totalPages > 5 && <span className="px-2 text-slate-400">...</span>}
      {totalPages > 5 && (
        <button onClick={() => onPageChange(totalPages)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium">
          {totalPages}
        </button>
      )}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-30"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
