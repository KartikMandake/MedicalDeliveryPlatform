import React from 'react';

const GenericAlternatives = () => {
  return (
    <section className="mt-24 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight">Generic Alternatives</h2>
          <p className="text-zinc-500 text-sm mt-1">Same clinical composition, optimized value points.</p>
        </div>
        <a className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all" href="#">
          View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x">
        {/* Alt Card 1 */}
        <div className="min-w-[280px] bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 snap-start group">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Generic</span>
            <span className="text-lg font-bold">$12.40</span>
          </div>
          <div className="space-y-1 mb-6">
            <h4 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">Amoxi-Pure 500</h4>
            <p className="text-xs text-zinc-400">By AlphaGen Labs</p>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all">
            Add to Cart
          </button>
        </div>
        {/* Alt Card 2 */}
        <div className="min-w-[280px] bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 snap-start group">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Generic</span>
            <span className="text-lg font-bold">$11.90</span>
          </div>
          <div className="space-y-1 mb-6">
            <h4 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">Cillin-Max</h4>
            <p className="text-xs text-zinc-400">By Global Pharma</p>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all">
            Add to Cart
          </button>
        </div>
        {/* Alt Card 3 */}
        <div className="min-w-[280px] bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 snap-start group">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Generic</span>
            <span className="text-lg font-bold">$14.00</span>
          </div>
          <div className="space-y-1 mb-6">
            <h4 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">Bacto-Shield 500</h4>
            <p className="text-xs text-zinc-400">By HealthFirst Inc.</p>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all">
            Add to Cart
          </button>
        </div>
        {/* Alt Card 4 */}
        <div className="min-w-[280px] bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 snap-start group">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Generic</span>
            <span className="text-lg font-bold">$13.50</span>
          </div>
          <div className="space-y-1 mb-6">
            <h4 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">Nu-Amox Clav</h4>
            <p className="text-xs text-zinc-400">By Precision Bio</p>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all">
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default GenericAlternatives;
