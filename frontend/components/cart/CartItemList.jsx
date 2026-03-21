import { useCart } from '../../context/CartContext';

export default function CartItemList() {
  const { cart, updateItem, removeItem, loading } = useCart();

  if (loading) return <div className="text-center py-8 text-slate-400">Loading cart...</div>;
  if (!cart.items?.length) return (
    <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
      <span className="material-symbols-outlined text-slate-300 text-5xl">shopping_cart</span>
      <p className="mt-3 text-slate-500 font-medium">Your cart is empty</p>
    </div>
  );

  return (
    <>
      {cart.items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center border border-slate-100 hover:shadow-md transition-all">
          <div className="w-24 h-24 bg-slate-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
            {item.image ? (
              <img alt={item.name} className="w-full h-full object-contain p-2" src={item.image} />
            ) : (
              <span className="material-symbols-outlined text-slate-300 text-4xl">medication</span>
            )}
          </div>
          <div className="flex-grow space-y-2 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                <p className="text-sm text-slate-500">{item.brand} • {item.category}</p>
              </div>
              <span className="font-bold text-xl text-slate-900">₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {item.requiresPrescription && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                  Prescription Required
                </span>
              )}
              <div className="flex items-center bg-slate-100 rounded-full px-1 py-1">
                <button
                  onClick={() => updateItem(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="w-8 text-center font-bold text-sm">{String(item.quantity).padStart(2, '0')}</span>
                <button
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 text-sm font-medium flex items-center gap-1 hover:underline ml-auto"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
