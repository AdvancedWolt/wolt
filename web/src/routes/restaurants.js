const express = require('express')
var router = express.Router()

const restaurant = require('../controllers/restaurants')

router.route('/')
    .get(restaurant.getAllRestaurants)
    .post(restaurant.createRestaurant)

router.route('/:id')
    .get(restaurant.getRestaurantById)
    .patch(restaurant.updateRestaurant)
    .delete(restaurant.deleteRestaurant)

module.exports = router