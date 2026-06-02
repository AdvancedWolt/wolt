const express = require('express');
// mergeParams is needed for nested routes
const router = express.Router({ mergeParams: true }); 

const products = require('../controllers/products');

router.route('/')
    .get(products.getAllProducts)
    .post(products.createProduct); 

router.route('/:pId')
    .get(products.getProductById)
    .patch(products.updateProduct)
    .delete(products.deleteProduct);

module.exports = router;