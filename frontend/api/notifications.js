import api from './axios';

export const getNotifications = () => api.get('/notifications');
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllAsRead = () => api.put('/notifications/mark-all-read');
