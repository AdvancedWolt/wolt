const crypto = require('crypto');
const { tcpClient } = require('../services/tcpClient');

const users = {}
const usersByUsername = {}

const publicUser = (user) => {
    if (!user) return null;

    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
};

// why : This is a security measure to prevent password leaks even if the database is compromised.
// how :Store only a salted PBKDF2 hash so the raw password is never saved or returned.
// The random salt makes identical passwords produce different hashes per user.
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

    // Save the new user using the new id.
    // Note: the C++ recommendation engine has no concept of a product-less
    // user (POST requires at least one product), so a fresh profile lives
    // only in this layer until the user views their first product.
    users[id] = newUser;
    usersByUsername[username] = id;

    return publicUser(newUser);
};


const updateUser = (id, name) => {
    const user = users[id]
    if (!user) return null

    // Update properties
    user.name = name;
    return user
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

const addView = async (id, productId) => {
    const user = users[id]
    if (!user) return null

    await tcpClient.addView(id, productId);

    if (!user.views.includes(productId)) {
        user.views.push(productId);
    }
    return user
};


const removeView = async (id, productId) => {
    const user = users[id]
    if (!user) return null

    await tcpClient.removeView(id, productId);

    user.views = user.views.filter((view) => view !== productId);
    return user
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
