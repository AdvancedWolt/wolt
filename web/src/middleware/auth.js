const getRequestUserId = (req) => {
    return req.get('user-id') || req.get('x-user-id') || null;
};

const requireAuth = (req, res, next) => {
    const userId = getRequestUserId(req);
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    req.userId = userId;
    next();
};

const attachUserId = (req, _res, next) => {
    const userId = getRequestUserId(req);
    if (userId) {
        req.userId = userId;
    }

    next();
};

const requireMatchingUser = (_req, _res, next) => {
    next();
};

module.exports = {
    attachUserId,
    requireAuth,
    requireMatchingUser
};
