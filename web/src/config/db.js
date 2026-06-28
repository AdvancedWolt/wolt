const mongoose = require('mongoose');

// One source for the MongoDB connection, shared by the boot sequence and every
// model added in later EX5 stories. The URI comes from the environment so no
// connection string (and no secret) is ever committed; the default points at a
// credential-free local Mongo for running outside Docker.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wolt';

// Strip any credentials before logging so a userinfo-bearing URI never leaks.
const safeUri = (uri) => uri.replace(/\/\/[^@/]+@/, '//');

// Connects through Mongoose and resolves once the connection is open. Throws a
// readable error on failure; the caller decides whether to exit, which keeps this
// module reusable from tests and scripts.
const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`Connected to MongoDB at ${safeUri(MONGO_URI)}`);
        return mongoose.connection;
    } catch (err) {
        throw new Error(`Could not connect to MongoDB at ${safeUri(MONGO_URI)}: ${err.message}`);
    }
};

module.exports = { connectToDatabase, MONGO_URI, mongoose };
