const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Accepted' },
  { key: 'packing', label: 'Packed' },
  { key: 'in_transit', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER = {
  placed: 0,
  confirmed: 1,
  packing: 2,
  ready: 2,
  picked_up: 3,
  in_transit: 3,
  delivered: 4,
  cancelled: 4,
};

export default function TrackingOrderDetails({ tracking }) {
  const currentStepIndex = STATUS_ORDER[tracking?.status] ?? 0;
  const pingLabel = tracking?.agent_last_ping
    ? `${new Date(tracking.agent_last_ping).toLocaleTimeString()} (server ping)`
    : 'Unavailable';

  const timelineTimeByStep = {
    placed: tracking?.placed_at ? new Date(tracking.placed_at).toLocaleTimeString() : 'Unavailable',
    confirmed: currentStepIndex > 0 ? 'Reached (timestamp unavailable)' : 'Not reached yet',
    packing: currentStepIndex > 1 ? 'Reached (timestamp unavailable)' : 'Not reached yet',
    in_transit: tracking?.agent_last_ping
      ? `Agent ping ${pingLabel}`
      : currentStepIndex > 2
        ? 'Reached (no live ping)'
        : 'Not reached yet',
    delivered: tracking?.delivered_at ? new Date(tracking.delivered_at).toLocaleTimeString() : 'Not delivered yet',
  };

  const agentInitials = (tracking?.agent_name || 'NA')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const deliveryAddress = tracking?.delivery_address || {};
  const destinationLabel = [deliveryAddress.line1, deliveryAddress.city, deliveryAddress.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="lg:col-span-3 flex flex-col gap-5">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-headline font-bold text-slate-900">Status Timeline</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live</span>
        </div>
        <div className="space-y-0">
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isLast = index === ORDER_STEPS.length - 1;
            const leftBorder = isCompleted ? 'border-[#a3f69c]' : 'border-dashed border-slate-300';

            return (
              <div key={step.key} className={`flex gap-3 ${isLast ? 'pb-1' : 'pb-6'} border-l-2 ${leftBorder} relative ml-2.5`}>
                <div
                  className={`absolute -left-[9px] top-0 w-4.5 h-4.5 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-[#a3f69c]' : isCurrent ? 'bg-white border-2 border-[#00BFA5]' : 'bg-slate-100 border border-slate-300'
                  }`}
                >
                  {isCompleted && (
                    <span className="material-symbols-outlined text-[11px] text-[#005312]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  )}
                  {isCurrent && (
                    <>
                      <div className="w-1.5 h-1.5 bg-[#00BFA5] rounded-full pulse-ring"></div>
                      <div className="w-1.5 h-1.5 bg-[#00BFA5] rounded-full z-10"></div>
                    </>
                  )}
                </div>
                <div className="pl-3">
                  <p className={`text-[13px] leading-none ${isCompleted || isCurrent ? 'font-bold text-slate-900' : 'font-medium text-slate-500 opacity-60'}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {timelineTimeByStep[step.key]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-100 ring-2 ring-emerald-50 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
            {agentInitials}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900 text-sm truncate">{tracking?.agent_name || 'Agent Not Assigned'}</h4>
              <p className="text-slate-500 text-[11px] truncate">{tracking?.agent_id || 'Unavailable'}</p>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tracking?.agent_online ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {tracking?.agent_online ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Details</span>
          <span className="text-xs font-medium text-[#0d631b]">Live from order</span>
        </div>
        <ul className="space-y-3">
          <li className="flex justify-between text-sm gap-3">
            <span className="text-slate-600">Destination</span>
            <span className="font-semibold text-slate-900 text-right">{destinationLabel || 'Unavailable'}</span>
          </li>
          <li className="flex justify-between text-sm">
            <span className="text-slate-600">Tracking mode</span>
            <span className="font-semibold text-slate-900">{tracking?.tracking_mode || 'status_only'}</span>
          </li>
          <li className="flex justify-between text-sm">
            <span className="text-slate-600">Agent online</span>
            <span className="font-semibold text-slate-900">{tracking?.agent_online ? 'Yes' : 'No'}</span>
          </li>
          <li className="flex justify-between text-sm">
            <span className="text-slate-600">Last ping</span>
            <span className="font-semibold text-slate-900">{pingLabel}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
