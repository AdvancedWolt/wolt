const { Order, ORDER_STATUSES } = require('./schemas');

const STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};
const VALID_STATUSES = ORDER_STATUSES;

// Maps a Mongoose order document to the EX4 API shape. The schema stores `_id`,
// `user`/`restaurant` refs and timestamps; the API has always exposed
// `{ id, userId, restaurantId, items, status }`, so the clients stay unchanged.
const formatOrder = (order) => {
    if (!order) return null;
    return {
        id: order._id,
        userId: order.user,
        restaurantId: order.restaurant,
        items: order.items,
        status: order.status
    };
};

const createOrder = async (userId, restaurantId, items) => {
    const created = await Order.create({
        user: userId,
        restaurant: restaurantId,
        items: items || [],
        status: STATUS.PENDING
    });
    return formatOrder(created);
};

const getOrderById = async (orderId) => formatOrder(await Order.findById(orderId).lean());

const getOrdersByUserId = async (userId) => {
    const orders = await Order.find({ user: userId }).lean();
    return orders.map(formatOrder);
};

const updateOrder = async (orderId, updates) => {
    const order = await Order.findById(orderId);
    if (!order) return null;

    // Update only provided fields
    if (updates.items !== undefined) order.items = updates.items;
    if (updates.status !== undefined) order.status = updates.status;
    await order.save();

    return formatOrder(order);
};

const deleteOrder = async (orderId) => {
    const deleted = await Order.findByIdAndDelete(orderId);
    return deleted !== null;
};

const cancelOrdersByRestaurant = async (restaurantId) => {
    await Order.updateMany({ restaurant: restaurantId }, { status: STATUS.CANCELLED });
};

module.exports = {
    STATUS,
    VALID_STATUSES,
    createOrder,
    getOrderById,
    getOrdersByUserId,
    updateOrder,
    deleteOrder,
    cancelOrdersByRestaurant
};
