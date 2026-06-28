const { mongoose } = require('../../config/db');

const { userSchema } = require('./user');
const { restaurantSchema } = require('./restaurant');
const { productSchema } = require('./product');
const { orderSchema, ORDER_STATUSES } = require('./order');

// Compile each model once. The `mongoose.models.X ||` guard reuses an already
// registered model instead of throwing OverwriteModelError when these modules are
// imported more than once (e.g. across tests).
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = { User, Restaurant, Product, Order, ORDER_STATUSES };
