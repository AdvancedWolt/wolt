const crypto = require('crypto');

const tokens = {};

const createToken = (userId) => {
    const token = crypto.randomUUID();
    tokens[token] = userId;
    return token;
};

const getUserId = (token) => tokens[token] || null;

module.exports = {
    createToken,
    getUserId
};
