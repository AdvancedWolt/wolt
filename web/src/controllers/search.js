const Restaurant = require('../models/restaurants');
const Product = require('../models/products');

const searchByQuery = (req, res) => {
    const query = req.params.query;

    const restaurants = Restaurant.searchRestaurants(query);
    const products = Product.searchProducts(query);

    res.json({ restaurants, products });
}

module.exports = {
    searchByQuery
};