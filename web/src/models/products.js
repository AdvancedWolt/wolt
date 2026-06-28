const { Product } = require('./schemas');

// Maps a Mongoose product document to the EX4 API shape. The schema stores
// `_id` and a `restaurant` ref; the API has always exposed `id` and
// `restaurantId`, so the clients (and tests) stay unchanged.
const formatProduct = (product) => {
    if (!product) return null;
    return {
        id: product._id,
        restaurantId: product.restaurant,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image
    };
};

// Escapes regex metacharacters so a search query is matched literally.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createProduct = async (restaurantId, details) => {
    const created = await Product.create({
        restaurant: restaurantId,
        name: details.name,
        description: details.description || '',
        price: details.price ?? 0,
        image: details.image || null
    });

    return formatProduct(created);
};

const updateProduct = async (restaurantId, productId, updates) => {
    const product = await Product.findOne({ _id: productId, restaurant: restaurantId });
    if (!product) return null;

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.description !== undefined) product.description = updates.description;
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.image !== undefined) product.image = updates.image || null;
    await product.save();
    return formatProduct(product);
};

const deleteProduct = async (restaurantId, productId) => {
    const deleted = await Product.findOneAndDelete({ _id: productId, restaurant: restaurantId });
    return deleted !== null;
};

const getAllProducts = async (restaurantId) => {
    const products = await Product.find({ restaurant: restaurantId }).lean();
    return products.map(formatProduct);
};

const getProductById = async (restaurantId, productId) => {
    const product = await Product.findOne({ _id: productId, restaurant: restaurantId }).lean();
    return formatProduct(product);
};

// Global lookup by id, used to resolve recommended product ids into full products.
const getById = async (productId) => formatProduct(await Product.findById(productId).lean());

// Called from controllers/restaurants.js when a restaurant is deleted.
const deleteProductsByRestaurant = async (restaurantId) => {
    await Product.deleteMany({ restaurant: restaurantId });
};

// helper for GET /api/search/:query endpoint
const searchProducts = async (query) => {
    const pattern = escapeRegex(query);
    const products = await Product.find({
        $or: [
            { name: { $regex: pattern, $options: 'i' } },
            { description: { $regex: pattern, $options: 'i' } }
        ]
    }).lean();
    return products.map(formatProduct);
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
