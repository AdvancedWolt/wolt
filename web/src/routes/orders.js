const express = require('express')
const router = express.Router()

const orders = require('../controllers/orders')
const { requireAuth } = require('../middleware/auth')

router.route('/')
    .get(requireAuth, orders.getOrdersByCurrUser)
    .post(requireAuth, orders.createOrder)

router.route('/:id')
    .get(requireAuth, orders.getOrderById)
    .patch(requireAuth, orders.updateOrder)
    .delete(requireAuth, orders.deleteOrder)

module.exports = router