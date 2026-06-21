const crypto = require('crypto');

// Structure: { productId: { id, restaurantId, name, description, price, image } }
const products = {};

const createProduct = (restaurantId, details) => {
    const id = crypto.randomUUID();
    const newProduct = {
        id,
        restaurantId,
        name: details.name,
        description: details.description || '',
        price: details.price ?? 0,
        image: details.image || null
    };
    
    products[id] = newProduct;
    return newProduct;
};

const updateProduct = (restaurantId, productId, updates) => {
    const product = products[productId];
    if (!product || product.restaurantId !== restaurantId) return null;

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.description !== undefined) product.description = updates.description;
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.image !== undefined) product.image = updates.image || null;
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
    return Object.values(products).filter(p => p.restaurantId === restaurantId);
};

const getProductById = (restaurantId, productId) => {
    const product = products[productId];

    if (product && product.restaurantId === restaurantId) {
        return product;
    }
    return null;
};

// Global lookup by id, used to resolve recommended product ids into full products.
const getById = (productId) => products[productId] || null;

// Called from controllers/restaurants.js when a restaurant is deleted.
const deleteProductsByRestaurant = (restaurantId) => {
    for (const key in products) {
        if (products[key].restaurantId === restaurantId) {
            delete products[key];
        }
    }
};

// helper for GET /api/search/:query endpoint
const searchProducts = (query) => {
    const normalized = query.toLowerCase();
    return Object.values(products).filter((product) => (
        product.name.toLowerCase().includes(normalized)
        || product.description.toLowerCase().includes(normalized)
    ));
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getById,
    deleteProductsByRestaurant,
    searchProducts
};
