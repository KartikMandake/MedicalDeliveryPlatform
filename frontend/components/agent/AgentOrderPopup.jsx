import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/axios';

function formatFullAddress(addr) {
  if (!addr) return 'Address on file';
  const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
  return parts.join(', ') || 'Address on file';
}

export default function AgentOrderPopup() {
  const [order, setOrder] = useState(null);
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('join_role', 'agent');
    socket.on('new_delivery', (newOrder) => setOrder(newOrder));
    return () => { socket.off('new_delivery'); };
  }, [socketRef]);

  if (!order) return null;

  const handleAccept = async () => {
    await api.put(`/agent/deliveries/${order.id}/accept`);
    setOrder(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200/60 animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500/20 blur-[30px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">New Dispatch Alert</p>
            <h2 className="text-2xl font-extrabold font-headline tracking-tight">#{order.orderId || order.id}</h2>
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
            <p className="text-[9px] font-black uppercase text-slate-400">Total</p>
            <p className="text-xl font-black font-headline text-emerald-400">₹{Number(order.total || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Customer Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg uppercase shrink-0">
              {order.customerName?.slice(0, 2) || 'CU'}
            </div>
            <div>
              <p className="font-extrabold text-slate-900">{order.customerName || 'Customer'}</p>
              {order.customerPhone && <p className="text-xs font-bold text-emerald-600">{order.customerPhone}</p>}
            </div>
          </div>

          {/* Items */}
          {(order.items?.length || 0) > 0 && (
            <div className="bg-[#f8f9fa] rounded-xl border border-slate-200/60 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Items ({order.items.length})</p>
              <div className="space-y-1.5">
                {order.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="font-black text-slate-900">x{item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 4 && <p className="text-[10px] text-slate-500 font-bold">+{order.items.length - 4} more items</p>}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="flex items-start gap-3 bg-[#f8f9fa] rounded-xl border border-slate-200/60 p-4">
            <span className="material-symbols-outlined text-rose-400 text-[18px] mt-0.5 shrink-0">location_on</span>
            <div className="text-xs">
              <p className="font-extrabold text-slate-800">{order.deliveryAddress?.fullName || order.customerName || 'Customer'}</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{formatFullAddress(order.deliveryAddress)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleAccept}
              className="flex-1 py-4 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check</span> Accept Delivery
            </button>
            <button onClick={() => setOrder(null)}
              className="px-6 py-4 bg-slate-100 text-slate-700 font-extrabold rounded-xl active:scale-95 transition-all cursor-pointer hover:bg-slate-200">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
