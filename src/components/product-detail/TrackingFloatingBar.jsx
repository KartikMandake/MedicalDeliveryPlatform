import React from 'react';

const TrackingFloatingBar = () => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-emerald-900/90 backdrop-blur-md rounded-full px-6 py-4 shadow-2xl flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed">local_shipping</span>
          <div>
            <p className="text-[10px] font-bold uppercase text-primary-fixed/70 leading-none mb-1">Active Shipment</p>
            <p className="text-sm font-bold">Arriving in 14 mins</p>
          </div>
        </div>
        <button className="bg-white text-emerald-900 px-4 py-1.5 rounded-full text-xs font-bold hover:scale-105 transition-transform">
          Live Map
        </button>
      </div>
    </div>
  );
};

export default TrackingFloatingBar;
