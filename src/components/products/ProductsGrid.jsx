export default function ProductsGrid({ products, onAddToCart, addingMedicineId }) {
  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="text-[1.35rem] font-headline font-bold text-on-surface tracking-tight">Pharmaceutical Inventory</h1>
          <p className="text-sm text-zinc-500 mt-1">Showing 1-{products.length} of 240 results</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sort By:</span>
          <select className="bg-surface-container-lowest border-none text-sm font-semibold text-on-surface rounded-xl shadow-sm focus:ring-primary/20 pr-10">
            <option>Most Popular</option>
            <option>Price Low to High</option>
            <option>Price High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {products.map((product) => {
          const isAdding = addingMedicineId === product.id;
          return (
            <div
              key={product.id}
              className={`group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col border border-outline-variant/10 ${
                product.inStock ? '' : 'opacity-75 grayscale-[0.5]'
              }`}
            >
              <div className="relative h-44 overflow-hidden bg-zinc-50 p-5 flex items-center justify-center">
                {!product.inStock && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Out of Stock</span>
                  </div>
                )}
                {product.requiresRx && (
                  <span className="absolute top-4 left-4 px-2 py-1 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-bold text-error uppercase tracking-wider border border-error/10 z-20">
                    RX Required
                  </span>
                )}
                <img
                  className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  alt={product.name}
                  src={product.image}
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">{product.manufacturer}</span>
                  <div className="flex items-center text-amber-500 gap-0.5">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                    <span className="text-xs font-bold text-on-surface">{product.rating}</span>
                  </div>
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>

                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-medium block">Price</span>
                    <span className="text-lg font-headline font-bold text-on-surface">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <button
                    disabled={!product.inStock || isAdding}
                    onClick={() => onAddToCart(product.id)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                      !product.inStock || isAdding
                        ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                        : 'bg-surface-container-high text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined">{isAdding ? 'hourglass_top' : 'add'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="group rounded-xl overflow-hidden flex flex-col p-7 border border-primary/20 relative bg-gradient-to-br from-white to-[rgba(74,225,118,0.05)]">
          <div className="relative z-10 h-full flex flex-col">
            <div className="bg-primary/10 w-11 h-11 rounded-xl flex items-center justify-center text-primary mb-5">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-primary leading-tight mb-3">AI Recommended for Heart Care</h3>
            <p className="text-sm text-zinc-600 mb-7 leading-relaxed">Based on your recent purchases, our engine suggests reviewing Vitamin D3 supplements for better care continuity.</p>
            <button className="mt-auto px-5 py-2.5 bg-white border border-primary/20 rounded-full text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-wider self-start">
              View Bundle
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
