import api from './axios';

export const createRazorpayOrder = (orderId) => api.post('/payment/create-order', { orderId });
export const verifyPayment = (data) => api.post('/payment/verify', data);
export const getPayments = () => api.get('/payment');
