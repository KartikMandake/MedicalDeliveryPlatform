import api from './axios';

export const getAgentDeliveries = () => api.get('/agent/deliveries');
export const acceptAgentDelivery = (orderId) => api.put(`/agent/deliveries/${orderId}/accept`);
export const setAgentOnlineStatus = (isOnline, lat = 0, lng = 0) =>
  api.put('/agent/status', { isOnline, lat, lng });
export const getAgentPerformance = () => api.get('/agent/performance');
export const getAgentHistory = (params) => api.get('/agent/history', { params });

// Customer confirms delivery by sharing OTP with agent.
export const confirmDeliveryWithOtp = (orderId, otp) =>
  api.post('/otp/verify-delivery', { orderId, otp });
