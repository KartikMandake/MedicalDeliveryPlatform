import api from './axios';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
export const reverseGeocode = (lat, lon) => api.get(`/auth/reverse-geocode?lat=${lat}&lon=${lon}`);
