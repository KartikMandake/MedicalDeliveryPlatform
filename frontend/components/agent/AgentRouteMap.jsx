import { divIcon } from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const agentIcon = divIcon({
  className: 'agent-map-agent-icon',
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#16a34a;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(34,197,94,0.25)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const pickupIcon = divIcon({
  className: 'agent-map-pickup-icon',
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#0f766e;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(20,184,166,0.2)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const dropIcon = divIcon({
  className: 'agent-map-drop-icon',
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#dc2626;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(239,68,68,0.2)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AgentRouteMap({ agentLocation, pickupLocation, dropLocation }) {
  const agentLat = toNumber(agentLocation?.lat);
  const agentLng = toNumber(agentLocation?.lng);
  const pickupLat = toNumber(pickupLocation?.lat);
  const pickupLng = toNumber(pickupLocation?.lng);
  const dropLat = toNumber(dropLocation?.lat);
  const dropLng = toNumber(dropLocation?.lng);

  const hasAgent = Number.isFinite(agentLat) && Number.isFinite(agentLng);
  const hasPickup = Number.isFinite(pickupLat) && Number.isFinite(pickupLng);
  const hasDrop = Number.isFinite(dropLat) && Number.isFinite(dropLng);

  if (!hasAgent && !hasPickup && !hasDrop) {
    return (
      <div className="h-[320px] rounded-xl border border-zinc-200/60 bg-zinc-100 flex items-center justify-center text-sm text-slate-500">
        Waiting for route coordinates.
      </div>
    );
  }

  const center = hasAgent
    ? [agentLat, agentLng]
    : hasPickup
      ? [pickupLat, pickupLng]
      : [dropLat, dropLng];

  const routePoints = [];
  if (hasAgent) routePoints.push([agentLat, agentLng]);
  if (hasPickup) routePoints.push([pickupLat, pickupLng]);
  if (hasDrop) routePoints.push([dropLat, dropLng]);

  return (
    <div className="h-[320px] rounded-xl border border-zinc-200/60 overflow-hidden">
      <MapContainer key={`${center[0]}-${center[1]}-${routePoints.length}`} center={center} zoom={13} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasAgent && <Marker position={[agentLat, agentLng]} icon={agentIcon} />}
        {hasPickup && <Marker position={[pickupLat, pickupLng]} icon={pickupIcon} />}
        {hasDrop && <Marker position={[dropLat, dropLng]} icon={dropIcon} />}
        {routePoints.length > 1 && <Polyline positions={routePoints} color="#006e2f" weight={4} opacity={0.85} />}
      </MapContainer>
    </div>
  );
}
