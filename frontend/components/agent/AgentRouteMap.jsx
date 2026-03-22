import { divIcon, latLngBounds } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getShortestRoute } from '../../utils/mapRouting';

const agentIcon = divIcon({
  className: 'agent-map-agent-icon',
  html: '<div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:16px;border-radius:9999px;background:#16a34a;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(34,197,94,0.25)"></div><span style="font-size:11px;font-weight:700;color:#065f46;background:#fff;padding:2px 6px;border-radius:999px;border:1px solid #d1fae5">You</span></div>',
  iconSize: [62, 24],
  iconAnchor: [12, 12],
});

const pickupIcon = divIcon({
  className: 'agent-map-pickup-icon',
  html: '<div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:16px;border-radius:9999px;background:#0f766e;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(20,184,166,0.2)"></div><span style="font-size:11px;font-weight:700;color:#115e59;background:#fff;padding:2px 6px;border-radius:999px;border:1px solid #ccfbf1">Pickup</span></div>',
  iconSize: [82, 24],
  iconAnchor: [12, 12],
});

const dropIcon = divIcon({
  className: 'agent-map-drop-icon',
  html: '<div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:16px;border-radius:9999px;background:#dc2626;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(239,68,68,0.2)"></div><span style="font-size:11px;font-weight:700;color:#7f1d1d;background:#fff;padding:2px 6px;border-radius:999px;border:1px solid #fecaca">Drop</span></div>',
  iconSize: [74, 24],
  iconAnchor: [12, 12],
});

function FitRouteBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(points) || points.length < 2) return;
    map.fitBounds(latLngBounds(points), { padding: [28, 28] });
  }, [map, points]);

  return null;
}

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
  const [routePath, setRoutePath] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distanceKm: 0, durationMin: 0, usedRouting: false });
  const [routing, setRouting] = useState(false);

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

  const routePoints = useMemo(() => {
    const points = [];
    if (hasAgent) points.push([agentLat, agentLng]);
    if (hasPickup) points.push([pickupLat, pickupLng]);
    if (hasDrop) points.push([dropLat, dropLng]);
    return points;
  }, [agentLat, agentLng, pickupLat, pickupLng, dropLat, dropLng, hasAgent, hasPickup, hasDrop]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    if (routePoints.length < 2) {
      setRoutePath(routePoints);
      setRouteInfo({ distanceKm: 0, durationMin: 0, usedRouting: false });
      return () => controller.abort();
    }

    setRouting(true);
    getShortestRoute(routePoints, controller.signal)
      .then((route) => {
        if (!mounted) return;
        setRoutePath(route.path || routePoints);
        setRouteInfo(route);
      })
      .finally(() => {
        if (mounted) setRouting(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [routePoints]);

  return (
    <div className="h-[320px] rounded-xl border border-zinc-200/60 overflow-hidden relative">
      <MapContainer key={`${center[0]}-${center[1]}-${routePoints.length}`} center={center} zoom={13} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routePath.length > 1 && <FitRouteBounds points={routePath} />}
        {hasAgent && <Marker position={[agentLat, agentLng]} icon={agentIcon} />}
        {hasPickup && <Marker position={[pickupLat, pickupLng]} icon={pickupIcon} />}
        {hasDrop && <Marker position={[dropLat, dropLng]} icon={dropIcon} />}
        {routePath.length > 1 && <Polyline positions={routePath} color="#006e2f" weight={4} opacity={0.85} />}
      </MapContainer>

      <div className="absolute mt-3 ml-3 px-3 py-2 rounded-lg bg-white/95 border border-zinc-200 text-[11px] font-semibold text-zinc-700">
        {routing ? 'Calculating shortest road route...' : routeInfo.usedRouting ? `Route ${routeInfo.distanceKm} km - ETA ~${routeInfo.durationMin} min` : 'Route preview mode'}
      </div>
    </div>
  );
}
