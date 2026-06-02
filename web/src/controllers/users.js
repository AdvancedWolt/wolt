const User = require('../models/users');
const Token = require('../models/tokens');

const getCookie = (req, name) => {
    const cookies = req.get('cookie') || '';
    const cookie = cookies
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

const getRequestToken = (req) => {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() === 'bearer') {
        return token || null;
    }

    return getCookie(req, 'token');
};

const requireMatchingUser = (req, res) => {
    const tokenUserId = Token.getUserId(getRequestToken(req));
    if (!tokenUserId) {
        res.status(401).json({ error: 'Authentication required' });
        return null;
    }
    if (tokenUserId !== req.params.id) {
        res.status(403).json({ error: 'Cannot access another user' });
        return null;
    }

    return tokenUserId;
};

const createUser = (req, res) => {
    const { username, password, name, address } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const newUser = User.createUser({ username, password, name, address });
    if (!newUser) {
        return res.status(409).json({ error: 'Username already exists' });
    }

    res.status(201).location(`/api/users/${newUser.id}`).json(newUser);
};

const getUserById = (req, res) => {
    if (!requireMatchingUser(req, res)) return;

    const user = User.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
};

const getRecommendations = async (req, res) => {
    if (!requireMatchingUser(req, res)) return;

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
