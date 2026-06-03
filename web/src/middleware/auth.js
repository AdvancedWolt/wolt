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

// Express runs middleware before the controller when the route lists both.
// This could be called manually from a controller, but then every controller
// would need to know about token parsing and next(), which mixes auth/routing
// concerns into business logic and makes reuse harder.
const attachUserId = (req, _res, next) => {
    const userId = Token.getUserId(getRequestToken(req));
    if (userId) {
        req.userId = userId;
    }

    next();
};

const requireMatchingUser = (req, res, next) => {
    if (req.userId !== req.params.id) {
        return res.status(403).json({ error: 'Cannot access another user' });
    }

    next();
};

module.exports = {
    attachUserId,
    requireAuth,
    requireMatchingUser
};
