import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';
import { getProduct, getProductSuggestions } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SaltComposition from '../components/ui/SaltComposition';
import SanitizedHTML from '../components/ui/SanitizedHTML';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addItem, updateItem, removeItem, isAdding, isUpdating, isRemoving } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pulse, setPulse] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getProduct(id)
      .then((res) => {
        if (!mounted) return;
        setProduct(res.data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.message || 'Unable to load product details');
        setProduct(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    setLoadingSuggestions(true);
    getProductSuggestions(id)
      .then((res) => {
        if (!mounted) return;
        setSuggestions(res.data?.suggestions || []);
      })
      .catch((err) => console.error('Failed to load suggestions', err))
      .finally(() => {
        if (mounted) setLoadingSuggestions(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const cartItem = (cart.items || []).find((item) => String(item.productId) === String(id));
  const inCartQty = Number(cartItem?.quantity || 0);
  const mutating = Boolean((cartItem?.id && (isUpdating(cartItem.id) || isRemoving(cartItem.id))) || isAdding(id));

  const pulseCard = () => {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 560);
  };

  const handleAdd = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addItem(id, 1, product.isEcom);
      pulseCard();
      showToast({ title: 'Cart updated', message: 'Added to cart', type: 'success' });
    } catch (err) {
      showToast({ title: 'Add failed', message: err.response?.data?.message || 'Could not add to cart', type: 'error' });
    }
  };

  const handleAddSuggestion = async (suggestionId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(suggestionId, 1, true);
      showToast({ title: 'Cart updated', message: 'Added to cart', type: 'success' });
    } catch (err) {
      showToast({ title: 'Add failed', message: err.response?.data?.message || 'Could not add to cart', type: 'error' });
    }
  };

  const handleIncrease = async () => {
    if (!cartItem?.id || !product) return;
    try {
      await updateItem(cartItem.id, inCartQty + 1);
      pulseCard();
      showToast({ title: 'Cart updated', message: `${product.name} quantity is now ${inCartQty + 1}`, type: 'success' });
    } catch (err) {
      showToast({ title: 'Update failed', message: err.response?.data?.message || 'Could not increase quantity', type: 'error' });
    }
  };

  const handleDecrease = async () => {
    if (!cartItem?.id || !product) return;
    try {
      const nextQty = inCartQty - 1;
      await updateItem(cartItem.id, nextQty);
      pulseCard();
      if (nextQty <= 0) showToast({ title: 'Cart updated', message: `${product.name} removed from cart`, type: 'success' });
      else showToast({ title: 'Cart updated', message: `${product.name} quantity is now ${nextQty}`, type: 'success' });
    } catch (err) {
      showToast({ title: 'Update failed', message: err.response?.data?.message || 'Could not decrease quantity', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!cartItem?.id || !product) return;
    try {
      await removeItem(cartItem.id);
      pulseCard();
      showToast({ title: 'Cart updated', message: `${product.name} removed from cart`, type: 'success' });
    } catch (err) {
      showToast({ title: 'Remove failed', message: err.response?.data?.message || 'Could not remove item', type: 'error' });
    }
  };

  const parsedDescription = useMemo(() => {
    if (!product || !product.description) return { general: '', uses: [], sideEffects: [] };
    const desc = product.description;
    if (desc.includes('<')) return { isHtml: true, content: desc.replace(/<[^>]*$/, '...'), uses: [], sideEffects: [], general: '' };
    const result = { general: '', uses: [], sideEffects: [] };
    const parts = desc.split('|').map(p => p.trim());
    parts.forEach(part => {
      if (part.toLowerCase().startsWith('uses:')) {
        result.uses = part.substring(5).trim().split(',').map(s => s.trim()).filter(Boolean);
      } else if (part.toLowerCase().startsWith('side effects:')) {
        result.sideEffects = part.substring(13).trim().split(',').map(s => s.trim()).filter(Boolean);
      } else {
        result.general += (result.general ? ' | ' : '') + part;
      }
    });
    return result;
  }, [product]);

  return (
    <div className="bg-[#f8f9fa] fixed inset-0 overflow-y-auto overflow-x-hidden flex flex-col text-slate-800 font-body antialiased">
      <ProductsNavBar />

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto w-full flex-1">
        <nav className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          <Link to="/products" className="hover:text-emerald-600 transition-colors">Catalog</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          {product?.category && (
            <>
              <span className="cursor-default">{product.category}</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </>
          )}
          <span className="text-slate-600 truncate max-w-[200px]">{product?.name || 'Details'}</span>
        </nav>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 bg-white rounded-[2rem] h-[500px] animate-pulse shadow-sm border border-slate-100" />
            <div className="lg:col-span-7 space-y-6">
              <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-12 w-3/4 rounded bg-slate-200 animate-pulse" />
              <div className="h-8 w-40 rounded bg-slate-200 animate-pulse" />
              <div className="h-32 w-full rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-16 w-64 rounded-xl bg-slate-200 animate-pulse" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex flex-col gap-2 shadow-sm text-sm">
             <div className="flex items-center gap-2 text-rose-800 font-bold"><span className="material-symbols-outlined">error</span> Error Loading Data</div>
             <p className="text-rose-700">{error}</p>
          </div>
        )}

        {!loading && !error && product && (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
            <div className="w-full lg:w-[45%] xl:w-[40%] lg:sticky lg:top-28 space-y-4">
              <div className={`w-full bg-white rounded-[2rem] overflow-hidden p-8 lg:p-12 aspect-[4/3] flex items-center justify-center relative shadow-sm border border-slate-100 transition-all ${pulse ? 'ring-4 ring-emerald-500/20 scale-[0.99]' : ''}`}>
                {product.requiresPrescription && (
                  <div className="absolute top-4 left-4 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 border border-rose-100/50 shadow-sm backdrop-blur-md">
                    <span className="material-symbols-outlined text-[14px]">prescriptions</span>
                    Rx Required
                  </div>
                )}
                {Number(product.stock || 0) <= 0 && (
                  <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-lg">
                    Out of Stock
                  </div>
                )}
                {product.outOfRange && Number(product.stock || 0) > 0 && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-lg">
                    Beyond Delivery Range
                  </div>
                )}
                {product.image ? (
                  <img
                    alt={product.name}
                    src={product.image}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-[1.08] drop-shadow-sm"
                  />
                ) : (
                  <span className="material-symbols-outlined text-slate-200 text-8xl">medication</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3 shadow-sm">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                     <span className="material-symbols-outlined">verified</span>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality</p>
                     <p className="text-xs font-bold text-slate-700">100% Genuine</p>
                   </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3 shadow-sm">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                     <span className="material-symbols-outlined">local_shipping</span>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery</p>
                     <p className="text-xs font-bold text-slate-700">Fast Dispatch</p>
                   </div>
                </div>
              </div>

              {product.saltName && (
                <div className="-mt-1">
                  <SaltComposition saltName={product.saltName} format="table" />
                </div>
              )}
            </div>

            <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col gap-6">
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg font-black text-[10px] tracking-[0.2em] uppercase border border-emerald-100">{product.brand || 'Generic Manufacturer'}</span>
                    <span className="text-slate-500 bg-slate-50 px-3 py-1 rounded-lg font-bold text-[10px] tracking-wider uppercase border border-slate-100">{product.type || 'Medicine'}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold font-headline text-slate-900 tracking-tight leading-[1.1]">{product.name}</h1>
                  
                  {product.rating !== null && product.rating !== undefined && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="bg-amber-400 text-amber-900 px-2.5 py-1 rounded flex items-center gap-1 shadow-sm">
                        <span className="font-bold text-xs">{Number(product.rating).toFixed(1)}</span>
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                      <span className="text-slate-400 text-sm font-semibold hover:text-emerald-600 cursor-pointer">{product.reviewCount} verified reviews</span>
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-slate-100 my-6"></div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-4xl font-black text-slate-900 tracking-tight">₹{Number(product.price || 0).toFixed(2)}</span>
                      {Number(product.mrp || 0) > Number(product.price || 0) && (
                        <span className="text-slate-400 line-through text-lg font-bold">MRP ₹{Number(product.mrp || 0).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {Number(product.mrp || 0) > Number(product.price || 0) && (
                        <span className="bg-[#e4ffd7] text-[#006e2f] font-black text-[11px] px-2.5 py-1 rounded-md tracking-wider uppercase shadow-sm">
                          {Math.max(0, Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100))}% OFF
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Inclusive of all taxes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {inCartQty > 0 ? (
                      <div className="flex items-center scale-105">
                        <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200">
                          <button type="button" onClick={handleDecrease} disabled={mutating} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-l-xl transition-colors disabled:opacity-40 text-slate-600"><span className="material-symbols-outlined text-[20px]">remove</span></button>
                          <span className="w-12 text-center font-black text-lg text-slate-800">{inCartQty}</span>
                          <button type="button" onClick={handleIncrease} disabled={mutating || Number(product.stock || 0) <= inCartQty} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-r-xl transition-colors disabled:opacity-40 text-slate-600"><span className="material-symbols-outlined text-[20px]">add</span></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {product.outOfRange && (
                          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-2">
                            <span className="material-symbols-outlined text-[18px]">location_off</span>
                            <span className="text-xs font-bold">This product is not available within your 8km delivery radius.</span>
                          </div>
                        )}
                        <button type="button" onClick={handleAdd} disabled={Number(product.stock || 0) <= 0 || isAdding(id) || product.outOfRange} className="bg-emerald-600 hover:bg-emerald-700 py-3.5 px-8 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 min-w-[180px]">
                          <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                          {isAdding(id) ? 'ADDING...' : product.outOfRange ? 'NOT AVAILABLE' : 'ADD TO CART'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
                {parsedDescription.isHtml ? (
                  <SanitizedHTML className="prose prose-sm prose-slate max-w-none [&>div>h3]:text-sm [&>div>h3]:font-black [&>div>h3]:mb-2 [&>div>h3]:text-slate-800 [&>div>p]:mb-2" html={parsedDescription.content} />
                ) : (
                  parsedDescription.general && (
                    <div className="space-y-2">
                       <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                         <span className="material-symbols-outlined text-[16px]">info</span> Product Overview
                       </h3>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">{parsedDescription.general}</p>
                    </div>
                  )
                )}

                {parsedDescription.uses.length > 0 && (
                  <div>
                    <h3 className="font-black text-sm text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><span className="material-symbols-outlined text-[16px] text-blue-500">task_alt</span></div>
                      Key Uses / Benefits
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {parsedDescription.uses.map((use, i) => (
                        <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="material-symbols-outlined text-blue-500 text-[18px] shrink-0">check_circle</span>
                          <span className="text-sm font-semibold text-slate-700 leading-snug">{use}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedDescription.sideEffects.length > 0 && (
                  <div>
                    <h3 className="font-black text-sm text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center"><span className="material-symbols-outlined text-[16px] text-rose-500">warning</span></div>
                      Potential Side Effects
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {parsedDescription.sideEffects.map((effect, i) => (
                        <li key={i} className="flex items-center gap-1.5 bg-white border border-rose-100 shadow-sm px-3 py-1.5 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span className="text-xs font-bold text-slate-600">{effect}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      Most side effects do not require any medical attention and disappear as your body adjusts to the medicine. Consult your doctor if they persist.
                    </p>
                  </div>
                )}

                {!parsedDescription.isHtml && parsedDescription.uses.length === 0 && parsedDescription.sideEffects.length === 0 && !parsedDescription.general && (
                  <p className="text-sm text-slate-500 leading-relaxed font-medium italic">Detailed clinical information is currently not available for this general product. Always consult your physician.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {suggestions.length > 0 && !loading && !error && product && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600">local_mall</span>
              </div>
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-slate-900">Suggested Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map((suggestion) => {
                const sCartItem = (cart.items || []).find((item) => String(item.productId) === String(suggestion.id) && item.isEcom);
                const sInCartQty = Number(sCartItem?.quantity || 0);
                const isAddingSugg = isAdding(suggestion.id);

                return (
                  <div
                    key={suggestion.id}
                    className="group text-left bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col border border-slate-100 cursor-pointer p-4"
                    onClick={() => navigate(`/products/${suggestion.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden bg-[#f8f9fa] rounded-xl p-4 flex items-center justify-center mb-4">
                      {suggestion.image ? (
                        <img
                          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                          src={suggestion.image}
                          alt={suggestion.name}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-200 text-6xl">inventory_2</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{suggestion.brand || 'Generic'}</span>
                      <h3 className="font-headline font-bold text-sm text-slate-800 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">{suggestion.name}</h3>
                      
                      {suggestion.rating !== null && suggestion.rating !== undefined && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-amber-500 flex items-center text-xs font-bold">
                            {Number(suggestion.rating).toFixed(1)} <span className="material-symbols-outlined text-[10px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          </span>
                          <span className="text-[10px] text-slate-400">({suggestion.reviewCount})</span>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-extrabold text-slate-900">₹{Number(suggestion.price || 0).toFixed(2)}</span>
                        {sInCartQty > 0 ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">In Cart: {sInCartQty}</span>
                        ) : (
                          <button
                            type="button"
                            disabled={isAddingSugg}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSuggestion(suggestion.id);
                            }}
                            className="h-9 w-9 rounded-full bg-slate-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">{isAddingSugg ? 'hourglass_top' : 'add'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <ProductsFooter />
    </div>
  );
}
