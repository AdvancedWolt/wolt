const crypto = require('crypto');
const { mongoose } = require('../../config/db');

const { Schema } = mongoose;

// A menu item. Every product belongs to exactly one restaurant; we always list
// products by restaurant, so that reference is required and indexed.
const productSchema = new Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    restaurant: { type: String, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    // `default` already guarantees a value, so `required` would never fire.
    price: { type: Number, default: 0, min: 0 },
    image: { type: String, default: null },
});

module.exports = { productSchema };
