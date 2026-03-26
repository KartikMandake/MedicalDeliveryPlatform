import api from './axios';

export const analyzeCartInteractions = () => api.post('/ai/cart-interactions');
export const runDispatchOptimization = () => api.post('/ai/dispatch-optimization');
export const getInventoryPredictions = () => api.post('/ai/inventory-predictions');
export const getDemandForecast = () => api.post('/ai/demand-forecast');
export const getMediBotMessages = () => api.get('/ai/medibot/messages');
export const sendMediBotMessage = (payload) => api.post('/ai/medibot/chat', payload);
export const getMedicationReminders = () => api.get('/ai/medibot/reminders');
export const checkDueMedicationReminders = () => api.post('/ai/medibot/reminders/check-due');
export const cancelMedicationReminder = (id) => api.delete(`/ai/medibot/reminders/${id}`);
