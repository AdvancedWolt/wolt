const Product = require('../models/products');
const Restaurant = require('../models/restaurants'); // Used to verify the restaurant exists
const User = require('../models/users');

const rejectNonOwner = (restaurantId, userId, res) => {
    if (!Restaurant.isOwnedBy(restaurantId, userId)) {
        res.status(403).json({ error: 'You can only manage products in your own restaurants' });
        return true;
    }
    return false;
};

const validateProductFields = ({ name, description, price, image }, partial = false) => {
    if (!partial || name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) return 'Name is required';
    }
    if (description !== undefined && typeof description !== 'string') {
        return 'Description must be a string';
    }
    if (price !== undefined && (typeof price !== 'number' || !Number.isFinite(price) || price < 0)) {
        return 'Price must be a non-negative number';
    }
    if (image !== undefined && image !== null && typeof image !== 'string') {
        return 'Image must be a string or null';
    }
    return null;
};

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
    const { name, description, price, image } = req.body;

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (rejectNonOwner(restaurantId, req.userId, res)) return;

    const validationError = validateProductFields({ name, description, price, image });
    if (validationError) return res.status(400).json({ error: validationError });

    const newProduct = Product.createProduct(restaurantId, {
        name: name.trim(),
        description: description?.trim() || '',
        price: price ?? 0,
        image: image || null
    });

    // 201 Created. Location header tells the client where to find the new resource.
    res.status(201).location(`/api/restaurants/${restaurantId}/products/${newProduct.id}`).end();
};

const getProductById = async (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const product = Product.getProductById(restaurantId, productId);
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // req.userId comes from the user-id HTTP header, not from the URL.
    if (req.userId) {
        try {
            await User.addView(req.userId, product.id);
        } catch (_) {
            return res.status(502).json({ error: 'Recommendation service unavailable' });
        }
    }

    res.status(200).json(product);
};

const updateProduct = (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;
    const { name, description, price, image } = req.body;

    if (!Restaurant.getRestaurantById(restaurantId)) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (rejectNonOwner(restaurantId, req.userId, res)) return;

    if (name === undefined && description === undefined && price === undefined && image === undefined) {
        return res.status(400).json({ error: 'At least one product field is required' });
    }
    const validationError = validateProductFields({ name, description, price, image }, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const updatedProduct = Product.updateProduct(restaurantId, productId, {
        name: typeof name === 'string' ? name.trim() : undefined,
        description: typeof description === 'string' ? description.trim() : undefined,
        price,
        image: typeof image === 'string' ? image : image === null ? null : undefined
    });

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
    if (rejectNonOwner(restaurantId, req.userId, res)) return;

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
