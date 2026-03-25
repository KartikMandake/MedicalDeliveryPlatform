import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAdd, updateCartItem as apiUpdate, removeFromCart as apiRemove } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, taxes: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [addingProductIds, setAddingProductIds] = useState({});
  const [updatingItemIds, setUpdatingItemIds] = useState({});
  const [removingItemIds, setRemovingItemIds] = useState({});

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await getCart();
      setCart(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    if (!user) {
      setCart({ items: [], subtotal: 0, taxes: 0, total: 0 });
    }
  }, [user]);

  const addItem = async (productId, quantity = 1, isEcom = false) => {
    setAddingProductIds((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await apiAdd(productId, quantity, isEcom);
      if (res?.data?.items) setCart(res.data);
      else fetchCart();
      return res;
    } finally {
      setAddingProductIds((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const updateItem = async (itemId, quantity) => {
    setUpdatingItemIds((prev) => ({ ...prev, [itemId]: true }));
    try {
      const res = await apiUpdate(itemId, quantity);
      if (res?.data?.items) setCart(res.data);
      else fetchCart();
      return res;
    } finally {
      setUpdatingItemIds((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    setRemovingItemIds((prev) => ({ ...prev, [itemId]: true }));
    try {
      const res = await apiRemove(itemId);
      if (res?.data?.items) setCart(res.data);
      else fetchCart();
      return res;
    } finally {
      setRemovingItemIds((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const itemCount = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        updateItem,
        removeItem,
        fetchCart,
        itemCount,
        isAdding: (productId) => Boolean(addingProductIds[productId]),
        isUpdating: (itemId) => Boolean(updatingItemIds[itemId]),
        isRemoving: (itemId) => Boolean(removingItemIds[itemId]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
