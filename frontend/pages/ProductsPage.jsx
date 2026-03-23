import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsSidebar from '../components/products/ProductsSidebar';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductsPagination from '../components/products/ProductsPagination';
import ProductsFooter from '../components/products/ProductsFooter';
import { getDefaultAddress } from '../api/addresses';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const urlSearch = (searchParams.get('search') || '').trim();
  const [filters, setFilters] = useState({ categories: [], brands: [], maxPrice: 1000, inStockOnly: false, search: urlSearch });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('loading');

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: urlSearch }));
    setPage(1);
  }, [urlSearch]);

  useEffect(() => {
    let mounted = true;

    const useGeolocation = () => {
      if (!navigator?.geolocation) {
        if (!mounted) return;
        setUserLocation(null);
        setLocationStatus('unavailable');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!mounted) return;
          setUserLocation({
            lat: Number(position.coords.latitude),
            lng: Number(position.coords.longitude),
          });
          setLocationStatus('ready');
        },
        () => {
          if (!mounted) return;
          setUserLocation(null);
          setLocationStatus('unavailable');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 120000,
        }
      );
    };

    const resolveLocation = async () => {
      setLocationStatus('loading');
      try {
        const res = await getDefaultAddress();
        const lat = Number(res?.data?.address?.lat);
        const lng = Number(res?.data?.address?.lng);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          if (!mounted) return;
          setUserLocation({ lat, lng });
          setLocationStatus('ready');
          return;
        }
      } catch {
        // Fall back to browser geolocation when default address is unavailable.
      }

      useGeolocation();
    };

    resolveLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-background font-body text-on-surface fixed inset-0 overflow-y-auto overflow-x-hidden">
      <ProductsNavBar />
      <main className="pt-20 pb-16 px-4 lg:px-5 max-w-screen-2xl mx-auto flex gap-6">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <ProductsSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
          <section className="flex-1">
            {locationStatus === 'unavailable' && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Enable location or set a default address to view medicines available within 8 km.
              </div>
            )}
            <ProductsGrid
              filters={filters}
              page={page}
              onTotalPages={setTotalPages}
              onFiltersChange={(f) => { setFilters(f); setPage(1); }}
              userLocation={userLocation}
              locationStatus={locationStatus}
            />
            <ProductsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </section>
        </div>
      </main>
      <ProductsFooter />
    </div>
  );
}
