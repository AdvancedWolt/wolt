const Products = require('../models/Products')

exports.createProduct = (req, res) => {
    res.json(Product.createProduct)
}


exports.getAllProducts = (req, res) => {
    res.json(Product.getAllProducts)
}


exports.getProductById = (req, res) => {
    const product = Product.getProductById(req.params.id)
    if(!product) {
        return res.status(404).json( { error: 'Product not found'})
    }

    res.json(product)
}

exports.updateProduct = (req, res) => {
    
    res.json(Product.updateProduct)
}

exports.deleteProduct = (req, res) => {
    res.json(Product.deleteProduct)
}