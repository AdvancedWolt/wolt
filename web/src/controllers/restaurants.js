const Restaurant = require('../models/restaurants');
const Product = require('../models/products');
const Order = require('../models/orders');

const createRestaurant = (req, res) => {
    const { name, category, image, promoted, location } = req.body;
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
    if (
        location !== undefined
        && (!location || typeof location.x !== 'number' || typeof location.y !== 'number')
    ) {
        return res.status(400).json({ error: 'Location coordinates (x, y) must be numbers' });
    }

    const newRestaurant = Restaurant.createRestaurant(name.trim(), {
        category: typeof category === 'string' ? category.trim() : undefined,
        image: typeof image === 'string' ? image : null,
        promoted,
        location: location ? { x: location.x, y: location.y } : null,
        ownerId: req.userId
    });

    res.status(201).location(`/api/restaurants/${newRestaurant.id}`).end();
};

const updateRestaurant = (req, res) => {
    const id = req.params.id;
    const { name, category, image, promoted, location } = req.body;

    if (!Restaurant.getRestaurantById(id)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (!Restaurant.isOwnedBy(id, req.userId)) {
        return res.status(403).json({ error: 'You can only manage your own restaurants' });
    }

    if (
        name === undefined
        && category === undefined
        && image === undefined
        && promoted === undefined
        && location === undefined
    ) {
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
    if (
        location !== undefined
        && (!location || typeof location.x !== 'number' || typeof location.y !== 'number')
    ) {
        return res.status(400).json({ error: 'Location coordinates (x, y) must be numbers' });
    }

    const updatedRestaurant = Restaurant.updateRestaurant(id, {
        name: typeof name === 'string' ? name.trim() : undefined,
        category: typeof category === 'string' ? category.trim() : category,
        image: typeof image === 'string' ? image : image === null ? null : undefined,
        promoted,
        location: location ? { x: location.x, y: location.y } : undefined
    });

    if (!updatedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(204).end();
};

const deleteRestaurant = (req, res) => {
    const id = req.params.id;

    if (!Restaurant.getRestaurantById(id)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (!Restaurant.isOwnedBy(id, req.userId)) {
        return res.status(403).json({ error: 'You can only manage your own restaurants' });
    }

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
