const crypto = require('crypto');
const { tcpClient } = require('../services/tcpClient');

const users = {}
const usersByUsername = {}

const publicUser = (user) => {
    if (!user) return null;

    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
};

const hashPassword = (password, salt) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey.toString('hex'));
        });
    });
};

const createUser = async ({ username, password, name, phone, location, displayName, image, role }) => {
    if (usersByUsername[username]) {
        return null;
    }

    const id = crypto.randomUUID();
    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const passwordHash = await hashPassword(password, passwordSalt);
    const newUser = {
        id,
        username,
        name: name || displayName,
        displayName: displayName || name,
        image: image || null,
        phone,
        location,
        role: role || 'customer',
        passwordSalt,
        passwordHash,
        views: []
    };

    users[id] = newUser;
    usersByUsername[username] = id;

    return publicUser(newUser);
};


const updateUser = (id, updates) => {
    const user = users[id];
    if (!user) return null;

    if (updates.username !== undefined && updates.username !== user.username) {
        delete usersByUsername[user.username];
        user.username = updates.username;
        usersByUsername[updates.username] = id;
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
    return publicUser(user);
};

// True when the username is already taken by a different user.
const usernameTaken = (username, exceptId) => {
    const ownerId = usersByUsername[username];
    return ownerId !== undefined && ownerId !== exceptId;
};

// Getters
const getUserById = (id) => publicUser(users[id]);

const verifyCredentials = async (username, password) => {
    const id = usersByUsername[username];
    if (!id) return null;

    const user = users[id];
    const passwordHash = await hashPassword(password, user.passwordSalt);
    if (passwordHash !== user.passwordHash) return null;

    return publicUser(user);
};


// --- Recommendation engine (backed by the C++ server over TCP) ---

// Records a product view locally and mirrors new views to the C++ recommender.
const addView = async (id, productId) => {
    const user = users[id]
    if (!user) return null

    if (user.views.includes(productId)) {
        return publicUser(user)
    }

    if (user.views.length === 0) {
        // First view registers the user with the recommender; later views are appended.
        await tcpClient.createUser(id, productId);
    } else {
        await tcpClient.addView(id, productId);
    }

    user.views.push(productId);
    return publicUser(user)
};


const removeView = async (id, productId) => {
    const user = users[id]
    if (!user) return null

    await tcpClient.removeView(id, productId);

    user.views = user.views.filter((view) => view !== productId);
    return publicUser(user)
};

const addViews = async (id, productIds) => {
    const user = users[id];
    if (!user || !productIds || productIds.length === 0) return null;

    const newProducts = productIds.filter(pid => !user.views.includes(pid));
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

    return publicUser(user);
};

const getRecommendations = async (id, productId) => {
    const user = users[id]
    if (!user) return null

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
    getRecommendations
};
