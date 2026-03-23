import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { updateOrderStatus, assignAgent } from '../../api/orders';

export default function IncomingOrderPopup() {
  const [order, setOrder] = useState(null);
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('join_role', 'retailer');
    socket.on('new_order', (newOrder) => setOrder(newOrder));
    return () => socket.off('new_order');
  }, [socketRef]);

  if (!order) return null;

  const handleAccept = async () => {
    await updateOrderStatus(order.id, 'preparing');
    await assignAgent(order.id);
    setOrder(null);
  };

  const handleDecline = async () => {
    await updateOrderStatus(order.id, 'cancelled');
    setOrder(null);
  };

  const firstItem = order.items?.[0];

  return (
    <div className="fixed top-24 right-8 z-50">
      <div className="w-80 bg-white/90 border border-emerald-100 shadow-2xl rounded-2xl overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="bg-[#2e7d32] text-[#cbffc2] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">New Order</span>
          <span className="text-xs text-slate-400 font-mono">#{order.orderId}</span>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0d631b] text-2xl">medical_services</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base leading-tight">{firstItem?.name || 'Medical Order'}</h4>
            <p className="text-xs text-slate-500">{order.items?.length} item(s) • Total: ₹{order.total}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleDecline} className="py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Decline</button>
          <button onClick={handleAccept} className="py-2.5 rounded-xl bg-[#0d631b] text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-lg">Accept</button>
        </div>
      </div>
    </div>
  );
}
