import { divIcon } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = divIcon({
  className: 'checkout-pin-icon',
  html: '<div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:16px;border-radius:9999px;background:#dc2626;border:2px solid #fff;box-shadow:0 0 0 6px rgba(239,68,68,0.18)"></div><span style="font-size:11px;font-weight:700;color:#7f1d1d;background:#fff;padding:2px 6px;border-radius:999px;border:1px solid #fecaca">Delivery Pin</span></div>',
  iconSize: [98, 24],
  iconAnchor: [12, 12],
});

function PinOnClick({ onPinChange }) {
  useMapEvents({
    click(event) {
      onPinChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function AddressPinMap({ latitude, longitude, onPinChange }) {
  const hasPinnedLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasPinnedLocation ? [latitude, longitude] : [20.5937, 78.9629];
  const zoom = hasPinnedLocation ? 16 : 5;

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden relative">
      <MapContainer
        key={hasPinnedLocation ? `${latitude}-${longitude}` : 'india-default'}
        center={center}
        zoom={zoom}
        className="h-64 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PinOnClick onPinChange={onPinChange} />
        {hasPinnedLocation && <Marker position={[latitude, longitude]} icon={pinIcon} />}
      </MapContainer>

      <div className="absolute top-3 left-3 px-3 py-2 bg-white/95 rounded-lg border border-zinc-200 text-[11px] font-semibold text-zinc-700">
        {hasPinnedLocation ? 'Delivery location pinned' : 'Tap map to drop delivery pin'}
      </div>
    </div>
  );
}
