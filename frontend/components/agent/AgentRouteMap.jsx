import { divIcon, latLngBounds } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getShortestRoute } from '../../utils/mapRouting';

const agentIcon = divIcon({
  className: 'agent-map-agent-icon bg-transparent border-0',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform:translateY(-10px);">
      <div style="background-color:#0f172a; color:white; font-size:9px; font-weight:900; letter-spacing:1px; text-transform:uppercase; padding:4px 8px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom:4px; white-space:nowrap;">
        You
      </div>
      <div style="position:relative; width:20px; height:20px;">
        <div style="position:absolute; inset:0; background-color:#10b981; border-radius:9999px; opacity:0.3; animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position:absolute; inset:2px; background-color:#059669; border:2px solid white; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
      </div>
    </div>
  `,
  iconSize: [50, 40],
  iconAnchor: [25, 20],
});

const pickupIcon = divIcon({
  className: 'agent-map-pickup-icon bg-transparent border-0',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform:translateY(-10px);">
      <div style="background-color:#0891b2; color:white; font-size:9px; font-weight:900; letter-spacing:1px; text-transform:uppercase; padding:4px 8px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom:4px; white-space:nowrap;">
        Pickup
      </div>
      <div style="width:16px; height:16px; background-color:#0891b2; border:3px solid white; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [60, 40],
  iconAnchor: [30, 20],
});

const dropIcon = divIcon({
  className: 'agent-map-drop-icon bg-transparent border-0',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform:translateY(-10px);">
      <div style="background-color:#e11d48; color:white; font-size:9px; font-weight:900; letter-spacing:1px; text-transform:uppercase; padding:4px 8px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom:4px; white-space:nowrap;">
        Drop
      </div>
      <div style="width:16px; height:16px; background-color:#e11d48; border:3px solid white; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [55, 40],
  iconAnchor: [27, 20],
});

function FitRouteBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!Array.isArray(points) || points.length < 2) return;
    map.fitBounds(latLngBounds(points), { padding: [50, 50] });
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
      <div className="h-full w-full rounded-xl bg-slate-50 border border-slate-200/60 border-dashed flex items-center justify-center min-h-[320px]">
        <div className="text-center p-6">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">explore_off</span>
          <p className="text-sm font-bold text-slate-700 font-headline">Awaiting Coordinates</p>
          <p className="text-xs text-slate-500 mt-1">Accept a delivery to activate route mapping.</p>
        </div>
      </div>
    );
  }

  const center = hasAgent ? [agentLat, agentLng] : hasPickup ? [pickupLat, pickupLng] : [dropLat, dropLng];

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
    if (routePoints.length < 2) { setRoutePath(routePoints); setRouteInfo({ distanceKm: 0, durationMin: 0, usedRouting: false }); return () => controller.abort(); }
    setRouting(true);
    getShortestRoute(routePoints, controller.signal)
      .then((route) => { if (!mounted) return; setRoutePath(route.path || routePoints); setRouteInfo(route); })
      .finally(() => { if (mounted) setRouting(false); });
    return () => { mounted = false; controller.abort(); };
  }, [routePoints]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative min-h-[320px]">
      <style>{`.leaflet-layer { filter: saturate(0.8) contrast(1.1) brightness(1.05); }`}</style>
      <MapContainer key={`${center[0]}-${center[1]}-${routePoints.length}`} center={center} zoom={14} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {routePath.length > 1 && <FitRouteBounds points={routePath} />}
        {hasAgent && <Marker position={[agentLat, agentLng]} icon={agentIcon} />}
        {hasPickup && <Marker position={[pickupLat, pickupLng]} icon={pickupIcon} />}
        {hasDrop && <Marker position={[dropLat, dropLng]} icon={dropIcon} />}
        {routePath.length > 1 && (
          <>
            <Polyline positions={routePath} color="#10b981" weight={6} opacity={0.7} />
            <Polyline positions={routePath} color="#059669" weight={2} opacity={1} />
          </>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/80 backdrop-blur-xl p-3 rounded-xl border border-white/50 shadow-lg text-xs font-bold text-slate-800 space-y-2 min-w-[150px]">
          <h5 className="text-[8px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200/60 pb-1.5">Legend</h5>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" /> You</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-cyan-600 border border-cyan-700" /> Pickup</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500 border border-rose-600" /> Drop</div>
        </div>
      </div>

      {/* Route Info HUD */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl min-w-[180px] text-white">
          {routing ? (
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></span>
              <p className="text-xs font-bold">Calculating route...</p>
            </div>
          ) : routeInfo.usedRouting ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400/80 mb-0.5">Distance</p>
                <p className="text-xl font-black font-headline">{routeInfo.distanceKm} <span className="text-xs font-bold text-slate-400">km</span></p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400/80 mb-0.5">ETA</p>
                <p className="text-xl font-black font-headline">~{routeInfo.durationMin} <span className="text-xs font-bold text-slate-400">min</span></p>
              </div>
            </div>
          ) : (
            <p className="text-xs font-bold text-slate-400">Route preview mode</p>
          )}
        </div>
      </div>
    </div>
  );
}
