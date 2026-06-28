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
        // Cap server selection so a bad URI fails in seconds instead of hanging
        // for the ~30s default before the boot sequence can react.
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log(`Connected to MongoDB at ${safeUri(MONGO_URI)}`);

        // Surface a mid-run connection drop instead of failing silently.
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err.message}`);
        });
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

        return mongoose.connection;
    } catch (err) {
        throw new Error(`Could not connect to MongoDB at ${safeUri(MONGO_URI)}: ${err.message}`);
    }
};

module.exports = { connectToDatabase, MONGO_URI, mongoose };
