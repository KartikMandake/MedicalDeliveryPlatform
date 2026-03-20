export default function TrackingMap({ tracking }) {
  const defaultLat = 12.9716;
  const defaultLng = 77.5946;
  const lat = Number(tracking?.agent_lat ?? defaultLat);
  const lng = Number(tracking?.agent_lng ?? defaultLng);
  const delta = 0.02;

  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const externalMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;
  const deliveryAddress = tracking?.delivery_address || {};
  const destinationLabel = [deliveryAddress.line1, deliveryAddress.city, deliveryAddress.pincode]
    .filter(Boolean)
    .join(', ');
  const lastPingLabel = tracking?.agent_last_ping
    ? new Date(tracking.agent_last_ping).toLocaleTimeString()
    : 'Unavailable';
  const trackingModeLabel = (tracking?.tracking_mode || 'status_only').replaceAll('_', ' ');

  return (
    <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden min-h-[500px] relative shadow-sm border border-slate-200">
      <div className="absolute inset-0 bg-slate-100">
        <iframe
          title="Live tracking map"
          src={embedSrc}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:text-[#0d631b] transition-colors"
          title="Open map"
        >
          <span className="material-symbols-outlined">open_in_new</span>
        </a>
      </div>
      <div className="absolute top-6 left-6 backdrop-blur-md px-4 py-3 rounded-lg border border-white/50 shadow-sm bg-white/90 max-w-[320px]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination</p>
        <p className="text-xs font-semibold text-slate-800 mt-1">{destinationLabel || 'Address unavailable in record'}</p>
      </div>
      <div className="absolute top-24 left-6 flex flex-col gap-2 max-w-[320px]">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 shadow-sm flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Tracking Mode</span>
          <span className="text-xs font-bold text-slate-800 capitalize">{trackingModeLabel}</span>
        </div>
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 shadow-sm flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Agent Last Ping</span>
          <span className="text-xs font-bold text-slate-800">{lastPingLabel}</span>
        </div>
        <div className="bg-[#0d631b] text-white px-4 py-2 rounded-lg shadow-sm flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold tracking-wider uppercase">Agent Coordinates</span>
          <span className="text-xs font-bold tracking-tight">
            {tracking?.agent_lat && tracking?.agent_lng ? `Agent at ${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Showing default service area'}
          </span>
        </div>
      </div>
    </div>
  );
}
