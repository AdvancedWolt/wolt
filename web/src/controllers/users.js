const User = require('../models/users');
const Product = require('../models/products');
const { validateLocation } = require('./shared');

const createUser = async (req, res) => {
    const { username, password, name, location, displayName, image, role = 'customer' } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }
    if (!displayName && !name) {
        return res.status(400).json({ error: 'Display name is required' });
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and contain both letters and digits' });
    }

    const locationError = validateLocation(location);
    if (locationError) {
        return res.status(400).json({ error: locationError });
    }
    if (!['customer', 'restaurant_owner'].includes(role)) {
        return res.status(400).json({ error: 'Role must be customer or restaurant_owner' });
    }

    try {
        const newUser = await User.createUser({
            username,
            password,
            name,
            location,
            displayName,
            image,
            role
        });
        if (!newUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        res.status(201).location(`/api/users/${newUser.id}`).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error during registration' });
    }
};

const getUserById = (req, res) => {
    const user = User.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
};

const getRecommendations = async (req, res) => {
    const { productId } = req.query;
    if (!productId) {
        return res.status(400).json({ error: 'productId query parameter is required' });
    }

    try {
        const recommendedIds = await User.getRecommendations(req.params.id, productId);
        if (recommendedIds === null) {
            return res.status(404).json({ error: 'User not found' });
        }
        // The recommender returns space-separated product ids; resolve them to
        // full products and drop any that no longer exist.
        const recommendations = String(recommendedIds)
            .split(/\s+/)
            .filter(Boolean)
            .map((id) => Product.getById(id))
            .filter(Boolean);
        res.json({ recommendations });
    } catch (err) {
        res.status(502).json({ error: 'Recommendation service unavailable' });
    }
};

const updateUser = async (req, res) => {
    const { username, displayName, location, image } = req.body;

    if (username === undefined && displayName === undefined && location === undefined && image === undefined) {
        return res.status(400).json({ error: 'At least one profile field is required to update' });
    }

    if (username !== undefined && (typeof username !== 'string' || username.trim().length < 3)) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (username !== undefined && User.usernameTaken(username.trim(), req.params.id)) {
        return res.status(409).json({ error: 'Username already exists' });
    }

    if (displayName !== undefined && (typeof displayName !== 'string' || !displayName.trim())) {
        return res.status(400).json({ error: 'Display name must be a non-empty string' });
    }

    if (location !== undefined) {
        const locationError = validateLocation(location);
        if (locationError) return res.status(400).json({ error: locationError });
    }

    if (image !== undefined && image !== null && typeof image !== 'string') {
        return res.status(400).json({ error: 'Image must be a string or null' });
    }

    try {
        const updated = User.updateUser(req.params.id, {
            username: username ? username.trim() : undefined,
            displayName: displayName ? displayName.trim() : undefined,
            location,
            image
        });

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error during profile update' });
    }
};

module.exports = {
    createUser,
    getUserById,
    getRecommendations,
    updateUser
};
