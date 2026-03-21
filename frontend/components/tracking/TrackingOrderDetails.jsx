const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Accepted' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup' },
  { key: 'in_transit', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function TrackingOrderDetails({ order }) {
  if (!order) return (
    <div className="lg:col-span-3 flex flex-col gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-pulse">
        <div className="h-4 w-32 bg-slate-100 rounded mb-6" />
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-slate-50 rounded mb-4" />)}
      </div>
    </div>
  );

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="lg:col-span-3 flex flex-col gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Status Timeline</h3>
        <div className="space-y-0">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={step.key} className={`flex gap-4 ${i < STATUS_STEPS.length - 1 ? 'pb-8' : 'pb-2'} ${done ? 'border-l-2 border-[#a3f69c]' : 'border-l-2 border-dashed border-slate-300'} relative ml-3`}>
                <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center ${done ? 'bg-[#a3f69c]' : 'bg-white border-2 border-slate-300'}`}>
                  {done && <span className="material-symbols-outlined text-xs text-[#005312]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                  {active && !done && <div className="w-2 h-2 bg-[#00BFA5] rounded-full" />}
                </div>
                <div className="pl-4">
                  <p className={`text-sm font-bold leading-none ${active ? 'text-[#0d631b]' : done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                  {done && <p className="text-xs text-slate-500 mt-1">{new Date(order.updatedAt).toLocaleTimeString()}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {order.agent && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-[#0d631b] text-xl font-bold">
              {order.agent.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{order.agent.name}</h4>
              <p className="text-sm text-slate-500">{order.agent.phone || 'Delivery Agent'}</p>
            </div>
          </div>
          {order.agent.phone && (
            <a href={`tel:${order.agent.phone}`} className="w-full py-3 bg-[#007c6b] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-lg">call</span>
              Call Agent
            </a>
          )}
        </div>
      )}

      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Items</span>
          <span className="text-xs font-medium text-[#0d631b]">{order.items?.length} Items</span>
        </div>
        <ul className="space-y-3">
          {order.items?.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-slate-600">{item.name}</span>
              <span className="font-semibold text-slate-900">x{item.quantity} — Rs.{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold text-slate-900">
          <span>Total</span>
          <span>Rs.{order.total}</span>
        </div>
      </div>
    </div>
  );
}
