const express = require('express');
// mergeParams is needed for nested routes
const router = express.Router({ mergeParams: true }); 

const products = require('../controllers/products');
const { attachUserId, requireRestaurantOwner } = require('../middleware/auth');

router.route('/')
    .get(products.getAllProducts)
    .post(requireRestaurantOwner, products.createProduct);

router.route('/:pId')
    // attachUserId runs first so the controller can record a view for logged-in users.
    .get(attachUserId, products.getProductById)
    .patch(requireRestaurantOwner, products.updateProduct)
    .delete(requireRestaurantOwner, products.deleteProduct);

module.exports = router;
