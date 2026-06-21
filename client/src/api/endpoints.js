import { apiGet, apiPost, apiPatch, apiDelete } from './client.js';

// Server calls as named functions, so every URL is defined in one place.

export const login = (username, password) => apiPost('/api/tokens', { username, password });
export const register = (user) => apiPost('/api/users', user);

export const getRestaurants = () => apiGet('/api/restaurants');
export const getRestaurant = (id) => apiGet(`/api/restaurants/${id}`);
export const getProducts = (restaurantId) => apiGet(`/api/restaurants/${restaurantId}/products`);

export const search = (query) => apiGet(`/api/search/${encodeURIComponent(query)}`);

export const getOrders = () => apiGet('/api/orders');
export const createOrder = (restaurantId, items) => apiPost('/api/orders', { restaurantId, items });
export const updateOrder = (id, updates) => apiPatch(`/api/orders/${id}`, updates);
export const cancelOrder = (id) => apiDelete(`/api/orders/${id}`);
