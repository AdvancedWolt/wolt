const Restaurant = require('../models/restaurants');
const Product = require('../models/products');
const Order = require('../models/orders');
const { rejectNonOwner, validateLocation } = require('./shared');

const RESTAURANT_OWNER_ERROR = 'You can only manage your own restaurants';

const validateRestaurantFields = ({ name, category, image, promoted, location }, partial = false) => {
    if (!partial || name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) return 'Name is required';
    }
    if (category !== undefined && typeof category !== 'string') {
        return 'Category must be a string';
    }
    if (image !== undefined && image !== null && typeof image !== 'string') {
        return 'Image must be a string or null';
    }
    if (promoted !== undefined && typeof promoted !== 'boolean') {
        return 'Promoted must be a boolean';
    }
    if (location !== undefined) {
        return validateLocation(location);
    }
    return null;
};

const createRestaurant = (req, res) => {
    const { name, category, image, promoted, location } = req.body;

    const validationError = validateRestaurantFields({ name, category, image, promoted, location });
    if (validationError) return res.status(400).json({ error: validationError });

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
    if (rejectNonOwner(id, req.userId, res, RESTAURANT_OWNER_ERROR)) return;

    if (
        name === undefined
        && category === undefined
        && image === undefined
        && promoted === undefined
        && location === undefined
    ) {
        return res.status(400).json({ error: 'At least one restaurant field is required' });
    }
    const validationError = validateRestaurantFields({ name, category, image, promoted, location }, true);
    if (validationError) return res.status(400).json({ error: validationError });

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
    if (rejectNonOwner(id, req.userId, res, RESTAURANT_OWNER_ERROR)) return;

    if (!Restaurant.deleteRestaurant(id)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Deleting a restaurant removes its menu and cancels any orders placed against it.
    Product.deleteProductsByRestaurant(id);
    Order.cancelOrdersByRestaurant(id);

    res.status(204).end();
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
