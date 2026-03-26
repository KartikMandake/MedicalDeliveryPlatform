import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';
import { getProduct } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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

    return () => {
      mounted = false;
    };
  }, [id]);

  const cartItem = (cart.items || []).find((item) => item.productId === id);
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
      await addItem(id, 1);
      pulseCard();
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

  return (
    <div className="bg-background fixed inset-0 overflow-y-auto overflow-x-hidden flex flex-col text-on-surface font-body">
      <ProductsNavBar />

      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="mb-7 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
          <Link to="/products" className="hover:text-primary transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-zinc-400">Product Details</span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-[2rem] h-[460px] animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-5 w-36 rounded bg-zinc-100 animate-pulse" />
              <div className="h-10 w-11/12 rounded bg-zinc-100 animate-pulse" />
              <div className="h-6 w-40 rounded bg-zinc-100 animate-pulse" />
              <div className="h-24 w-full rounded-2xl bg-zinc-100 animate-pulse" />
              <div className="h-14 w-64 rounded-full bg-zinc-100 animate-pulse" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && product && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className={`lg:col-span-7 bg-surface-container-lowest rounded-[2rem] overflow-hidden p-8 min-h-[460px] flex items-center justify-center relative shadow-sm transition-all ${pulse ? 'ring-4 ring-primary/20' : ''}`}>
                {product.requiresPrescription && (
                  <span className="absolute top-6 left-6 bg-error/10 text-error px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>prescriptions</span>
                    RX Required
                  </span>
                )}
                {Number(product.stock || 0) <= 0 && (
                  <span className="absolute top-6 right-6 bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                )}
                {product.image ? (
                  <img
                    alt={product.name}
                    src={product.image}
                    className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <span className="material-symbols-outlined text-zinc-300 text-8xl">medication</span>
                )}
              </div>

              <div className="lg:col-span-5 flex flex-col gap-8">
                <div className="space-y-2">
                  <span className="text-secondary font-semibold text-sm tracking-wide uppercase">{product.brand || 'Generic Manufacturer'}</span>
                  <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight leading-tight">{product.name}</h1>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-on-surface">₹{Number(product.price || 0).toFixed(2)}</span>
                  {Number(product.mrp || 0) > Number(product.price || 0) && (
                    <>
                      <span className="text-zinc-400 line-through text-lg font-medium">₹{Number(product.mrp || 0).toFixed(2)}</span>
                      <span className="bg-primary-container/20 text-primary font-bold text-xs px-2 py-1 rounded-md">
                        SAVE {Math.max(0, Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100))}%
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${Number(product.stock || 0) > 0 ? 'bg-primary animate-pulse' : 'bg-zinc-400'}`} />
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                    {Number(product.stock || 0) > 0 ? `In Stock - ${Number(product.stock)} available` : 'Currently Out of Stock'}
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {inCartQty > 0 ? (
                      <>
                        <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1.5 border border-outline-variant/10">
                          <button
                            type="button"
                            onClick={handleDecrease}
                            disabled={mutating}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <span className="material-symbols-outlined text-zinc-600">remove</span>
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{inCartQty}</span>
                          <button
                            type="button"
                            onClick={handleIncrease}
                            disabled={mutating || Number(product.stock || 0) <= inCartQty}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <span className="material-symbols-outlined text-zinc-600">add</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={mutating}
                          className="h-12 w-12 rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center disabled:opacity-40"
                          aria-label="Remove from cart"
                        >
                          <span className="material-symbols-outlined">{mutating ? 'hourglass_top' : 'delete'}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAdd}
                        disabled={Number(product.stock || 0) <= 0 || isAdding(id)}
                        className="bg-gradient-to-br from-primary to-primary-container py-4 px-8 rounded-full text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined">shopping_bag</span>
                        {isAdding(id) ? 'Adding...' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-6 space-y-4 bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                    </div>
                    <h4 className="font-headline font-bold text-sm tracking-tight text-on-surface">Clinical Intelligence Insight</h4>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {product.description || 'This medicine is frequently prescribed in monitored treatment plans. Follow physician dosage instructions for best outcomes.'}
                  </p>
                  {product.saltName && (
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      <span className="font-semibold text-zinc-800">Composition:</span> {product.saltName}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <article className="bg-surface-container-low rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">description</span>
                </div>
                <h3 className="font-headline font-extrabold text-xl tracking-tight">Clinical Description</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {product.description || 'No additional clinical description available for this product.'}
                </p>
              </article>

              <article className="bg-surface-container-low rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">medical_services</span>
                </div>
                <h3 className="font-headline font-extrabold text-xl tracking-tight">Primary Information</h3>
                <ul className="text-sm text-zinc-600 space-y-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Category: {product.category || 'General'}</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Type: {product.type || 'Medicine'}</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Brand: {product.brand || 'Generic'}</li>
                </ul>
              </article>

              <article className="bg-surface-container-low rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">shield</span>
                </div>
                <h3 className="font-headline font-extrabold text-xl tracking-tight">Safety and Handling</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Keep medicines in cool and dry storage away from direct sunlight. Use only as directed by licensed clinicians.
                </p>
              </article>
            </section>
          </>
        )}
      </main>

      <ProductsFooter />
    </div>
  );
}
