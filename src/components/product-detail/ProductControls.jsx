import React from 'react';

const ProductControls = () => {
  return (
    <div className="lg:col-span-7">
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-error-container text-on-error-container px-3 py-1 rounded-full mb-4">
            <span className="material-symbols-outlined text-sm" data-icon="description">description</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Prescription Required</span>
          </div>
          <h1 className="text-4xl font-extrabold text-emerald-900 font-headline mb-2 leading-tight">Amoxicillin 500mg</h1>
          <p className="text-on-surface-variant font-medium text-lg">Hard Gelatin Capsules • Strip of 10</p>
        </div>
        
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-bold text-emerald-900">$18.50</span>
          <span className="text-on-surface-variant line-through text-lg">$24.00</span>
          <span className="text-primary-container font-bold text-sm bg-primary-fixed px-2 py-0.5 rounded">25% OFF</span>
        </div>
        
        {/* Delivery Check */}
        <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/15">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-700" data-icon="location_on">location_on</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Check Delivery</span>
              <span className="text-sm font-semibold">Enter Pincode</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input className="w-24 bg-surface-container-lowest border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20" placeholder="10001" type="text" />
            <button className="text-primary font-bold text-sm px-3">Check</button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <div className="flex items-center bg-surface-container-highest rounded-full p-1 border border-outline-variant/20">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all">-</button>
            <span className="w-12 text-center font-bold">1</span>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all">+</button>
          </div>
          <button className="flex-1 min-w-[200px] py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all">
            Add to Cart
          </button>
        </div>
      </div>
      
      {/* Tabs/Details Section handled separately in ProductTabs */}
    </div>
  );
};

export default ProductControls;
