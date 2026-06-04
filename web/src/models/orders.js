const crypto = require('crypto');

// Structure: { orderId: { id, userId, restaurantId, items, status } }
const orders = {};

const VALID_STATUSES = ['pending', 'in-progress', 'delivered', 'cancelled'];


const createOrder = (userId, restaurantId, items) => {
    const id = crypto.randomUUID();
    const newOrder = { id, userId, restaurantId, items: items || [], status: 'pending' };

    orders[id] = newOrder;
    return newOrder;
};

const getOrderById = (orderId) => {
    return orders[orderId] || null;
};

const getOrdersByUserId = (userId) => {
    return Object.values(orders).filter(o => o.userId === userId);
};

const updateOrder = (orderId, updates) => {
    const order = orders[orderId];
    if (!order) return null;

    // Update only provided fields
    if (updates.items !== undefined) order.items = updates.items;
    if (updates.status !== undefined) order.status = updates.status;

    return order;
};

const deleteOrder = (orderId) => {
    if (orders[orderId]) {
        delete orders[orderId];
        return true;
    }
    return false;
};

const cancelOrdersByRestaurant = (restaurantId) => {
    for (const key in orders) {
        if (orders[key].restaurantId === restaurantId) {
            orders[key].status = 'cancelled';
        }
    }
};

module.exports = {
    VALID_STATUSES,
    createOrder,
    getOrderById,
    getOrdersByUserId,
    updateOrder,
    deleteOrder,
    cancelOrdersByRestaurant
};