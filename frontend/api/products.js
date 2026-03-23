import api from './axios';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (err) => {
	if (!err) return false;
	if (!err.response) return true;
	return Number(err.response.status) >= 500;
};

const requestWithRetry = async (requestFn, { retries = 6, initialDelay = 400, maxDelay = 2500 } = {}) => {
	let attempt = 0;
	let delay = initialDelay;

	while (attempt <= retries) {
		try {
			return await requestFn();
		} catch (err) {
			if (!isRetryableError(err) || attempt === retries) {
				throw err;
			}
			await sleep(delay);
			delay = Math.min(delay * 2, maxDelay);
			attempt += 1;
		}
	}
};

export const getProducts = (params) => requestWithRetry(() => api.get('/products', { params }));
export const getProduct = (id) => api.get(`/products/${id}`);
export const getProductFilters = () => requestWithRetry(() => api.get('/products/filters'));
