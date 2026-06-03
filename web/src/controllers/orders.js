const Order = require('../models/orders');
const Restaurant = require('../models/restaurants');
const Product = require('../models/products');

const getOrdersByCurrUser = (req, res) => {
    const orders = Order.getOrdersByUserId(req.userId);
    res.status(200).json(orders);
};

const createOrder = (req, res) => {
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

    res.status(201).location(`/api/orders/${newOrder.id}`).end();
};

const getOrderById = (req, res) => {
    const order = Order.getOrderById(req.params.id);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
};

const updateOrder = (req, res) => {
    const { items, status } = req.body;

    const order = Order.getOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (items !== undefined) {
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
    const isDeleted = Order.deleteOrder(req.params.id);

    if (!isDeleted) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.status(204).end();
};

module.exports = {
    getOrdersByCurrUser,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};