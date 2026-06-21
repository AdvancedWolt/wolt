const User = require('../models/users');

const createUser = async (req, res) => {
    const { username, password, name, phone, location, displayName, image } = req.body;
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

    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
        return res.status(400).json({ error: 'Location coordinates (x, y) must be numbers' });
    }

    try {
        const newUser = await User.createUser({ username, password, name, phone, location, displayName, image });
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
        const recommendations = await User.getRecommendations(req.params.id, productId);
        if (recommendations === null) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ recommendations });
    } catch (err) {
        res.status(502).json({ error: 'Recommendation service unavailable' });
    }
};

module.exports = {
    createUser,
    getUserById,
    getRecommendations
};
