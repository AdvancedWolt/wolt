// Standalone seeder: connects to MongoDB, fills an empty database with the demo
// restaurants, menus, users and orders, then disconnects and exits. Run with
// `npm run seed`. The server also seeds on boot, but this lets you (re)seed a
// fresh database without starting the API.
const { connectToDatabase, mongoose } = require('./config/db');
const { seedDatabase } = require('./seed');

const run = async () => {
    try {
        await connectToDatabase();
        await seedDatabase();
        console.log('Seeding complete');
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
