const Restaurant = require('../models/restaurants');
const Product = require('../models/products');
const Order = require('../models/orders');

const createRestaurant = (req, res) => {
    const { name } = req.body;
    if (!name) { 
        return res.status(400).json({ error: 'Name is required' });
    }

    const newRestaurant = Restaurant.createRestaurant(name);

    res.status(201).location(`/api/restaurants/${newRestaurant.id}`).end();
};

const updateRestaurant = (req, res) => {
    const id = req.params.id;
    const { name } = req.body;

    if (!name) { 
        return res.status(400).json({ error: 'Name is required' });
    }

    const updatedRestaurant = Restaurant.updateRestaurant(id, name);

    if (!updatedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json(updatedRestaurant);
};

const deleteRestaurant = (req, res) => {
    const id = req.params.id;

    const deletedRestaurant = Restaurant.deleteRestaurant(id);

    if (!deletedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    Product.deleteProductsByRestaurant(id);
    Order.cancelOrdersByRestaurant(id);

    res.status(204).json(deletedRestaurant);
};

const getRestaurantById = (req, res) => {
    const restaurant = Restaurant.getRestaurantById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
};

const getAllRestaurants = (req, res) => {
    res.json(Restaurant.getAllRestaurants());
};

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantById,
    getAllRestaurants
};