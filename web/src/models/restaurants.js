const crypto = require('crypto');

// SINGLE SOURCE OF TRUTH
const restaurants = {};

// Return formatted restaurant, hides the empty products object
const formatRestaurant = (restaurant) => {
    if (!restaurant) return null;
    return {
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category,
        image: restaurant.image,
        promoted: restaurant.promoted
    };
};

const createRestaurant = (name, details = {}) => {
    const id = crypto.randomUUID();
    // Embed products inside the restaurant
    const newRestaurant = {
        id,
        name,
        category: details.category || 'Other',
        image: details.image || null,
        promoted: details.promoted === true,
        products: {}
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
    return formatRestaurant(restaurant);
};

const deleteRestaurant = (id) => {
    if (restaurants[id]) {
        delete restaurants[id]; // Deletes products too
        return true;
    }
    return false;
};

// Getters
const getAllRestaurants = () => Object.values(restaurants).map(formatRestaurant);
const getRestaurantById = (id) => formatRestaurant(restaurants[id]);

// Expose raw restaurant to the Product model 
const getRawRestaurantById = (id) => restaurants[id];

// helper for GET /api/search/:query endpoint
const searchRestaurants = (query) => {
    return Object.values(restaurants).filter(r => r.name.includes(query)).map(formatRestaurant);
};

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getAllRestaurants,
    getRestaurantById,
    getRawRestaurantById, // Exported just for models/products.js
    searchRestaurants
};
