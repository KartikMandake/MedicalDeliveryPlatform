import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Skeleton = () => (
  <div className="divide-y divide-[#f2f4f7]">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-6 flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-16 bg-emerald-50 rounded animate-pulse" />
        </div>
        <div className="h-8 w-20 bg-slate-100 rounded-full animate-pulse" />
      </div>
    ))}
  </div>
);

export default function UploadResults({ scanning, scanResult }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});
  const [addingAll, setAddingAll] = useState(false);

  const results = scanResult?.results || [];
  const matchedResults = results.filter((r) => r.matched.length > 0);

  const getQty = (id) => quantities[id] ?? 1;
  const setQty = (id, val) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  const handleAddAll = async () => {
    if (!matchedResults.length) return;
    setAddingAll(true);
    try {
      await Promise.all(
        matchedResults.map((r) => {
          const product = r.matched[0];
          return addItem(product.id, getQty(product.id));
        })
      );
      navigate('/cart');
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAddingAll(false);
    }
  };

  // Empty / idle state
  if (!scanning && !scanResult) {
    return (
      <div className="lg:col-span-5">
        <div className="sticky top-28 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#f2f4f7]">
            <h2 className="text-xl font-bold font-['Manrope'] text-[#191c1e]">Detected Medicines</h2>
          </div>
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200">medication</span>
            <p className="text-slate-400 text-sm font-medium">Upload and scan a prescription<br />to see medicines here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-5">
      <div className="sticky top-28 space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#f2f4f7] flex justify-between items-center">
            <h2 className="text-xl font-bold font-['Manrope'] text-[#191c1e]">Detected Medicines</h2>
            {!scanning && results.length > 0 && (
              <span className="bg-[#0d631b]/10 text-[#0d631b] px-3 py-1 rounded-full text-xs font-bold">
                {results.length} Found
              </span>
            )}
          </div>

          {scanning ? (
            <Skeleton />
          ) : results.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-4xl text-amber-400">search_off</span>
              <p className="text-slate-500 text-sm font-medium">No medicines could be detected.<br />Try a clearer image.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f2f4f7]">
              {results.map((result, idx) => {
                const { extracted, matched } = result;
                const product = matched[0];

                return (
                  <div key={idx} className="p-6 hover:bg-[#f2f4f7]/20 transition-colors">
                    {product ? (
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="font-bold text-[#191c1e] truncate">{product.name}</h4>
                          <p className="text-xs text-[#40493d]">
                            {product.manufacturer} • {product.type}
                            {product.requires_rx && (
                              <span className="ml-2 text-red-500 font-bold">Rx</span>
                            )}
                          </p>
                          <p className="text-[#0d631b] font-bold mt-1">
                            ₹{Number(product.selling_price).toFixed(2)}
                            {product.mrp > product.selling_price && (
                              <span className="ml-2 text-xs text-slate-400 line-through">₹{Number(product.mrp).toFixed(2)}</span>
                            )}
                          </p>
                          {extracted.dosage && (
                            <p className="text-xs text-slate-400">Prescribed: {extracted.dosage}</p>
                          )}
                        </div>
                        <div className="flex items-center bg-[#f2f4f7] rounded-full px-2 py-1 flex-shrink-0">
                          <button
                            onClick={() => setQty(product.id, getQty(product.id) - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{getQty(product.id)}</span>
                          <button
                            onClick={() => setQty(product.id, getQty(product.id) + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Not found in catalog
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-400">warning</span>
                        <div>
                          <p className="font-semibold text-slate-700">{extracted.name}</p>
                          <p className="text-xs text-slate-400">Not found in our catalog</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary & Checkout */}
          {!scanning && matchedResults.length > 0 && (
            <div className="p-6 bg-[#f2f4f7]/50 space-y-4 border-t border-[#f2f4f7]">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#40493d]">Matched items</span>
                <span className="font-bold text-[#191c1e]">{matchedResults.length} / {results.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#40493d]">Est. Total</span>
                <span className="font-bold text-[#191c1e]">
                  ₹{matchedResults.reduce((sum, r) => sum + Number(r.matched[0].selling_price) * getQty(r.matched[0].id), 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleAddAll}
                disabled={addingAll}
                className="w-full py-4 bg-gradient-to-br from-[#0d631b] to-[#2e7d32] text-white rounded-xl font-['Manrope'] font-bold text-lg shadow-lg hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingAll ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                    Add All to Cart
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-6 py-4 bg-white/50 border border-[#bfcaba]/10 rounded-xl">
          <span className="material-symbols-outlined text-[#006153]">verified_user</span>
          <p className="text-xs text-[#40493d]">Our clinical team verifies every prescription item before fulfillment.</p>
        </div>
      </div>
    </div>
  );
}
