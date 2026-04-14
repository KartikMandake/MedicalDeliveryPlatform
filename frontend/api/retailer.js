import api from './axios';

export const getDashboard = () => api.get('/retailer/dashboard');
export const getRetailerProfile = () => api.get('/retailer/profile');
export const updateRetailerProfile = (data) => api.put('/retailer/profile', data);
export const updateRetailerLocation = (lat, lng) => api.put('/retailer/location', { lat, lng });
export const getRetailerOrders = (params) => api.get('/retailer/orders', { params });
export const getAvailableDeliveryAgents = (params) => api.get('/retailer/agents/available', { params });
export const updateRetailerOrderStatus = (id, status, agentId) =>
	api.put(`/retailer/orders/${id}/status`, { status, ...(agentId ? { agentId } : {}) });
export const getInventory = () => api.get('/retailer/inventory');
export const addToInventory = (data) => api.post('/retailer/inventory', data);
export const updateInventoryItem = (id, data) => api.put(`/retailer/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/retailer/inventory/${id}`);
export const verifyDocument = (formData) => api.post('/retailer/verify', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const searchMedicines = (params) => api.get('/retailer/medicines/search', { params });
export const getPredictions = () => api.get('/predictions');
export const getCategories = async () => {
	const res = await api.get('/products/filters');
	return { data: res.data?.categories || [] };
};
