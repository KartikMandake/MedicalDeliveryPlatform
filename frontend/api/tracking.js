import api from './axios';

export const getOrderTracking = (orderId) => api.get(`/tracking/order/${orderId}`);
export const updateAgentLocation = (lat, lng) => api.put('/tracking/location', { lat, lng });
