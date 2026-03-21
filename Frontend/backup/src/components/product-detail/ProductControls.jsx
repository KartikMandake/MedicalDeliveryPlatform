import React from 'react';

const ProductControls = () => {
  return (
    <div className="lg:col-span-5 flex flex-col gap-8">
      <div className="space-y-2">
        <span className="text-secondary font-semibold text-sm tracking-wide">PFIZER CLINICAL SOLUTIONS</span>
        <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight leading-tight">Amoxiclav Precision 500mg</h1>
        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center text-amber-500">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0.5" }}>star_half</span>
          </div>
          <span className="text-sm font-medium text-zinc-500">(1,240 verified clinical reviews)</span>
        </div>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold text-on-surface">$42.50</span>
        <span className="text-zinc-400 line-through text-lg font-medium">$58.00</span>
        <span className="bg-primary-container/20 text-primary font-bold text-xs px-2 py-1 rounded-md">SAVE 25%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">In Stock - Ready for Express Delivery</span>
      </div>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1.5 border border-outline-variant/10">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all">
              <span className="material-symbols-outlined text-zinc-600">remove</span>
            </button>
            <span className="w-12 text-center font-bold text-lg">1</span>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all">
              <span className="material-symbols-outlined text-zinc-600">add</span>
            </button>
          </div>
          <button className="bg-emerald-800 flex-1 py-4 px-8 rounded-full text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-900 active:scale-95 transition-all shadow-lg shadow-emerald-800/20">
            <span className="material-symbols-outlined">shopping_bag</span>
            Add to Cart
          </button>
        </div>
      </div>
      {/* AI SUGGESTION BOX */}
      <div className="insight-glow rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          </div>
          <h4 className="font-headline font-bold text-sm tracking-tight text-on-surface">AI Health Intelligence Insight</h4>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">During current flu season trends, medical hubs frequently pair this medication with Vitamin C Complex for immune support.</p>
        <div className="flex gap-4 pt-2">
          <div className="flex-1 bg-white p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
            <img alt="Vitamin C" className="w-10 h-10 object-cover rounded-lg" data-alt="Orange vitamin capsules bottle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV6QQ8WKAPcM_si5RF50NQ9okB50r9gjSsxdO-Ker3SpCuZjUwl1LjNl9PPnlxDR408onL071TWixvxP07_bp_q-FPdu-SRAWiqhnzxrj07SttyAoQEyzsWvWCD3dfcZASJ1Tnm12TBXlmTRHGMQGc-CcZ24qz_6qEesVZxYr2VSpvYaglLMOln7WCjm8u6VZrFVODN7mougTv-s_s-uWNUHJOEYh3IDdSt2XKnlyHou2JLW9rs0LSdj2446TQX0WptwTn6iMKbD43"/>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary">RECOMMENDED</span>
              <span className="text-xs font-semibold">Vitamin C Hub</span>
            </div>
          </div>
          <div className="flex-1 bg-white p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
            <img alt="Nasal Spray" className="w-10 h-10 object-cover rounded-lg" data-alt="Nasal spray medical product" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHZgdMGXFr29ACSoW4EufiywGbRbvS2RRDitv35-4zF6dYjJ-j3wjoC9cnQ6GnoCpy-YFA3xaon0gvmMmwFUHX8aOiDp50FC19NQpFWiSSp_EFxpUIosrEZbFJoCfbmSBNuEkwOK-DlNi7Aia9DNPB45LlKMaXgpfHNdizVXb6LKfqMCoCjJ-OgY_ygwKBzzzzxNhAvBJmPj3rAh19KD9CX7Sgf-QbtuR3rrKXN8FOVd-qPBTC5HUdArbCZbvJ_aSiqfGBgH3489dI"/>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary">RECOMMENDED</span>
              <span className="text-xs font-semibold">Nasal Guard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductControls;
