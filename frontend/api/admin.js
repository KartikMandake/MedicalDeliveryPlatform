import api from './axios';

export const getKPIs = () => api.get('/admin/kpis');
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const getAllUsers = () => api.get('/admin/users');
export const getAnalytics = () => api.get('/admin/analytics');
