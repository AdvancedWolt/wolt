const crypto = require('crypto');
const { mongoose } = require('../../config/db');

const { Schema } = mongoose;

// The order lifecycle. Kept as a named constant so controllers can reference the
// values rather than re-typing the strings.
const ORDER_STATUSES = ['pending', 'in-progress', 'delivered', 'cancelled'];

// An order references the user who placed it, the restaurant it is from, and the
// products ordered. A product may appear more than once in `items`; each entry is
// one unit, matching the EX4 API. We query orders by user and by restaurant, so
// both references are indexed.
const orderSchema = new Schema(
    {
        _id: { type: String, default: () => crypto.randomUUID() },
        user: { type: String, ref: 'User', required: true, index: true },
        restaurant: { type: String, ref: 'Restaurant', required: true, index: true },
        items: { type: [{ type: String, ref: 'Product' }], default: [] },
        // `default` already guarantees a value, so `required` would never fire.
        status: {
            type: String,
            enum: ORDER_STATUSES,
            default: 'pending',
        },
    },
    { timestamps: true }
);

module.exports = { orderSchema, ORDER_STATUSES };
