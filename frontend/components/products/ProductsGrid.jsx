import { useState, useEffect } from 'react';
import { getProduct, getProducts } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductsGrid({ filters = {}, page = 1, onTotalPages, onFiltersChange }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const limit = 12;

  const formatPrice = (value) => Number(value || 0).toFixed(2);
  const stockMode = filters.inStockOnly ? 'in-stock' : 'all';

  useEffect(() => {
    setLoading(true);
    const params = {
      ...filters,
      page,
      limit,
      maxPrice: filters.maxPrice,
      categories: (filters.categories || []).join(','),
      brands: (filters.brands || []).join(','),
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
        setLoadError('Unable to reach server. Retrying automatically...');
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleAdd = async (productId) => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      await addItem(productId, 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const handleOpenDetails = async (productId) => {
    try {
      setDetailsLoading(true);
      const res = await getProduct(productId);
      setSelectedProduct(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not load product details');
    } finally {
      setDetailsLoading(false);
    }
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
              className={`group text-left bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col border border-outline-variant/10 ${Number(product.stock || 0) <= 0 ? 'opacity-80 grayscale-[0.4]' : ''}`}
            >
              <div className="relative h-40 lg:h-44 overflow-hidden bg-zinc-50 p-4 lg:p-5 flex items-center justify-center">
                {Number(product.stock || 0) <= 0 && (
                  <span className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Out of Stock</span>
                  </span>
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
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${Number(product.stock || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>
                    {Number(product.stock || 0) > 0 ? `${Number(product.stock)} in stock` : 'Out of stock'}
                  </span>
                </div>

                <h3 className="font-headline font-bold text-base lg:text-lg text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-xs lg:text-sm text-zinc-500 line-clamp-2 mb-3">{product.description || product.saltName || 'Quality-assured medicine for clinical use.'}</p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg lg:text-xl font-extrabold text-[#2E7D32]">₹{formatPrice(product.price)}</span>
                  <button
                    type="button"
                    disabled={Number(product.stock || 0) <= 0}
                    title={Number(product.stock || 0) <= 0 ? 'Out of stock' : 'Add to cart'}
                    aria-label={Number(product.stock || 0) <= 0 ? 'Out of stock' : 'Add to cart'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(product.id);
                    }}
                    className={`h-10 w-10 lg:h-11 lg:w-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${Number(product.stock || 0) <= 0 ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-surface-container-high text-primary hover:bg-primary hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined">{Number(product.stock || 0) <= 0 ? 'block' : 'add'}</span>
                  </button>
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-400">Stock: {Number(product.stock || 0)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailsLoading && (
        <div className="fixed inset-0 z-[70] bg-black/25 backdrop-blur-[1px] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl text-sm text-zinc-600">Loading product details...</div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-zinc-50 min-h-72 flex items-center justify-center p-6">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="max-h-72 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-zinc-300 text-7xl">medication</span>
                )}
              </div>
              <div className="p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">{selectedProduct.brand || 'Generic'}</span>
                  <button type="button" onClick={() => setSelectedProduct(null)} className="text-zinc-400 hover:text-zinc-700">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <h2 className="text-xl font-headline font-extrabold text-zinc-900 mb-2">{selectedProduct.name}</h2>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">{selectedProduct.category || 'General'}</span>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">{selectedProduct.type || 'medicine'}</span>
                  {selectedProduct.requiresPrescription && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">Rx Required</span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${Number(selectedProduct.stock || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-700'}`}>
                    {Number(selectedProduct.stock || 0) > 0 ? `${Number(selectedProduct.stock)} in stock` : 'Out of stock'}
                  </span>
                </div>

                {selectedProduct.saltName && (
                  <p className="text-sm text-zinc-600 mb-3"><span className="font-semibold text-zinc-800">Composition:</span> {selectedProduct.saltName}</p>
                )}

                <p className="text-sm text-zinc-600 leading-relaxed mb-4">{selectedProduct.description || 'No additional details available for this medicine.'}</p>

                <div className="mt-auto flex items-end justify-between gap-4">
                  <div>
                    {Number(selectedProduct.mrp || 0) > Number(selectedProduct.price || 0) && (
                      <p className="text-xs text-zinc-400 line-through">₹{Number(selectedProduct.mrp || 0).toFixed(2)}</p>
                    )}
                    <p className="text-2xl font-headline font-extrabold text-primary">₹{Number(selectedProduct.price || 0).toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleAdd(selectedProduct.id);
                    }}
                    disabled={Number(selectedProduct.stock || 0) <= 0}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${Number(selectedProduct.stock || 0) <= 0 ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-[#0b5718]'}`}
                  >
                    {Number(selectedProduct.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
