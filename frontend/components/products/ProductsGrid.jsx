import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SaltComposition from '../ui/SaltComposition';
import SanitizedHTML from '../ui/SanitizedHTML';

export default function ProductsGrid({ filters = {}, page = 1, onTotalPages, onFiltersChange, userLocation, locationStatus, loadingMoreRef, viewMode = 'grid', onViewModeChange }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pulseProductIds, setPulseProductIds] = useState({});
  const { cart, addItem, updateItem, removeItem, isAdding, isUpdating, isRemoving } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const limit = 12;

  const formatPrice = (value) => Number(value || 0).toFixed(2);
  const stockMode = filters.inStockOnly ? 'in-stock' : 'all';

  const triggerPulse = (productId) => {
    setPulseProductIds((prev) => ({ ...prev, [productId]: true }));
    window.setTimeout(() => {
      setPulseProductIds((prev) => ({ ...prev, [productId]: false }));
    }, 560);
  };

  useEffect(() => {
    if (locationStatus === 'loading') {
      if (page === 1) setLoading(true);
      return;
    }

    const lat = Number(userLocation?.lat);
    const lng = Number(userLocation?.lng);
    const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);

    if (!hasLocation) {
      setProducts([]);
      setTotal(0);
      if (onTotalPages) onTotalPages(1);
      setLoadError('Location is required to show nearby stock (within 8 km).');
      setLoading(false);
      return;
    }

    setLoading(true);
    if (loadingMoreRef) loadingMoreRef.current = page > 1;

    const params = {
      ...filters,
      productType: filters.productType || 'all',
      page,
      limit,
      maxPrice: filters.maxPrice,
      categories: (filters.categories || []).join(','),
      brands: (filters.brands || []).join(','),
      userLat: lat,
      userLng: lng,
      radiusKm: 8,
    };
    
    getProducts(params)
      .then((res) => {
        setLoadError('');
        const fetchedProducts = res.data.products || [];
        setProducts(prev => page === 1 ? fetchedProducts : [...prev, ...fetchedProducts]);
        setTotal(res.data.total);
        if (onTotalPages) onTotalPages(Math.ceil(res.data.total / limit));
      })
      .catch((err) => {
        console.error(err);
        if (page === 1) setProducts([]);
        setLoadError(err?.response?.data?.message || 'Unable to reach server. Retrying automatically...');
      })
      .finally(() => {
        setLoading(false);
        if (loadingMoreRef) loadingMoreRef.current = false;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, userLocation?.lat, userLocation?.lng, locationStatus]);

  const handleAdd = async (product) => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      await addItem(product.id, 1, product.isEcom);
      triggerPulse(product.id);
      showToast({ message: 'Added to cart', type: 'success', title: 'Cart updated' });
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Could not add to cart', type: 'error', title: 'Add failed' });
    }
  };

  const handleIncrease = async (product, cartItem, inCartQty) => {
    if (!cartItem?.id) return;
    try {
      await updateItem(cartItem.id, inCartQty + 1);
      triggerPulse(product.id);
      showToast({ message: `${product.name} quantity is now ${inCartQty + 1}`, type: 'success', title: 'Cart updated' });
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Could not increase quantity', type: 'error', title: 'Update failed' });
    }
  };

  const handleDecrease = async (product, cartItem, inCartQty) => {
    if (!cartItem?.id) return;
    try {
      const nextQty = inCartQty - 1;
      await updateItem(cartItem.id, nextQty);
      triggerPulse(product.id);
      if (nextQty <= 0) {
        showToast({ message: `${product.name} removed from cart`, type: 'success', title: 'Cart updated' });
      } else {
        showToast({ message: `${product.name} quantity is now ${nextQty}`, type: 'success', title: 'Cart updated' });
      }
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Could not decrease quantity', type: 'error', title: 'Update failed' });
    }
  };

  const handleDelete = async (product, cartItem) => {
    if (!cartItem?.id) return;
    try {
      await removeItem(cartItem.id);
      triggerPulse(product.id);
      showToast({ message: `${product.name} removed from cart`, type: 'success', title: 'Cart updated' });
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Could not remove item', type: 'error', title: 'Remove failed' });
    }
  };

  const handleOpenDetails = (productId) => navigate(`/products/${productId}`);

  const containerClass = viewMode === 'list' 
    ? "flex flex-col gap-5" 
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  const cardBaseClass = "group text-left bg-white rounded-[1.5rem] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border cursor-pointer w-full";
  const getCardClass = (isEcom, pulse, isList) => {
    const listModifiers = isList ? "flex flex-col sm:flex-row h-auto items-stretch" : "flex flex-col h-full";
    const ecomModifiers = pulse 
      ? 'border-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.2)] scale-[0.98]' 
      : 'border-slate-100 shadow-sm hover:shadow-indigo-500/10';
    const medModifiers = pulse 
      ? 'border-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)] scale-[0.98]' 
      : 'border-slate-100 shadow-sm hover:shadow-emerald-500/10';

    return `${cardBaseClass} ${listModifiers} ${isEcom ? ecomModifiers : medModifiers}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-headline font-extrabold text-slate-900 tracking-tight leading-tight">Catalog</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Showing <span className="text-slate-800 font-bold">{products.length}</span> of {total} results
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 border-t sm:border-t-0 border-slate-200 pt-4 sm:pt-0">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => onViewModeChange && onViewModeChange('grid')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800 shadow-inner' : 'text-slate-400 hover:text-slate-600'} cursor-pointer`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button 
              onClick={() => onViewModeChange && onViewModeChange('list')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-800 shadow-inner' : 'text-slate-400 hover:text-slate-600'} cursor-pointer`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3" htmlFor="stock-mode-select">Filter:</label>
            <select
              id="stock-mode-select"
              className="appearance-none bg-slate-50 hover:bg-slate-100 transition-colors h-8 pl-3 pr-8 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              value={stockMode}
              onChange={(e) => {
                if (!onFiltersChange) return;
                onFiltersChange({ ...filters, inStockOnly: e.target.value === 'in-stock' });
              }}
            >
              <option value="all">All Inventory</option>
              <option value="in-stock">In-Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined">error</span>
          <span>{loadError}</span>
        </div>
      )}

      {loading && page === 1 ? (
        <div className={containerClass}>
          {Array.from({ length: viewMode === 'list' ? 6 : 8 }).map((_, i) => (
            <div key={i} className={`bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm ${viewMode === 'list' ? 'flex flex-col sm:flex-row h-auto sm:h-48' : 'flex flex-col'}`}>
              <div className={`${viewMode === 'list' ? 'w-full sm:w-[250px] shrink-0' : 'aspect-[4/3]'} bg-slate-50 animate-pulse`} />
              <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
                <div className="h-2 w-20 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-50 rounded animate-pulse" />
                <div className={`flex justify-between items-center pt-2 ${viewMode === 'list' ? 'mt-auto' : 'mt-4'}`}>
                  <div className="h-6 w-16 bg-emerald-50 rounded animate-pulse" />
                  <div className="h-10 w-10 bg-slate-100 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={containerClass}>
          {products.map((product) => {
            const cartItem = (cart.items || []).find((item) => String(item.productId) === String(product.id));
            const inCartQty = Number(cartItem?.quantity || 0);
            const adding = isAdding(product.id);
            const mutating = Boolean(adding || (cartItem?.id && (isUpdating(cartItem.id) || isRemoving(cartItem.id))));
            const pulse = Boolean(pulseProductIds[product.id]);
            const isOutOfStock = Number(product.stock || 0) <= 0;
            const isList = viewMode === 'list';

            if (product.isEcom) {
              // --- PREMIUM E-COMMERCE CARD ---
              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenDetails(product.id)}
                  className={getCardClass(true, pulse, isList)}
                >
                  <div className={`relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 flex flex-col items-center justify-center shrink-0 border-r border-slate-50 ${isList ? 'w-full sm:w-[260px] p-8' : 'h-48 p-6'}`}>
                    {isOutOfStock && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900 text-white text-[9px] font-black rounded-full uppercase tracking-widest z-20 shadow-sm">Sold Out</span>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm text-indigo-600 border border-indigo-100/50 text-[9px] font-black rounded-full uppercase tracking-[0.2em] z-20 shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">local_mall</span> Lifestyle
                    </span>
                    {product.image ? (
                      <img className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm mix-blend-multiply" src={product.image} alt={product.name} />
                    ) : (
                      <span className="material-symbols-outlined text-indigo-200/50 text-6xl">shopping_bag</span>
                    )}
                  </div>
                  <div className={`p-5 lg:p-6 flex flex-col flex-1 ${isList ? 'justify-center' : ''}`}>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1.5">{product.brand || 'Premium'}</span>
                    <h3 className={`font-headline font-extrabold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors leading-tight ${isList ? 'text-lg lg:text-xl line-clamp-1' : 'text-base line-clamp-2'}`}>{product.name}</h3>
                    
                    {product.description?.includes('<') ? (
                      <SanitizedHTML 
                        className={`text-xs text-slate-500 leading-relaxed ${isList ? 'line-clamp-3 mb-6' : 'line-clamp-2 mb-4'}`}
                        html={product.description.replace(/<[^>]*$/, '...')} 
                      />
                    ) : (
                      <p className={`text-xs text-slate-500 leading-relaxed ${isList ? 'line-clamp-3 mb-6' : 'line-clamp-2 mb-4'}`}>{product.description || 'Premium everyday wellness and care product.'}</p>
                    )}

                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div>
                        {Number(product.mrp || 0) > Number(product.price || 0) && (
                          <span className="text-[10px] font-bold text-slate-400 line-through block mb-0.5">₹{formatPrice(product.mrp)}</span>
                        )}
                        <span className="text-xl font-black text-slate-900 tracking-tight">₹{formatPrice(product.price)}</span>
                      </div>
                      
                      {inCartQty > 0 ? (
                        <div className="flex items-center bg-indigo-50 rounded-full border border-indigo-100 p-1">
                          <button
                            type="button" disabled={mutating}
                            onClick={(e) => { e.stopPropagation(); handleDecrease(product, cartItem, inCartQty); }}
                            className="h-8 w-8 rounded-full flex items-center justify-center text-indigo-700 hover:bg-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          ><span className="material-symbols-outlined text-[16px]">remove</span></button>
                          <span className="w-8 text-center text-xs font-black text-indigo-900">{inCartQty}</span>
                          <button
                            type="button" disabled={mutating || isOutOfStock}
                            onClick={(e) => { e.stopPropagation(); handleIncrease(product, cartItem, inCartQty); }}
                            className="h-8 w-8 rounded-full flex items-center justify-center text-indigo-700 hover:bg-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          ><span className="material-symbols-outlined text-[16px]">add</span></button>
                        </div>
                      ) : (
                        <button
                          type="button" disabled={isOutOfStock || adding}
                          onClick={(e) => { e.stopPropagation(); handleAdd(product); }}
                          className={`h-10 px-5 rounded-xl flex items-center gap-2 font-bold text-xs transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer ${isOutOfStock || adding ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{isOutOfStock ? 'block' : adding ? 'hourglass_top' : 'shopping_bag'}</span>
                          <span className={isList ? 'block' : 'hidden sm:block'}>{isOutOfStock ? 'Empty' : 'Add'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // --- CLINICAL MEDICINE CARD ---
            return (
              <div
                key={product.id}
                onClick={() => handleOpenDetails(product.id)}
                className={getCardClass(false, pulse, isList)}
              >
                <div className={`relative overflow-hidden bg-[#f4f7f6] flex flex-col items-center justify-center shrink-0 border-r border-slate-50 ${isList ? 'w-full sm:w-[260px] p-8' : 'h-48 p-6'}`}>
                  {isOutOfStock && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900 text-white text-[9px] font-black rounded-full uppercase tracking-widest z-20 shadow-sm">Out of Stock</span>
                  )}
                  {product.requiresPrescription && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-rose-600 uppercase tracking-widest border border-rose-100 z-20 shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">prescriptions</span> Rx Regulated
                    </span>
                  )}
                  {product.image ? (
                    <img className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply drop-shadow-sm" src={product.image} alt={product.name} />
                  ) : (
                    <span className="material-symbols-outlined text-slate-300/60 text-6xl">medication</span>
                  )}
                </div>
                <div className={`p-5 lg:p-6 flex flex-col flex-1 ${isList ? 'justify-center' : ''}`}>
                  <div className="flex justify-between items-start mb-1.5 gap-3">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded flex-shrink-0">{product.brand || 'Generic'}</span>
                    {!isOutOfStock && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]"></span>
                        Instock Limit: {Number(product.stock)}
                      </span>
                    )}
                  </div>

                  <h3 className={`font-headline font-extrabold text-slate-800 leading-tight mb-2 group-hover:text-emerald-700 transition-colors ${isList ? 'text-lg lg:text-xl line-clamp-1' : 'text-base line-clamp-2'}`}>{product.name}</h3>
                  
                  <div className={isList ? 'mb-6' : 'mb-4'}>
                    <p className={`text-xs text-slate-500 font-medium leading-relaxed ${isList ? 'line-clamp-2' : 'line-clamp-2'}`}>{product.description || 'Quality-assured medicine for clinical use.'}</p>
                    {product.saltName && <SaltComposition saltName={product.saltName} format="text" className="text-[10px] text-slate-400 mt-2 line-clamp-1 font-mono bg-slate-50 px-1.5 py-0.5 rounded inline-block" />}
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-2 border-t border-slate-50">
                    <div>
                      {Number(product.mrp || 0) > Number(product.price || 0) && (
                        <span className="text-[10px] font-bold text-slate-400 line-through block mb-0.5">₹{formatPrice(product.mrp)}</span>
                      )}
                      <span className="text-xl font-black text-[#15803d] tracking-tight">₹{formatPrice(product.price)}</span>
                    </div>
                    
                    {inCartQty > 0 ? (
                      <div className="flex items-center bg-emerald-50 rounded-full border border-emerald-100 p-1">
                        <button
                          type="button" disabled={mutating}
                          onClick={(e) => { e.stopPropagation(); handleDecrease(product, cartItem, inCartQty); }}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-emerald-700 hover:bg-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        ><span className="material-symbols-outlined text-[16px]">remove</span></button>
                        <span className="w-8 text-center text-xs font-black text-emerald-900">{inCartQty}</span>
                        <button
                          type="button" disabled={mutating || isOutOfStock}
                          onClick={(e) => { e.stopPropagation(); handleIncrease(product, cartItem, inCartQty); }}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-emerald-700 hover:bg-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        ><span className="material-symbols-outlined text-[16px]">add</span></button>
                      </div>
                    ) : (
                      <button
                        type="button" disabled={isOutOfStock || adding}
                        onClick={(e) => { e.stopPropagation(); handleAdd(product); }}
                        className={`h-10 w-10 sm:h-10 sm:w-auto sm:px-5 rounded-full sm:rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer ${isOutOfStock || adding ? 'bg-slate-100 text-slate-300' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 hover:border-emerald-600 shadow-sm'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{isOutOfStock ? 'block' : adding ? 'hourglass_top' : 'add'}</span>
                        <span className={`font-bold text-xs ${isList ? 'hidden sm:block' : 'hidden'}`}>{isOutOfStock ? 'Empty' : 'Add'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
