const crypto = require('crypto');
const { tcpClient } = require('../services/tcpClient');

const users = {}
const usersByUsername = {}

const publicUser = (user) => {
    if (!user) return null;

    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
};

// Why: storing raw passwords would leak every user's password if storage is exposed.
// How: save a PBKDF2 hash plus a random per-user salt; the salt makes identical
// passwords produce different hashes, and the original password is never returned.
const hashPassword = (password, salt) => {
    return crypto
        .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
        .toString('hex');
};

const createUser = ({ username, password, name, address }) => {
    if (usersByUsername[username]) {
        return null;
    }

    const id = crypto.randomUUID();
    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const newUser = {
        id,
        username,
        name,
        address,
        passwordSalt,
        passwordHash: hashPassword(password, passwordSalt),
        views: []
    };

    users[id] = newUser;
    usersByUsername[username] = id;

    return publicUser(newUser);
};


const updateUser = (id, name) => {
    const user = users[id]
    if (!user) return null

    // Update properties
    user.name = name;
    return publicUser(user)
}


const deleteUser = (id) => {
    if (users[id]) {
        delete usersByUsername[users[id].username];
        delete users[id];
        return true;
    }
    return false;
};

// Getters
const getAllUsers = () => Object.values(users).map(publicUser);
const getUserById = (id) => publicUser(users[id]);

const verifyCredentials = (username, password) => {
    const id = usersByUsername[username];
    if (!id) return null;

    const user = users[id];
    const passwordHash = hashPassword(password, user.passwordSalt);
    if (passwordHash !== user.passwordHash) return null;

    return publicUser(user);
};


// --- Recommendation engine (backed by the C++ server over TCP) ---

// Future product-view tracking hook.
// The caller must authenticate the request first and verify that the token
// belongs to this user id before calling this function.
const addView = async (id, productId) => {
    const user = users[id]
    if (!user) return null

    if (user.views.length === 0) {
        await tcpClient.createUser(id, productId);
    } else {
        await tcpClient.addView(id, productId);
    }

    if (!user.views.includes(productId)) {
        user.views.push(productId);
    }
    return publicUser(user)
};


const removeView = async (id, productId) => {
    const user = users[id]
    if (!user) return null

    await tcpClient.removeView(id, productId);

    user.views = user.views.filter((view) => view !== productId);
    return publicUser(user)
};


const getRecommendations = async (id, productId) => {
    const user = users[id]
    if (!user) return null

    return tcpClient.getRecommendations(id, productId);
};


module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    verifyCredentials,
    addView,
    removeView,
    getRecommendations
};
