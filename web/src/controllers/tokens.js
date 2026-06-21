const User = require('../models/users');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wolt-secret-key';

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const user = await User.verifyCredentials(username, password);
        if (!user) {
            return res.status(404).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            token,
            userId: user.id,
            username: user.username,
            displayName: user.displayName || user.name,
            image: user.image || null
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error during login' });
    }
};

module.exports = {
    login,
    JWT_SECRET
};
