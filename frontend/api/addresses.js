import api from './axios';

export const getAddresses = () => api.get('/addresses');
export const getDefaultAddress = () => api.get('/addresses/default');
export const createAddress = (data) => api.post('/addresses', data);
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data);
export const setDefaultAddress = (id) => api.put(`/addresses/${id}/default`);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
