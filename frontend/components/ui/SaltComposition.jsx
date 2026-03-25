import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SaltComposition({ saltName, format = 'table', className = '' }) {
  const navigate = useNavigate();

  if (!saltName) return null;

  if (typeof saltName === 'string' && saltName.includes('<table')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(saltName, 'text/html');
      const rows = Array.from(doc.querySelectorAll('tr'));
      
      const composition = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return {
          name: cells[0]?.textContent || '',
          amount: cells[1]?.textContent || ''
        };
      }).filter(item => item.name);

      if (format === 'text') {
        return (
          <span className={className}>
            {composition.map(c => `${c.name} (${c.amount})`).join(' · ')}
          </span>
        );
      }

      return (
        <div className={`mt-4 bg-gradient-to-br from-white to-zinc-50 border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm ${className}`}>
          <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/30 border-b border-emerald-100/50 flex justify-between items-center">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">biotech</span>
              </div>
              Active Composition
            </h4>
            <span className="text-[10px] font-bold text-emerald-600/70 bg-emerald-100/50 px-2 py-0.5 rounded-full">{composition.length} items</span>
          </div>
          <div className="divide-y divide-zinc-100/80 p-1.5">
            {composition.map((item, idx) => (
              <div 
                key={idx} 
                className="group flex items-center justify-between px-4 py-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products?search=${encodeURIComponent(item.name)}`);
                }}
                title={`View all products containing ${item.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-200 group-hover:bg-emerald-500 group-hover:scale-125 transition-all shadow-sm"></div>
                  <span className="text-sm font-bold text-zinc-800 group-hover:text-emerald-700 transition-colors group-hover:underline underline-offset-2 decoration-emerald-200">{item.name}</span>
                </div>
                <div className="relative flex items-center gap-3">
                  <span className="relative z-10 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 shadow-sm group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-colors tracking-wide">
                    {item.amount}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-emerald-500 transition-colors group-hover:translate-x-1">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      console.error("Failed to parse saltName HTML", e);
    }
  }

  return (
    <span className={format === 'text' ? className : `text-xs text-on-surface-variant block mt-1 ${className}`}>
      {saltName}
    </span>
  );
}
