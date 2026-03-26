import { useEffect, useState, useRef, useCallback } from 'react';
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
  const observerTarget = useRef(null);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: urlSearch }));
    setPage(1);
  }, [urlSearch]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && page < totalPages && !loadingMoreRef.current) {
        setPage((p) => p + 1);
      }
    },
    [page, totalPages]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });
    
    if (observerTarget.current) observer.observe(observerTarget.current);
    
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [handleObserver, observerTarget]);

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
            <div ref={observerTarget} className="mt-16 h-20 flex justify-center items-center">
               <div className="flex items-center gap-3 text-slate-500 font-bold tracking-wide">
                 <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
                 Fetching more catalogue...
               </div>
            </div>
          )}
        </section>
      </main>
      
      <ProductsFooter />
    </div>
  );
}
