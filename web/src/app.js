const express = require('express');
const app = express()

app.use(express.json())

const restaurantRoutes = require('./routes/restaurants');
const productRoutes = require('./routes/products');
const searchRoutes = require('./routes/search');
const usersRoutes = require('./routes/users');
const tokensRoutes = require('./routes/tokens');
const { errorHandler } = require('./middleware/errorHandler');


app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:id/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tokens', tokensRoutes);
app.use(errorHandler);

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Web server listening on port ${port}`);
    });
}

module.exports = app;
