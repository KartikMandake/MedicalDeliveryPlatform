import React from 'react';

const ProductTabs = () => {
  return (
    <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Composition Section */}
      <div className="bg-surface-container-low rounded-3xl p-8 space-y-4 border border-outline-variant/10">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-primary">biotech</span>
        </div>
        <h3 className="font-headline font-extrabold text-xl tracking-tight">Composition</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <span className="text-sm text-zinc-600">Amoxicillin Trihydrate</span>
            <span className="text-sm font-bold">500mg</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <span className="text-sm text-zinc-600">Potassium Clavulanate</span>
            <span className="text-sm font-bold">125mg</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <span className="text-sm text-zinc-600">Magnesium Stearate</span>
            <span className="text-sm font-bold">2.5mg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Gelatin Shell</span>
            <span className="text-sm font-bold">q.s.</span>
          </div>
        </div>
      </div>
      <div className="bg-surface-container-low rounded-3xl p-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-primary">medical_services</span>
        </div>
        <h3 className="font-headline font-extrabold text-xl tracking-tight">Primary Uses</h3>
        <ul className="text-sm text-zinc-600 space-y-2">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Upper respiratory infections</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Soft tissue clinical treatment</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Urinary tract bacterial control</li>
        </ul>
      </div>
      <div className="bg-surface-container-low rounded-3xl p-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-primary">warning</span>
        </div>
        <h3 className="font-headline font-extrabold text-xl tracking-tight">Side Effects</h3>
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-zinc-500 border border-outline-variant/30 uppercase tracking-widest">Nausea</span>
          <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-zinc-500 border border-outline-variant/30 uppercase tracking-widest">Dizziness</span>
          <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-zinc-500 border border-outline-variant/30 uppercase tracking-widest">Skin Rash</span>
        </div>
        <p className="text-xs text-zinc-500 pt-2 italic">Consult your medical hub immediately if severe allergic reactions occur.</p>
      </div>
      {/* Mandatory Guidelines */}
      <div className="lg:col-span-3 bg-primary text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-xs">info</span>
            Mandatory Guidelines
          </div>
          <h2 className="text-4xl font-extrabold font-headline leading-tight">Precision Dosage Instructions</h2>
          <p className="text-white/80 leading-relaxed max-w-xl">Take one capsule twice daily after meals, or as specifically dictated by your physician. Complete the full clinical course even if symptoms subside to ensure full bacterial eradication.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 min-w-[300px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-sm opacity-60">Frequency</span>
              <span className="font-bold">2x Daily</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-sm opacity-60">Administration</span>
              <span className="font-bold">Oral / Post-Meal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-60">Course Period</span>
              <span className="font-bold">7-10 Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
