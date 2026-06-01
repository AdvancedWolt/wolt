const crypto = require('crypto');
const { tcpClient } = require('../services/tcpClient');

const users = {}


const createUser = (name) => {
    const id = crypto.randomUUID();
    const newUser = { id: id, name: name, views: [] };

    // Save the new user using the new id.
    // Note: the C++ recommendation engine has no concept of a product-less
    // user (POST requires at least one product), so a fresh profile lives
    // only in this layer until the user views their first product.
    users[id] = newUser;

    return newUser;
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
        delete users[id];
        return true;
    }
    return false;
};

// Getters
const getAllUsers = () => Object.values(users);
const getUserById = (id) => users[id];


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
    addView,
    removeView,
    getRecommendations
};
