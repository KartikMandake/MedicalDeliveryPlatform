import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AddressPinMap from '../checkout/AddressPinMap';
import { getRetailerProfile, updateRetailerLocation } from '../../api/retailer';

const TOP_LINKS = [
  { to: '/retailer/dashboard', label: 'Global Overview' },
  { to: '/retailer/inventory', label: 'Inventory Hub' },
  { to: '/retailer/orders', label: 'Order Tracking' },
];

export default function RetailerTopNav() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationLat, setLocationLat] = useState(null);
  const [locationLng, setLocationLng] = useState(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const displayName = user?.name || user?.shopName || user?.shop_name || user?.email || 'Retailer';
  const displayInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'RT';

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        setIsLoadingLocation(true);
        const res = await getRetailerProfile();
        if (!mounted) return;
        const lat = Number(res.data?.lat);
        const lng = Number(res.data?.lng);
        setLocationLat(Number.isFinite(lat) ? lat : null);
        setLocationLng(Number.isFinite(lng) ? lng : null);
      } catch {
        // Keep nav usable even if profile fetch fails.
      } finally {
        if (mounted) setIsLoadingLocation(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not available in this browser.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLat(pos.coords.latitude);
        setLocationLng(pos.coords.longitude);
        showToast('Current location captured. Click Save to update store location.', 'info');
      },
      () => showToast('Unable to access your current location.', 'error'),
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  const handleSaveLocation = async () => {
    if (!Number.isFinite(locationLat) || !Number.isFinite(locationLng)) {
      showToast('Please pin a valid location first.', 'error');
      return;
    }
    try {
      setIsSavingLocation(true);
      await updateRetailerLocation(locationLat, locationLng);
      showToast('Pharmacy location updated successfully.', 'success');
      setIsLocationModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save pharmacy location.', 'error');
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-nav shadow-sm shadow-zinc-200/50">
        <div className="flex justify-between items-center px-6 h-16 w-full">
        <div className="flex items-center gap-8">
          <span className="text-xl font-extrabold tracking-tight text-zinc-900 font-headline">MediFlow</span>
          <div className="hidden md:flex gap-6 items-center">
            {TOP_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`font-headline text-sm transition-colors duration-200 ${
                    isActive
                      ? 'font-semibold text-green-600 border-b-2 border-green-600 pb-1'
                      : 'font-medium text-zinc-500 hover:text-green-500'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-all">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-all">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-all"
            title="Update pharmacy location"
          >
            <span className="material-symbols-outlined">location_on</span>
          </button>
          <Link to="/retailer/profile" className="flex items-center gap-3 pl-4 ml-4 border-l border-[#e1e3e4] hover:opacity-80 transition-opacity">
            <div className="text-right block">
              <p className="text-xs font-bold font-headline text-[#191c1d] max-w-[140px] truncate">{displayName}</p>
              <p className="text-[10px] text-zinc-500 uppercase" style={{ letterSpacing: '0.05em' }}>Premium Partner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006e2f] to-[#22c55e] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#006e2f]/10">
              {displayInitials}
            </div>
          </Link>
        </div>
        </div>
      </header>

      {isLocationModalOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">Pharmacy Location</p>
                <h3 className="text-lg font-extrabold text-zinc-900">Update Store Coordinates</h3>
              </div>
              <button type="button" onClick={() => setIsLocationModalOpen(false)} className="p-2 rounded-full hover:bg-zinc-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-zinc-600">Pin your pharmacy location on map. Agents will use this location for route planning and nearest-assignment ranking.</p>

              <AddressPinMap
                latitude={locationLat}
                longitude={locationLng}
                onPinChange={(lat, lng) => {
                  setLocationLat(lat);
                  setLocationLng(lng);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 px-3 py-2.5 bg-zinc-50">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500 font-bold">Latitude</p>
                  <p className="text-sm font-semibold text-zinc-900">{Number.isFinite(locationLat) ? locationLat.toFixed(6) : '--'}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 px-3 py-2.5 bg-zinc-50">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500 font-bold">Longitude</p>
                  <p className="text-sm font-semibold text-zinc-900">{Number.isFinite(locationLng) ? locationLng.toFixed(6) : '--'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLoadingLocation}
                  className="px-4 py-2 rounded-lg border border-[#006e2f]/30 text-[#006e2f] text-sm font-bold hover:bg-[#006e2f]/5 disabled:opacity-60"
                >
                  Use Current Location
                </button>
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  disabled={isSavingLocation || isLoadingLocation}
                  className="px-4 py-2 rounded-lg bg-[#006e2f] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
                >
                  {isSavingLocation ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
