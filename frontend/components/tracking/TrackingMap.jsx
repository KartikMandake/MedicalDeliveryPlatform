import { divIcon, latLngBounds } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getShortestRoute } from '../../utils/mapRouting';

const agentIcon = divIcon({
  className: 'tracking-agent-icon',
  html: '<div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:18px;border-radius:9999px;background:#16a34a;border:2px solid #fff;box-shadow:0 0 0 6px rgba(34,197,94,0.22)"></div><span style="font-size:11px;font-weight:700;color:#065f46;background:#fff;padding:2px 6px;border-radius:999px;border:1px solid #d1fae5">Agent</span></div>',
  iconSize: [78, 24],
  iconAnchor: [12, 12],
});

const destinationIcon = divIcon({
  className: 'tracking-destination-icon',
  html: '<div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:18px;border-radius:9999px;background:#dc2626;border:2px solid #fff;box-shadow:0 0 0 6px rgba(239,68,68,0.2)"></div><span style="font-size:11px;font-weight:700;color:#7f1d1d;background:#fff;padding:2px 6px;border-radius:999px;border:1px solid #fecaca">You</span></div>',
  iconSize: [68, 24],
  iconAnchor: [12, 12],
});

function FitRouteBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(points) || points.length < 2) return;
    map.fitBounds(latLngBounds(points), { padding: [36, 36] });
  }, [map, points]);

  return null;
}

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
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distanceKm: 0, durationMin: 0, usedRouting: false });
  const [routing, setRouting] = useState(false);

  const rawPoints = useMemo(
    () => (hasAgent && hasDestination ? [[agentLat, agentLng], [destLat, destLng]] : []),
    [agentLat, agentLng, destLat, destLng, hasAgent, hasDestination]
  );

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    if (!(hasAgent && hasDestination)) {
      setRoutePoints([]);
      setRouteInfo({ distanceKm: 0, durationMin: 0, usedRouting: false });
      return () => controller.abort();
    }

    setRouting(true);
    getShortestRoute(rawPoints, controller.signal)
      .then((route) => {
        if (!mounted) return;
        setRoutePoints(route.path || rawPoints);
        setRouteInfo(route);
      })
      .finally(() => {
        if (mounted) setRouting(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [hasAgent, hasDestination, rawPoints]);

  if (!hasDestination && !hasAgent) {
    return (
      <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden min-h-[500px] relative shadow-sm border border-slate-200 flex items-center justify-center">
        <p className="text-sm text-slate-500">Map is waiting for location coordinates.</p>
      </div>
    );
  }

  const center = hasAgent ? [agentLat, agentLng] : [destLat, destLng];
  const polyline = routePoints.length > 1 ? routePoints : [];

  return (
    <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden min-h-[500px] relative shadow-sm border border-slate-200">
      <MapContainer key={`${center[0]}-${center[1]}-${hasDestination ? 'dest' : 'no-dest'}`} center={center} zoom={13} className="h-[500px] w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polyline.length > 1 && <FitRouteBounds points={polyline} />}
        {hasAgent && <Marker position={[agentLat, agentLng]} icon={agentIcon} />}
        {hasDestination && <Marker position={[destLat, destLng]} icon={destinationIcon} />}
        {polyline.length > 1 && <Polyline positions={polyline} color="#0d631b" weight={5} opacity={0.85} />}
      </MapContainer>

      <div className="absolute top-4 left-4 bg-white/95 px-3 py-2 rounded-lg border border-white/70 shadow-sm text-xs font-semibold text-slate-700 space-y-1">
        <p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Agent location</p>
        <p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Your address</p>
      </div>

      <div className="absolute top-4 right-4 bg-white/95 px-3 py-2 rounded-lg border border-white/70 shadow-sm text-xs font-semibold text-slate-700 min-w-[170px]">
        {routing ? (
          <p>Calculating best route...</p>
        ) : routeInfo.usedRouting ? (
          <>
            <p>Road route: {routeInfo.distanceKm} km</p>
            <p className="text-slate-500">ETA: ~{routeInfo.durationMin} min</p>
          </>
        ) : (
          <p>Road route unavailable right now.</p>
        )}
      </div>
    </div>
  );
}
