const express = require('express');
// mergeParams is needed for nested routes
const router = express.Router({ mergeParams: true }); 

const products = require('../controllers/products');
const { attachUserId } = require('../middleware/auth');

router.route('/')
    .get(products.getAllProducts)
    .post(products.createProduct); 

router.route('/:pId')
    // Express calls attachUserId first; the controller then reads req.userId.
    // Keeping this here avoids calling middleware manually inside the controller.
    .get(attachUserId, products.getProductById)
    .patch(products.updateProduct)
    .delete(products.deleteProduct);

module.exports = router;
