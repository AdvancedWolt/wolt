const crypto = require('crypto');

// Menu items live in models/products.js, keyed by restaurantId, not embedded here.
const restaurants = {};

const formatRestaurant = (restaurant) => {
    if (!restaurant) return null;
    return {
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category,
        image: restaurant.image,
        promoted: restaurant.promoted,
        location: restaurant.location,
        ownerId: restaurant.ownerId
    };
};

const createRestaurant = (name, details = {}) => {
    const id = crypto.randomUUID();
    const newRestaurant = {
        id,
        name,
        category: details.category || 'Other',
        image: details.image || null,
        promoted: details.promoted === true,
        location: details.location || null,
        ownerId: details.ownerId
    };

    restaurants[id] = newRestaurant;

    return formatRestaurant(newRestaurant);
};

const updateRestaurant = (id, updates) => {
    const restaurant = restaurants[id];
    if (!restaurant) return null;

    if (updates.name !== undefined) restaurant.name = updates.name;
    if (updates.category !== undefined) restaurant.category = updates.category || 'Other';
    if (updates.image !== undefined) restaurant.image = updates.image || null;
    if (updates.promoted !== undefined) restaurant.promoted = updates.promoted === true;
    if (updates.location !== undefined) restaurant.location = updates.location;
    return formatRestaurant(restaurant);
};

const deleteRestaurant = (id) => {
    if (restaurants[id]) {
        delete restaurants[id];
        return true;
    }
    return false;
};

// Getters
const getAllRestaurants = () => Object.values(restaurants).map(formatRestaurant);
const getRestaurantById = (id) => formatRestaurant(restaurants[id]);

const isOwnedBy = (id, userId) => restaurants[id]?.ownerId === userId;

// helper for GET /api/search/:query endpoint
const searchRestaurants = (query) => {
    const normalized = query.toLowerCase();
    return Object.values(restaurants)
        .filter(r => r.name.toLowerCase().includes(normalized))
        .map(formatRestaurant);
};

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getAllRestaurants,
    getRestaurantById,
    isOwnedBy,
    searchRestaurants
};
