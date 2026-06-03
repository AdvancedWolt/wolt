const Token = require('../models/tokens');
const { getCookie } = require('../utils/cookies');

const getRequestToken = (req) => {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() === 'bearer') {
        return token || null;
    }

    return getCookie(req, 'token');
};

const requireAuth = (req, res, next) => {
    const userId = Token.getUserId(getRequestToken(req));
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    req.userId = userId;
    next();
};

const requireMatchingUser = (req, res, next) => {
    if (req.userId !== req.params.id) {
        return res.status(403).json({ error: 'Cannot access another user' });
    }

    next();
};

module.exports = {
    requireAuth,
    requireMatchingUser
};
