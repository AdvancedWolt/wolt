const Restaurant = require('../models/restaurants');

exports.createRestaurant = (req, res) => {
    const { name } = req.body;
    if (!name) { 
        return res.status(400).json({ error: 'Name is required' });
    }

    const newRestaurant = Restaurant.createRestaurant(name);

    res.status(201).location(`/api/restaurants/${newRestaurant.id}`).end();
};

exports.updateRestaurant = (req, res) => {
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

exports.deleteRestaurant = (req, res) => {
    const id = req.params.id;

    const deletedRestaurant = Restaurant.deleteRestaurant(id);

    if (!deletedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(204).json(deletedRestaurant);
};

exports.getRestaurantById = (req, res) => {
    const restaurant = Restaurant.getRestaurantById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
};

exports.getAllRestaurants = (req, res) => {
    res.json(Restaurant.getAllRestaurants());
};