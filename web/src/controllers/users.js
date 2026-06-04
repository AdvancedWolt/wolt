const User = require('../models/users');

const createUser = (req, res) => {
    const { username, password, name, phone, address } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const newUser = User.createUser({ username, password, name, phone, address });
    if (!newUser) {
        return res.status(409).json({ error: 'Username already exists' });
    }

    res.status(201).location(`/api/users/${newUser.id}`).json(newUser);
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
