const crypto = require('crypto');
const { mongoose } = require('../../config/db');

const { Schema } = mongoose;

// Same { x, y } map point used by users; redeclared here to keep each schema
// file self-contained.
const locationSchema = new Schema(
    {
        x: { type: Number },
        y: { type: Number },
    },
    { _id: false }
);

// A restaurant. `category` and `image` are part of the EX4 API surface and are
// modelled explicitly. Menu items live in their own Product collection and point
// back here via Product.restaurant rather than being embedded.
const restaurantSchema = new Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, default: 'Other' },
    image: { type: String, default: null },
    promoted: { type: Boolean, default: false },
    location: { type: locationSchema, default: null },
    // The user who owns the restaurant; we look restaurants up by owner.
    owner: { type: String, ref: 'User', index: true },
});

module.exports = { restaurantSchema };
