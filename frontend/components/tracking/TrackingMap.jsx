import { divIcon, latLngBounds } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getShortestRoute } from '../../utils/mapRouting';

// Premium Map Icons
const agentIcon = divIcon({
  className: 'tracking-agent-icon bg-transparent border-0',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform:translateY(-10px);">
      <div style="background-color:#10b981; color:white; font-size:9px; font-weight:900; letter-spacing:1px; text-transform:uppercase; padding:4px 8px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom:4px; border:1px solid #059669; white-space:nowrap;">
        Courier
      </div>
      <div style="position:relative; width:20px; height:20px;">
        <div style="position:absolute; inset:0; background-color:#10b981; border-radius:9999px; opacity:0.3; animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position:absolute; inset:2px; background-color:#059669; border:2px solid white; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
      </div>
    </div>
  `,
  iconSize: [60, 40],
  iconAnchor: [30, 20],
});

const destinationIcon = divIcon({
  className: 'tracking-destination-icon bg-transparent border-0',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform:translateY(-10px);">
      <div style="background-color:#0f172a; color:white; font-size:9px; font-weight:900; letter-spacing:1px; text-transform:uppercase; padding:4px 8px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2); margin-bottom:4px; white-space:nowrap;">
        Destination
      </div>
      <div style="width:16px; height:16px; background-color:#334155; border:3px solid white; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [80, 40],
  iconAnchor: [40, 20],
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
      <div className="lg:col-span-7 bg-white rounded-[1.5rem] overflow-hidden h-[400px] lg:h-[600px] relative shadow-sm border border-slate-200/60 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl max-w-sm">
           <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">explore_off</span>
           <p className="text-sm font-bold text-slate-700 font-headline mb-1">Awaiting Telemetry</p>
           <p className="text-xs text-slate-500 leading-relaxed font-medium">Map intelligence is currently parsing location coordinates. Usually resolves within 30 seconds.</p>
        </div>
      </div>
    );
  }

  const center = hasAgent ? [agentLat, agentLng] : [destLat, destLng];
  const polyline = routePoints.length > 1 ? routePoints : [];

  return (
    <div className="lg:col-span-7 bg-white rounded-[1.5rem] overflow-hidden min-h-[400px] lg:h-[600px] relative shadow-sm border border-slate-200/60 group">
      {/* CSS injection to subtly style the OSM tiles to look slightly more premium without changing the provider */}
      <style>{`
        .leaflet-layer { filter: saturate(0.8) contrast(1.1) brightness(1.05); }
      `}</style>
      
      <MapContainer key={`${center[0]}-${center[1]}-${hasDestination ? 'dest' : 'no-dest'}`} center={center} zoom={14} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polyline.length > 1 && <FitRouteBounds points={polyline} />}
        {hasAgent && <Marker position={[agentLat, agentLng]} icon={agentIcon} />}
        {hasDestination && <Marker position={[destLat, destLng]} icon={destinationIcon} />}
        {/* Pulsing Trail / Route Line */}
        {polyline.length > 1 && (
          <>
            <Polyline positions={polyline} color="#10b981" weight={6} opacity={0.8} className="drop-shadow-lg" />
            <Polyline positions={polyline} color="#059669" weight={2} opacity={1} />
          </>
        )}
      </MapContainer>

      {/* Modern HUD overlays */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-xl border border-white/50 shadow-lg text-xs font-bold text-slate-800 space-y-3 min-w-[180px]">
          <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200/60 pb-2">Map Legend</h5>
          <div className="flex justify-between items-center gap-4">
             <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" /> Courier</span>
             <span className="text-[10px] text-slate-400 font-mono tracking-tighter">LIVE</span>
          </div>
          <div className="flex justify-between items-center gap-4">
             <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-800 border border-slate-900" /> Objective</span>
             <span className="text-[10px] text-slate-400 font-mono tracking-tighter">STATIC</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 transition-transform duration-300 translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl min-w-[200px] text-white">
          {routing ? (
            <div className="flex items-center gap-3">
               <span className="w-5 h-5 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></span>
               <p className="text-xs font-bold tracking-wide">Calculating vector...</p>
            </div>
          ) : routeInfo.usedRouting ? (
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/80 mb-1">Route Distance</p>
                <div className="flex items-baseline gap-1">
                   <p className="text-2xl font-black font-headline tracking-tighter">{routeInfo.distanceKm}</p>
                   <p className="text-xs font-bold text-slate-400">km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/80 mb-1">Traversing ETA</p>
                <div className="flex items-baseline gap-1 justify-end">
                   <p className="text-2xl font-black font-headline tracking-tighter">~{routeInfo.durationMin}</p>
                   <p className="text-xs font-bold text-slate-400">min</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <span className="material-symbols-outlined text-rose-400 text-[18px]">signal_disconnected</span>
               <p className="text-xs font-bold text-slate-300">Awaiting routing data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
