import api from './axios';

export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity = 1, isEcom = false) => api.post('/cart/add', { productId, quantity, isEcom });
export const updateCartItem = (itemId, quantity) => api.put(`/cart/item/${itemId}`, { quantity });
export const removeFromCart = (itemId) => api.delete(`/cart/item/${itemId}`);
export const clearCart = () => api.delete('/cart');
