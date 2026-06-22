const Restaurant = require('../models/restaurants');

// 403 guard for owner-only restaurant actions: writes the response and returns
// true when the current user does not own the restaurant.
const rejectNonOwner = (restaurantId, userId, res, message) => {
    if (!Restaurant.isOwnedBy(restaurantId, userId)) {
        res.status(403).json({ error: message });
        return true;
    }
    return false;
};

// Coordinate check shared by the restaurant and user controllers; returns an
// error message or null.
const validateLocation = (location) => {
    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
        return 'Location coordinates (x, y) must be numbers';
    }
    return null;
};

module.exports = { rejectNonOwner, validateLocation };
