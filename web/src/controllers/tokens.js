const User = require('../models/users');
const Token = require('../models/tokens');

const createToken = (req, res) => {
    const { username, password } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const user = User.verifyCredentials(username, password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = Token.createToken(user.id);

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict' }).status(201).json({
        token,
        userId: user.id
    });
};

module.exports = {
    createToken
};
