// Named calls to the Exercise 3 API. Components import these instead of
// hard-coding URLs, so if a route changes we only edit this one file.
import { apiGet, apiPost, apiPatch, apiDelete } from './client.js';

// --- Auth ---
export const login = (username, password) => apiPost('/api/tokens', { username, password });
export const register = (user) => apiPost('/api/users', user);

// --- Restaurants & menus ---
export const getRestaurants = () => apiGet('/api/restaurants');
export const getRestaurant = (id) => apiGet(`/api/restaurants/${id}`);
export const getProducts = (restaurantId) => apiGet(`/api/restaurants/${restaurantId}/products`);

// --- Search ---
export const search = (query) => apiGet(`/api/search/${encodeURIComponent(query)}`);

// --- Orders ---
export const getOrders = () => apiGet('/api/orders');
export const createOrder = (restaurantId, items) => apiPost('/api/orders', { restaurantId, items });
export const updateOrder = (id, updates) => apiPatch(`/api/orders/${id}`, updates);
export const cancelOrder = (id) => apiDelete(`/api/orders/${id}`);
