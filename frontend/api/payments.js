import api from './axios';

export const createRazorpayOrder = (orderId) => api.post('/payments/create-order', { orderId });
export const verifyPayment = (data) => api.post('/payments/verify', data);
export const getPayments = () => api.get('/payments');
