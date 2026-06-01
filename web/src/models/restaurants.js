const crypto = require('crypto');

const restaurants = {}

const createRestaurant = (name) => {
    const id = crypto.randomUUID();
    const newRestaurant = { id: id, name: name };
    
    // Save the new restaurant using the new id
    restaurants[id] = newRestaurant;
    
    return newRestaurant;
};


const updateRestaurant = (id, name) => {
    const restaurant = restaurants[id]
    if (!restaurant) return null

    // Update properties
    restaurant.name = name;
    return restaurant
}


const deleteRestaurant = (id) => {
    if (restaurants[id]) {
        delete restaurants[id];
        return true;
    }
    return false;
};

// Getters
const getAllRestaurants = () => Object.values(restaurants);
const getRestaurantById = (id) => restaurants[id];


module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getAllRestaurants,
    getRestaurantById
};