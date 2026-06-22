const express = require('express')
const router = express.Router()

const restaurant = require('../controllers/restaurants')
const { requireRestaurantOwner } = require('../middleware/auth');

router.route('/')
    .get(restaurant.getAllRestaurants)
    .post(requireRestaurantOwner, restaurant.createRestaurant)

router.route('/:id')
    .get(restaurant.getRestaurantById)
    .patch(requireRestaurantOwner, restaurant.updateRestaurant)
    .delete(requireRestaurantOwner, restaurant.deleteRestaurant)

module.exports = router
