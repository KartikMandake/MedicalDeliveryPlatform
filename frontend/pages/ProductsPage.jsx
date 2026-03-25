import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsSidebar from '../components/products/ProductsSidebar';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductsFooter from '../components/products/ProductsFooter';
import { getDefaultAddress } from '../api/addresses';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const urlSearch = (searchParams.get('search') || '').trim();
  const [filters, setFilters] = useState(() => {
    const savedType = localStorage.getItem('catalogProductType') || 'all';
    return { categories: [], brands: [], maxPrice: 1000, inStockOnly: false, search: urlSearch, productType: savedType };
  });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('catalogViewMode') || 'grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('loading');
  
  const loadingMoreRef = useRef(false);

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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 }
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
        // Fall back to geolocation
      }
      useGeolocation();
    };

    resolveLocation();

    return () => { mounted = false; };
  }, []);

  const handleFiltersChange = (f) => {
    if (f.productType !== filters.productType) localStorage.setItem('catalogProductType', f.productType || 'all');
    setFilters(f); 
    setPage(1);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('catalogViewMode', mode);
  };

  return (
    <div className="bg-[#f8f9fa] font-body text-slate-800 fixed inset-0 overflow-y-auto overflow-x-hidden antialiased">
      <ProductsNavBar />
      
      <main className="pt-24 pb-24 px-4 lg:px-6 max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-8 min-h-screen">
        <ProductsSidebar filters={filters} onChange={handleFiltersChange} />
        
        <section className="flex-1 min-w-0 flex flex-col">
          {locationStatus === 'unavailable' && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                 <span className="material-symbols-outlined text-[18px] text-amber-600">location_off</span>
              </div>
              <p>Enable location or set a default address to view medicines available for fast delivery.</p>
            </div>
          )}
          
          <ProductsGrid
            filters={filters}
            page={page}
            onTotalPages={setTotalPages}
            onFiltersChange={handleFiltersChange}
            userLocation={userLocation}
            locationStatus={locationStatus}
            loadingMoreRef={loadingMoreRef}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
          
          {page < totalPages && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="group relative inline-flex items-center justify-center px-10 py-3.5 font-bold text-white transition-all bg-slate-900 rounded-full hover:bg-slate-800 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-900/20 active:scale-95 shadow-xl shadow-slate-900/20"
              >
                <div className="flex items-center gap-2">
                  <span className="tracking-wide">Load More Products</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-y-0.5">expand_more</span>
                </div>
              </button>
            </div>
          )}
        </section>
      </main>
      
      <ProductsFooter />
    </div>
  );
}
