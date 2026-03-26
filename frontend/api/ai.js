import api from './axios';

export const analyzeCartInteractions = () => api.post('/ai/cart-interactions');
export const runDispatchOptimization = () => api.post('/ai/dispatch-optimization');
export const getInventoryPredictions = () => api.post('/ai/inventory-predictions');
export const getDemandForecast = () => api.post('/ai/demand-forecast');
