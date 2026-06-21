const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'wolt-secret-key';

const getRequestAuth = (req) => {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return null;
    }
};

const requireAuth = (req, res, next) => {
    const auth = getRequestAuth(req);
    if (!auth?.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    req.userId = auth.userId;
    req.userRole = auth.role || 'customer';
    next();
};

const attachUserId = (req, _res, next) => {
    const auth = getRequestAuth(req);
    if (auth?.userId) {
        req.userId = auth.userId;
        req.userRole = auth.role || 'customer';
    }

    next();
};

const requireMatchingUser = (_req, _res, next) => {
    next();
};

const requireRestaurantOwner = (req, res, next) => {
    const auth = getRequestAuth(req);
    if (!auth?.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (auth.role !== 'restaurant_owner') {
        return res.status(403).json({ error: 'Restaurant owner access required' });
    }

    req.userId = auth.userId;
    req.userRole = auth.role;
    next();
};

module.exports = {
    attachUserId,
    requireAuth,
    requireMatchingUser,
    requireRestaurantOwner
};
