const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'wolt-secret-key';

const getRequestUserId = (req) => {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId;
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return null;
    }
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
