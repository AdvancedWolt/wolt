const crypto = require('crypto');
const { User } = require('./schemas');
const { tcpClient } = require('../services/tcpClient');

// Maps a Mongoose user document to the public API shape: `_id` becomes `id`, and
// the secret password fields plus the internal recommender `views` are stripped.
const publicUser = (user) => {
    if (!user) return null;

    const source = typeof user.toObject === 'function' ? user.toObject() : user;
    const { _id, passwordHash, passwordSalt, views, __v, ...rest } = source;
    return { id: _id, ...rest };
};

const hashPassword = (password, salt) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey.toString('hex'));
        });
    });
};

const createUser = async ({ username, password, name, location, displayName, image, role }) => {
    if (await User.exists({ username })) {
        return null;
    }

    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const passwordHash = await hashPassword(password, passwordSalt);

    try {
        const created = await User.create({
            username,
            name: name || displayName,
            displayName: displayName || name,
            image: image || null,
            location,
            role: role || 'customer',
            passwordSalt,
            passwordHash,
            views: []
        });
        return publicUser(created);
    } catch (err) {
        // A concurrent insert can still race past the existence check; the unique
        // index is the source of truth, so treat a duplicate key as "taken".
        if (err.code === 11000) return null;
        throw err;
    }
};


const updateUser = async (id, updates) => {
    const user = await User.findById(id);
    if (!user) return null;

    if (updates.username !== undefined) {
        user.username = updates.username;
    }
    if (updates.displayName !== undefined) {
        user.displayName = updates.displayName;
        user.name = updates.displayName;
    }
    if (updates.location !== undefined) {
        user.location = updates.location;
    }
    if (updates.image !== undefined) {
        user.image = updates.image;
    }
    await user.save();
    return publicUser(user);
};

// True when the username is already taken by a different user.
const usernameTaken = async (username, exceptId) => {
    const owner = await User.findOne({ username }).select('_id').lean();
    return owner !== null && owner._id !== exceptId;
};

// Getters
const getUserById = async (id) => publicUser(await User.findById(id).lean());

const verifyCredentials = async (username, password) => {
    const user = await User.findOne({ username }).lean();
    if (!user) return null;

    const passwordHash = await hashPassword(password, user.passwordSalt);
    if (passwordHash !== user.passwordHash) return null;

    return publicUser(user);
};


// --- Recommendation engine (backed by the C++ server over TCP) ---

// Records a product view locally and mirrors new views to the C++ recommender.
const addView = async (id, productId) => {
    const user = await User.findById(id);
    if (!user) return null;

    if (user.views.includes(productId)) {
        return publicUser(user);
    }

    if (user.views.length === 0) {
        // First view registers the user with the recommender; later views are appended.
        await tcpClient.createUser(id, productId);
    } else {
        await tcpClient.addView(id, productId);
    }

    user.views.push(productId);
    await user.save();
    return publicUser(user);
};


const removeView = async (id, productId) => {
    const user = await User.findById(id);
    if (!user) return null;

    await tcpClient.removeView(id, productId);

    user.views = user.views.filter((view) => view !== productId);
    await user.save();
    return publicUser(user);
};

const addViews = async (id, productIds) => {
    const user = await User.findById(id);
    if (!user || !productIds || productIds.length === 0) return null;

    // An order can list the same product several times (one per unit); views are a set.
    const newProducts = [...new Set(productIds)].filter(pid => !user.views.includes(pid));
    if (newProducts.length === 0) return publicUser(user);

    let startIdx = 0;
    if (user.views.length === 0) {
        // Register the user first with the first new product
        await tcpClient.createUser(id, newProducts[0]);
        user.views.push(newProducts[0]);
        startIdx = 1;
    }

    if (newProducts.length > startIdx) {
        const remaining = newProducts.slice(startIdx);
        await tcpClient.addViews(id, remaining);
        user.views.push(...remaining);
    }

    await user.save();
    return publicUser(user);
};

// Withdraws a set of product views, e.g. when an order is cancelled or removed.
const removeViews = async (id, productIds) => {
    const user = await User.findById(id);
    if (!user || !productIds || productIds.length === 0) return null;

    const present = [...new Set(productIds)].filter((pid) => user.views.includes(pid));
    if (present.length === 0) return publicUser(user);

    await tcpClient.removeViews(id, present);
    user.views = user.views.filter((view) => !present.includes(view));
    await user.save();
    return publicUser(user);
};

const getRecommendations = async (id, productId) => {
    const user = await User.findById(id).select('_id').lean();
    if (!user) return null;

    return tcpClient.getRecommendations(id, productId);
};


module.exports = {
    createUser,
    updateUser,
    usernameTaken,
    getUserById,
    verifyCredentials,
    addView,
    addViews,
    removeView,
    removeViews,
    getRecommendations
};
