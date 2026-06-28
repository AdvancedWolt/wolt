const Restaurant = require('../models/restaurants');
const Product = require('../models/products');

const searchByQuery = async (req, res) => {
    const query = req.params.query;

    const restaurants = await Restaurant.searchRestaurants(query);
    const products = await Product.searchProducts(query);

    res.json({ restaurants, products });
}

module.exports = {
    searchByQuery
};