const crypto = require('crypto');

// Structure: { productId: { id, restaurantId, name } }
const products = {};

const createProduct = (restaurantId, name) => {
    const id = crypto.randomUUID();
    // Save the restaurantId so we know who it belongs to
    const newProduct = { id, restaurantId, name };
    
    products[id] = newProduct;
    return newProduct;
};

const updateProduct = (restaurantId, productId, name) => {
    const product = products[productId];
    
    // Ensure the product exists AND belongs to the correct restaurant
    if (!product || product.restaurantId !== restaurantId) return null;

    product.name = name;
    return product;
};

const deleteProduct = (restaurantId, productId) => {
    const product = products[productId];
    
    if (product && product.restaurantId === restaurantId) {
        delete products[productId];
        return true;
    }
    return false;
};

const getAllProducts = (restaurantId) => {
    // Filter the global products list for this specific restaurant
    return Object.values(products).filter(p => p.restaurantId === restaurantId);
};

const getProductById = (restaurantId, productId) => {
    const product = products[productId];
    
    if (product && product.restaurantId === restaurantId) {
        return product;
    }
    return null;
};

// --- HELPER FUNCTIONS ---

// Used from controllers/restaurants.js when a restaurant is deleted
const deleteProductsByRestaurant = (restaurantId) => {
    for (const key in products) {
        if (products[key].restaurantId === restaurantId) {
            delete products[key];
        }
    }
};

// helper for GET /api/search/:query endpoint
const searchProducts = (query) => {
    return Object.values(products).filter(p => p.name.includes(query));
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    deleteProductsByRestaurant,
    searchProducts
};