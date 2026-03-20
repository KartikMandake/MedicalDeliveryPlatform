import React from 'react';

const ProductVisualization = () => {
  return (
    <div className="lg:col-span-5 space-y-6">
      <div className="bg-surface-container-lowest rounded-xl p-8 aspect-square flex items-center justify-center relative overflow-hidden group">
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Refrigerated</span>
        </div>
        <img className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" alt="High quality pharmaceutical medicine box of Amoxicillin" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0WLQzbacwhazBcGU9MHO73eyQJC9fvFtxgXGO1Bd0M_7_yTfoI2-2LjWn02Bgbu91KFU6PGTIHrm6gyZJ47FE7iO3dyAMQyqS8a9ofAJV1OfLQa8D6QJL23-MBChw5E7ZyrKTsQCtThvuoqo6ENWVZ8TIydBYx3B7qHTChWOW6xfUcpFYw7ITfHp_l00OvwoVL-im7UbVKJVBHZ4zOmdRIPfnMoLJaWL4vJPQpmA6jjH8mZt9Uprviqeii_OKzhXF0-_l-xQHu3qw" />
      </div>
      
      {/* Trust Markers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low rounded-lg p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-700" data-icon="verified_user">verified_user</span>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Quality</p>
            <p className="text-xs font-semibold">Verified Pharmacy</p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-lg p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-700" data-icon="calendar_today">calendar_today</span>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Expiry</p>
            <p className="text-xs font-semibold">Exp: Dec 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVisualization;
