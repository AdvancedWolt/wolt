const Order = require('../models/orders');
const Restaurant = require('../models/restaurants');
const Product = require('../models/products');
const User = require('../models/users');

const getOrdersByCurrUser = (req, res) => {
    const orders = Order.getOrdersByUserId(req.userId);
    res.status(200).json(orders);
};

const createOrder = async (req, res) => {
    const { restaurantId, items } = req.body;

    if (!restaurantId) {
        return res.status(400).json({ error: 'restaurantId is required' });
    }

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (items !== undefined) {
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array' });
        }
        for (const productId of items) {
            if (!Product.getProductById(restaurantId, productId)) {
                return res.status(400).json({ error: 'All products must belong to the correct restaurant' });
            }
        }
    }

    const newOrder = Order.createOrder(req.userId, restaurantId, items);

    // Ordered items feed the recommender, but that is best-effort: an outage
    // must not fail an order that was already created.
    if (items && items.length > 0) {
        try {
            await User.addViews(req.userId, items);
        } catch (err) {
            console.error('Failed to record order views:', err.message);
        }
    }

    res.status(201).location(`/api/orders/${newOrder.id}`).end();
};

const getOrderById = (req, res) => {
    const order = Order.getOrderById(req.params.id);

    if (!order || order.userId !== req.userId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
};

const updateOrder = (req, res) => {
    const { items, status } = req.body;

    const order = Order.getOrderById(req.params.id);
    if (!order || order.userId !== req.userId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (status !== undefined && !Order.VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    if (items !== undefined) {
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Cannot update items for a non-pending order' });
        }
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array' });
        }
        for (const productId of items) {
            if (!Product.getProductById(order.restaurantId, productId)) {
                return res.status(400).json({ error: 'All products must belong to the correct restaurant' });
            }
        }
    }

    Order.updateOrder(req.params.id, { items, status });

    res.status(204).end();
};

const deleteOrder = (req, res) => {
    const order = Order.getOrderById(req.params.id);

    if (!order || order.userId !== req.userId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
        return res.status(400).json({ error: 'Cannot delete a non-pending order' });
    }

    Order.deleteOrder(req.params.id);

    res.status(204).end();
};

module.exports = {
    getOrdersByCurrUser,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};