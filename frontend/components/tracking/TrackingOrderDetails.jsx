import React from 'react';

export default function TrackingOrderDetails({ order, status }) {
  if (!order) {
    return (
      <div className="lg:col-span-5 flex flex-col gap-6 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded mb-8" />
          <div className="flex gap-4 mb-8">
             <div className="w-16 h-16 bg-slate-200 rounded-full" />
             <div className="flex-1 space-y-2 py-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
             </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded-xl mb-3" />)}
        </div>
      </div>
    );
  }

  const isDelivered = status === 'delivered';

  return (
    <aside className="lg:col-span-5 flex flex-col gap-6 w-full relative z-10">
      
      {/* Agent Card */}
      {order.agent ? (
        <div className="bg-white p-6 rounded-[1.5rem] shadow-xl border border-emerald-100/50 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center text-emerald-700 text-2xl font-extrabold uppercase shrink-0 z-10 relative">
                {order.agent.name?.slice(0, 2)}
              </div>
              {!isDelivered && (
                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full z-20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Assigned Telemetry Agent</p>
              <h4 className="font-extrabold font-headline text-slate-900 text-lg leading-tight truncate">{order.agent.name}</h4>
              <p className="text-sm font-medium text-slate-500 mt-0.5">{isDelivered ? 'Delivery Complete' : 'En Route to Destination'}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 relative z-10">
            {order.agent.phone ? (
              <a href={`tel:${order.agent.phone}`} className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined text-[18px]">call</span>
                Contact Courier
              </a>
            ) : (
              <button disabled className="flex-1 py-3.5 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]">call_off</span>
                Contact Unavailable
              </button>
            )}
            <button className="w-14 h-14 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-white hover:text-emerald-600 transition-colors shadow-sm">
               <span className="material-symbols-outlined text-[20px]">chat</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-200 border-dashed flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-slate-400">person_search</span>
           </div>
           <div>
             <h4 className="font-bold text-slate-700 text-sm">Assigning Courier</h4>
             <p className="text-xs text-slate-500 mt-1">Locating the nearest fulfillment agent...</p>
           </div>
        </div>
      )}

      {/* Modern Receipt Card */}
      <div className="bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm relative">
        {/* Receipt perforations decoration */}
        <div className="absolute top-0 left-4 right-4 h-1.5 flex justify-evenly overflow-hidden opacity-50">
          {Array.from({length: 20}).map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-100 -mt-1" />)}
        </div>

        <div className="flex justify-between items-center mb-6 pt-2">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">receipt_long</span>
            Digital Ledger
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded">
             {order.items?.length || 0} Assets
          </span>
        </div>
        
        <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 mb-6">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-start text-sm group">
              <div className="flex-1 pr-4">
                 <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors block">{item.name}</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5 block">Quantity: {String(item.quantity).padStart(2,'0')}</span>
              </div>
              <span className="font-black font-mono text-slate-900 tracking-tight">₹{Number(item.totalPrice || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="w-full h-[2px] border-t-2 border-dashed border-slate-200 mb-6"></div>
        
        <div className="space-y-3 mb-6">
           <div className="flex justify-between text-sm">
             <span className="text-slate-500 font-medium">Subtotal</span>
             <span className="font-bold text-slate-800">₹{(order.total - (order.taxes || 0)).toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-slate-500 font-medium">Estimated Tax</span>
             <span className="font-bold text-slate-800">₹{Number(order.taxes || 0).toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-sm bg-emerald-50 p-2 rounded-lg border border-emerald-100">
             <span className="text-emerald-700 font-bold">Delivery Fee</span>
             <span className="font-black text-emerald-600 uppercase tracking-widest text-[10px]">Free</span>
           </div>
        </div>

        <div className="flex justify-between items-end bg-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-[30px] rounded-full pointer-events-none" />
          <div className="relative z-10">
             <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Total Authorized</span>
             <span className="text-2xl font-black font-headline text-white tracking-tight leading-none">₹{Number(order.total || 0).toFixed(2)}</span>
          </div>
          <div className="relative z-10 text-right">
             <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest bg-emerald-900/50 px-2 py-1 rounded border border-emerald-500/30 font-mono">
                {order.paymentStatus === 'paid' ? 'PAID IN FULL' : 'PENDING'}
             </span>
          </div>
        </div>

      </div>
    </aside>
  );
}
