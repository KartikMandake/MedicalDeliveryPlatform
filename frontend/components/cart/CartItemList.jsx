import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function CartItemList() {
  const { cart, updateItem, removeItem, loading, isUpdating, isRemoving } = useCart();
  const { showToast } = useToast();

  const handleUpdate = async (itemId, quantity) => {
    try {
      await updateItem(itemId, quantity);
      if (quantity <= 0) showToast({ type: 'success', message: 'Item removed from cart' });
      else showToast({ type: 'success', message: 'Cart quantity updated' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Could not update item' });
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      showToast({ type: 'success', message: 'Item removed from cart' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Could not remove item' });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-16">
       <span className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></span>
    </div>
  );
  
  if (!cart.items?.length) return (
    <div className="bg-white rounded-[1.5rem] p-12 text-center border border-slate-200/60 shadow-sm flex flex-col items-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-slate-300 text-[40px]">shopping_cart</span>
      </div>
      <h3 className="text-xl font-extrabold font-headline text-slate-900 mb-2">Your cart is empty</h3>
      <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Explore our clinical catalog and add items you need to restock or purchase.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {cart.items.map((item) => (
        <div key={item.id} className="bg-white rounded-[1.5rem] p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-center group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-sm border border-slate-200/60 relative overflow-hidden">
          
          {/* Subtle Accent Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors" />

          {/* Image Block */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[#f4f7f6] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-4">
            {item.image ? (
              <img alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" src={item.image} />
            ) : (
              <span className="material-symbols-outlined text-slate-300/50 text-5xl">medication</span>
            )}
          </div>

          <div className="flex-grow flex flex-col w-full h-full justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {item.requiresPrescription ? (
                     <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 shadow-sm flex items-center gap-1">
                       <span className="material-symbols-outlined text-[10px]">prescriptions</span> Rx Required
                     </span>
                  ) : (
                     <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm flex items-center gap-1">
                       <span className="material-symbols-outlined text-[10px]">verified</span> Pre-cleared
                     </span>
                  )}
                  {item.brand && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {item.brand}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-extrabold font-headline text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors cursor-pointer">{item.name}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">{item.category || 'General Health'}</p>
              </div>

              <div className="flex flex-col items-end">
                 <span className="text-2xl font-black font-headline text-[#15803d]">₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                 <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">₹{Number(item.price || 0).toFixed(2)} / unit</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-sm">
                <button
                  onClick={() => handleUpdate(item.id, item.quantity - 1)}
                  disabled={isUpdating(item.id) || isRemoving(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-slate-900 hover:shadow-sm text-slate-500 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <div className="w-10 flex items-center justify-center">
                  <span className="font-extrabold text-sm text-slate-900 font-mono">{String(item.quantity).padStart(2, '0')}</span>
                </div>
                <button
                  onClick={() => handleUpdate(item.id, item.quantity + 1)}
                  disabled={isUpdating(item.id) || isRemoving(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                disabled={isRemoving(item.id) || isUpdating(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-500 text-xs font-bold uppercase tracking-wider hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer group/btn"
              >
                <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">{isRemoving(item.id) ? 'hourglass_top' : 'delete'}</span>
                {isRemoving(item.id) ? 'Removing' : 'Remove'}
              </button>
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
}
