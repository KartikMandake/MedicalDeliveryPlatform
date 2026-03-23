import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/my');
export const getDefaultAddress = () => api.get('/orders/default-address');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const assignAgent = (id) => api.post(`/orders/${id}/assign-agent`);
