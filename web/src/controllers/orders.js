const Order = require('../models/orders');
const Restaurant = require('../models/restaurants');
const Product = require('../models/products');
const User = require('../models/users');

const getOrdersByCurrUser = async (req, res) => {
    const orders = await Order.getOrdersByUserId(req.userId);
    res.status(200).json(orders);
};

const createOrder = async (req, res) => {
    const { restaurantId, items } = req.body;

    if (!restaurantId) {
        return res.status(400).json({ error: 'restaurantId is required' });
    }

    if (!(await Restaurant.getRestaurantById(restaurantId))) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (items !== undefined) {
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array' });
        }
        for (const productId of items) {
            if (!(await Product.getProductById(restaurantId, productId))) {
                return res.status(400).json({ error: 'All products must belong to the correct restaurant' });
            }
        }
    }

    const newOrder = await Order.createOrder(req.userId, restaurantId, items);

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

const getOrderById = async (req, res) => {
    const order = await Order.getOrderById(req.params.id);

    if (!order || order.userId !== req.userId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
};

const updateOrder = async (req, res) => {
    const { items, status } = req.body;

    const order = await Order.getOrderById(req.params.id);
    if (!order || order.userId !== req.userId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (status !== undefined && !Order.VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    if (items !== undefined) {
        if (order.status !== Order.STATUS.PENDING) {
            return res.status(400).json({ error: 'Cannot update items for a non-pending order' });
        }
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array' });
        }
        for (const productId of items) {
            if (!(await Product.getProductById(order.restaurantId, productId))) {
                return res.status(400).json({ error: 'All products must belong to the correct restaurant' });
            }
        }
    }

    const cancelledItems = status === Order.STATUS.CANCELLED ? [...order.items] : [];
    await Order.updateOrder(req.params.id, { items, status });

    // Cancelling an order withdraws its items from the recommender (best-effort).
    if (cancelledItems.length > 0) {
        try {
            await User.removeViews(req.userId, cancelledItems);
        } catch (err) {
            console.error('Failed to withdraw cancelled order views:', err.message);
        }
    }

    res.status(204).end();
};

const deleteOrder = async (req, res) => {
    const order = await Order.getOrderById(req.params.id);

    if (!order || order.userId !== req.userId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    // A customer can remove a pending or already-cancelled order from their
    // history, but not one the restaurant is preparing or delivering.
    if (order.status === Order.STATUS.IN_PROGRESS || order.status === Order.STATUS.DELIVERED) {
        return res.status(400).json({ error: 'Cannot remove an order while it is in progress' });
    }

    const removedItems = [...order.items];
    await Order.deleteOrder(req.params.id);

    // Removing an order withdraws its items from the recommender (best-effort).
    if (removedItems.length > 0) {
        try {
            await User.removeViews(req.userId, removedItems);
        } catch (err) {
            console.error('Failed to withdraw removed order views:', err.message);
        }
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