const Product = require('../models/products');
const Restaurant = require('../models/restaurants'); // Used to verify the restaurant exists

const getAllProducts = (req, res) => {
    const restaurantId = req.params.id;

    // Check if the restaurant exists
    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get data and return
    const products = Product.getAllProducts(restaurantId);

    res.status(200).json(products);
};

const createProduct = (req, res) => {
    const restaurantId = req.params.id;
    const { name } = req.body;

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!name) { 
        return res.status(400).json({ error: 'Name is required' });
    }

    const newProduct = Product.createProduct(restaurantId, name);

    // 201 Created. Location header tells the client where to find the new resource.
    res.status(201).location(`/api/restaurants/${restaurantId}/products/${newProduct.id}`).end();
};

const getProductById = (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const product = Product.getProductById(restaurantId, productId);
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
};

const updateProduct = (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;
    const { name } = req.body;

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const updatedProduct = Product.updateProduct(restaurantId, productId, name);

    if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).end(); 
};

const deleteProduct = (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const isDeleted = Product.deleteProduct(restaurantId, productId);

    if (!isDeleted) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).end();
};

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};