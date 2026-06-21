const Restaurant = require('../models/restaurants');
const Product = require('../models/products');
const Order = require('../models/orders');

const createRestaurant = (req, res) => {
    const { name, category, image, promoted } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (category !== undefined && typeof category !== 'string') {
        return res.status(400).json({ error: 'Category must be a string' });
    }
    if (image !== undefined && image !== null && typeof image !== 'string') {
        return res.status(400).json({ error: 'Image must be a string or null' });
    }
    if (promoted !== undefined && typeof promoted !== 'boolean') {
        return res.status(400).json({ error: 'Promoted must be a boolean' });
    }

    const newRestaurant = Restaurant.createRestaurant(name.trim(), {
        category: typeof category === 'string' ? category.trim() : undefined,
        image: typeof image === 'string' ? image : null,
        promoted
    });

    res.status(201).location(`/api/restaurants/${newRestaurant.id}`).end();
};

const updateRestaurant = (req, res) => {
    const id = req.params.id;
    const { name, category, image, promoted } = req.body;

    if (name === undefined && category === undefined && image === undefined && promoted === undefined) {
        return res.status(400).json({ error: 'At least one restaurant field is required' });
    }
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (category !== undefined && typeof category !== 'string') {
        return res.status(400).json({ error: 'Category must be a string' });
    }
    if (image !== undefined && image !== null && typeof image !== 'string') {
        return res.status(400).json({ error: 'Image must be a string or null' });
    }
    if (promoted !== undefined && typeof promoted !== 'boolean') {
        return res.status(400).json({ error: 'Promoted must be a boolean' });
    }

    const updatedRestaurant = Restaurant.updateRestaurant(id, {
        name: typeof name === 'string' ? name.trim() : undefined,
        category: typeof category === 'string' ? category.trim() : category,
        image: typeof image === 'string' ? image : image === null ? null : undefined,
        promoted
    });

    if (!updatedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(204).end();
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
