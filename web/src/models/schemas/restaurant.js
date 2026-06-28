const crypto = require('crypto');
const { mongoose } = require('../../config/db');
const { locationSchema } = require('./location');

const { Schema } = mongoose;

// A restaurant. `category` and `image` are part of the EX4 API surface and are
// modelled explicitly. Menu items live in their own Product collection and point
// back here via Product.restaurant rather than being embedded.
const restaurantSchema = new Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, trim: true, index: true },
    // `default` already guarantees a value, so `required` would never fire.
    category: { type: String, default: 'Other' },
    image: { type: String, default: null },
    promoted: { type: Boolean, default: false },
    location: { type: locationSchema, default: null },
    // The user who owns the restaurant; we look restaurants up by owner.
    owner: { type: String, ref: 'User', index: true },
});

module.exports = { restaurantSchema };
