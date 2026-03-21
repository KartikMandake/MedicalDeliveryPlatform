import { Icon } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const pinIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
    <div className="rounded-xl border border-zinc-200 overflow-hidden">
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
    </div>
  );
}
