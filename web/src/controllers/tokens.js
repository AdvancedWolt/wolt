const User = require('../models/users');

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

    res.status(200).json({
        userId: user.id
    });
};

module.exports = {
    login
};
