import React from 'react';
import { useNavigate } from 'react-router-dom';

const stripHtml = (value) => {
  if (typeof value !== 'string') return String(value || '');
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const formatCompositionText = (composition, fallbackValue) => {
  const items = composition
    .map((item) => {
      const name = item.name?.trim();
      const amount = item.amount?.trim();

      if (!name) return '';
      return amount ? `${name} (${amount})` : name;
    })
    .filter(Boolean);

  if (items.length === 0) {
    return stripHtml(fallbackValue);
  }

  return items.join(' | ');
};

export default function SaltComposition({ saltName, format = 'table', className = '' }) {
  const navigate = useNavigate();

  if (!saltName) return null;

  if (typeof saltName === 'string' && saltName.includes('<table')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(saltName, 'text/html');
      const rows = Array.from(doc.querySelectorAll('tr'));

      const composition = rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll('td'));
          return {
            name: cells[0]?.textContent || '',
            amount: cells[1]?.textContent || '',
          };
        })
        .filter((item) => item.name);

      if (format === 'text') {
        return <span className={className}>{formatCompositionText(composition, saltName)}</span>;
      }

      return (
        <div className={`mt-4 overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50 shadow-sm ${className}`}>
          <div className="flex items-center justify-between border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50 to-teal-50/30 px-5 py-3.5">
            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-800">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 shadow-sm">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">biotech</span>
              </div>
              Active Composition
            </h4>
            <span className="rounded-full bg-emerald-100/50 px-2 py-0.5 text-[10px] font-bold text-emerald-600/70">{composition.length} items</span>
          </div>
          <div className="divide-y divide-zinc-100/80 p-1.5">
            {composition.map((item, idx) => (
              <div
                key={idx}
                className="group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 hover:bg-white hover:shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products?search=${encodeURIComponent(item.name)}`);
                }}
                title={`View all products containing ${item.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-200 shadow-sm transition-all group-hover:scale-125 group-hover:bg-emerald-500" />
                  <span className="text-sm font-bold text-zinc-800 decoration-emerald-200 underline-offset-2 transition-colors group-hover:text-emerald-700 group-hover:underline">
                    {item.name}
                  </span>
                </div>
                <div className="relative flex items-center gap-3">
                  <span className="relative z-10 rounded-lg border border-emerald-100/50 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold tracking-wide text-emerald-700 shadow-sm transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-100">
                    {item.amount}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-zinc-400 transition-colors group-hover:translate-x-1 group-hover:text-emerald-500">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      console.error('Failed to parse saltName HTML', e);
    }
  }

  return (
    <span className={format === 'text' ? className : `mt-1 block text-xs text-on-surface-variant ${className}`}>
      {format === 'text' ? stripHtml(saltName) : saltName}
    </span>
  );
}
