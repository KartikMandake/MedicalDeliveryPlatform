import { useState, useEffect } from 'react';
import { getProducts } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductsGrid({ filters = {}, page = 1, onTotalPages }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    getProducts({ ...filters, page, limit })
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        if (onTotalPages) onTotalPages(Math.ceil(res.data.total / limit));
      })
      .catch(console.error)
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

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-900">{products.length}</span> of {total} results
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className={`group bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col transition-all duration-300 hover:shadow-xl ${product.stock === 0 ? 'opacity-90' : ''}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-slate-900/40 z-10 flex items-center justify-center">
                  <span className="bg-white/90 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm shadow-xl">Out of Stock</span>
                </div>
              )}
              {product.requiresPrescription && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Rx Required</span>
                </div>
              )}
              {product.image ? (
                <img className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" src={product.image} alt={product.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-300 text-6xl">medication</span>
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{product.brand}</span>
              <h3 className="font-bold text-base text-slate-900 mb-1">{product.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center gap-1 mb-4">
                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-xs font-bold text-slate-900">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewCount})</span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xl font-extrabold text-[#2E7D32]">₹{product.price}</span>
                <button
                  onClick={() => handleAdd(product.id)}
                  disabled={product.stock === 0}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-lg ${product.stock === 0 ? 'bg-emerald-100 text-emerald-400 cursor-not-allowed' : 'bg-[#00c2a7] text-white hover:bg-[#00a891] shadow-emerald-100'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
