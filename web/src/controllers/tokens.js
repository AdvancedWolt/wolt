const User = require('../models/users');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wolt-secret-key';

const login = (req, res) => {
    const { username, password } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const user = User.verifyCredentials(username, password);
    if (!user) {
        return res.status(404).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
        token
    });
};

module.exports = {
    login,
    JWT_SECRET
};
