import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function CartItemList() {
  const { cart, updateItem, removeItem, loading, isUpdating, isRemoving } = useCart();
  const { showToast } = useToast();

  const handleUpdate = async (itemId, quantity) => {
    try {
      await updateItem(itemId, quantity);
      if (quantity <= 0) showToast('Item removed from cart', 'success');
      else showToast('Cart quantity updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update item', 'error');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      showToast('Item removed from cart', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove item', 'error');
    }
  };

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
        <div key={item.id} className="bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center group transition-all duration-200 hover:translate-x-1 shadow-[0_8px_24px_rgba(25,28,29,0.04)]">
          <div className="w-32 h-32 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            {item.image ? (
              <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
            ) : (
              <span className="material-symbols-outlined text-slate-300 text-4xl">medication</span>
            )}
          </div>
          <div className="flex-grow space-y-2 w-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest font-headline text-primary block mb-1">{item.requiresPrescription ? 'Prescription Grade' : 'Stock Item'}</span>
                <h3 className="text-lg font-bold font-headline text-on-surface leading-tight">{item.name}</h3>
                <p className="text-sm text-on-surface-variant">{item.brand} • {item.category}</p>
              </div>
              <span className="text-xl font-bold font-headline text-on-surface">₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 gap-4">
                <button
                  onClick={() => handleUpdate(item.id, item.quantity - 1)}
                  disabled={isUpdating(item.id) || isRemoving(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="font-bold text-sm w-4 text-center">{String(item.quantity).padStart(2, '0')}</span>
                <button
                  onClick={() => handleUpdate(item.id, item.quantity + 1)}
                  disabled={isUpdating(item.id) || isRemoving(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                disabled={isRemoving(item.id) || isUpdating(item.id)}
                className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-base">{isRemoving(item.id) ? 'hourglass_top' : 'delete'}</span>
                {isRemoving(item.id) ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
