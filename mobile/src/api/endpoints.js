import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// Server calls as named functions, so every URL lives in one place and the
// screens never build paths by hand. Mirrors the web client's endpoint list.

export const login = (username, password) => apiPost('/api/tokens', { username, password });
export const register = (user) => apiPost('/api/users', user);

export const getRestaurants = () => apiGet('/api/restaurants');
export const getRestaurant = (id) => apiGet(`/api/restaurants/${id}`);
export const createRestaurant = (restaurant) => apiPost('/api/restaurants', restaurant);
export const updateRestaurant = (id, updates) => apiPatch(`/api/restaurants/${id}`, updates);
export const deleteRestaurant = (id) => apiDelete(`/api/restaurants/${id}`);

export const getProducts = (restaurantId) => apiGet(`/api/restaurants/${restaurantId}/products`);
// Fetching a single product records a view for the signed-in user, which feeds
// the recommender (so the cart can suggest similar dishes).
export const getProduct = (restaurantId, productId) => (
  apiGet(`/api/restaurants/${restaurantId}/products/${productId}`)
);
export const createProduct = (restaurantId, product) => (
  apiPost(`/api/restaurants/${restaurantId}/products`, product)
);
export const updateProduct = (restaurantId, productId, updates) => (
  apiPatch(`/api/restaurants/${restaurantId}/products/${productId}`, updates)
);
export const deleteProduct = (restaurantId, productId) => (
  apiDelete(`/api/restaurants/${restaurantId}/products/${productId}`)
);

export const search = (query) => apiGet(`/api/search/${encodeURIComponent(query)}`);

export const getUser = (id) => apiGet(`/api/users/${id}`);
export const updateUser = (id, updates) => apiPatch(`/api/users/${id}`, updates);

export const getRecommendations = (userId, productId) => (
  apiGet(`/api/users/${userId}/recommendations?productId=${encodeURIComponent(productId)}`)
);

export const getOrders = () => apiGet('/api/orders');
export const getOrder = (id) => apiGet(`/api/orders/${id}`);
export const createOrder = (restaurantId, items) => apiPost('/api/orders', { restaurantId, items });
export const updateOrder = (id, updates) => apiPatch(`/api/orders/${id}`, updates);
export const deleteOrder = (id) => apiDelete(`/api/orders/${id}`);
