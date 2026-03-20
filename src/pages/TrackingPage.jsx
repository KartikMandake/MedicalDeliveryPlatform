import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import TrackingMap from '../components/tracking/TrackingMap';
import TrackingOrderDetails from '../components/tracking/TrackingOrderDetails';
import CartNavBar from '../components/cart/CartNavBar';
import CartFooter from '../components/cart/CartFooter';
import CartFloatingActions from '../components/cart/CartFloatingActions';
import { getOrderTracking, pushAgentLocation } from '../lib/api';
import { DEFAULT_TRACKING_ORDER_NUMBER } from '../lib/constants';

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = useMemo(
    () => searchParams.get('orderNumber') || DEFAULT_TRACKING_ORDER_NUMBER,
    [searchParams]
  );
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');
  const [shareGps, setShareGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  useEffect(() => {
    let isMounted = true;

    const loadTracking = async () => {
      try {
        const data = await getOrderTracking(orderNumber);
        if (isMounted) {
          setTracking(data);
          setError('');
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Failed to load tracking');
        }
      }
    };

    loadTracking();
    const intervalId = setInterval(loadTracking, 7000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [orderNumber]);

  useEffect(() => {
    if (!shareGps || !tracking?.agent_id) {
      return undefined;
    }

    if (!geolocationSupported) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await pushAgentLocation({
            agentId: tracking.agent_id,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            isOnline: true,
          });
        } catch (locationError) {
          setGpsError(locationError.message || 'Failed to push GPS location');
        }
      },
      (geoError) => {
        setGpsError(geoError.message || 'Unable to read device location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [shareGps, tracking?.agent_id, geolocationSupported]);

  const etaText = tracking?.status === 'in_transit' || tracking?.status === 'picked_up' ? 'Live in transit' : 'Updating status';
  const statusLabel = (tracking?.status || 'loading').replaceAll('_', ' ').toUpperCase();
  const trackingModeLabel = (tracking?.tracking_mode || 'status_only').replaceAll('_', ' ');
  const isAgentOnline = Boolean(tracking?.agent_online);
  const lastPingLabel = tracking?.agent_last_ping
    ? `${new Date(tracking.agent_last_ping).toLocaleTimeString()} (server ping)`
    : 'Awaiting ping';
  const coordinateLabel = tracking?.agent_lat && tracking?.agent_lng
    ? `${Number(tracking.agent_lat).toFixed(4)}, ${Number(tracking.agent_lng).toFixed(4)}`
    : 'Not available';
  const gpsErrorText = !geolocationSupported && shareGps ? 'Geolocation not supported on this device/browser' : gpsError;

  return (
    <div className="bg-[#f7f9fc] font-['Inter'] min-h-screen text-[#191c1e] selection:bg-[#a3f69c] selection:text-[#002204] flex flex-col antialiased">
      <CartNavBar />
      <main className="pt-24 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto w-full flex-grow">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link className="hover:text-[#0d631b] transition-colors" to="/">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link className="hover:text-[#0d631b] transition-colors" to="/tracking">My Orders</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 font-semibold tracking-tight">Tracking #{orderNumber}</span>
        </nav>

        <section className="mb-10 rounded-3xl overflow-hidden border border-emerald-800/20 shadow-[0_24px_60px_rgba(13,99,27,0.18)] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d631b] via-[#2e7d32] to-[#00a891]"></div>
          <div className="absolute -top-16 -left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 right-4 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 p-6 md:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/90 font-bold mb-3">Live Delivery Intelligence</p>
                <h1 className="font-['Manrope'] text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Order {statusLabel}
                </h1>
                <p className="mt-3 text-emerald-50/95 font-medium text-sm md:text-base">{etaText}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/25 text-xs font-bold tracking-wide text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                    ORDER #{orderNumber}
                  </span>
                  <span className="bg-black/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-emerald-50 capitalize">
                    Mode: {trackingModeLabel}
                  </span>
                  <button
                    type="button"
                    disabled={!tracking?.agent_id}
                    onClick={() => {
                      setGpsError('');
                      setShareGps((prev) => !prev);
                    }}
                    className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/25 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {shareGps ? 'Stop GPS Share' : 'Use My GPS As Agent'}
                  </button>
                </div>
                {gpsErrorText && <p className="text-xs text-amber-100 mt-2">{gpsErrorText}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[540px]">
                <div className="rounded-2xl bg-white/12 border border-white/20 backdrop-blur p-4">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-100/85 font-bold">Agent</p>
                  <p className="text-sm font-bold text-white mt-1">{tracking?.agent_name || 'Not Assigned'}</p>
                  <p className={`text-xs mt-1 font-semibold ${isAgentOnline ? 'text-emerald-200' : 'text-amber-200'}`}>
                    {isAgentOnline ? 'Online' : 'Offline'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/12 border border-white/20 backdrop-blur p-4">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-100/85 font-bold">Last Ping</p>
                  <p className="text-sm font-bold text-white mt-1">{lastPingLabel}</p>
                  <p className="text-xs mt-1 text-emerald-100/90">Auto-refreshing every 7s</p>
                </div>

                <div className="rounded-2xl bg-white/12 border border-white/20 backdrop-blur p-4">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-100/85 font-bold">Coordinates</p>
                  <p className="text-sm font-bold text-white mt-1">{coordinateLabel}</p>
                  <p className="text-xs mt-1 text-emerald-100/90">Live courier point</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="mb-6 text-sm font-semibold text-red-600">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          <TrackingMap tracking={tracking} />
          <TrackingOrderDetails tracking={tracking} />
        </div>
      </main>
      <CartFooter />
      <CartFloatingActions />
    </div>
  );
}
