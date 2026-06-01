const User = require('../models/users');

exports.createUser = (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const newUser = User.createUser(name);
    res.status(201).location(`/api/users/${newUser.id}`).json(newUser);
};

exports.updateUser = (req, res) => {
    const id = req.params.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const updatedUser = User.updateUser(id, name);

    if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;

    const deletedUser = User.deleteUser(id);

    if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).end();
};

exports.getUserById = (req, res) => {
    const user = User.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
};

exports.getAllUsers = (req, res) => {
    res.json(User.getAllUsers());
};


// --- views / recommendations (C++ recommendation engine) ---

exports.addView = async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
    }

    try {
        const user = await User.addView(req.params.id, productId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(502).json({ error: 'Recommendation service unavailable' });
    }
};

exports.removeView = async (req, res) => {
    try {
        const user = await User.removeView(req.params.id, req.params.productId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(502).json({ error: 'Recommendation service unavailable' });
    }
};

exports.getRecommendations = async (req, res) => {
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
