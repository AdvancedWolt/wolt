const Product = require('../models/products');
const Restaurant = require('../models/restaurants');
const User = require('../models/users');
const { rejectNonOwner } = require('./shared');

const PRODUCT_OWNER_ERROR = 'You can only manage products in your own restaurants';

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

const getAllProducts = async (req, res) => {
    const restaurantId = req.params.id;

    if (!(await Restaurant.getRestaurantById(restaurantId))) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json(await Product.getAllProducts(restaurantId));
};

const createProduct = async (req, res) => {
    const restaurantId = req.params.id;
    const { name, description, price, image } = req.body;

    if (!(await Restaurant.getRestaurantById(restaurantId))) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (await rejectNonOwner(restaurantId, req.userId, res, PRODUCT_OWNER_ERROR)) return;

    const validationError = validateProductFields({ name, description, price, image });
    if (validationError) return res.status(400).json({ error: validationError });

    const newProduct = await Product.createProduct(restaurantId, {
        name: name.trim(),
        description: description?.trim() || '',
        price: price ?? 0,
        image: image || null
    });

    res.status(201).location(`/api/restaurants/${restaurantId}/products/${newProduct.id}`).end();
};

const getProductById = async (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;

    if (!(await Restaurant.getRestaurantById(restaurantId))) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const product = await Product.getProductById(restaurantId, productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Recording a view is best-effort; a recommender outage must not fail the read.
    if (req.userId) {
        try {
            await User.addView(req.userId, product.id);
        } catch (err) {
            console.error('Failed to record product view:', err.message);
        }
    }

    res.status(200).json(product);
};

const updateProduct = async (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;
    const { name, description, price, image } = req.body;

    if (!(await Restaurant.getRestaurantById(restaurantId))) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (await rejectNonOwner(restaurantId, req.userId, res, PRODUCT_OWNER_ERROR)) return;

    if (name === undefined && description === undefined && price === undefined && image === undefined) {
        return res.status(400).json({ error: 'At least one product field is required' });
    }
    const validationError = validateProductFields({ name, description, price, image }, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const updatedProduct = await Product.updateProduct(restaurantId, productId, {
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

const deleteProduct = async (req, res) => {
    const { id: restaurantId, pId: productId } = req.params;

    if (!(await Restaurant.getRestaurantById(restaurantId))) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (await rejectNonOwner(restaurantId, req.userId, res, PRODUCT_OWNER_ERROR)) return;

    const isDeleted = await Product.deleteProduct(restaurantId, productId);

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
