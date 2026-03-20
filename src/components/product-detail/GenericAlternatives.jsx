import React from 'react';

const GenericAlternatives = () => {
  return (
    <section className="mt-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-900 font-headline">Generic Alternatives</h2>
          <p className="text-on-surface-variant">Same composition, lower price points</p>
        </div>
        <button className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
          View All <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alternative Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-1 rounded">GENERIC</span>
            <span className="text-emerald-700 font-bold">$12.40</span>
          </div>
          <h4 className="font-bold text-lg mb-1">Amoxi-Pure 500</h4>
          <p className="text-xs text-on-surface-variant mb-4">By AlphaGen Labs</p>
          <button className="w-full py-2 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors">Add to Cart</button>
        </div>
        
        {/* Alternative Card 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-1 rounded">GENERIC</span>
            <span className="text-emerald-700 font-bold">$11.90</span>
          </div>
          <h4 className="font-bold text-lg mb-1">Cillin-Max</h4>
          <p className="text-xs text-on-surface-variant mb-4">By Global Pharma</p>
          <button className="w-full py-2 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors">Add to Cart</button>
        </div>
        
        {/* Alternative Card 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-1 rounded">GENERIC</span>
            <span className="text-emerald-700 font-bold">$14.00</span>
          </div>
          <h4 className="font-bold text-lg mb-1">Bacto-Shield 500</h4>
          <p className="text-xs text-on-surface-variant mb-4">By HealthFirst Inc.</p>
          <button className="w-full py-2 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors">Add to Cart</button>
        </div>
      </div>
    </section>
  );
};

export default GenericAlternatives;
