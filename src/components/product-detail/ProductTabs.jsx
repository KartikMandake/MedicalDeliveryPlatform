import React from 'react';

const ProductTabs = () => {
  return (
    <div className="mt-12 space-y-10 lg:col-span-7">
      {/* Description Island */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold font-headline text-emerald-900 border-b-2 border-primary-container/20 pb-2 inline-block">Product Overview</h3>
        <p className="text-on-surface-variant leading-relaxed text-sm">
          Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract. Amoxicillin is also sometimes used together with another antibiotic called clarithromycin to treat stomach ulcers caused by Helicobacter pylori infection.
        </p>
      </section>
      
      {/* Bento Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
          <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">science</span> Composition
          </h4>
          <ul className="text-xs text-on-surface-variant space-y-2">
            <li className="flex justify-between"><span>Amoxicillin Trihydrate</span> <span className="font-bold">500mg</span></li>
            <li className="flex justify-between"><span>Magnesium Stearate</span> <span className="font-bold">2.5mg</span></li>
            <li className="flex justify-between"><span>Gelatin Shell</span> <span className="font-bold">q.s.</span></li>
          </ul>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
          <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span> Side Effects
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="bg-surface-container px-2 py-1 rounded text-[10px] font-medium">Nausea</span>
            <span className="bg-surface-container px-2 py-1 rounded text-[10px] font-medium">Diarrhea</span>
            <span className="bg-surface-container px-2 py-1 rounded text-[10px] font-medium">Skin Rash</span>
          </div>
        </div>
      </div>
      
      {/* Manufacturer */}
      <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-xl">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-emerald-900 font-bold">M</div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Manufacturer</p>
          <p className="text-sm font-bold">MediFlow Pharmaceuticals Ltd.</p>
          <p className="text-xs text-on-surface-variant">GMP Certified Facility, New Jersey, USA</p>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
