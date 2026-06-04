const crypto = require('crypto');

// SINGLE SOURCE OF TRUTH
const restaurants = {};

// Return formatted restaurant, hides the empty products object
const formatRestaurant = (restaurant) => {
    if (!restaurant) return null;
    return { id: restaurant.id, name: restaurant.name };
};

const createRestaurant = (name) => {
    const id = crypto.randomUUID();
    // Embed products inside the restaurant
    const newRestaurant = { id: id, name: name, products: {} }; 
    
    restaurants[id] = newRestaurant;
    
    return formatRestaurant(newRestaurant); 
};

const updateRestaurant = (id, name) => {
    const restaurant = restaurants[id];
    if (!restaurant) return null;

    restaurant.name = name;
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