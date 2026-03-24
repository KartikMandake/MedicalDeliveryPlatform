import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SaltComposition from '../ui/SaltComposition';

export default function ProductsGrid({ filters = {}, page = 1, onTotalPages, onFiltersChange, userLocation, locationStatus }) {
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
      setLoading(true);
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
    const params = {
      ...filters,
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
        setProducts(res.data.products || []);
        setTotal(res.data.total);
        if (onTotalPages) onTotalPages(Math.ceil(res.data.total / limit));
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
        setTotal(0);
        if (onTotalPages) onTotalPages(1);
          setLoadError(err?.response?.data?.message || 'Unable to reach server. Retrying automatically...');
      })
      .finally(() => setLoading(false));
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

  const handleOpenDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-headline font-extrabold text-on-surface tracking-tight">Pharmaceutical Inventory</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Showing {products.length} of {total} results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest" htmlFor="stock-mode-select">Stock Mode:</label>
          <div className="relative">
            <select
              id="stock-mode-select"
              className="appearance-none h-7 pl-6 pr-9 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={stockMode}
              onChange={(e) => {
                if (!onFiltersChange) return;
                onFiltersChange({ ...filters, inStockOnly: e.target.value === 'in-stock' });
              }}
            >
              <option value="all">All Medicines</option>
              <option value="in-stock">In Stock Only</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px] pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
              <div className="aspect-[4/3] bg-slate-50 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-2 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-40 bg-slate-100 rounded" />
                <div className="h-3 w-full bg-slate-50 rounded" />
                <div className="flex justify-between items-center pt-4">
                  <div className="h-6 w-16 bg-emerald-50 rounded" />
                  <div className="h-10 w-10 bg-slate-50 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {products.map((product) => (
            (() => {
              const cartItem = (cart.items || []).find((item) => item.productId === product.id);
              const inCartQty = Number(cartItem?.quantity || 0);
              const adding = isAdding(product.id);
              const mutating = Boolean(adding || (cartItem?.id && (isUpdating(cartItem.id) || isRemoving(cartItem.id))));
              const pulse = Boolean(pulseProductIds[product.id]);
              return (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenDetails(product.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDetails(product.id);
                }
              }}
              className={`group text-left bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col border ${pulse ? 'border-primary/30 shadow-[0_0_0_3px_rgba(18,112,34,0.16)] animate-[pulse_560ms_ease-out_1]' : 'border-outline-variant/10'}`}
            >
              <div className="relative h-40 lg:h-44 overflow-hidden bg-zinc-50 p-4 lg:p-5 flex items-center justify-center">
                {Number(product.stock || 0) <= 0 && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded-full uppercase tracking-wider z-20">Out of Stock</span>
                )}
                {product.requiresPrescription && (
                  <span className="absolute top-4 left-4 px-2 py-1 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-bold text-error uppercase tracking-wider border border-error/10 z-20">RX Required</span>
                )}
                {product.image ? (
                  <img className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" src={product.image} alt={product.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 text-6xl">medication</span>
                  </div>
                )}
              </div>
              <div className="p-4 lg:p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.brand || 'Generic'}</span>
                  {inCartQty > 0 ? (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary ${pulse ? 'animate-[pulse_560ms_ease-out_1]' : ''}`}>
                      In cart: {inCartQty}
                    </span>
                  ) : Number(product.stock || 0) > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      {`${Number(product.stock)} in stock`}
                    </span>
                  )}
                </div>

                <h3 className="font-headline font-bold text-base lg:text-lg text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                {product.isEcom && product.description?.includes('<') ? (
                  <div 
                    className="text-xs lg:text-sm text-zinc-500 line-clamp-2 mb-3 [&>div>h3]:inline [&>div>p]:inline-block" 
                    dangerouslySetInnerHTML={{ __html: product.description.replace(/<[^>]*$/, '...') }} 
                  />
                ) : (
                  <div className="mb-3">
                    <p className="text-xs lg:text-sm text-zinc-500 line-clamp-2">{product.description || 'Quality-assured medicine for clinical use.'}</p>
                    {product.saltName && <SaltComposition saltName={product.saltName} format="text" className="text-[11px] text-zinc-400 mt-1 line-clamp-1" />}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg lg:text-xl font-extrabold text-[#2E7D32]">₹{formatPrice(product.price)}</span>
                  {inCartQty > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-surface-container-high rounded-full p-1 gap-1 border border-zinc-200">
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecrease(product, cartItem, inCartQty);
                          }}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white transition-colors disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <span className="w-6 text-center text-sm font-extrabold text-on-surface">{inCartQty}</span>
                        <button
                          type="button"
                          disabled={mutating || Number(product.stock || 0) <= inCartQty}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncrease(product, cartItem, inCartQty);
                          }}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white transition-colors disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={mutating}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product, cartItem);
                        }}
                        className="h-10 w-10 rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center disabled:opacity-50"
                        aria-label="Remove from cart"
                        title="Remove from cart"
                      >
                        <span className="material-symbols-outlined text-[18px]">{mutating ? 'hourglass_top' : 'delete'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={Number(product.stock || 0) <= 0 || adding}
                      title={Number(product.stock || 0) <= 0 ? 'Out of stock' : 'Add to cart'}
                      aria-label={Number(product.stock || 0) <= 0 ? 'Out of stock' : 'Add to cart'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(product);
                      }}
                      className={`h-10 w-10 lg:h-11 lg:w-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${Number(product.stock || 0) <= 0 || adding ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-surface-container-high text-primary hover:bg-primary hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined">{Number(product.stock || 0) <= 0 ? 'block' : adding ? 'hourglass_top' : 'add'}</span>
                    </button>
                  )}
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-400">Stock: {Number(product.stock || 0)}</div>
              </div>
            </div>
              );
            })()
          ))}
        </div>
      )}

    </div>
  );
}
