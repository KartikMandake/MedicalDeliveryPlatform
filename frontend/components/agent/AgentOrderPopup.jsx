import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/axios';

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
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-[#191c1e]/10 backdrop-blur-[2px]">
      <div className="w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#0d631b] px-8 py-6 text-white flex justify-between items-center">
          <div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">New Delivery Request</p>
            <h2 className="text-2xl font-extrabold">#{order.orderId || order.id}</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] uppercase font-bold">Total</p>
            <p className="text-xl font-extrabold">Rs.{order.total}</p>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">{order.items?.length || 0} item(s)</p>
            {order.items?.slice(0, 2).map((item, i) => (
              <p key={i} className="text-xs text-slate-500">- {item.name} x {item.quantity}</p>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#f2f4f7] rounded-xl">
            <span className="material-symbols-outlined text-[#006153]">location_on</span>
            <span className="text-xs font-medium text-[#40493d]">{order.deliveryCity || 'Delivery address on file'}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAccept} className="flex-1 py-4 bg-[#0d631b] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">Accept</button>
            <button onClick={() => setOrder(null)} className="px-6 py-4 bg-[#e6e8eb] text-[#40493d] font-bold rounded-2xl active:scale-95 transition-transform">Decline</button>
          </div>
        </div>
      </div>
    </div>
  );
}
