import { divIcon } from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const agentIcon = divIcon({
  className: 'tracking-agent-icon',
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#16a34a;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(34,197,94,0.2)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const destinationIcon = divIcon({
  className: 'tracking-destination-icon',
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#dc2626;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(239,68,68,0.2)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function TrackingMap({ agentLocation, destinationLocation }) {
  const agentLat = toNumber(agentLocation?.lat);
  const agentLng = toNumber(agentLocation?.lng);
  const destLat = toNumber(destinationLocation?.lat);
  const destLng = toNumber(destinationLocation?.lng);

  const hasAgent = Number.isFinite(agentLat) && Number.isFinite(agentLng);
  const hasDestination = Number.isFinite(destLat) && Number.isFinite(destLng);

  if (!hasDestination && !hasAgent) {
    return (
      <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden min-h-[500px] relative shadow-sm border border-slate-200 flex items-center justify-center">
        <p className="text-sm text-slate-500">Map is waiting for location coordinates.</p>
      </div>
    );
  }

  const center = hasAgent ? [agentLat, agentLng] : [destLat, destLng];
  const polyline = hasAgent && hasDestination ? [[agentLat, agentLng], [destLat, destLng]] : [];

  return (
    <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden min-h-[500px] relative shadow-sm border border-slate-200">
      <MapContainer key={`${center[0]}-${center[1]}-${hasDestination ? 'dest' : 'no-dest'}`} center={center} zoom={13} className="h-[500px] w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasAgent && <Marker position={[agentLat, agentLng]} icon={agentIcon} />}
        {hasDestination && <Marker position={[destLat, destLng]} icon={destinationIcon} />}
        {polyline.length > 0 && <Polyline positions={polyline} color="#0d631b" weight={4} opacity={0.8} />}
      </MapContainer>

      <div className="absolute top-4 left-4 bg-white/95 px-3 py-2 rounded-lg border border-white/70 shadow-sm text-xs font-semibold text-slate-700">
        {hasAgent ? `Agent: ${agentLat.toFixed(5)}, ${agentLng.toFixed(5)}` : 'Waiting for agent location'}
      </div>
      <div className="absolute top-16 left-4 bg-white/95 px-3 py-2 rounded-lg border border-white/70 shadow-sm text-xs font-semibold text-slate-700">
        {hasDestination ? `Delivery: ${destLat.toFixed(5)}, ${destLng.toFixed(5)}` : 'Delivery location not pinned'}
      </div>
    </div>
  );
}
