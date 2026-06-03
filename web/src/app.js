const express = require('express');
const app = express()

app.use(express.json())

const restaurantRoutes = require('./routes/restaurants');
const productRoutes = require('./routes/products');
const searchRoutes = require('./routes/search');
const usersRoutes = require('./routes/users');


app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:id/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', usersRoutes);

app.listen(process.env.PORT || 3000, () => console.log('web listening'))