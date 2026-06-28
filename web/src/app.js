const express = require('express');
const path = require('path');
const app = express()

// Headroom for base64-encoded image uploads (a 5MB image is ~7MB once encoded).
app.use(express.json({ limit: '10mb' }))

const restaurantRoutes = require('./routes/restaurants');
const productRoutes = require('./routes/products');
const searchRoutes = require('./routes/search');
const usersRoutes = require('./routes/users');
const tokensRoutes = require('./routes/tokens');
const ordersRoutes = require('./routes/orders')
const { errorHandler } = require('./middleware/errorHandler');
const { seedDatabase } = require('./seed');
const { connectToDatabase, mongoose } = require('./config/db');


app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:id/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/orders', ordersRoutes);

// Keep API failures as JSON and never let the SPA hide a missing API route.
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Exercise 4 is built into /public by the web Dockerfile. Express serves the
// assets and returns index.html for client-side React Router routes.
const publicDirectory = path.join(__dirname, '..', 'public');
app.use(express.static(publicDirectory));
app.use((req, res, next) => {
    if (req.method !== 'GET' || !req.accepts('html')) return next();

    return res.sendFile(path.join(publicDirectory, 'index.html'), (error) => {
        if (error) next(error);
    });
});

app.use(errorHandler);

if (require.main === module) {
    const port = process.env.PORT || 3000;

    // Connect to MongoDB before accepting traffic. A missing database is fatal,
    // so fail fast with a readable error rather than serving a broken server.
    const start = async () => {
        try {
            await connectToDatabase();
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err.message);
            process.exit(1);
        }

        const server = app.listen(port, async () => {
            console.log(`Web server listening on port ${port}`);
            try {
                await seedDatabase();
                console.log('Initial restaurants, menus and orders seeded');
            } catch (err) {
                console.error('Seeding failed:', err.message);
            }
        });

        // Close the HTTP server and Mongo connection on shutdown so
        // `docker compose down` (and Ctrl+C) drains cleanly instead of being
        // yanked mid-connection.
        const shutdown = async (signal) => {
            console.log(`${signal} received, shutting down`);
            server.close();
            await mongoose.connection.close();
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    };

    start();
}

module.exports = app;
