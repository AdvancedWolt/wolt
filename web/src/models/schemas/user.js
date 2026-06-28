const crypto = require('crypto');
const { mongoose } = require('../../config/db');

const { Schema } = mongoose;

// A map point. The EX4 API stores a user's home location as { x, y } and the
// schemas mirror that shape so nothing in the API surface has to change.
const locationSchema = new Schema(
    {
        x: { type: Number },
        y: { type: Number },
    },
    { _id: false }
);

// User of the Wolt app. Passwords are never stored in the clear: we keep only a
// PBKDF2 hash and its per-user salt (the "password-rule" fields), both required.
const userSchema = new Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    username: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String },
    displayName: { type: String },
    image: { type: String, default: null },
    location: { type: locationSchema, default: null },
    role: {
        type: String,
        enum: ['customer', 'restaurant_owner'],
        default: 'customer',
    },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    // Products the user has viewed; drives the C++ recommender. A set in spirit,
    // stored as an array of product references.
    views: { type: [{ type: String, ref: 'Product' }], default: [] },
});

module.exports = { userSchema };
